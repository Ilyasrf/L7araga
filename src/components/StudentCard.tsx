"use client";

import { useState } from "react";
import Image from "next/image";
import type { AchievementHolderType } from "@/types";
import { getCampusFlag } from "@/lib/campus";
import StudentProfileModal from "./StudentProfileModal";

interface StudentCardProps {
  holder: AchievementHolderType;
}

export default function StudentCard({ holder }: StudentCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use the destination campus name if available, otherwise fallback to the origin campus
  const displayCampusName = holder.destinationCampusName || holder.campusName;
  const flag = getCampusFlag(displayCampusName);

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className="bg-white border border-zinc-200 shadow-sm rounded-lg p-4 flex items-center gap-4 transition-all hover:shadow-md hover:border-indigo-200 cursor-pointer group"
      >
        {holder.imageUrl ? (
          <Image
            src={holder.imageUrl}
            alt={holder.login}
            width={48}
            height={48}
            className="rounded-full border border-zinc-100 object-cover group-hover:ring-2 ring-indigo-100 transition-all"
            unoptimized
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-lg font-medium text-zinc-600 group-hover:ring-2 ring-indigo-100 transition-all">
            {(holder.displayName || holder.login)[0].toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-zinc-900 truncate group-hover:text-indigo-600 transition-colors">
            {holder.displayName || holder.login}
          </h3>
          <p className="text-sm text-zinc-500 truncate">@{holder.login}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="text-xs font-medium px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded whitespace-nowrap">
            {holder.campusName}
          </div>
          {holder.destinationCampusName && (
            <div className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded whitespace-nowrap flex items-center gap-1">
              <span>{flag}</span>
              <span>{holder.destinationCampusName}</span>
            </div>
          )}
        </div>
      </div>

      <StudentProfileModal
        login={holder.login}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        destinationCampusName={holder.destinationCampusName}
        originCampusName={holder.campusName}
      />
    </>
  );
}
