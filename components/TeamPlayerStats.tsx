
import React, { useState } from 'react';
import { TEAMS } from '../constants';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

interface TeamPlayerStatsProps {
  onCancel: () => void;
}

// --- MOCK DATA TYPES ---

interface TeamRank {
  rank: number;
  name: string;
  played: number;
  win: number;
  draw: number;
  loss: number;
  winRate: string;
  gameBehind: number | string;
}

interface LeaderItem {
  rank: number;
  name: string; // Team Name or Player Name
  subInfo?: string; // Team Name for players
  value: string | number;
  unit?: string;
  teamCode?: string; // For coloring
}

interface MetricLeaderboard {
  title: string;
  key: string;
  items: LeaderItem[];
}

// --- MOCK DATA ---

// 2026 시즌 개막 전이므로 모든 스탯을 0으로 초기화
const ACTUAL_RANKING: TeamRank[] = [
  { rank: 1, name: 'KIA 타이거즈', played: 0, win: 0, draw: 0, loss: 0, winRate: '0.000', gameBehind: 0 },
  { rank: 1, name: '삼성 라이온즈', played: 0, win: 0, draw: 0, loss: 0, winRate: '0.000', gameBehind: 0 },
  { rank: 1, name: 'LG 트윈스', played: 0, win: 0, draw: 0, loss: 0, winRate: '0.000', gameBehind: 0 },
  { rank: 1, name: '두산 베어스', played: 0, win: 0, draw: 0, loss: 0, winRate: '0.000', gameBehind: 0 },
  { rank: 1, name: 'kt wiz', played: 0, win: 0, draw: 0, loss: 0, winRate: '0.000', gameBehind: 0 },
  { rank: 1, name: 'SSG 랜더스', played: 0, win: 0, draw: 0, loss: 0, winRate: '0.000', gameBehind: 0 },
  { rank: 1, name: '롯데 자이언츠', played: 0, win: 0, draw: 0, loss: 0, winRate: '0.000', gameBehind: 0 },
  { rank: 1, name: '한화 이글스', played: 0, win: 0, draw: 0, loss: 0, winRate: '0.000', gameBehind: 0 },
  { rank: 1, name: 'NC 다이노스', played: 0, win: 0, draw: 0, loss: 0, winRate: '0.000', gameBehind: 0 },
  { rank: 1, name: '키움 히어로즈', played: 0, win: 0, draw: 0, loss: 0, winRate: '0.000', gameBehind: 0 },
];

// Mock Data for Rank Trend Chart (Simulated for visualization - Game by Game)
const MOCK_RANK_HISTORY = [
  { game: '개막전', KIA: 1, SAMSUNG: 2, LG: 3, DOOSAN: 4, KT: 5, SSG: 6, HANWHA: 7, LOTTE: 8, NC: 9, KIWOOM: 10 },
  { game: '10경기' },
  { game: '20경기' },
  { game: '30경기' },
  { game: '40경기' },
  { game: '50경기' },
];

// Helper to get Korean Team Name
const getKoreanTeamName = (code: string) => {
  const team = TEAMS.find(t => t.code === code);
  // Map English names to Korean names manually if needed, or use a mapping object
  // Since TEAMS has English names, we'll map codes to Korean names here
  const koreanNames: Record<string, string> = {
    'KIA': 'KIA 타이거즈',
    'SAMSUNG': '삼성 라이온즈',
    'LG': 'LG 트윈스',
    'DOOSAN': '두산 베어스',
    'KT': 'kt wiz',
    'SSG': 'SSG 랜더스',
    'LOTTE': '롯데 자이언츠',
    'HANWHA': '한화 이글스',
    'NC': 'NC 다이노스',
    'KIWOOM': '키움 히어로즈'
  };
  return koreanNames[code] || team?.name || code;
};

// ... (Metrics Data Omitted for Brevity as it is unchanged from previous request) ...
// --- LEADERBOARDS DATA (BASIC) ---

const TEAM_METRICS_BASIC: MetricLeaderboard[] = [
  {
    title: '팀 타율 (AVG)',
    key: 'avg',
    items: [
      { rank: 1, name: 'KIA 타이거즈', value: '0.301', teamCode: 'KIA' },
      { rank: 2, name: 'LG 트윈스', value: '0.285', teamCode: 'LG' },
      { rank: 3, name: '두산 베어스', value: '0.280', teamCode: 'DOOSAN' },
      { rank: 4, name: '삼성 라이온즈', value: '0.270', teamCode: 'SAMSUNG' },
      { rank: 5, name: '롯데 자이언츠', value: '0.268', teamCode: 'LOTTE' },
    ]
  },
  // ... other metrics ...
];

const BATTER_METRICS_BASIC: MetricLeaderboard[] = [
    { title: '타율 (AVG)', key: 'avg', items: [] },
];
const PITCHER_METRICS_BASIC: MetricLeaderboard[] = [
    { title: '평균자책점 (ERA)', key: 'era', items: [] },
];
const TEAM_METRICS_ADVANCED: MetricLeaderboard[] = [];
const BATTER_METRICS_ADVANCED: MetricLeaderboard[] = [];
const PITCHER_METRICS_ADVANCED: MetricLeaderboard[] = [];


const TeamPlayerStats: React.FC<TeamPlayerStatsProps> = ({ onCancel }) => {
  const [viewMode, setViewMode] = useState<'ranking' | 'records'>('ranking');
  const [activeTab, setActiveTab] = useState<'batter' | 'pitcher' | 'team'>('team');
  const [isAdvanced, setIsAdvanced] = useState(false); // Maniac Mode State

  const getTeamColor = (code: string | undefined) => {
    const team = TEAMS.find(t => t.code === code);
    return team ? team.color : '#334155';
  };

  const getActiveMetrics = () => {
    if (isAdvanced) {
      // Return Advanced Metrics
      switch (activeTab) {
        case 'team': return TEAM_METRICS_ADVANCED;
        case 'batter': return BATTER_METRICS_ADVANCED;
        case 'pitcher': return PITCHER_METRICS_ADVANCED;
        default: return [];
      }
    } else {
      // Return Basic Metrics
      switch (activeTab) {
        case 'team': return TEAM_METRICS_BASIC;
        case 'batter': return BATTER_METRICS_BASIC;
        case 'pitcher': return PITCHER_METRICS_BASIC;
        default: return [];
      }
    }
  };

  return (
    <div className="relative z-10 w-full animate-fade-in-up min-h-screen pb-20">
      <div className="w-[95%] max-w-[1600px] mx-auto px-4 md:px-8 py-8 md:py-12">
        
        {/* Header - Font Size Increased */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-6 md:mb-10 gap-6 border-b border-white/5 pb-6 md:pb-8">
          <div>
            <div className="inline-flex items-center space-x-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-3 py-1 md:px-4 md:py-1.5 mb-4 md:mb-6 backdrop-blur-sm">
               <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-cyan-400 animate-pulse"></span>
               <span className="text-[10px] md:text-sm font-mono text-cyan-400 font-bold uppercase tracking-widest">2026 Season Analytics Center</span>
            </div>
            <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter mb-2 md:mb-4 leading-tight">
              KBO <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">STATS & RANKING</span>
            </h2>
            <p className="text-slate-400 text-base md:text-2xl font-light leading-relaxed">
              실제 데이터와 <span className="text-white font-bold">더그아웃</span>이 예측한 미래 순위의 정밀 분석
            </p>
          </div>
          <button 
            onClick={onCancel}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors border border-white/10 px-4 py-2 md:px-8 md:py-4 rounded-xl md:rounded-2xl hover:bg-white/5 bg-[#0a0f1e]"
          >
            <span className="text-xs md:text-base font-bold">메인으로</span>
            <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Navigation Tabs (Ranking vs Records) */}
        <div className="flex justify-center mb-8 md:mb-12">
          <div className="bg-[#0a0f1e] p-1 rounded-full border border-white/10 flex relative">
             {/* Sliding Background */}
             <motion.div 
               className="absolute top-1 bottom-1 bg-white rounded-full shadow-lg z-0"
               initial={false}
               animate={{ 
                 left: viewMode === 'ranking' ? '4px' : '50%', 
                 width: 'calc(50% - 4px)',
                 x: viewMode === 'ranking' ? 0 : 0
               }}
               transition={{ type: "spring", stiffness: 300, damping: 30 }}
             />
             
             <button
               onClick={() => setViewMode('ranking')}
               className={`relative z-10 px-8 md:px-12 py-2 md:py-3 rounded-full text-sm md:text-lg font-bold transition-colors duration-300 ${viewMode === 'ranking' ? 'text-black' : 'text-slate-400 hover:text-white'}`}
             >
               순위 (Ranking)
             </button>
             <button
               onClick={() => setViewMode('records')}
               className={`relative z-10 px-8 md:px-12 py-2 md:py-3 rounded-full text-sm md:text-lg font-bold transition-colors duration-300 ${viewMode === 'records' ? 'text-black' : 'text-slate-400 hover:text-white'}`}
             >
               기록 (Records)
             </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {viewMode === 'ranking' ? (
            <motion.div
              key="ranking"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8 md:space-y-12"
            >
              {/* SECTION 1: RANKING TABLE */}
              <div className="w-full bg-[#0a0f1e]/80 border border-white/10 rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-8 overflow-hidden">
                <h3 className="text-lg md:text-3xl font-black text-white mb-4 md:mb-8 flex items-center gap-3 md:gap-4">
                  <span className="w-1.5 h-5 md:w-2 md:h-8 bg-slate-500 rounded-full"></span>
                  2026 KBO 정규리그 순위 (개막 전)
                </h3>
                <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                  <table className="w-full text-left whitespace-nowrap min-w-[600px] md:min-w-0">
                    <thead className="text-slate-500 uppercase font-bold border-b border-white/5 text-xs md:text-base">
                      <tr>
                        <th className="px-2 md:px-4 py-3 md:py-4">Rank</th>
                        <th className="px-2 md:px-4 py-3 md:py-4">Team</th>
                        <th className="px-2 md:px-4 py-3 md:py-4">G</th>
                        <th className="px-2 md:px-4 py-3 md:py-4">W-D-L</th>
                        <th className="px-2 md:px-4 py-3 md:py-4 text-cyan-400">Win Rate</th>
                        <th className="px-2 md:px-4 py-3 md:py-4">GB</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm md:text-lg">
                      {ACTUAL_RANKING.map((team, index) => (
                        <tr key={team.name} className="hover:bg-white/5 transition-colors">
                          <td className="px-2 md:px-4 py-2 md:py-4 font-mono font-bold text-slate-300">
                            -
                          </td>
                          <td className="px-2 md:px-4 py-2 md:py-4 font-bold text-white text-sm md:text-xl">{team.name}</td>
                          <td className="px-2 md:px-4 py-2 md:py-4 text-slate-400">{team.played}</td>
                          <td className="px-2 md:px-4 py-2 md:py-4 text-slate-400">{team.win}-{team.draw}-{team.loss}</td>
                          <td className="px-2 md:px-4 py-2 md:py-4 font-mono font-bold text-cyan-400 text-sm md:text-xl">{team.winRate}</td>
                          <td className="px-2 md:px-4 py-2 md:py-4 text-slate-500">{team.gameBehind}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 2: RANK TREND CHART */}
              <div className="w-full bg-[#0a0f1e]/80 border border-white/10 rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-8 flex flex-col">
                <h3 className="text-base md:text-2xl font-black text-white mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
                  <span className="w-1.5 h-5 md:w-2 md:h-6 bg-cyan-500 rounded-full"></span>
                  순위 변동 그래프 (매경기)
                </h3>
                <div className="w-full h-[400px] md:h-[500px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={MOCK_RANK_HISTORY} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                      <XAxis 
                        dataKey="game" 
                        stroke="#94a3b8" 
                        tick={{ fill: '#94a3b8', fontSize: 12 }} 
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                      />
                      <YAxis 
                        reversed 
                        domain={[1, 10]} 
                        stroke="#94a3b8" 
                        tick={{ fill: '#94a3b8', fontSize: 12 }} 
                        tickLine={false}
                        axisLine={false}
                        width={40}
                        ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                        itemStyle={{ color: '#f8fafc', padding: '2px 0' }}
                        labelStyle={{ color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 'bold' }}
                        formatter={(value: number, name: string) => [`${value}위`, getKoreanTeamName(name)]}
                        labelFormatter={(label) => `${label} 순위`}
                        cursor={{ stroke: '#ffffff', strokeWidth: 1, strokeDasharray: '5 5', opacity: 0.5 }}
                      />
                      <Legend 
                        formatter={(value) => <span style={{ color: '#cbd5e1', fontSize: '12px', fontWeight: 'bold', marginRight: '10px' }}>{getKoreanTeamName(value)}</span>}
                        wrapperStyle={{ paddingTop: '20px' }}
                      />
                      {TEAMS.map((team) => (
                        <Line
                          key={team.code}
                          type="monotone"
                          dataKey={team.code}
                          stroke={team.color}
                          strokeWidth={3}
                          dot={{ r: 6, strokeWidth: 2, stroke: '#0f172a' }}
                          activeDot={{ r: 8, strokeWidth: 0 }}
                          name={team.code} // Use code here, formatter handles display
                          animationDuration={1500}
                          animationEasing="ease-in-out"
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-slate-500 mt-4 text-center">
                  * 2026 시즌 개막전 (초기 순위 배정)
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="records"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* SECTION 2: STATS TABS with Maniac Mode Toggle */}
              <div className="mb-12 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-white/10 pb-6 relative opacity-50 pointer-events-none select-none filter blur-[2px]">
                 {/* Tabs - Larger */}
                 <div className="flex flex-wrap gap-2 md:gap-4 justify-center md:justify-start">
                    <button 
                      className={`px-5 md:px-8 py-2 md:py-3 rounded-2xl text-base md:text-xl font-black transition-all ${activeTab === 'team' ? 'bg-white text-black' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                    >
                      팀 기록
                    </button>
                    <button 
                      className={`px-5 md:px-8 py-2 md:py-3 rounded-2xl text-base md:text-xl font-black transition-all ${activeTab === 'batter' ? 'bg-pink-500 text-white' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                    >
                      타자 기록
                    </button>
                    <button 
                      className={`px-5 md:px-8 py-2 md:py-3 rounded-2xl text-base md:text-xl font-black transition-all ${activeTab === 'pitcher' ? 'bg-cyan-500 text-white' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                    >
                      투수 기록
                    </button>
                 </div>
     
                 {/* Maniac Mode Toggle - Increased Size & Text */}
                 <div className="flex items-center gap-4 bg-gradient-to-r from-slate-900 to-black border border-white/10 px-6 py-3 rounded-full shadow-lg">
                    <span className="text-sm md:text-lg text-slate-400 font-bold whitespace-nowrap hidden sm:inline-block">
                      {isAdvanced ? "🤓 야구 좀 보시네요! 심화 분석 중" : "🤔 진짜 야구팬은 숫자의 깊이를 봅니다"}
                    </span>
                    <button 
                      className={`relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none ${isAdvanced ? 'bg-brand-accent' : 'bg-slate-700'}`}
                    >
                       <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-sm ${isAdvanced ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                    <span className={`text-sm md:text-base font-black tracking-wider ${isAdvanced ? 'text-brand-accent' : 'text-slate-500'}`}>
                      {isAdvanced ? 'MANIAC ON' : 'OFF'}
                    </span>
                 </div>
              </div>
     
              {/* Coming Soon Overlay Content */}
              <div className="relative py-16 md:py-20 bg-[#0a0f1e]/40 border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center -mt-10">
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0f1e]/80 to-[#0a0f1e]"></div>
                 <div className="relative z-10 text-center px-4">
                   <div className="w-16 h-16 md:w-24 md:h-24 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl md:text-5xl shadow-inner border border-white/5">
                      🔒
                   </div>
                   <h3 className="text-2xl md:text-4xl font-black text-white mb-4">
                     2026 KBO 리그 개막 후 제공됩니다.
                   </h3>
                   <p className="text-slate-400 text-sm md:text-xl font-light">
                     팀/타자/투수 세부 기록은 정규시즌 개막 이후<br/>실시간 데이터와 함께 업데이트될 예정입니다.
                   </p>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default TeamPlayerStats;
