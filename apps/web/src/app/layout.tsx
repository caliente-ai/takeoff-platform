import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { DemoHotkeys } from '@/components/DemoHotkeys';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CalienteAI — AI Construction Takeoff',
  description: 'AI-powered construction takeoff for estimators.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={nunito.variable}>
        <body className="font-sans antialiased">
          <DemoHotkeys />
          {children}
          <Toaster position="bottom-right" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
