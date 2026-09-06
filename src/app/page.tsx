"use client";

import { signIn, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import HeaderMascot from "@/components/HeaderMascot";

export default function LoginPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F4F0EA]">
        <div className="font-mono font-black text-xl uppercase tracking-widest text-black border-4 border-black p-6 bg-[#FFE600] shadow-[8px_8px_0px_0px_#000]">
          INITIALIZING...
        </div>
      </main>
    );
  }

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#F4F0EA] bg-dot-pattern relative overflow-hidden flex items-center justify-center p-4">
      
      {/* Decorative Floating Badges */}
      <div className="absolute top-[15%] left-[10%] animate-float" style={{ animationDelay: '0s' }}>
        <div className="border-[3px] border-black bg-[#00F0FF] font-mono text-xs font-black uppercase shadow-[4px_4px_0px_0px_#000] px-3 py-1.5 select-none pointer-events-none transform -rotate-6">
          TÉTOUAN ➔ PARIS 🇫🇷
        </div>
      </div>

      <div className="absolute top-[25%] right-[12%] animate-float" style={{ animationDelay: '1.5s' }}>
        <div className="border-[3px] border-black bg-[#FFE600] font-mono text-xs font-black uppercase shadow-[4px_4px_0px_0px_#000] px-3 py-1.5 select-none pointer-events-none transform rotate-3">
          KHOURIBGA ➔ LYON 🇫🇷
        </div>
      </div>

      <div className="absolute bottom-[20%] left-[15%] animate-float" style={{ animationDelay: '0.7s' }}>
        <div className="border-[3px] border-black bg-[#00E575] font-mono text-xs font-black uppercase shadow-[4px_4px_0px_0px_#000] px-3 py-1.5 select-none pointer-events-none transform rotate-6">
          BENGUERIR ➔ AMSTERDAM 🇳🇱
        </div>
      </div>

      <div className="absolute bottom-[30%] right-[10%] animate-float" style={{ animationDelay: '2s' }}>
        <div className="border-[3px] border-black bg-[#D4A5FF] font-mono text-xs font-black uppercase shadow-[4px_4px_0px_0px_#000] px-3 py-1.5 select-none pointer-events-none transform -rotate-3">
          RABAT ➔ BARCELONA 🇪🇸
        </div>
      </div>

      {/* Main Terminal Box */}
      <div className="w-full max-w-lg relative z-10">
        
        {/* Peeking Mascot */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex justify-center w-full">
          <HeaderMascot />
        </div>

        {/* Terminal Container */}
        <div className="border-4 border-black bg-white shadow-[12px_12px_0px_0px_#000] p-6 sm:p-10 relative">
          
          {/* Brutalist Window Bar */}
          <div className="border-b-[4px] border-black bg-[#FFE600] px-4 py-3 flex items-center justify-between -mx-6 sm:-mx-10 -mt-6 sm:-mt-10 mb-8">
            <div className="flex gap-2">
              <div className="w-3.5 h-3.5 border-2 border-black rounded-full bg-[#FF4D4D]" />
              <div className="w-3.5 h-3.5 border-2 border-black rounded-full bg-[#FFE600]" />
              <div className="w-3.5 h-3.5 border-2 border-black rounded-full bg-[#00E575]" />
            </div>
            <div className="font-mono text-xs font-black uppercase tracking-wider text-black">
              AUTH_PORTAL // 1337_NETWORK
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00E575] border border-black animate-pulse" />
              <span className="font-mono text-[10px] font-black uppercase tracking-wider hidden sm:block">LIVE</span>
            </div>
          </div>

          {/* Title & Identity */}
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-black mb-4">
              STUDENTS TRACKER
            </h1>
            <div className="flex justify-center mb-5">
              <span className="bg-[#B48EEA] border-[3px] border-black px-3 py-1 font-mono text-xs sm:text-sm font-black uppercase shadow-[3px_3px_0px_0px_#000] text-black">
                ✦ FROM MOROCCO TO THE 42 WORLD
              </span>
            </div>
            <p className="font-mono text-sm sm:text-base text-black/80 font-bold leading-relaxed max-w-sm mx-auto">
              Automated mobility & transfer radar across Moroccan 1337 campuses and the global 42 Network.
            </p>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => signIn('42-school', { callbackUrl: '/dashboard' })}
            className="w-full border-[4px] border-black bg-[#00F0FF] hover:bg-[#FFE600] text-black font-mono font-black text-lg uppercase py-4 px-6 shadow-[6px_6px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-3 group focus-visible:outline-4 focus-visible:outline-black focus-visible:outline-offset-4"
          >
            <span className="border-2 border-black bg-white px-2 py-0.5 text-xs group-hover:bg-[#FF4D4D] group-hover:text-white transition-colors">
              [42]
            </span>
            SIGN IN WITH INTRA ➔
          </button>

          {/* Footer Notice */}
          <div className="mt-8 pt-5 border-t-4 border-black/10 text-center">
            <span className="font-mono text-[10px] sm:text-xs font-black text-black/40 uppercase tracking-widest">
              RESTRICTED ACCESS • VERIFIED 42 INTRA ACCOUNTS ONLY
            </span>
          </div>

        </div>
      </div>
    </main>
  );
}
