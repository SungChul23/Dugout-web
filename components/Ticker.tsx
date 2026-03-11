import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LIVE_MESSAGES = [
  { id: 1, text: "2026 시즌 AI 우승 확률 실시간 분석 중...", type: "PREDICTION", highlight: true },
  { id: 2, text: "FA 시장 투수 부문 영입 경쟁 심화 예상", type: "MARKET" },
  { id: 3, text: "주요 구단 스프링캠프 훈련 데이터 수집 중", type: "DATA" },
  { id: 4, text: "신인 드래프트 유망주 TOP 10 리포트 업데이트", type: "SCOUTING" },
];

const Ticker: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % LIVE_MESSAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-slate-900/80 border-y border-white/10 py-3 relative z-30 backdrop-blur-sm flex justify-center items-center h-14 overflow-hidden">
      <div className="flex items-center gap-4 px-4 max-w-4xl w-full">
        {/* Live Indicator */}
        <div className="flex items-center gap-2 flex-shrink-0 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
          </span>
          <span className="text-xs font-black text-red-500 tracking-wider">LIVE TREND</span>
        </div>

        {/* Vertical Carousel */}
        <div className="flex-1 relative h-6 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute inset-0 flex items-center"
            >
              <span className={`font-mono text-xs md:text-sm mr-3 font-bold px-1.5 py-0.5 rounded ${
                LIVE_MESSAGES[currentIndex].type === 'PREDICTION' ? 'bg-violet-500/20 text-violet-400' :
                LIVE_MESSAGES[currentIndex].type === 'MARKET' ? 'bg-amber-500/20 text-amber-400' :
                LIVE_MESSAGES[currentIndex].type === 'DATA' ? 'bg-cyan-500/20 text-cyan-400' :
                'bg-slate-700 text-slate-300'
              }`}>
                {LIVE_MESSAGES[currentIndex].type}
              </span>
              <span className={`font-medium text-sm md:text-base truncate ${LIVE_MESSAGES[currentIndex].highlight ? 'text-white' : 'text-slate-300'}`}>
                {LIVE_MESSAGES[currentIndex].text}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Ticker;