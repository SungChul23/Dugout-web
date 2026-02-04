
import React, { useState } from 'react';
import { TEAMS } from '../constants';

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

interface PredictedRank {
  rank: number;
  name: string;
  probability: number;
  change: 'up' | 'down' | 'same';
  changeVal: number;
  comment: string;
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

const PREDICTED_RANKING: PredictedRank[] = [
  { rank: 1, name: 'KIA 타이거즈', probability: 92.5, change: 'same', changeVal: 0, comment: '압도적 전력 유지' },
  { rank: 2, name: 'LG 트윈스', probability: 68.2, change: 'up', changeVal: 1, comment: '막판 스퍼트 예상' },
  { rank: 3, name: '삼성 라이온즈', probability: 65.4, change: 'down', changeVal: 1, comment: '불펜 불안요소 감지' },
  { rank: 4, name: 'kt wiz', probability: 55.1, change: 'up', changeVal: 1, comment: '마법 같은 후반기' },
  { rank: 5, name: '두산 베어스', probability: 51.8, change: 'down', changeVal: 1, comment: '부상 변수 발생' },
  { rank: 6, name: 'SSG 랜더스', probability: 48.2, change: 'same', changeVal: 0, comment: '5강 경쟁 치열' },
  { rank: 7, name: '한화 이글스', probability: 35.0, change: 'up', changeVal: 1, comment: '고춧가루 부대' },
  { rank: 8, name: '롯데 자이언츠', probability: 32.5, change: 'down', changeVal: 1, comment: '투타 엇박자' },
  { rank: 9, name: 'NC 다이노스', probability: 15.2, change: 'same', changeVal: 0, comment: '리빌딩 모드' },
  { rank: 10, name: '키움 히어로즈', probability: 8.5, change: 'same', changeVal: 0, comment: '유망주 경험치' },
];

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
      <div className="w-[95%] max-w-[1600px] mx-auto px-4 md:px-8 py-12">
        
        {/* Header - Font Size Increased */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 md:mb-16 gap-6 border-b border-white/5 pb-8">
          <div>
            <div className="inline-flex items-center space-x-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 mb-4 md:mb-6 backdrop-blur-sm">
               <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
               <span className="text-[10px] md:text-sm font-mono text-cyan-400 font-bold uppercase tracking-widest">2026 Season Analytics Center</span>
            </div>
            <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter mb-4 leading-tight">
              KBO <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">STATS & RANKING</span>
            </h2>
            <p className="text-slate-400 text-base md:text-2xl font-light leading-relaxed">
              실제 데이터와 <span className="text-white font-bold">더그아웃</span>이 예측한 미래 순위의 정밀 분석
            </p>
          </div>
          <button 
            onClick={onCancel}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors border border-white/10 px-6 py-3 md:px-8 md:py-4 rounded-2xl hover:bg-white/5 bg-[#0a0f1e]"
          >
            <span className="text-sm md:text-base font-bold">메인으로</span>
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* SECTION 1: RANKING COMPARISON */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 md:gap-10 mb-20">
          
          {/* Actual Ranking - Larger Padding & Text */}
          <div className="bg-[#0a0f1e]/80 border border-white/10 rounded-[2.5rem] p-6 md:p-10">
            <h3 className="text-2xl md:text-3xl font-black text-white mb-6 md:mb-8 flex items-center gap-4">
              <span className="w-2 h-6 md:h-8 bg-slate-500 rounded-full"></span>
              2026 KBO 정규리그 순위 (개막 전)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="text-slate-500 uppercase font-bold border-b border-white/5 text-sm md:text-base">
                  <tr>
                    <th className="px-2 md:px-4 py-4">Rank</th>
                    <th className="px-2 md:px-4 py-4">Team</th>
                    <th className="px-2 md:px-4 py-4">G</th>
                    <th className="px-2 md:px-4 py-4">W-D-L</th>
                    <th className="px-2 md:px-4 py-4 text-cyan-400">Win Rate</th>
                    <th className="px-2 md:px-4 py-4">GB</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-base md:text-lg">
                  {ACTUAL_RANKING.map((team, index) => (
                    <tr key={team.name} className="hover:bg-white/5 transition-colors">
                      <td className="px-2 md:px-4 py-3 md:py-4 font-mono font-bold text-slate-300">
                        -
                      </td>
                      <td className="px-2 md:px-4 py-3 md:py-4 font-bold text-white text-base md:text-xl">{team.name}</td>
                      <td className="px-2 md:px-4 py-3 md:py-4 text-slate-400">{team.played}</td>
                      <td className="px-2 md:px-4 py-3 md:py-4 text-slate-400">{team.win}-{team.draw}-{team.loss}</td>
                      <td className="px-2 md:px-4 py-3 md:py-4 font-mono font-bold text-cyan-400 text-base md:text-xl">{team.winRate}</td>
                      <td className="px-2 md:px-4 py-3 md:py-4 text-slate-500">{team.gameBehind}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Predicted Ranking - Larger Padding & Text */}
          <div className="bg-gradient-to-br from-[#0f172a] to-[#1e1b4b] border border-cyan-500/30 rounded-[2.5rem] p-6 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
            
            <h3 className="text-2xl md:text-3xl font-black text-white mb-6 md:mb-8 flex items-center gap-4 relative z-10">
              <span className="w-2 h-6 md:h-8 bg-cyan-400 rounded-full animate-pulse"></span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                DUGOUT Predicted Final Ranking
              </span>
            </h3>
            <div className="overflow-x-auto relative z-10">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="text-blue-300/70 uppercase font-bold border-b border-white/5 text-sm md:text-base">
                  <tr>
                    <th className="px-2 md:px-4 py-4">Pred Rank</th>
                    <th className="px-2 md:px-4 py-4">Team</th>
                    <th className="px-2 md:px-4 py-4">Trend</th>
                    <th className="px-2 md:px-4 py-4">Analysis Comment</th>
                    <th className="px-2 md:px-4 py-4 text-right">Probability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-base md:text-lg">
                  {PREDICTED_RANKING.map((team) => (
                    <tr key={team.name} className="hover:bg-white/5 transition-colors group">
                      <td className="px-2 md:px-4 py-3 md:py-4 font-mono font-bold text-white">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${team.rank === 1 ? 'bg-yellow-500 text-black' : team.rank <= 5 ? 'bg-blue-600 text-white' : 'bg-transparent text-blue-400'}`}>
                          {team.rank}
                        </span>
                      </td>
                      <td className="px-2 md:px-4 py-3 md:py-4 font-bold text-blue-100 text-base md:text-xl">{team.name}</td>
                      <td className="px-2 md:px-4 py-3 md:py-4">
                        {team.change === 'up' && <span className="text-red-400 flex items-center gap-1 font-bold">▲ {team.changeVal}</span>}
                        {team.change === 'down' && <span className="text-blue-400 flex items-center gap-1 font-bold">▼ {team.changeVal}</span>}
                        {team.change === 'same' && <span className="text-slate-500">-</span>}
                      </td>
                      <td className="px-2 md:px-4 py-3 md:py-4 text-blue-200 text-sm md:text-base">{team.comment}</td>
                      <td className="px-2 md:px-4 py-3 md:py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <div className="w-16 md:w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-400" style={{ width: `${team.probability}%` }}></div>
                          </div>
                          <span className="font-mono text-cyan-400 font-bold text-sm md:text-base">{team.probability}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

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

        {/* STATS CONTENT: RANKING CARDS (Hidden visually but structure kept for future use if needed, effectively hidden by overlay above and blur) */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up filter blur-md opacity-20 pointer-events-none select-none">
           ... (Original Content) ...
        </div> */}

      </div>
    </div>
  );
};

export default TeamPlayerStats;
