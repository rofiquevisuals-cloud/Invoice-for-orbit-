import React from 'react';

interface OrbitLogoProps {
  variant?: 'full' | 'mark' | 'horizontal';
  theme?: 'dark' | 'light' | 'print';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const OrbitLogo: React.FC<OrbitLogoProps> = ({
  variant = 'horizontal',
  theme = 'dark',
  className = '',
  size = 'md',
}) => {
  const isLight = theme === 'light' || theme === 'print';

  // Sizing mappings
  const markDimensions = {
    sm: { width: 32, height: 32 },
    md: { width: 42, height: 42 },
    lg: { width: 56, height: 56 },
  }[size];

  const primaryTextColor = isLight ? '#0f172a' : '#ffffff';
  const taglineColor = isLight ? '#64748b' : '#94a3b8';
  const accentLime = '#9be809';
  const accentLimeDark = '#65a30d';

  // Vector mark replicating the Orbit360Hub icon:
  // An 'O' ring with a futuristic dynamic orbital swoop encircling and cutting through it
  const MarkSvg = (
    <svg
      width={markDimensions.width}
      height={markDimensions.height}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform"
      aria-label="Orbit360Hub emblem"
    >
      <defs>
        <linearGradient id="orbitGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d9f99d" />
          <stop offset="35%" stopColor="#a3e635" />
          <stop offset="75%" stopColor="#65a30d" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>

        <linearGradient id="orbitSwoopGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#bef264" />
          <stop offset="50%" stopColor="#a3e635" />
          <stop offset="100%" stopColor="#4ade80" />
        </linearGradient>

        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#84cc16" floodOpacity={isLight ? "0.2" : "0.4"} />
        </filter>
      </defs>

      {/* Main outer ring 'O' body */}
      <circle
        cx="50"
        cy="50"
        r="34"
        stroke="url(#orbitGreenGrad)"
        strokeWidth="15"
        strokeLinecap="round"
        filter="url(#softGlow)"
      />

      {/* Inner dark counter bore */}
      <circle
        cx="50"
        cy="50"
        r="26.5"
        fill="transparent"
      />

      {/* Dynamic 3D Orbit Swoop Ring wrapping around and slashing diagonally */}
      <path
        d="M 12 74 C 10 70, 18 56, 38 46 C 58 36, 80 25, 96 15 C 92 23, 76 39, 56 51 C 36 63, 16 75, 12 74 Z"
        fill="url(#orbitSwoopGrad)"
        opacity="0.95"
      />

      {/* Orbit front lower curvature accent */}
      <path
        d="M 8 72 C 14 84, 34 85, 54 75 C 72 66, 88 52, 94 38 C 95 34, 91 38, 82 46 C 66 59, 44 72, 22 75 C 15 76, 10 74, 8 72 Z"
        fill="url(#orbitGreenGrad)"
      />
    </svg>
  );

  if (variant === 'mark') {
    return <div className={`inline-flex items-center ${className}`}>{MarkSvg}</div>;
  }

  if (variant === 'horizontal') {
    return (
      <div className={`inline-flex items-center gap-3 select-none ${className}`}>
        {MarkSvg}
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-baseline gap-1.5">
            <span
              className="text-lg font-black tracking-tight uppercase"
              style={{ color: primaryTextColor, letterSpacing: '0.04em' }}
            >
              ORBIT
            </span>
            <span
              className="text-lg font-black tracking-tight"
              style={{ color: accentLime, letterSpacing: '0.04em' }}
            >
              360 HUB
            </span>
          </div>
          <span
            className="text-[9px] font-bold tracking-[0.25em] uppercase mt-1"
            style={{ color: taglineColor }}
          >
            BUILD / GROW / SCALE
          </span>
        </div>
      </div>
    );
  }

  // Full stacked variant
  return (
    <div className={`inline-flex flex-col items-center text-center select-none ${className}`}>
      {MarkSvg}
      <div className="mt-2.5 flex flex-col items-center leading-none">
        <span
          className="text-xl font-black tracking-tight uppercase"
          style={{ color: primaryTextColor, letterSpacing: '0.06em' }}
        >
          ORBIT
        </span>
        <span
          className="text-xl font-black tracking-tight mt-0.5"
          style={{ color: accentLime, letterSpacing: '0.06em' }}
        >
          360 HUB
        </span>
        <span
          className="text-[9px] font-bold tracking-[0.28em] uppercase mt-1.5"
          style={{ color: taglineColor }}
        >
          BUILD / GROW / SCALE
        </span>
      </div>
    </div>
  );
};
