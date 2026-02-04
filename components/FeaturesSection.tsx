
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
    <section className="relative z-10 py-16 md:py-24 px-4 md:px-8 w-full max-w-[1440px] mx-auto">
      <div className="text-center mb-12 md:mb-20">
        <h2 className="text-3xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500 mb-4 md:mb-6 tracking-tight">
          Pro-Level Features
        </h2>
        <p className="text-slate-400 text-sm md:text-xl font-light max-w-2xl mx-auto leading-relaxed px-2">
          팬을 넘어 전문가의 시선으로 야구를 즐기세요.<br/>
          <span className="text-white font-bold">DUGOUT</span>만의 독보적인 데이터 솔루션.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
        {categories.map((category) => {
          const config = categoryConfig[category] || categoryConfig['Game Data Center'];
          
          return (
            <div key={category} className="space-y-6 md:space-y-8">
              {/* Category Header */}
              <div className="flex items-center space-x-3 border-b border-white/10 pb-3 md:pb-4 pl-2">
                <div className={`w-1 h-5 md:h-6 ${config.accent} rounded-full shadow-[0_0_15px_currentColor]`}></div>
                <h3 className={`text-lg md:text-2xl font-black tracking-tight ${config.color}`}>
                  {category}
                </h3>
              </div>
              
              {/* Cards Grid - Reduced Padding, Increased Text Size */}
              <div className="space-y-3 md:space-y-4">
                {FEATURES.filter(f => f.category === category).map((feature) => {
                  const isComingSoon = feature.id === '5'; // 골든글러브/수상 예측 ID

                  return (
                    <div 
                      key={feature.id}
                      onClick={() => !isComingSoon && onFeatureClick?.(feature.id)}
                      className={`
                        group relative overflow-hidden
                        bg-[#0a0f1e] border border-white/5 
                        p-5 md:p-6 rounded-[1.25rem] transition-all duration-300
                        flex flex-col justify-center min-h-[120px] md:min-h-[160px]
                        ${isComingSoon 
                          ? 'cursor-default opacity-80 border-dashed border-white/10' 
                          : `cursor-pointer ${config.glow} hover:-translate-y-1 hover:border-white/20 shadow-lg`
                        }
                      `}
                    >
                      {/* Hover Background Accent (Only if not coming soon) */}
                      {!isComingSoon && (
                        <>
                          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${config.bg} pointer-events-none`}></div>
                          <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 rounded-r-full transition-all duration-300 ${config.accent} opacity-0 group-hover:opacity-100 group-hover:h-2/3`}></div>
                        </>
                      )}

                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-2 md:mb-3">
                          <div className="flex flex-col">
                            <h4 className={`text-xl md:text-3xl font-bold transition-colors duration-300 tracking-tight ${isComingSoon ? 'text-slate-500' : 'text-slate-200 group-hover:text-white'}`}>
                              {feature.title}
                            </h4>
                            {isComingSoon && (
                              <span className="inline-block mt-2 text-[10px] md:text-[11px] font-bold text-orange-400 bg-orange-400/10 px-2 py-1 rounded border border-orange-400/20 tracking-wide w-fit">
                                ⚠️ 2026 KBO 리그 개막 후 제공됩니다.
                              </span>
                            )}
                          </div>
                          
                          {!isComingSoon && (
                            <div className={`opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300 ${config.color}`}>
                              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </div>
                          )}
                        </div>
                        <p className={`text-sm md:text-lg leading-snug font-light transition-colors ${isComingSoon ? 'text-slate-600' : 'text-slate-500 group-hover:text-slate-300'}`}>
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturesSection;
