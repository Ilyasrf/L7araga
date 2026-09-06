export default function WorldMapHeaderBg() {
  return (
    <div className="absolute inset-0 z-0 opacity-35 pointer-events-none overflow-hidden flex items-center justify-center select-none">
      <div 
        className="w-[1400px] h-[700px] relative transition-transform duration-700" 
        style={{ transform: "perspective(800px) rotateX(20deg) scale(1.1) translateY(-10%)" }}
      >
        <svg viewBox="0 0 1000 500" width="100%" height="100%" className="absolute inset-0">
          
          {/* Dotted Grid Texture */}
          <pattern id="dotGrid" x="0" y="0" width="15" height="15" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="#000" opacity="0.2" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#dotGrid)" />
        </svg>

        {/* Real World Map Vector */}
        <div className="absolute inset-0 opacity-50 flex items-center justify-center">
          <img src="/world-map.svg" alt="World Map" className="w-[1000px] h-auto grayscale contrast-200" />
        </div>

        {/* Overlay Pins and Arcs */}
        <svg viewBox="0 0 1000 500" width="100%" height="100%" className="absolute inset-0 z-10">

          {/* Mobility Arcs */}
          <g fill="none" stroke="#FFE600" strokeWidth="4" strokeDasharray="8 6" className="animate-pulse">
            {/* Morocco to Paris */}
            <path d="M445,210 Q470,150 490,130" />
            {/* Morocco to Amsterdam */}
            <path d="M445,210 Q490,140 515,110" />
            {/* Morocco to Lyon */}
            <path d="M445,210 Q495,160 510,140" />
            {/* Morocco to Barcelona */}
            <path d="M445,210 Q475,180 480,165" />
          </g>

          {/* Origin Hub (Morocco) */}
          <g transform="translate(445, 210)">
            <circle cx="0" cy="0" r="25" fill="#FF4D4D" opacity="0.3" className="animate-ping" style={{ animationDuration: "3s" }} />
            <circle cx="0" cy="0" r="10" fill="#FFE600" stroke="#000" strokeWidth="3" />
            <circle cx="0" cy="0" r="4" fill="#000" />
          </g>

          {/* Destination Hubs (Europe) */}
          <g stroke="#000" strokeWidth="2">
            {/* Paris */}
            <circle cx="490" cy="130" r="6" fill="#00F0FF" />
            {/* Amsterdam */}
            <circle cx="515" cy="110" r="6" fill="#00F0FF" />
            {/* Lyon */}
            <circle cx="510" cy="140" r="6" fill="#00F0FF" />
            {/* Barcelona */}
            <circle cx="480" cy="165" r="6" fill="#00F0FF" />
          </g>
        </svg>
      </div>
    </div>
  );
}
