import { TopBar } from '@/components/TopBar';
import { UploadZone } from '@/components/UploadZone';

export default function UploadPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <TopBar />
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl space-y-4">
          <UploadZone />
          <p className="text-center text-sm text-zinc-500">
            Supports multi-page PDF construction drawings. AI detection runs
            automatically after upload.
          </p>
        </div>
      </main>
    </div>
  );
}
