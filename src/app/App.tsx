import { useEffect, useState } from 'react';
import { usePersistence } from '@/hooks/usePersistence';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useAppStore } from '@/hooks/useAppStore';
import { AppLayout } from './layout';
import { ProjectListingPage } from '@/components/listing/ProjectListingPage';
import { Toaster } from '@/components/ui/sonner';

export default function App() {
  const currentView = useAppStore((s) => s.currentView);
  const initialized = useAppStore((s) => s.initialized);
  const [initStarted, setInitStarted] = useState(false);

  useEffect(() => {
    if (initStarted) return;
    setInitStarted(true);
    useAppStore.getState().init();
  }, [initStarted]);

  let content;
  if (!initialized) {
    content = (
      <div className="h-screen flex items-center justify-center bg-background text-foreground">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  } else if (currentView === 'listing') {
    content = <ProjectListingPage />;
  } else {
    content = <EditorView />;
  }

  return (
    <>
      {content}
      {/* User-facing failure/success signals (client analogue of alerting) */}
      <Toaster richColors position="bottom-right" closeButton />
    </>
  );
}

function EditorView() {
  usePersistence();
  useKeyboardShortcuts();
  return <AppLayout />;
}
