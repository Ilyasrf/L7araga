"use client";

import { CAMPUSES, getCampusFlag } from "@/lib/campus";

interface FilterBarProps {
  selectedCampus: string;
  onCampusChange: (campus: string) => void;
}

export default function FilterBar({
  selectedCampus,
  onCampusChange,
}: FilterBarProps) {
  return (
    <div className="glass p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <label className="text-sm text-white/60 whitespace-nowrap">
        Filter by Target Campus:
      </label>
      <select
        value={selectedCampus}
        onChange={(e) => onCampusChange(e.target.value)}
        className="glass-input w-full sm:w-auto"
      >
        <option value="" className="bg-black">
          All Campuses
        </option>
        {CAMPUSES.map((campus) => (
          <option key={campus} value={campus} className="bg-black">
            {getCampusFlag(campus)} {campus}
          </option>
        ))}
      </select>
    </div>
  );
}
