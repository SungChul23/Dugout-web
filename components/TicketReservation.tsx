
import React from 'react';
import { TEAMS } from '../constants';

interface TicketReservationProps {
  onCancel: () => void;
}

const TEAM_INFO: Record<string, { krName: string; stadium: string }> = {
  'KIA TIGERS': { krName: 'KIA 타이거즈', stadium: '광주-기아 챔피언스 필드' },
  'SAMSUNG LIONS': { krName: '삼성 라이온즈', stadium: '대구 삼성 라이온즈 파크' },
  'LG TWINS': { krName: 'LG 트윈스', stadium: '잠실야구장' },
  'DOOSAN BEARS': { krName: '두산 베어스', stadium: '잠실야구장' },
  'KT WIZ': { krName: 'KT 위즈', stadium: '수원 KT 위즈 파크' },
  'SSG LANDERS': { krName: 'SSG 랜더스', stadium: '인천 SSG 랜더스필드' },
  'HANWHA EAGLES': { krName: '한화 이글스', stadium: '대전 한화생명 볼파크' },
  'LOTTE GIANTS': { krName: '롯데 자이언츠', stadium: '사직야구장' },
  'NC DINOS': { krName: 'NC 다이노스', stadium: '창원 NC 파크' },
  'KIWOOM HEROES': { krName: '키움 히어로즈', stadium: '고척 스카이돔' },
};

const getVendorInfo = (url: string | undefined) => {
  if (!url) return { name: '구단 예매처', color: 'bg-slate-600' };
  if (url.includes('ticketlink')) return { name: '티켓링크', color: 'bg-red-500' };
  if (url.includes('interpark')) return { name: '인터파크', color: 'bg-purple-500' };
  return { name: '구단 홈페이지', color: 'bg-brand-accent' };
};

const TicketReservation: React.FC<TicketReservationProps> = ({ onCancel }) => {
  return (
    <div className="relative z-10 w-full animate-fade-in-up">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Header Section - Font Sizes Increased */}
        <div className="flex justify-between items-end mb-16 relative">
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
            className="hidden md:flex items-center gap-3 text-slate-400 hover:text-white transition-colors group px-6 py-4 rounded-2xl hover:bg-white/5"
          >
            <span className="text-base font-bold uppercase tracking-widest group-hover:mr-2 transition-all">Back to Home</span>
            <div className="w-12 h-12 rounded-full border-2 border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/30">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </button>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {TEAMS.map((team) => {
            const info = TEAM_INFO[team.name] || { krName: team.name, stadium: '경기장 정보 없음' };
            const vendor = getVendorInfo(team.ticketUrl);
            
            return (
              <a 
                key={team.id} 
                href={team.ticketUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative block bg-[#0a0f1e] border border-white/5 rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] flex flex-col h-full"
              >
                {/* Background Glow based on Team Color */}
                <div 
                  className="absolute top-0 right-0 w-64 h-64 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2"
                  style={{ backgroundColor: team.color }}
                ></div>

                <div className="p-8 relative z-10 flex flex-col h-full">
                  {/* Top Bar: Color Line & Icon */}
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-20 h-2 rounded-full" style={{ backgroundColor: team.color }}></div>
                    <div className="text-slate-600 group-hover:text-white transition-colors">
                      <svg className="w-6 h-6 transform -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>

                  {/* Team Info */}
                  <div className="mb-6 flex-1">
                     <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-3 leading-none">
                       {info.krName}
                     </h3>
                     <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-200 transition-colors">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                       <span className="text-base font-medium">{info.stadium}</span>
                     </div>
                  </div>

                  {/* Vendor Badge & Link */}
                  <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between group-hover:border-white/20 transition-colors">
                    <div className={`px-4 py-2 rounded-xl text-sm font-bold text-white shadow-lg ${vendor.color} flex items-center gap-2`}>
                      {/* Vendor Icon */}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                      {vendor.name}
                    </div>
                    
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-white group-hover:text-brand-dark text-slate-500 bg-white/5"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TicketReservation;
