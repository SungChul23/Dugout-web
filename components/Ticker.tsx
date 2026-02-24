import React from 'react';
import { TICKER_ITEMS } from '../constants';

const Ticker: React.FC = () => {
  return (
    <div className="w-full bg-slate-900/80 border-y border-white/10 overflow-hidden py-3 relative z-30 backdrop-blur-sm">
      <div className="flex animate-marquee whitespace-nowrap">
        {/* Render items twice to ensure seamless loop */}
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, index) => (
          <div key={`${item.id}-${index}`} className="flex items-center mx-6">
            {item.highlight && (
              <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2"></span>
            )}
            <span className={`text-base md:text-lg font-mono tracking-wide ${item.highlight ? 'text-red-400 font-bold' : 'text-slate-300'}`}>
              {item.type === 'TREND' ? '' : `[${item.type}] `}
              {item.text}
            </span>
            {item.value && (
              <span className="ml-2 px-2 py-0.5 rounded bg-white/10 text-sm text-brand-accent font-bold">
                {item.value}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ticker;