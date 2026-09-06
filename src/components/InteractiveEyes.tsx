"use client";

import { useEffect, useRef, useState } from "react";

export default function InteractiveEyes() {
  const leftEyeRef = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);

  const [leftPupilPos, setLeftPupilPos] = useState({ x: 0, y: 0 });
  const [rightPupilPos, setRightPupilPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      // Use requestAnimationFrame to throttle the updates to 60fps
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      
      animationFrameId = requestAnimationFrame(() => {
        const updateEye = (eyeRef: React.RefObject<HTMLDivElement>, setPupil: (pos: {x: number, y: number}) => void) => {
          if (!eyeRef.current) return;
          const rect = eyeRef.current.getBoundingClientRect();
          const eyeCenterX = rect.left + rect.width / 2;
          const eyeCenterY = rect.top + rect.height / 2;

          const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX);
          // Maximum distance the pupil can travel from the center
          const maxDist = 5; 
          
          const x = Math.cos(angle) * maxDist;
          const y = Math.sin(angle) * maxDist;

          setPupil({ x, y });
        };

        updateEye(leftEyeRef, setLeftPupilPos);
        updateEye(rightEyeRef, setRightPupilPos);
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="group border-[3px] border-black bg-[#FFE600] p-3 shadow-[4px_4px_0px_0px_#000] flex gap-4 justify-center items-center hover:scale-105 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000] transition-all cursor-default select-none">
      <div className="font-black uppercase tracking-tight text-sm text-black flex-1 text-center group-hover:tracking-widest transition-all">INTRA EYE</div>
      <div className="flex gap-2 shrink-0">
        <div ref={leftEyeRef} className="w-7 h-9 bg-white border-[3px] border-black rounded-full relative overflow-hidden flex items-center justify-center">
          <div 
            className="w-3 h-3 bg-black rounded-full absolute"
            style={{ transform: `translate3d(${leftPupilPos.x}px, ${leftPupilPos.y}px, 0)` }}
          />
        </div>
        <div ref={rightEyeRef} className="w-7 h-9 bg-white border-[3px] border-black rounded-full relative overflow-hidden flex items-center justify-center">
          <div 
            className="w-3 h-3 bg-black rounded-full absolute"
            style={{ transform: `translate3d(${rightPupilPos.x}px, ${rightPupilPos.y}px, 0)` }}
          />
        </div>
      </div>
    </div>
  );
}
