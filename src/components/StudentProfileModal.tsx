"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FloatingEyesBackground } from "./FloatingEyes";

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
      return `${originCampusName} ➔ ${destinationCampusName}`;
    }
    return destinationCampusName || originCampusName || "Unknown Campus";
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      className="p-6 md:p-0 bg-transparent backdrop:bg-zinc-300/80 transition-all max-w-3xl w-full max-h-[100dvh] md:max-h-none overflow-y-auto md:overflow-visible"
    >
      <FloatingEyesBackground />
      <div className="bg-white border-[4px] border-black shadow-[10px_10px_0px_0px_#000] relative z-10 flex flex-col md:flex-row min-h-[500px] md:max-h-[85vh] w-full mx-auto my-auto mt-[5vh] md:mt-0">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 z-20 w-10 h-10 flex items-center justify-center bg-[#FF4D4D] border-2 border-black font-mono font-black text-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000] transition-all"
          aria-label="Close modal"
        >
          X
        </button>

        {loading && !profile ? (
          <div className="w-full flex items-center justify-center py-20">
            <div className="text-black font-mono font-bold uppercase tracking-widest flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-black border-t-[#FFE600] animate-spin" />
              <p>LOADING {login}...</p>
            </div>
          </div>
        ) : error ? (
          <div className="w-full flex items-center justify-center py-20">
            <div className="bg-[#FF4D4D] border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000] text-black font-mono font-bold">
              {error}
            </div>
          </div>
        ) : profile ? (
          <>
            {/* Left Section: Avatar & Action */}
            <div className="w-full md:w-[280px] bg-[#F4F0EA] border-b-[4px] md:border-b-0 md:border-r-[4px] border-black p-6 flex flex-col items-center">
              <div className="text-sm text-black font-black uppercase tracking-tight mb-6 w-full text-left">
                PROFILE IDENTITY
              </div>
              
              <div className="w-40 h-40 relative mb-4">
                {profile.imageUrl ? (
                  <Image
                    src={profile.imageUrl}
                    alt={profile.login}
                    fill
                    className="object-cover border-4 border-black shadow-[4px_4px_0px_0px_#000]"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-[#FFE600] flex items-center justify-center text-6xl font-black text-black border-4 border-black shadow-[4px_4px_0px_0px_#000]">
                    {profile.login[0].toUpperCase()}
                  </div>
                )}
                {/* Status Badge */}
                <div 
                  className={`absolute -bottom-3 -right-3 font-mono text-[12px] font-black uppercase tracking-widest px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#000] ${
                    profile.active ? "bg-[#00E575] text-black" : "bg-[#FF4D4D] text-white"
                  }`}
                >
                  {profile.active ? 'ONLINE' : 'OFFLINE'}
                </div>
              </div>

              <div className="text-2xl font-black uppercase tracking-tight text-black mt-4 text-center">
                {profile.displayName}
              </div>
              <div className="font-mono font-bold text-lg text-zinc-600 mb-1">
                @{profile.login}
              </div>

              <div className="mt-2 text-center">
                <span className="bg-[#FFE600] border-2 border-black px-2 py-0.5 font-mono text-xs font-bold shadow-[2px_2px_0px_0px_#000]">
                  LVL {profile.level.toFixed(2)}
                </span>
              </div>

              <div className="mt-auto w-full pt-8">
                {/* Working External Link */}
                <a
                  href={`https://profile.intra.42.fr/users/${profile.login}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 border-[3px] border-black bg-[#FFE600] px-4 py-3 font-mono font-black text-sm uppercase shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000] transition-all"
                >
                  ↗ OPEN 42 INTRA PROFILE
                </a>
              </div>
            </div>

            {/* Right Section: Details Grid */}
            <div className="flex-1 bg-white p-6 md:p-8 flex flex-col gap-6 md:overflow-y-auto">
              
              <div className="text-sm text-black font-black uppercase tracking-tight mb-2">
                METRICS & ROUTING
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Account Type */}
                <div className="border-[3px] border-black bg-[#F4F0EA] p-4 shadow-[2px_2px_0px_0px_#000] flex flex-col justify-between">
                  <div className="text-xs text-black font-black uppercase tracking-tight mb-2">Account Type</div>
                  <div>
                    <div className="text-xl font-black text-black capitalize">{profile.kind}</div>
                    <div className="font-mono text-xs text-zinc-600 uppercase font-bold mt-1">Student Account</div>
                  </div>
                </div>

                {/* Pool Info */}
                <div className="border-[3px] border-black bg-[#F4F0EA] p-4 shadow-[2px_2px_0px_0px_#000] flex flex-col justify-between">
                  <div className="text-xs text-black font-black uppercase tracking-tight mb-2">Pool Information</div>
                  <div>
                    <div className="text-xl font-black text-black capitalize">{profile.poolMonth || "?"} {profile.poolYear || ""}</div>
                    <div className="font-mono text-xs text-zinc-600 uppercase font-bold mt-1">Period</div>
                  </div>
                </div>

                {/* Evaluation Points */}
                <div className="border-[3px] border-black bg-[#F4F0EA] p-4 shadow-[2px_2px_0px_0px_#000] flex flex-col justify-between">
                  <div className="text-xs text-black font-black uppercase tracking-tight mb-2">Evaluation Points</div>
                  <div>
                    <div className="text-xl font-black text-black">{profile.correctionPoints}</div>
                    <div className="font-mono text-xs text-zinc-600 uppercase font-bold mt-1">Available for corrections</div>
                  </div>
                </div>

                {/* Wallet Balance */}
                <div className="border-[3px] border-black bg-[#F4F0EA] p-4 shadow-[2px_2px_0px_0px_#000] flex flex-col justify-between">
                  <div className="text-xs text-black font-black uppercase tracking-tight mb-2">Wallet Balance</div>
                  <div>
                    <div className="text-xl font-black text-black">{profile.wallet}</div>
                    <div className="font-mono text-xs text-zinc-600 uppercase font-bold mt-1">Digital Credits</div>
                  </div>
                </div>

                {/* Campus Details (Full Width) */}
                <div className="sm:col-span-2 border-[3px] border-black bg-[#F4F0EA] p-4 shadow-[2px_2px_0px_0px_#000]">
                  <div className="text-xs text-black font-black uppercase tracking-tight mb-2">Campus Details</div>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-xl font-black text-black bg-[#00F0FF] border-2 border-black inline-block px-2 py-1 shadow-[2px_2px_0px_0px_#000]">
                        {getCampusDisplayString()}
                      </div>
                      <div className="font-mono text-xs text-zinc-600 uppercase font-bold mt-2">Routing</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm font-bold text-black uppercase mb-1">Status</div>
                      <div className="flex items-center gap-2 justify-end">
                        <div className={`w-3 h-3 border border-black shadow-[1px_1px_0px_0px_#000] ${profile.active ? 'bg-[#00E575]' : 'bg-[#FF4D4D]'}`}></div>
                        <div className="font-black uppercase text-black">{profile.active ? 'Active' : 'Inactive'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information (Full Width) */}
                <div className="sm:col-span-2 border-[3px] border-black bg-[#F4F0EA] p-4 shadow-[2px_2px_0px_0px_#000] flex items-center gap-4">
                  <div className="shrink-0 w-12 h-12 bg-[#D4A5FF] border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center text-black font-black text-xl">
                    @
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-base sm:text-lg font-black text-black break-all">{profile.email || "Not Available"}</div>
                    <div className="font-mono text-xs text-zinc-600 uppercase font-bold mt-1">Primary Email Address</div>
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
