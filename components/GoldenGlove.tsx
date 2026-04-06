import React, { useState, useEffect, useRef } from 'react';
import { Trophy, ChevronLeft, Info, X, TrendingUp, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TEAMS } from '../constants';
import { api } from '../api';

interface GoldenGloveProps {
  onCancel: () => void;
  user: any;
}

interface FieldPosition {
  id: string; // e.g., '1B', 'LF'
  dataKey: string; // e.g., '1B', 'OF'
  rankIndex: number;
  x: string;
  y: string;
}

const FIELD_POSITIONS: FieldPosition[] = [
  { id: 'P', dataKey: 'P', rankIndex: 0, x: '50%', y: '35%' },
  { id: 'C', dataKey: 'C', rankIndex: 0, x: '50%', y: '5%' },
  { id: '1B', dataKey: '1B', rankIndex: 0, x: '80%', y: '35%' },
  { id: '2B', dataKey: '2B', rankIndex: 0, x: '65%', y: '55%' },
  { id: '3B', dataKey: '3B', rankIndex: 0, x: '20%', y: '35%' },
  { id: 'SS', dataKey: 'SS', rankIndex: 0, x: '35%', y: '55%' },
  { id: 'LF', dataKey: 'OF', rankIndex: 0, x: '15%', y: '80%' },
  { id: 'CF', dataKey: 'OF', rankIndex: 1, x: '50%', y: '90%' },
  { id: 'RF', dataKey: 'OF', rankIndex: 2, x: '85%', y: '80%' },
  { id: 'DH', dataKey: 'DH', rankIndex: 0, x: '90%', y: '10%' },
];

const getFullTeamName = (shortName: string) => {
  const map: Record<string, string> = {
    'KIA': 'KIA 타이거즈',
    '삼성': '삼성 라이온즈',
    'LG': 'LG 트윈스',
    '두산': '두산 베어스',
    'KT': 'KT 위즈',
    'SSG': 'SSG 랜더스',
    '롯데': '롯데 자이언츠',
    '한화': '한화 이글스',
    'NC': 'NC 다이노스',
    '키움': '키움 히어로즈'
  };
  return map[shortName] || shortName;
};

const getFeatureLabel = (feature: string) => {
  const map: Record<string, string> = {
    'AVG': '타율(AVG)',
    'SLG': '장타율(SLG)',
    'OBP': '출루율(OBP)',
    'RISP': '득점권 타율(RISP)',
    'HR_pos_ratio': '동일 포지션 내 홈런 생산력', 
    'RBI_pos_ratio': '동일 포지션 내 타점 생산력',
    'H_pos_ratio': '동일 포지션 내 안타 생산력', 
    'R_pos_ratio': '동일 포지션 내 득점 생산력',
    'G_pos_ratio': '동일 포지션 내 출장 경기 수', 
    'SO_inverse_ratio': '동일 포지션 내 삼진 억제력', 
    'GDP_inverse_ratio': '동일 포지션 내 병살타 최소화 능력'
  };
  return map[feature] || feature;
};

const GoldenGlove: React.FC<GoldenGloveProps> = ({ onCancel, user }) => {
  const [selectedPositionKey, setSelectedPositionKey] = useState<string | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [selectedPositionKey]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/api/v1/gg/leaderboard/latest');
        setLeaderboardData(res.data);
      } catch (err) {
        console.error('Failed to fetch golden glove data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getNeonTeamColor = (teamName: string) => {
    const map: Record<string, string> = {
      'KIA 타이거즈': '#ff3333',
      '삼성 라이온즈': '#4da6ff',
      'LG 트윈스': '#ff3385',
      '두산 베어스': '#4d4dff',
      'KT 위즈': '#ffffff',
      'SSG 랜더스': '#ff4d4d',
      '롯데 자이언츠': '#00e6e6',
      '한화 이글스': '#ff9933',
      'NC 다이노스': '#66b3ff',
      '키움 히어로즈': '#ff4d94'
    };
    return map[teamName] || '#ffffff';
  };

  const selectedPlayers = selectedPositionKey && leaderboardData
    ? leaderboardData.leaderboardByPosition[selectedPositionKey]
    : null;

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
        지난 10년간  KBO 리그 <span className="text-yellow-400 font-bold"> 골든글러브</span> 수상자의 데이터를 기반으로 학습한 
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
          
          {/* Main Content: Baseball Field Container */}
          <div className="flex-1 bg-[#0a0f1e] border border-white/10 rounded-3xl p-4 md:p-8 relative overflow-hidden flex items-center justify-center min-h-[400px] md:min-h-[800px] shadow-2xl">
          
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
            {FIELD_POSITIONS.map((pos) => {
              const isSelected = selectedPositionKey === pos.dataKey;
              const players = leaderboardData?.leaderboardByPosition[pos.dataKey];
              const player = players ? players[pos.rankIndex] : null;
              
              if (!player) return null;

              const fullTeamName = getFullTeamName(player.teamName);
              const teamColor = getNeonTeamColor(fullTeamName);
              
              return (
                <motion.div 
                  key={pos.id}
                  className="absolute cursor-pointer"
                  style={{ left: pos.x, bottom: pos.y }}
                  initial={{ x: '-50%', y: '50%', scale: 1 }}
                  animate={{ 
                    x: '-50%',
                    y: isSelected ? '30%' : '50%',
                    scale: isSelected ? 1.15 : 1,
                    zIndex: isSelected ? 30 : 10
                  }}
                  whileHover={{ 
                    y: isSelected ? '30%' : '40%', 
                    scale: isSelected ? 1.15 : 1.05,
                    zIndex: 20
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  onClick={() => setSelectedPositionKey(pos.dataKey)}
                  onMouseEnter={() => !selectedPositionKey && setSelectedPositionKey(pos.dataKey)}
                >
                  <div 
                    className="flex flex-col items-center p-2 md:p-5 rounded-xl md:rounded-2xl backdrop-blur-md transition-all duration-300"
                    style={{
                      backgroundColor: isSelected ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.7)',
                      borderColor: teamColor,
                      borderWidth: isSelected ? '2px' : '1px',
                      boxShadow: isSelected 
                        ? `0 0 25px ${teamColor}80, 0 0 10px ${teamColor}40 inset` 
                        : `0 4px 15px rgba(0,0,0,0.3), 0 0 10px ${teamColor}20`,
                    }}
                  >
                    <div className="flex items-center gap-1 md:gap-3 mb-1 md:mb-2">
                      <span className="text-xs md:text-xl font-black text-slate-300">{pos.id}</span>
                      <span className="text-xs md:text-xl font-bold" style={{ color: teamColor, textShadow: `0 0 10px ${teamColor}80` }}>
                        {player.winProbStr}
                      </span>
                    </div>
                    <div className="text-sm md:text-3xl font-black text-white whitespace-nowrap tracking-tight">
                      {player.playerName}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

          {/* Sidebar: Player Detail Sidebar */}
          <div className="w-full lg:w-[500px] flex-shrink-0 z-20">
            <div className="sticky top-24">
              <label className="block text-sm font-bold text-slate-500 mb-4 uppercase tracking-widest px-2">
                {selectedPositionKey ? `${selectedPositionKey} PREDICTIONS` : 'Selected Position'}
              </label>
              
              <div ref={scrollRef} className="max-h-[800px] overflow-y-auto pr-2 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                <AnimatePresence mode="popLayout">
                  {loading ? (
                     <div className="bg-[#0a0f1e] border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-center text-center min-h-[400px]">
                       <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                       <p className="text-slate-400 text-lg">데이터를 불러오는 중입니다...</p>
                     </div>
                  ) : selectedPlayers ? (
                    selectedPlayers.map((player: any, index: number) => {
                      const isTopRank = selectedPositionKey === 'OF' ? index < 3 : index === 0;
                      
                      return (
                      <motion.div 
                        key={player.playerCode}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
                        className={`bg-[#0a0f1e] border border-white/10 rounded-3xl shadow-2xl ${isTopRank ? 'p-6' : 'p-4 opacity-80 hover:opacity-100 transition-opacity'}`}
                      >
                        <div className={`flex items-center justify-between ${isTopRank ? 'mb-6' : 'mb-4'}`}>
                          <div className={`inline-flex items-center justify-center rounded-full bg-white/5 border border-white/10 shadow-[0_0_15px_rgba(250,204,21,0.15)] ${isTopRank ? 'w-16 h-16' : 'w-12 h-12'}`}>
                            <span className={`font-black text-yellow-400 ${isTopRank ? 'text-2xl' : 'text-xl'}`}>{player.rank}위</span>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold text-slate-400 ${isTopRank ? 'text-lg' : 'text-sm'}`}>{getFullTeamName(player.teamName)} · {player.subPosition}</div>
                            <div className={`font-black text-white ${isTopRank ? 'text-5xl mt-1' : 'text-3xl'}`}>{player.playerName}</div>
                          </div>
                        </div>

                        <div className={isTopRank ? 'space-y-6' : 'space-y-4'}>
                          {/* Win Probability */}
                          <div>
                            <h4 className={`font-bold text-slate-500 uppercase tracking-widest ${isTopRank ? 'text-base mb-2' : 'text-sm mb-1'}`}>Win Probability</h4>
                            <div className={`flex items-end gap-2 ${isTopRank ? 'mb-2' : 'mb-1'}`}>
                              <span className={`font-black text-yellow-400 ${isTopRank ? 'text-7xl' : 'text-5xl'}`}>{player.winProbStr.replace('%', '')}</span>
                              <span className={`font-bold text-slate-500 ${isTopRank ? 'text-3xl mb-2' : 'text-2xl mb-1'}`}>%</span>
                            </div>
                            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.5)]"
                                style={{ width: player.winProbStr }}
                              ></div>
                            </div>
                          </div>

                          {/* Factor Analysis */}
                          <div>
                            <h4 className={`font-bold text-slate-500 uppercase tracking-widest ${isTopRank ? 'text-base mb-3' : 'text-sm mb-2'}`}>Factor Analysis</h4>
                            <div className={isTopRank ? 'space-y-3' : 'space-y-2'}>
                              {/* Positive Factors */}
                              <div className="flex flex-wrap gap-2">
                                {player.top3Positive.map((factor: any, idx: number) => (
                                  <div key={idx} className={`inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg ${isTopRank ? 'px-4 py-2' : 'px-3 py-1.5'}`}>
                                    <TrendingUp className={`text-emerald-400 ${isTopRank ? 'w-5 h-5' : 'w-4 h-4'}`} />
                                    <span className={`font-bold text-emerald-100 ${isTopRank ? 'text-base' : 'text-sm'}`}>{getFeatureLabel(factor.feature)}</span>
                                    <span className={`font-mono text-emerald-400/80 ${isTopRank ? 'text-sm' : 'text-xs'}`}>+{factor.score.toFixed(3)}</span>
                                  </div>
                                ))}
                              </div>
                              {/* Negative Factors */}
                              <div className="flex flex-wrap gap-2">
                                {player.top1Negative.map((factor: any, idx: number) => (
                                  <div key={idx} className={`inline-flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg ${isTopRank ? 'px-4 py-2' : 'px-3 py-1.5'}`}>
                                    <TrendingDown className={`text-rose-400 ${isTopRank ? 'w-5 h-5' : 'w-4 h-4'}`} />
                                    <span className={`font-bold text-rose-100 ${isTopRank ? 'text-base' : 'text-sm'}`}>{getFeatureLabel(factor.feature)}</span>
                                    <span className={`font-mono text-rose-400/80 ${isTopRank ? 'text-sm' : 'text-xs'}`}>{factor.score.toFixed(3)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* AI Explanation */}
                          {player.aiExplanation && (
                            <div className={`bg-white/5 border border-white/10 rounded-2xl ${isTopRank ? 'p-5' : 'p-4'}`}>
                              <div className={`flex items-center gap-2 ${isTopRank ? 'mb-3' : 'mb-2'}`}>
                                <Info className={`text-yellow-400 ${isTopRank ? 'w-6 h-6' : 'w-5 h-5'}`} />
                                <span className={`font-bold text-yellow-400 uppercase tracking-widest ${isTopRank ? 'text-base' : 'text-sm'}`}>AI Report</span>
                              </div>
                              <p className={`text-slate-200 leading-relaxed font-light word-keep ${isTopRank ? 'text-lg' : 'text-base'}`}>
                                {player.aiExplanation}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                    })
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-[#0a0f1e] border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-center text-center min-h-[400px]"
                    >
                      <Trophy className="w-16 h-16 text-slate-700 mb-4" />
                      <h3 className="text-2xl font-bold text-white mb-2">포지션 선택</h3>
                      <p className="text-lg text-slate-400">
                        그라운드 위의 포지션을 클릭하여 상세 예측 데이터를 확인하세요.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default GoldenGlove;
