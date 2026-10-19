import React from 'react';
import { motion } from 'motion/react';

export const ReviewPlatformIllustration: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Background radial glow */}
      <div className="absolute w-72 h-72 rounded-full bg-purple-600/25 blur-3xl -z-10 animate-pulse" />
      <div className="absolute w-48 h-48 rounded-full bg-fuchsia-500/20 blur-2xl -z-10" />

      {/* SVG 3D Podium & Glowing elements */}
      <svg
        viewBox="0 0 420 380"
        className="w-full max-w-[380px] h-auto drop-shadow-[0_15px_35px_rgba(147,51,234,0.45)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="podiumTop" x1="60" y1="280" x2="360" y2="280" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4c1d95" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#3b0764" />
          </linearGradient>

          <linearGradient id="podiumBase" x1="60" y1="280" x2="60" y2="350" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#581c87" />
            <stop offset="60%" stopColor="#2e1065" />
            <stop offset="100%" stopColor="#0f0529" />
          </linearGradient>

          <linearGradient id="neonRim" x1="60" y1="280" x2="360" y2="280" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#9333ea" stopOpacity="0.8" />
          </linearGradient>

          <linearGradient id="starPill" x1="120" y1="90" x2="300" y2="150" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.95" />
          </linearGradient>

          <linearGradient id="heartBubble" x1="80" y1="180" x2="180" y2="250" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#4c1d95" />
          </linearGradient>

          <linearGradient id="goldStar" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>

          <linearGradient id="purpleGlowSphere" x1="220" y1="180" x2="320" y2="270" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="50%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#581c87" />
          </linearGradient>

          <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Orbiting cosmic dust and rings */}
        <ellipse
          cx="210"
          cy="285"
          rx="185"
          ry="38"
          stroke="url(#neonRim)"
          strokeWidth="1.5"
          strokeDasharray="4 8"
          strokeOpacity="0.5"
        />
        <ellipse
          cx="210"
          cy="270"
          rx="160"
          ry="28"
          stroke="#c084fc"
          strokeWidth="1"
          strokeOpacity="0.3"
        />

        {/* 3D Platform Cylinder Base */}
        <path
          d="M 60 285 C 60 325, 360 325, 360 285 L 360 330 C 360 370, 60 370, 60 330 Z"
          fill="url(#podiumBase)"
        />

        {/* Podium Top Ellipse */}
        <ellipse cx="210" cy="285" rx="150" ry="32" fill="url(#podiumTop)" />
        <ellipse
          cx="210"
          cy="285"
          rx="150"
          ry="32"
          stroke="url(#neonRim)"
          strokeWidth="3.5"
          filter="url(#glowEffect)"
          opacity="0.85"
        />
        <ellipse cx="210" cy="285" rx="135" ry="26" fill="#240c49" opacity="0.6" />

        {/* Floating 5-Stars Box (Top left-center) */}
        <g transform="translate(100, 85)">
          {/* Card shape */}
          <rect
            x="0"
            y="0"
            width="220"
            height="70"
            rx="20"
            fill="url(#starPill)"
            stroke="#c084fc"
            strokeWidth="2"
            filter="drop-shadow(0 10px 20px rgba(147, 51, 234, 0.5))"
          />
          {/* Pointer indicator */}
          <path d="M 180 70 L 195 85 L 190 70 Z" fill="#4c1d95" />

          {/* 5 Stars */}
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i} transform={`translate(${24 + i * 36}, 20)`}>
              <path
                d="M 15 0 L 19.5 9.5 L 30 11 L 22.5 18.5 L 24.5 29 L 15 24 L 5.5 29 L 7.5 18.5 L 0 11 L 10.5 9.5 Z"
                fill="url(#neonRim)"
                filter="url(#glowEffect)"
                transform="scale(0.85)"
              />
              <path
                d="M 15 0 L 19.5 9.5 L 30 11 L 22.5 18.5 L 24.5 29 L 15 24 L 5.5 29 L 7.5 18.5 L 0 11 L 10.5 9.5 Z"
                fill="#ffffff"
                transform="scale(0.75) translate(2, 2)"
              />
            </g>
          ))}
        </g>

        {/* Floating Heart Speech Bubble (Bottom Left) */}
        <g transform="translate(85, 175)">
          <rect
            x="0"
            y="0"
            width="90"
            height="85"
            rx="24"
            fill="url(#heartBubble)"
            stroke="#f472b6"
            strokeWidth="2"
            filter="drop-shadow(0 10px 25px rgba(244, 114, 182, 0.4))"
          />
          {/* Tail */}
          <path d="M 50 85 L 60 100 L 68 85 Z" fill="#4c1d95" />
          {/* Heart icon */}
          <path
            d="M 45 60 C 45 60, 22 45, 22 32 C 22 24, 28 18, 36 18 C 41 18, 45 22, 45 22 C 45 22, 49 18, 54 18 C 62 18, 68 24, 68 32 C 68 45, 45 60, 45 60 Z"
            fill="#f472b6"
            filter="url(#glowEffect)"
            opacity="0.9"
          />
          <path
            d="M 45 58 C 45 58, 24 43, 24 32 C 24 25, 29 20, 36 20 C 40 20, 45 24, 45 24 C 45 24, 50 20, 54 20 C 61 20, 66 25, 66 32 C 66 43, 45 58, 45 58 Z"
            fill="#ffffff"
          />
        </g>

        {/* Big 3D Star Coin / Disc on the right */}
        <g transform="translate(230, 195)">
          <circle
            cx="48"
            cy="48"
            r="46"
            fill="url(#purpleGlowSphere)"
            stroke="#e9d5ff"
            strokeWidth="2.5"
            filter="drop-shadow(0 12px 30px rgba(168, 85, 247, 0.7))"
          />
          {/* Inner ring */}
          <circle cx="48" cy="48" r="38" stroke="#f3e8ff" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
          {/* Big White/Gold Star */}
          <path
            d="M 48 18 L 57 37 L 77 40 L 62 55 L 66 75 L 48 65 L 30 75 L 34 55 L 19 40 L 39 37 Z"
            fill="#ffffff"
            filter="drop-shadow(0 2px 8px rgba(255, 255, 255, 0.8))"
          />
        </g>

        {/* Twinkling star particles */}
        <g>
          {/* Star 1 */}
          <path d="M 60 120 Q 60 130 50 130 Q 60 130 60 140 Q 60 130 70 130 Q 60 130 60 120" fill="#c084fc" />
          {/* Star 2 */}
          <path d="M 350 100 Q 350 112 338 112 Q 350 112 350 124 Q 350 112 362 112 Q 350 112 350 100" fill="#f472b6" />
          {/* Star 3 */}
          <path d="M 370 230 Q 370 240 360 240 Q 370 240 370 250 Q 370 240 380 240 Q 370 240 370 230" fill="#e9d5ff" />
          {/* Star 4 */}
          <path d="M 40 270 Q 40 278 32 278 Q 40 278 40 286 Q 40 278 48 278 Q 40 278 40 270" fill="#c084fc" />
          {/* Small dots */}
          <circle cx="90" cy="50" r="2.5" fill="#f3e8ff" opacity="0.8" />
          <circle cx="320" cy="40" r="3" fill="#f3e8ff" opacity="0.9" />
          <circle cx="30" cy="190" r="2" fill="#c084fc" opacity="0.7" />
          <circle cx="390" cy="180" r="2.5" fill="#f472b6" opacity="0.8" />
        </g>
      </svg>
    </div>
  );
};
