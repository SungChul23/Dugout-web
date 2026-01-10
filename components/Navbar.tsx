import React, { useState, useEffect } from 'react';

interface NavbarProps {
  user?: { nickname: string; favoriteTeam?: string } | null;
  onLogoClick?: () => void;
  onSignupClick?: () => void;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  onGuideClick?: () => void;
  onProfileClick?: () => void; // New prop
}

const Navbar: React.FC<NavbarProps> = ({ 
  user, 
  onLogoClick, 
  onSignupClick, 
  onLoginClick, 
  onLogoutClick,
  onGuideClick,
  onProfileClick
}) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled ? 'bg-brand-dark/80 backdrop-blur-md border-white/10 py-4' : 'bg-transparent border-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <div 
          onClick={onLogoClick}
          className="flex items-center space-x-2 cursor-pointer group"
        >
          <div className="w-8 h-8 bg-gradient-to-tr from-brand-primary to-brand-accent rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
            <span className="font-bold text-white text-xs">D</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-white">DUGOUT</span>
        </div>

        {/* Links */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
          <a href="#" className="hover:text-white transition-colors">데이터 분석</a>
          <a href="#" className="hover:text-white transition-colors">AI 승부예측</a>
          <button onClick={onGuideClick} className="hover:text-white transition-colors">가이드</button>
          
          <div className="h-4 w-[1px] bg-slate-700"></div>
          
          {user ? (
            /* Logged In View */
            <div className="flex items-center space-x-6 animate-fade-in-up">
               <div onClick={onProfileClick} className="flex items-center space-x-3 group cursor-pointer hover:bg-white/5 px-3 py-1.5 rounded-xl transition-all">
                  {user.favoriteTeam && (
                    <span className="hidden lg:block text-[10px] font-bold text-brand-accent bg-brand-accent/10 border border-brand-accent/20 px-2 py-0.5 rounded tracking-wide group-hover:bg-brand-accent group-hover:text-brand-dark transition-all">
                      {user.favoriteTeam}
                    </span>
                  )}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-accent to-brand-primary p-[1px]">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center group-hover:bg-transparent transition-colors">
                      <span className="text-white font-bold text-xs">{user.nickname.substring(0, 1).toUpperCase()}</span>
                    </div>
                  </div>
                  <span className="text-white font-semibold group-hover:text-brand-accent transition-colors">{user.nickname}님</span>
               </div>
               <button 
                onClick={onLogoutClick}
                className="text-slate-400 hover:text-white transition-colors text-xs font-medium border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/5"
               >
                 로그아웃
               </button>
            </div>
          ) : (
            /* Logged Out View */
            <div className="flex items-center space-x-8 animate-fade-in-up">
              <button onClick={onLoginClick} className="hover:text-white transition-colors">로그인</button>
              <button 
                onClick={onSignupClick}
                className="bg-gradient-to-r from-brand-accent to-brand-primary hover:from-cyan-400 hover:to-blue-400 text-brand-dark font-bold px-5 py-2 rounded-full transition-all transform hover:scale-105 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                회원가입
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;