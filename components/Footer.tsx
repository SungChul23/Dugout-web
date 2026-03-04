
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-950 border-t border-white/5 py-12 px-6">
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center text-slate-500">
        
        {/* Logo & Name */}
        <div className="flex items-center space-x-3 mb-6 md:mb-0">
          <div className="w-7 h-7 bg-gradient-to-tr from-brand-primary to-brand-accent rounded-lg flex items-center justify-center shadow-lg shadow-cyan-900/20">
            <span className="font-black text-white text-xs italic">D</span>
          </div>
          <span className="font-black tracking-tighter text-slate-300 text-lg italic uppercase">DUGOUT ANALYTICS</span>
        </div>
        
        {/* Navigation Links (Synced with Navbar) */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-6 md:mb-0 text-sm font-bold">
          {/* Links removed as requested */}
        </div>

        {/* Social / Legal */}
        <div className="flex flex-col items-center md:items-end space-y-2">
          <div className="flex space-x-6 text-xs font-medium">
             {/* Legal links removed as requested */}
          </div>
          <p className="text-[10px] text-slate-700 uppercase tracking-widest font-mono">
            &copy; 2026 DUGOUT CORP.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
