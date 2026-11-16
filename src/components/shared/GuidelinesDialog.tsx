import { useState } from 'react';
import { toast } from 'sonner';
import { Sparkles, Copy, Check } from 'lucide-react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ENHANCEMENT_GUIDELINES_PROMPT } from '@/lib/enhancement-guidelines';

/**
 * A subtle trigger + dialog that hands the user the prompt for generating
 * correctly-marked, content-only HTML screens with an AI assistant.
 *
 * Enhancement Mode's Current/Enhanced toggle is driven entirely by the invisible
 * data-enhanced / data-current-only markers — so plain HTML without them won't
 * toggle. This dialog makes the intended workflow explicit.
 */
export function GuidelinesDialog() {
  const [copied, setCopied] = useState(false);

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(ENHANCEMENT_GUIDELINES_PROMPT);
      setCopied(true);
      toast.success('Prompt copied — paste it into Claude');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy. Select the text and copy manually.');
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
        <Sparkles className="h-3 w-3" />
        How to prepare screens
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Prepare screens for Enhancement Mode</DialogTitle>
          <DialogDescription>
            The Current / Enhanced toggle is driven by invisible markers
            (<code className="text-foreground">data-enhanced</code> and{' '}
            <code className="text-foreground">data-current-only</code>) in your HTML.
            Plain HTML without those markers won&apos;t toggle. The reliable way to get
            correctly-marked, content-only HTML is to generate it with Claude using the
            prompt below, then upload the files here.
          </DialogDescription>
        </DialogHeader>

        <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal pl-5">
          <li>Copy the prompt below and paste it into Claude (Claude Code or claude.ai).</li>
          <li>Describe each screen&apos;s current state and what the enhancement changes.</li>
          <li>Claude returns one content-only HTML file per screen, with the markers added.</li>
          <li>Save the files and upload them here — markers are detected automatically.</li>
        </ol>

        <div className="relative rounded-md border border-border bg-muted/40">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={copyPrompt}
            className="absolute right-2 top-2 z-10 h-7 gap-1 text-xs"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Copied' : 'Copy prompt'}
          </Button>
          <ScrollArea className="h-[300px]">
            <pre className="whitespace-pre-wrap break-words p-3 pr-24 text-[11px] leading-relaxed font-mono text-foreground">
              {ENHANCEMENT_GUIDELINES_PROMPT}
            </pre>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
