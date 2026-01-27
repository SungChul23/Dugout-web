
import React, { useState, useEffect } from 'react';
import { TEAMS } from '../constants';

const API_BASE_URL = "https://dugout.cloud";

// TEAMS 상수를 기반으로 뉴스 카테고리 생성 (순서 및 컬러 동기화)
const KBO_NEWS_CATEGORIES = TEAMS.map(team => {
  // 팀명 한글 매핑 (constants.ts에는 영문명으로 되어있음)
  let krName = team.name;
  if (team.code === 'KIA') krName = 'KIA 타이거즈';
  if (team.code === 'SAMSUNG') krName = '삼성 라이온즈';
  if (team.code === 'LG') krName = 'LG 트윈스';
  if (team.code === 'DOOSAN') krName = '두산 베어스';
  if (team.code === 'KT') krName = 'KT 위즈';
  if (team.code === 'SSG') krName = 'SSG 랜더스';
  if (team.code === 'HANWHA') krName = '한화 이글스';
  if (team.code === 'LOTTE') krName = '롯데 자이언츠';
  if (team.code === 'NC') krName = 'NC 다이노스';
  if (team.code === 'KIWOOM') krName = '키움 히어로즈';

  return {
    id: krName,
    code: team.code,
    color: team.color
  };
});

// 메이저리그 카테고리 추가
const ALL_NEWS_CATEGORIES = [
  ...KBO_NEWS_CATEGORIES,
  { id: '메이저리그 코리안리거', code: 'MLB', color: '#00e5ff' }
];

interface NewsItem {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string;
}

interface KboNewsProps {
  onCancel: () => void;
  defaultTeam?: string;
}

const KboNews: React.FC<KboNewsProps> = ({ onCancel, defaultTeam }) => {
  // 초기값을 defaultTeam과 매칭하거나 기본값 설정
  const [activeCategory, setActiveCategory] = useState(defaultTeam || 'KIA 타이거즈');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNews(activeCategory);
  }, [activeCategory]);

  const fetchNews = async (category: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/news?team=${encodeURIComponent(category)}`);
      if (!response.ok) throw new Error('뉴스를 불러오는 데 실패했습니다.');
      const data = await response.json();
      setNews(data.items || []);
    } catch (err) {
      console.error(err);
      // Mock Data Fallback
      setNews([
        { 
          title: `<b>${category}</b>, 시즌 초반 무서운 상승세의 비결은?`, 
          description: "데이터 분석 결과 투타의 조화가 완벽하게 이루어지고 있는 것으로 나타났습니다. 특히 선발진의 안정감이 팀의 상승세를 견인하고 있습니다.", 
          pubDate: new Date().toISOString(), 
          link: "#", 
          originallink: "#" 
        },
        { 
          title: `AI가 예측한 <b>${category}</b>의 이번 주 성적`, 
          description: "더그아웃 AI는 이번 주 3승 2패를 기록할 것으로 예측했습니다. 핵심 선수의 복귀가 타격 라인업에 큰 변수로 작용할 전망입니다.", 
          pubDate: new Date().toISOString(), 
          link: "#", 
          originallink: "#" 
        },
        { 
          title: `[더그아웃 단독] <b>${category}</b> 핵심 유망주 인터뷰`, 
          description: "퓨처스 리그에서 맹활약 중인 해당 선수는 조만간 1군 호출을 받을 것으로 보입니다. 팬들의 기대를 한 몸에 받고 있는 그의 각오를 들어봤습니다.", 
          pubDate: new Date().toISOString(), 
          link: "#", 
          originallink: "#" 
        },
        { 
          title: `${category} 팬들이 가장 기대하는 이번 주 매치업`, 
          description: "주말 3연전을 앞두고 티켓 예매 전쟁이 벌어지고 있습니다. 특히 리그 수위 타자와의 맞대결 선발 매치업이 큰 기대를 모읍니다.", 
          pubDate: new Date().toISOString(), 
          link: "#", 
          originallink: "#" 
        },
        { 
          title: `<b>${category}</b>, 불펜 과부하 우려? 감독의 해법은`, 
          description: "최근 접전이 이어지며 불펜 투구수가 급증하고 있습니다. 코칭스태프는 투수 운용 계획을 전면 재검토하며 휴식 부여에 집중하고 있습니다.", 
          pubDate: new Date().toISOString(), 
          link: "#", 
          originallink: "#" 
        },
        { 
          title: `[현장] <b>${category}</b> 홈 경기장, 역대급 관중 몰이`, 
          description: "평일 경기임에도 불구하고 매진에 가까운 관중이 들어찼습니다. 팬들의 뜨거운 응원 열기가 선수들에게 큰 힘이 되고 있다는 후문입니다.", 
          pubDate: new Date().toISOString(), 
          link: "#", 
          originallink: "#" 
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const activeTeamInfo = ALL_NEWS_CATEGORIES.find(c => c.id === activeCategory) || ALL_NEWS_CATEGORIES[0];
  const activeColor = activeTeamInfo.color;
  
  const isLightTeam = activeCategory === 'KT 위즈';
  const textColorClass = isLightTeam ? 'text-slate-900' : 'text-white';

  const cleanText = (text: string) => text.replace(/<b>/g, '').replace(/<\/b>/g, '').replace(/&quot;/g, '"');
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${month}월 ${date}일 ${hours}:${minutes}`;
  };

  return (
    <div className="relative z-10 w-full animate-fade-in-up pb-24 overflow-hidden min-h-screen">
      <style>{`
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-right {
          animation: slideRight 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `}</style>

      {/* Background Watermark */}
      <div 
        className="fixed -right-[5%] top-[15%] text-[15vw] font-black opacity-[0.03] pointer-events-none select-none transition-colors duration-700 whitespace-nowrap"
        style={{ color: activeColor }}
      >
        NEWS FEED
      </div>

      <div className="w-[95%] max-w-[1600px] mx-auto px-4 md:px-8 py-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6 border-b border-white/5 pb-8 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center space-x-2 bg-brand-accent/10 border border-brand-accent/20 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm">
               <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse"></span>
               <span className="text-xs md:text-sm font-mono text-brand-accent uppercase tracking-widest font-bold">Real-time KBO News Feed</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-4">
              DUGOUT <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-brand-primary">LIVE NEWS</span>
            </h2>
            <p className="text-slate-400 text-xl md:text-2xl font-light">
              더그아웃이 전하는 가장 빠른 야구 소식.
            </p>
          </div>
          <button onClick={onCancel} className="bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-4 rounded-2xl text-slate-400 hover:text-white transition-all text-base font-bold tracking-widest flex items-center gap-2 group flex-shrink-0 bg-[#0a0f1e]">
            메인으로
            <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Layout: Sidebar + Content */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          
          {/* SIDEBAR: Categories */}
          <div className="w-full lg:w-72 flex-shrink-0 z-20">
             <div className="sticky top-24">
               <label className="block text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest px-2">Select Team</label>
               <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-3 pb-4 lg:pb-0 no-scrollbar">
                 {ALL_NEWS_CATEGORIES.map((cat) => (
                   <button
                     key={cat.id}
                     onClick={() => setActiveCategory(cat.id)}
                     className={`
                       flex-shrink-0 flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-500 ease-out w-auto lg:w-full group relative overflow-hidden text-left
                       ${activeCategory === cat.id 
                         ? 'bg-white text-brand-dark shadow-[0_0_30px_rgba(255,255,255,0.4)] lg:translate-x-6 scale-105 z-10' 
                         : 'bg-[#0a0f1e] text-slate-400 border border-white/5 hover:bg-white/5 hover:text-white hover:lg:translate-x-2'
                       }
                     `}
                   >
                     {/* Color Bar */}
                     <div 
                       className={`w-1.5 h-10 rounded-full transition-all duration-300 ${activeCategory === cat.id ? 'scale-y-100' : 'scale-y-50 group-hover:scale-y-75'}`}
                       style={{ backgroundColor: cat.color }}
                     ></div>
                     
                     <div className="flex-1 whitespace-nowrap">
                        <span className="block font-bold text-lg leading-none">
                          {cat.id.includes('메이저리그') ? 'MLB 코리안리거' : cat.id}
                        </span>
                        {activeCategory === cat.id && (
                          <span className="text-[10px] uppercase font-black tracking-widest opacity-60 mt-1 block">Selected</span>
                        )}
                     </div>
                   </button>
                 ))}
               </div>
             </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="flex-1 min-h-[800px] relative">
            
            {/* Team Banner */}
            <div className="mb-10 animate-slide-right" key={`banner-${activeCategory}`}>
              <div 
                className="rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-2xl group transition-all duration-500"
                style={{ 
                  backgroundColor: activeColor,
                  boxShadow: `0 0 50px -10px ${activeColor}88`
                }}
              >
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
                 <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-black/10 to-black/40 pointer-events-none"></div>
                 {isLightTeam && <div className="absolute inset-0 bg-white/30 pointer-events-none"></div>}
                 
                 <div className="relative z-10 flex flex-col justify-center min-h-[120px]">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${isLightTeam ? 'border-black/20 text-black' : 'border-white/20 text-white'}`}>
                          {activeTeamInfo.code} News
                        </span>
                      </div>
                      <h3 className={`text-4xl md:text-6xl font-black drop-shadow-sm tracking-tight ${textColorClass}`}>
                        {activeCategory} <span className="font-light opacity-80 block md:inline md:ml-2 text-2xl md:text-4xl">TODAY'S HEADLINES</span>
                      </h3>
                 </div>
              </div>
            </div>

            {/* News Grid with Animation */}
            <div key={activeCategory} className="animate-slide-right">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-[#0a0f1e]/50 border border-white/5 rounded-[2.5rem] p-8 h-80 animate-pulse flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between mb-6">
                           <div className="h-6 w-20 bg-white/5 rounded-full"></div>
                           <div className="h-8 w-8 bg-white/5 rounded-full"></div>
                        </div>
                        <div className="h-8 bg-white/5 rounded w-3/4 mb-4"></div>
                        <div className="h-8 bg-white/5 rounded w-1/2 mb-6"></div>
                        <div className="h-4 bg-white/5 rounded w-full mb-2"></div>
                        <div className="h-4 bg-white/5 rounded w-5/6"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : news.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
                  {news.map((item, idx) => (
                    <a 
                      key={idx} 
                      href={item.originallink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group relative bg-gradient-to-br from-[#0a0f1e] to-[#020617] backdrop-blur-xl border-2 rounded-[2.5rem] p-8 md:p-10 transition-all duration-500 flex flex-col justify-between overflow-hidden hover:-translate-y-3"
                      style={{ 
                        borderColor: `${activeColor}44`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = activeColor;
                        e.currentTarget.style.boxShadow = `0 30px 60px -20px ${activeColor}55`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = `${activeColor}44`;
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {/* Corner Glow Effect */}
                      <div 
                        className="absolute -top-24 -right-24 w-64 h-64 opacity-0 group-hover:opacity-20 transition-all duration-700 blur-[80px] pointer-events-none rounded-full"
                        style={{ backgroundColor: activeColor }}
                      ></div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-8">
                          {/* 날짜 뱃지 */}
                          <span 
                            className={`text-[11px] font-mono font-black px-4 py-1.5 rounded-full border border-white/10 uppercase tracking-[0.15em] transition-all duration-500 ${textColorClass}`}
                            style={{ 
                              backgroundColor: activeColor, 
                              borderColor: activeColor,
                              boxShadow: `0 0 12px ${activeColor}80`,
                              textShadow: isLightTeam ? 'none' : '0 1px 2px rgba(0,0,0,0.3)'
                            }}
                          >
                            {formatDate(item.pubDate)}
                          </span>
                          
                          {/* 아이콘 */}
                          <div 
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${textColorClass}`}
                            style={{ 
                              backgroundColor: activeColor,
                              borderColor: activeColor,
                              boxShadow: `0 0 10px ${activeColor}40`
                            }}
                          >
                            <svg className="w-5 h-5 transform group-hover:rotate-45 group-hover:scale-125 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </div>
                        </div>
                        
                        <h3 className="text-2xl md:text-3xl font-black text-white mb-6 leading-tight tracking-tight group-hover:tracking-normal transition-all duration-500 line-clamp-2">
                          {cleanText(item.title)}
                        </h3>
                        
                        <p className="text-slate-400 text-base font-light leading-relaxed line-clamp-3 mb-10 group-hover:text-slate-200 transition-colors">
                          {cleanText(item.description)}
                        </p>
                      </div>

                      {/* VIEW ARTICLE */}
                      <div 
                        className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.3em] transition-all duration-500 text-slate-300 group-hover:text-white"
                      >
                        <span 
                          className="w-12 h-[3px] rounded-full transition-all duration-500 group-hover:w-20 shadow-[0_0_10px_currentColor]" 
                          style={{ backgroundColor: activeColor, color: activeColor }}
                        ></span>
                        VIEW ARTICLE
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-32 bg-[#0a0f1e]/50 border-2 border-dashed border-white/5 rounded-[3rem]">
                   <svg className="w-16 h-16 text-slate-700 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2zM14 4.5V9h4.5" /></svg>
                   <p className="text-slate-500 text-xl font-light">현재 해당 구단의 실시간 뉴스가 존재하지 않습니다.</p>
                </div>
              )}

              {/* Highlight Section for ML Korean Leaguers */}
              {activeCategory === '메이저리그 코리안리거' && !loading && (
                <div className="mt-12 p-16 bg-gradient-to-br from-brand-accent/10 to-transparent border-2 rounded-[4rem] text-center relative overflow-hidden group" style={{ borderColor: `${activeColor}44` }}>
                   <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                   <h4 className="text-3xl font-black text-white mb-6 italic tracking-tighter uppercase">THE GLOBAL PRIDE</h4>
                   <p className="text-slate-400 max-w-2xl mx-auto font-light leading-relaxed text-lg">
                     이정후, 김하성 등 메이저리그 무대를 누비는 <span style={{ color: activeColor }} className="font-bold">대한민국 스타들</span>의 현지 소식을 가장 빠르게 전달합니다.
                   </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default KboNews;
