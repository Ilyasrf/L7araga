"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface ProfileData {
  login: string;
  displayName: string;
  imageUrl: string | null;
  wallet: number;
  correctionPoints: number;
  poolMonth: string | null;
  poolYear: string | null;
  location: string | null;
  active: boolean;
  kind: string;
  level: number;
  grade: string;
  cursusName: string;
}

interface StudentProfileModalProps {
  login: string | null;
  isOpen: boolean;
  onClose: () => void;
  destinationCampusName?: string | null;
}

export default function StudentProfileModal({
  login,
  isOpen,
  onClose,
  destinationCampusName,
}: StudentProfileModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) dialog.showModal();
      document.body.style.overflow = "hidden";
      if (login) {
        fetchProfile(login);
      }
    } else {
      if (dialog.open) dialog.close();
      document.body.style.overflow = "auto";
      // Clear state when closing
      setTimeout(() => {
        setProfile(null);
        setError(null);
      }, 300);
    }
  }, [isOpen, login]);

  const fetchProfile = async (studentLogin: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/student/${studentLogin}`);
      if (!res.ok) throw new Error("Failed to load profile");
      const data = await res.json();
      setProfile(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className="p-0 bg-transparent backdrop:bg-black/60 backdrop:backdrop-blur-sm transition-all rounded-xl shadow-2xl max-w-4xl w-[95vw] md:w-full overflow-hidden"
    >
      <div className="bg-zinc-950 text-zinc-100 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative min-h-[400px]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          ✕
        </button>

        {loading && !profile ? (
          <div className="w-full flex items-center justify-center py-20">
            <div className="text-zinc-500 flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-zinc-800 border-t-indigo-500 rounded-full animate-spin" />
              <p>Loading {login}&#39;s profile...</p>
            </div>
          </div>
        ) : error ? (
          <div className="w-full flex items-center justify-center py-20">
            <div className="text-red-400">{error}</div>
          </div>
        ) : profile ? (
          <>
            {/* Left Sidebar - Basic Profile */}
            <div className="w-full md:w-1/3 bg-zinc-900/50 p-6 md:p-8 flex flex-col items-center border-b md:border-b-0 md:border-r border-zinc-800">
              <div className="relative w-32 h-32 md:w-40 md:h-40 mb-6">
                {profile.imageUrl ? (
                  <Image
                    src={profile.imageUrl}
                    alt={profile.login}
                    fill
                    className="rounded-xl object-cover shadow-lg border border-zinc-800"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-zinc-800 flex items-center justify-center text-4xl font-bold text-zinc-500">
                    {profile.login[0].toUpperCase()}
                  </div>
                )}
                {profile.active && (
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 border-4 border-zinc-900 rounded-full" title="Active Account" />
                )}
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-1 text-center">{profile.displayName}</h2>
              <p className="text-zinc-400 mb-4">@{profile.login}</p>
              
              <div className="w-full space-y-3 mt-4">
                <div className="bg-zinc-900/80 p-3 rounded-lg border border-zinc-800/50 flex flex-col items-center justify-center">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Rank</span>
                  <span className="text-xl font-bold text-indigo-400">{profile.grade}</span>
                </div>
                
                {destinationCampusName && (
                  <div className="bg-zinc-900/80 p-3 rounded-lg border border-zinc-800/50 flex flex-col items-center justify-center">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Location</span>
                    <span className="text-sm font-medium text-white text-center">
                      {destinationCampusName}
                      {profile.location ? ` - ${profile.location}` : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Content - Stats */}
            <div className="w-full md:w-2/3 p-6 md:p-8 flex flex-col justify-center">
              
              <div className="mb-8">
                <div className="flex justify-between items-end mb-2">
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Level {Math.floor(profile.level)}</h3>
                  <span className="text-sm text-indigo-400 font-medium">{(profile.level % 1 * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" 
                    style={{ width: `${(profile.level % 1 * 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 flex flex-col">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Wallet</span>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-white">{profile.wallet}</span>
                    <span className="text-zinc-500 mb-1 text-sm">₳</span>
                  </div>
                </div>
                
                <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 flex flex-col">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Eval Points</span>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-white">{profile.correctionPoints}</span>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/50 p-5 rounded-lg border border-zinc-800">
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Account Information</h3>
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  <div>
                    <span className="block text-zinc-500 mb-1">Type</span>
                    <span className="text-zinc-200 capitalize">{profile.kind}</span>
                  </div>
                  <div>
                    <span className="block text-zinc-500 mb-1">Status</span>
                    <span className="text-zinc-200">{profile.active ? "Active" : "Inactive"}</span>
                  </div>
                  <div>
                    <span className="block text-zinc-500 mb-1">Pool</span>
                    <span className="text-zinc-200 capitalize">{profile.poolMonth || "?"} {profile.poolYear || ""}</span>
                  </div>
                  <div>
                    <span className="block text-zinc-500 mb-1">Cursus</span>
                    <span className="text-zinc-200">{profile.cursusName}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </dialog>
  );
}
