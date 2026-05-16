import { AppSidebar } from '@/components/AppSidebar';

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-50">
      <AppSidebar />
      <main className="ml-60 flex h-screen flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
