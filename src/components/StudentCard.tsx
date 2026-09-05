"use client";

import Image from "next/image";
import type { AchievementHolderType } from "@/types";

interface StudentCardProps {
  holder: AchievementHolderType;
}

export default function StudentCard({ holder }: StudentCardProps) {
  return (
    <div className="bg-white border border-zinc-200 shadow-sm rounded-lg p-4 flex items-center gap-4 transition-shadow hover:shadow-md">
      {holder.imageUrl ? (
        <Image
          src={holder.imageUrl}
          alt={holder.login}
          width={48}
          height={48}
          className="rounded-full border border-zinc-100 object-cover"
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-lg font-medium text-zinc-600">
          {(holder.displayName || holder.login)[0].toUpperCase()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-zinc-900 truncate">
          {holder.displayName || holder.login}
        </h3>
        <p className="text-sm text-zinc-500 truncate">@{holder.login}</p>
      </div>
      <div className="text-xs font-medium px-2.5 py-1 bg-zinc-100 text-zinc-600 rounded-full whitespace-nowrap">
        {holder.campusName}
      </div>
    </div>
  );
}
