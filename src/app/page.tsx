"use client";

import { motion } from "framer-motion";
import StarsBackground from "@/components/StarsBackground";
import LoginButton from "@/components/LoginButton";

export default function HomePage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <StarsBackground />

      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="neon-text">Track Your Journey</span>
            <br />
            <span className="text-white/90">Beyond 1337</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <p className="text-lg md:text-xl text-white/60 mb-10 max-w-lg mx-auto">
            Connect with Moroccan students in the transfer process to 42 campuses
            worldwide.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="glass p-8 max-w-md mx-auto">
            <LoginButton />
            <p className="text-xs text-white/30 mt-4">
              Secured via 42 Intra authentication
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
