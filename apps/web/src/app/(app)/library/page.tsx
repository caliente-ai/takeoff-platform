import { AppHeader } from '@/components/AppHeader';

export default function LibraryPage() {
  return (
    <>
      <AppHeader title="Library" searchPlaceholder="Search templates..." />
      <div className="flex-1 overflow-auto p-6">
        <div className="rounded-lg border border-dashed border-zinc-300 bg-white/50 py-24 text-center">
          <p className="text-sm text-zinc-500">
            Saved drawing templates will appear here.
          </p>
        </div>
      </div>
    </>
  );
}
