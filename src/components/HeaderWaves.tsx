export default function HeaderWaves() {
  return (
    <div 
      className="absolute inset-0 pointer-events-none" 
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='60' viewBox='0 0 120 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 30 Q 30 -10, 60 30 T 120 30' fill='none' stroke='black' stroke-width='14' stroke-linecap='round' transform='translate(5, 5)'/%3E%3Cpath d='M0 30 Q 30 -10, 60 30 T 120 30' fill='none' stroke='%23FFE600' stroke-width='14' stroke-linecap='round'/%3E%3C/svg%3E")`,
        backgroundSize: "120px 60px",
        backgroundRepeat: "repeat-x",
        backgroundPosition: "center",
        animation: "wave-slide 4s linear infinite"
      }}
    >
      <style>{`
        @keyframes wave-slide {
          from { background-position-x: 0px; }
          to { background-position-x: -120px; }
        }
      `}</style>
    </div>
  );
}
