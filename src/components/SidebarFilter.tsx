"use client";

import { useState } from "react";
import { MOROCCAN_CAMPUSES } from "@/lib/campus";

interface SidebarFilterProps {
  selectedCampus: string;
  searchQuery: string;
  viewMode: "grid" | "list";
  onCampusChange: (campus: string) => void;
  onSearchChange: (query: string) => void;
  onViewModeChange: (mode: "grid" | "list") => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  totalCount: number;
}

export default function SidebarFilter({
  selectedCampus,
  searchQuery,
  viewMode,
  onCampusChange,
  onSearchChange,
  onViewModeChange,
  onRefresh,
  isRefreshing,
  totalCount,
}: SidebarFilterProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <aside className="w-full lg:w-80 border-b-[3px] lg:border-b-0 lg:border-r-[3px] border-black bg-white flex flex-col lg:min-h-[calc(100vh-64px)] lg:sticky lg:top-16 z-10">
      
      {/* Mobile Toggle Button */}
      <div className={`lg:hidden p-4 flex justify-between items-center bg-[#F4F0EA] ${isMobileOpen ? 'border-b-[3px] border-black' : ''}`}>
        <span className="font-black uppercase tracking-tight text-sm text-black">
          {totalCount} Transfers
        </span>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="border-[3px] border-black bg-[#FFE600] px-4 py-2 font-black uppercase text-xs shadow-[2px_2px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
        >
          {isMobileOpen ? "Close Filters" : "Open Filters"}
        </button>
      </div>

      {/* Filter Content */}
      <div className={`${isMobileOpen ? "flex" : "hidden"} lg:flex flex-col gap-8 p-6 h-full`}>
      
      {/* Search Input */}
      <div>
        <label className="block font-black uppercase tracking-tight text-sm mb-2">Search</label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="SEARCH LOGIN / NAME..."
          className="w-full border-[3px] border-black bg-white p-3 font-mono text-sm shadow-[4px_4px_0px_0px_#000] focus:outline-none focus:bg-[#FFE600]/20 focus:translate-x-[-1px] focus:translate-y-[-1px] transition-all"
        />
      </div>

      {/* Campus Switcher */}
      <div>
        <label className="block font-black uppercase tracking-tight text-sm mb-2">Origin Campus</label>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => onCampusChange("All")}
            className={`w-full text-left p-3 border-[3px] border-black font-black uppercase tracking-tight transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000] ${
              selectedCampus === "All"
                ? "bg-[#FFE600] shadow-[4px_4px_0px_0px_#000]"
                : "bg-white hover:bg-zinc-50 shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px]"
            }`}
          >
            All Campuses
          </button>
          {MOROCCAN_CAMPUSES.map((campus) => (
            <button
              key={campus.id}
              onClick={() => onCampusChange(campus.displayName)}
              className={`w-full text-left p-3 border-[3px] border-black font-black uppercase tracking-tight transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000] ${
                selectedCampus === campus.displayName
                  ? "bg-[#FFE600] shadow-[4px_4px_0px_0px_#000]"
                  : "bg-white hover:bg-zinc-50 shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px]"
              }`}
            >
              {campus.displayName}
            </button>
          ))}
        </div>
      </div>

      {/* Mobility Summary Counter */}
      <div>
        <div className="border-[3px] border-black bg-[#FF4D4D] p-4 text-center shadow-[4px_4px_0px_0px_#000]">
          <div className="font-mono font-bold text-3xl text-white drop-shadow-[2px_2px_0px_#000]">
            {totalCount}
          </div>
          <div className="font-black uppercase tracking-tight text-black mt-1">
            Transfers Detected
          </div>
        </div>
      </div>


      {/* View Switcher */}
      <div>
        <label className="block font-black uppercase tracking-tight text-sm mb-2">View Mode</label>
        <div className="flex gap-3">
          <button
            onClick={() => onViewModeChange("grid")}
            className={`flex-1 p-3 border-[3px] border-black font-black uppercase tracking-tight text-center transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000] ${
              viewMode === "grid"
                ? "bg-[#00E575] shadow-[4px_4px_0px_0px_#000]"
                : "bg-white hover:bg-zinc-50 shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px]"
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`flex-1 p-3 border-[3px] border-black font-black uppercase tracking-tight text-center transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000] ${
              viewMode === "list"
                ? "bg-[#00E575] shadow-[4px_4px_0px_0px_#000]"
                : "bg-white hover:bg-zinc-50 shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px]"
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* Refresh Button */}
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="w-full p-3 mt-4 border-[3px] border-black bg-black text-white font-black uppercase tracking-tight shadow-[4px_4px_0px_0px_#FFE600] hover:bg-zinc-800 hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#FFE600] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isRefreshing ? "SYNCING..." : "REFRESH DATA"}
      </button>

      {/* Empty space filler for bottom alignment */}
      <div className="mt-auto pt-8"></div>
      </div>
    </aside>
  );
}
