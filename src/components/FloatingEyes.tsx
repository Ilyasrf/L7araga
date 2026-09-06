"use client";

import { useEffect, useRef, useState } from "react";

interface EyeProps {
  size: number;
  color?: string; // Optional eye white color (e.g. yellow)
  pupilSize?: number;
}

export function TrackingEye({ size = 40, color = "#FFF", pupilSize = 0.4 }: EyeProps) {
  const eyeRef = useRef<HTMLDivElement>(null);
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      animationFrameId = requestAnimationFrame(() => {
        if (!eyeRef.current) return;
        const rect = eyeRef.current.getBoundingClientRect();
        const eyeCenterX = rect.left + rect.width / 2;
        const eyeCenterY = rect.top + rect.height / 2;

        const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX);
        const maxDist = size * 0.15; // Limit pupil travel
        
        const x = Math.cos(angle) * maxDist;
        const y = Math.sin(angle) * maxDist;

        setPupilPos({ x, y });
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [size]);

  return (
    <div 
      ref={eyeRef}
      className="border-[3px] border-black rounded-full relative overflow-hidden flex items-center justify-center shadow-[2px_2px_0px_0px_#000]"
      style={{ width: size, height: size, backgroundColor: color }}
    >
      <div 
        className="bg-black rounded-full absolute"
        style={{ 
          width: size * pupilSize, 
          height: size * pupilSize,
          transform: `translate3d(${pupilPos.x}px, ${pupilPos.y}px, 0)` 
        }}
      />
    </div>
  );
}

export function FloatingEyesBackground() {
  // A cluster of floating eyes randomly placed
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Eye cluster 1 (Top Left) */}
      <div className="absolute top-10 left-10 flex gap-1 transform -rotate-12">
        <TrackingEye size={40} />
        <TrackingEye size={40} />
      </div>
      
      {/* Eye cluster 2 (Center Right) */}
      <div className="absolute top-1/3 right-20 flex gap-2 transform rotate-6">
        <TrackingEye size={60} />
        <TrackingEye size={60} />
      </div>

      {/* Eye cluster 3 (Bottom Left) */}
      <div className="absolute bottom-20 left-32 flex gap-1 transform rotate-45">
        <TrackingEye size={30} />
        <TrackingEye size={30} />
      </div>

      {/* Solo Eye (Top Right) */}
      <div className="absolute top-16 right-1/3">
        <TrackingEye size={25} />
      </div>

      {/* Big Yellow Eyes (Bottom Right) */}
      <div className="absolute bottom-10 right-1/4 flex gap-1">
        <TrackingEye size={80} color="#FFE600" />
        <TrackingEye size={80} color="#FFE600" />
      </div>
    </div>
  );
}
