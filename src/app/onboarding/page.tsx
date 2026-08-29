"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { CAMPUSES, getCampusFlag } from "@/lib/campus";
import { TRANSFER_STATUS_LABELS } from "@/types";
import type { TransferStatusType, SessionUser } from "@/types";
import StarsBackground from "@/components/StarsBackground";

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [targetCampus, setTargetCampus] = useState("");
  const [transferStatus, setTransferStatus] =
    useState<TransferStatusType>("SEEKING_SWAP");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
    if (
      status === "authenticated" &&
      (session?.user as SessionUser)?.targetCampus
    ) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCampus) return;

    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetCampus, transferStatus }),
      });

      if (res.ok) {
        router.push("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-white/60">Loading...</div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center">
      <StarsBackground />

      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        <div className="glass p-8">
          <h1 className="text-2xl font-bold mb-2 neon-text">
            Complete Your Profile
          </h1>
          <p className="text-white/60 mb-8">
            Select your target campus and current transfer status.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-white/80 mb-2">
                Target Campus
              </label>
              <select
                value={targetCampus}
                onChange={(e) => setTargetCampus(e.target.value)}
                className="glass-input w-full"
                required
              >
                <option value="" className="bg-black">
                  Select a campus...
                </option>
                {CAMPUSES.map((campus) => (
                  <option key={campus} value={campus} className="bg-black">
                    {getCampusFlag(campus)} {campus}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-white/80 mb-2">
                Transfer Status
              </label>
              <select
                value={transferStatus}
                onChange={(e) =>
                  setTransferStatus(e.target.value as TransferStatusType)
                }
                className="glass-input w-full"
              >
                {Object.entries(TRANSFER_STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key} className="bg-black">
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !targetCampus}
              className="glass-button w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Continue to Dashboard"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
