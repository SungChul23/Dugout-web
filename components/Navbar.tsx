
import React, { useState, useEffect } from 'react';

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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 사용자 요청에 맞춘 직관적인 메뉴명
  const menuItems = [
    { label: '경기 일정', view: 'schedule' },
    { label: '기록/순위', view: 'stats' },
    { label: '뉴스', view: 'news' },
    { label: '티켓 예매', view: 'tickets' },
    { label: '팀 찾기', view: 'findTeam' },
    { label: '가이드', view: 'guide' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled ? 'bg-brand-dark/95 backdrop-blur-xl border-white/10 py-3 shadow-2xl' : 'bg-transparent border-transparent py-5'
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-6 md:px-8 flex justify-between items-center">
        {/* Logo */}
        <div 
          onClick={onLogoClick}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-9 h-9 bg-gradient-to-tr from-brand-primary to-brand-accent rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 shadow-lg shadow-cyan-500/20">
            <span className="font-black text-white text-base italic">D</span>
          </div>
          <span className="font-black text-xl md:text-2xl tracking-tighter text-white italic">DUGOUT</span>
        </div>

        {/* Center Navigation (Desktop) - 접근성을 위해 간격 및 폰트 조정 */}
        <div className="hidden xl:flex items-center gap-1 bg-white/5 backdrop-blur-md rounded-full px-2 py-1.5 border border-white/5">
           {menuItems.map((item) => (
             <button
               key={item.view}
               onClick={() => onNavigate?.(item.view)}
               className="px-5 py-2.5 rounded-full text-sm font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap"
             >
               {item.label}
             </button>
           ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-4">
          {user ? (
            /* Logged In View - Size Increased */
            <div className="flex items-center space-x-4 animate-fade-in-up">
               <div 
                 onClick={onProfileClick} 
                 className="hidden md:flex items-center space-x-4 group cursor-pointer hover:bg-white/5 px-4 py-2 rounded-full border border-transparent hover:border-white/10 transition-all"
               >
                  <div className="text-right mr-1">
                    <span className="block text-white text-sm font-black group-hover:text-brand-accent transition-colors">{user.nickname}</span>
                    <div className="flex flex-col items-end leading-tight">
                      {user.favoriteTeam && (
                        <span className="text-xs text-slate-400 font-bold mt-0.5">{user.favoriteTeam}</span>
                      )}
                      {user.teamSlogan && (
                        <span className="text-[10px] text-brand-accent/90 font-serif italic tracking-wide mt-0.5">{user.teamSlogan}</span>
                      )}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-accent to-brand-primary p-[2px] shadow-lg">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center group-hover:bg-transparent transition-colors">
                      <span className="text-white font-black text-sm">{user.nickname.substring(0, 1).toUpperCase()}</span>
                    </div>
                  </div>
               </div>
               
               <button 
                onClick={onLogoutClick}
                className="text-slate-400 hover:text-red-400 transition-colors p-2 bg-white/5 hover:bg-white/10 rounded-full"
                title="로그아웃"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
               </button>
            </div>
          ) : (
            /* Logged Out View */
            <div className="flex items-center space-x-2 animate-fade-in-up">
              <button 
                onClick={onLoginClick} 
                className="hidden md:block text-slate-300 hover:text-white font-bold text-sm px-4 py-2"
              >
                로그인
              </button>
              <button 
                onClick={onSignupClick}
                className="bg-white text-brand-dark hover:bg-brand-accent hover:text-white font-black px-5 py-2.5 rounded-full transition-all transform hover:scale-105 shadow-lg text-xs md:text-sm"
              >
                회원가입
              </button>
            </div>
          )}
          
          {/* Mobile Menu Icon (Visual Only for now) */}
          <button className="xl:hidden p-2 text-slate-300">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
