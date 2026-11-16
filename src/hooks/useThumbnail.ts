import { useCallback, useRef } from 'react';
import html2canvas from 'html2canvas';
import { log } from '@/lib/log';

const THUMBNAIL_WIDTH = 240;
const THUMBNAIL_HEIGHT = 160;
const TIMEOUT_MS = 5000;

export function useThumbnail() {
  const queueRef = useRef<Promise<void>>(Promise.resolve());

  const generateThumbnail = useCallback((htmlContent: string): Promise<string | undefined> => {
    const task = new Promise<string | undefined>((resolve) => {
      queueRef.current = queueRef.current.then(async () => {
        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:1280px;height:800px;border:none;';
        document.body.appendChild(iframe);

        const render = async (): Promise<string | undefined> => {
          const doc = iframe.contentDocument;
          if (!doc) return undefined;
          doc.open();
          doc.write(htmlContent);
          doc.close();

          await new Promise((r) => setTimeout(r, 500));

          try {
            const canvas = await html2canvas(doc.body, {
              width: 1280,
              height: 800,
              scale: THUMBNAIL_WIDTH / 1280,
              useCORS: true,
              logging: false,
            });

            const thumbCanvas = document.createElement('canvas');
            thumbCanvas.width = THUMBNAIL_WIDTH;
            thumbCanvas.height = THUMBNAIL_HEIGHT;
            const ctx = thumbCanvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(canvas, 0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
            }
            return thumbCanvas.toDataURL('image/jpeg', 0.6);
          } catch (err) {
            // Non-fatal: the screen still uploads, just without a thumbnail.
            log.warn('thumbnail_failed', { error: err });
            return undefined;
          }
        };

        try {
          const result = await Promise.race([
            render(),
            new Promise<undefined>((res) => setTimeout(() => res(undefined), TIMEOUT_MS)),
          ]);
          resolve(result);
        } finally {
          document.body.removeChild(iframe);
        }
      });
    });

    return task;
  }, []);

  return { generateThumbnail };
}
