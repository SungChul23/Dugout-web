
import React, { useState, useEffect, useRef } from 'react';
import { TEAMS } from '../constants';

const API_BASE_URL = "https://dugout.cloud";

interface GameScheduleProps {
  onCancel: () => void;
  user: { nickname: string; favoriteTeam?: string } | null;
}

// 서버 DTO 사양에 맞춘 인터페이스 (Null 허용)
interface Game {
  id: number;
  date?: string; // YYYY-MM-DD
  time?: string; // HH:mm
  home?: string; // 팀 한글 풀네임
  away?: string; // 팀 한글 풀네임
  homeScore?: number; // Added for score display
  awayScore?: number; // Added for score display
  stadium?: string;
  status?: string; // SCHEDULED, LIVE, FINISHED, CANCELED
}

const MONTHS = [3, 4, 5, 6, 7, 8, 9];
const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'];

// 한글 팀명 -> constants.ts의 영문 데이터(Color 등) 매핑용
const TEAM_MAP_TO_CONST: Record<string, string> = {
  'KIA 타이거즈': 'KIA TIGERS',
  '삼성 라이온즈': 'SAMSUNG LIONS',
  'LG 트윈스': 'LG TWINS',
  '두산 베어스': 'DOOSAN BEARS',
  'kt wiz': 'KT WIZ',
  'KT 위즈': 'KT WIZ', // 혹시 모를 오타 방어
  'SSG 랜더스': 'SSG LANDERS',
  '한화 이글스': 'HANWHA EAGLES',
  '롯데 자이언츠': 'LOTTE GIANTS',
  'NC 다이노스': 'NC DINOS',
  '키움 히어로즈': 'KIWOOM HEROES',
};

const GameSchedule: React.FC<GameScheduleProps> = ({ onCancel, user }) => {
  // KST(한국 시간) 기준으로 오늘 날짜 계산
  const kstString = new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" });
  const kstDate = new Date(kstString);
  const currentMonth = kstDate.getMonth() + 1;
  const currentDay = kstDate.getDate();

  const isKboSeason = currentMonth >= 3 && currentMonth <= 9;
  const initialMonth = isKboSeason ? currentMonth : 3;
  const initialDay = isKboSeason ? currentDay : 28;

  const [selectedMonth, setSelectedMonth] = useState<number>(initialMonth);
  const [selectedDay, setSelectedDay] = useState<number>(initialDay);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  
  const dayScrollRef = useRef<HTMLDivElement>(null);
  const prevMonth = useRef<number>(initialMonth);
  const hasScrolledInitially = useRef(false);

  useEffect(() => {
    fetchMonthlySchedule(selectedMonth);
    
    if (prevMonth.current !== selectedMonth) {
      // 사용자가 월을 변경했을 때만 날짜 초기화
      if (selectedMonth === 3) {
        setSelectedDay(28);
      } else {
        setSelectedDay(1);
      }
      if(dayScrollRef.current) {
        dayScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      }
      prevMonth.current = selectedMonth;
    } else if (!hasScrolledInitially.current) {
      // 첫 로드 시 선택된 날짜로 스크롤
      hasScrolledInitially.current = true;
      setTimeout(() => {
        if (dayScrollRef.current) {
          const selectedButton = dayScrollRef.current.querySelector(`button[data-day="${initialDay}"]`) as HTMLButtonElement;
          if (selectedButton) {
            const containerWidth = dayScrollRef.current.clientWidth;
            const buttonLeft = selectedButton.offsetLeft;
            const buttonWidth = selectedButton.clientWidth;
            dayScrollRef.current.scrollTo({
              left: buttonLeft - (containerWidth / 2) + (buttonWidth / 2),
              behavior: 'smooth'
            });
          }
        }
      }, 100);
    }
  }, [selectedMonth, initialDay]);

  // --- API FETCH FUNCTION ---
  const fetchMonthlySchedule = async (month: number) => {
    setLoading(true);
    
    try {
      // 실제 API 호출
      const response = await fetch(`${API_BASE_URL}/api/v1/schedule?year=2026&month=${month}`);
      
      if (!response.ok) {
        throw new Error(`Server Error: ${response.status}`);
      }

      const data = await response.json();
      
      // 서버가 null을 줄 경우 빈 배열로 처리
      setGames(Array.isArray(data) ? data : []);
      
    } catch (error) {
      console.error("Failed to fetch schedule:", error);
      setGames([]); // 에러 발생 시 빈 데이터
    } finally {
      setLoading(false);
    }
  };

  // --- HELPER FUNCTIONS ---
  const getTeamInfo = (koreanName: string) => {
    // 서버에서 null이 올 수 있으므로 방어 코드
    if (!koreanName) return { color: '#334155', code: '?' };

    const englishName = TEAM_MAP_TO_CONST[koreanName];
    const found = TEAMS.find(t => t.name === englishName);
    return found || { color: '#334155', code: koreanName.substring(0, 2) };
  };

  const getDaysInMonthArray = (month: number) => {
    const year = 2026;
    const daysCount = new Date(year, month, 0).getDate();
    const allDays = Array.from({ length: daysCount }, (_, i) => i + 1);

    // 3월은 개막일(28일)부터 보여주기 (UX 개선)
    if (month === 3) {
      return allDays.filter(day => day >= 28);
    }

    return allDays;
  };

  const getDayOfWeek = (day: number) => {
    const date = new Date(2026, selectedMonth - 1, day);
    return DAYS_OF_WEEK[date.getDay()];
  };

  // Filter games for selected date
  const selectedDateStr = `2026-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
  
  const dailyGames = games.filter(g => g.date === selectedDateStr);
  const isMonday = getDayOfWeek(selectedDay) === '월';

  return (
    <div className="relative z-10 w-full animate-fade-in-up min-h-screen pb-20">
      {/* WIDER CONTAINER: max-w-[90%] or max-w-[1600px] */}
      <div className="w-[95%] max-w-[1600px] mx-auto px-4 md:px-8 py-12">
        
        {/* Header Section - Font Size Increased */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6 border-b border-white/5 pb-8">
          <div>
            <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm">
               <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
               <span className="text-xs md:text-sm font-mono text-blue-300 font-bold uppercase tracking-widest">2026 Season Official Schedule</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-4 leading-tight">
              KBO <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">MATCH CENTER</span>
            </h2>
            <p className="text-slate-400 text-xl md:text-2xl font-light">
              2026 시즌 정규리그 전 경기 일정 및 결과
            </p>
          </div>
          <button 
            onClick={onCancel}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors border border-white/10 px-8 py-4 rounded-2xl hover:bg-white/5 bg-[#0a0f1e]"
          >
            <span className="text-base font-bold">메인으로</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Schedule Notice Info */}
        <div className="mb-12 bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5 md:p-6 flex items-start gap-4 backdrop-blur-sm">
           <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
             <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
           </div>
           <p className="text-slate-300 text-sm md:text-base leading-relaxed font-medium">
             KBO 정규시즌은 팀당 144경기를 치르며, 이 중 9월 초/중순까지 우천 취소 등을 고려해 팀당 135경기가 우선 편성됩니다.
           </p>
        </div>

        {/* Controls Layout: Month & Day Slider */}
        <div className="mb-10">
          {/* Month Selector */}
          <div className="flex overflow-x-auto gap-2 no-scrollbar mb-6">
            {MONTHS.map(month => (
              <button
                key={month}
                onClick={() => setSelectedMonth(month)}
                className={`
                  flex-shrink-0 px-6 py-3 rounded-full font-black text-lg transition-all relative border
                  ${selectedMonth === month 
                    ? 'text-white bg-blue-600 border-blue-500 shadow-lg shadow-blue-900/40' 
                    : 'text-slate-500 bg-[#0a0f1e] border-white/5 hover:border-white/20 hover:text-slate-300'
                  }
                `}
              >
                {month}월
              </button>
            ))}
          </div>

          {/* Day Slider */}
          <div 
            ref={dayScrollRef}
            className="flex overflow-x-auto gap-3 no-scrollbar py-4 scroll-smooth mask-linear-fade"
          >
            {getDaysInMonthArray(selectedMonth).map(day => {
              const dayOfWeek = getDayOfWeek(day);
              const isSelected = selectedDay === day;
              const isWeekend = dayOfWeek === '토' || dayOfWeek === '일';
              const isTodayMonday = dayOfWeek === '월';
              
              return (
                <button
                  key={day}
                  data-day={day}
                  onClick={() => setSelectedDay(day)}
                  className={`
                    flex-shrink-0 flex flex-col items-center justify-center w-16 h-24 rounded-2xl border transition-all duration-300 group
                    ${isSelected 
                      ? 'bg-gradient-to-br from-blue-600 to-cyan-500 border-transparent shadow-[0_0_20px_rgba(59,130,246,0.5)] scale-110 z-10' 
                      : 'bg-[#0a0f1e] border-white/5 text-slate-500 hover:border-white/20 hover:bg-white/5'
                    }
                    ${isTodayMonday && !isSelected ? 'opacity-50 grayscale' : ''}
                  `}
                >
                  <span className={`text-xs font-bold mb-1 ${isSelected ? 'text-blue-100' : isWeekend ? 'text-red-400' : 'text-slate-500'}`}>
                    {dayOfWeek}
                  </span>
                  <span className={`text-2xl font-black ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {day}
                  </span>
                  {isSelected && <div className="w-1 h-1 rounded-full bg-white mt-1"></div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Daily Game List - WIDE GRID */}
        <div className="min-h-[400px]">
          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-40 bg-white/5 rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : dailyGames.length > 0 ? (
            <div className="animate-fade-in-up">
              {/* 날짜 헤더 크기 확대 (text-4xl) */}
              <div className="flex items-center gap-4 mb-8">
                 <div className="h-10 w-2 bg-gradient-to-b from-blue-500 to-cyan-400 rounded-full"></div>
                 <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                   {selectedMonth}월 {selectedDay}일 <span className="text-slate-500 font-medium">({getDayOfWeek(selectedDay)})</span>
                 </h3>
                 <span className="text-base font-mono text-slate-400 bg-white/5 px-4 py-2 rounded-full ml-auto">
                   {dailyGames.length} GAMES
                 </span>
              </div>

              {/* Grid Layout: 1 col (mobile), 2 col (tablet), 3 col (desktop) */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 xl:gap-10">
                {dailyGames.map((game) => {
                  const homeName = game.home || '';
                  const awayName = game.away || '';
                  const userTeam = user?.favoriteTeam || '';
                  
                  const isMyGame = userTeam && (
                    homeName.includes(userTeam.split(' ')[0]) || 
                    awayName.includes(userTeam.split(' ')[0])
                  );

                  const homeInfo = getTeamInfo(homeName);
                  const awayInfo = getTeamInfo(awayName);
                  
                  const isFinished = game.status === 'FINISHED';
                  const isLive = game.status === 'LIVE';
                  const hasScore = game.homeScore !== undefined && game.awayScore !== undefined;
                  
                  const homeWon = isFinished && hasScore && game.homeScore! > game.awayScore!;
                  const awayWon = isFinished && hasScore && game.awayScore! > game.homeScore!;
                  const isDraw = isFinished && hasScore && game.homeScore === game.awayScore;

                  const homeLost = isFinished && hasScore && game.homeScore! < game.awayScore!;
                  const awayLost = isFinished && hasScore && game.awayScore! < game.homeScore!;
                  
                  return (
                    <div 
                      key={game.id}
                      className={`
                        relative group bg-[#0a0f1e] rounded-[2.5rem] overflow-hidden transition-all duration-300
                        ${isMyGame 
                          ? 'border-2 border-brand-accent shadow-[0_0_40px_-10px_rgba(6,182,212,0.3)]' 
                          : 'border border-white/5 hover:border-white/20 hover:bg-[#0f1629]'
                        }
                      `}
                    >
                      {/* My Team Badge */}
                      {isMyGame && (
                        <div className="absolute top-0 right-0 bg-brand-accent text-brand-dark text-xs font-black px-4 py-2 rounded-bl-3xl z-20 shadow-lg">
                          MY MATCH
                        </div>
                      )}

                      {/* 패딩 확대 (p-8 md:p-10) */}
                      <div className="p-8 md:p-10 relative z-10 flex flex-col justify-between h-full">
                         
                         {/* Header: Time & Stadium */}
                         <div className="flex justify-between items-start mb-8 border-b border-white/5 pb-6">
                            <div className="flex flex-col gap-2">
                              {/* 시간 크기 확대 (text-3xl md:text-4xl) */}
                              <span className="text-3xl md:text-4xl font-black text-white font-mono tracking-tight">{game.time || 'TBD'}</span>
                              
                              {/* 구장 크기 확대 (text-lg) */}
                              <span className="text-lg text-slate-400 flex items-center gap-2 font-medium">
                                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                {game.stadium || '경기장 미정'}
                              </span>
                            </div>
                            
                            {/* 상태 뱃지 확대 */}
                            <div className={`text-sm md:text-base font-black px-4 py-2 rounded-xl border-2 tracking-wider ${
                              game.status === 'LIVE' 
                                ? 'bg-red-600/20 text-red-500 border-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                                : game.status === 'FINISHED' 
                                  ? 'bg-slate-800 text-slate-300 border-slate-700' 
                                  : 'bg-transparent text-slate-400 border-slate-600/50'
                            }`}>
                              {game.status === 'LIVE' ? 'LIVE' : game.status === 'FINISHED' ? '종료' : 'PREVIEW'}
                            </div>
                         </div>

                         {/* Matchup Content */}
                         <div className="flex items-center justify-between gap-3 md:gap-4">
                            {/* Away */}
                            <div className={`flex flex-col items-center flex-1 relative ${awayLost ? 'opacity-40 grayscale' : ''}`}>
                               {awayWon && (
                                 <div className="absolute -top-3 -left-2 md:-left-4 bg-red-600 text-white text-[10px] md:text-xs font-black px-2 py-1 rounded-md transform -rotate-12 z-20 shadow-lg border border-red-400">
                                   WIN
                                 </div>
                               )}
                               <div 
                                 className="w-full aspect-square max-w-[110px] md:max-w-[130px] rounded-[2rem] flex flex-col items-center justify-center shadow-2xl border border-white/10 relative overflow-hidden transform group-hover:-translate-y-1 transition-all duration-500 bg-[#12182b]"
                               >
                                 {/* Colored Glow Effect */}
                                 <div 
                                   className="absolute inset-0 opacity-20 transition-opacity duration-500 group-hover:opacity-40" 
                                   style={{ background: `radial-gradient(circle at 50% 0%, ${awayInfo.color}, transparent 70%)` }}
                                 ></div>
                                 
                                 {/* Bottom Color Bar */}
                                 <div 
                                   className="absolute bottom-0 left-0 right-0 h-2"
                                   style={{ backgroundColor: awayInfo.color }}
                                 ></div>

                                 <div className="relative z-10 flex flex-col items-center justify-center gap-1.5 px-2">
                                   <span className="text-2xl md:text-3xl font-black text-white tracking-tight text-center break-keep leading-none">
                                     {(awayName || '미정').split(' ')[0]}
                                   </span>
                                   {(awayName || '미정').split(' ').length > 1 && (
                                     <span className="text-xs md:text-sm font-bold text-slate-400 text-center break-keep">
                                       {(awayName || '미정').split(' ').slice(1).join(' ')}
                                     </span>
                                   )}
                                 </div>
                               </div>
                            </div>

                            <div className="flex flex-col items-center justify-center px-1 md:px-2 min-w-[80px] md:min-w-[120px]">
                               {(isFinished || isLive) && hasScore ? (
                                 <div className="flex items-center gap-3 md:gap-6">
                                   <span className={`font-mono text-5xl md:text-6xl font-black ${awayWon ? 'text-white' : awayLost ? 'text-slate-500' : 'text-white'}`}>
                                     {game.awayScore}
                                   </span>
                                   <span className="text-xl md:text-2xl font-black text-slate-600 mb-1">:</span>
                                   <span className={`font-mono text-5xl md:text-6xl font-black ${homeWon ? 'text-white' : homeLost ? 'text-slate-500' : 'text-white'}`}>
                                     {game.homeScore}
                                   </span>
                                 </div>
                               ) : (
                                 <span className="text-3xl md:text-4xl font-black text-slate-700 italic">VS</span>
                               )}
                            </div>

                            {/* Home */}
                            <div className={`flex flex-col items-center flex-1 relative ${homeLost ? 'opacity-40 grayscale' : ''}`}>
                               {homeWon && (
                                 <div className="absolute -top-3 -right-2 md:-right-4 bg-red-600 text-white text-[10px] md:text-xs font-black px-2 py-1 rounded-md transform rotate-12 z-20 shadow-lg border border-red-400">
                                   WIN
                                 </div>
                               )}
                               <div 
                                 className="w-full aspect-square max-w-[110px] md:max-w-[130px] rounded-[2rem] flex flex-col items-center justify-center shadow-2xl border border-white/10 relative overflow-hidden transform group-hover:-translate-y-1 transition-all duration-500 bg-[#12182b]"
                               >
                                 {/* Colored Glow Effect */}
                                 <div 
                                   className="absolute inset-0 opacity-20 transition-opacity duration-500 group-hover:opacity-40" 
                                   style={{ background: `radial-gradient(circle at 50% 0%, ${homeInfo.color}, transparent 70%)` }}
                                 ></div>
                                 
                                 {/* Bottom Color Bar */}
                                 <div 
                                   className="absolute bottom-0 left-0 right-0 h-2"
                                   style={{ backgroundColor: homeInfo.color }}
                                 ></div>

                                 <div className="relative z-10 flex flex-col items-center justify-center gap-1.5 px-2">
                                   <span className="text-2xl md:text-3xl font-black text-white tracking-tight text-center break-keep leading-none">
                                     {(homeName || '미정').split(' ')[0]}
                                   </span>
                                   {(homeName || '미정').split(' ').length > 1 && (
                                     <span className="text-xs md:text-sm font-bold text-slate-400 text-center break-keep">
                                       {(homeName || '미정').split(' ').slice(1).join(' ')}
                                     </span>
                                   )}
                                 </div>
                               </div>
                            </div>
                         </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            // No Games State
            <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-white/5 rounded-[3rem] bg-[#0a0f1e]/30">
               {isMonday ? (
                 <>
                   <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 text-5xl shadow-inner">☕️</div>
                   <h3 className="text-3xl font-bold text-white mb-3">오늘은 경기가 없습니다.</h3>
                   <p className="text-slate-400 text-lg">KBO 리그 월요일은 휴식일입니다.</p>
                 </>
               ) : (
                 <>
                   <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 text-5xl shadow-inner">📅</div>
                   <h3 className="text-3xl font-bold text-white mb-3">예정된 경기가 없습니다.</h3>
                   <p className="text-slate-400 text-lg">이 날짜에는 경기 일정이 없습니다.</p>
                 </>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameSchedule;
