import { SignIn } from '@clerk/nextjs';
import { Flame } from 'lucide-react';

export default function SignInPage() {
  return (
    <main className="relative grid min-h-screen w-screen place-items-center overflow-hidden bg-ink px-4">
      {/* Cinematic backdrop */}
      <div className="pointer-events-none absolute inset-0 bp-grid" />
      <div className="pointer-events-none absolute top-1/4 left-1/2 h-[500px] w-[500px] -translate-x-1/2 glow-ember" />
      <div className="pointer-events-none absolute bottom-1/4 left-1/3 h-[420px] w-[420px] glow-blueprint" />

      <div className="rise-in relative flex flex-col items-center gap-7">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-lg bg-ember shadow-[0_4px_18px_-4px_rgba(255,92,53,0.55)]">
            <Flame className="size-5 text-ink" />
          </span>
          <span className="font-display text-2xl font-semibold tracking-tight text-bone">
            Caliente AI
          </span>
        </div>
        <SignIn />
      </div>

      <div className="pointer-events-none fixed inset-0 film-grain" />
    </main>
  );
}
