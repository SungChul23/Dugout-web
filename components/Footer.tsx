import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-950 border-t border-white/5 py-16 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-slate-500">
        
        {/* Logo & Name */}
        <div className="flex items-center space-x-3 mb-8 md:mb-0">
          <div className="w-6 h-6 bg-gradient-to-tr from-brand-primary to-brand-accent rounded flex items-center justify-center">
            <span className="font-bold text-white text-[10px]">D</span>
          </div>
          <span className="font-bold tracking-tighter text-slate-200 text-lg uppercase">DUGOUT ANALYTICS</span>
        </div>
        
        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8 md:mb-0 text-sm">
          <a href="#" className="hover:text-white transition-colors">데이터 분석</a>
          <a href="#" className="hover:text-white transition-colors">AI 승부예측</a>
          <a href="#" className="hover:text-white transition-colors">구단 가이드</a>
          <a href="#" className="hover:text-white transition-colors">공지사항</a>
        </div>

        {/* Social / Legal */}
        <div className="flex flex-col items-center md:items-end space-y-3">
          <div className="flex space-x-6 text-xs font-medium">
            <a href="#" className="hover:text-white transition-colors">이용약관</a>
            <a href="#" className="hover:text-white transition-colors">개인정보처리방침</a>
          </div>
          <p className="text-[10px] text-slate-600 uppercase tracking-widest">
            &copy; 2026 DUGOUT CORP. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;