export default function HeaderWaves() {
  // A long path that repeats the wave enough to safely translate for the drop shadow without clipping at the edges
  const longPath = "M-120 30 Q -90 -10, -60 30 T 0 30 Q 30 -10, 60 30 T 120 30 Q 150 -10, 180 30 T 240 30";
  
  const createWaveSvg = (color: string, shadow: boolean) => {
    return `url("data:image/svg+xml,%3Csvg width='120' height='60' viewBox='0 0 120 60' xmlns='http://www.w3.org/2000/svg'%3E${
      shadow ? `%3Cpath d='${longPath}' fill='none' stroke='black' stroke-width='14' stroke-linecap='round' transform='translate(5, 5)'/%3E` : ''
    }%3Cpath d='${longPath}' fill='none' stroke='${encodeURIComponent(color)}' stroke-width='14' stroke-linecap='round'/%3E%3C/svg%3E")`;
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Back Wave (Slowest) */}
      <div 
        className="absolute top-[-5px] left-0 right-0 h-full opacity-60 mix-blend-overlay"
        style={{
          backgroundImage: createWaveSvg('#ffffff', false),
          backgroundSize: "120px 60px",
          backgroundRepeat: "repeat-x",
          backgroundPosition: "center",
          animation: "wave-slide-right 8s linear infinite"
        }}
      />
      
      {/* Middle Wave (Medium) */}
      <div 
        className="absolute top-[5px] left-0 right-0 h-full opacity-80"
        style={{
          backgroundImage: createWaveSvg('#00F0FF', true),
          backgroundSize: "120px 60px",
          backgroundRepeat: "repeat-x",
          backgroundPosition: "center",
          animation: "wave-slide-left 6s linear infinite"
        }}
      />

      {/* Front Wave (Fastest, Yellow) */}
      <div 
        className="absolute top-[10px] left-0 right-0 h-full"
        style={{
          backgroundImage: createWaveSvg('#FFE600', true),
          backgroundSize: "120px 60px",
          backgroundRepeat: "repeat-x",
          backgroundPosition: "center",
          animation: "wave-slide-right 4s linear infinite"
        }}
      />

      <style>{`
        @keyframes wave-slide-right {
          from { background-position-x: 0px; }
          to { background-position-x: -120px; }
        }
        @keyframes wave-slide-left {
          from { background-position-x: 0px; }
          to { background-position-x: 120px; }
        }
      `}</style>
    </div>
  );
}
