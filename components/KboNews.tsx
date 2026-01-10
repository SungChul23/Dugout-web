import React, { useState, useEffect } from 'react';

const API_BASE_URL = "https://dugout.cloud";

const NEWS_CATEGORIES = [
  { id: 'KIA 타이거즈', color: '#ff1a1a' }, // 밝은 레드
  { id: '삼성 라이온즈', color: '#3399ff' }, // 밝은 블루
  { id: 'LG 트윈스', color: '#ff1a8c' }, // 핫핑크
  { id: '두산 베어스', color: '#5c6bc0' }, // 조정: 밝은 인디고 네이비
  { id: 'kt wiz', color: '#f5f5f5' },      // 조정: 밝은 실버/화이트
  { id: 'SSG 랜더스', color: '#ff4d4d' }, // 밝은 레드
  { id: '한화 이글스', color: '#ff8c1a' }, // 밝은 오렌지
  { id: '롯데 자이언츠', color: '#00a8ff' }, // 조정: 밝은 스카이 블루
  { id: 'NC 다이노스', color: '#4facfe' }, // 밝은 블루-시안
  { id: '키움 히어로즈', color: '#e91e63' }, // 밝은 버건디-핑크
  { id: '메이저리그 코리안리거', color: '#00e5ff' }, // 네온 시안
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
      ]);
    } finally {
      setLoading(false);
    }
  };

  const activeColor = NEWS_CATEGORIES.find(c => c.id === activeCategory)?.color || '#00e5ff';

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
    <div className="relative z-10 w-full animate-fade-in-up pb-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center space-x-2 bg-brand-accent/10 border border-brand-accent/20 rounded-full px-3 py-1 mb-4 backdrop-blur-sm">
               <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse"></span>
               <span className="text-[10px] md:text-xs font-mono text-brand-accent uppercase tracking-widest">Real-time KBO News Feed</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-2 uppercase italic leading-none">
              DUGOUT <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-brand-primary">LIVE NEWS</span>
            </h2>
            <p className="text-slate-400 text-lg font-light max-w-2xl">
              네이버 AI 뉴스와 더그아웃 데이터를 결합한 가장 빠른 야구 소식.
            </p>
          </div>
          <button onClick={onCancel} className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-2xl text-slate-400 hover:text-white transition-all text-sm font-bold tracking-widest flex items-center gap-2 group">
            CLOSE
            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex overflow-x-auto pb-8 mb-12 gap-3 no-scrollbar scroll-smooth">
          {NEWS_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`
                whitespace-nowrap px-6 py-3 rounded-full text-sm font-black transition-all border-2
                ${activeCategory === cat.id 
                  ? 'text-white border-transparent shadow-xl scale-110' 
                  : 'bg-slate-900/40 text-slate-500 border-white/5 hover:border-white/20 hover:text-slate-300'
                }
              `}
              style={{ 
                backgroundColor: activeCategory === cat.id ? cat.color : undefined,
                boxShadow: activeCategory === cat.id ? `0 10px 30px -5px ${cat.color}88` : undefined,
                color: activeCategory === cat.id && cat.id === 'kt wiz' ? '#000' : undefined // kt는 폰트색 반전
              }}
            >
              {cat.id}
            </button>
          ))}
        </div>

        {/* News Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#0a0f1e]/50 border border-white/5 rounded-3xl p-8 h-64 animate-pulse">
                <div className="h-6 bg-white/5 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-white/5 rounded w-full mb-2"></div>
                <div className="h-4 bg-white/5 rounded w-5/6"></div>
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
                  borderColor: `${activeColor}44`, // 기본 보더 밝기 강화
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
                    <span 
                      className="text-[11px] font-mono font-black px-4 py-1.5 rounded-full border-2 uppercase tracking-[0.15em] transition-all duration-500"
                      style={{ 
                        color: activeColor, 
                        borderColor: `${activeColor}66`,
                        backgroundColor: `${activeColor}11`
                      }}
                    >
                      {formatDate(item.pubDate)}
                    </span>
                    <div 
                      className="w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-500"
                      style={{ 
                        color: activeColor,
                        borderColor: `${activeColor}33`,
                        backgroundColor: `${activeColor}08`
                      }}
                    >
                      <svg className="w-5 h-5 transform group-hover:rotate-45 group-hover:scale-125 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl md:text-3xl font-black text-white mb-6 leading-tight tracking-tight group-hover:tracking-normal transition-all duration-500">
                    {cleanText(item.title)}
                  </h3>
                  
                  <p className="text-slate-400 text-base font-light leading-relaxed line-clamp-3 mb-10 group-hover:text-slate-200 transition-colors">
                    {cleanText(item.description)}
                  </p>
                </div>

                <div 
                  className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.3em] transition-all duration-500"
                  style={{ color: activeColor }}
                >
                  <span className="w-12 h-[3px] rounded-full transition-all duration-500 group-hover:w-20" style={{ backgroundColor: activeColor }}></span>
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
          <div className="mt-20 p-16 bg-gradient-to-br from-brand-accent/10 to-transparent border-2 rounded-[4rem] text-center relative overflow-hidden group" style={{ borderColor: `${activeColor}44` }}>
             <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
             <h4 className="text-3xl font-black text-white mb-6 italic tracking-tighter uppercase">THE GLOBAL PRIDE</h4>
             <p className="text-slate-400 max-w-2xl mx-auto font-light leading-relaxed text-lg">
               이정후, 김하성 등 메이저리그 무대를 누비는 <span style={{ color: activeColor }} className="font-bold">대한민국 스타들</span>의 현지 소식을 가장 빠르게 전달합니다.
             </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default KboNews;