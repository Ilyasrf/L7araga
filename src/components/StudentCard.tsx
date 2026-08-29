"use client";

import Image from "next/image";
import type { AchievementHolderType } from "@/types";

interface StudentCardProps {
  holder: AchievementHolderType;
}

export default function StudentCard({ holder }: StudentCardProps) {
  return (
    <div className="glass-card flex items-center gap-4">
      {holder.imageUrl ? (
        <Image
          src={holder.imageUrl}
          alt={holder.login}
          width={48}
          height={48}
          className="rounded-full border-2 border-white/10"
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-lg font-bold text-white/60">
          {(holder.displayName || holder.login)[0].toUpperCase()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white truncate">
          {holder.displayName || holder.login}
        </h3>
        <p className="text-sm text-neon-cyan truncate">@{holder.login}</p>
      </div>
    </div>
  );
}
