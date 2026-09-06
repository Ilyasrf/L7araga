"use client";

import { useEffect, useRef, useState } from "react";

export default function HeaderMascot() {
  const leftEyeRef = useRef<SVGEllipseElement>(null);
  const rightEyeRef = useRef<SVGEllipseElement>(null);

  const [leftPupilPos, setLeftPupilPos] = useState({ x: 0, y: 0 });
  const [rightPupilPos, setRightPupilPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      
      animationFrameId = requestAnimationFrame(() => {
        const updateEye = (eyeRef: React.RefObject<SVGGElement | SVGElement>, setPupil: (pos: {x: number, y: number}) => void) => {
          if (!eyeRef.current) return;
          const rect = eyeRef.current.getBoundingClientRect();
          const eyeCenterX = rect.left + rect.width / 2;
          const eyeCenterY = rect.top + rect.height / 2;

          const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX);
          const maxDist = 4; // max distance pupil can move
          
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
    <div className="relative w-20 h-20 -mb-2 z-10 hover:-translate-y-1 hover:rotate-1 transition-transform cursor-pointer hidden sm:block">
      <svg width="100%" height="100%" viewBox="0 0 100 100" className="overflow-visible" xmlns="http://www.w3.org/2000/svg">
        
        {/* Hands gripping bottom */}
        <g stroke="#000" strokeWidth="4" fill="#FFF">
          <circle cx="20" cy="90" r="8" />
          <path d="M15,90 Q20,80 25,90" fill="none" strokeWidth="3" />
          <circle cx="80" cy="90" r="8" />
          <path d="M75,90 Q80,80 85,90" fill="none" strokeWidth="3" />
        </g>

        {/* Head/Body */}
        <path d="M10,85 C10,40 20,20 50,20 C80,20 90,40 90,85 Z" fill="#FF8A3D" stroke="#000" strokeWidth="4" />
        
        {/* Backwards Cap */}
        <path d="M40,20 C40,5 60,5 75,20 Z" fill="#00F0FF" stroke="#000" strokeWidth="4" />
        <path d="M75,18 L95,25 L92,30 L73,23 Z" fill="#00F0FF" stroke="#000" strokeWidth="4" />
        <circle cx="58" cy="8" r="3" fill="#FFE600" stroke="#000" strokeWidth="2" />

        {/* Mouth/Smile */}
        <path d="M30,65 Q50,85 70,65 Z" fill="#FFF" stroke="#000" strokeWidth="4" />
        {/* Teeth lines */}
        <line x1="40" y1="68" x2="40" y2="74" stroke="#000" strokeWidth="3" />
        <line x1="50" y1="71" x2="50" y2="75" stroke="#000" strokeWidth="3" />
        <line x1="60" y1="68" x2="60" y2="74" stroke="#000" strokeWidth="3" />
        
        {/* Left Eye */}
        <g>
          <ellipse ref={leftEyeRef} cx="35" cy="45" rx="10" ry="14" fill="#FFF" stroke="#000" strokeWidth="4" />
          <circle 
            cx="35" 
            cy="45" 
            r="4" 
            fill="#000"
            style={{ transform: `translate3d(${leftPupilPos.x}px, ${leftPupilPos.y}px, 0)` }}
          />
        </g>

        {/* Right Eye */}
        <g>
          <ellipse ref={rightEyeRef} cx="65" cy="45" rx="10" ry="14" fill="#FFF" stroke="#000" strokeWidth="4" />
          <circle 
            cx="65" 
            cy="45" 
            r="4" 
            fill="#000"
            style={{ transform: `translate3d(${rightPupilPos.x}px, ${rightPupilPos.y}px, 0)` }}
          />
        </g>
        
      </svg>
    </div>
  );
}
