'use client';

type Props = { tileSource: string };

export default function Viewer({ tileSource: _tileSource }: Props) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-sm text-zinc-500">
      Viewer
    </div>
  );
}
