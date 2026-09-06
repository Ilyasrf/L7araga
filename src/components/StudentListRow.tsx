"use client";

import { useState } from "react";
import Image from "next/image";
import type { AchievementHolderType } from "@/types";
import { getCampusFlag } from "@/lib/campus";
import StudentProfileModal from "./StudentProfileModal";

interface StudentListRowProps {
  holder: AchievementHolderType;
}

export default function StudentListRow({ holder }: StudentListRowProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const displayCampusName = holder.destinationCampusName || holder.campusName;
  const flag = getCampusFlag(displayCampusName);

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className="group bg-white border-[3px] border-black p-3 flex items-center gap-4 transition-all hover:bg-[#FFFDF0] active:bg-[#F4F0EA] cursor-pointer"
      >
        {/* Avatar */}
        <div className="w-12 h-12 flex-shrink-0 relative">
          {holder.imageUrl ? (
            <Image
              src={holder.imageUrl}
              alt={holder.login}
              fill
              className="object-cover border-2 border-black rounded-sm shadow-[2px_2px_0px_0px_#000]"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-[#FFE600] flex items-center justify-center text-lg font-black border-2 border-black rounded-sm shadow-[2px_2px_0px_0px_#000] text-black">
              {(holder.displayName || holder.login)[0].toUpperCase()}
            </div>
          )}
        </div>

        {/* Identity */}
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-black uppercase tracking-tight truncate">
            {holder.displayName || holder.login}
          </h3>
          <p className="font-mono font-bold text-sm text-zinc-600 truncate">@{holder.login}</p>
        </div>

        {/* Promo */}
        <div className="hidden sm:flex flex-col items-end">
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Promo</div>
          <div className="font-mono font-bold text-sm bg-white border-2 border-black px-2 shadow-[2px_2px_0px_0px_#000]">
            {holder.promo || "N/A"}
          </div>
        </div>

        {/* Routing / Mobility */}
        <div className="hidden md:flex flex-col items-end ml-4">
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Route</div>
          <div className="font-mono font-bold text-xs bg-[#00F0FF] border-2 border-black px-2 py-0.5 shadow-[2px_2px_0px_0px_#000]">
            {holder.campusName} ➔ {holder.destinationCampusName} {flag}
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
