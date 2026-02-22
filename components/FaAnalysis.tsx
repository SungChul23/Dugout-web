
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
type FaGrade = 'A' | 'B' | 'C' | 'D';

// 백엔드 DTO 구조
interface FaListResponseDto {
  id: number;
  playerName: string;
  subPositionType: string;
  age: number;
  grade: string;
  currentSalary: string;
  playerIntro: string;
  faStatus: string; // 잔류, 미정, 영입, 예정
}

interface FaDetailResponseDto {
  playerId: number;
  playerName: string;
  subPositionType: string;
  age: number;
  playerIntro: string;
  grade: string;
  currentSalary: string;
  aiFeedback: string;
  faStatus: string;
  
  // 지표
  statPitching?: number;
  statStability?: number;
  statOffense?: number;
  statDefense?: number;
  statContribution?: number;
}

// 프론트엔드 표시용 인터페이스
interface FaPlayer {
  id: number;
  name: string;
  position: string; 
  positionType: 'Pitcher' | 'Batter';
  age: number;
  grade: FaGrade;
  currentSalary: string;
  predictionSummary: string; // playerIntro 매핑
  report: string; // aiFeedback 매핑
  faStatus: string; // New Field
  stats: {
    label: string;
    value: number;
  }[];
  faYear?: number;
}

interface FaAnalysisProps {
  onCancel: () => void;
  user: { nickname: string; favoriteTeam?: string } | null;
}

// --- HELPER FUNCTIONS ---

const getPositionType = (pos: string): 'Pitcher' | 'Batter' => {
  if (!pos) return 'Batter';

  const upperPos = pos.toUpperCase().trim();
  
  // 1. 'P'로 시작하는 경우 (P, Pitcher)
  // 2. 투수 관련 영문 약어 (SP, RP, CP)
  // 3. 한글 키워드 포함
  const isPitcher = 
    upperPos.startsWith('P') || 
    ['SP', 'RP', 'CP'].includes(upperPos) || 
    upperPos.includes('투수');
  
  return isPitcher ? 'Pitcher' : 'Batter';
};

// --- MOCK DATA GENERATOR (Fallback) ---
const generateMockFaPlayers = (teamCode: string, year: number): FaPlayer[] => {
  const players: FaPlayer[] = [];
  
  if (year === 2026) {
    if (teamCode === 'KIA') {
      players.push({
        id: 101, name: '최형우', position: 'DH', positionType: 'Batter', age: 42, grade: 'B', currentSalary: '15억', 
        predictionSummary: 'KBO 역사상 가장 위대한 해결사, 불멸의 타점왕', // Quotes removed
        report: '베테랑의 품격을 보여주는 타격 지표를 유지 중입니다. 배트 스피드는 소폭 감소했으나 타구 방향 설정과 선구안은 여전히 리그 상위권입니다.',
        faStatus: '잔류 유력',
        stats: [{label: '공격 점수', value: 88.5}, {label: '수비 점수', value: 10.0}, {label: '기여도 점수', value: 82.4}]
      });
      players.push({
        id: 102, name: '임기영', position: 'RP', positionType: 'Pitcher', age: 33, grade: 'B', currentSalary: '3억', 
        predictionSummary: '마운드의 만능 열쇠, 헌신적인 이닝 이터', // Quotes removed
        report: '사이드암 투수로서의 희소성과 롱릴리프, 필승조를 오가는 활용폭이 장점입니다.',
        faStatus: '미정',
        stats: [{label: '구위 점수', value: 72.1}, {label: '안정성 점수', value: 78.5}, {label: '기여도 점수', value: 80.0}]
      });
    } else if (teamCode === 'SSG') {
      players.push({
        id: 601, name: '최정', position: '3B', positionType: 'Batter', age: 39, grade: 'A', currentSalary: '106억(4년)', 
        predictionSummary: '리빙 레전드, 에이징 커브를 거스르는 홈런왕', // Quotes removed
        report: '리그 역사상 최고의 3루수. 30대 후반임에도 불구하고 여전한 배트 스피드와 장타력을 과시하고 있습니다.',
        faStatus: '계약 완료',
        stats: [{label: '공격 점수', value: 96.2}, {label: '수비 점수', value: 75.5}, {label: '기여도 점수', value: 94.8}]
      });
    }
  }
  return players;
};

// --- COMPONENTS ---

// 1. Grade Badge Component (Fixed Background)
const GradeBadge: React.FC<{ grade: FaGrade }> = ({ grade }) => {
  let colorClass = '';
  let shadowClass = '';
  let label = '';

  switch (grade) {
    case 'A':
      colorClass = 'text-green-400';
      shadowClass = 'shadow-[0_0_25px_rgba(74,222,128,0.5)]';
      label = 'TOP TIER';
      break;
    case 'B':
      colorClass = 'text-yellow-400';
      shadowClass = 'shadow-[0_0_25px_rgba(250,204,21,0.5)]';
      label = 'CORE';
      break;
    case 'C':
      colorClass = 'text-orange-500';
      shadowClass = 'shadow-[0_0_25px_rgba(249,115,22,0.5)]';
      label = 'REGULAR';
      break;
    case 'D':
      colorClass = 'text-slate-400';
      shadowClass = 'shadow-[0_0_25px_rgba(148,163,184,0.5)]';
      label = 'DEVELOP';
      break;
  }

  return (
    <div className={`flex flex-col items-center justify-center w-24 h-36 rounded-b-2xl border-x border-b absolute top-0 right-8 z-20 bg-[#0f172a] border-white/10 ${colorClass} shadow-xl`}>
      <span className="text-xs font-black tracking-widest opacity-80 mb-1">{label}</span>
      <span className={`text-7xl font-black leading-none mt-0 drop-shadow-xl ${shadowClass}`}>{grade}</span>
    </div>
  );
};

// 2. FA Status Badge Component
const FaStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let bgClass = 'bg-slate-700 text-slate-200';
  let borderClass = 'border-slate-600';

  if (status.includes('잔류') || status.includes('계약')) {
    bgClass = 'bg-blue-500/20 text-blue-300';
    borderClass = 'border-blue-500/40';
  } else if (status.includes('영입') || status.includes('이적')) {
    bgClass = 'bg-pink-500/20 text-pink-300';
    borderClass = 'border-pink-500/40';
  } else if (status.includes('미정') || status.includes('협상')) {
    bgClass = 'bg-yellow-500/20 text-yellow-300';
    borderClass = 'border-yellow-500/40';
  }

  return (
    <span className={`px-4 py-1.5 rounded-lg text-sm font-bold border ${bgClass} ${borderClass} backdrop-blur-sm tracking-wide`}>
      {status}
    </span>
  );
};

// 3. Metrics Guide Component
const MetricsGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Pitcher' | 'Batter'>('Pitcher');

  const content = {
    Pitcher: [
      { name: '구위 점수', measure: '평균자책점(ERA), WHIP, 피안타율', desc: '"얼마나 압도적인가?"\n타자를 억제하고 안타를 맞지 않는 순수한 구위와 구속의 위력을 나타냅니다.' },
      { name: '안정성 점수', measure: '볼넷 비율(BB/9), 피홈런 비율(HR/9)', desc: '"얼마나 믿음직한가?"\n갑작스러운 무너짐 없이 경기를 운영하는 능력입니다. 볼넷과 홈런 허용이 적을수록 높습니다.' },
      { name: '기여도 점수', measure: '이닝, WPCT (승률), 세이브/홀드', desc: '"팀에 얼마나 공헌했나?"\n팀의 승리를 위해 얼마나 많은 이닝을 책임지고, 결정적인 순간을 지켜냈는지를 나타냅니다.' }
    ],
    Batter: [
      { name: '공격 점수', measure: 'OPS, RISP (득점권 타율)', desc: '"얼마나 위협적인가?"\n상대 투수를 압도하는 타격 능력입니다. 단순히 안타를 치는 것을 넘어 팀 득점력을 측정합니다.' },
      { name: '수비 점수', measure: 'FPCT (수비율), Total_IP (수비 이닝)', desc: '"얼마나 빈틈이 없는가?"\n실책 없는 수비력은 기본, 얼마나 오랫동안 수비를 책임졌는지를 더 높게 평가하여 주전 수비수의 가치를 존중합니다.' },
      { name: '기여도 점수', measure: 'PA (타석 수), Total_IP (수비 이닝) ,is_multi (멀티 포지션 가산점)', desc: '"팀 운영의 핵심적인 엔진인가?"\n풍부한 경기 경험을 바탕으로 한 꾸준함과 여러 포지션을 맡을 수 있는 다재다능함이 팀 승리에 기여하는 정도를 보여줍니다.' }
    ]
  };

  return (
    <div className="mb-16 w-full max-w-7xl mx-auto animate-fade-in-up">
      <div className="bg-[#0f172a] backdrop-blur-md border-2 border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="flex border-b border-white/10">
          {['Pitcher', 'Batter'].map((role) => (
            <button
              key={role}
              onClick={() => setActiveTab(role as 'Pitcher' | 'Batter')}
              className={`flex-1 py-6 text-center font-black text-xl tracking-wide transition-all ${activeTab === role ? 'bg-white/5 text-white shadow-inner' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
            >
              {role === 'Pitcher' ? '투수 평가 기준 (Pitcher)' : '타자 평가 기준 (Batter)'}
            </button>
          ))}
        </div>
        <div className="p-10 md:p-12 grid grid-cols-1 md:grid-cols-3 gap-10">
          {content[activeTab].map((item, idx) => (
            <div key={idx} className="space-y-4 relative group">
              <div className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-white/20 to-transparent rounded-full group-hover:from-white/40 transition-colors"></div>
              <div className="pl-8">
                <h4 className="text-2xl font-black text-white mb-3 flex items-center gap-3 tracking-tight">
                  <span className={`w-3 h-3 rounded-full ${activeTab === 'Pitcher' ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]' : 'bg-pink-500 shadow-[0_0_10px_#ec4899]'}`}></span>
                  {item.name}
                </h4>
                <div className="mb-4">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-widest block mb-1.5">What we measure</span>
                  <p className="text-base text-slate-200 font-mono font-bold leading-tight bg-white/5 p-2 rounded-lg inline-block border border-white/5">
                    {item.measure}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-widest block mb-1.5">User-friendly message</span>
                  <p className="text-lg text-slate-300 font-medium leading-relaxed whitespace-pre-line font-sans">
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 4. Stat Bar
const StatBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="mb-6">
    <div className="flex justify-between items-end mb-2">
      <span className="text-base font-bold text-slate-300 tracking-wide">{label}</span>
      <span className="text-2xl font-mono font-black" style={{ color }}>{value.toFixed(1)}</span>
    </div>
    <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden relative border border-white/5">
      <div className="absolute inset-0 grid grid-cols-10 pointer-events-none">
         {[...Array(10)].map((_, i) => <div key={i} className="border-r border-black/20 h-full"></div>)}
      </div>
      <div 
        className="h-full rounded-full transition-all duration-1000 relative z-10 shadow-[0_0_20px_currentColor]" 
        style={{ width: `${value}%`, backgroundColor: color }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent"></div>
      </div>
    </div>
  </div>
);

// 5. Loading Overlay
const AnalysisLoadingOverlay: React.FC = () => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0f1e]/90 backdrop-blur-xl animate-fade-in-up">
    <div className="relative w-40 h-40 mb-10">
      {/* Outer Glow */}
      <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
      
      {/* Spinner Rings */}
      <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      <div className="absolute inset-4 border-4 border-pink-500/20 rounded-full animate-spin-reverse"></div>
      
      {/* Icon */}
      <div className="absolute inset-0 flex items-center justify-center text-5xl animate-bounce-slight">
        🤖
      </div>
    </div>
    
    <h3 className="text-4xl font-black text-white mb-4 text-center tracking-tight drop-shadow-lg">
      AI SCOUTING REPORT
    </h3>
    <div className="flex flex-col items-center gap-2">
      <p className="text-xl text-slate-300 font-light text-center">
        더그아웃 AI가 선수의 데이터를 정밀 분석 중입니다.
      </p>
      <div className="flex gap-1 mt-2">
        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
      </div>
    </div>
  </div>
);

const FaAnalysis: React.FC<FaAnalysisProps> = ({ onCancel, user }) => {
  // 1. Initial State & Setup
  const [selectedTeamCode, setSelectedTeamCode] = useState<string>(
    user?.favoriteTeam ? (KOREAN_TO_CODE[user.favoriteTeam] || 'KIA') : 'KIA'
  );
  
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [faList, setFaList] = useState<FaPlayer[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<FaPlayer | null>(null);
  
  // 팀별 FA 선수 카운트 상태 추가
  const [teamCounts, setTeamCounts] = useState<Record<string, number>>({});

  // Helper to clean summary text (remove quotes)
  const cleanSummary = (text: string) => text.replace(/^["']|["']$/g, '');

  // 1-1. Fetch All Team Counts on Year Change
  useEffect(() => {
    const fetchAllCounts = async () => {
      const newCounts: Record<string, number> = {};
      
      const promises = TEAMS.map(async (team) => {
        const teamName = KOREAN_TEAM_NAMES[team.code] || team.code;
        try {
          const response = await fetch(`${API_BASE_URL}/api/v1/fa-market/list?year=${selectedYear}&team=${encodeURIComponent(teamName)}`);
          if (response.ok) {
            const data = await response.json();
            newCounts[team.code] = Array.isArray(data) ? data.length : 0;
          } else {
            newCounts[team.code] = 0;
          }
        } catch (e) {
          console.error(`Failed to fetch counts for ${team.code}`);
          newCounts[team.code] = 0;
        }
      });

      await Promise.all(promises);
      setTeamCounts(newCounts);
    };

    fetchAllCounts();
  }, [selectedYear]);

  // 2. Fetch List
  useEffect(() => {
    const fetchFaList = async () => {
      setLoadingList(true);
      setSelectedPlayer(null);

      const teamName = KOREAN_TEAM_NAMES[selectedTeamCode] || selectedTeamCode;

      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/fa-market/list?year=${selectedYear}&team=${encodeURIComponent(teamName)}`);
        
        if (!response.ok) {
          console.warn("Server response not ok, using mock data.");
          setFaList(generateMockFaPlayers(selectedTeamCode, selectedYear));
          return;
        }

        const data: FaListResponseDto[] = await response.json();
        
        const mappedList = data.map((dto) => ({
          id: dto.id,
          name: dto.playerName,
          position: dto.subPositionType,
          positionType: getPositionType(dto.subPositionType || ''),
          age: dto.age,
          grade: dto.grade as FaGrade,
          currentSalary: dto.currentSalary, 
          predictionSummary: dto.playerIntro,
          faStatus: dto.faStatus, 
          report: '', 
          stats: []
        }));

        setFaList(mappedList.length > 0 ? mappedList : generateMockFaPlayers(selectedTeamCode, selectedYear));

      } catch (e) {
        console.error("Failed to fetch FA list:", e);
        setFaList(generateMockFaPlayers(selectedTeamCode, selectedYear));
      } finally {
        setLoadingList(false);
      }
    };

    fetchFaList();
  }, [selectedTeamCode, selectedYear]);

  // 3. Fetch Detail
  const handlePlayerClick = async (player: FaPlayer) => {
    setLoadingDetail(true);

    try {
      const [response] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/fa-market/detail?playerId=${player.id}`),
        new Promise(resolve => setTimeout(resolve, 1500))
      ]);

      if (!response.ok) {
        throw new Error("서버 응답이 없습니다.");
      }

      const dto: FaDetailResponseDto = await response.json();

      const posType = getPositionType(dto.subPositionType);
      const stats = [];

      if (posType === 'Pitcher') {
        stats.push({ label: '구위 점수', value: Number(dto.statPitching || 0) });
        stats.push({ label: '안정성 점수', value: Number(dto.statStability || 0) });
      } else {
        stats.push({ label: '공격 점수', value: Number(dto.statOffense || 0) });
        stats.push({ label: '수비 점수', value: Number(dto.statDefense || 0) });
      }
      stats.push({ label: '기여도 점수', value: Number(dto.statContribution || 0) });

      const detailPlayer: FaPlayer = {
        id: dto.playerId,
        name: dto.playerName,
        position: dto.subPositionType,
        positionType: posType,
        age: dto.age,
        grade: dto.grade as FaGrade,
        currentSalary: dto.currentSalary,
        predictionSummary: dto.playerIntro,
        report: dto.aiFeedback,
        faStatus: dto.faStatus,
        faYear: selectedYear,
        stats: stats
      };

      setSelectedPlayer(detailPlayer);

    } catch (e) {
      console.error("Failed to fetch FA detail:", e);
      alert("스카우팅 리포트를 불러오는데 실패했습니다. 서버 상태를 확인해주세요.");
      
      const mockDetail = generateMockFaPlayers(selectedTeamCode, selectedYear).find(p => p.name === player.name);
      if (mockDetail) {
         setSelectedPlayer({...mockDetail, faStatus: player.faStatus});
      }
    } finally {
      setLoadingDetail(false);
    }
  };

  // 4. Styles Helper
  const getTeamColor = (code: string) => {
    return TEAMS.find(t => t.code === code)?.color || '#3b82f6';
  };
  const activeColor = getTeamColor(selectedTeamCode);
  const teamNameKR = KOREAN_TEAM_NAMES[selectedTeamCode] || selectedTeamCode;

  const getGradeColorHex = (grade: FaGrade) => {
    switch(grade) {
      case 'A': return '#4ade80';
      case 'B': return '#facc15';
      case 'C': return '#f97316';
      case 'D': return '#94a3b8';
      default: return '#ffffff';
    }
  };

  return (
    <div className="relative z-10 w-full animate-fade-in-up min-h-screen pb-20 overflow-hidden">
      
      {/* Loading Overlay */}
      {loadingDetail && <AnalysisLoadingOverlay />}

      {/* Background Watermark */}
      <div 
        className="fixed -left-[5%] bottom-[10%] text-[20vw] font-black opacity-[0.02] pointer-events-none select-none transition-colors duration-700 whitespace-nowrap"
        style={{ color: activeColor }}
      >
        FA {selectedYear}
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
              {selectedYear} FA <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">MARKET ANALYSIS</span>
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

        {/* YEAR TOGGLE & METRICS GUIDE */}
        {!selectedPlayer && (
          <>
            <div className="flex justify-center mb-10">
               <div className="bg-[#0f172a] p-1.5 rounded-full border border-white/10 flex gap-1 shadow-2xl">
                  {[2026, 2027].map((year) => (
                    <button
                      key={year}
                      onClick={() => setSelectedYear(year)}
                      className={`
                        px-10 py-3 rounded-full text-lg font-black transition-all relative
                        ${selectedYear === year 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                          : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                        }
                      `}
                    >
                      {year} FA
                      {selectedYear === year && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0f172a]"></span>
                      )}
                    </button>
                  ))}
               </div>
            </div>
            <MetricsGuide />
          </>
        )}

        {/* LAYOUT: Sidebar + Content */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          
          {/* TEAM SELECTOR (Sidebar) */}
          <div className="w-full lg:w-72 flex-shrink-0 z-20">
             <div className="sticky top-24">
               <label className="block text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest px-2">Select Team ({selectedYear})</label>
               <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-3 pb-4 lg:pb-0 no-scrollbar">
                 {TEAMS.map((team) => {
                   // teamCounts 상태에서 값을 가져옴 (API로 조회된 값)
                   const playerCount = teamCounts[team.code] || 0;
                   return (
                     <button
                       key={team.code}
                       onClick={() => setSelectedTeamCode(team.code)}
                       disabled={!!selectedPlayer} 
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
                       <div className="text-left flex-1 flex justify-between items-center pr-2">
                          <span className="block font-bold text-lg leading-none whitespace-nowrap">
                            {KOREAN_TEAM_NAMES[team.code] || team.code}
                          </span>
                          {playerCount > 0 && (
                            <span 
                              className={`
                                ml-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shadow-sm
                                ${selectedTeamCode === team.code ? 'bg-slate-900 text-white' : 'bg-white/10 text-white'}
                              `}
                            >
                              {playerCount}
                            </span>
                          )}
                       </div>
                     </button>
                   );
                 })}
               </div>
             </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="flex-1 min-h-[600px] relative">
            
            {/* Team Banner - Size Increased */}
            {!selectedPlayer && (
              <div className="mb-10 animate-fade-in-up">
                <div 
                  className="rounded-[2.5rem] p-10 md:p-14 relative overflow-hidden border border-white/5 flex items-center justify-between"
                  style={{ background: `linear-gradient(90deg, ${activeColor}33 0%, transparent 100%)` }}
                >
                   <div>
                      <h3 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">{teamNameKR}</h3>
                      <p className="text-slate-300 text-lg md:text-xl font-medium">{selectedYear} 예비 FA 자격 획득 선수 명단</p>
                   </div>
                   <div className="w-20 h-20 rounded-full flex items-center justify-center bg-black/20 border border-white/10 text-white font-black text-4xl shadow-inner">
                      {faList.length}
                   </div>
                </div>
              </div>
            )}

            {/* Content Area */}
            {loadingList ? (
               <div className="grid grid-cols-1 gap-6">
                 {[1, 2].map(i => (
                   <div key={i} className="h-64 bg-white/5 rounded-[2rem] animate-pulse"></div>
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
                    <div className="h-48 relative overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"></div>
                       <div className="absolute inset-0 opacity-20" style={{ backgroundColor: activeColor }}></div>
                       <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0a0f1e] to-transparent"></div>
                    </div>

                    <div className="px-12 pb-12 -mt-24 relative z-10">
                       {/* Profile Header */}
                       <div className="flex flex-col md:flex-row gap-10 items-start mb-16">
                          {/* Grade Badge Large with Neon */}
                          <div 
                            className="w-40 h-40 rounded-[2rem] flex items-center justify-center text-8xl font-black shadow-2xl border-4 border-[#0a0f1e] relative group"
                            style={{ 
                              backgroundColor: getGradeColorHex(selectedPlayer.grade), 
                              color: '#000',
                              boxShadow: `0 0 60px -10px ${getGradeColorHex(selectedPlayer.grade)}aa`
                            }}
                          >
                             {selectedPlayer.grade}
                             <div className="absolute -bottom-4 px-4 py-1.5 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">Grade</div>
                          </div>

                          <div className="flex-1 pt-10">
                             <div className="flex flex-wrap items-center gap-4 mb-3">
                                <span className="text-slate-400 font-bold text-xl">{selectedPlayer.position}</span>
                                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full"></span>
                                <span className="text-slate-400 font-bold text-xl">{selectedPlayer.age}세</span>
                                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full"></span>
                                <FaStatusBadge status={selectedPlayer.faStatus} />
                             </div>
                             <h2 className="text-6xl font-black text-white mb-6 tracking-tight">{selectedPlayer.name}</h2>
                             <div className="flex items-center gap-4">
                                <div className="px-6 py-3 rounded-xl bg-white/5 border border-white/10">
                                   <span className="text-xs text-slate-500 block mb-1 uppercase tracking-wider font-bold">Current Salary (Est.)</span>
                                   <span className="text-2xl font-black text-white font-mono">{selectedPlayer.currentSalary}</span>
                                </div>
                             </div>
                          </div>
                       </div>

                       {/* Analysis Content */}
                       <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                          {/* Left: Stats Chart */}
                          <div className="lg:col-span-1 bg-white/5 rounded-3xl p-8 border border-white/5">
                             <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8 border-b border-white/5 pb-4">
                               {selectedPlayer.positionType === 'Pitcher' ? 'Pitching' : 'Batting'} Capability
                             </h4>
                             <div className="space-y-8">
                                {selectedPlayer.stats.map((stat) => (
                                  <StatBar key={stat.label} label={stat.label} value={stat.value} color={getGradeColorHex(selectedPlayer.grade)} />
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
                                <div className="bg-[#0f172a] rounded-3xl p-10 border border-white/5 relative overflow-hidden shadow-lg">
                                   <div className="absolute top-0 right-0 p-4 opacity-5">
                                      <svg className="w-40 h-40 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-1.07 3.97-2.74 5.39z"/></svg>
                                   </div>
                                   
                                   <div className="relative mb-8 pl-6 border-l-4 border-white/20">
                                      <p 
                                        className="text-3xl md:text-4xl font-serif font-black italic leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 drop-shadow-sm"
                                      >
                                        {/* DETAIL 화면: 여기도 따옴표 제거 적용 */}
                                        {cleanSummary(selectedPlayer.predictionSummary)}
                                      </p>
                                   </div>

                                   <p className="text-slate-300 text-xl font-medium leading-relaxed text-justify whitespace-pre-line relative z-10 font-sans">
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
              
              // --- LIST VIEW (WIDE CARD) ---
              // grid-cols-1 md:grid-cols-2 대신 넓게 쓰기 위해 xl에서 2열, 그 외 1열로 조정하여 카드 너비 확보
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-fade-in-up">
                {faList.map((player) => {
                  const gradeColor = getGradeColorHex(player.grade);
                  return (
                    <div 
                      key={player.id}
                      onClick={() => handlePlayerClick(player)}
                      // h-auto로 변경하여 내용에 따라 늘어나게 함, min-h 설정
                      className="group relative bg-[#0a0f1e] rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border-2 min-h-[320px]"
                      style={{ 
                        borderColor: `${gradeColor}66`,
                        boxShadow: `0 0 30px -5px ${gradeColor}33`
                      }}
                    >
                      {/* Hover Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      {/* Grade Badge - Top Right */}
                      <GradeBadge grade={player.grade} />

                      {/* Background Glow */}
                      <div 
                        className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity duration-500"
                        style={{ backgroundColor: activeColor }}
                      ></div>

                      <div className="relative z-10 mt-2">
                        {/* FA Status Badge & Position */}
                        <div className="flex items-center gap-4 mb-5">
                            <FaStatusBadge status={player.faStatus} />
                            <span className="text-lg font-bold text-slate-300 uppercase tracking-wide">{player.position}</span>
                            <span className="text-lg text-slate-400 font-bold font-mono">/ {player.age}세</span>
                        </div>
                        
                        <h3 className="text-5xl font-black text-white mb-6 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all">
                          {player.name}
                        </h3>
                        
                        {/* Pride Statement - Removed quotes, Removed line-clamp */}
                        <div className="relative pl-2 pr-12">
                           <div className="absolute -left-2 top-0 bottom-0 w-1.5 bg-gradient-to-b from-white/40 to-transparent rounded-full"></div>
                           <p 
                             className="text-2xl font-serif italic font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 leading-snug drop-shadow-md whitespace-pre-line"
                           >
                             {cleanSummary(player.predictionSummary)}
                           </p>
                        </div>
                      </div>

                      <div className="relative z-10 mt-8 pt-6 border-t border-white/5">
                        <div className="flex justify-between items-center">
                            <div className="flex gap-2 items-center">
                              <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: gradeColor, color: gradeColor }}></div>
                              <span className="text-xs text-slate-400 uppercase tracking-widest font-black">Grade {player.grade}</span>
                            </div>
                            <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-300 group-hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full">
                              더그아웃 분석 보기 
                              <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              
              // --- EMPTY STATE ---
              <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-white/5 rounded-[3rem] bg-[#0a0f1e]/30">
                 <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 text-4xl shadow-inner grayscale opacity-50">
                   ⚾️
                 </div>
                 <h3 className="text-2xl font-bold text-slate-400 mb-2">{selectedYear} 시즌 해당 구단에 FA 대상자가 없습니다.</h3>
                 <p className="text-slate-500">다른 구단이나 다른 연도를 선택해주세요.</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default FaAnalysis;
