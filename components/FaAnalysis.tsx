
import React, { useState, useEffect } from 'react';
import { TEAMS } from '../constants';

const API_BASE_URL = "https://dugout.cloud";

// --- Constants & Types ---

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

// FA 등급 정의
type FaGrade = 'A' | 'B' | 'C';

interface FaPlayer {
  id: number;
  name: string;
  position: string;
  age: number;
  grade: FaGrade;
  currentSalary: string; // 추정 연봉
  predictionSummary: string; // 한줄 요약
  report: string; // 스카우팅 리포트 (더그아웃 분석)
  stats: {
    label: string;
    value: number; // 0-100 scale for radar/bar chart
  }[];
}

interface FaAnalysisProps {
  onCancel: () => void;
  user: { nickname: string; favoriteTeam?: string } | null;
}

// --- MOCK DATA GENERATOR ---
// 백엔드 API가 준비되지 않았으므로 팀별 가상의 FA 선수 데이터를 생성합니다.
const generateMockFaPlayers = (teamCode: string): FaPlayer[] => {
  const players: FaPlayer[] = [];
  
  // 팀별 시나리오 (예시 데이터)
  if (teamCode === 'KIA') {
    players.push({
      id: 101, name: '최형우', position: 'OF/DH', age: 42, grade: 'B', currentSalary: '15억',
      predictionSummary: '나이를 잊은 타격 기술, 단기 계약 유력',
      report: '베테랑의 품격을 보여주는 타격 지표를 유지 중입니다. 배트 스피드는 소폭 감소했으나 타구 방향 설정과 선구안은 여전히 리그 상위권입니다. 수비 기여도는 낮지만 지명타자로서의 가치는 충분하며, 클러치 상황에서의 해결사 능력은 B등급 중에서도 최상위권으로 평가됩니다.',
      stats: [{label: 'Con', value: 85}, {label: 'Pow', value: 80}, {label: 'Eye', value: 90}, {label: 'Spd', value: 30}, {label: 'Def', value: 20}]
    });
    players.push({
      id: 102, name: '임기영', position: 'RP', age: 33, grade: 'B', currentSalary: '3억',
      predictionSummary: '전천후 불펜 자원, 마당쇠 역할 기대',
      report: '사이드암 투수로서의 희소성과 롱릴리프, 필승조를 오가는 활용폭이 장점입니다. 직구 구속은 평범하나 커브와 체인지업의 무브먼트가 우수합니다. 내구성이 검증되었으나 피장타율 관리가 관건입니다.',
      stats: [{label: 'Stu', value: 70}, {label: 'Com', value: 85}, {label: 'Sta', value: 75}, {label: 'Men', value: 80}, {label: 'Mov', value: 78}]
    });
  } else if (teamCode === 'SSG') {
    players.push({
      id: 601, name: '최정', position: '3B', age: 39, grade: 'A', currentSalary: '106억(4년)',
      predictionSummary: '리빙 레전드, 에이징 커브를 거스르는 홈런왕',
      report: '리그 역사상 최고의 3루수. 30대 후반임에도 불구하고 여전한 배트 스피드와 장타력을 과시하고 있습니다. 수비 범위는 전성기에 비해 줄었으나 타구 처리의 안정감은 여전합니다. FA 시장 최대어 중 한 명으로, 에이징 커브 우려보다는 당장의 우승 청부사로서의 가치가 훨씬 높게 평가됩니다.',
      stats: [{label: 'Con', value: 80}, {label: 'Pow', value: 95}, {label: 'Eye', value: 85}, {label: 'Spd', value: 50}, {label: 'Def', value: 75}]
    });
    players.push({
      id: 602, name: '노경은', position: 'RP', age: 42, grade: 'C', currentSalary: '2억',
      predictionSummary: '제 2의 전성기, 노련한 경기 운영',
      report: '철저한 자기 관리로 40대에도 불펜의 핵으로 활약 중입니다. 다양한 변화구 구사와 타자의 타이밍을 뺏는 투구 폼이 인상적입니다. 다만 나이에 따른 회복 속도 저하를 고려하여 등급은 C로 책정되었으나, 단기 전력 강화용으로는 최고의 효율을 보일 것입니다.',
      stats: [{label: 'Stu', value: 65}, {label: 'Com', value: 90}, {label: 'Sta', value: 60}, {label: 'Men', value: 95}, {label: 'Mov', value: 85}]
    });
  } else if (teamCode === 'KT') {
    players.push({
      id: 501, name: '엄상백', position: 'SP', age: 29, grade: 'A', currentSalary: '3억',
      predictionSummary: '전성기에 접어든 사이드암 선발',
      report: '희소성 높은 사이드암 선발 자원으로, 150km에 육박하는 패스트볼과 낙차 큰 체인지업이 위력적입니다. 이닝 소화 능력이 매년 향상되고 있으며, 나이 또한 전성기에 해당하여 장기 계약이 가능한 매물입니다. 선발진 보강이 필요한 모든 구단의 타겟이 될 것입니다.',
      stats: [{label: 'Stu', value: 88}, {label: 'Com', value: 75}, {label: 'Sta', value: 85}, {label: 'Men', value: 70}, {label: 'Mov', value: 82}]
    });
    players.push({
      id: 502, name: '심우준', position: 'SS', age: 30, grade: 'B', currentSalary: '2.5억',
      predictionSummary: '리그 정상급 수비 범위와 주루 능력',
      report: '타격에서의 기복은 있으나, 수비 하나만으로도 팀 승리에 기여할 수 있는 자원입니다. 넓은 수비 범위와 강한 어깨, 그리고 도루 능력을 갖추고 있어 센터 라인 강화가 필요한 팀에게 매력적인 선택지입니다. 타율 0.270 이상을 기록한다면 가치는 더욱 상승할 것입니다.',
      stats: [{label: 'Con', value: 65}, {label: 'Pow', value: 40}, {label: 'Eye', value: 60}, {label: 'Spd', value: 90}, {label: 'Def', value: 95}]
    });
  } else if (teamCode === 'DOOSAN') {
    players.push({
      id: 401, name: '허경민', position: '3B', age: 35, grade: 'B', currentSalary: '65억(4년)',
      predictionSummary: '견고한 수비와 컨택 능력, 안정적인 3루수',
      report: '수비 안정감은 리그 탑급이며, 작전 수행 능력과 컨택 능력이 우수합니다. 장타력은 다소 부족하지만 찬스에서의 집중력이 좋습니다. 베테랑으로서 내야진의 리더 역할을 수행할 수 있으며, 계산이 서는 자원입니다.',
      stats: [{label: 'Con', value: 82}, {label: 'Pow', value: 50}, {label: 'Eye', value: 75}, {label: 'Spd', value: 60}, {label: 'Def', value: 90}]
    });
  }
  // ... 기타 팀들은 빈 배열 또는 랜덤 생성 (여기서는 간단히 빈 배열 처리 후 UI에서 처리)
  return players;
};

// --- COMPONENTS ---

// 1. Grade Badge Component
const GradeBadge: React.FC<{ grade: FaGrade }> = ({ grade }) => {
  let colorClass = '';
  let shadowClass = '';
  let label = '';

  switch (grade) {
    case 'A':
      colorClass = 'text-green-400 border-green-500 bg-green-500/20'; // A: 연두/초록
      shadowClass = 'shadow-[0_0_20px_rgba(74,222,128,0.4)]';
      label = 'TOP TIER';
      break;
    case 'B':
      colorClass = 'text-yellow-400 border-yellow-500 bg-yellow-500/20'; // B: 노랑
      shadowClass = 'shadow-[0_0_20px_rgba(250,204,21,0.4)]';
      label = 'CORE PLAYER';
      break;
    case 'C':
      colorClass = 'text-orange-600 border-orange-600 bg-orange-600/20'; // C: 어두운 주황
      shadowClass = 'shadow-[0_0_20px_rgba(234,88,12,0.4)]';
      label = 'VETERAN / DEPTH';
      break;
  }

  return (
    <div className={`flex flex-col items-center justify-center w-16 h-20 rounded-b-xl border-x border-b backdrop-blur-md absolute top-0 right-6 z-20 ${colorClass} ${shadowClass}`}>
      <span className="text-[10px] font-bold tracking-tighter opacity-80">{label}</span>
      <span className="text-5xl font-black leading-none mt-1 drop-shadow-md">{grade}</span>
    </div>
  );
};

// 2. Stat Hexagon (Simple CSS implementation using conic-gradient for visuals or just bars)
// For simplicity and cleaner UI, using Bar Meters here but styled neatly.
const StatBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="flex items-center gap-3 mb-2">
    <span className="w-8 text-xs font-bold text-slate-400 text-right uppercase">{label}</span>
    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
      <div 
        className="h-full rounded-full transition-all duration-1000" 
        style={{ width: `${value}%`, backgroundColor: color }}
      ></div>
    </div>
    <span className="w-6 text-xs font-mono font-bold text-white text-right">{value}</span>
  </div>
);

const FaAnalysis: React.FC<FaAnalysisProps> = ({ onCancel, user }) => {
  // 1. Initial State & Setup
  const [selectedTeamCode, setSelectedTeamCode] = useState<string>(
    user?.favoriteTeam ? (KOREAN_TO_CODE[user.favoriteTeam] || 'KIA') : 'KIA'
  );
  
  const [faList, setFaList] = useState<FaPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<FaPlayer | null>(null);

  // 2. Fetch Data (Mock)
  useEffect(() => {
    const fetchFaData = async () => {
      setLoading(true);
      setSelectedPlayer(null); // 팀 변경 시 선택 초기화

      try {
        // 실제로는 API 호출: await fetch(`${API_BASE_URL}/api/v1/fa-market/players?team=${teamName}`);
        await new Promise(resolve => setTimeout(resolve, 600)); // Simulate delay
        
        const data = generateMockFaPlayers(selectedTeamCode);
        setFaList(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchFaData();
  }, [selectedTeamCode]);

  // 3. Styles Helper
  const getTeamColor = (code: string) => {
    return TEAMS.find(t => t.code === code)?.color || '#3b82f6';
  };
  const activeColor = getTeamColor(selectedTeamCode);
  const teamNameKR = KOREAN_TEAM_NAMES[selectedTeamCode] || selectedTeamCode;

  // 등급별 컬러 매핑 (리포트용)
  const getGradeColor = (grade: FaGrade) => {
    if (grade === 'A') return '#4ade80';
    if (grade === 'B') return '#facc15';
    if (grade === 'C') return '#ea580c';
    return '#fff';
  };

  return (
    <div className="relative z-10 w-full animate-fade-in-up min-h-screen pb-20 overflow-hidden">
      
      {/* Background Watermark */}
      <div 
        className="fixed -left-[5%] bottom-[10%] text-[20vw] font-black opacity-[0.02] pointer-events-none select-none transition-colors duration-700 whitespace-nowrap"
        style={{ color: activeColor }}
      >
        FA MARKET
      </div>

      <div className="w-[95%] max-w-[1600px] mx-auto px-4 md:px-8 py-12">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6 border-b border-white/5 pb-8 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center space-x-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm">
               <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
               <span className="text-xs md:text-sm font-mono text-purple-300 font-bold uppercase tracking-widest">
                 AI Scouting System
               </span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-4">
              2026 FA <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">MARKET ANALYSIS</span>
            </h2>
            <p className="text-slate-400 text-xl md:text-2xl font-light">
              예비 FA 선수들의 미래 가치 등급(Grade)과 스카우팅 리포트를 확인하세요.
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

        {/* LAYOUT: Sidebar + Content */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          
          {/* TEAM SELECTOR (Sidebar) */}
          <div className="w-full lg:w-72 flex-shrink-0 z-20">
             <div className="sticky top-24">
               <label className="block text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest px-2">Select Team</label>
               <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-3 pb-4 lg:pb-0 no-scrollbar">
                 {TEAMS.map((team) => (
                   <button
                     key={team.code}
                     onClick={() => setSelectedTeamCode(team.code)}
                     disabled={!!selectedPlayer} // Disable while viewing detail
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

          {/* MAIN CONTENT */}
          <div className="flex-1 min-h-[600px] relative">
            
            {/* Team Banner */}
            {!selectedPlayer && (
              <div className="mb-10 animate-fade-in-up">
                <div 
                  className="rounded-[2.5rem] p-8 relative overflow-hidden border border-white/5 flex items-center justify-between"
                  style={{ background: `linear-gradient(90deg, ${activeColor}22 0%, transparent 100%)` }}
                >
                   <div>
                      <h3 className="text-2xl font-bold text-white mb-1">{teamNameKR}</h3>
                      <p className="text-slate-400 text-sm">2026 예비 FA 자격 획득 선수 명단</p>
                   </div>
                   <div className="w-12 h-12 rounded-full flex items-center justify-center bg-black/20 border border-white/10 text-white font-black text-xl">
                      {faList.length}
                   </div>
                </div>
              </div>
            )}

            {/* Content Area */}
            {loading ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {[1, 2].map(i => (
                   <div key={i} className="h-80 bg-white/5 rounded-[2rem] animate-pulse"></div>
                 ))}
               </div>
            ) : selectedPlayer ? (
              
              // --- DETAIL VIEW (SCOUTER REPORT) ---
              <div className="animate-scale-up">
                 <button 
                    onClick={() => setSelectedPlayer(null)}
                    className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                 >
                    <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </div>
                    <span className="font-bold text-sm">목록으로 돌아가기</span>
                 </button>

                 <div className="bg-[#0a0f1e] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl relative">
                    {/* Header Background */}
                    <div className="h-40 relative overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"></div>
                       <div className="absolute inset-0 opacity-20" style={{ backgroundColor: activeColor }}></div>
                       <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#0a0f1e] to-transparent"></div>
                    </div>

                    <div className="px-10 pb-10 -mt-20 relative z-10">
                       {/* Profile Header */}
                       <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
                          {/* Grade Badge Large */}
                          <div 
                            className="w-32 h-32 rounded-3xl flex items-center justify-center text-7xl font-black shadow-2xl border-4 border-[#0a0f1e] relative group"
                            style={{ 
                              backgroundColor: getGradeColor(selectedPlayer.grade), 
                              color: '#000',
                              boxShadow: `0 20px 50px -10px ${getGradeColor(selectedPlayer.grade)}66`
                            }}
                          >
                             {selectedPlayer.grade}
                             <div className="absolute -bottom-3 px-3 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-full">Grade</div>
                          </div>

                          <div className="flex-1 pt-6">
                             <div className="flex items-center gap-3 mb-2">
                                <span className="text-slate-400 font-bold text-lg">{selectedPlayer.position}</span>
                                <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                                <span className="text-slate-400 font-bold text-lg">{selectedPlayer.age}세</span>
                             </div>
                             <h2 className="text-5xl font-black text-white mb-4">{selectedPlayer.name}</h2>
                             <div className="flex items-center gap-4">
                                <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                                   <span className="text-xs text-slate-500 block mb-1">현재 연봉 (추정)</span>
                                   <span className="text-xl font-bold text-white font-mono">{selectedPlayer.currentSalary}</span>
                                </div>
                             </div>
                          </div>
                       </div>

                       {/* Analysis Content */}
                       <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                          {/* Left: Stats Chart */}
                          <div className="lg:col-span-1 bg-white/5 rounded-3xl p-6 border border-white/5">
                             <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Ability Breakdown</h4>
                             <div className="space-y-4">
                                {selectedPlayer.stats.map((stat) => (
                                  <StatBar key={stat.label} label={stat.label} value={stat.value} color={getGradeColor(selectedPlayer.grade)} />
                                ))}
                             </div>
                          </div>

                          {/* Right: Text Report */}
                          <div className="lg:col-span-2 space-y-8">
                             <div>
                                <h4 className="flex items-center gap-3 text-xl font-black text-white mb-4 uppercase italic">
                                   <span className="w-2 h-6 rounded-full" style={{ backgroundColor: activeColor }}></span>
                                   DUGOUT Scouting Report
                                </h4>
                                <div className="bg-[#0f172a] rounded-3xl p-8 border border-white/5 relative overflow-hidden">
                                   <div className="absolute top-0 right-0 p-4 opacity-5">
                                      <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-1.07 3.97-2.74 5.39z"/></svg>
                                   </div>
                                   
                                   <p className="text-xl font-bold text-white mb-6 leading-relaxed">
                                     "{selectedPlayer.predictionSummary}"
                                   </p>
                                   <p className="text-slate-300 text-lg font-light leading-loose text-justify whitespace-pre-line relative z-10">
                                     {selectedPlayer.report}
                                   </p>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

            ) : faList.length > 0 ? (
              
              // --- LIST VIEW (GRID) ---
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in-up">
                {faList.map((player) => (
                  <div 
                    key={player.id}
                    onClick={() => setSelectedPlayer(player)}
                    className="group relative bg-[#0a0f1e] border border-white/10 rounded-[2.5rem] p-8 h-[380px] flex flex-col justify-between overflow-hidden cursor-pointer hover:border-white/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                  >
                    {/* Grade Badge */}
                    <GradeBadge grade={player.grade} />

                    {/* Background Glow */}
                    <div 
                      className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity duration-500"
                      style={{ backgroundColor: activeColor }}
                    ></div>

                    <div className="relative z-10 mt-8">
                       <div className="flex items-center gap-2 mb-2">
                          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-slate-400">{player.position}</span>
                          <span className="text-xs text-slate-500 font-bold">{player.age}세</span>
                       </div>
                       <h3 className="text-4xl font-black text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all">
                         {player.name}
                       </h3>
                       <p className="text-sm text-slate-500 font-light mt-2 line-clamp-1 pr-16">{player.predictionSummary}</p>
                    </div>

                    <div className="relative z-10 mt-auto pt-6 border-t border-white/5">
                       <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Estimated Grade</span>
                          <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-300 group-hover:text-white transition-colors">
                            View Report 
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                          </button>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              
              // --- EMPTY STATE ---
              <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-white/5 rounded-[3rem] bg-[#0a0f1e]/30">
                 <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 text-4xl shadow-inner grayscale opacity-50">
                   ⚾️
                 </div>
                 <h3 className="text-2xl font-bold text-slate-400 mb-2">해당 구단에 FA 대상자가 없습니다.</h3>
                 <p className="text-slate-500">다른 구단을 선택하거나 2026 시즌 종료 후 업데이트를 기다려주세요.</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default FaAnalysis;
