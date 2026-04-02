import React, { useState } from 'react';
import { Trophy, ChevronLeft, Info, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { TEAMS } from '../constants';

interface GoldenGloveProps {
  onCancel: () => void;
  user: any;
}

interface PredictedWinner {
  position: string;
  name: string;
  team: string;
  stats: string;
  probability: number;
  x: string; // CSS left
  y: string; // CSS bottom
}

const PREDICTIONS: PredictedWinner[] = [
  { position: 'P', name: '???', team: 'KIA 타이거즈', stats: '15승 4패 ERA 2.34', probability: 85.2, x: '50%', y: '35%' },
  { position: 'C', name: '???', team: '두산 베어스', stats: '0.312 20HR 85RBI', probability: 78.4, x: '50%', y: '5%' },
  { position: '1B', name: '???', team: 'LG 트윈스', stats: '0.320 35HR 110RBI', probability: 92.1, x: '80%', y: '35%' },
  { position: '2B', name: '???', team: '키움 히어로즈', stats: '0.335 10HR 45SB', probability: 88.7, x: '65%', y: '55%' },
  { position: '3B', name: '???', team: 'KIA 타이거즈', stats: '0.345 40HR 40SB', probability: 99.9, x: '20%', y: '35%' },
  { position: 'SS', name: '???', team: 'KIA 타이거즈', stats: '0.305 5HR 35SB', probability: 65.3, x: '35%', y: '55%' },
  { position: 'LF', name: '???', team: 'SSG 랜더스', stats: '0.340 25HR 95RBI', probability: 72.8, x: '15%', y: '80%' },
  { position: 'CF', name: '???', team: '삼성 라이온즈', stats: '0.325 30HR 105RBI', probability: 81.5, x: '50%', y: '90%' },
  { position: 'RF', name: '???', team: 'KT 위즈', stats: '0.315 32HR 100RBI', probability: 75.2, x: '85%', y: '80%' },
  { position: 'DH', name: '???', team: 'KIA 타이거즈', stats: '0.295 22HR 90RBI', probability: 68.9, x: '90%', y: '10%' },
];

const GoldenGlove: React.FC<GoldenGloveProps> = ({ onCancel, user }) => {
  const [selectedPlayer, setSelectedPlayer] = useState<PredictedWinner | null>(null);

  const getTeamColor = (teamName: string) => {
    const team = TEAMS.find(t => t.name === teamName);
    return team ? team.color : '#ffffff';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative z-10 w-full min-h-screen pb-20 overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-400/5 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-600/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-[95%] max-w-[1600px] mx-auto px-4 md:px-8 py-12 relative z-10">
        {/* Top Navigation / Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6 border-b border-white/5 pb-8 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center space-x-2 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm">
               <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
               <span className="text-xs md:text-sm font-mono text-yellow-400 font-bold uppercase tracking-widest">
                 AI Powered Simulation
               </span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-4">
              GOLDEN GLOVE <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">PREDICTION</span>
            </h2>
            <p className="text-slate-400 text-xl md:text-2xl font-light">
              2026 시즌 종료 시점의 성적을 AI가 미리 예측하여, 각 포지션별 가장 유력한 골든글러브 수상 후보를 선정합니다.
            </p>
          </div>
          
          <button 
            onClick={onCancel}
            className="flex-shrink-0 flex items-center gap-3 text-slate-400 hover:text-white transition-colors border border-white/10 px-8 py-4 rounded-2xl hover:bg-white/5 bg-[#0a0f1e]"
          >
            <span className="text-base font-bold">메인으로</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* AI Notice Box */}
        <div className="w-full max-w-5xl mx-auto mb-16 relative group">
           <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/20 to-transparent blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
           <div className="relative bg-[#0f172a]/80 backdrop-blur-xl border border-yellow-400/20 rounded-[2rem] p-10 text-left shadow-2xl flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0 md:w-48">
                 <div className="inline-block">
                     <div className="w-12 h-1 bg-yellow-400 rounded-full mb-2"></div>
                     <span className="text-yellow-400 font-bold tracking-widest uppercase text-sm block mb-1">DUGOUT</span>
                     <span className="text-white font-black tracking-tighter uppercase text-2xl block">AI MODEL</span>
                 </div>
              </div>
<div className="flex-1">
    <p className="text-slate-300 leading-relaxed text-lg font-light tracking-wide word-keep mb-6">
        지난 10년간 KBO 리그 데이터를 기반으로 학습한 
        <span className="text-yellow-400 font-bold"> '더그아웃'</span>의 
        <span className="text-yellow-400 font-bold"> AI 골든글러브 예측 결과</span>입니다.
    </p>
    <p className="text-slate-300 leading-relaxed text-lg font-light tracking-wide word-keep">
        리그 내 <span className="text-white font-bold">경쟁 구도</span>와 선수 퍼포먼스를 다각도로 분석해, 
        각 포지션별 <span className="text-white font-bold">가장 유력한 수상 후보</span>를 도출했습니다.  
        2026 시즌, <span className="text-yellow-400 font-bold">골든글러브를 차지할 선수</span>는 누구일까요?
    </p>
</div>
           </div>
        </div>

        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          
          {/* Sidebar: Player Detail Sidebar */}
          <div className="w-full lg:w-96 flex-shrink-0 z-20">
            <div className="sticky top-24">
              <label className="block text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest px-2">Selected Player</label>
              {selectedPlayer ? (
                <div className="bg-[#0a0f1e] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl animate-fade-in-up">
                  <div className="flex items-center justify-between mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 border border-white/10 shadow-[0_0_15px_rgba(250,204,21,0.15)]">
                      <span className="text-xl font-black text-yellow-400">{selectedPlayer.position}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-400">{selectedPlayer.team}</div>
                      <div className="text-3xl font-black text-white">{selectedPlayer.name}</div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Predicted Stats</h4>
                      <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <span className="text-xl font-black text-white">{selectedPlayer.stats}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Win Probability</h4>
                      <div className="flex items-end gap-2 mb-2">
                        <span className="text-5xl font-black text-yellow-400">{selectedPlayer.probability}</span>
                        <span className="text-2xl font-bold text-slate-500 mb-1">%</span>
                      </div>
                      <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.5)]"
                          style={{ width: `${selectedPlayer.probability}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-4 flex gap-3">
                      <Info className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-300 leading-relaxed">
                        AI 모델이 선수의 과거 데이터, 에이징 커브, 팀 전력 등을 종합하여 산출한 2026 시즌 골든글러브 수상 확률입니다.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#0a0f1e] border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-center text-center min-h-[400px]">
                  <Trophy className="w-16 h-16 text-slate-700 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">선수 선택</h3>
                  <p className="text-slate-400">
                    그라운드 위의 선수 카드를 클릭하거나 마우스를 올려 상세 예측 데이터를 확인하세요.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Main Content: Baseball Field Container */}
          <div className="flex-1 bg-[#0a0f1e] border border-white/10 rounded-3xl p-4 md:p-8 relative overflow-hidden flex items-center justify-center min-h-[600px] md:min-h-[800px] shadow-2xl">
          
          {/* Field Background (CSS Diamond) */}
          <div className="absolute inset-0 flex items-center justify-center opacity-60 pointer-events-none overflow-hidden rounded-3xl">
            {/* Green Striped Outfield */}
            <div className="absolute inset-0" style={{
              backgroundImage: 'repeating-linear-gradient(90deg, #2e8b57, #2e8b57 40px, #3cb371 40px, #3cb371 80px)'
            }}></div>
            
            {/* Foul Lines */}
            <div className="absolute bottom-0 left-1/2 w-[2px] h-[1000px] bg-white origin-bottom transform -rotate-45 -translate-x-1/2"></div>
            <div className="absolute bottom-0 left-1/2 w-[2px] h-[1000px] bg-white origin-bottom transform rotate-45 -translate-x-1/2"></div>

            {/* Infield Dirt (Diamond) */}
            <div className="absolute bottom-[10%] left-1/2 w-[300px] h-[300px] md:w-[450px] md:h-[450px] bg-[#c17f45] transform -translate-x-1/2 rotate-45 border-2 border-white/30 rounded-lg">
               {/* Infield Grass */}
               <div className="absolute inset-4 bg-[#3cb371] border-2 border-white/30 rounded-lg"></div>
               
               {/* Bases */}
               <div className="absolute top-0 left-0 w-6 h-6 bg-white -translate-x-1/2 -translate-y-1/2 rotate-45 shadow-sm"></div> {/* 2B */}
               <div className="absolute top-0 right-0 w-6 h-6 bg-white translate-x-1/2 -translate-y-1/2 rotate-45 shadow-sm"></div> {/* 1B */}
               <div className="absolute bottom-0 left-0 w-6 h-6 bg-white -translate-x-1/2 translate-y-1/2 rotate-45 shadow-sm"></div> {/* 3B */}
               
               {/* Home Plate (Pentagon shape simplified) */}
               <div className="absolute bottom-0 right-0 w-8 h-8 bg-white translate-x-1/2 translate-y-1/2 rotate-45 rounded-sm shadow-sm flex items-center justify-center">
                 <div className="w-4 h-4 bg-white transform rotate-45 translate-x-1 translate-y-1"></div>
               </div>
               
               {/* Mound */}
               <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-[#c17f45] rounded-full -translate-x-1/2 -translate-y-1/2 border-2 border-white/30 flex items-center justify-center">
                  <div className="w-6 h-2 bg-white rounded-sm"></div> {/* Pitcher's Plate */}
               </div>
            </div>
            
            {/* Home Plate Dirt Circle */}
            <div className="absolute bottom-[10%] left-1/2 w-32 h-32 bg-[#c17f45] rounded-full transform -translate-x-1/2 translate-y-1/2 border-2 border-white/30"></div>
          </div>

          {/* Player Cards on Field */}
          <div className="relative w-full h-full max-w-[800px] max-h-[800px]">
            {PREDICTIONS.map((player) => {
              const isSelected = selectedPlayer?.position === player.position;
              const teamColor = getTeamColor(player.team);
              
              return (
                <div 
                  key={player.position}
                  className={`absolute transform -translate-x-1/2 translate-y-1/2 transition-all duration-300 cursor-pointer z-10
                    ${isSelected ? 'scale-110 z-20' : 'hover:scale-105'}
                  `}
                  style={{ left: player.x, bottom: player.y }}
                  onClick={() => setSelectedPlayer(player)}
                  onMouseEnter={() => !selectedPlayer && setSelectedPlayer(player)}
                >
                  <div className={`
                    flex flex-col items-center p-3 md:p-4 rounded-2xl border backdrop-blur-md shadow-xl
                    ${isSelected ? 'bg-slate-900/90 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.3)]' : 'bg-slate-900/60 border-white/10'}
                  `}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm md:text-base font-black text-slate-400">{player.position}</span>
                      <span className="text-sm md:text-base font-bold" style={{ color: teamColor }}>{player.probability}%</span>
                    </div>
                    <div className="text-base md:text-xl font-black text-white whitespace-nowrap">{player.name}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      </div>
    </motion.div>
  );
};

export default GoldenGlove;
