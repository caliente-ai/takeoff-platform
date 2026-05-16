import { TopBar } from '@/components/TopBar';
import { UploadZone } from '@/components/UploadZone';

export default function UploadPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <TopBar />
      <main
        className="flex flex-1 items-center justify-center px-6 py-12"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgb(228 228 231) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      >
        <div className="w-full max-w-2xl space-y-4">
          <div className="text-center">
            <p className="text-xs font-medium tracking-wide text-blue-600 uppercase">
              Instant AI detection
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-zinc-900">
              Upload a construction drawing
            </h1>
          </div>
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
