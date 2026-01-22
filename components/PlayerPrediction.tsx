
import React, { useState, useEffect } from 'react';
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

// 서버 Prediction 응답 DTO
interface ServerPredictionDto {
  name: string;
  backNumber: number;
  position: string;

  // --- 타자 전용 지표 ---
  predAvg?: number;
  predHr?: number;
  predOps?: number;
  avgDiff?: number;
  hrDiff?: number;
  opsDiff?: number;
  currentAvg?: number;
  currentHr?: number;
  currentOps?: number;

  // --- 투수 전용 지표 ---
  currentEra?: number;      // 현재 ERA
  currentWhip?: number;     // 현재 WHIP
  eraEliteProb?: number;    // 내년 ERA 엘리트 확률 (0.0 ~ 1.0)
  whipEliteProb?: number;   // 내년 WHIP 엘리트 확률 (0.0 ~ 1.0)

  aiReport: string;
}

interface StatMetric {
  label: string;
  current: number | string; // 2025 Actual
  predicted: number | string; // 2026 Predicted (Batters) OR Probability (Pitchers)
  diff?: number; // (+/- value) - Only for Batters
  unit?: string;
  maxScale?: number; // 차트 그릴 때 최대값 기준
  
  // 투수 전용 필드
  isProbability?: boolean; // 확률 기반 데이터인지 여부
}

interface PredictionResult {
  playerId: number;
  playerName: string;
  metrics: StatMetric[];
  aiFeedback: string;
  role: Role; // Role 추가 (렌더링 분기용)
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
      {/* Jersey SVG Shape - Increased Size to 220px */}
      <div className="relative w-full max-w-[220px] drop-shadow-2xl group-hover:drop-shadow-[0_25px_50px_rgba(255,255,255,0.25)] transition-all duration-500">
        <svg 
          viewBox="0 0 240 240" 
          className="w-full h-auto"
        >
          {/* Main Body Path */}
          <path 
            d="M90,20 Q120,40 150,20 L210,50 L230,80 L180,95 L180,230 L60,230 L60,95 L10,80 L30,50 L90,20 Z" 
            fill={color} 
            stroke="rgba(255,255,255,0.2)" 
            strokeWidth="2"
          />
          {/* Collar Line */}
          <path d="M90,20 Q120,40 150,20" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="3" />
          {/* Sleeve Lines */}
          <line x1="30" y1="50" x2="60" y2="95" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
          <line x1="210" y1="50" x2="180" y2="95" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
          {/* Name */}
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
          {/* Number */}
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

interface ComparisonChartProps {
  metric: StatMetric;
  color: string;
}

const VerticalComparisonChart: React.FC<ComparisonChartProps> = ({ metric, color }) => {
  const current = Number(metric.current);
  const predicted = Number(metric.predicted);
  const max = metric.maxScale || Math.max(current, predicted) * 1.2;
  
  const VISUAL_MAX_HEIGHT = 200; 
  const hCurrentPx = Math.max((current / max) * VISUAL_MAX_HEIGHT, 4);
  const hPredictedPx = Math.max((predicted / max) * VISUAL_MAX_HEIGHT, 4);
  
  const isUp = predicted >= current;
  const diffVal = Math.abs(Number(metric.diff));
  
  const diffText = metric.label.includes('AVG') ? diffVal.toFixed(3) : diffVal.toFixed(0);

  return (
    <div 
      className="bg-[#0f172a]/80 backdrop-blur-sm rounded-[2rem] p-8 border border-white/5 flex flex-col h-full relative overflow-hidden group min-h-[420px] transition-all hover:bg-[#0f172a]"
      style={{ boxShadow: `0 0 20px -10px ${color}44`, borderColor: `${color}33` }}
    >
      <div className="flex justify-between items-start mb-8 z-10 relative">
        <h4 className="text-2xl font-black text-white uppercase tracking-tight">{metric.label}</h4>
        
        <div className={`px-4 py-2 rounded-xl text-base font-black flex items-center gap-2 border shadow-lg ${isUp ? 'bg-green-500/10 text-green-400 border-green-500/30 shadow-green-500/10' : 'bg-red-500/10 text-red-400 border-red-500/30 shadow-red-500/10'}`}>
           <span className="text-xl">{isUp ? '▲' : '▼'}</span>
           <span>{diffText}</span>
        </div>
      </div>

      <div className="flex-1 flex items-end justify-center gap-12 z-10 relative pb-6 w-full h-[280px]">
         {/* 2025 Bar */}
         <div className="flex flex-col items-center justify-end group/bar flex-1 relative h-full">
            <div className="w-full max-w-[60px] h-[200px] bg-white/5 rounded-t-xl absolute bottom-6 left-1/2 -translate-x-1/2"></div>
            <div className="flex flex-col items-center relative w-full max-w-[60px] z-10 mb-6">
                <span className="text-lg font-mono font-bold text-slate-400 mb-2">{metric.current}</span>
                <div className="w-full bg-slate-500 rounded-t-xl relative overflow-hidden transition-all duration-1000 shadow-lg" style={{ height: `${hCurrentPx}px` }}></div>
            </div>
            <span className="absolute bottom-0 text-sm font-bold text-slate-500">2025</span>
         </div>
         {/* 2026 Bar */}
         <div className="flex flex-col items-center justify-end group/bar flex-1 relative h-full">
            <div className="w-full max-w-[60px] h-[200px] bg-white/5 rounded-t-xl absolute bottom-6 left-1/2 -translate-x-1/2"></div>
            <div className="flex flex-col items-center relative w-full max-w-[60px] z-10 mb-6">
                <span className="text-3xl font-mono font-black text-white mb-2 drop-shadow-md scale-105 transition-transform" style={{ color: color, textShadow: `0 0 20px ${color}66` }}>
                    {metric.predicted}
                </span>
                <div className="w-full rounded-t-xl relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-1000" style={{ height: `${hPredictedPx}px`, backgroundColor: color }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
            </div>
            <span className="absolute bottom-0 text-sm font-bold text-white" style={{ color: color }}>2026</span>
         </div>
      </div>
    </div>
  );
};

const HorizontalComparisonChart: React.FC<ComparisonChartProps> = ({ metric, color }) => {
  const current = Number(metric.current);
  const predicted = Number(metric.predicted);
  const max = metric.maxScale || 1.2;
  const pctCurrent = Math.min((current / max) * 100, 100);
  const pctPredicted = Math.min((predicted / max) * 100, 100);
  const diff = predicted - current;

  return (
    <div 
      className="bg-[#0f172a]/80 backdrop-blur-sm rounded-[2rem] p-10 border border-white/5 shadow-lg relative overflow-hidden flex flex-col justify-center gap-10 h-full min-h-[420px]"
      style={{ boxShadow: `0 0 20px -10px ${color}44`, borderColor: `${color}33` }}
    >
       <div className="flex justify-between items-start">
         <h4 className="text-3xl font-black text-white uppercase tracking-tight">{metric.label}</h4>
         <div className="text-right flex flex-col items-end">
            <span className="text-sm text-slate-500 font-mono mb-2 tracking-widest font-bold">2026 PREDICTION</span>
            <div className="flex items-center gap-4">
               <span className="text-6xl font-black text-white" style={{ color: color, textShadow: `0 0 20px ${color}66` }}>
                 {metric.predicted}
               </span>
               <div className={`px-4 py-2 rounded-xl text-lg font-black border-2 ${diff >= 0 ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                 {diff >= 0 ? '▲' : '▼'} {Math.abs(diff).toFixed(3)}
               </div>
            </div>
         </div>
       </div>

       <div className="space-y-8 w-full mt-2">
          {/* Current */}
          <div className="relative w-full">
             <div className="flex justify-between text-sm font-bold text-slate-400 mb-3">
               <span>2025 SEASON</span>
               <span className="font-mono text-lg">{metric.current}</span>
             </div>
             <div className="w-full h-5 bg-slate-800/50 rounded-full overflow-hidden border border-white/5">
               <div style={{ width: `${pctCurrent}%` }} className="h-full bg-slate-500 rounded-full"></div>
             </div>
          </div>

          {/* Predicted */}
          <div className="relative w-full">
             <div className="flex justify-between text-sm font-bold mb-3" style={{ color: color }}>
               <span>2026 FORECAST</span>
               <span className="font-mono text-lg">{metric.predicted}</span>
             </div>
             <div className="w-full h-8 bg-slate-800/50 rounded-full overflow-hidden shadow-inner relative border border-white/10">
                <div style={{ width: `${pctPredicted}%`, backgroundColor: color }} className="h-full rounded-full transition-all duration-1000 relative z-10 shadow-[0_0_20px_currentColor]">
                   <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

// --- PITCHER CHART (NEW) ---

interface PitcherFutureCardProps {
  metric: StatMetric;
  color: string;
}

// 투수용 미래 가치 시각화 카드
const PitcherFutureCard: React.FC<PitcherFutureCardProps> = ({ metric, color }) => {
  const probability = Number(metric.predicted); // 0.0 ~ 1.0
  const percentage = Math.min(Math.max(probability * 100, 5), 100); // 5% ~ 100%

  // Tier Calculation
  let tierLabel = "LOW";
  let tierSubText = "Developing";
  let tierColor = "#94a3b8"; // Slate 400

  if (probability >= 0.70) {
    tierLabel = "ELITE";
    tierSubText = "Top Class Potential";
    tierColor = "#06b6d4"; // Cyan (Diamond)
  } else if (probability >= 0.50) {
    tierLabel = "POTENTIAL";
    tierSubText = "High Upside";
    tierColor = "#ec4899"; // Pink (Gold equivalent vibe)
  } else if (probability >= 0.30) {
    tierLabel = "AVERAGE";
    tierSubText = "League Average";
    tierColor = "#22c55e"; // Green
  } else {
    tierLabel = "LOW";
    tierSubText = "Risk Factor";
    tierColor = "#64748b"; // Slate 500
  }

  return (
    <div 
      className="bg-[#0a0f1e]/90 backdrop-blur-sm rounded-[2.5rem] p-10 border border-white/5 flex flex-col justify-between h-full min-h-[420px] relative overflow-hidden group shadow-xl"
      style={{ borderColor: `${tierColor}44` }}
    >
      {/* Background Tier Glow */}
      <div 
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[80px] opacity-20 pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: tierColor }}
      ></div>

      {/* Header */}
      <div className="relative z-10">
        <h4 
          className="text-xl font-bold text-white uppercase tracking-widest mb-2"
          style={{ textShadow: `0 0 15px ${color}` }} // 팀 컬러 네온 효과
        >
          {metric.label} Future Value
        </h4>
        <div className="flex items-baseline gap-3">
           <span className="text-7xl font-black text-white tracking-tighter">{metric.current}</span>
           <span className="text-lg font-bold text-slate-400">2025년 성적</span>
        </div>
      </div>

      {/* Probability Gauge */}
      <div className="relative z-10 mt-8">
         <div className="flex justify-between items-end mb-4">
            <div className="flex flex-col">
               <span className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">2026 Elite Probability</span>
               <span className="text-5xl font-black italic tracking-tight" style={{ color: tierColor, textShadow: `0 0 15px ${tierColor}66` }}>
                 {(probability * 100).toFixed(1)}%
               </span>
            </div>
            <div className="text-right">
               <span className={`px-5 py-2 rounded-xl text-base font-black uppercase tracking-widest border bg-black/30`} style={{ borderColor: tierColor, color: tierColor }}>
                 {tierLabel} TIER
               </span>
            </div>
         </div>

         {/* Progress Bar Container */}
         <div className="h-8 w-full bg-slate-800/50 rounded-full overflow-hidden border border-white/5 relative">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex justify-between px-1 z-20 pointer-events-none">
               <div className="w-[1px] h-full bg-black/20"></div>
               <div className="w-[1px] h-full bg-black/20"></div>
               <div className="w-[1px] h-full bg-black/20"></div>
               <div className="w-[1px] h-full bg-black/20"></div>
            </div>
            
            {/* Fill Bar - UNIFIED COLOR (Cyan/Blue Gradient) */}
            <div 
              className="h-full rounded-full transition-all duration-1000 relative z-10 shadow-[0_0_20px_rgba(34,211,238,0.5)]"
              style={{ width: `${percentage}%` }}
            >
               {/* 통일된 바 색상 */}
               <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
               <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent"></div>
            </div>
         </div>
         
         <div className="flex justify-between text-sm font-bold text-slate-500 mt-3 uppercase tracking-widest">
            <span>Low</span>
            <span>Average</span>
            <span>Potential</span>
            <span>Elite</span>
         </div>
      </div>

      <div className="relative z-10 mt-6 pt-6 border-t border-white/5">
         <p className="text-base text-slate-400 font-medium flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tierColor }}></span>
            Analysis: <span className="text-slate-200 font-bold">{tierSubText}</span>
         </p>
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

  // Load Roster when team or tab changes
  useEffect(() => {
    const fetchRoster = async () => {
      setLoading(true);
      
      const teamName = KOREAN_TEAM_NAMES[selectedTeamCode] || selectedTeamCode;
      // API Call: type 파라미터 추가 (hitter / pitcher)
      const typeParam = activeTab === 'Batter' ? 'hitter' : 'pitcher';
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/players?team=${encodeURIComponent(teamName)}&type=${typeParam}`);
        
        if (!response.ok) {
          throw new Error('선수 명단을 불러오는 데 실패했습니다.');
        }

        const data: ServerPlayerDto[] = await response.json();
        
        // Map Server DTO to Frontend State
        const mappedRoster: PlayerRosterItem[] = data.map(item => ({
          id: item.playerId,
          name: item.name,
          backNumber: item.back_number,
          role: activeTab, // 현재 탭 기준으로 Role 설정
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
  }, [selectedTeamCode, activeTab]); // activeTab 변경 시에도 재호출

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
        // [타자 로직] 기존 유지
        const predAvg = data.predAvg || 0;
        const avgDiff = data.avgDiff || 0;
        const currentAvg = data.currentAvg || (predAvg - avgDiff);

        const predHr = data.predHr || 0;
        const hrDiff = data.hrDiff || 0;
        const currentHr = data.currentHr || (predHr - hrDiff);

        const predOps = data.predOps || 0;
        const opsDiff = data.opsDiff || 0;
        const currentOps = data.currentOps || (predOps - opsDiff);

        metrics = [
          { label: 'AVG (타율)', current: currentAvg.toFixed(3), predicted: predAvg.toFixed(3), diff: avgDiff, maxScale: 0.400 },
          { label: 'HR (홈런)', current: currentHr, predicted: predHr, diff: hrDiff, unit: '개', maxScale: 50 },
          { label: 'OPS (출루+장타)', current: currentOps.toFixed(3), predicted: predOps.toFixed(3), diff: opsDiff, maxScale: 1.2 },
        ];
      } else {
        // [투수 로직] 업데이트: 확률 기반 데이터 매핑
        // DTO 필드: currentEra, currentWhip, eraEliteProb, whipEliteProb
        
        const currentEra = data.currentEra ?? 0;
        const eraProb = data.eraEliteProb ?? 0; // 0.0 ~ 1.0

        const currentWhip = data.currentWhip ?? 0;
        const whipProb = data.whipEliteProb ?? 0; // 0.0 ~ 1.0

        metrics = [
          { 
            label: 'ERA', 
            current: currentEra.toFixed(2), 
            predicted: eraProb, // 여기서는 확률값을 저장
            isProbability: true 
          },
          { 
            label: 'WHIP', 
            current: currentWhip.toFixed(2), 
            predicted: whipProb, // 여기서는 확률값을 저장
            isProbability: true 
          },
        ];
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

      {/* Main Container - Extended Width */}
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

        {/* AI Notice Box - Improved Design (2-Column & Left Align) */}
        <div className="w-full max-w-5xl mx-auto mb-16 relative group">
           <div className="absolute -inset-1 bg-gradient-to-r from-brand-glow/20 to-transparent blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
           <div className="relative bg-[#0f172a]/80 backdrop-blur-xl border border-brand-glow/20 rounded-[2rem] p-10 text-left shadow-2xl flex flex-col md:flex-row gap-8 items-start">
              
              {/* Left: Title/Badge */}
              <div className="flex-shrink-0 md:w-48">
                 <div className="inline-block">
                     <div className="w-12 h-1 bg-brand-glow rounded-full mb-2"></div>
                     <span className="text-brand-glow font-bold tracking-widest uppercase text-sm block mb-1">DUGOUT</span>
                     <span className="text-white font-black tracking-tighter uppercase text-2xl block">AI MODEL</span>
                 </div>
              </div>
              
              {/* Right: Text Body */}
              <div className="flex-1">
                  <p className="text-slate-300 leading-relaxed text-lg font-light tracking-wide word-keep mb-6">
                     지난 10년간 KBO 리그를 거쳐간 <span className="font-bold text-white">모든 선수의 커리어 데이터</span>를 정밀 학습한 
                     <span className="text-brand-glow font-bold"> '더그아웃'</span>만의 독자적인 머신러닝 모델 분석 결과입니다.
                  </p>
                  <p className="text-slate-300 leading-relaxed text-lg font-light tracking-wide word-keep">
                     우리는 선수의 과거 성적뿐만 아니라 신체적 변화의 핵심인 <span className="text-white font-bold">에이징 커브 패턴</span>을 심층 분석하여, 
                     2026년 시즌에 펼쳐질 이 선수의 가장 <span className="text-brand-glow font-bold">현실적이고도 과학적인 퍼포먼스 궤적</span>을 예측했습니다.
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
                     disabled={viewState === 'detail'} // Disable while in detail view
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
            
            {/* Team Banner (Always Visible) */}
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

            {/* CONTENT AREA: Switch between ROSTER and DETAIL */}
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

                {/* Grid - Dense & Small Cards */}
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

            {/* DETAIL VIEW: Prediction Analysis */}
            {viewState === 'detail' && selectedPlayer && (
              <div className="animate-scale-up space-y-8">
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
                    className="relative p-10 md:p-12 bg-[#0a0f1e] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl group"
                    style={{ borderColor: `${activeColor}44`, boxShadow: `0 20px 50px -20px ${activeColor}22` }}
                  >
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

                         <div className="text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                               <span className="px-4 py-1 bg-white/10 rounded-full text-xs font-bold text-white border border-white/10">{selectedPlayer.positionDetail}</span>
                               <span className="font-bold tracking-widest text-xs uppercase" style={{ color: activeColor }}>{teamNameKR}</span>
                            </div>
                            <h2 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter mb-2">{selectedPlayer.name}</h2>
                            <p className="text-slate-400 text-lg font-light">2026 Season Performance Prediction</p>
                         </div>
                      </div>
                  </div>

                  {/* 2. Charts Grid (Top Row) */}
                  <div className={`grid grid-cols-1 ${prediction.role === 'Pitcher' ? 'lg:grid-cols-2' : 'xl:grid-cols-3'} gap-6`}>
                     {prediction.metrics.map((metric, idx) => (
                       <div key={idx} className="w-full">
                          {prediction.role === 'Pitcher' ? (
                            <PitcherFutureCard metric={metric} color={activeColor} />
                          ) : (
                            idx === prediction.metrics.length - 1 ? (
                              <HorizontalComparisonChart metric={metric} color={activeColor} />
                            ) : (
                              <VerticalComparisonChart metric={metric} color={activeColor} />
                            )
                          )}
                       </div>
                     ))}
                  </div>

                  {/* 3. Feedback Report (Bottom Row - Full Width) */}
                  <div 
                    className="flex-1 p-10 md:p-14 bg-[#0f172a] border border-white/10 rounded-[3rem] relative overflow-hidden shadow-2xl"
                    style={{ borderColor: `${activeColor}33`, boxShadow: `0 0 40px -10px ${activeColor}11` }}
                  >
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-white/5 to-transparent rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50"></div>
                    
                    <div className="relative z-10">
                      <div className="mb-10 flex items-center justify-between border-b border-white/5 pb-8">
                        <div>
                          <h4 
                            className="text-4xl font-black text-white tracking-tight mb-2 uppercase italic"
                            style={{ textShadow: `0 0 30px ${activeColor}66` }}
                          >
                            DUGOUT <span style={{ color: activeColor }}>REPORT</span>
                          </h4>
                          <span className="text-xs text-slate-500 font-bold uppercase tracking-[0.3em] pl-1">Advanced AI Analysis</span>
                        </div>
                        
                        {/* Confidence Level 제거 */}
                      </div>
                      
                      <div className="relative pl-0 md:pl-4">
                         <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-white/10 to-transparent hidden md:block" style={{ backgroundColor: `${activeColor}44` }}></div>
                         
                         <div className="md:pl-10">
                           {/* 폰트 크기 확대 */}
                           <p className="text-slate-200 leading-loose font-normal text-2xl md:text-3xl whitespace-pre-line tracking-wide font-sans text-justify">
                             {prediction.aiFeedback}
                           </p>
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
    </div>
  );
};

// --- MOCK DATA GENERATORS (COMMENTED OUT) ---
/*
const generateMockRoster = (teamCode: string): PlayerRosterItem[] => {
  const baseId = teamCode.length * 100;
  return [
    { id: baseId + 1, name: '김도영', backNumber: 5, role: 'Batter', positionDetail: '내야수' },
    // ...
  ];
};

const generateMockPrediction = (player: PlayerRosterItem): PredictionResult => {
  // ...
};
*/

// 임시 Roster Fetcher (실제로는 fetchRoster 내부 로직 사용)
// 기존 useEffect에서 generateMockRoster 호출 부분을 API 호출로 변경했으므로 이 함수들은 더 이상 사용되지 않음.

const generateMockRoster = (teamCode: string): PlayerRosterItem[] => {
    // MOCK DATA REMOVED / COMMENTED OUT
    return [];
}

const generateMockPrediction = (player: PlayerRosterItem): PredictionResult => {
    // MOCK DATA REMOVED / COMMENTED OUT
    return {
        playerId: 0,
        playerName: "",
        metrics: [],
        aiFeedback: "",
        role: 'Batter'
    };
}

export default PlayerPrediction;
