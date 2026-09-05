"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import FilterBar from "@/components/FilterBar";
import StudentCard from "@/components/StudentCard";
import type { AchievementHolderType } from "@/types";

export default function DashboardPage() {
  const { status } = useSession();

  const [holders, setHolders] = useState<AchievementHolderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [filterCampus, setFilterCampus] = useState("All");
  const [filterPromo, setFilterPromo] = useState("All");
  const [filterLimit, setFilterLimit] = useState(50);

  const [promos, setPromos] = useState<string[]>([]);

  const fetchHolders = useCallback(async () => {
    const params = new URLSearchParams();
    if (filterCampus !== "All") params.set("campus", filterCampus);
    if (filterPromo !== "All") params.set("promo", filterPromo);
    params.set("limit", filterLimit.toString());

    try {
      const res = await fetch(`/api/holders?${params.toString()}`);
      if (!res.ok) {
        setError("Failed to load students. Please try again later.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setHolders(data);
      setError(null);

      const uniquePromos = Array.from(new Set(data.map((h: AchievementHolderType) => h.promo).filter(Boolean))) as string[];
      setPromos(uniquePromos.sort().reverse());
    } catch {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  }, [filterCampus, filterPromo, filterLimit]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchHolders();
    }
  }, [fetchHolders, status]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchHolders();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-zinc-500 font-medium">Authenticating...</div>
      </main>
    );
  }

  if (status === "unauthenticated") {
    redirect("/");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-50">
        <div className="pt-24 flex items-center justify-center">
          <div className="text-zinc-500 font-medium">Loading students...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="pt-16 pb-12 px-4 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-zinc-900 mb-2 tracking-tight">
            Students Tracker
          </h1>
          <p className="text-zinc-500 text-lg">
            Track where your fellow 1337 students are right now
          </p>
        </div>

        <div className="mb-8">
          <FilterBar
            selectedCampus={filterCampus}
            selectedPromo={filterPromo}
            selectedLimit={filterLimit}
            onCampusChange={setFilterCampus}
            onPromoChange={setFilterPromo}
            onLimitChange={setFilterLimit}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            promos={promos}
            totalCount={holders.length}
          />
        </div>

        {error ? (
          <div className="bg-white border border-red-200 p-12 text-center rounded-lg shadow-sm">
            <p className="text-red-600 font-medium text-lg mb-2">{error}</p>
            <p className="text-zinc-500 text-sm">
              Make sure the database is set up and environment variables are configured.
            </p>
          </div>
        ) : holders.length === 0 ? (
          <div className="bg-white border border-zinc-200 p-12 text-center rounded-lg shadow-sm">
            <p className="text-zinc-500 font-medium text-lg">
              No students found matching your filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {holders.map((holder) => (
              <StudentCard key={holder.id} holder={holder} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
