
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
  onNoticeClick?: () => void;
}

// 메뉴 구조 및 테마 색상 정의
const NAV_MENU = [
  {
    title: 'Game Data Center',
    themeColor: 'cyan', // text-cyan-400
    items: [
      { label: '경기 일정 & 라인업', view: 'schedule', desc: '전 구단 경기 일정 확인', icon: '📅', disabled: false },
      { label: 'KBO 기록/순위', view: 'stats', desc: '팀/선수 정밀 분석', icon: '📊', disabled: false },
      { label: '실시간 뉴스', view: 'news', desc: '구단별 속보 큐레이션', icon: '📰', disabled: false },
    ]
  },
  {
    title: 'AI Predictive Insight',
    themeColor: 'violet', // text-violet-400
    items: [
      { label: '선수 성적 예측', view: 'prediction', desc: '2026 시즌 시뮬레이션', icon: '🤖', disabled: false },
      { label: 'FA 시장 분석', view: 'faAnalysis', desc: '선수 가치 및 등급 평가', icon: '💰', disabled: false },
      { label: '골든글러브 예측', view: 'goldenglove', desc: '수상 확률 실시간 산출', icon: '🏆', disabled: false },
    ]
  },
  {
    title: 'Fan Experience',
    themeColor: 'pink', // text-pink-500
    items: [
      { label: '티켓 예매', view: 'tickets', desc: '구단별 예매처 바로가기', icon: '🎟️', disabled: false },
      { label: '나의 팀 찾기', view: 'findTeam', desc: 'AI 취향 분석 및 추천', icon: '🔍', disabled: false },
      { label: '야구 가이드', view: 'guide', desc: '용어 및 규칙 백과', icon: '📖', disabled: false },
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
  onNavigate,
  onNoticeClick
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        setIsMobileMenuOpen(false);
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

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.overflowX = 'hidden';
    }
  }, [isMobileMenuOpen]);

  // Helper to get Tailwind classes based on color name
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'cyan': return { text: 'group-hover:text-cyan-400', border: 'border-cyan-400', bg: 'hover:bg-cyan-400/10', glow: 'shadow-cyan-400/20', accent: 'bg-cyan-400' };
      case 'violet': return { text: 'group-hover:text-violet-400', border: 'border-violet-400', bg: 'hover:bg-violet-400/10', glow: 'shadow-violet-400/20', accent: 'bg-violet-400' };
      case 'pink': return { text: 'group-hover:text-pink-500', border: 'border-pink-500', bg: 'hover:bg-pink-500/10', glow: 'shadow-pink-500/20', accent: 'bg-pink-500' };
      default: return { text: 'group-hover:text-white', border: 'border-white', bg: 'hover:bg-white/10', glow: 'shadow-white/20', accent: 'bg-white' };
    }
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 transition-all duration-500 border-b ${
        isMobileMenuOpen ? 'z-[200] h-screen bg-[#020617] overflow-hidden' : 'z-[100]'
      } ${
        scrolled && !isMobileMenuOpen
          ? 'bg-[#020617]/95 backdrop-blur-xl border-white/5 py-2 shadow-2xl' 
          : !isMobileMenuOpen ? 'bg-transparent border-transparent py-6' : 'border-white/5 py-2'
      }`}
      onMouseLeave={() => setHoveredCategory(null)}
    >
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex justify-between items-center h-16 md:h-20">
        
        {/* 1. Logo Section */}
        <div 
          onClick={() => {
            onLogoClick?.();
            setIsMobileMenuOpen(false);
          }}
          className="flex items-center space-x-3 cursor-pointer group flex-shrink-0 relative z-[110]"
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
                     <div className={`
                        bg-[#0f172a]/95 backdrop-blur-2xl rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)]
                        border border-white/10 border-t-4 ${colors.border}
                     `}>
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
                              <div className={`
                                absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 rounded-r-full transition-all duration-300
                                group-hover/item:h-2/3 ${item.disabled ? '' : colors.accent}
                              `}></div>

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
        <div className="flex items-center justify-end flex-shrink-0 relative z-[110] gap-2 md:gap-4">
           {/* Notice Bell Icon */}
           <button 
             onClick={() => {
               onNoticeClick?.();
               setIsMobileMenuOpen(false);
             }}
             className="relative p-2 text-slate-400 hover:text-white transition-colors group"
             aria-label="공지사항"
           >
             <svg className="w-6 h-6 group-hover:animate-swing origin-top" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
             </svg>
             <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
           </button>

          {user ? (
            <div className="flex items-center gap-2 md:gap-6 animate-fade-in-up md:pl-6 md:border-l md:border-white/10 h-12">
               <div 
                 onClick={() => {
                   onProfileClick?.();
                   setIsMobileMenuOpen(false);
                 }} 
                 className="flex items-center gap-3 md:gap-4 group cursor-pointer"
               >
                  <div className="text-right hidden xl:block">
                    <span className="block text-white text-base md:text-lg font-black group-hover:text-brand-accent transition-colors leading-none mb-1 md:mb-1.5">
                      {user.nickname}
                    </span>
                    <div className="flex flex-col items-end">
                      {user.favoriteTeam && (
                        <span className="text-xs text-brand-dark font-black uppercase tracking-wider bg-brand-accent px-2 py-0.5 rounded leading-none mb-1">
                          {user.favoriteTeam}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-brand-accent via-brand-primary to-brand-glow p-[2px] md:p-[3px] shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all relative overflow-hidden">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center group-hover:bg-slate-800 transition-colors relative overflow-hidden">
                      <span className="text-white font-black text-lg md:text-2xl relative z-10">
                        {user.nickname.substring(0, 1).toUpperCase()}
                      </span>
                    </div>
                  </div>
               </div>
               
               <button 
                onClick={handleLogoutClick}
                className="hidden xl:flex text-slate-500 hover:text-red-400 transition-colors p-2 md:p-3 hover:bg-red-500/10 rounded-full"
                title="로그아웃"
               >
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
               </button>
            </div>
          ) : (
            <div className="hidden xl:flex items-center space-x-2 md:space-x-3 animate-fade-in-up">
              <button 
                onClick={onLoginClick} 
                className="text-slate-300 hover:text-white font-bold text-sm md:text-base px-3 md:px-5 py-2 md:py-3 transition-colors"
              >
                로그인
              </button>
              <button 
                onClick={onSignupClick}
                className="bg-white text-brand-dark hover:bg-brand-accent hover:text-white font-black px-4 md:px-6 py-2 md:py-3 rounded-full transition-all transform hover:scale-105 shadow-lg text-xs md:text-base flex items-center gap-2"
              >
                <span>회원가입</span>
                <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>
          )}
          
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden p-2 ml-1 text-slate-300 hover:text-white transition-colors relative z-[110]"
          >
             {isMobileMenuOpen ? (
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             ) : (
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
             )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`
        absolute inset-0 bg-[#020617] transition-all duration-500 xl:hidden
        ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}
      `}>
        <div className="h-full w-full overflow-y-auto pt-24 pb-12 px-6 flex flex-col justify-center gap-10">
          {/* Mobile Auth Actions - High Visibility */}
          {!user ? (
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => { onLoginClick?.(); setIsMobileMenuOpen(false); }}
                className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                로그인
              </button>
              <button 
                onClick={() => { onSignupClick?.(); setIsMobileMenuOpen(false); }}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-brand-primary to-brand-accent text-white font-black text-xl shadow-xl shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                회원가입
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 p-6 rounded-3xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-accent to-brand-primary flex items-center justify-center text-white font-black text-2xl shadow-lg">
                  {user.nickname.charAt(0)}
                </div>
                <div>
                  <p className="text-white text-xl font-black">{user.nickname}</p>
                  <p className="text-sm text-brand-accent font-medium">{user.favoriteTeam || '응원팀을 설정해보세요'}</p>
                </div>
              </div>
              <div className="h-[1px] bg-white/5 w-full my-2"></div>
              <div className="flex gap-3">
                <button 
                  onClick={() => { onProfileClick?.(); setIsMobileMenuOpen(false); }}
                  className="flex-1 py-3 rounded-xl bg-white/5 text-white font-bold text-sm border border-white/10"
                >
                  마이페이지
                </button>
                <button 
                  onClick={handleLogoutClick}
                  className="flex-1 py-3 rounded-xl bg-red-500/10 text-red-400 font-bold text-sm border border-red-500/20"
                >
                  로그아웃
                </button>
              </div>
            </div>
          )}
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
