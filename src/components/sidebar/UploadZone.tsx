import { useCallback, useRef, useState } from 'react';
import { useUpload } from '@/hooks/useUpload';
import { Button } from '@/components/ui/button';

export function UploadZone() {
  const { uploadFiles } = useUpload();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        uploadFiles(e.dataTransfer.files);
      }
    },
    [uploadFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        uploadFiles(e.target.files);
        e.target.value = '';
      }
    },
    [uploadFiles]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
        isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
      }`}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".html,.htm"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
      <p className="text-sm text-muted-foreground mb-2">
        Drop HTML files here
      </p>
      <Button variant="outline" size="sm" type="button">
        Browse Files
      </Button>
    </div>
  );
}
