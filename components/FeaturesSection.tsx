
import React from 'react';
import { FEATURES } from '../constants';

const categoryConfig: Record<string, { color: string, border: string, bg: string, glow: string, accent: string }> = {
  'Game Data Center': {
    color: 'text-cyan-400',
    border: 'border-cyan-400',
    accent: 'bg-cyan-400',
    bg: 'group-hover:bg-cyan-950/20',
    glow: 'group-hover:shadow-[0_0_30px_-5px_rgba(34,211,238,0.2)]',
  },
  'AI Predictive Insight': {
    color: 'text-violet-400',
    border: 'border-violet-400',
    accent: 'bg-violet-400',
    bg: 'group-hover:bg-violet-950/20',
    glow: 'group-hover:shadow-[0_0_30px_-5px_rgba(167,139,250,0.2)]',
  },
  'Fan Experience': {
    color: 'text-pink-500',
    border: 'border-pink-500',
    accent: 'bg-gradient-to-r from-pink-500 to-purple-500',
    bg: 'group-hover:bg-pink-950/20',
    glow: 'group-hover:shadow-[0_0_30px_-5px_rgba(236,72,153,0.3)]',
  },
};

interface FeaturesSectionProps {
  onFeatureClick?: (id: string) => void;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ onFeatureClick }) => {
  const categories = Array.from(new Set(FEATURES.map(f => f.category)));

  return (
    <section className="relative z-10 py-24 px-6 md:px-8 w-full max-w-[1440px] mx-auto">
      <div className="text-center mb-20">
        <h2 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500 mb-6 tracking-tight">
          Pro-Level Features
        </h2>
        <p className="text-slate-400 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
          팬을 넘어 전문가의 시선으로 야구를 즐기세요.<br/>
          <span className="text-white font-bold">DUGOUT</span>만의 독보적인 데이터 솔루션.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 lg:gap-12">
        {categories.map((category) => {
          const config = categoryConfig[category] || categoryConfig['Game Data Center'];
          
          return (
            <div key={category} className="space-y-8">
              {/* Category Header */}
              <div className="flex items-center space-x-3 border-b border-white/10 pb-4 pl-2">
                <div className={`w-1 h-6 ${config.accent} rounded-full shadow-[0_0_15px_currentColor]`}></div>
                <h3 className={`text-xl md:text-2xl font-black tracking-tight ${config.color}`}>
                  {category}
                </h3>
              </div>
              
              {/* Cards Grid */}
              <div className="space-y-5">
                {FEATURES.filter(f => f.category === category).map((feature) => (
                  <div 
                    key={feature.id}
                    onClick={() => onFeatureClick?.(feature.id)}
                    className={`
                      group relative overflow-hidden
                      bg-[#0a0f1e] border border-white/5 
                      p-8 rounded-[1.5rem] transition-all duration-300 cursor-pointer
                      flex flex-col justify-center min-h-[220px]
                      ${config.glow} hover:-translate-y-1 hover:border-white/20 shadow-lg
                    `}
                  >
                    {/* Hover Background Accent */}
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${config.bg} pointer-events-none`}></div>
                    
                    {/* Left Color Bar */}
                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 rounded-r-full transition-all duration-300 ${config.accent} opacity-0 group-hover:opacity-100 group-hover:h-2/3`}></div>

                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-xl md:text-2xl font-bold text-slate-200 group-hover:text-white transition-colors duration-300">
                          {feature.title}
                        </h4>
                        <div className={`opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300 ${config.color}`}>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </div>
                      </div>
                      <p className="text-base text-slate-500 leading-relaxed font-light group-hover:text-slate-300 transition-colors">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturesSection;
