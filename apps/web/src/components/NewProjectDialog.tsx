'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, MapPin, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useStore } from '@/lib/store';

const TYPES = ['Healthcare', 'Commercial', 'Residential', 'Industrial', 'Civil'] as const;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function NewProjectDialog({ open, onOpenChange }: Props) {
  const router = useRouter();
  const setJob = useStore((s) => s.setJob);
  const reset = useStore((s) => s.reset);

  const [name, setName] = useState('Memorial Hospital — MEP Phase 2');
  const [address, setAddress] = useState('');
  const [type, setType] = useState<(typeof TYPES)[number]>('Healthcare');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = (): void => setIsDragging(false);
  const onDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const onSubmit = (): void => {
    if (!name.trim()) {
      toast.error('Project name is required');
      return;
    }
    reset();
    setJob({
      id: 'demo-job-1',
      filename: file?.name ?? 'Memorial_Hospital_MEP.pdf',
      status: 'processing',
      created_at: new Date().toISOString(),
    });
    onOpenChange(false);
    router.push('/projects/demo-job-1?demo=mep_hero');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Upload a construction drawing. AI detection starts immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium tracking-wider text-zinc-500 uppercase">
              Project Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Memorial Hospital — MEP Phase 2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium tracking-wider text-zinc-500 uppercase">
                Address
              </label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-zinc-400" />
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter site address"
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium tracking-wider text-zinc-500 uppercase">
                Project Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as (typeof TYPES)[number])}
                className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none"
              >
                {TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium tracking-wider text-zinc-500 uppercase">
              Source Files
            </label>
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-6 text-center transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-zinc-300 bg-zinc-50/50 hover:border-zinc-400'
              }`}
            >
              {file ? (
                <FileText className="size-6 text-emerald-600" />
              ) : (
                <Upload className="size-6 text-zinc-400" />
              )}
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-zinc-900">
                  {file?.name ?? 'Drop a construction drawing'}
                </p>
                <p className="text-xs text-zinc-500">
                  or click to browse from your computer
                </p>
              </div>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-xs text-blue-700 underline-offset-4 hover:underline"
              >
                Browse files
              </button>
              <p className="text-[10px] text-zinc-400">
                Supported formats: PDF, PNG, JPG (Max 100MB)
              </p>
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                className="hidden"
                onChange={onFileChange}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>
            Create project & Start AI Detection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
