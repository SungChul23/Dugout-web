import React, { useMemo } from 'react';

interface PostseasonBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

export const PostseasonBackground: React.FC<PostseasonBackgroundProps> = ({ children, className = '' }) => {
  // 14개의 은은하고 우아한 단풍잎 파티클 데이터 생성 (적당한 갯수 & 투명도)
  const leaves = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      left: `${(i * 7.1 + (i % 4) * 4.3) % 96}%`,
      size: 18 + (i % 4) * 6, // 18px ~ 36px
      duration: 10 + (i % 5) * 2.5, // 10s ~ 20s (천천히 흩날림)
      delay: (i % 7) * 1.2,
      rotation: (i * 53) % 360,
      opacity: 0.45 + (i % 3) * 0.12, // 0.45 ~ 0.69 (은은한 투명도)
      color: i % 4 === 0 ? '#f97316' : i % 4 === 1 ? '#f59e0b' : i % 4 === 2 ? '#ef4444' : '#fbbf24', // Vivid Orange, Amber, Red, Gold
    }));
  }, []);

  // 관중석 반짝이 플래시 18개
  const flashes = useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: `${5 + (i * 5.3) % 90}%`,
      bottom: `${4 + (i % 5) * 3.5}%`,
      delay: (i * 0.4) % 3,
      duration: 1.5 + (i % 4) * 0.5,
    }));
  }, []);

  return (
    <div className={`relative min-h-screen bg-[#080a14] text-slate-100 overflow-hidden ${className}`}>
      {/* Background Atmosphere Gradient Layer */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle at 50% 10%, rgba(217, 119, 6, 0.18) 0%, rgba(153, 27, 27, 0.12) 35%, rgba(10, 14, 26, 0.95) 75%, #060810 100%)'
        }}
      />

      {/* Dynamic Swaying Stadium Spotlights & Light Towers */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Ambient Top Glow Orbs */}
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -top-24 right-1/4 w-96 h-96 bg-red-600/15 rounded-full blur-[120px] pointer-events-none" />

        {/* 1. Left Swaying Spotlight Beam */}
        <div 
          className="absolute -top-10 left-10 md:left-24 w-80 md:w-96 h-[900px] origin-top-left animate-spotlight-sway-left opacity-30 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.45) 0%, rgba(245, 158, 11, 0.12) 45%, transparent 80%)',
            clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)',
            filter: 'blur(15px)'
          }}
        />

        {/* 2. Right Swaying Spotlight Beam */}
        <div 
          className="absolute -top-10 right-10 md:right-24 w-80 md:w-96 h-[900px] origin-top-right animate-spotlight-sway-right opacity-30 pointer-events-none"
          style={{
            background: 'linear-gradient(-135deg, rgba(239, 68, 68, 0.45) 0%, rgba(217, 119, 6, 0.12) 45%, transparent 80%)',
            clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)',
            filter: 'blur(15px)'
          }}
        />

        {/* 3. Center Sweeping Gold Spotlight Beam */}
        <div 
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[1000px] origin-top animate-spotlight-sway-center opacity-25 pointer-events-none"
          style={{
            background: 'conic-gradient(from 180deg at 50% 0%, transparent 160deg, rgba(252, 211, 77, 0.35) 180deg, transparent 200deg)',
            filter: 'blur(20px)'
          }}
        />
      </div>

      {/* Falling Maple Leaves Particles Layer (z-30 pointer-events-none) */}
      <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
        {leaves.map((leaf) => (
          <div
            key={leaf.id}
            className="absolute top-[-60px] animate-fall-sway filter drop-shadow-[0_4px_14px_rgba(245,158,11,0.7)]"
            style={{
              left: leaf.left,
              width: `${leaf.size}px`,
              height: `${leaf.size}px`,
              opacity: leaf.opacity,
              animationDuration: `${leaf.duration}s`,
              animationDelay: `${leaf.delay}s`,
              color: leaf.color,
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full transform hover:rotate-12 transition-transform">
              <path d="M12 2L13.8 6.5L17.5 4.5L16.2 8.8L21 9.5L17.8 13L21.5 16.5L16.8 16.2L16 21L12.5 17.5L12 22L11.5 17.5L8 21L7.2 16.2L2.5 16.5L6.2 13L3 9.5L7.8 8.8L6.5 4.5L10.2 6.5L12 2Z" />
            </svg>
          </div>
        ))}
      </div>

      {/* Stadium Crowd Silhouette & Camera Flashes at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 h-32 md:h-44 pointer-events-none z-0 flex flex-col justify-end">
        {/* Stadium Seating Lights Sparkle / Camera Flashes */}
        <div className="absolute inset-x-0 bottom-12 h-20 overflow-hidden prefers-reduced-motion-hidden">
          {flashes.map((flash) => (
            <div
              key={flash.id}
              className="absolute w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-amber-200 animate-stadium-flash shadow-[0_0_8px_#fef08a]"
              style={{
                left: flash.left,
                bottom: flash.bottom,
                animationDelay: `${flash.delay}s`,
                animationDuration: `${flash.duration}s`,
              }}
            />
          ))}
        </div>

        {/* Crowd Silhouette Graphic */}
        <div className="w-full h-24 md:h-36 opacity-35 text-[#05070e]">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full fill-current">
            <path d="M0 120 L0 80 Q 30 70, 60 78 Q 90 65, 120 75 Q 150 60, 180 72 Q 210 55, 240 70 Q 270 65, 300 78 Q 330 60, 360 74 Q 390 50, 420 68 Q 450 60, 480 75 Q 510 55, 540 70 Q 570 62, 600 76 Q 630 50, 660 68 Q 690 60, 720 74 Q 750 55, 780 70 Q 810 65, 840 78 Q 870 58, 900 72 Q 930 62, 960 75 Q 990 50, 1020 68 Q 1050 60, 1080 74 Q 1110 55, 1140 70 Q 1170 65, 1200 80 L 1200 120 Z" />
          </svg>
        </div>
      </div>

      {/* Custom Keyframe CSS for Swaying Spotlights & Particle Animations */}
      <style>{`
        @keyframes spotlightSwayLeft {
          0%, 100% {
            transform: rotate(-15deg) scaleX(1);
            opacity: 0.25;
          }
          50% {
            transform: rotate(20deg) scaleX(1.2);
            opacity: 0.55;
          }
        }

        @keyframes spotlightSwayRight {
          0%, 100% {
            transform: rotate(15deg) scaleX(1.1);
            opacity: 0.5;
          }
          50% {
            transform: rotate(-18deg) scaleX(0.9);
            opacity: 0.2;
          }
        }

        @keyframes spotlightSwayCenter {
          0%, 100% {
            transform: translateX(-50%) rotate(-12deg);
            opacity: 0.2;
          }
          50% {
            transform: translateX(-50%) rotate(12deg);
            opacity: 0.45;
          }
        }

        @keyframes fallSway {
          0% {
            transform: translateY(0) rotate(0deg) translateX(0);
          }
          25% {
            transform: translateY(25vh) rotate(90deg) translateX(25px);
          }
          50% {
            transform: translateY(50vh) rotate(180deg) translateX(-20px);
          }
          75% {
            transform: translateY(75vh) rotate(270deg) translateX(30px);
          }
          100% {
            transform: translateY(105vh) rotate(360deg) translateX(-10px);
          }
        }

        @keyframes stadiumFlash {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1.6); }
        }

        .animate-spotlight-sway-left {
          animation: spotlightSwayLeft 9s ease-in-out infinite;
        }

        .animate-spotlight-sway-right {
          animation: spotlightSwayRight 11s ease-in-out infinite;
        }

        .animate-spotlight-sway-center {
          animation: spotlightSwayCenter 14s ease-in-out infinite;
        }

        .animate-fall-sway {
          animation: fallSway linear infinite;
        }

        .animate-stadium-flash {
          animation: stadiumFlash ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .prefers-reduced-motion-hidden {
            display: none !important;
          }
        }
      `}</style>

      {/* Main Content Container */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
