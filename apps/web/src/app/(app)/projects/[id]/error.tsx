'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type Props = { error: Error; reset: () => void };

export default function ProjectError({ error, reset }: Props) {
  const router = useRouter();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
      <Card className="max-w-md space-y-4 p-8 text-center">
        <h1 className="text-lg font-semibold text-zinc-900">
          Something went wrong
        </h1>
        <p className="text-sm text-zinc-500">
          The viewer crashed. Click to restart, or return to the upload page.
        </p>
        <div className="flex justify-center gap-2">
          <Button variant="outline" onClick={() => router.push('/')}>
            Back to upload
          </Button>
          <Button onClick={reset}>Restart</Button>
        </div>
      </Card>
    </div>
  );
}
