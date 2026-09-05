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
    <div className="bg-white border border-zinc-200 shadow-sm rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedCampus}
          onChange={(e) => onCampusChange(e.target.value)}
          className="bg-zinc-50 border border-zinc-300 text-zinc-900 text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 block px-3 py-2"
        >
          <option value="All">All Campuses</option>
          {MOROCCAN_CAMPUSES.map((campus) => (
            <option key={campus.id} value={campus.displayName}>
              {campus.displayName}
            </option>
          ))}
        </select>

        <select
          value={selectedPromo}
          onChange={(e) => onPromoChange(e.target.value)}
          className="bg-zinc-50 border border-zinc-300 text-zinc-900 text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 block px-3 py-2"
        >
          <option value="All">All Promos</option>
          {promos.map((promo) => (
            <option key={promo} value={promo}>
              {promo}
            </option>
          ))}
        </select>

        <select
          value={selectedLimit}
          onChange={(e) => onLimitChange(parseInt(e.target.value))}
          className="bg-zinc-50 border border-zinc-300 text-zinc-900 text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 block px-3 py-2"
        >
          <option value={25}>Show 25</option>
          <option value={50}>Show 50</option>
          <option value={100}>Show 100</option>
        </select>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
        >
          {isRefreshing ? "Syncing..." : "Refresh"}
        </button>
      </div>

      <p className="text-sm text-zinc-500 ml-auto font-medium">
        {totalCount} student{totalCount !== 1 ? "s" : ""}
        {selectedCampus !== "All" ? ` at ${selectedCampus}` : ""}
      </p>
    </div>
  );
}
