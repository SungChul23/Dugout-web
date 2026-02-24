
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { TEAMS } from '../constants';
import { Settings, LogOut, Trash2 } from 'lucide-react';

const API_BASE_URL = "https://dugout.cloud";

interface MyDashboardProps {
  user: { nickname: string; favoriteTeam?: string; teamSlogan?: string };
  onFindTeamClick: () => void;
  onNewsClick: () => void;
  onAddPlayerClick: () => void;
}

// 서버 DTO 구조
interface PlayerInsightDto {
  slotNumber: number;
  playerId: number;
  name: string;
  backNumber?: number; // 추가: 선수 등번호
  position: string;
  teamCode: string; // 추가: 선수의 소속 팀 코드 (예: "SS", "HH" 등)
  isEmpty: boolean;

  // --- 타자용 지표 ---
  predictedAvg?: number;
  predictedOps?: number;
  predictedHr?: number;
  avgDiff?: number;
  opsDiff?: number;
  hrDiff?: number;

  // --- 투수용 지표 ---
  probElite?: number;
  rolePercentileTop?: number;
  roleRank?: number;
  roleTotal?: number;
}

interface NewsItemDto {
  title: string;
  description?: string;
  link?: string;
  pubDate?: string;
}

interface DashboardResponse {
  favoriteTeamName: string;
  teamSlogan?: string; 
  bookingUrl?: string; // 티켓 예매 링크
  insights: PlayerInsightDto[];
  news: NewsItemDto[]; // 뉴스 리스트
}

// 한글 팀명 -> constants.ts의 영문 팀명 매핑 (데이터 조회용)
const TEAM_NAME_MAP: Record<string, string> = {
  'KIA 타이거즈': 'KIA TIGERS',
  '삼성 라이온즈': 'SAMSUNG LIONS',
  'LG 트윈스': 'LG TWINS',
  '두산 베어스': 'DOOSAN BEARS',
  'KT 위즈': 'KT WIZ',
  'kt wiz': 'KT WIZ',
  'SSG 랜더스': 'SSG LANDERS',
  '한화 이글스': 'HANWHA EAGLES',
  '롯데 자이언츠': 'LOTTE GIANTS',
  'NC 다이노스': 'NC DINOS',
  '키움 히어로즈': 'KIWOOM HEROES',
  // 영문명이 들어올 경우를 대비한 매핑
  'KIA TIGERS': 'KIA TIGERS',
  'SAMSUNG LIONS': 'SAMSUNG LIONS',
  'LG TWINS': 'LG TWINS',
  'DOOSAN BEARS': 'DOOSAN BEARS',
  'SSG LANDERS': 'SSG LANDERS',
  'HANWHA EAGLES': 'HANWHA EAGLES',
  'LOTTE GIANTS': 'LOTTE GIANTS',
  'NC DINOS': 'NC DINOS',
  'KIWOOM HEROES': 'KIWOOM HEROES',
};

// 영문 팀명 -> 한글 팀명 매핑 (화면 표시용)
const ENGLISH_TO_KOREAN: Record<string, string> = {
  'KIA TIGERS': 'KIA 타이거즈',
  'SAMSUNG LIONS': '삼성 라이온즈',
  'LG TWINS': 'LG 트윈스',
  'DOOSAN BEARS': '두산 베어스',
  'KT WIZ': 'KT 위즈',
  'SSG LANDERS': 'SSG 랜더스',
  'HANWHA EAGLES': '한화 이글스',
  'LOTTE GIANTS': '롯데 자이언츠',
  'NC DINOS': 'NC 다이노스',
  'KIWOOM HEROES': '키움 히어로즈',
};

// 서버 팀 코드 -> TEAMS 상수 코드 매핑
const SERVER_TEAM_CODE_MAP: Record<string, string> = {
  'HT': 'KIA', 'KA': 'KIA', 'KIA': 'KIA',
  'SS': 'SAMSUNG', 'SL': 'SAMSUNG', 'SAMSUNG': 'SAMSUNG',
  'LG': 'LG',
  'OB': 'DOOSAN', 'DOOSAN': 'DOOSAN',
  'KT': 'KT',
  'SK': 'SSG', 'SG': 'SSG', 'SSG': 'SSG',
  'HH': 'HANWHA', 'HANWHA': 'HANWHA',
  'LT': 'LOTTE', 'LOTTE': 'LOTTE',
  'NC': 'NC',
  'WO': 'KIWOOM', 'KIWOOM': 'KIWOOM'
};

// --- 서버 팀 ID(PK) -> 영문 팀 코드 매핑 (지역명 제외) ---
const SERVER_ID_TO_CODE: Record<string, string> = {
  '1': 'SAMSUNG',
  '2': 'DOOSAN',
  '3': 'LG',
  '4': 'LOTTE',
  '5': 'KIA',
  '6': 'HANWHA',
  '7': 'SSG',
  '8': 'KIWOOM',
  '9': 'NC',
  '10': 'KT'
};


// HTML 태그 제거 및 따옴표 정리 유틸리티
const cleanText = (text: string) => text.replace(/<b>/g, '').replace(/<\/b>/g, '').replace(/&quot;/g, '"');

const MyDashboard: React.FC<MyDashboardProps> = ({ user, onFindTeamClick, onNewsClick, onAddPlayerClick }) => {
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'confirm' | 'error';
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'success',
  });

  const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false }));
  
  // 데이터 가져오기
  const fetchDashboard = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/dashboard`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        console.error("Failed to fetch dashboard data");
      }
    } catch (error) {
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [user.favoriteTeam]);

  // 선수 제거 확인 및 실행
  const confirmRemovePlayer = async (slotNumber: number) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/dashboard/player?slotNumber=${slotNumber}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        closeModal();
        fetchDashboard(); 
      }
    } catch (error) {
      console.error("Remove Player Error:", error);
    }
  };

  // 선수 제거 핸들러 (모달 호출)
  const handleRemovePlayer = (slotNumber: number) => { 
    setModalState({
      isOpen: true,
      title: '선수 제거',
      message: '정말 이 선수를 대시보드에서 제거하시겠습니까?',
      type: 'confirm',
      onConfirm: () => confirmRemovePlayer(slotNumber),
    });
  };

  // 회원 탈퇴 핸들러
  const handleDeleteAccount = () => {
    setModalState({
      isOpen: true,
      title: '회원 탈퇴',
      message: '정말 탈퇴하시겠습니까?\n탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.',
      type: 'confirm', // Use error type for destructive action
      confirmText: '탈퇴하기',
      onConfirm: async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        try {
          const response = await fetch(`${API_BASE_URL}/api/v1/members/me`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.reload(); // Reload to reset app state
          } else {
            const errorMsg = await response.text();
            setModalState({
              isOpen: true,
              title: '탈퇴 실패',
              message: errorMsg || '회원 탈퇴 중 오류가 발생했습니다.',
              type: 'error',
            });
          }
        } catch (error) {
          console.error("Delete Account Error:", error);
          setModalState({
            isOpen: true,
            title: '오류 발생',
            message: '서버 통신 중 오류가 발생했습니다.',
            type: 'error',
          });
        }
      },
    });
  };

  // 1. 현재 유저의 팀 이름 (서버 데이터 우선, 없으면 로컬 user prop 사용)
  const rawTeamName = dashboardData?.favoriteTeamName || user.favoriteTeam;
  
  // 2. 한글 팀명을 영문 팀명(constants.ts 기준)으로 변환 -> 스타일 및 데이터 매칭용
  const englishTeamName = rawTeamName ? (TEAM_NAME_MAP[rawTeamName] || rawTeamName) : '';

  // 3. 화면 표시용 한글 이름 (영문 -> 한글 변환)
  // rawTeamName이 이미 한글이면 그대로 사용, 아니면 변환 시도
  const displayTeamName = ENGLISH_TO_KOREAN[englishTeamName] || rawTeamName || '';

  // 4. TEAMS 상수에서 매칭되는 팀 정보 찾기 (색상, 순위 등)
  const myTeam = TEAMS.find(t => 
    t.name === englishTeamName || 
    t.name.replace(/\s/g, '') === englishTeamName.replace(/\s/g, '')
  );

  const teamColor = myTeam?.color || '#06b6d4';
  
  // 5. 슬로건 가져오기 (대시보드 데이터 -> 유저 정보 -> 기본값)
  const slogan = dashboardData?.teamSlogan || user.teamSlogan;

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center animate-pulse">
        <div className="w-20 h-20 border-8 border-brand-accent border-t-transparent rounded-full animate-spin mb-8"></div>
        <p className="text-slate-400 text-xl font-light">AI가 데이터를 분석 중입니다...</p>
      </div>
    );
  }

  // --- CASE 1: 팀이 없는 경우 (Empty State) ---
  // 팀 매칭에 실패했거나 이름이 없는 경우
  if (!myTeam) {
    return (
      <div className="relative z-10 w-full animate-scale-up min-h-[70vh] flex items-center justify-center">
        <div className="max-w-3xl mx-auto px-8 text-center">
          <div className="w-32 h-32 mx-auto bg-gradient-to-tr from-slate-800 to-slate-900 rounded-full flex items-center justify-center mb-10 border border-white/10 shadow-2xl relative">
            <svg className="w-14 h-14 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            <div className="absolute top-0 right-0 w-10 h-10 bg-brand-accent rounded-full flex items-center justify-center animate-bounce">
              <span className="text-brand-dark font-bold text-xl">?</span>
            </div>
          </div>
          
          <h2 className="text-5xl font-black text-white mb-6">
            아직 응원하는 팀이 없으신가요?
          </h2>
          <p className="text-slate-400 text-xl mb-12 leading-relaxed font-light">
            더그아웃의 <span className="text-brand-accent font-bold">AI 매칭 시스템</span>이 
            고객님의 성향을 분석하여<br/>가장 잘 어울리는 KBO 구단을 추천해 드립니다.
          </p>
          
          <div className="flex justify-center">
            <button 
              onClick={onFindTeamClick}
              className="bg-gradient-to-r from-brand-accent to-brand-primary text-brand-dark font-black px-10 py-5 rounded-2xl text-xl hover:shadow-[0_0_40px_rgba(6,182,212,0.4)] transition-all transform hover:-translate-y-1"
            >
              나의 팀 찾기 (AI 매칭)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- CASE 2: 팀이 있는 경우 (Dashboard) ---
  const insights = dashboardData?.insights || [
    { slotNumber: 0, isEmpty: true },
    { slotNumber: 1, isEmpty: true },
    { slotNumber: 2, isEmpty: true },
  ] as PlayerInsightDto[];
  
  const newsList = dashboardData?.news || [];
  const ticketUrl = dashboardData?.bookingUrl || myTeam.ticketUrl;

  return (
    <div className="relative z-10 w-full animate-scale-up pb-32">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-12">
        
        {/* 1. Header Section */}
        <header className="relative mb-16 rounded-[3rem] overflow-hidden border border-white/10 group shadow-2xl">
           {/* Dynamic Background */}
           <div 
             className="absolute inset-0 opacity-20 transition-all duration-1000"
             style={{ background: `linear-gradient(135deg, ${teamColor}, #020617 80%)` }}
           ></div>
           
           <div className="relative z-10 p-12 md:p-16 flex flex-col md:flex-row justify-between items-end gap-8">
              {/* Settings Button - Top Right */}
              <div className="absolute top-8 right-8 z-50">
                <div className="relative">
                  <button
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className="p-3 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Settings className="w-8 h-8" />
                  </button>
                  
                  {/* Settings Dropdown */}
                  {isSettingsOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-[#1a1f2e] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-fade-in-up">
                      <button
                        onClick={() => {
                          setIsSettingsOpen(false);
                          handleDeleteAccount();
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-2 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        회원 탈퇴
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                   <span 
                    className="px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border"
                    style={{ borderColor: teamColor, color: teamColor, backgroundColor: `${teamColor}11` }}
                   >
                     My Favorite Team
                   </span>
                </div>
                {/* 한글 팀명 표시 */}
                <h1 className="text-6xl md:text-8xl font-black text-white uppercase italic tracking-tighter leading-none mb-6">
                  {displayTeamName.split(' ')[0]} <span style={{ color: teamColor }}>{displayTeamName.split(' ')[1] || ''}</span>
                </h1>
                
                {/* 팀 슬로건 표시 */}
                {slogan ? (
                  <div className="flex items-start gap-4">
                     <svg className="w-8 h-8 text-white/40 mt-1 transform rotate-180" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.0548 14.5946 14.6596 15.6329 13.5651C16.8926 12.3023 18.5725 11.6667 21.0001 11.6667L21.0001 10.3333C18.6672 10.3333 16.9242 9.69769 15.6644 8.52906C14.6261 7.51909 14.0485 6.09503 14.0485 4L11.0485 4C11.0485 6.7454 11.8532 8.87708 13.4111 10.6667C12.0569 10.6667 10.7495 10.6667 9.98292 10.6667L9.98292 11.6667C10.6133 11.6667 11.7766 11.6667 12.969 11.6667C11.3813 13.5186 10.6133 15.6811 10.6133 18.25L10.6133 21L14.017 21ZM4.98292 21L4.98292 18C4.98292 16.0548 5.56052 14.6596 6.59877 13.5651C7.85848 12.3023 9.53837 11.6667 11.966 11.6667L11.966 10.3333C9.63309 10.3333 7.89012 9.69769 6.63032 8.52906C5.59207 7.51909 5.01446 6.09503 5.01446 4L2.01446 4C2.01446 6.7454 2.81912 8.87708 4.377 10.6667C3.02283 10.6667 1.71542 10.6667 0.948835 10.6667L0.948835 11.6667C1.57919 11.6667 2.74249 11.6667 3.93489 11.6667C2.34721 13.5186 1.57919 15.6811 1.57919 18.25L1.57919 21L4.98292 21Z" /></svg>
                     <p className="text-2xl md:text-3xl text-slate-200 font-serif italic tracking-wide font-medium" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                       {slogan}
                     </p>
                  </div>
                ) : (
                  <p className="text-slate-400 font-light text-xl">
                    {user.nickname}님의 전용 데이터 대시보드
                  </p>
                )}
              </div>

              {/* Rank Card inside Header */}
              <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-[2rem] p-8 flex items-center gap-10 min-w-[320px] shadow-xl">
                 <div>
                    <span className="block text-sm text-slate-400 uppercase tracking-widest mb-1 font-bold">Current Rank</span>
                    <span className="text-6xl font-black text-white italic">#{myTeam.rank || '-'}</span>
                 </div>
                 <div className="h-16 w-[1px] bg-white/10"></div>
                 <div>
                    <div className="flex justify-between w-40 mb-2">
                      <span className="text-sm text-slate-400">Win Rate</span>
                      <span className="text-sm font-mono font-bold" style={{ color: teamColor }}>{myTeam.winRate || '-.--'}</span>
                    </div>
                    <div className="w-40 h-2.5 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ width: `${(myTeam.winRate || 0) * 100}%`, backgroundColor: teamColor }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-3 text-right font-medium">게임차 {myTeam.gamesBehind ?? '-'}</p>
                 </div>
              </div>
           </div>
        </header>

        {/* 2. Main Grid - Expanded Gap */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left Column: Key Players (Span 2) */}
          <div className="lg:col-span-2 space-y-10">
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-bold text-white flex items-center gap-3">
                <span className="w-2 h-8 rounded-full" style={{ backgroundColor: teamColor }}></span>
                나의 키 플레이어
              </h3>
              <span className="text-sm text-slate-500 font-mono">* 실시간 데이터 기반</span>
            </div>

            {/* 카드 높이 및 그리드 Gap 조정 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {insights.map((insight, idx) => {
                // isEmpty 상태 처리
                if (insight.isEmpty) {
                  return (
                    <div 
                      key={idx}
                      className="bg-[#0a0f1e]/40 border-2 border-dashed border-white/10 p-8 rounded-[2rem] flex flex-col items-center justify-center min-h-[450px] text-center gap-6 transition-all hover:border-white/30 hover:bg-[#0a0f1e]/60 group cursor-pointer relative overflow-hidden"
                      style={{ borderColor: `${teamColor}33` }}
                      onClick={onAddPlayerClick}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none"></div>
                      
                      <div 
                        className="w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-2xl"
                        style={{ backgroundColor: `${teamColor}11`, border: `1px solid ${teamColor}33` }}
                      >
                        <svg className="w-10 h-10 transition-colors duration-300" style={{ color: teamColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      
                      <div className="relative z-10">
                        <h4 className="text-xl font-bold text-white mb-3 group-hover:text-brand-accent transition-colors">선수 추가하기</h4>
                        <p className="text-sm text-slate-500 font-light leading-relaxed">
                          AI가 분석할 핵심 선수를 선택하여<br/>
                          <span className="font-bold text-slate-400">2026 시즌 성적</span>을 미리 확인하세요.
                        </p>
                      </div>
                      
                      <div 
                        className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all transform group-hover:translate-y-1"
                        style={{ backgroundColor: teamColor, color: '#000' }}
                      >
                        Add Player
                      </div>
                    </div>
                  );
                }

                // Determine card color based on teamCode
                const playerTeamCode = SERVER_ID_TO_CODE[insight.teamCode] || insight.teamCode;
                // 변환된 영문 코드로 TEAMS 상수에서 컬러와 정보 찾기
                const playerTeam = TEAMS.find(t => t.code === playerTeamCode);
                const cardColor = playerTeam?.color || teamColor;

                // Helper to format diff
                const renderDiff = (diff?: number, isReverse: boolean = false) => {
                    if (diff === undefined || diff === null) return null;
                    if (diff === 0) return <span className="text-slate-500 text-xs font-bold">-</span>;
                    
                    const isPositive = diff > 0;
                    const isGood = isReverse ? !isPositive : isPositive; // For ERA, lower is better (not implemented yet, but good practice)
                    const colorClass = isGood ? 'text-red-400' : 'text-blue-400'; // KBO style: Red is good (hot), Blue is bad (cold) usually? Or Green/Red? 
                    // Let's stick to: Red (+) / Blue (-) for generic stats like AVG/HR. 
                    // Wait, in baseball UI usually Red is hot/high, Blue is cold/low.
                    
                    return (
                        <span className={`text-xs font-bold flex items-center gap-0.5 ${diff > 0 ? 'text-red-400' : 'text-blue-400'}`}>
                            {diff > 0 ? '▲' : '▼'} {Math.abs(diff).toFixed(3).replace(/\.?0+$/, '')}
                        </span>
                    );
                };

                return (
                  <div 
                    key={idx}
                    className="bg-[#0a0f1e]/80 border border-white/5 p-0 rounded-[2rem] relative overflow-hidden group hover:-translate-y-2 transition-all duration-300 flex flex-col min-h-[450px]"
                    style={{ borderColor: `${cardColor}44`, boxShadow: `0 0 30px -10px ${cardColor}22` }}
                  >
                    {/* Header Background */}
                    <div className="absolute top-0 left-0 right-0 h-32 opacity-20" style={{ background: `linear-gradient(180deg, ${cardColor}, transparent)` }}></div>
                    
                    {/* Content Container */}
                    <div className="relative z-10 flex flex-col h-full p-8">
                      
                      {/* Top Row: Position & Team */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-xs font-bold text-white border border-white/10">
                                {insight.position}
                            </span>
                            <span className="text-xs font-bold tracking-widest uppercase text-white/60">
                                {playerTeam?.name || insight.teamCode}
                            </span>
                        </div>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemovePlayer(insight.slotNumber);
                            }}
                            className="text-slate-600 hover:text-red-400 transition-colors p-1"
                            title="선수 제거"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>

                      {/* Player Name */}
                      <div className="mb-8">
                          <h4 className="text-4xl font-black text-white italic tracking-tighter leading-none mb-1">
                              {insight.backNumber && (
                                  <span className="text-2xl text-white/40 mr-2 not-italic font-sans">{insight.backNumber}</span>
                              )}
                              {insight.name}
                          </h4>
                          <p className="text-xs text-slate-500 font-light">2026 Season Prediction</p>
                      </div>

                      {/* Stats Grid */}
                      <div className="flex-1 space-y-4">
                        {insight.predictedAvg !== undefined ? (
                            // --- Batter Stats ---
                            <>
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center justify-between">
                                    <div>
                                        <span className="text-xs text-slate-500 font-bold uppercase block mb-1">AVG</span>
                                        <div className="flex items-end gap-2">
                                            <span className="text-2xl font-black text-white tracking-tight">{insight.predictedAvg.toFixed(3)}</span>
                                            {renderDiff(insight.avgDiff)}
                                        </div>
                                    </div>
                                    <div className="h-8 w-[1px] bg-white/10"></div>
                                    <div className="text-right">
                                        <span className="text-xs text-slate-500 font-bold uppercase block mb-1">HR</span>
                                        <div className="flex items-end justify-end gap-2">
                                            <span className="text-2xl font-black text-white tracking-tight">{insight.predictedHr}</span>
                                            {renderDiff(insight.hrDiff)}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-xs text-slate-500 font-bold uppercase">OPS</span>
                                        {renderDiff(insight.opsDiff)}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-3xl font-black italic" style={{ color: cardColor }}>{insight.predictedOps?.toFixed(3)}</span>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] text-slate-500 uppercase">vs Last Season</span>
                                        </div>
                                    </div>
                                    {/* Simple Bar for OPS context (dummy scale 0.6 to 1.1) */}
                                    <div className="w-full h-1.5 bg-slate-700/50 rounded-full mt-3 overflow-hidden">
                                        <div 
                                            className="h-full rounded-full" 
                                            style={{ 
                                                width: `${Math.min(100, Math.max(0, ((insight.predictedOps || 0) - 0.6) / 0.5 * 100))}%`, 
                                                backgroundColor: cardColor 
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            // --- Pitcher Stats ---
                            <>
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                    <span className="text-xs text-slate-500 font-bold uppercase block mb-2">Elite Probability</span>
                                    <div className="flex items-end justify-between">
                                        <span className="text-3xl font-black text-white italic">
                                            {insight.probElite ? (insight.probElite * 100).toFixed(1) : '0.0'}%
                                        </span>
                                        <span className="text-xs text-slate-400 mb-1">Top Tier Potential</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-700/50 rounded-full mt-3 overflow-hidden">
                                        <div 
                                            className="h-full rounded-full" 
                                            style={{ 
                                                width: `${(insight.probElite || 0) * 100}%`, 
                                                backgroundColor: cardColor 
                                            }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                        <span className="text-xs text-slate-500 font-bold uppercase block mb-1">Role Rank</span>
                                        <span className="text-xl font-black text-white block">
                                            {insight.roleRank}<span className="text-sm text-slate-500 font-normal">/{insight.roleTotal}</span>
                                        </span>
                                    </div>
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                        <span className="text-xs text-slate-500 font-bold uppercase block mb-1">Top %</span>
                                        <span className="text-xl font-black text-white block">
                                            {insight.rolePercentileTop ? (insight.rolePercentileTop).toFixed(1) : '-'}%
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

            {/* Additional Chart */}
            <div className="bg-[#0a0f1e]/60 border border-white/5 rounded-[2rem] p-10 flex flex-col md:flex-row gap-10 items-center">
               <div className="flex-1 space-y-5">
                  <h4 className="text-xl font-bold text-white">이번 주 승부 예측</h4>
                  <p className="text-slate-400 text-base font-light leading-relaxed">
                    최근 팀 타격 사이클과 상대 선발 투수 데이터를 분석했을 때, 
                    <span style={{ color: teamColor }} className="font-bold mx-1 text-lg">이번 주 4승 2패</span> 
                    이상의 성적이 유력합니다.
                  </p>
                  <button className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 mt-4 hover:opacity-80 transition-opacity" style={{ color: teamColor }}>
                    View Full Analysis <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </button>
               </div>
               <div className="w-full md:w-64 h-40 bg-slate-800/50 rounded-2xl flex items-center justify-center border border-white/5 relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 right-0 h-full flex items-end justify-between px-6 pb-6">
                     {[40, 60, 35, 70, 50, 80].map((h, i) => (
                       <div key={i} className="w-6 rounded-t-md opacity-60 transition-all hover:opacity-100" style={{ height: `${h}%`, backgroundColor: teamColor }}></div>
                     ))}
                  </div>
               </div>
            </div>
          </div>

          {/* Right Column: Mini News & Quick Links */}
          <div className="space-y-10">
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-bold text-white">Latest News</h3>
              <button 
                onClick={onNewsClick}
                className="text-sm text-slate-500 hover:text-white transition-colors font-bold"
              >
                더보기
              </button>
            </div>
            
            <div className="bg-[#0a0f1e]/80 border border-white/5 rounded-[2rem] p-8 space-y-8">
               {newsList.length > 0 ? (
                 newsList.map((item, i) => (
                   <a 
                     key={i} 
                     href={item.link || '#'} 
                     target="_blank" 
                     rel="noopener noreferrer" 
                     className="group cursor-pointer block"
                   >
                      <div className="flex justify-between items-start mb-3">
                         <span className="text-[11px] text-slate-500 border border-white/10 px-2 py-0.5 rounded font-bold">TODAY</span>
                      </div>
                      <h5 className="text-base font-bold text-slate-200 group-hover:text-white transition-colors line-clamp-2 mb-2 leading-snug">
                         {cleanText(item.title)}
                      </h5>
                      <p className="text-sm text-slate-500 line-clamp-1">
                        {item.description ? cleanText(item.description) : '상세 내용은 기사 본문에서 확인하세요.'}
                      </p>
                   </a>
                 ))
               ) : (
                 <div className="text-center py-10">
                   <p className="text-slate-500 text-sm">최근 뉴스가 없습니다.</p>
                 </div>
               )}
            </div>

            {/* Ticket Booking Link */}
            <a 
              href={ticketUrl || '#'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block p-8 rounded-[2rem] border border-white/5 relative overflow-hidden group cursor-pointer transition-all hover:brightness-110" 
              style={{ backgroundColor: `${teamColor}11` }}
            >
               <div className="relative z-10 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-white mb-1 text-lg">직관 티켓 예매</h4>
                    <p className="text-sm text-slate-400">이번 주말, 경기장으로!</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                  </div>
               </div>
            </a>
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
        onConfirm={modalState.onConfirm}
      />
    </div>
  );
};

export default MyDashboard;
