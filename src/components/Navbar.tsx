"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass rounded-none border-x-0 border-t-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold neon-text">1337</span>
            <span className="text-sm text-white/60">Transfer Tracker</span>
          </div>

          {session?.user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {session.user.image && (
                  <Image
                    src={session.user.image}
                    alt="avatar"
                    width={32}
                    height={32}
                    className="rounded-full border border-white/20"
                  />
                )}
                <span className="text-sm text-white/80">
                  {((session.user as { login?: string }).login) || session.user.name}
                </span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm text-white/40 hover:text-white/80 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
