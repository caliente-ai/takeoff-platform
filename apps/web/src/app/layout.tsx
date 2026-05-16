import type { Metadata } from 'next';
import { DemoHotkeys } from '@/components/DemoHotkeys';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'TakeoffAI — AI Construction Takeoff',
  description: 'AI-powered construction takeoff for estimators.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <DemoHotkeys />
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
