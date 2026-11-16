import { useCallback } from 'react';
import { nanoid } from 'nanoid';
import { toast } from 'sonner';
import { useProjectStore } from './useProjectStore';
import { useThumbnail } from './useThumbnail';
import { inferScreenType } from '@/lib/constants';
import type { Screen } from '@/types/project';
import { log } from '@/lib/log';

function extractTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>(.*?)<\/title>/i);
  return match ? match[1].trim() : null;
}

async function computeHash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

export function useUpload() {
  const addScreen = useProjectStore((s) => s.addScreen);
  const screenCount = useProjectStore((s) => s.project.screens.length);
  const { generateThumbnail } = useThumbnail();

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files).filter((f) => f.name.endsWith('.html') || f.name.endsWith('.htm'));
      const currentScreens = useProjectStore.getState().project.screens;
      const existingNames = new Set(currentScreens.map((s) => s.fileName.toLowerCase()));
      const duplicates: string[] = [];
      const uniqueFiles = fileArray.filter((f) => {
        const key = f.name.toLowerCase();
        if (existingNames.has(key)) { duplicates.push(f.name); return false; }
        existingNames.add(key);
        return true;
      });
      if (duplicates.length > 0) {
        log.warn('upload_duplicates_skipped', { count: duplicates.length, duplicates });
        toast.info(`Skipped ${duplicates.length} file${duplicates.length !== 1 ? 's' : ''} already in the project.`);
      }

      let offset = screenCount;
      let added = 0;
      const failed: string[] = [];
      for (const file of uniqueFiles) {
        try {
          const htmlContent = await file.text();
          const title = extractTitle(htmlContent) || file.name.replace(/\.html?$/, '');
          const screenType = inferScreenType(file.name);
          const thumbnailDataUrl = await generateThumbnail(htmlContent);
          const fileHash = await computeHash(htmlContent);

          const screen: Screen = {
            id: nanoid(),
            name: title,
            fileName: file.name,
            htmlContent,
            thumbnailDataUrl,
            type: screenType,
            position: {
              x: (offset % 4) * 300 + 50,
              y: Math.floor(offset / 4) * 250 + 50,
            },
            metadata: {
              uploadedAt: new Date().toISOString(),
              fileHash,
              tags: [],
            },
          };

          addScreen(screen);
          offset++;
          added++;
        } catch (err) {
          // One bad file shouldn't abort the whole batch — record and continue.
          failed.push(file.name);
          log.error('upload_file_failed', { fileName: file.name, error: err });
        }
      }

      if (added > 0) toast.success(`Added ${added} screen${added !== 1 ? 's' : ''}.`);
      if (failed.length > 0) {
        toast.error(`Could not read ${failed.length} file${failed.length !== 1 ? 's' : ''}: ${failed.join(', ')}`);
      }
    },
    [addScreen, screenCount, generateThumbnail]
  );

  return { uploadFiles };
}
