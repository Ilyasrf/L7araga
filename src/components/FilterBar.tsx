"use client";

import { MOROCCAN_CAMPUSES } from "@/lib/campus";

interface FilterBarProps {
  selectedCampus: string;
  selectedPromo: string;
  selectedLimit: number;
  onCampusChange: (campus: string) => void;
  onPromoChange: (promo: string) => void;
  onLimitChange: (limit: number) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  promos: string[];
  totalCount: number;
}

export default function FilterBar({
  selectedCampus,
  selectedPromo,
  selectedLimit,
  onCampusChange,
  onPromoChange,
  onLimitChange,
  onRefresh,
  isRefreshing,
  promos,
  totalCount,
}: FilterBarProps) {
  return (
    <div className="glass p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedCampus}
          onChange={(e) => onCampusChange(e.target.value)}
          className="glass-input text-sm"
        >
          <option value="All" className="bg-black">All Campuses</option>
          {MOROCCAN_CAMPUSES.map((campus) => (
            <option key={campus.id} value={campus.displayName} className="bg-black">
              {campus.displayName}
            </option>
          ))}
        </select>

        <select
          value={selectedPromo}
          onChange={(e) => onPromoChange(e.target.value)}
          className="glass-input text-sm"
        >
          <option value="All" className="bg-black">All Promos</option>
          {promos.map((promo) => (
            <option key={promo} value={promo} className="bg-black">
              {promo}
            </option>
          ))}
        </select>

        <select
          value={selectedLimit}
          onChange={(e) => onLimitChange(parseInt(e.target.value))}
          className="glass-input text-sm"
        >
          <option value={25} className="bg-black">Show 25</option>
          <option value={50} className="bg-black">Show 50</option>
          <option value={100} className="bg-black">Show 100</option>
        </select>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="glass-button text-sm disabled:opacity-50"
        >
          {isRefreshing ? "Syncing..." : "Refresh"}
        </button>
      </div>

      <p className="text-sm text-white/60 ml-auto">
        {totalCount} student{totalCount !== 1 ? "s" : ""}
        {selectedCampus !== "All" ? ` at ${selectedCampus}` : ""}
      </p>
    </div>
  );
}
