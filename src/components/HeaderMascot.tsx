"use client";

import { useEffect, useRef, useState } from "react";

export default function HeaderMascots() {
  // 6 eyes total for 3 mascots
  const eyeRefs = useRef<(SVGEllipseElement | null)[]>([]);
  const [pupils, setPupils] = useState<{x: number, y: number}[]>(Array(6).fill({x:0, y:0}));

  useEffect(() => {
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      animationFrameId = requestAnimationFrame(() => {
        const newPupils = eyeRefs.current.map(eyeRef => {
          if (!eyeRef) return {x: 0, y: 0};
          const rect = eyeRef.getBoundingClientRect();
          const eyeCenterX = rect.left + rect.width / 2;
          const eyeCenterY = rect.top + rect.height / 2;
          const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX);
          const maxDist = 4;
          return {
            x: Math.cos(angle) * maxDist,
            y: Math.sin(angle) * maxDist
          };
        });
        setPupils(newPupils);
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const setRef = (index: number) => (el: SVGEllipseElement | null) => {
    eyeRefs.current[index] = el;
  };

  return (
    <div className="relative w-[260px] h-20 -mb-2 z-10 hover:-translate-y-1 transition-transform cursor-pointer hidden sm:block">
      <svg width="100%" height="100%" viewBox="0 0 300 100" className="overflow-visible" xmlns="http://www.w3.org/2000/svg">
        
        {/* === Mascot 1: Orange Kid === */}
        <g transform="translate(0, 0)">
          <g stroke="#000" strokeWidth="4" fill="#FFF">
            <circle cx="20" cy="90" r="8" />
            <path d="M15,90 Q20,80 25,90" fill="none" strokeWidth="3" />
            <circle cx="80" cy="90" r="8" />
            <path d="M75,90 Q80,80 85,90" fill="none" strokeWidth="3" />
          </g>
          <path d="M10,85 C10,40 20,20 50,20 C80,20 90,40 90,85 Z" fill="#FF8A3D" stroke="#000" strokeWidth="4" />
          <path d="M40,20 C40,5 60,5 75,20 Z" fill="#00F0FF" stroke="#000" strokeWidth="4" />
          <path d="M75,18 L95,25 L92,30 L73,23 Z" fill="#00F0FF" stroke="#000" strokeWidth="4" />
          <circle cx="58" cy="8" r="3" fill="#FFE600" stroke="#000" strokeWidth="2" />
          <path d="M30,65 Q50,85 70,65 Z" fill="#FFF" stroke="#000" strokeWidth="4" />
          <line x1="40" y1="68" x2="40" y2="74" stroke="#000" strokeWidth="3" />
          <line x1="50" y1="71" x2="50" y2="75" stroke="#000" strokeWidth="3" />
          <line x1="60" y1="68" x2="60" y2="74" stroke="#000" strokeWidth="3" />
          <ellipse ref={setRef(0)} cx="35" cy="45" rx="10" ry="14" fill="#FFF" stroke="#000" strokeWidth="4" />
          <circle cx="35" cy="45" r="4" fill="#000" style={{ transform: `translate3d(${pupils[0]?.x||0}px, ${pupils[0]?.y||0}px, 0)` }} />
          <ellipse ref={setRef(1)} cx="65" cy="45" rx="10" ry="14" fill="#FFF" stroke="#000" strokeWidth="4" />
          <circle cx="65" cy="45" r="4" fill="#000" style={{ transform: `translate3d(${pupils[1]?.x||0}px, ${pupils[1]?.y||0}px, 0)` }} />
        </g>

        {/* === Mascot 2: Purple Cat === */}
        <g transform="translate(100, 0)">
          <path d="M15,40 L20,5 L45,30 Z" fill="#D4A5FF" stroke="#000" strokeWidth="4" />
          <path d="M85,40 L80,5 L55,30 Z" fill="#D4A5FF" stroke="#000" strokeWidth="4" />
          <g stroke="#000" strokeWidth="4" fill="#FFF">
            <circle cx="20" cy="90" r="8" />
            <path d="M16,88 L16,92 M20,88 L20,92 M24,88 L24,92" strokeWidth="2" />
            <circle cx="80" cy="90" r="8" />
            <path d="M76,88 L76,92 M80,88 L80,92 M84,88 L84,92" strokeWidth="2" />
          </g>
          <path d="M10,85 C5,50 15,30 50,30 C85,30 95,50 90,85 Z" fill="#D4A5FF" stroke="#000" strokeWidth="4" />
          <line x1="5" y1="60" x2="25" y2="65" stroke="#000" strokeWidth="3" strokeLinecap="round" />
          <line x1="5" y1="70" x2="25" y2="70" stroke="#000" strokeWidth="3" strokeLinecap="round" />
          <line x1="95" y1="60" x2="75" y2="65" stroke="#000" strokeWidth="3" strokeLinecap="round" />
          <line x1="95" y1="70" x2="75" y2="70" stroke="#000" strokeWidth="3" strokeLinecap="round" />
          <path d="M45,65 L55,65 L50,70 Z" fill="#FF4D4D" stroke="#000" strokeWidth="2" />
          <path d="M50,70 Q40,80 35,75 M50,70 Q60,80 65,75" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" />
          <ellipse ref={setRef(2)} cx="35" cy="45" rx="14" ry="14" fill="#FFE600" stroke="#000" strokeWidth="4" />
          <circle cx="35" cy="45" r="5" fill="#000" style={{ transform: `translate3d(${pupils[2]?.x||0}px, ${pupils[2]?.y||0}px, 0)` }} />
          <ellipse ref={setRef(3)} cx="65" cy="45" rx="14" ry="14" fill="#FFE600" stroke="#000" strokeWidth="4" />
          <circle cx="65" cy="45" r="5" fill="#000" style={{ transform: `translate3d(${pupils[3]?.x||0}px, ${pupils[3]?.y||0}px, 0)` }} />
        </g>

        {/* === Mascot 3: Green Dog === */}
        <g transform="translate(200, 0)">
          <path d="M20,30 C0,30 -5,60 15,65 C25,65 30,50 30,30 Z" fill="#00E575" stroke="#000" strokeWidth="4" />
          <path d="M80,30 C100,30 105,60 85,65 C75,65 70,50 70,30 Z" fill="#00E575" stroke="#000" strokeWidth="4" />
          <g stroke="#000" strokeWidth="4" fill="#FFF">
            <circle cx="20" cy="90" r="8" />
            <circle cx="80" cy="90" r="8" />
          </g>
          <path d="M15,85 C15,40 25,25 50,25 C75,25 85,40 85,85 Z" fill="#00E575" stroke="#000" strokeWidth="4" />
          <ellipse cx="50" cy="65" rx="20" ry="15" fill="#FFF" stroke="#000" strokeWidth="4" />
          <ellipse cx="50" cy="60" rx="6" ry="4" fill="#000" />
          <path d="M45,75 C45,90 55,90 55,75 Z" fill="#FF4D4D" stroke="#000" strokeWidth="3" />
          <ellipse ref={setRef(4)} cx="35" cy="40" rx="10" ry="10" fill="#FFF" stroke="#000" strokeWidth="4" />
          <circle cx="35" cy="40" r="4" fill="#000" style={{ transform: `translate3d(${pupils[4]?.x||0}px, ${pupils[4]?.y||0}px, 0)` }} />
          <ellipse ref={setRef(5)} cx="65" cy="40" rx="10" ry="10" fill="#FFF" stroke="#000" strokeWidth="4" />
          <circle cx="65" cy="40" r="4" fill="#000" style={{ transform: `translate3d(${pupils[5]?.x||0}px, ${pupils[5]?.y||0}px, 0)` }} />
        </g>
        
      </svg>
    </div>
  );
}
