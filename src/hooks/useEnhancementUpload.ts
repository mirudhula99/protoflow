import { useCallback } from 'react';
import { nanoid } from 'nanoid';
import { toast } from 'sonner';
import { useProjectStore } from './useProjectStore';
import { useThumbnail } from './useThumbnail';
import { inferScreenType } from '@/lib/constants';
import { parseEnhancedHtml, hasEnhancedMarkers } from '@/lib/enhancement-parser';
import { detectAppShell, extractScreenContent } from '@/lib/enhancement-export';
import type { Screen, EnhancementScreen } from '@/types/project';
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

/**
 * Derives a safe div ID from a file name.
 * e.g. "Dashboard Overview.html" → "dashboard-overview"
 */
function deriveDivId(fileName: string): string {
  return fileName
    .replace(/\.html?$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function useEnhancementUpload() {
  const addScreen = useProjectStore((s) => s.addScreen);
  const addEnhancementScreen = useProjectStore((s) => s.addEnhancementScreen);
  const enhancementScreenCount = useProjectStore(
    (s) => s.project.enhancementScreens?.length ?? 0
  );
  const { generateThumbnail } = useThumbnail();

  const uploadEnhancementFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files).filter(
        (f) => f.name.endsWith('.html') || f.name.endsWith('.htm')
      );

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
        log.warn('upload_duplicates_skipped', { mode: 'enhancement', count: duplicates.length, duplicates });
        toast.info(`Skipped ${duplicates.length} file${duplicates.length !== 1 ? 's' : ''} already in the project.`);
      }

      let order = enhancementScreenCount;
      let added = 0;
      const failed: string[] = [];

      for (const file of uniqueFiles) {
        try {
        const rawHtml = await file.text();
        const title = extractTitle(rawHtml) || file.name.replace(/\.html?$/, '');

        // Strip app shell at upload time — store content-only HTML
        const shellResult = detectAppShell(rawHtml);
        let htmlContent = rawHtml;
        if (shellResult.hasShell) {
          const { styles, content, scripts } = extractScreenContent(rawHtml);
          // Rebuild as a clean content-only HTML document (preserves styles, content, and scripts)
          htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
${styles}
</head>
<body>
${content}
${scripts}
</body>
</html>`;
        }

        const fileHash = await computeHash(htmlContent);

        // Parse for data-enhanced markers
        const hasMarkers = hasEnhancedMarkers(htmlContent);
        const parsed = hasMarkers ? parseEnhancedHtml(htmlContent) : null;

        // Generate thumbnail from enhanced view (with glows) if markers exist,
        // otherwise from the stripped HTML
        const thumbnailHtml = parsed?.enhancedHtml ?? htmlContent;
        const thumbnailDataUrl = await generateThumbnail(thumbnailHtml);

        // Create the underlying Screen object (stores the shell-stripped HTML)
        const screenId = nanoid();
        const screen: Screen = {
          id: screenId,
          name: title,
          fileName: file.name,
          htmlContent,
          thumbnailDataUrl,
          type: inferScreenType(file.name),
          position: {
            x: (order % 3) * 350 + 50,
            y: Math.floor(order / 3) * 280 + 50,
          },
          metadata: {
            uploadedAt: new Date().toISOString(),
            fileHash,
            tags: hasMarkers ? ['enhanced'] : [],
          },
        };

        addScreen(screen);

        // Create the EnhancementScreen wrapper
        const enhScreen: EnhancementScreen = {
          id: nanoid(),
          name: title,
          divId: deriveDivId(file.name),
          order: order + 1,
          screenId,
          enhancedSelectors: parsed?.enhancedSelectors ?? [],
          currentOnlySelectors: parsed?.currentOnlySelectors ?? [],
          ...(shellResult.hasShell && { shellDetected: shellResult.shellType as 'id-based' | 'class-based' }),
        };

        addEnhancementScreen(enhScreen);
        order++;
        added++;
        } catch (err) {
          // One bad file shouldn't abort the whole batch — record and continue.
          failed.push(file.name);
          log.error('upload_file_failed', { mode: 'enhancement', fileName: file.name, error: err });
        }
      }

      if (added > 0) toast.success(`Added ${added} screen${added !== 1 ? 's' : ''}.`);
      if (failed.length > 0) {
        toast.error(`Could not process ${failed.length} file${failed.length !== 1 ? 's' : ''}: ${failed.join(', ')}`);
      }
    },
    [addScreen, addEnhancementScreen, enhancementScreenCount, generateThumbnail]
  );

  return { uploadEnhancementFiles };
}
