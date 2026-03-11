import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const API_BASE_URL = "https://dugout.cloud";

interface NoticeModalProps {
  onClose: () => void;
}

interface NoticeDto {
  id: number;
  type: 'FEATURE' | 'IMPROVEMENT' | 'EVENT';
  version: string;
  title: string;
  content: string;
  updateDate: string;
}

const NoticeModal: React.FC<NoticeModalProps> = ({ onClose }) => {
  const [notices, setNotices] = useState<NoticeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/notices`);
        if (!response.ok) {
          throw new Error('공지사항을 불러오는데 실패했습니다.');
        }
        const data = await response.json();
        setNotices(data);
      } catch (err) {
        console.error('Failed to fetch notices:', err);
        setError('서버에서 공지사항을 불러올 수 없습니다.');
        // Fallback mock data for preview purposes if the server is not available
        setNotices([
          {
            id: 1,
            type: 'FEATURE',
            version: 'v1.2.0',
            title: '나의 팀 찾기 & FA 분석 업데이트',
            content: 'AI 기반 "나의 팀 찾기" 기능이 대폭 개선되었습니다. 이제 TOP 3 추천 팀과 상세 분석 리포트를 제공합니다.\nFA 시장 분석 기능이 추가되었습니다. 선수의 가치를 예측하고 등급을 확인해보세요.\n모바일 UI/UX가 개선되어 더 쾌적한 환경을 제공합니다.',
            updateDate: '2026.03.06'
          },
          {
            id: 2,
            type: 'IMPROVEMENT',
            version: 'v1.1.5',
            title: '데이터 센터 안정화',
            content: '실시간 경기 데이터 연동 속도가 30% 향상되었습니다.\n선수 기록 페이지의 로딩 속도가 개선되었습니다.\n일부 구형 기기에서의 렌더링 이슈를 해결했습니다.',
            updateDate: '2026.02.28'
          },
          {
            id: 3,
            type: 'EVENT',
            version: 'v1.1.0',
            title: '2026 시즌 데이터 반영',
            content: '2026 KBO 정규시즌 일정이 업데이트되었습니다.\n새로운 시즌을 맞이하여 메인 테마가 리뉴얼되었습니다.',
            updateDate: '2026.02.15'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0f172a] border border-white/10 rounded-[2rem] w-full max-w-2xl max-h-[85vh] shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden relative"
      >
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-brand-dark to-[#0f172a] relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:20px_20px]"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-xs font-bold text-red-400 uppercase tracking-widest">System Update</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              더그아웃 <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-brand-primary">패치노트</span>
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="relative z-10 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            notices.map((note, index) => (
              <motion.div 
                key={note.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                className="relative pl-8 border-l-2 border-white/10 last:border-0 pb-8 last:pb-0"
              >
                {/* Timeline Dot */}
                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-[#0f172a] ${
                  index === 0 ? 'bg-brand-accent shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-slate-600'
                }`}></div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider w-fit ${
                    note.type === 'FEATURE' ? 'bg-blue-500/20 text-blue-400' :
                    note.type === 'IMPROVEMENT' ? 'bg-green-500/20 text-green-400' :
                    note.type === 'EVENT' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {note.type}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-slate-400 font-mono">
                    <span className="text-white font-bold">{note.version}</span>
                    <span>•</span>
                    <span>{note.updateDate}</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-3">{note.title}</h3>
                
                <ul className="space-y-2">
                  {note.content.split('\n').map((item, i) => (
                    item.trim() && (
                      <li key={i} className="text-slate-300 text-sm leading-relaxed flex items-start gap-2">
                        <span className="text-slate-500 mt-1.5 w-1 h-1 rounded-full bg-slate-500 flex-shrink-0"></span>
                        {item.trim()}
                      </li>
                    )
                  ))}
                </ul>
              </motion.div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-[#0a0f1e] flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl font-bold text-sm transition-colors border border-white/5"
          >
            닫기
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NoticeModal;
