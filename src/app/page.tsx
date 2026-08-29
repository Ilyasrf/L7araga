import StarsBackground from "@/components/StarsBackground";
import LoginButton from "@/components/LoginButton";

export default function HomePage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <StarsBackground />

      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          <span className="neon-text">Track Your Journey</span>
          <br />
          <span className="text-white/90">Beyond 1337</span>
        </h1>

        <p className="text-lg md:text-xl text-white/60 mb-10 max-w-lg mx-auto">
          Connect with Moroccan students in the transfer process to 42 campuses
          worldwide.
        </p>

        <div className="glass p-8 max-w-md mx-auto">
          <LoginButton />
          <p className="text-xs text-white/30 mt-4">
            Secured via 42 Intra authentication
          </p>
        </div>
      </div>
    </main>
  );
}
