"use client";

import { useEffect, useState } from "react";

interface FlagParticle {
  id: number;
  left: string;
  size: number;
  delay: string;
  duration: string;
  swayDistance: string;
  driftDistance: string;
  midRotation: string;
  endRotation: string;
  waveSpeed: string;
  blur: string;
  scale: number;
}

export function FloatingWavingFlags() {
  const [particles, setParticles] = useState<FlagParticle[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Generate 6 flags with randomized paths, delays, durations, and 3D depth params to make it more elegant and less dense
    const generated: FlagParticle[] = Array.from({ length: 6 }).map((_, i) => {
      // Vary starting horizontal position (spread evenly across viewport width)
      const left = `${15 + (i * 14) + Math.random() * 8}%`;
      
      // Sizes ranging from small (background) to larger (foreground)
      const scaleChoices = [0.75, 0.95, 1.2, 1.4];
      const scaleChoice = scaleChoices[i % scaleChoices.length] ?? 1.0;
      const scale = scaleChoice + Math.random() * 0.15;
      const size = Math.round(40 * scale);

      // Animation parameters with negative delays to ensure instant uniform distribution
      const delays = ["-2s", "-8s", "-14s", "-20s", "-26s", "-32s"];
      const delay = delays[i % delays.length] ?? "-0s";
      
      // Very slow majestic drift times (24s to 38s)
      const duration = `${24 + Math.random() * 12}s`;
      
      // Wave flutter speed (1.8s to 3.0s)
      const waveSpeed = `${1.8 + Math.random() * 1.2}s`;

      // Majestic diagonal drifting breeze: floating up and sweeping leftward
      const swayDistance = `${-100 - Math.random() * 100}px`; // sway leftwards
      const driftDistance = `${-300 - Math.random() * 250}px`; // drift heavily leftwards
      const midRotation = `${-6 - Math.random() * 6}deg`; // tilt slightly in the wind direction
      const endRotation = `${-15 - Math.random() * 12}deg`; // continue pitching as it drifts away

      // Clear flags: keep them extremely sharp and crisp
      const blur = "none";

      return {
        id: i,
        left,
        size,
        delay,
        duration,
        swayDistance,
        driftDistance,
        midRotation,
        endRotation,
        waveSpeed,
        blur,
        scale,
      };
    });

    setParticles(generated);
  }, []);

  if (!isMounted || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-[10]">
      {/* Scoped CSS Keyframe Animations to avoid polluting global scope */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --flag-opacity-theme: 0.32;
        }
        [data-theme="dark"] {
          --flag-opacity-theme: 0.42;
        }

        @keyframes flagFloatUp {
          0% {
            transform: translateY(10vh) translateX(0px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: var(--flag-opacity-theme);
          }
          90% {
            opacity: var(--flag-opacity-theme);
          }
          100% {
            transform: translateY(-110vh) translateX(var(--flag-drift)) rotate(var(--flag-end-rot));
            opacity: 0;
          }
        }

        @keyframes flagWave3D {
          0% {
            transform: perspective(500px) rotateX(10deg) rotateY(-14deg) skewY(1deg) scaleY(0.97);
          }
          25% {
            transform: perspective(500px) rotateX(-8deg) rotateY(12deg) skewY(-2deg) scaleY(1.02);
          }
          50% {
            transform: perspective(500px) rotateX(12deg) rotateY(-18deg) skewY(2deg) scaleY(0.96);
          }
          75% {
            transform: perspective(500px) rotateX(-6deg) rotateY(10deg) skewY(-1deg) scaleY(1.03);
          }
          100% {
            transform: perspective(500px) rotateX(10deg) rotateY(-14deg) skewY(1deg) scaleY(0.97);
          }
        }
      `}} />

      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute transition-opacity duration-1000 ease-in-out"
          style={{
            left: p.left,
            bottom: "-60px",
            width: `${p.size}px`,
            height: `${(p.size * 2) / 3}px`,
            filter: p.blur !== "none" ? `blur(${p.blur})` : undefined,
            // Inline custom properties mapped to keyframe parameters
            "--flag-sway": p.swayDistance,
            "--flag-drift": p.driftDistance,
            "--flag-mid-rot": p.midRotation,
            "--flag-end-rot": p.endRotation,
            animation: `flagFloatUp ${p.duration} linear infinite`,
            animationDelay: p.delay,
            transformStyle: "preserve-3d",
          } as React.CSSProperties}
        >
          {/* Flag 3D wave container */}
          <div
            className="w-full h-full"
            style={{
              animation: `flagWave3D ${p.waveSpeed} ease-in-out infinite`,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Vietnamese Flag Vector */}
            <svg
              viewBox="0 0 300 200"
              className="w-full h-full drop-shadow-[0_6px_16px_rgba(218,37,29,0.35)]"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Flag Red Field */}
              <rect width="300" height="200" rx="6" fill="#da251d" />

              {/* Volumetric shadow gradient overlay to simulate deep cloth folds and lighting changes */}
              <rect width="300" height="200" rx="6" fill="url(#flag-cloth-shadow)" opacity="0.14" />

              {/* Gold Star */}
              <polygon
                points="150,40 168,95 225,95 179,130 196,185 150,151 104,185 121,130 75,95 132,95"
                fill="#ffcd00"
                stroke="#e0b500"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />

              {/* Shared gradients inside each flag SVG */}
              <defs>
                <linearGradient id="flag-cloth-shadow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#000000" />
                  <stop offset="20%" stopColor="#ffffff" stopOpacity="0.4" />
                  <stop offset="40%" stopColor="#000000" stopOpacity="0.8" />
                  <stop offset="60%" stopColor="#ffffff" stopOpacity="0.5" />
                  <stop offset="80%" stopColor="#000000" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.4" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}
