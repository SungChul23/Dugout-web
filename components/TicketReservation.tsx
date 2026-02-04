
import React, { useState, useEffect } from 'react';
import { TEAMS } from '../constants';

const API_BASE_URL = "https://dugout.cloud";

interface TicketReservationProps {
  onCancel: () => void;
}

// 서버 DTO 구조
interface TeamTicketResponseDto {
  id: number;
  name: string;        // 팀 이름 (예: 한화 이글스)
  city: string;        // 연고지 (예: 대전)
  stadiumName: string; // 홈구장 이름
  bookingUrl: string;  // 예매 링크
}

// 예매처 판별 헬퍼 함수
const getVendorInfo = (url: string | undefined) => {
  if (!url) return { name: '구단 예매처', color: 'bg-slate-600' };
  if (url.includes('ticketlink')) return { name: '티켓링크', color: 'bg-red-500' };
  if (url.includes('interpark')) return { name: '인터파크', color: 'bg-purple-500' };
  if (url.includes('lotte')) return { name: '롯데 자이언츠', color: 'bg-[#041E42]' };
  if (url.includes('ncdinos')) return { name: 'NC 다이노스', color: 'bg-[#315288]' };
  return { name: '구단 홈페이지', color: 'bg-brand-accent' };
};

// 한글 팀명으로 TEAMS 상수의 스타일(Color) 찾기
const getTeamStyle = (koreanName: string) => {
  // 공백 제거 및 대문자 변환 후 매칭 시도
  const normalizedKey = koreanName.replace(/\s/g, '');
  
  const found = TEAMS.find(t => {
    const normalizedConst = t.name.replace(/\s/g, '').toUpperCase();
    
    // 영문명 매칭 (기존 constants.ts가 영문명인 경우)
    if (normalizedConst === 'KIATIGERS' && normalizedKey.includes('KIA')) return true;
    if (normalizedConst === 'SAMUNGLIONS' && normalizedKey.includes('삼성')) return true;
    if (normalizedConst === 'LGTWINS' && normalizedKey.includes('LG')) return true;
    if (normalizedConst === 'DOOSANBEARS' && normalizedKey.includes('두산')) return true;
    if (normalizedConst === 'KTWIZ' && (normalizedKey.includes('KT') || normalizedKey.includes('케이티'))) return true;
    if (normalizedConst === 'SSGLANDERS' && normalizedKey.includes('SSG')) return true;
    if (normalizedConst === 'HANWHAEAGLES' && normalizedKey.includes('한화')) return true;
    if (normalizedConst === 'LOTTEGIANTS' && normalizedKey.includes('롯데')) return true;
    if (normalizedConst === 'NCDINOS' && normalizedKey.includes('NC')) return true;
    if (normalizedConst === 'KIWOOMHEROES' && normalizedKey.includes('키움')) return true;
    
    return false;
  });

  return found || { color: '#334155', code: koreanName.substring(0, 2) }; // Fallback
};

const TicketReservation: React.FC<TicketReservationProps> = ({ onCancel }) => {
  const [tickets, setTickets] = useState<TeamTicketResponseDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/tickets/teams`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('티켓 정보를 불러오는데 실패했습니다.');
        }

        const data = await response.json();
        setTickets(data);
      } catch (err) {
        console.error(err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        // Fallback: 에러 시 빈 배열 (혹은 더미데이터를 넣을 수도 있음)
        setTickets([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  return (
    <div className="relative z-10 w-full animate-fade-in-up min-h-screen">
      <div className="max-w-[1600px] mx-auto px-6 py-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 relative gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 bg-pink-500/10 border border-pink-500/20 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm">
               <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
               <span className="text-xs md:text-sm font-mono text-pink-300 font-bold uppercase tracking-widest">2026 Season Ticket Center</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4 leading-tight">
              KBO Ticket <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Reservation</span>
            </h2>
            <p className="text-slate-400 text-xl md:text-2xl font-light leading-relaxed max-w-3xl">
              10개 구단의 홈 경기장 정보와 예매처 바로가기
            </p>
          </div>
          
          {/* Close Button */}
          <button 
            onClick={onCancel}
            className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group px-6 py-4 rounded-2xl hover:bg-white/5 bg-[#0a0f1e] border border-white/10"
          >
            <span className="text-base font-bold uppercase tracking-widest group-hover:mr-2 transition-all">Back to Home</span>
            <div className="w-12 h-12 rounded-full border-2 border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/30">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </button>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 bg-white/5 rounded-[2.5rem] animate-pulse"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-[#0a0f1e]/50 rounded-[3rem] border border-white/5">
             <div className="text-4xl mb-4">⚠️</div>
             <p className="text-slate-400 text-xl">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
            {tickets.map((team) => {
              const style = getTeamStyle(team.name);
              const vendor = getVendorInfo(team.bookingUrl);
              
              return (
                <a 
                  key={team.id} 
                  href={team.bookingUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group relative block bg-[#0a0f1e] border border-white/5 rounded-[2.5rem] overflow-hidden hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] flex flex-col h-full min-h-[380px]"
                >
                  {/* Background Glow based on Team Color */}
                  <div 
                    className="absolute top-0 right-0 w-80 h-80 opacity-0 group-hover:opacity-15 transition-opacity duration-500 pointer-events-none rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"
                    style={{ backgroundColor: style.color }}
                  ></div>

                  <div className="p-10 relative z-10 flex flex-col h-full">
                    {/* Top Bar: Color Line & City Badge */}
                    <div className="flex justify-between items-start mb-8">
                      <div className="w-24 h-2.5 rounded-full shadow-[0_0_10px_currentColor]" style={{ backgroundColor: style.color, color: style.color }}></div>
                      
                      {/* NEW: City Badge */}
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{team.city}</span>
                      </div>
                    </div>

                    {/* Team Info */}
                    <div className="mb-8 flex-1">
                       <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 leading-none break-keep">
                         {team.name}
                       </h3>
                       <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-200 transition-colors">
                         <span className="text-lg font-medium">{team.stadiumName}</span>
                       </div>
                    </div>

                    {/* Vendor Badge & Link */}
                    <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between group-hover:border-white/20 transition-colors">
                      <div className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg ${vendor.color} flex items-center gap-2`}>
                        {/* Vendor Icon */}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                        {vendor.name}
                      </div>
                      
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-white group-hover:text-brand-dark text-slate-500 bg-white/5 border border-white/5"
                      >
                        <svg className="w-5 h-5 group-hover:rotate-45 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketReservation;
