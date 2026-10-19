import React, { useMemo } from 'react';

export const CosmicBackground: React.FC = () => {
  // Generate stable random star coordinates
  const stars = useMemo(() => {
    const list = [];
    for (let i = 0; i < 70; i++) {
      list.push({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: Math.random() * 2.5 + 1,
        opacity: Math.random() * 0.7 + 0.3,
        animDelay: `${(Math.random() * 4).toFixed(1)}s`,
        animDuration: `${(Math.random() * 3 + 2).toFixed(1)}s`,
        isCross: i % 12 === 0, // Some 4-point sparkle stars
      });
    }
    return list;
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden bg-[#0a0614]">
      {/* Deep purple nebula glow spheres */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-purple-900/20 blur-[140px]" />
      <div className="absolute top-1/4 -right-40 w-[700px] h-[700px] rounded-full bg-fuchsia-900/15 blur-[160px]" />
      <div className="absolute -bottom-40 left-1/3 w-[800px] h-[800px] rounded-full bg-indigo-950/25 blur-[180px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full bg-purple-950/15 blur-[200px]" />

      {/* Starry dots & sparkles */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full transition-opacity"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: star.isCross ? '#f3e8ff' : '#e9d5ff',
            opacity: star.opacity,
            boxShadow: star.isCross ? '0 0 8px 2px rgba(192, 132, 252, 0.8)' : 'none',
          }}
        >
          {star.isCross && (
            <span
              className="absolute -top-1 -left-1 text-[8px] text-purple-200 select-none animate-pulse"
              style={{ animationDelay: star.animDelay, animationDuration: star.animDuration }}
            >
              ✦
            </span>
          )}
        </div>
      ))}
    </div>
  );
};
