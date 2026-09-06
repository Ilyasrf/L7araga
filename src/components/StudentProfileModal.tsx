"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface ProfileData {
  login: string;
  email: string | null;
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
  originCampusName?: string | null;
}

export default function StudentProfileModal({
  login,
  isOpen,
  onClose,
  destinationCampusName,
  originCampusName,
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

  const getCampusDisplayString = () => {
    if (originCampusName && destinationCampusName) {
      return `${originCampusName} -> ${destinationCampusName}`;
    }
    return destinationCampusName || originCampusName || "Unknown Campus";
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className="p-0 bg-transparent backdrop:bg-black/60 backdrop:backdrop-blur-sm transition-all rounded-xl shadow-2xl max-w-5xl w-[95vw] md:w-full overflow-hidden"
    >
      <div className="bg-[#0f1015] text-zinc-100 border border-zinc-800 rounded-xl overflow-hidden flex flex-col md:flex-row relative min-h-[500px]">
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
              <div className="w-8 h-8 border-4 border-zinc-800 border-t-red-500 rounded-full animate-spin" />
              <p>Loading {login}&#39;s profile...</p>
            </div>
          </div>
        ) : error ? (
          <div className="w-full flex items-center justify-center py-20">
            <div className="text-red-400">{error}</div>
          </div>
        ) : profile ? (
          <>
            {/* Left Sidebar - Profile Picture & Nav (mimicking original UI) */}
            <div className="w-full md:w-[280px] bg-[#0A0A0E] p-6 flex flex-col border-b md:border-b-0 md:border-r border-zinc-800/50">
              <div className="text-[10px] text-zinc-500 tracking-widest font-semibold mb-6">PROFILE</div>
              
              <div className="flex flex-col items-center mt-4 mb-8">
                <div className="w-32 h-32 relative mb-4">
                  {profile.imageUrl ? (
                    <Image
                      src={profile.imageUrl}
                      alt={profile.login}
                      fill
                      className="object-cover border-2 border-[#1c1d24]"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-4xl font-bold text-zinc-500 border border-[#1c1d24]">
                      {profile.login[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="text-sm tracking-wider font-semibold uppercase text-zinc-200 mb-1">{profile.login}</div>
                <div className="text-xs text-zinc-400">{profile.level.toFixed(2)}</div>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`w-2 h-2 rounded-full ${profile.active ? 'bg-green-500' : 'bg-zinc-600'}`}></div>
                  <span className="text-[10px] text-zinc-500 tracking-wider font-medium uppercase">{profile.active ? 'ONLINE' : 'OFFLINE'}</span>
                </div>
              </div>
              
              <div className="mt-auto pt-8 border-t border-zinc-800/50">
                <button className="w-full text-[10px] uppercase tracking-widest text-zinc-400 hover:text-white transition-colors flex items-center gap-2">
                  <span className="text-red-500">↗</span> 42 PROFILE
                </button>
              </div>
            </div>

            {/* Right Content */}
            <div className="flex-1 bg-[#0f1015] flex flex-col overflow-y-auto">
              
              {/* Top Bar - Header & Progress */}
              <div className="p-6 md:p-8 border-b border-zinc-800/50">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-2 h-2 rounded-full ${profile.active ? 'bg-green-500' : 'bg-zinc-600'}`}></div>
                      <span className="text-[10px] text-zinc-500 tracking-wider font-medium uppercase">{profile.active ? 'ONLINE' : 'OFFLINE'}</span>
                      <span className="text-zinc-600">|</span>
                      <span className="text-sm tracking-widest font-semibold uppercase text-white">{profile.login}</span>
                    </div>
                    <h1 className="text-xl font-medium tracking-wide text-zinc-200 uppercase">{profile.displayName}</h1>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-red-500 tracking-widest font-bold uppercase">RANK</span>
                    <span className="text-sm font-medium text-white">{profile.level.toFixed(2)}</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#1c1d24] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" 
                      style={{ width: `${(profile.level % 1 * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                
                {/* 3 Columns Top Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Account Type */}
                  <div className="border border-zinc-800/50 bg-[#14151a] p-4 flex flex-col justify-between">
                    <div className="text-[10px] text-red-500 font-bold uppercase tracking-widest mb-3">ACCOUNT TYPE</div>
                    <div>
                      <div className="text-lg font-medium text-white mb-1 capitalize">{profile.kind}</div>
                      <div className="text-[9px] text-zinc-500 uppercase tracking-widest">STUDENT ACCOUNT</div>
                    </div>
                  </div>
                  
                  {/* Evaluation Points */}
                  <div className="border border-zinc-800/50 bg-[#14151a] p-4 flex flex-col justify-between">
                    <div className="text-[10px] text-red-500 font-bold uppercase tracking-widest mb-3">EVALUATION POINTS</div>
                    <div>
                      <div className="text-lg font-medium text-white mb-1">{profile.correctionPoints}</div>
                      <div className="text-[9px] text-zinc-500 uppercase tracking-widest">AVAILABLE FOR CORRECTIONS</div>
                    </div>
                  </div>
                  
                  {/* Wallet Balance */}
                  <div className="border border-zinc-800/50 bg-[#14151a] p-4 flex flex-col justify-between">
                    <div className="text-[10px] text-red-500 font-bold uppercase tracking-widest mb-3">WALLET BALANCE</div>
                    <div>
                      <div className="text-lg font-medium text-white mb-1">{profile.wallet}</div>
                      <div className="text-[9px] text-zinc-500 uppercase tracking-widest">DIGITAL CREDITS</div>
                    </div>
                  </div>
                </div>

                {/* Pool Information */}
                <div className="border border-zinc-800/50 bg-[#14151a] p-5">
                  <div className="text-[10px] text-red-500 font-bold uppercase tracking-widest mb-4">POOL INFORMATION</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1">POOL PERIOD</div>
                      <div className="text-sm font-medium text-white capitalize">{profile.poolMonth || "?"} {profile.poolYear || ""}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1">CURRENT LOCATION</div>
                      <div className="text-sm font-medium text-white">{profile.location || "Not Available"}</div>
                    </div>
                  </div>
                </div>

                {/* Campus Details */}
                <div className="border border-zinc-800/50 bg-[#14151a] p-5">
                  <div className="text-[10px] text-red-500 font-bold uppercase tracking-widest mb-4">CAMPUS DETAILS</div>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium text-white mb-1">{getCampusDisplayString()}</div>
                      <div className="text-[9px] text-zinc-500 uppercase tracking-widest">CAMPUS</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1">STATUS</div>
                      <div className="flex items-center gap-2 justify-end">
                        <div className={`w-1.5 h-1.5 rounded-full ${profile.active ? 'bg-green-500' : 'bg-zinc-600'}`}></div>
                        <div className="text-sm font-medium text-white uppercase">{profile.active ? 'ACTIVE' : 'INACTIVE'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="border border-zinc-800/50 bg-[#14151a] p-5">
                  <div className="text-[10px] text-red-500 font-bold uppercase tracking-widest mb-4">CONTACT INFORMATION</div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 border border-zinc-700 bg-zinc-800/50 flex items-center justify-center text-zinc-400 font-medium">@</div>
                    <div>
                      <div className="text-sm font-medium text-white mb-1">{profile.email || "Not Available"}</div>
                      <div className="text-[9px] text-zinc-500 uppercase tracking-widest">PRIMARY EMAIL ADDRESS</div>
                    </div>
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
