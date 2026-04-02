import React from 'react';
import { motion } from 'framer-motion';

const MOCK_PLAYERS = [
  { id: 'p', name: '류현진', team: '한화 이글스', teamColor: '#FF6600', stat1: 'ERA 2.15', stat2: '15승 3패', img: 'https://picsum.photos/seed/ryu/200/200', x: 50, y: 50 },
  { id: 'c', name: '양의지', team: '두산 베어스', teamColor: '#1D3A8A', stat1: 'AVG .320', stat2: '25HR', img: 'https://picsum.photos/seed/yang/200/200', x: 50, y: 92 },
  { id: '1b', name: '오스틴', team: 'LG 트윈스', teamColor: '#C30452', stat1: 'AVG .310', stat2: '30HR', img: 'https://picsum.photos/seed/austin/200/200', x: 78, y: 48 },
  { id: '2b', name: '김혜성', team: '키움 히어로즈', teamColor: '#570514', stat1: 'AVG .335', stat2: '40SB', img: 'https://picsum.photos/seed/kimh/200/200', x: 65, y: 30 },
  { id: '3b', name: '김도영', team: 'KIA 타이거즈', teamColor: '#EA0029', stat1: 'AVG .340', stat2: '35HR 35SB', img: 'https://picsum.photos/seed/kimd/200/200', x: 22, y: 48 },
  { id: 'ss', name: '박찬호', team: 'KIA 타이거즈', teamColor: '#EA0029', stat1: 'AVG .305', stat2: '30SB', img: 'https://picsum.photos/seed/park/200/200', x: 35, y: 30 },
  { id: 'lf', name: '에레디아', team: 'SSG 랜더스', teamColor: '#CE0E2D', stat1: 'AVG .350', stat2: '20HR', img: 'https://picsum.photos/seed/eredia/200/200', x: 15, y: 15 },
  { id: 'cf', name: '홍창기', team: 'LG 트윈스', teamColor: '#C30452', stat1: 'OBP .440', stat2: '100R', img: 'https://picsum.photos/seed/hong/200/200', x: 50, y: 5 },
  { id: 'rf', name: '로하스', team: 'KT 위즈', teamColor: '#FFFFFF', stat1: 'AVG .325', stat2: '35HR', img: 'https://picsum.photos/seed/rojas/200/200', x: 85, y: 15 },
  { id: 'dh', name: '최형우', team: 'KIA 타이거즈', teamColor: '#EA0029', stat1: 'AVG .315', stat2: '100RBI', img: 'https://picsum.photos/seed/choi/200/200', x: 88, y: 85 },
];

const PlayerCard = ({ player }: { player: any }) => {
  return (
    <motion.div
      className="absolute flex flex-col items-center justify-center w-[80px] sm:w-24 md:w-32 -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
      style={{ left: `${player.x}%`, top: `${player.y}%` }}
      whileHover={{ scale: 1.15, zIndex: 50 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="relative group w-full">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-yellow-500/0 group-hover:bg-yellow-500/50 blur-xl rounded-xl transition-all duration-300"></div>
        
        {/* Card Body */}
        <div className="relative bg-[#0f172a]/80 backdrop-blur-md border border-white/10 group-hover:border-yellow-400/80 rounded-xl overflow-hidden shadow-2xl transition-all duration-300">
          {/* Top color bar */}
          <div className="h-1.5 w-full" style={{ backgroundColor: player.teamColor }}></div>
          
          <div className="p-1.5 md:p-2 flex flex-col items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-[#1e293b] mb-1.5 group-hover:border-yellow-400 transition-colors">
              <img src={player.img} alt={player.name} className="w-full h-full object-cover" />
            </div>
            
            <h4 className="text-white font-black text-xs sm:text-sm md:text-base whitespace-nowrap">{player.name}</h4>
            <p className="text-[9px] sm:text-[10px] md:text-xs text-slate-400 mb-1 whitespace-nowrap" style={{ color: player.teamColor === '#FFFFFF' ? '#e2e8f0' : player.teamColor }}>{player.team}</p>
            
            <div className="w-full bg-[#1e293b] rounded-md p-1 mt-0.5 text-center">
              <p className="text-[9px] sm:text-[10px] md:text-xs text-yellow-400 font-bold leading-tight">{player.stat1}</p>
              <p className="text-[9px] sm:text-[10px] md:text-xs text-slate-300 font-medium leading-tight">{player.stat2}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const GoldenGlovePrediction: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#02040a] pt-24 pb-12 px-4 overflow-hidden relative">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-yellow-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Title Section */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-700 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">
              골든글러브 / MVP 예측
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-sm md:text-base font-medium"
          >
            AI 데이터 분석 기반 2026 시즌 포지션별 최고 선수 예측
          </motion.p>
        </div>

        {/* Baseball Diamond Layout */}
        <div className="relative w-full max-w-4xl mx-auto aspect-square mt-8 md:mt-16">
          
          {/* Diamond Graphics */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Dirt path / Infield diamond */}
            <div className="w-[50%] aspect-square border-2 border-[#8B5A2B]/40 rotate-45 rounded-lg shadow-[0_0_50px_rgba(139,90,43,0.1)]"></div>
            
            {/* Bases */}
            <div className="absolute w-4 h-4 md:w-6 md:h-6 bg-white/80 rotate-45 shadow-[0_0_15px_rgba(255,255,255,0.6)]" style={{ top: '85.35%', left: '50%', transform: 'translate(-50%, -50%) rotate(45deg)' }}></div> {/* Home */}
            <div className="absolute w-4 h-4 md:w-6 md:h-6 bg-white/80 rotate-45 shadow-[0_0_15px_rgba(255,255,255,0.6)]" style={{ top: '50%', left: '85.35%', transform: 'translate(-50%, -50%) rotate(45deg)' }}></div> {/* 1B */}
            <div className="absolute w-4 h-4 md:w-6 md:h-6 bg-white/80 rotate-45 shadow-[0_0_15px_rgba(255,255,255,0.6)]" style={{ top: '14.65%', left: '50%', transform: 'translate(-50%, -50%) rotate(45deg)' }}></div> {/* 2B */}
            <div className="absolute w-4 h-4 md:w-6 md:h-6 bg-white/80 rotate-45 shadow-[0_0_15px_rgba(255,255,255,0.6)]" style={{ top: '50%', left: '14.65%', transform: 'translate(-50%, -50%) rotate(45deg)' }}></div> {/* 3B */}
            
            {/* Pitcher's Mound */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-[#8B5A2B]/30 rounded-full border border-[#8B5A2B]/50"></div>
          </div>

          {/* Player Cards */}
          {MOCK_PLAYERS.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, type: 'spring', stiffness: 200, damping: 20 }}
            >
              <PlayerCard player={player} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GoldenGlovePrediction;
