"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
export function UserProfileButton() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  return <div className="flex items-center gap-4">
    <div className="text-sm text-zinc-600 dark:text-zinc-400">
      {session?.user?.email}
    </div>
    <button
      onClick={handleSignOut}
      className="rounded-md bg-zinc-900 dark:bg-zinc-50 px-4 py-2 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
    >
      Sign out
    </button>
  </div>
}