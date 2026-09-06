import React from 'react';

export default function DevCard() {
  return (
    <div className="mt-auto border-2 border-black bg-[#FFE600] p-3 shadow-[3px_3px_0px_0px_#000] flex flex-col gap-2">
      {/* Label & Status */}
      <div className="flex items-center justify-between border-b border-black pb-1">
        <span className="font-mono text-[10px] font-black uppercase tracking-wider text-black">
          CRAFTED BY
        </span>
        <span className="inline-block w-2 h-2 rounded-full bg-[#00E575] border border-black animate-pulse" />
      </div>

      {/* Identity */}
      <div className="flex items-baseline justify-between">
        <span className="font-black text-sm tracking-tight text-black">ILY4S</span>
        <a
          href="https://profile.intra.42.fr/users/irfei"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs font-bold text-black hover:underline"
        >
          @irfei
        </a>
      </div>

      {/* Social / Portfolio Links */}
      <div className="grid grid-cols-3 gap-1.5 pt-1">
        <a
          href="https://profile.intra.42.fr/users/irfei"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center py-1 border border-black bg-white font-mono text-[10px] font-black uppercase shadow-[1px_1px_0px_0px_#000] hover:bg-[#00F0FF] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
        >
          INTRA
        </a>
        <a
          href="https://github.com/Ilyasrf"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center py-1 border border-black bg-white font-mono text-[10px] font-black uppercase shadow-[1px_1px_0px_0px_#000] hover:bg-[#00F0FF] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
        >
          GITHUB
        </a>
        <a
          href="https://www.linkedin.com/in/ilyas-rfei-620014352/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center py-1 border border-black bg-white font-mono text-[10px] font-black uppercase shadow-[1px_1px_0px_0px_#000] hover:bg-[#00F0FF] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
        >
          LINKEDIN
        </a>
      </div>
    </div>
  );
}
