
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

// --- TYPES ---
type Role = 'Pitcher' | 'Batter';
type PositionDetail = '투수' | '포수' | '내야수' | '외야수';

interface PlayerRosterItem {
  id: number;
  name: string;
  backNumber: number;
  role: Role;
  positionDetail: PositionDetail;
}

interface StatMetric {
  label: string;
  current: number | string; // 2025 Actual
  predicted: number | string; // 2026 Predicted
  diff: number; // (+/- value)
  unit?: string;
}

interface PredictionResult {
  playerId: number;
  playerName: string;
  metrics: StatMetric[];
  aiFeedback: string;
}

interface PlayerPredictionProps {
  onCancel: () => void;
  user: { nickname: string; favoriteTeam?: string } | null;
}

const PlayerPrediction: React.FC<PlayerPredictionProps> = ({ onCancel, user }) => {
  // State
  const [selectedTeamCode, setSelectedTeamCode] = useState<string>(
    TEAMS.find(t => user?.favoriteTeam && t.name.includes(user.favoriteTeam.split(' ')[0]))?.code || 'KIA'
  );
  
  const [viewState, setViewState] = useState<'roster' | 'detail'>('roster');
  const [activeTab, setActiveTab] = useState<Role>('Batter'); // 'Batter' | 'Pitcher'
  
  const [roster, setRoster] = useState<PlayerRosterItem[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerRosterItem | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Load Roster when team changes
  useEffect(() => {
    const fetchRoster = async () => {
      setLoading(true);
      // MOCK API DELAY
      setTimeout(() => {
        setRoster(generateMockRoster(selectedTeamCode));
        setLoading(false);
        setViewState('roster');
        setSelectedPlayer(null);
        setPrediction(null);
      }, 400);
    };
    fetchRoster();
  }, [selectedTeamCode]);

  // Handle Player Click -> Fetch Prediction
  const handlePlayerClick = (player: PlayerRosterItem) => {
    setSelectedPlayer(player);
    setLoading(true);
    
    // MOCK API CALL for Prediction
    setTimeout(() => {
      setPrediction(generateMockPrediction(player));
      setViewState('detail');
      setLoading(false);
    }, 600);
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
  const subTextColorClass = isLightTeam ? 'text-slate-700' : 'text-slate-200';

  // Filter Roster
  const filteredRoster = roster.filter(p => p.role === activeTab);

  return (
    <div className="relative z-10 w-full animate-fade-in-up min-h-screen pb-20 overflow-hidden">
      {/* Background Watermark */}
      <div 
        className="fixed -right-[10%] top-[20%] text-[20vw] font-black opacity-[0.03] pointer-events-none select-none transition-colors duration-700"
        style={{ color: activeColor }}
      >
        {selectedTeamCode}
      </div>

      <div className="w-[95%] max-w-[1800px] mx-auto px-4 md:px-8 py-12">
        
        {/* Top Navigation / Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 border-b border-white/5 pb-8 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 bg-brand-glow/10 border border-brand-glow/20 rounded-full px-3 py-1 mb-4 backdrop-blur-sm">
               <span className="w-2 h-2 rounded-full bg-brand-glow animate-pulse"></span>
               <span className="text-[10px] md:text-xs font-mono text-brand-glow uppercase tracking-widest">
                 AI Powered Simulation
               </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-2">
              FUTURE <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-glow to-pink-500">PERFORMANCE</span>
            </h2>
            <p className="text-slate-400 text-lg font-light max-w-2xl">
              2026 시즌 종료 시점의 성적을 AI가 미리 예측합니다.
            </p>
          </div>
          <button 
            onClick={onCancel}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors border border-white/10 px-6 py-3 rounded-xl hover:bg-white/5 bg-[#0a0f1e]"
          >
            <span className="text-sm font-bold">메인으로</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
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
                       flex-shrink-0 flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 w-auto lg:w-full group relative overflow-hidden
                       ${selectedTeamCode === team.code 
                         ? 'bg-white text-brand-dark shadow-[0_0_25px_rgba(255,255,255,0.3)] translate-x-2' 
                         : 'bg-[#0a0f1e] text-slate-400 border border-white/5 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed'
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
                 
                 <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className={`text-[10px] font-black px-3 py-1.5 rounded-full backdrop-blur-md border shadow-sm uppercase tracking-widest ${isLightTeam ? 'bg-black/10 border-black/10 text-black' : 'bg-black/20 border-white/20 text-white'}`}>
                          2026 SEASON PREVIEW
                        </span>
                        <span className={`text-[10px] font-bold ${isLightTeam ? 'text-slate-800' : 'text-white/80'}`}>
                          AI CONFIDENCE: 94%
                        </span>
                      </div>
                      <h3 className={`text-4xl md:text-5xl font-black mb-5 drop-shadow-sm tracking-tight ${textColorClass}`}>
                        {teamNameKR} <span className="font-light opacity-80">시즌 시뮬레이션</span>
                      </h3>
                      <p className={`text-lg md:text-xl font-medium max-w-3xl leading-relaxed ${subTextColorClass}`}>
                        최근 3년간의 선수단 데이터와 2차 스탯을 기반으로 분석한 결과, 
                        투타 밸런스가 <span className={`font-black underline decoration-2 underline-offset-4 ${isLightTeam ? 'decoration-black/30' : 'decoration-white/50'}`}>상향 평준화</span>될 것으로 예측됩니다.
                      </p>
                    </div>
                 </div>
              </div>
            </div>

            {/* CONTENT AREA: Switch between ROSTER and DETAIL */}
            {viewState === 'roster' && (
              <div className="animate-fade-in-up">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {loading ? (
                    [1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="h-64 bg-white/5 rounded-[2rem] animate-pulse"></div>
                    ))
                  ) : filteredRoster.length > 0 ? (
                    filteredRoster.map((player) => (
                      <div 
                        key={player.id}
                        onClick={() => handlePlayerClick(player)}
                        className="group relative cursor-pointer"
                      >
                         {/* Uniform Card Shape */}
                         <div 
                           className="relative h-[320px] rounded-[2rem] overflow-hidden transition-all duration-300 transform group-hover:-translate-y-2 group-hover:shadow-2xl border-2 border-transparent group-hover:border-white/20"
                           style={{ backgroundColor: activeColor }}
                         >
                            {/* Texture Overlay */}
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/athletic-diamond.png')] opacity-10 mix-blend-overlay"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-white/10"></div>
                            
                            {/* Back Number */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[140px] font-black text-white opacity-20 group-hover:opacity-100 transition-opacity duration-500 italic tracking-tighter" style={{ textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                              {player.backNumber}
                            </div>
                            
                            {/* Info */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 pt-20 bg-gradient-to-t from-black/90 to-transparent">
                               <div className="flex justify-between items-end">
                                  <div>
                                     <div className="text-xs font-bold text-white/70 mb-1 uppercase tracking-widest">{player.positionDetail}</div>
                                     <h3 className="text-3xl font-black text-white italic">{player.name}</h3>
                                  </div>
                                  <div className="bg-white/20 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-20 text-slate-500">
                      선수 데이터가 없습니다.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* DETAIL VIEW: Prediction Analysis */}
            {viewState === 'detail' && selectedPlayer && (
              <div className="animate-scale-up">
                {/* Back Button */}
                <button 
                  onClick={handleBackToRoster}
                  className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  <span className="font-bold">선수 목록으로 돌아가기</span>
                </button>

                {loading || !prediction ? (
                  <div className="h-[600px] bg-white/5 rounded-[2.5rem] animate-pulse flex items-center justify-center flex-col gap-4">
                     <div className="w-16 h-16 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
                     <p className="text-slate-400 font-light text-lg">AI가 {selectedPlayer.name} 선수의 2026시즌을 시뮬레이션 중입니다...</p>
                  </div>
                ) : (
                  <div className="bg-[#0a0f1e] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                    
                    {/* Header: Player Info */}
                    <div className="relative p-10 bg-gradient-to-r from-slate-900 to-slate-950 border-b border-white/5">
                        <div className="flex items-center gap-6">
                           <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-black text-white shadow-lg" style={{ backgroundColor: activeColor }}>
                              {selectedPlayer.backNumber}
                           </div>
                           <div>
                              <div className="flex items-center gap-3 mb-1">
                                 <span className="px-3 py-1 bg-white/10 rounded-lg text-xs font-bold text-white">{selectedPlayer.positionDetail}</span>
                                 <span className="text-slate-500 font-mono text-sm">2026 SEASON PREDICTION</span>
                              </div>
                              <h2 className="text-5xl font-black text-white italic tracking-tight">{selectedPlayer.name}</h2>
                           </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3">
                       {/* Stats Visualization */}
                       <div className="xl:col-span-2 p-10 border-r border-white/5 space-y-12">
                          <h4 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
                             <span className="w-1.5 h-6 bg-brand-accent rounded-full"></span>
                             주요 성적 예측 지표
                          </h4>
                          
                          <div className="space-y-10">
                             {prediction.metrics.map((metric, idx) => {
                               // Calculate simple width for visualization
                               const isPositive = metric.diff >= 0;
                               const currentVal = Number(metric.current);
                               const predictedVal = Number(metric.predicted);
                               // 정규화 (대략적인 바 길이 계산용)
                               const maxVal = Math.max(currentVal, predictedVal) * 1.2; 
                               
                               return (
                                 <div key={idx} className="relative">
                                    <div className="flex justify-between items-end mb-3">
                                       <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{metric.label}</span>
                                       <div className="flex items-end gap-3">
                                          <div className="text-right">
                                             <span className="text-xs text-slate-500 block mb-1">2025 (Current)</span>
                                             <span className="text-xl font-mono font-bold text-slate-300">{metric.current}</span>
                                          </div>
                                          <div className="w-px h-8 bg-white/10 mx-2"></div>
                                          <div className="text-right">
                                             <span className="text-xs font-bold block mb-1" style={{ color: activeColor }}>2026 (Predicted)</span>
                                             <div className="flex items-center justify-end gap-2">
                                               <span className="text-3xl font-mono font-black text-white">{metric.predicted}</span>
                                               <span className={`text-sm font-bold px-1.5 py-0.5 rounded ${isPositive ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                 {isPositive ? '▲' : '▼'} {Math.abs(metric.diff).toFixed(3)}
                                               </span>
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                    
                                    {/* Bar Comparison */}
                                    <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden relative">
                                       {/* Current Marker (Ghost) */}
                                       <div 
                                         className="absolute top-0 bottom-0 bg-slate-600/30 w-[2px] z-10"
                                         style={{ left: `${(currentVal / maxVal) * 100}%` }}
                                       ></div>
                                       {/* Predicted Bar */}
                                       <div 
                                          className="h-full rounded-full transition-all duration-1000 ease-out"
                                          style={{ width: `${(predictedVal / maxVal) * 100}%`, backgroundColor: activeColor }}
                                       ></div>
                                    </div>
                                 </div>
                               );
                             })}
                          </div>
                       </div>

                       {/* Bedrock AI Feedback */}
                       <div className="p-10 bg-[#0f172a]">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <div>
                               <h4 className="font-bold text-white">Bedrock AI Analyst</h4>
                               <span className="text-xs text-slate-500">Powered by AWS Bedrock</span>
                            </div>
                          </div>
                          
                          <div className="relative">
                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-indigo-600 rounded-full"></div>
                            <div className="pl-6 py-2">
                               <p className="text-slate-300 leading-relaxed font-light text-base whitespace-pre-line">
                                 {prediction.aiFeedback}
                               </p>
                            </div>
                          </div>

                          <div className="mt-8 pt-8 border-t border-white/5">
                             <div className="flex justify-between items-center text-xs text-slate-500 font-mono">
                                <span>MODEL: CLAUDE-3-SONNET</span>
                                <span>CONFIDENCE: 96.2%</span>
                             </div>
                          </div>
                       </div>
                    </div>

                  </div>
                )}
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MOCK DATA GENERATORS ---

const generateMockRoster = (teamCode: string): PlayerRosterItem[] => {
  // 실제로는 DB에서 받아올 데이터
  // 구단별로 6명씩 생성 (타자 3, 투수 3)
  const baseId = teamCode.length * 100;
  
  return [
    // Batters
    { id: baseId + 1, name: '중심 타자 A', backNumber: 10, role: 'Batter', positionDetail: '외야수' },
    { id: baseId + 2, name: '주전 포수 B', backNumber: 47, role: 'Batter', positionDetail: '포수' },
    { id: baseId + 3, name: '유망주 내야수 C', backNumber: 7, role: 'Batter', positionDetail: '내야수' },
    { id: baseId + 4, name: '베테랑 타자 D', backNumber: 34, role: 'Batter', positionDetail: '내야수' },
    // Pitchers
    { id: baseId + 5, name: '1선발 에이스', backNumber: 54, role: 'Pitcher', positionDetail: '투수' },
    { id: baseId + 6, name: '마무리 투수', backNumber: 21, role: 'Pitcher', positionDetail: '투수' },
    { id: baseId + 7, name: '불펜 핵심', backNumber: 11, role: 'Pitcher', positionDetail: '투수' },
  ];
};

const generateMockPrediction = (player: PlayerRosterItem): PredictionResult => {
  const isBatter = player.role === 'Batter';
  
  if (isBatter) {
    // Batter Metrics: AVG, HR, OPS
    const currentAvg = 0.280 + Math.random() * 0.05;
    const predAvg = currentAvg + (Math.random() * 0.04 - 0.01);
    
    const currentHr = Math.floor(10 + Math.random() * 20);
    const predHr = Math.floor(currentHr * (1 + (Math.random() * 0.3 - 0.1)));

    const currentOps = 0.750 + Math.random() * 0.15;
    const predOps = currentOps + (Math.random() * 0.1 - 0.02);

    return {
      playerId: player.id,
      playerName: player.name,
      metrics: [
        { label: 'AVG (타율)', current: currentAvg.toFixed(3), predicted: predAvg.toFixed(3), diff: predAvg - currentAvg },
        { label: 'HR (홈런)', current: currentHr, predicted: predHr, diff: predHr - currentHr, unit: '개' },
        { label: 'OPS (출루+장타)', current: currentOps.toFixed(3), predicted: predOps.toFixed(3), diff: predOps - currentOps },
      ],
      aiFeedback: `${player.name} 선수는 2026 시즌, 타격 메커니즘의 안정화로 컨택 능력이 비약적으로 상승할 전망입니다.\n\n특히 패스트볼 대처 능력이 리그 상위 5% 수준으로 개선되며, 2스트라이크 이후의 타율이 눈에 띄게 좋아질 것으로 예측됩니다. 장타력 또한 유지되면서 커리어 하이 시즌을 보낼 확률이 85% 이상으로 분석됩니다.`
    };
  } else {
    // Pitcher Metrics: ERA, WIN, SO
    const currentEra = 3.50 + Math.random();
    const predEra = currentEra - (Math.random() * 0.5); // ERA는 낮을수록 좋음

    const currentWin = Math.floor(5 + Math.random() * 10);
    const predWin = Math.floor(currentWin + Math.random() * 3);

    const currentSo = Math.floor(100 + Math.random() * 50);
    const predSo = Math.floor(currentSo * 1.1);

    return {
      playerId: player.id,
      playerName: player.name,
      metrics: [
        { label: 'ERA (평균자책점)', current: currentEra.toFixed(2), predicted: predEra.toFixed(2), diff: predEra - currentEra }, // 음수면 좋은 것(개선)
        { label: 'WIN (승리)', current: currentWin, predicted: predWin, diff: predWin - currentWin, unit: '승' },
        { label: 'SO (탈삼진)', current: currentSo, predicted: predSo, diff: predSo - currentSo, unit: '개' },
      ],
      aiFeedback: `${player.name} 투수는 구속의 증가보다는 제구력의 완성이 돋보이는 2026 시즌이 될 것입니다.\n\n특히 주무기인 슬라이더의 피안타율이 0.1대까지 떨어지며 탈삼진 능력이 크게 향상될 것으로 보입니다. 이닝 소화 능력 또한 늘어나며 선발 로테이션의 핵심 축으로 자리 잡을 것으로 예측됩니다.`
    };
  }
};

export default PlayerPrediction;
