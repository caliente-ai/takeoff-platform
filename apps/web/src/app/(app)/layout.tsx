import { AppSidebar } from '@/components/AppSidebar';

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-ink">
      {/* Cinematic backdrop — blueprint grid + warm/cool glows */}
      <div className="pointer-events-none absolute inset-0 bp-grid" />
      <div className="pointer-events-none absolute -top-48 left-[18%] h-[520px] w-[520px] glow-ember" />
      <div className="pointer-events-none absolute -top-40 right-[14%] h-[560px] w-[560px] glow-blueprint" />

      <AppSidebar />
      <main className="relative z-10 ml-[280px] flex h-screen flex-1 flex-col overflow-hidden">
        {children}
      </main>

      {/* Filmic grain over everything */}
      <div className="pointer-events-none fixed inset-0 z-[60] film-grain" />
    </div>
  );
}
