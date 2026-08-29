"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import StarsBackground from "@/components/StarsBackground";
import FilterBar from "@/components/FilterBar";
import StudentCard from "@/components/StudentCard";
import type { AchievementHolderType } from "@/types";

export default function DashboardPage() {
  const [holders, setHolders] = useState<AchievementHolderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [filterCampus, setFilterCampus] = useState("All");
  const [filterPromo, setFilterPromo] = useState("All");
  const [filterLimit, setFilterLimit] = useState(50);

  const [promos, setPromos] = useState<string[]>([]);

  const fetchHolders = async () => {
    const params = new URLSearchParams();
    if (filterCampus !== "All") params.set("campus", filterCampus);
    if (filterPromo !== "All") params.set("promo", filterPromo);
    params.set("limit", filterLimit.toString());

    const res = await fetch(`/api/holders?${params.toString()}`);
    const data = await res.json();
    setHolders(data);
    setLoading(false);

    // Extract unique promos for filter
    const uniquePromos = Array.from(new Set(data.map((h: AchievementHolderType) => h.promo).filter(Boolean))) as string[];
    setPromos(uniquePromos.sort().reverse());
  };

  useEffect(() => {
    fetchHolders();
  }, [filterCampus, filterPromo, filterLimit]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetch("/api/sync");
      await fetchHolders();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen">
        <StarsBackground />
        <div className="pt-24 flex items-center justify-center">
          <div className="text-white/60">Loading students...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <StarsBackground />

      <div className="pt-20 pb-12 px-4 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="neon-text">Achievement</span> Holders
          </h1>
          <p className="text-white/60">
            Moroccan students who&apos;ve traveled to 42 Paris this year
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6"
        >
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
        </motion.div>

        {holders.length === 0 ? (
          <div className="glass p-12 text-center">
            <p className="text-white/60 text-lg">
              No students found matching your filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {holders.map((holder, index) => (
              <motion.div
                key={holder.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.02 }}
              >
                <StudentCard holder={holder} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
