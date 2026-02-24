
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import Modal from './Modal';
import { TEAMS } from '../constants';

const API_BASE_URL = "https://dugout.cloud";

// --- 한글 팀명 매핑 ---
const KOREAN_TEAM_NAMES: Record<string, string> = {
  'KIA': 'KIA 타이거즈',
  'SAMSUNG': '삼성 라이온즈',
  'LG': 'LG 트윈스',
  'DOOSAN': '두산 베어스',
  'KT': 'KT 위즈',
  'SSG': 'SSG 랜더스',
  'HANWHA': '한화 이글스',
  'LOTTE': '롯데 자이언츠',
  'NC': 'NC 다이노스',
  'KIWOOM': '키움 히어로즈'
};

// --- 사용자 선호 팀(한글) -> TEAM CODE 매핑 ---
const KOREAN_TO_CODE: Record<string, string> = {
  'KIA 타이거즈': 'KIA',
  '삼성 라이온즈': 'SAMSUNG',
  'LG 트윈스': 'LG',
  '두산 베어스': 'DOOSAN',
  'KT 위즈': 'KT',
  'kt wiz': 'KT',
  'SSG 랜더스': 'SSG',
  '한화 이글스': 'HANWHA',
  '롯데 자이언츠': 'LOTTE',
  'NC 다이노스': 'NC',
  '키움 히어로즈': 'KIWOOM'
};


// --- TYPES ---
type Role = 'Pitcher' | 'Batter';
type PositionDetail = '투수' | '포수' | '내야수' | '외야수' | '지명타자';

interface PlayerRosterItem {
  id: number;
  name: string;
  backNumber: number;
  role: Role;
  positionDetail: PositionDetail;
}

// 서버 Roster 응답 DTO
interface ServerPlayerDto {
  playerId: number;
  name: string;
  back_number: number;   
  position_type: string; 
}

// 서버 Prediction 응답 DTO (Updated)
interface ServerPredictionDto {
  name: string;
  backNumber: number;
  position: string;

  // --- 타자 전용 지표 ---
  currAvg?: number;
  predAvg?: number;
  avgDiff?: number;
  avgMin?: number;
  avgMax?: number;

  currObp?: number;
  predObp?: number;
  diffObp?: number;
  obpMin?: number;
  obpMax?: number;

  currSlg?: number;
  predSlg?: number;
  diffSlg?: number;
  slgMin?: number;
  slgMax?: number;

  currOps?: number;
  predOps?: number;
  opsDiff?: number;
  opsMin?: number;
  opsMax?: number;

  currHr?: number;
  predHr?: number;
  hrDiff?: number;
  hrMin?: number;
  hrMax?: number;

  // --- 투수 전용 지표 ---
  probElite?: number;         // 엘리트 확률
  rolePercentileTop?: number; // 상위 %
  roleRank?: number;             // 보직 내 순위
  roleTotal?: number;            // 보직 내 전체 인원

  era2025?: number;           // 2025년 평균자책점 (ERA)
  fip2025?: number;           // 2025년 수비무관 투구지표 (FIP)
  ip2025?: number;            // 2025년 소화 이닝 (IP)
  whip2025?: number;          // 2025년 이닝당 출루허용률 (WHIP)
  role?: string;              // 투수 보직 (예: SP, RP)

  aiReport: string;
}

interface StatMetric {
  type: 'avg' | 'hr' | 'ops' | 'pitcher';
  label: string;
  
  // Batter Fields
  current?: number;
  predicted?: number;
  diff?: number;
  min?: number;
  max?: number;
  unit?: string;
  
  // OPS Breakdown
  obp?: { current: number, predicted: number, min: number, max: number, diff: number };
  slg?: { current: number, predicted: number, min: number, max: number, diff: number };

  // Pitcher Fields
  probElite?: number;
  rolePercentileTop?: number;
  roleRank?: number;
  roleTotal?: number;
  
  // New Pitcher Fields
  era2025?: number;
  fip2025?: number;
  ip2025?: number;
  whip2025?: number;
  role?: string;
}

interface PredictionResult {
  playerId: number;
  playerName: string;
  metrics: StatMetric[];
  aiFeedback: string;
  role: Role;
}

interface PlayerPredictionProps {
  onCancel: () => void;
  user: { nickname: string; favoriteTeam?: string } | null;
}

// --- HELPER COMPONENTS ---

interface JerseyCardProps {
  player: PlayerRosterItem;
  color: string;
  textColor?: string; 
  onClick: () => void;
}

const JerseyCard: React.FC<JerseyCardProps> = ({ player, color, textColor = 'white', onClick }) => {
  return (
    <div 
      onClick={onClick} 
      className="group relative cursor-pointer flex flex-col items-center justify-center transition-all duration-300 hover:-translate-y-3"
    >
      {/* Jersey SVG Shape */}
      <div className="relative w-full max-w-[220px] drop-shadow-2xl group-hover:drop-shadow-[0_25px_50px_rgba(255,255,255,0.25)] transition-all duration-500">
        <svg 
          viewBox="0 0 240 240" 
          className="w-full h-auto"
        >
          <path 
            d="M90,20 Q120,40 150,20 L210,50 L230,80 L180,95 L180,230 L60,230 L60,95 L10,80 L30,50 L90,20 Z" 
            fill={color} 
            stroke="rgba(255,255,255,0.2)" 
            strokeWidth="2"
          />
          <path d="M90,20 Q120,40 150,20" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="3" />
          <line x1="30" y1="50" x2="60" y2="95" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
          <line x1="210" y1="50" x2="180" y2="95" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
          <text 
            x="120" y="85" 
            textAnchor="middle" 
            fill={textColor} 
            fontSize="28" 
            fontWeight="900" 
            fontFamily="sans-serif"
            style={{ textShadow: textColor === 'white' ? '0 2px 4px rgba(0,0,0,0.5)' : 'none' }}
          >
            {player.name}
          </text>
          <text 
            x="120" y="175" 
            textAnchor="middle" 
            fill={textColor} 
            fontSize="85" 
            fontWeight="900" 
            fontFamily="sans-serif"
            style={{ 
              textShadow: textColor === 'white' ? '0 4px 10px rgba(0,0,0,0.5)' : 'none',
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {player.backNumber}
          </text>
        </svg>
      </div>
      <div className="mt-5 px-5 py-1.5 rounded-full bg-white/10 border border-white/5 text-sm font-black uppercase tracking-widest text-slate-300 group-hover:bg-white group-hover:text-black transition-all duration-300 shadow-lg">
        {player.positionDetail}
      </div>
    </div>
  );
};

// --- BATTER CHARTS ---

// 1. Batter Range Chart (AVG, HR)
const BatterRangeChart: React.FC<{ metric: StatMetric; color: string }> = ({ metric, color }) => {
  const current = metric.current || 0;
  const predicted = metric.predicted || 0;
  const min = metric.min || predicted;
  const max = metric.max || predicted;
  const diff = metric.diff || 0;
  const isUp = diff >= 0;

  // Scale calculation
  const isAvg = metric.type === 'avg';
  const maxValue = Math.max(current, max) * 1.2;
  const scale = (val: number) => Math.min((val / maxValue) * 100, 100);

  return (
    <div 
      className="rounded-[2rem] p-8 flex flex-col h-full relative overflow-hidden group min-h-[400px] transition-all duration-300 hover:scale-[1.02]"
      style={{ 
        border: `1px solid ${color}44`,
        background: `linear-gradient(145deg, ${color}11 0%, #0f172a 100%)`,
        boxShadow: `0 0 30px -5px ${color}33, inset 0 0 20px -10px ${color}22`
      }}
    >
      {/* Inner Neon Gradient */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at top right, ${color}15 0%, transparent 70%)` }}></div>

      {/* Header */}
      <div className="flex justify-between items-start mb-10 relative z-10">
        <div>
           <h4 className="text-3xl font-black text-white uppercase tracking-tight mb-1">{metric.label}</h4>
           <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">Prediction Range</span>
        </div>
        <div className={`px-4 py-2 rounded-xl text-lg font-black flex items-center gap-1 border ${isUp ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
           <span>{isUp ? '▲' : '▼'}</span>
           <span>{Math.abs(diff).toFixed(isAvg ? 3 : 0)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center gap-10 relative z-10">
         
         {/* 2025 Current */}
         <div className="relative">
            <div className="flex justify-between text-base font-bold text-slate-400 mb-2">
               <span>2025 Actual</span>
               <span className="font-mono text-xl text-white">{isAvg ? current.toFixed(3) : current}</span>
            </div>
            <div className="h-5 bg-slate-800 rounded-full overflow-hidden border border-white/5">
               <div 
                 className="h-full bg-slate-500 rounded-full" 
                 style={{ width: `${scale(current)}%` }}
               ></div>
            </div>
         </div>

         {/* 2026 Predicted with Range */}
         <div className="relative">
            <div className="flex justify-between items-end mb-3" style={{ color: color }}>
               <span className="text-lg font-bold">2026 Forecast</span>
               <span className="font-mono text-5xl font-black tracking-tighter" style={{ textShadow: `0 0 20px ${color}66` }}>
                 {isAvg ? predicted.toFixed(3) : predicted}
               </span>
            </div>
            
            {/* Range Bar Background */}
            <div className="h-8 bg-slate-800/50 rounded-full relative border border-white/10">
               {/* Min-Max Range Indicator */}
               <div 
                 className="absolute top-1/2 -translate-y-1/2 h-3 rounded-full opacity-60"
                 style={{ 
                   left: `${scale(min)}%`, 
                   width: `${scale(max) - scale(min)}%`,
                   backgroundColor: color,
                   boxShadow: `0 0 10px ${color}`
                 }}
               ></div>

               {/* Predicted Dot */}
               <div 
                 className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-white shadow-[0_0_15px_currentColor] z-10"
                 style={{ 
                   left: `${scale(predicted)}%`, 
                   backgroundColor: color,
                   color: color,
                   transform: 'translate(-50%, -50%)'
                 }}
               ></div>

               {/* Min/Max Labels */}
               <div className="absolute top-10 text-xs font-mono font-bold text-slate-400 transform -translate-x-1/2" style={{ left: `${scale(min)}%` }}>
                  {isAvg ? min.toFixed(3) : min}
               </div>
               <div className="absolute top-10 text-xs font-mono font-bold text-slate-400 transform -translate-x-1/2" style={{ left: `${scale(max)}%` }}>
                  {isAvg ? max.toFixed(3) : max}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

// 2. OPS Analysis Chart (OPS + OBP/SLG Breakdown)
const OpsAnalysisChart: React.FC<{ metric: StatMetric; color: string }> = ({ metric, color }) => {
  const { current, predicted, min, max, obp, slg } = metric;
  const diff = metric.diff || 0;
  const isUp = diff >= 0;

  return (
    <div 
      className="rounded-[2rem] p-8 flex flex-col h-full relative overflow-hidden group min-h-[400px] md:col-span-2 transition-all duration-300 hover:scale-[1.01]"
      style={{ 
        border: `1px solid ${color}44`,
        background: `linear-gradient(145deg, ${color}11 0%, #0f172a 100%)`,
        boxShadow: `0 0 30px -5px ${color}33, inset 0 0 20px -10px ${color}22`
      }}
    >
       {/* Inner Neon Gradient */}
       <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at top right, ${color}15 0%, transparent 70%)` }}></div>

       <div className="flex flex-col md:flex-row gap-10 h-full relative z-10">
          
          {/* Left: OPS Main Stat */}
          <div className="flex-1 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-white/10 pb-8 md:pb-0 md:pr-10">
             <h4 className="text-4xl font-black text-white uppercase tracking-tight mb-2">OPS</h4>
             <span className="text-base text-slate-400 font-bold uppercase tracking-widest mb-8">On-base + Slugging</span>
             
             <div className="relative flex flex-col items-center">
                <span className="text-8xl font-black text-white tracking-tighter mb-4" style={{ textShadow: `0 0 40px ${color}66` }}>
                   {Number(predicted).toFixed(3)}
                </span>
                
                <div className={`flex items-center gap-3 text-2xl font-bold ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                   <span>{isUp ? '▲' : '▼'}</span>
                   <span>{Math.abs(diff).toFixed(3)}</span>
                   <span className="text-slate-500 text-base ml-2">(vs {Number(current).toFixed(3)})</span>
                </div>

                {/* Range */}
                <div className="mt-8 flex items-center gap-4 bg-white/5 px-6 py-3 rounded-full border border-white/5">
                   <span className="text-sm text-slate-500 font-bold uppercase">Range</span>
                   <span className="text-2xl font-mono font-bold text-slate-300">{Number(min).toFixed(3)}</span>
                   <div className="w-16 h-1.5 bg-gradient-to-r from-slate-600 to-slate-400 rounded-full"></div>
                   <span className="text-2xl font-mono font-bold text-white">{Number(max).toFixed(3)}</span>
                </div>
             </div>
          </div>

          {/* Right: OBP & SLG Breakdown */}
          <div className="flex-1 flex flex-col justify-center gap-10">
             {/* OBP */}
             {obp && (
               <div>
                  <div className="flex justify-between items-end mb-3">
                     <span className="text-2xl font-bold text-slate-300">OBP (출루율)</span>
                     <div className="text-right">
                        <span className="text-4xl font-mono font-black text-white" style={{ color: color, textShadow: `0 0 15px ${color}44` }}>{obp.predicted.toFixed(3)}</span>
                        <span className="text-sm text-slate-500 ml-3 font-bold">({obp.min.toFixed(3)} ~ {obp.max.toFixed(3)})</span>
                     </div>
                  </div>
                  <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden relative border border-white/5">
                     <div className="absolute h-full bg-slate-600 rounded-full opacity-30" style={{ width: `${(obp.current / 0.6) * 100}%` }}></div>
                     <div className="absolute h-full rounded-full shadow-[0_0_15px_currentColor]" style={{ width: `${(obp.predicted / 0.6) * 100}%`, backgroundColor: color }}></div>
                  </div>
               </div>
             )}

             {/* SLG */}
             {slg && (
               <div>
                  <div className="flex justify-between items-end mb-3">
                     <span className="text-2xl font-bold text-slate-300">SLG (장타율)</span>
                     <div className="text-right">
                        <span className="text-4xl font-mono font-black text-white" style={{ color: color, textShadow: `0 0 15px ${color}44` }}>{slg.predicted.toFixed(3)}</span>
                        <span className="text-sm text-slate-500 ml-3 font-bold">({slg.min.toFixed(3)} ~ {slg.max.toFixed(3)})</span>
                     </div>
                  </div>
                  <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden relative border border-white/5">
                     <div className="absolute h-full bg-slate-600 rounded-full opacity-30" style={{ width: `${(slg.current / 1.0) * 100}%` }}></div>
                     <div className="absolute h-full rounded-full shadow-[0_0_15px_currentColor]" style={{ width: `${(slg.predicted / 1.0) * 100}%`, backgroundColor: color }}></div>
                  </div>
               </div>
             )}

             <div className="mt-2 p-5 bg-white/5 rounded-2xl border border-white/5 text-base text-slate-400 leading-relaxed">
                <p>
                   <span className="text-white font-bold">Insight:</span> OBP와 SLG의 예측 범위를 종합하여 산출된 OPS입니다. 
                   타격 생산성의 핵심 지표로 활용됩니다.
                </p>
             </div>
          </div>
       </div>
    </div>
  );
};


// --- PITCHER CHART (NEW) ---

// 투수용 미래 가치 시각화 카드 (Rank, Percentile, Elite Prob, 2025 Stats)
const PitcherRankCard: React.FC<{ metric: StatMetric; color: string }> = ({ metric, color }) => {
  const { probElite, rolePercentileTop, roleRank, roleTotal, era2025, fip2025, ip2025, whip2025, role } = metric;
  
  // Safe defaults
  const prob = probElite || 0;
  const percentile = rolePercentileTop || 100;
  const rank = roleRank || 0;
  const total = roleTotal || 0;

  // Format IP to baseball notation (e.g., 70.667 -> 70 2/3)
  const formatIp = (ip: number | undefined) => {
    if (ip === undefined) return "-";
    const integerPart = Math.floor(ip);
    const decimalPart = ip - integerPart;
    // Calculate thirds: .0 -> 0, .333 -> 1, .666 -> 2
    const thirds = Math.round(decimalPart * 3);
    
    if (thirds === 0) return `${integerPart}`;
    if (thirds === 3) return `${integerPart + 1}`; // Should handle rounding up if close to 1
    return `${integerPart} ${thirds}/3`;
  };

  // Tier Logic
  let tierLabel = "LOW";
  let tierColor = "#94a3b8"; // Slate 400
  
  if (prob >= 0.7) {
     tierLabel = "ELITE";
     tierColor = "#06b6d4"; // Cyan
  } else if (prob >= 0.4) {
     tierLabel = "POTENTIAL";
     tierColor = "#ec4899"; // Pink
  } else if (prob >= 0.2) {
     tierLabel = "AVERAGE";
     tierColor = "#22c55e"; // Green
  }

  return (
    <div 
      className="rounded-[2.5rem] p-10 flex flex-col h-full min-h-[500px] relative overflow-hidden group shadow-xl col-span-full"
      style={{ 
        border: `1px solid ${tierColor}44`,
        background: `linear-gradient(145deg, ${tierColor}11 0%, #0a0f1e 100%)`,
        boxShadow: `0 0 40px -10px ${tierColor}33, inset 0 0 30px -10px ${tierColor}22`
      }}
    >
       {/* Inner Neon Gradient */}
       <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at top right, ${tierColor}15 0%, transparent 70%)` }}></div>

       {/* Background Effects */}
       <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full blur-[100px] opacity-20 pointer-events-none" style={{ backgroundColor: tierColor }}></div>

       <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10 mb-10">
          {/* Left: Elite Probability Circle */}
          <div className="flex-1 flex flex-col items-center justify-center">
             <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Circular Progress Background */}
                <svg className="w-full h-full transform -rotate-90">
                   <circle cx="128" cy="128" r="110" stroke="#1e293b" strokeWidth="12" fill="none" />
                   <circle 
                     cx="128" cy="128" r="110" 
                     stroke={tierColor} 
                     strokeWidth="12" 
                     fill="none" 
                     strokeDasharray={691} // 2 * PI * 110
                     strokeDashoffset={691 - (691 * prob)}
                     strokeLinecap="round"
                     className="transition-all duration-1000 ease-out drop-shadow-[0_0_15px_currentColor]"
                   />
                </svg>
                <div className="absolute flex flex-col items-center">
                   <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Elite Prob</span>
                   <span className="text-6xl font-black text-white tracking-tighter">{(prob * 100).toFixed(1)}%</span>
                   <span className="mt-2 px-4 py-1 rounded-full text-xs font-black uppercase bg-white/10 border border-white/10" style={{ color: tierColor }}>
                      {tierLabel} TIER
                   </span>
                </div>
             </div>
          </div>

          {/* Right: Ranking & Percentile */}
          <div className="flex-1 w-full md:pl-10 md:border-l border-white/10 flex flex-col justify-center gap-10">
             
             {/* Percentile */}
             <div>
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">League Percentile</h4>
                <div className="flex items-baseline gap-3">
                   <span className="text-6xl font-black text-white">Top {percentile.toFixed(2)}%</span>
                </div>
                <div className="w-full h-4 bg-slate-800 rounded-full mt-4 overflow-hidden relative">
                   {/* Inverted scale: Lower percentile is better (left side) */}
                   <div 
                     className="absolute h-full rounded-full shadow-[0_0_15px_currentColor]" 
                     style={{ 
                        left: 0,
                        // Top 1% = 99% Quality. Top 99% = 1% Quality.
                        width: `${Math.max(100 - percentile, 0)}%`,
                        backgroundColor: tierColor 
                     }}
                   ></div>
                </div>
                <p className="text-slate-400 text-sm mt-2">
                   동일 보직 선수들 중 상위 <span className="text-white font-bold">{percentile}%</span> 수준의 성적이 예측됩니다.
                </p>
             </div>

             {/* Rank */}
             <div>
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Position Rank</h4>
                <div className="flex items-end gap-2">
                   <span className="text-5xl font-black text-white">{rank}</span>
                   <span className="text-2xl font-bold text-slate-500 mb-2">/ {total}</span>
                </div>
                <p className="text-slate-400 text-sm mt-2">
                   전체 {total}명의 해당 보직 선수 중 예상 순위입니다.
                </p>
             </div>
          </div>
       </div>

       {/* Bottom: 2025 Predicted Stats Grid */}
       <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-8 border-t border-white/10 relative z-10">
          <div className="bg-white/5 rounded-2xl p-4 flex flex-col items-center justify-center border border-white/5">
             <span className="text-xs font-bold text-slate-400 uppercase mb-1">ERA (평균자책점)</span>
             <span className="text-2xl font-black text-white" style={{ color: tierColor }}>{era2025?.toFixed(2) || '-'}</span>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 flex flex-col items-center justify-center border border-white/5">
             <span className="text-xs font-bold text-slate-400 uppercase mb-1">FIP (수비무관)</span>
             <span className="text-2xl font-black text-white">{fip2025?.toFixed(2) || '-'}</span>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 flex flex-col items-center justify-center border border-white/5">
             <span className="text-xs font-bold text-slate-400 uppercase mb-1">WHIP (이닝당출루)</span>
             <span className="text-2xl font-black text-white">{whip2025?.toFixed(2) || '-'}</span>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 flex flex-col items-center justify-center border border-white/5">
             <span className="text-xs font-bold text-slate-400 uppercase mb-1">IP (이닝)</span>
             <span className="text-2xl font-black text-white">{formatIp(ip2025)}</span>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 flex flex-col items-center justify-center border border-white/5 col-span-2 md:col-span-1">
             <span className="text-xs font-bold text-slate-400 uppercase mb-1">Role (작년 보직)</span>
             <span className="text-xl font-black text-white">{role || '-'}</span>
          </div>
       </div>
    </div>
  );
};


// --- MAIN COMPONENT ---

const PlayerPrediction: React.FC<PlayerPredictionProps> = ({ onCancel, user }) => {
  const [selectedTeamCode, setSelectedTeamCode] = useState<string>(
    user?.favoriteTeam ? (KOREAN_TO_CODE[user.favoriteTeam] || 'KIA') : 'KIA'
  );
  
  const [viewState, setViewState] = useState<'roster' | 'detail'>('roster');
  const [activeTab, setActiveTab] = useState<Role>('Batter'); 
  
  const [roster, setRoster] = useState<PlayerRosterItem[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerRosterItem | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'confirm' | 'error';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'success',
  });

  const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false }));

  // Load Roster when team or tab changes
  useEffect(() => {
    const fetchRoster = async () => {
      setLoading(true);
      
      const teamName = KOREAN_TEAM_NAMES[selectedTeamCode] || selectedTeamCode;
      const typeParam = activeTab === 'Batter' ? 'hitter' : 'pitcher';
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/players?team=${encodeURIComponent(teamName)}&type=${typeParam}`);
        
        if (!response.ok) {
          throw new Error('선수 명단을 불러오는 데 실패했습니다.');
        }

        const data: ServerPlayerDto[] = await response.json();
        
        const mappedRoster: PlayerRosterItem[] = data.map(item => ({
          id: item.playerId,
          name: item.name,
          backNumber: item.back_number,
          role: activeTab, 
          positionDetail: (item.position_type || (activeTab === 'Batter' ? '내야수' : '투수')) as PositionDetail
        }));

        setRoster(mappedRoster);
      } catch (error) {
        console.error("API Error:", error);
        setRoster([]); 
      } finally {
        setLoading(false);
        setViewState('roster');
        setSelectedPlayer(null);
        setPrediction(null);
      }
    };

    fetchRoster();
  }, [selectedTeamCode, activeTab]);

  // Handle Player Click -> Fetch Prediction
  const handlePlayerClick = async (player: PlayerRosterItem) => {
    setSelectedPlayer(player);
    setLoading(true);
    setViewState('detail'); 
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/prediction?playerId=${player.id}`);
      
      if (!response.ok) {
        throw new Error('예측 데이터를 불러오는데 실패했습니다.');
      }

      const data: ServerPredictionDto = await response.json();
      
      const isBatter = player.role === 'Batter';
      let metrics: StatMetric[] = [];

      if (isBatter) {
        // [타자 로직] Updated for Range & OPS Breakdown
        
        // 1. AVG
        metrics.push({
           type: 'avg',
           label: 'AVG (타율)',
           current: data.currAvg,
           predicted: data.predAvg,
           diff: data.avgDiff,
           min: data.avgMin,
           max: data.avgMax
        });

        // 2. HR
        metrics.push({
           type: 'hr',
           label: 'HR (홈런)',
           current: data.currHr,
           predicted: data.predHr,
           diff: data.hrDiff,
           min: data.hrMin,
           max: data.hrMax
        });

        // 3. OPS (with OBP/SLG)
        metrics.push({
           type: 'ops',
           label: 'OPS',
           current: data.currOps,
           predicted: data.predOps,
           diff: data.opsDiff,
           min: data.opsMin,
           max: data.opsMax,
           obp: {
              current: data.currObp || 0,
              predicted: data.predObp || 0,
              min: data.obpMin || 0,
              max: data.obpMax || 0,
              diff: data.diffObp || 0
           },
           slg: {
              current: data.currSlg || 0,
              predicted: data.predSlg || 0,
              min: data.slgMin || 0,
              max: data.slgMax || 0,
              diff: data.diffSlg || 0
           }
        });

      } else {
        // [투수 로직] Updated for Rank/Percentile + New Stats
        metrics.push({
           type: 'pitcher',
           label: 'Future Value',
           probElite: data.probElite,
           rolePercentileTop: data.rolePercentileTop,
           roleRank: data.roleRank,
           roleTotal: data.roleTotal,
           // New Fields
           era2025: data.era2025,
           fip2025: data.fip2025,
           ip2025: data.ip2025,
           whip2025: data.whip2025,
           role: data.role
        });
      }

      setPrediction({
        playerId: player.id,
        playerName: data.name,
        metrics: metrics,
        aiFeedback: data.aiReport || "AI 분석 리포트를 생성하지 못했습니다.",
        role: player.role
      });

    } catch (error) {
      console.error("Prediction API Error:", error);
      alert("분석 데이터를 가져오는 중 오류가 발생했습니다.");
      setViewState('roster');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToRoster = () => {
    setViewState('roster');
    setSelectedPlayer(null);
    setPrediction(null);
  };

  // Helper to clean report text (max 1 empty line)
  const cleanReportText = (text: string) => {
    if (!text) return "";
    // Replace multiple newlines with max 2 (one empty line)
    return text.replace(/\n{3,}/g, '\n\n').trim();
  };

  // Styles Helpers
  const getTeamColor = (code: string) => {
    return TEAMS.find(t => t.code === code)?.color || '#3b82f6';
  };
  const activeColor = getTeamColor(selectedTeamCode);
  const teamNameKR = KOREAN_TEAM_NAMES[selectedTeamCode] || selectedTeamCode;
  
  const isLightTeam = selectedTeamCode === 'KT';
  const textColorClass = isLightTeam ? 'text-slate-900' : 'text-white';
  const jerseyTextColor = isLightTeam ? '#000000' : '#ffffff';

  return (
    <div className="relative z-10 w-full animate-fade-in-up min-h-screen pb-20 overflow-hidden">
      <style>{`
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-right {
          animation: slideRight 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `}</style>

      {/* Background Watermark */}
      <div 
        className="fixed -right-[10%] top-[20%] text-[20vw] font-black opacity-[0.03] pointer-events-none select-none transition-colors duration-700"
        style={{ color: activeColor }}
      >
        {selectedTeamCode}
      </div>

      {/* Main Container */}
      <div className="w-[95%] max-w-[1600px] mx-auto px-4 md:px-8 py-12">
        
        {/* Top Navigation / Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6 border-b border-white/5 pb-8 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center space-x-2 bg-brand-glow/10 border border-brand-glow/20 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm">
               <span className="w-2 h-2 rounded-full bg-brand-glow animate-pulse"></span>
               <span className="text-xs md:text-sm font-mono text-brand-glow font-bold uppercase tracking-widest">
                 AI Powered Simulation
               </span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-4">
              FUTURE <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-glow to-pink-500">PERFORMANCE</span>
            </h2>
            <p className="text-slate-400 text-xl md:text-2xl font-light">
              2026 시즌 종료 시점의 성적을 AI가 미리 예측합니다.
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
           <div className="absolute -inset-1 bg-gradient-to-r from-brand-glow/20 to-transparent blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
           <div className="relative bg-[#0f172a]/80 backdrop-blur-xl border border-brand-glow/20 rounded-[2rem] p-10 text-left shadow-2xl flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0 md:w-48">
                 <div className="inline-block">
                     <div className="w-12 h-1 bg-brand-glow rounded-full mb-2"></div>
                     <span className="text-brand-glow font-bold tracking-widest uppercase text-sm block mb-1">DUGOUT</span>
                     <span className="text-white font-black tracking-tighter uppercase text-2xl block">AI MODEL</span>
                 </div>
              </div>
              <div className="flex-1">
                  <p className="text-slate-300 leading-relaxed text-lg font-light tracking-wide word-keep mb-6">
                     지난 10년간 KBO 리그의 <span className="font-bold text-white">방대한 빅데이터</span>를 정밀 학습한 
                     <span className="text-brand-glow font-bold"> '더그아웃'</span>만의 <span className="text-brand-glow font-bold">독자적인 AI 분석 모델</span>의 결과입니다.
                  </p>
                  <p className="text-slate-300 leading-relaxed text-lg font-light tracking-wide word-keep">
                     단순히 미래의 숫자를 맞히는 것을 넘어, 수백 가지 지표 중 무엇이 선수의 성적을 결정짓는 <span className="text-white font-bold">핵심 동력</span>인지를 심층 분석했습니다. 
                     2026년 시즌, 이 선수의 성적을 뒤바꿀 <span className="text-brand-glow font-bold">숨겨진 원인</span>과 <span className="text-white font-bold">현실적인 퍼포먼스 궤적</span>을 지금 확인해 보세요.
                  </p>
              </div>
           </div>
        </div>

        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          
          {/* Sidebar: Team Selector */}
          <div className="w-full lg:w-72 flex-shrink-0 z-20">
             <div className="sticky top-24">
               <label className="block text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest px-2">Select Team</label>
               <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-3 pb-4 lg:pb-0 no-scrollbar">
                 {TEAMS.map((team) => (
                   <button
                     key={team.code}
                     onClick={() => setSelectedTeamCode(team.code)}
                     disabled={viewState === 'detail'}
                     className={`
                       flex-shrink-0 flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-500 ease-out w-auto lg:w-full group relative overflow-hidden
                       ${selectedTeamCode === team.code 
                         ? 'bg-white text-brand-dark shadow-[0_0_30px_rgba(255,255,255,0.4)] lg:translate-x-6 scale-105 z-10' 
                         : 'bg-[#0a0f1e] text-slate-400 border border-white/5 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:lg:translate-x-2'
                       }
                     `}
                   >
                     <div 
                       className={`w-1.5 h-10 rounded-full transition-all duration-300 ${selectedTeamCode === team.code ? 'scale-y-100' : 'scale-y-50 group-hover:scale-y-75'}`}
                       style={{ backgroundColor: team.color }}
                     ></div>
                     <div className="text-left flex-1">
                        <span className="block font-bold text-lg leading-none whitespace-nowrap">
                          {KOREAN_TEAM_NAMES[team.code] || team.code}
                        </span>
                     </div>
                   </button>
                 ))}
               </div>
             </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 min-h-[800px] relative">
            
            {/* Team Banner */}
            <div className="mb-10 animate-fade-in-up">
              <div 
                className="rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-2xl group transition-all duration-500"
                style={{ 
                  backgroundColor: activeColor,
                  boxShadow: `0 0 50px -10px ${activeColor}88`
                }}
              >
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
                 <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-black/10 to-black/40 pointer-events-none"></div>
                 {isLightTeam && <div className="absolute inset-0 bg-white/30 pointer-events-none"></div>}
                 
                 <div className="relative z-10 flex flex-col justify-center min-h-[120px]">
                      <h3 className={`text-4xl md:text-6xl font-black drop-shadow-sm tracking-tight ${textColorClass}`}>
                        {teamNameKR} <span className="font-light opacity-80">2026 시즌 성적 예측</span>
                      </h3>
                 </div>
              </div>
            </div>

            {/* CONTENT AREA */}
            {viewState === 'roster' && (
              <div className="animate-slide-right" key={`${selectedTeamCode}-${activeTab}`}>
                {/* Tabs */}
                <div className="flex gap-4 mb-8">
                  <button 
                    onClick={() => setActiveTab('Batter')}
                    className={`px-8 py-3 rounded-2xl font-black text-lg transition-all ${activeTab === 'Batter' ? 'bg-white text-black shadow-lg scale-105' : 'bg-white/5 text-slate-500 hover:text-white'}`}
                  >
                    타자 (Batters)
                  </button>
                  <button 
                    onClick={() => setActiveTab('Pitcher')}
                    className={`px-8 py-3 rounded-2xl font-black text-lg transition-all ${activeTab === 'Pitcher' ? 'bg-white text-black shadow-lg scale-105' : 'bg-white/5 text-slate-500 hover:text-white'}`}
                  >
                    투수 (Pitchers)
                  </button>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {loading ? (
                    [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                      <div key={i} className="aspect-[3/4] bg-white/5 rounded-3xl animate-pulse"></div>
                    ))
                  ) : roster.length > 0 ? (
                    roster.map((player) => (
                      <JerseyCard 
                        key={player.id} 
                        player={player} 
                        color={activeColor} 
                        textColor={jerseyTextColor}
                        onClick={() => handlePlayerClick(player)} 
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-20 text-slate-500 bg-[#0a0f1e]/50 rounded-[2rem] border border-white/5">
                      <p className="text-xl font-bold mb-2">선수 데이터가 없습니다.</p>
                      <p className="text-sm">해당 포지션의 선수 명단을 불러오지 못했습니다.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* DETAIL VIEW */}
            {viewState === 'detail' && selectedPlayer && (
              <div className="animate-scale-up space-y-8 relative">
                {/* Dynamic Background for Detail View */}
                <div 
                  className="absolute top-20 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl -z-10 opacity-30 pointer-events-none blur-[120px]"
                  style={{ 
                    background: `radial-gradient(circle at center, ${activeColor} 0%, transparent 70%)` 
                  }}
                ></div>

                {/* Back Button */}
                <button 
                  onClick={handleBackToRoster}
                  className="mb-4 flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-6 py-3 rounded-full border border-white/5"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  <span className="font-bold">선수 목록으로 돌아가기</span>
                </button>

                {loading || !prediction ? (
                  <div className="h-[600px] bg-white/5 rounded-[2.5rem] animate-pulse flex items-center justify-center flex-col gap-6 relative overflow-hidden">
                     <div className="w-24 h-24 relative">
                        <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                     </div>
                     <div className="text-center z-10">
                       <p className="text-white font-bold text-2xl mb-2">AI Analyzing...</p>
                       <p className="text-slate-400 font-light text-base">Bedrock AI가 {selectedPlayer.name} 선수의<br/>2026 시즌 데이터를 시뮬레이션 중입니다.</p>
                     </div>
                  </div>
                ) : (
                  <>
                  {/* 1. Header: Player Info */}
                  <div 
                    className="relative p-10 md:p-12 rounded-[3rem] overflow-hidden shadow-2xl group"
                    style={{ 
                      border: `1px solid ${activeColor}44`,
                      background: `linear-gradient(145deg, ${activeColor}11 0%, #0a0f1e 100%)`,
                      boxShadow: `0 0 50px -20px ${activeColor}33, inset 0 0 40px -20px ${activeColor}22`
                    }}
                  >
                      {/* Inner Neon Gradient */}
                      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at top right, ${activeColor}15 0%, transparent 70%)` }}></div>

                      <div className="absolute top-0 right-0 w-96 h-96 opacity-10 rounded-full blur-[120px] pointer-events-none" style={{ backgroundColor: activeColor }}></div>
                      
                      <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                         <div 
                           className="flex items-center justify-center w-32 h-32 md:w-40 md:h-40 bg-white/5 rounded-[2.5rem] border border-white/10 shadow-2xl backdrop-blur-md"
                           style={{ borderColor: `${activeColor}44`, boxShadow: `0 0 30px ${activeColor}22` }}
                         >
                           <span className="text-6xl md:text-7xl font-black italic tracking-tighter text-white" style={{ textShadow: `0 0 20px ${activeColor}88` }}>
                             {selectedPlayer.backNumber}
                           </span>
                         </div>

                         <div className="text-center md:text-left flex-1">
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                               <span className="px-4 py-1 bg-white/10 rounded-full text-xs font-bold text-white border border-white/10">{selectedPlayer.positionDetail}</span>
                               <span className="font-bold tracking-widest text-xs uppercase" style={{ color: activeColor }}>{teamNameKR}</span>
                            </div>
                            <h2 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter mb-2">{selectedPlayer.name}</h2>
                            <p className="text-slate-400 text-lg font-light">2026 Season Performance Prediction</p>
                         </div>

                         {/* Add to Dashboard Button */}
                         <button
                           onClick={async () => {
                             if (!selectedPlayer) return;
                             const token = localStorage.getItem('accessToken');
                             if (!token) {
                               setModalState({
                                 isOpen: true,
                                 title: '로그인 필요',
                                 message: '로그인이 필요한 서비스입니다.',
                                 type: 'error',
                               });
                               return;
                             }
                             try {
                               const response = await fetch(`${API_BASE_URL}/api/v1/dashboard/player`, {
                                 method: 'POST',
                                 headers: {
                                   'Authorization': `Bearer ${token}`,
                                   'Content-Type': 'application/json',
                                 },
                                 body: JSON.stringify({ playerId: selectedPlayer.id }),
                               });
                               if (response.ok) {
                                 setModalState({
                                   isOpen: true,
                                   title: '선수 추가 완료',
                                   message: '대시보드에 선수가 성공적으로 추가되었습니다.',
                                   type: 'success',
                                 });
                               } else {
                                 const errorMsg = await response.text();
                                 setModalState({
                                   isOpen: true,
                                   title: '선수 추가 실패',
                                   message: errorMsg,
                                   type: 'error',
                                 });
                               }
                             } catch (error) {
                               console.error("Add to Dashboard Error:", error);
                               setModalState({
                                 isOpen: true,
                                 title: '오류 발생',
                                 message: '서버 통신 중 오류가 발생했습니다.',
                                 type: 'error',
                               });
                             }
                           }}
                           className="flex items-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg group/btn"
                           style={{ 
                             backgroundColor: activeColor, 
                             color: isLightTeam ? '#000' : '#fff',
                             boxShadow: `0 10px 20px -5px ${activeColor}66`
                           }}
                         >
                           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                           </svg>
                           <span>대시보드에 추가하기</span>
                         </button>
                      </div>
                  </div>

                  {/* 2. Charts Grid */}
                  <div className={`grid grid-cols-1 ${prediction.role === 'Pitcher' ? 'grid-cols-1' : 'md:grid-cols-2'} gap-6`}>
                     {prediction.metrics.map((metric, idx) => (
                       <React.Fragment key={idx}>
                          {metric.type === 'pitcher' ? (
                            <PitcherRankCard metric={metric} color={activeColor} />
                          ) : metric.type === 'ops' ? (
                            <OpsAnalysisChart metric={metric} color={activeColor} />
                          ) : (
                            <BatterRangeChart metric={metric} color={activeColor} />
                          )}
                       </React.Fragment>
                     ))}
                  </div>

                  {/* 3. Feedback Report */}
                  <div 
                    className="flex-1 p-10 md:p-14 rounded-[3rem] relative overflow-hidden shadow-2xl"
                    style={{ 
                      border: `1px solid ${activeColor}44`,
                      background: `linear-gradient(145deg, ${activeColor}05 0%, #0f172a 100%)`,
                      boxShadow: `0 0 40px -10px ${activeColor}22`
                    }}
                  >
                    {/* Inner Neon Gradient */}
                    <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at top right, ${activeColor}10 0%, transparent 60%)` }}></div>

                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-white/5 to-transparent rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50"></div>
                    
                    <div className="relative z-10">
                      <div className="mb-10 flex items-center justify-between border-b border-white/5 pb-8">
                        <div>
                          <h4 
                            className="text-4xl font-black text-white tracking-tight mb-2 uppercase italic"
                            style={{ textShadow: `0 0 30px ${activeColor}66` }}
                          >
                            DUGOUT <span style={{ color: activeColor, textShadow: `0 0 20px ${activeColor}` }}>REPORT</span>
                          </h4>
                          <span className="text-xs text-slate-500 font-bold uppercase tracking-[0.3em] pl-1">Advanced AI Analysis</span>
                        </div>
                      </div>
                      
                      <div className="relative pl-0 md:pl-4">
                         <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-white/10 to-transparent hidden md:block" style={{ backgroundColor: `${activeColor}44` }}></div>
                         
                         <div className="md:pl-10">
                           {/* Font size adjusted to text-xl as requested */}
                           <div className="text-slate-200 leading-relaxed font-medium text-xl tracking-wide font-serif text-justify">
                             <ReactMarkdown
                               components={{
                                 h1: ({node, ...props}) => <h1 className="text-3xl font-black mb-6 mt-8 pb-2 border-b border-white/10" style={{ color: activeColor }} {...props} />,
                                 h2: ({node, ...props}) => <h2 className="text-2xl font-bold mb-4 mt-8" style={{ color: activeColor }} {...props} />,
                                 h3: ({node, ...props}) => <h3 className="text-xl font-bold mb-3 mt-6 text-white" {...props} />,
                                 strong: ({node, ...props}) => <span className="font-black" style={{ color: activeColor }} {...props} />,
                                 p: ({node, ...props}) => <p className="mb-6 last:mb-0 leading-loose" style={{ fontFamily: '"Noto Serif KR", serif' }} {...props} />,
                                 li: ({node, ...props}) => <li className="mb-2 ml-4 list-disc marker:text-slate-500" {...props} />
                               }}
                             >
                               {cleanReportText(prediction.aiFeedback)}
                             </ReactMarkdown>
                           </div>
                         </div>
                      </div>
                    </div>
                  </div>
                  </>
                )}
              </div>
            )}
            
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />
    </div>
  );
};

export default PlayerPrediction;
