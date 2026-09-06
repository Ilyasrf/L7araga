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
        <div 
          className="absolute inset-0 w-full h-full opacity-25"
          style={{
            backgroundImage: 'url(/world-map.svg)',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center 200px',
            backgroundSize: '130% auto',
            filter: 'contrast(120%) brightness(85%)'
          }}
        />

        {/* Overlay Pins and Arcs */}
        <svg viewBox="0 0 1000 500" width="100%" height="100%" className="absolute inset-0 z-10">

          {/* Mobility Arcs */}
          <g fill="none" stroke="#FFE600" strokeWidth="4" strokeDasharray="8 6" className="animate-pulse">
            {/* Morocco to Paris */}
            <path d="M481,417 Q485,370 507,340" />
            {/* Morocco to Amsterdam */}
            <path d="M481,417 Q490,360 514,321" />
            {/* Morocco to Lyon */}
            <path d="M481,417 Q495,380 514,355" />
            {/* Morocco to Barcelona */}
            <path d="M481,417 Q490,390 507,373" />
          </g>

          {/* Origin Hub (Morocco) */}
          <g transform="translate(481, 417)">
            <circle cx="0" cy="0" r="25" fill="#FF4D4D" opacity="0.3" className="animate-ping" style={{ animationDuration: "3s" }} />
            <circle cx="0" cy="0" r="10" fill="#FFE600" stroke="#000" strokeWidth="3" />
            <circle cx="0" cy="0" r="4" fill="#000" />
          </g>

          {/* Destination Hubs (Europe) */}
          <g stroke="#000" strokeWidth="2">
            {/* Paris */}
            <circle cx="507" cy="340" r="6" fill="#00F0FF" />
            {/* Amsterdam */}
            <circle cx="514" cy="321" r="6" fill="#00F0FF" />
            {/* Lyon */}
            <circle cx="514" cy="355" r="6" fill="#00F0FF" />
            {/* Barcelona */}
            <circle cx="507" cy="373" r="6" fill="#00F0FF" />
          </g>
        </svg>
      </div>
    </div>
  );
}
