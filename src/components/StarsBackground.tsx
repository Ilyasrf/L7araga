"use client";

import { useMemo } from "react";
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine, ISourceOptions } from "@tsparticles/engine";

const initParticles = async (engine: Engine) => {
  await loadSlim(engine);
};

export default function StarsBackground() {
  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: { enable: true, zIndex: 0 },
      fpsLimit: 60,
      particles: {
        number: {
          value: 1500,
          density: {
            enable: true,
          },
        },
        color: {
          value: ["#ffffff", "#06b6d4", "#a855f7"],
        },
        shape: {
          type: "star",
        },
        opacity: {
          value: { min: 0.1, max: 0.8 },
          animation: {
            enable: true,
            speed: 0.5,
            minimumValue: 0.1,
          },
        },
        size: {
          value: { min: 0.5, max: 2 },
        },
        move: {
          enable: true,
          speed: 0.3,
          direction: "none" as const,
          outModes: {
            default: "out" as const,
          },
        },
        twinkle: {
          enable: true,
          density: 5,
          speed: {
            min: 0.5,
            max: 1,
          },
        },
      },
      detectRetina: true,
      background: {
        color: "transparent",
      },
    }),
    []
  );

  return (
    <ParticlesProvider init={initParticles}>
      <div className="fixed inset-0 -z-10">
        <Particles id="tsparticles" options={options} className="w-full h-full" />
      </div>
    </ParticlesProvider>
  );
}
