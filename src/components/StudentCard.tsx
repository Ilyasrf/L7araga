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
        className="bg-white border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_#000] flex flex-col items-center text-center cursor-pointer hover:bg-[#FFFDF0] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000] transition-all relative"
      >
        {/* Status Badge */}
        {holder.promo && (
          <div 
            className={`absolute top-3 right-3 font-mono text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border-2 border-black shadow-[2px_2px_0px_0px_#000] bg-[#D4A5FF] text-black`}
          >
            {holder.promo}
          </div>
        )}

        {/* Avatar */}
        <div className="w-20 h-20 relative mb-3 mt-4">
          {holder.imageUrl ? (
            <Image
              src={holder.imageUrl}
              alt={holder.login}
              fill
              className="object-cover border-[3px] border-black rounded-sm shadow-[3px_3px_0px_0px_#000]"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-[#FFE600] flex items-center justify-center text-3xl font-black text-black border-[3px] border-black rounded-sm shadow-[3px_3px_0px_0px_#000]">
              {(holder.displayName || holder.login)[0].toUpperCase()}
            </div>
          )}
        </div>

        {/* Identity */}
        <div className="w-full min-w-0 mb-1">
          <h3 className="font-black text-black uppercase tracking-tight truncate text-lg">
            {holder.displayName || holder.login}
          </h3>
          <p className="font-mono font-bold text-sm text-zinc-600 truncate">@{holder.login}</p>
        </div>

        {/* Level */}
        <div className="mb-4 mt-2 h-6">
          {/* Spacer to keep card layout consistent without level */}
        </div>

        {/* Transfer Route Badge */}
        <div className="mt-auto w-full">
          <div className="bg-[#00F0FF] border-[3px] border-black font-mono font-bold text-xs py-2 px-2 w-full text-center shadow-[2px_2px_0px_0px_#000]">
            {holder.campusName} ➔ {holder.destinationCampusName || "Unknown"} {flag}
          </div>
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
