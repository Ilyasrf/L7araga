"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import SidebarFilter from "@/components/SidebarFilter";
import StudentCard from "@/components/StudentCard";
import StudentListRow from "@/components/StudentListRow";
import HeaderMascot from "@/components/HeaderMascot";
import type { AchievementHolderType } from "@/types";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  const [holders, setHolders] = useState<AchievementHolderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize selectedCampus to "All" initially, will update once session loads
  const [filterCampus, setFilterCampus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const filterLimit = 500; // Increase limit to fetch more data for client-side search
  const [hasInitializedCampus, setHasInitializedCampus] = useState(false);

  // Session-Aware Defaulting
  useEffect(() => {
    if (status === "authenticated" && session?.user && !hasInitializedCampus) {
      const userCampus = (session.user as { campus?: string })?.campus;
      if (userCampus && ["Tétouan", "Khouribga", "Benguerir", "Rabat"].includes(userCampus)) {
        setFilterCampus(userCampus);
      } else {
        setFilterCampus("Tétouan"); // Fallback
      }
      setHasInitializedCampus(true);
    }
  }, [status, session, hasInitializedCampus]);

  const fetchHolders = useCallback(async () => {
    if (!hasInitializedCampus) return; // Wait until campus is resolved
    
    const params = new URLSearchParams();
    if (filterCampus !== "All") params.set("campus", filterCampus);
    params.set("limit", filterLimit.toString());

    setLoading(true);
    try {
      const res = await fetch(`/api/holders?${params.toString()}`);
      if (!res.ok) {
        setError("Failed to load students. Please try again later.");
        return;
      }
      const data = await res.json();
      setHolders(data);
      setError(null);
    } catch {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  }, [filterCampus, filterLimit, hasInitializedCampus]);

  useEffect(() => {
    if (status === "authenticated" && hasInitializedCampus) {
      fetchHolders();
    }
  }, [fetchHolders, status, hasInitializedCampus]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchHolders();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (status === "loading" || (status === "authenticated" && !hasInitializedCampus)) {
    return (
      <main className="min-h-screen bg-[#F4F0EA] flex items-center justify-center">
        <div className="font-mono font-black text-xl uppercase tracking-widest text-black border-4 border-black p-6 bg-[#FFE600] shadow-[8px_8px_0px_0px_#000]">
          AUTHENTICATING...
        </div>
      </main>
    );
  }

  if (status === "unauthenticated") {
    redirect("/");
  }

  // Client-side search filtering
  const filteredHolders = holders.filter((h) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      h.login.toLowerCase().includes(q) ||
      (h.displayName && h.displayName.toLowerCase().includes(q))
    );
  });

  return (
    <main className="min-h-screen bg-[#F4F0EA]">
      {/* Header */}
      <header className="border-b-[4px] border-black bg-[#B48EEA] p-6 relative z-20">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between relative z-10">
          <div className="flex items-end gap-3">
            <HeaderMascot />
            <div className="bg-white border-[3px] border-black p-3 shadow-[4px_4px_0px_0px_#000]">
              <h1 className="text-2xl sm:text-3xl font-black text-black uppercase tracking-tight leading-none">
                STUDENTS TRACKER
              </h1>
              <div className="mt-2">
                <span className="inline-block bg-[#FFE600] border-2 border-black px-2 py-0.5 font-mono text-[11px] font-black uppercase shadow-[2px_2px_0px_0px_#000]">
                  ✦ FROM MOROCCO TO THE 42 WORLD
                </span>
              </div>
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="bg-[#00F0FF] border-[3px] border-black px-4 py-2 font-black uppercase shadow-[4px_4px_0px_0px_#000]">
              42 NETWORK
            </div>
          </div>
        </div>
      </header>

      {/* 2-Column Layout */}
      <div className="flex flex-col lg:flex-row max-w-[1600px] mx-auto">
        
        {/* Left Sidebar */}
        <SidebarFilter
          selectedCampus={filterCampus}
          searchQuery={searchQuery}
          viewMode={viewMode}
          onCampusChange={setFilterCampus}
          onSearchChange={setSearchQuery}
          onViewModeChange={setViewMode}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          totalCount={filteredHolders.length}
        />

        {/* Main Content */}
        <div className="flex-1 p-6 lg:p-10">
          {loading && holders.length === 0 ? (
            <div className="flex items-center justify-center pt-20">
              <div className="font-mono font-black text-xl uppercase tracking-widest text-black border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_#000]">
                LOADING STUDENTS...
              </div>
            </div>
          ) : error ? (
            <div className="bg-[#FF4D4D] border-4 border-black p-10 text-center shadow-[8px_8px_0px_0px_#000]">
              <p className="text-black font-black text-xl uppercase mb-2">{error}</p>
              <p className="font-mono font-bold text-black text-sm">
                Make sure the database is set up and environment variables are configured.
              </p>
            </div>
          ) : filteredHolders.length === 0 ? (
            <div className="bg-white border-4 border-black p-12 text-center shadow-[8px_8px_0px_0px_#000]">
              <p className="text-black font-black text-xl uppercase">
                NO STUDENTS FOUND MATCHING YOUR CRITERIA
              </p>
            </div>
          ) : (
            <>
              {/* Grid View */}
              {viewMode === "grid" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredHolders.map((holder) => (
                    <StudentCard key={holder.id} holder={holder} />
                  ))}
                </div>
              )}

              {/* List View */}
              {viewMode === "list" && (
                <div className="flex flex-col gap-3">
                  {/* Table Header (Desktop) */}
                  <div className="hidden md:flex items-center gap-4 bg-[#FFE600] border-[3px] border-black p-3 shadow-[4px_4px_0px_0px_#000] mb-2 font-black uppercase tracking-tight text-sm">
                    <div className="w-12 text-center">PIC</div>
                    <div className="flex-1">IDENTITY</div>
                    <div className="w-20 text-right">PROMO</div>
                    <div className="w-48 text-right">ROUTE</div>
                  </div>
                  {filteredHolders.map((holder) => (
                    <StudentListRow key={holder.id} holder={holder} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
