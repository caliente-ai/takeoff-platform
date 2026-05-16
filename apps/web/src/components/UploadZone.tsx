'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';

export function UploadZone() {
  const router = useRouter();
  const setJob = useStore((s) => s.setJob);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);

  const accept = (file: File): void => {
    setPicked(file.name);
    setJob({
      id: 'demo-job-1',
      filename: file.name,
      status: 'processing',
      created_at: new Date().toISOString(),
    });
    router.push('/projects/demo-job-1');
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = (): void => setIsDragging(false);
  const onDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) accept(file);
  };
  const onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) accept(file);
  };

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-12 text-center transition-all duration-150 ${
        isDragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-zinc-300 bg-white hover:border-zinc-400 hover:shadow-lg'
      }`}
    >
      {picked ? (
        <CheckCircle2 className="size-12 text-emerald-500 transition-all" />
      ) : (
        <Upload
          className={`size-12 transition-all ${isDragging ? 'text-blue-500' : 'text-zinc-400'}`}
        />
      )}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-zinc-900">
          {picked ?? 'Drop a construction drawing'}
        </h2>
        <p className="text-sm text-zinc-500">PDF, PNG, or JPG up to 200 MB</p>
      </div>
      <Button
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={!!picked}
      >
        Browse files
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
        className="hidden"
        onChange={onChange}
      />
    </div>
  );
}
