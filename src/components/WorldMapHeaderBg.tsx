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

      </div>
    </div>
  );
}
