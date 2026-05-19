import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <main className="grid min-h-screen w-screen place-items-center bg-zinc-50 px-4">
      <SignIn />
    </main>
  );
}
