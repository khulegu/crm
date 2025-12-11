import { Logo } from "@/components/logo";
import { UserProfileButton } from "@/components/user-profile-button";
import { TRPCProvider } from "@/trpc/client";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TRPCProvider>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <Link href="/dashboard">
                  <Logo />
                </Link>
              </div>
              <UserProfileButton />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </TRPCProvider>
  );
}
