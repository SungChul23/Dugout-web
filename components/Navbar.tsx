
import React, { useState, useEffect } from 'react';
import Modal from './Modal';

interface NavbarProps {
  user?: { nickname: string; favoriteTeam?: string; teamSlogan?: string } | null;
  onLogoClick?: () => void;
  onSignupClick?: () => void;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  onProfileClick?: () => void;
  
  // Navigation Handlers
  onNavigate?: (view: string) => void;
}

// 메뉴 구조 및 테마 색상 정의
const NAV_MENU = [
  {
    title: 'Game Data Center',
    themeColor: 'cyan', // text-cyan-400
    items: [
      { label: '경기 일정 & 라인업', view: 'schedule', desc: '전 구단 경기 일정 확인', icon: '📅' },
      { label: 'KBO 기록/순위', view: 'stats', desc: '팀/선수 정밀 분석', icon: '📊' },
      { label: '실시간 뉴스', view: 'news', desc: '구단별 속보 큐레이션', icon: '📰' },
    ]
  },
  {
    title: 'AI Predictive Insight',
    themeColor: 'violet', // text-violet-400
    items: [
      { label: '선수 성적 예측', view: 'prediction', desc: '2026 시즌 시뮬레이션', icon: '🤖' },
      { label: 'FA 시장 분석', view: 'faAnalysis', desc: '선수 가치 및 등급 평가', icon: '💰' },
      { label: '골든글러브 예측', view: 'goldenglove', desc: '수상 확률 실시간 산출', icon: '🏆', disabled: true },
    ]
  },
  {
    title: 'Fan Experience',
    themeColor: 'pink', // text-pink-500
    items: [
      { label: '티켓 예매', view: 'tickets', desc: '구단별 예매처 바로가기', icon: '🎟️' },
      { label: '나의 팀 찾기', view: 'findTeam', desc: 'AI 취향 분석 및 추천', icon: '🔍' },
      { label: '야구 가이드', view: 'guide', desc: '용어 및 규칙 백과', icon: '📖' },
    ]
  }
];

const Navbar: React.FC<NavbarProps> = ({ 
  user, 
  onLogoClick, 
  onSignupClick, 
  onLoginClick, 
  onLogoutClick,
  onProfileClick,
  onNavigate
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

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

  const handleLogoutClick = () => {
    setModalState({
      isOpen: true,
      title: '로그아웃',
      message: '정말 로그아웃 하시겠습니까?',
      type: 'confirm',
      onConfirm: () => {
        onLogoutClick?.();
        closeModal();
      },
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper to get Tailwind classes based on color name
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'cyan': return { text: 'group-hover:text-cyan-400', border: 'border-cyan-400', bg: 'hover:bg-cyan-400/10', glow: 'shadow-cyan-400/20' };
      case 'violet': return { text: 'group-hover:text-violet-400', border: 'border-violet-400', bg: 'hover:bg-violet-400/10', glow: 'shadow-violet-400/20' };
      case 'pink': return { text: 'group-hover:text-pink-500', border: 'border-pink-500', bg: 'hover:bg-pink-500/10', glow: 'shadow-pink-500/20' };
      default: return { text: 'group-hover:text-white', border: 'border-white', bg: 'hover:bg-white/10', glow: 'shadow-white/20' };
    }
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 border-b ${
        scrolled 
          ? 'bg-[#020617]/80 backdrop-blur-xl border-white/5 py-2 shadow-2xl' 
          : 'bg-transparent border-transparent py-6'
      }`}
      onMouseLeave={() => setHoveredCategory(null)}
    >
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex justify-between items-center h-16 md:h-20">
        
        {/* 1. Logo Section */}
        <div 
          onClick={onLogoClick}
          className="flex items-center space-x-3 cursor-pointer group flex-shrink-0 relative z-50"
        >
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-tr from-brand-primary to-brand-accent rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-lg shadow-cyan-500/20">
            <span className="font-black text-white text-lg md:text-xl italic">D</span>
          </div>
          <span className="font-black text-2xl md:text-3xl tracking-tighter text-white italic group-hover:text-brand-accent transition-colors">DUGOUT</span>
        </div>

        {/* 2. Center Navigation (Mega Menu / Dropdown) */}
        <div className="hidden xl:flex items-center justify-center flex-1 mx-10 h-full">
           <div className="flex items-center gap-1 h-full">
             {NAV_MENU.map((category) => {
               const colors = getColorClasses(category.themeColor);
               const isHovered = hoveredCategory === category.title;

               return (
                 <div 
                   key={category.title}
                   className="relative h-full flex items-center group perspective-container"
                   onMouseEnter={() => setHoveredCategory(category.title)}
                 >
                   {/* Menu Trigger Button */}
                   <button
                     className={`
                       px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 border border-transparent
                       ${isHovered 
                         ? 'bg-white/5 text-white border-white/10 shadow-lg' 
                         : 'text-slate-400 hover:text-white'
                       }
                     `}
                   >
                     {/* Category Title */}
                     <span className={`tracking-wide transition-colors ${isHovered ? colors.text.replace('group-hover:', '') : ''}`}>
                       {category.title}
                     </span>
                     
                     {/* Chevron Icon */}
                     <svg 
                       className={`w-3.5 h-3.5 transition-transform duration-300 ${isHovered ? 'rotate-180 text-white' : 'text-slate-600'}`} 
                       fill="none" 
                       stroke="currentColor" 
                       viewBox="0 0 24 24"
                     >
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                     </svg>
                   </button>

                   {/* Dropdown Panel */}
                   {/* Animation: Slide down slightly + Fade In */}
                   <div 
                     className={`
                       absolute top-full left-1/2 -translate-x-1/2 mt-4 w-80 
                       transition-all duration-300 ease-out origin-top
                       ${isHovered 
                         ? 'opacity-100 translate-y-0 visible' 
                         : 'opacity-0 -translate-y-4 invisible pointer-events-none'
                       }
                     `}
                     onMouseLeave={() => setHoveredCategory(null)}
                   >
                     {/* Glassmorphism Card */}
                     <div className={`
                        bg-[#0f172a]/95 backdrop-blur-2xl rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)]
                        border border-white/10 border-t-4 ${colors.border}
                     `}>
                        {/* Decorative Gradient Background inside */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

                        <div className="relative p-2 flex flex-col gap-1">
                          {category.items.map((item, idx) => (
                            <button
                              key={item.view}
                              onClick={() => {
                                if (!item.disabled) {
                                  onNavigate?.(item.view);
                                  setHoveredCategory(null);
                                }
                              }}
                              className={`
                                relative text-left px-4 py-3.5 rounded-xl transition-all duration-200 group/item flex items-start gap-4
                                ${item.disabled 
                                  ? 'opacity-40 cursor-not-allowed' 
                                  : `hover:bg-white/5 cursor-pointer`
                                }
                              `}
                            >
                              {/* Hover Indicator Bar */}
                              <div className={`
                                absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 rounded-r-full transition-all duration-300
                                group-hover/item:h-2/3 ${item.disabled ? '' : `bg-${category.themeColor === 'pink' ? 'pink-500' : category.themeColor === 'violet' ? 'violet-400' : 'cyan-400'}`}
                              `}></div>

                              {/* Icon Box */}
                              <div className={`
                                w-10 h-10 rounded-lg flex items-center justify-center text-lg bg-[#020617] border border-white/5 shadow-inner
                                group-hover/item:scale-110 transition-transform duration-300
                              `}>
                                {item.icon}
                              </div>

                              <div className="flex-1">
                                <div className="flex justify-between items-center w-full">
                                  <span className={`text-sm font-bold transition-colors ${item.disabled ? 'text-slate-500' : 'text-slate-200 group-hover/item:text-white'}`}>
                                    {item.label}
                                  </span>
                                  {item.disabled && (
                                    <span className="text-[9px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-slate-500 font-mono">SOON</span>
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-500 mt-0.5 font-medium block leading-snug group-hover/item:text-slate-400">
                                  {item.desc}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                     </div>
                   </div>
                 </div>
               );
             })}
           </div>
        </div>

        {/* 3. Right Actions (User Profile) */}
        <div className="flex items-center justify-end flex-shrink-0 relative z-50">
          {user ? (
            /* Logged In View */
            <div className="flex items-center gap-6 animate-fade-in-up pl-6 border-l border-white/10 h-12">
               <div 
                 onClick={onProfileClick} 
                 className="flex items-center gap-4 group cursor-pointer"
               >
                  <div className="text-right hidden md:block">
                    <span className="block text-white text-lg font-black group-hover:text-brand-accent transition-colors leading-none mb-1.5">
                      {user.nickname}
                    </span>
                    <div className="flex flex-col items-end">
                      {user.favoriteTeam && (
                        <span className="text-[10px] text-brand-dark font-black uppercase tracking-wider bg-brand-accent px-1.5 py-0.5 rounded leading-none mb-1">
                          {user.favoriteTeam}
                        </span>
                      )}
                      {user.teamSlogan && (
                        <span className="text-xs text-slate-400 font-serif italic tracking-wide font-medium whitespace-nowrap">
                          "{user.teamSlogan}"
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Avatar */}
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-brand-accent via-brand-primary to-brand-glow p-[3px] shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all relative overflow-hidden">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center group-hover:bg-slate-800 transition-colors relative overflow-hidden">
                      <span className="text-white font-black text-xl md:text-2xl relative z-10">
                        {user.nickname.substring(0, 1).toUpperCase()}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                  </div>
               </div>
               
               <button 
                onClick={handleLogoutClick}
                className="text-slate-500 hover:text-red-400 transition-colors p-3 hover:bg-red-500/10 rounded-full"
                title="로그아웃"
               >
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
               </button>
            </div>
          ) : (
            /* Logged Out View */
            <div className="flex items-center space-x-3 animate-fade-in-up">
              <button 
                onClick={onLoginClick} 
                className="hidden md:block text-slate-300 hover:text-white font-bold text-base px-5 py-3 transition-colors"
              >
                로그인
              </button>
              <button 
                onClick={onSignupClick}
                className="bg-white text-brand-dark hover:bg-brand-accent hover:text-white font-black px-6 py-3 rounded-full transition-all transform hover:scale-105 shadow-lg text-sm md:text-base flex items-center gap-2"
              >
                <span>회원가입</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>
          )}
          
          {/* Mobile Menu Icon (Expanded touch target) */}
          <button className="xl:hidden p-3 ml-2 text-slate-300 hover:text-white">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onConfirm={modalState.onConfirm}
        confirmText="로그아웃"
        cancelText="취소"
      />
    </nav>
  );
};

export default Navbar;
