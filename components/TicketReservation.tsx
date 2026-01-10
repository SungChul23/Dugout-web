import React from 'react';
import { TEAMS } from '../constants';

interface TicketReservationProps {
  onCancel: () => void;
}

const TicketReservation: React.FC<TicketReservationProps> = ({ onCancel }) => {
  return (
    <div className="relative z-10 w-full animate-fade-in-up">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Header Section */}
        <div className="flex justify-between items-end mb-12 relative">
          <div>
            <div className="inline-flex items-center space-x-2 bg-pink-500/10 border border-pink-500/20 rounded-full px-3 py-1 mb-4 backdrop-blur-sm">
               <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
               <span className="text-[10px] md:text-xs font-mono text-pink-300">2026 Season Ticket Center</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
              KBO Ticket <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Reservation</span>
            </h2>
            <p className="text-slate-400 text-lg font-light">
              10개 구단의 티켓 예매처로 바로 연결해 드립니다.
            </p>
          </div>
          
          {/* Close Button */}
          <button 
            onClick={onCancel}
            className="hidden md:flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
          >
            <span className="text-sm font-bold uppercase tracking-widest group-hover:mr-2 transition-all">Back to Home</span>
            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white/10">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </button>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEAMS.map((team) => (
            <a 
              key={team.id} 
              href={team.ticketUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative block bg-[#0a0f1e] border border-white/5 rounded-2xl overflow-hidden hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]"
            >
              {/* Background Glow based on Team Color */}
              <div 
                className="absolute top-0 right-0 w-64 h-64 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2"
                style={{ backgroundColor: team.color }}
              ></div>

              <div className="p-6 relative z-10 h-full flex flex-col">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-12 h-1 rounded-full" style={{ backgroundColor: team.color }}></div>
                  <div className="text-slate-600 group-hover:text-white transition-colors">
                    <svg className="w-5 h-5 transform -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>

                <div className="mb-8 flex-1">
                   <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-1">
                     {team.name}
                   </h3>
                   <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest border border-white/10 px-2 py-1 rounded">
                     {team.ticketUrl?.includes('ticketlink') ? '티켓링크' : team.ticketUrl?.includes('interpark') ? '인터파크 티켓' : '구단 예매처'}
                   </span>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-4 group-hover:border-white/20 transition-colors">
                  <span className="text-sm text-slate-400 group-hover:text-white transition-colors">예매 바로가기</span>
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-gradient-to-r from-pink-500 to-purple-500 group-hover:text-white text-slate-500 bg-white/5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TicketReservation;