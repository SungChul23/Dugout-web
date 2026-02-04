
import React, { useState, useEffect } from 'react';
import { TEAMS } from '../constants';

const API_BASE_URL = "https://dugout.cloud";

interface MyDashboardProps {
  user: { nickname: string; favoriteTeam?: string; teamSlogan?: string };
  onFindTeamClick: () => void;
  onNewsClick: () => void; // 뉴스 페이지로 이동하는 핸들러 추가
}

// 서버 DTO 구조
interface PlayerInsightDto {
  slotNumber: number;
  playerId: number;
  name: string;
  position: string;
  predictedStat: string; // 예: "0.352 (MVP 유력)"
  confidence: number;   // 신뢰도 (0~100)
  isEmpty: boolean;
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

// HTML 태그 제거 및 따옴표 정리 유틸리티
const cleanText = (text: string) => text.replace(/<b>/g, '').replace(/<\/b>/g, '').replace(/&quot;/g, '"');

const MyDashboard: React.FC<MyDashboardProps> = ({ user, onFindTeamClick, onNewsClick }) => {
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  
  // 데이터 가져오기
  useEffect(() => {
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

    fetchDashboard();
  }, [user.favoriteTeam]);

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
    { slotNumber: 1, isEmpty: true },
    { slotNumber: 2, isEmpty: true },
    { slotNumber: 3, isEmpty: true },
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
              <div>
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
                AI Key Player Insight
              </h3>
              <span className="text-sm text-slate-500 font-mono">* 실시간 데이터 기반</span>
            </div>

            {/* 카드 높이 및 그리드 Gap 조정 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {insights.map((insight, idx) => {
                // isEmpty 상태 처리
                if (insight.isEmpty) {
                  return (
                    <div 
                      key={idx}
                      className="bg-[#0a0f1e]/40 border-2 border-dashed border-white/10 p-8 rounded-[2rem] flex flex-col items-center justify-center min-h-[400px] text-center gap-6 transition-all hover:border-white/20 hover:bg-[#0a0f1e]/60 group cursor-pointer"
                      style={{ borderColor: `${teamColor}22` }}
                    >
                      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors text-slate-600 group-hover:text-slate-400 mb-2">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-400 mb-2">선수를 추가하지 않았습니다</p>
                        <p className="text-sm text-slate-600 font-light leading-relaxed">
                          AI가 분석할 핵심 선수를<br/>
                          선택해주세요.
                        </p>
                      </div>
                      <button className="px-5 py-2 rounded-full border border-white/10 text-xs font-bold text-slate-500 group-hover:bg-white/10 group-hover:text-white transition-all">
                        선수 추가하기
                      </button>
                    </div>
                  );
                }

                // predictedStat 파싱
                let mainValue = "-";
                let subLabel = "";
                
                if (insight.predictedStat) {
                  const parts = insight.predictedStat.split(' ');
                  mainValue = parts[0];
                  subLabel = parts.slice(1).join(' ').replace(/[()]/g, '');
                }

                return (
                  <div 
                    key={idx}
                    className="bg-[#0a0f1e]/80 border border-white/5 p-8 rounded-[2rem] relative overflow-hidden group hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between min-h-[400px]"
                    style={{ borderColor: `${teamColor}33` }}
                  >
                    {/* Background Accents */}
                    <div className="absolute -right-10 -top-10 w-40 h-40 opacity-10 blur-3xl rounded-full" style={{ backgroundColor: teamColor }}></div>
                    
                    <div className="relative z-10 flex flex-col h-full">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center border border-white/5 text-slate-400 font-black text-base">
                            {insight.position}
                        </div>
                        <div className="text-right">
                          <span className="block text-5xl font-black text-white italic tracking-tight mb-1">{mainValue}</span>
                          <span className="text-xs text-slate-500 uppercase tracking-widest font-bold block">{subLabel || 'AI PREDICTION'}</span>
                        </div>
                      </div>

                      {/* Player Name */}
                      <h4 className="text-3xl font-bold text-white mb-auto mt-4">{insight.name}</h4>
                      
                      <div className="w-full h-[1px] bg-white/10 my-8"></div>

                      {/* Footer */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-base text-slate-400">예측 신뢰도</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold" style={{ color: teamColor }}>{insight.confidence}%</span>
                            </div>
                        </div>
                        <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${insight.confidence}%`, backgroundColor: teamColor }}></div>
                        </div>
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
    </div>
  );
};

export default MyDashboard;
