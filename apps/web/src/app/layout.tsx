import type { Metadata } from 'next';
import { Inter, Inter_Tight, JetBrains_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { DemoHotkeys } from '@/components/DemoHotkeys';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Caliente AI',
  description: 'Agentic precision for construction estimators.',
};

const clerkAppearance = {
  variables: {
    colorPrimary: '#ff5c35',
    colorBackground: '#14161c',
    // Clerk v7 renamed these appearance variables; the old names
    // (colorText, colorTextSecondary, …) are silently ignored.
    colorForeground: '#f5f3ef',
    colorMutedForeground: '#9498a6',
    colorPrimaryForeground: '#0b0c10',
    colorInput: '#1c1f28',
    colorInputForeground: '#f5f3ef',
    colorNeutral: '#f5f3ef',
    borderRadius: '0.75rem',
    fontFamily: 'var(--font-sans)',
  },
  elements: {
    card: 'bg-carbon border border-hairline shadow-2xl shadow-black/40',
    headerTitle: 'font-display',
    socialButtonsBlockButton: 'border-hairline hover:border-hairline-bright',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html
        lang="en"
        className={`dark ${inter.variable} ${interTight.variable} ${jetbrainsMono.variable}`}
      >
        <body className="font-sans antialiased">
          <DemoHotkeys />
          {children}
          <Toaster position="bottom-right" theme="dark" />
        </body>
      </html>
    </ClerkProvider>
  );
}
