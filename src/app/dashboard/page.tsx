"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import StarsBackground from "@/components/StarsBackground";
import Navbar from "@/components/Navbar";
import FilterBar from "@/components/FilterBar";
import StudentCard from "@/components/StudentCard";
import type { UserType } from "@/types";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<UserType[]>([]);
  const [filterCampus, setFilterCampus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
    if (
      status === "authenticated" &&
      !(session?.user as { targetCampus?: string })?.targetCampus
    ) {
      router.push("/onboarding");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      });
  }, [status]);

  const filteredUsers = filterCampus
    ? users.filter((u) => u.targetCampus === filterCampus)
    : users;

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen">
        <StarsBackground />
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="text-white/60">Loading students...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <StarsBackground />
      <Navbar />

      <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="neon-text">Transfer</span> Dashboard
          </h1>
          <p className="text-white/60">
            {filteredUsers.length} student
            {filteredUsers.length !== 1 ? "s" : ""} tracking their journey
          </p>
        </div>

        <div className="mb-6">
          <FilterBar
            selectedCampus={filterCampus}
            onCampusChange={setFilterCampus}
          />
        </div>

        {filteredUsers.length === 0 ? (
          <div className="glass p-12 text-center">
            <p className="text-white/60 text-lg">
              No students found matching your filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <StudentCard key={user.id} user={user} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
