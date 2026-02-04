
import React, { useEffect, useState } from 'react';
import { TEAMS } from '../constants';

const CARD_WIDTH = 220; // Reduced from 260
const CARD_HEIGHT = 340; // Reduced from 380
const RADIUS = 600; // Adjusted radius for the smaller card sizes

const AnalysisRing: React.FC = () => {
  const [rotation, setRotation] = useState(0);

  // Auto-rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => prev - 0.25);
    }, 16);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[400px] md:h-[600px] flex items-center justify-center overflow-visible perspective-container my-4 md:my-12">
      
      {/* Central Analysis Zone (Strike Zone) - Focus Point */}
      <div className="absolute z-20 w-[240px] h-[360px] pointer-events-none">
        {/* Glass Backdrop */}
        <div className="absolute inset-0 bg-brand-accent/5 backdrop-blur-[4px] border border-white/10 rounded-xl shadow-[0_0_50px_rgba(6,182,212,0.15)]"></div>
        
        {/* 3x3 Grid Overlay */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="border border-brand-accent/30"></div>
          ))}
        </div>

        {/* Outer Brackets */}
        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-brand-accent rounded-tl-sm"></div>
        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-brand-accent rounded-tr-sm"></div>
        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-brand-accent rounded-bl-sm"></div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-brand-accent rounded-br-sm"></div>

        {/* Live Analysis Badge */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-brand-accent/40 px-3 py-1 rounded text-[9px] font-mono tracking-[0.3em] text-brand-accent uppercase whitespace-nowrap">
          Live Analysis
        </div>

        {/* Scanning Line */}
        <div className="absolute left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-[scan_3s_ease-in-out_infinite] opacity-60"></div>
      </div>

      {/* 3D Rotating Ring */}
      <div 
        className="relative w-full h-full transform-style-3d transition-transform duration-75 ease-linear"
        style={{ transform: `rotateY(${rotation}deg)` }}
      >
        {TEAMS.map((team, index) => {
          const angle = (360 / TEAMS.length) * index;
          
          return (
            <div
              key={team.id}
              className="absolute top-1/2 left-1/2 transform-style-3d backface-visible"
              style={{
                width: `${CARD_WIDTH}px`,
                height: `${CARD_HEIGHT}px`,
                marginLeft: `-${CARD_WIDTH / 2}px`,
                marginTop: `-${CARD_HEIGHT / 2}px`,
                transform: `rotateY(${angle}deg) translateZ(${RADIUS}px)`,
              }}
            >
              <div className="w-full h-full relative group transition-transform duration-500 hover:scale-105">
                <div 
                  className={`
                    w-full h-full bg-slate-950/80 backdrop-blur-md border border-white/5 rounded-2xl 
                    flex flex-col p-6 transition-all duration-300
                    group-hover:border-brand-accent/40 group-hover:bg-slate-900/90
                    shadow-[0_20px_40px_rgba(0,0,0,0.4)]
                  `}
                >
                  {/* Rank & Status Dot */}
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-2xl font-black text-white/10 font-mono tracking-tighter">#{team.rank}</span>
                    <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor] ${team.rank <= 3 ? 'text-blue-500 bg-blue-500' : team.rank <= 6 ? 'text-red-500 bg-red-500' : 'text-slate-600 bg-slate-600'}`}></div>
                  </div>

                  {/* Team Code */}
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <h3 className="text-3xl font-black italic tracking-tighter text-white font-sans uppercase">
                      {team.code}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-1 tracking-widest">{team.name}</p>
                  </div>

                  {/* Stats Section */}
                  <div className="mt-auto pt-5 border-t border-white/5 space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Win Rate</span>
                      <span className="text-lg font-bold text-brand-accent font-mono leading-none">{team.winRate}</span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-brand-primary to-brand-accent shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                        style={{ width: `${team.winRate * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Decorative Floor */}
      <div 
        className="absolute bottom-[-100px] w-[1000px] h-[1000px] rounded-full opacity-5 transform rotate-x-90 pointer-events-none"
        style={{ 
          background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(0,0,0,0) 70%)',
          border: '1px solid rgba(255,255,255,0.05)'
        }}
      ></div>
    </div>
  );
};

export default AnalysisRing;
