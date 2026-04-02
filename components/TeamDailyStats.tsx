import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import useSWR from 'swr';
import { api } from '../api';

interface StatPlayer {
  playerId: string;
  playerName: string;
  stats: Record<string, number>;
}

interface TeamDailyStatsResponse {
  teamName: string;
  baseDate: string;
  hitters: StatPlayer[];
  pitchers: StatPlayer[];
}

const fetcher = (url: string) => api.get(url).then(res => res.data);

const HITTER_BASIC = [
  { key: 'h_g', name: '경기수', desc: '출장한 경기 수' },
  { key: 'h_pa', name: '타석', desc: '타석에 들어선 횟수' },
  { key: 'h_ab', name: '타수', desc: '타석수에서 볼넷, 사구, 희생타 등을 제외한 타수' },
  { key: 'h_avg', name: '타율', desc: '안타수 / 타수' },
  { key: 'h_h', name: '안타', desc: '단타, 2루타, 3루타, 홈런의 합계' },
  { key: 'h_2b', name: '2루타', desc: '2루타 개수' },
  { key: 'h_3b', name: '3루타', desc: '3루타 개수' },
  { key: 'h_hr', name: '홈런', desc: '홈런 개수' },
  { key: 'h_rbi', name: '타점', desc: '타자의 타격으로 주자가 득점한 횟수' },
  { key: 'h_r', name: '득점', desc: '홈을 밟아 득점한 횟수' },
  { key: 'h_obp', name: '출루율', desc: '(안타+볼넷+사구) / (타수+볼넷+사구+희생플라이)' },
  { key: 'h_slg', name: '장타율', desc: '총 루타수 / 타수' },
  { key: 'h_ops', name: 'OPS', desc: '출루율 + 장타율' },
  { key: 'h_tb', name: '루타', desc: '단타(1)+2루타(2)+3루타(3)+홈런(4)의 합' },
];

const HITTER_ADVANCED = [
  { key: 'h_isop', name: '순수장타율', desc: '장타율 - 타율' },
  { key: 'h_gpa', name: 'GPA', desc: '(1.8 * 출루율 + 장타율) / 4' },
  { key: 'h_xr', name: '추정득점', desc: '타자가 팀 득점에 기여한 정도' },
  { key: 'h_bb_k', name: '볼넷/삼진', desc: '볼넷 / 삼진 비율' },
  { key: 'h_risp', name: '득점권타율', desc: '주자가 2루나 3루에 있을 때의 타율' },
  { key: 'h_ph_ba', name: '대타타율', desc: '대타로 나섰을 때의 타율' },
  { key: 'h_gw_rbi', name: '결승타', desc: '결승타 개수' },
  { key: 'h_mh', name: '멀티히트', desc: '한 경기 2안타 이상 기록 횟수' },
  { key: 'h_xbh', name: '장타', desc: '2루타 이상 안타의 합' },
  { key: 'h_ao', name: '뜬공', desc: '뜬공 아웃 개수' },
  { key: 'h_go', name: '땅볼', desc: '땅볼 아웃 개수' },
  { key: 'h_sac', name: '희생번트', desc: '희생번트 개수' },
  { key: 'h_sf', name: '희생플라이', desc: '희생플라이 개수' },
];

const PITCHER_BASIC = [
  { key: 'p_g', name: '경기수', desc: '등판한 경기 수' },
  { key: 'p_w', name: '승리', desc: '승리 투수가 된 횟수' },
  { key: 'p_l', name: '패배', desc: '패전 투수가 된 횟수' },
  { key: 'p_sv', name: '세이브', desc: '세이브 횟수' },
  { key: 'p_hld', name: '홀드', desc: '홀드 횟수' },
  { key: 'p_era', name: '평균자책점', desc: '(자책점 * 9) / 이닝' },
  { key: 'p_ip', name: '이닝', desc: '투구 이닝' },
  { key: 'p_h', name: '피안타', desc: '허용한 안타 개수' },
  { key: 'p_hr', name: '피홈런', desc: '허용한 홈런 개수' },
  { key: 'p_bb', name: '볼넷', desc: '허용한 볼넷 개수' },
  { key: 'p_so', name: '탈삼진', desc: '잡아낸 삼진 개수' },
  { key: 'p_r', name: '실점', desc: '허용한 총 실점' },
  { key: 'p_er', name: '자책점', desc: '투수의 책임으로 기록된 실점' },
  { key: 'p_whip', name: 'WHIP', desc: '이닝당 출루허용률 (피안타+볼넷)/이닝' },
];

const PITCHER_ADVANCED = [
  { key: 'p_qs', name: '퀄리티스타트', desc: '선발 6이닝 이상 3자책 이하' },
  { key: 'p_avg', name: '피안타율', desc: '피안타 / 타수' },
  { key: 'p_wpct', name: '승률', desc: '승리 / (승리 + 패배)' },
  { key: 'p_np', name: '투구수', desc: '총 투구수' },
  { key: 'p_go_ao', name: '땅볼/뜬공', desc: '땅볼 아웃 / 뜬공 아웃 비율' },
  { key: 'p_wgs', name: '선발승', desc: '선발 등판 승리' },
  { key: 'p_wgr', name: '구원승', desc: '구원 등판 승리' },
  { key: 'p_gs', name: '선발등판', desc: '선발로 등판한 경기 수' },
  { key: 'p_cg', name: '완투', desc: '완투 경기 수' },
  { key: 'p_sho', name: '완봉', desc: '완봉 경기 수' },
  { key: 'p_gf', name: '종료', desc: '경기를 마무리한 횟수' },
  { key: 'p_svo', name: '세이브기회', desc: '세이브 상황 등판 횟수' },
  { key: 'p_bsv', name: '블론세이브', desc: '세이브 기회에서 동점/역전 허용' },
  { key: 'p_tbf', name: '타자수', desc: '상대한 총 타자 수' },
  { key: 'p_ts', name: '투구스트라이크', desc: '스트라이크 투구수' },
  { key: 'p_gdp', name: '병살타', desc: '유도한 병살타 개수' },
  { key: 'p_2b', name: '피2루타', desc: '허용한 2루타 개수' },
  { key: 'p_3b', name: '피3루타', desc: '허용한 3루타 개수' },
  { key: 'p_hbp', name: '사구', desc: '몸에 맞는 볼 허용' },
  { key: 'p_ibb', name: '고의사구', desc: '고의사구 허용' },
  { key: 'p_wp', name: '폭투', desc: '폭투 개수' },
  { key: 'p_bk', name: '보크', desc: '보크 개수' },
  { key: 'p_ao', name: '뜬공', desc: '뜬공 아웃 유도' },
  { key: 'p_go', name: '땅볼', desc: '땅볼 아웃 유도' },
  { key: 'p_sac', name: '희생번트', desc: '희생번트 허용' },
  { key: 'p_sf', name: '희생플라이', desc: '희생플라이 허용' },
];

export const TeamDailyStats: React.FC = () => {
  const { data, error, isLoading } = useSWR<TeamDailyStatsResponse>('/api/v1/dashboard/team-daily-stats', fetcher, {
    revalidateOnFocus: false,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [hitterSortKey, setHitterSortKey] = useState<string>('h_avg');
  const [hitterSortDesc, setHitterSortDesc] = useState<boolean>(true);
  
  const [pitcherSortKey, setPitcherSortKey] = useState<string>('p_era');
  const [pitcherSortDesc, setPitcherSortDesc] = useState<boolean>(false);

  // Tooltip State
  const [tooltipConfig, setTooltipConfig] = useState<{
    visible: boolean;
    x: number;
    y: number;
    name: string;
    desc: string;
  } | null>(null);

  useEffect(() => {
    const handleScroll = () => setTooltipConfig(null);
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, []);

  const handleMouseEnter = (e: React.MouseEvent, name: string, desc: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipConfig({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      name,
      desc
    });
  };

  const handleMouseLeave = () => {
    setTooltipConfig(null);
  };

  const handleHitterSort = (key: string) => {
    if (hitterSortKey === key) {
      setHitterSortDesc(!hitterSortDesc);
    } else {
      setHitterSortKey(key);
      setHitterSortDesc(true);
    }
  };

  const handlePitcherSort = (key: string) => {
    if (pitcherSortKey === key) {
      setPitcherSortDesc(!pitcherSortDesc);
    } else {
      setPitcherSortKey(key);
      const lowerIsBetter = ['p_era', 'p_whip', 'p_l', 'p_bb', 'p_r', 'p_er', 'p_h', 'p_hr'].includes(key);
      setPitcherSortDesc(!lowerIsBetter);
    }
  };

  const sortedHitters = useMemo(() => {
    if (!data?.hitters) return [];
    return [...data.hitters].sort((a, b) => {
      const valA = a.stats[hitterSortKey] ?? 0;
      const valB = b.stats[hitterSortKey] ?? 0;
      return hitterSortDesc ? valB - valA : valA - valB;
    });
  }, [data?.hitters, hitterSortKey, hitterSortDesc]);

  const sortedPitchers = useMemo(() => {
    if (!data?.pitchers) return [];
    return [...data.pitchers].sort((a, b) => {
      const valA = a.stats[pitcherSortKey] ?? 0;
      const valB = b.stats[pitcherSortKey] ?? 0;
      return pitcherSortDesc ? valB - valA : valA - valB;
    });
  }, [data?.pitchers, pitcherSortKey, pitcherSortDesc]);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center animate-pulse">
        <div className="w-16 h-16 border-4 border-brand-accent border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-lg">팀 전체 기록을 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <p className="text-red-400 text-lg mb-4">데이터를 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  const hitterColumns = showAdvanced ? HITTER_ADVANCED : HITTER_BASIC;
  const pitcherColumns = showAdvanced ? PITCHER_ADVANCED : PITCHER_BASIC;

  const renderHeader = (col: {key: string, name: string, desc: string}, isHitter: boolean) => {
    const isSorted = isHitter ? hitterSortKey === col.key : pitcherSortKey === col.key;
    const isDesc = isHitter ? hitterSortDesc : pitcherSortDesc;
    const displayKey = col.key.replace(/^[hp]_/, '').toUpperCase();
    
    return (
      <th 
        key={col.key}
        onClick={() => isHitter ? handleHitterSort(col.key) : handlePitcherSort(col.key)}
        onMouseEnter={(e) => handleMouseEnter(e, col.name, col.desc)}
        onMouseLeave={handleMouseLeave}
        className="px-5 py-4 text-right text-sm md:text-base font-black text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors whitespace-nowrap"
      >
        <div className="flex items-center justify-end gap-1.5">
          {isSorted && (
            <span className="text-brand-accent text-xs">
              {isDesc ? '▼' : '▲'}
            </span>
          )}
          {displayKey}
        </div>
      </th>
    );
  };

  return (
    <div className="w-full animate-fade-in-up relative">
      {/* Global Tooltip via Portal */}
      {tooltipConfig && tooltipConfig.visible && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed z-[9999] transform -translate-x-1/2 -translate-y-full pointer-events-none"
          style={{ left: tooltipConfig.x, top: tooltipConfig.y }}
        >
          <div className="bg-slate-800 text-white text-sm rounded-xl py-3 px-4 shadow-2xl border border-slate-600 min-w-[150px] max-w-[250px]">
            <div className="font-black text-brand-accent mb-1.5 text-base text-center">{tooltipConfig.name}</div>
            <div className="text-slate-200 whitespace-normal text-left leading-relaxed">{tooltipConfig.desc}</div>
          </div>
          <div className="w-3 h-3 bg-slate-800 border-b border-r border-slate-600 transform rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2"></div>
        </div>,
        document.body
      )}

      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <span className="w-2 h-8 bg-brand-accent rounded-full"></span>
            {data.teamName} 전체 기록
          </h2>
          <p className="text-slate-400 text-base mt-2 ml-4">기준일: {data.baseDate}</p>
        </div>
        
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`px-5 py-3 rounded-xl text-base font-bold transition-all duration-300 flex items-center gap-2 ${
            showAdvanced 
              ? 'bg-brand-accent text-brand-dark shadow-[0_0_20px_rgba(6,182,212,0.6)]' 
              : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
          }`}
        >
          {showAdvanced ? '심화 지표 끄기' : '심화 지표 보기'}
          <svg className={`w-5 h-5 transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
      </div>

      {/* Hitters Table */}
      <div className="mb-16">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="text-3xl">타자</span> (Hitters)
        </h3>
        <div className="w-full overflow-x-auto bg-[#0a0f1e]/80 border border-white/10 rounded-3xl shadow-2xl custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-5 py-4 text-center text-sm md:text-base font-black text-slate-400 uppercase w-20 sticky left-0 bg-[#0f1629] z-20">순위</th>
                <th className="px-5 py-4 text-left text-sm md:text-base font-black text-slate-400 uppercase min-w-[120px] sticky left-20 bg-[#0f1629] z-20 border-r border-white/5 shadow-[5px_0_15px_-3px_rgba(0,0,0,0.5)]">선수명</th>
                {hitterColumns.map(col => renderHeader(col, true))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedHitters.map((player, index) => (
                <tr key={player.playerId} className="hover:bg-white/5 transition-colors group">
                  <td className="px-5 py-4 text-center text-base font-bold text-slate-400 sticky left-0 bg-[#0a0f1e] group-hover:bg-[#131b2f] z-10">{index + 1}</td>
                  <td className="px-5 py-4 text-left text-lg font-black text-white sticky left-20 bg-[#0a0f1e] group-hover:bg-[#131b2f] z-10 border-r border-white/5 shadow-[5px_0_15px_-3px_rgba(0,0,0,0.5)]">{player.playerName}</td>
                  {hitterColumns.map(col => {
                    const val = player.stats[col.key];
                    const isSortedCol = hitterSortKey === col.key;
                    return (
                      <td key={col.key} className={`px-5 py-4 text-right font-mono transition-colors ${isSortedCol ? 'text-brand-accent font-black text-lg bg-white/5 shadow-[inset_0_0_20px_rgba(6,182,212,0.1)]' : 'text-white text-base font-medium'}`} style={isSortedCol ? { textShadow: '0 0 10px rgba(6,182,212,0.8)' } : {}}>
                        {val !== undefined ? (Number.isInteger(val) ? val : val.toFixed(3)) : '-'}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {sortedHitters.length === 0 && (
                <tr>
                  <td colSpan={hitterColumns.length + 2} className="px-5 py-10 text-center text-slate-400 text-lg">데이터가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pitchers Table */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="text-3xl">투수</span> (Pitchers)
        </h3>
        <div className="w-full overflow-x-auto bg-[#0a0f1e]/80 border border-white/10 rounded-3xl shadow-2xl custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-5 py-4 text-center text-sm md:text-base font-black text-slate-400 uppercase w-20 sticky left-0 bg-[#0f1629] z-20">순위</th>
                <th className="px-5 py-4 text-left text-sm md:text-base font-black text-slate-400 uppercase min-w-[120px] sticky left-20 bg-[#0f1629] z-20 border-r border-white/5 shadow-[5px_0_15px_-3px_rgba(0,0,0,0.5)]">선수명</th>
                {pitcherColumns.map(col => renderHeader(col, false))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedPitchers.map((player, index) => (
                <tr key={player.playerId} className="hover:bg-white/5 transition-colors group">
                  <td className="px-5 py-4 text-center text-base font-bold text-slate-400 sticky left-0 bg-[#0a0f1e] group-hover:bg-[#131b2f] z-10">{index + 1}</td>
                  <td className="px-5 py-4 text-left text-lg font-black text-white sticky left-20 bg-[#0a0f1e] group-hover:bg-[#131b2f] z-10 border-r border-white/5 shadow-[5px_0_15px_-3px_rgba(0,0,0,0.5)]">{player.playerName}</td>
                  {pitcherColumns.map(col => {
                    const val = player.stats[col.key];
                    const isSortedCol = pitcherSortKey === col.key;
                    return (
                      <td key={col.key} className={`px-5 py-4 text-right font-mono transition-colors ${isSortedCol ? 'text-brand-accent font-black text-lg bg-white/5 shadow-[inset_0_0_20px_rgba(6,182,212,0.1)]' : 'text-white text-base font-medium'}`} style={isSortedCol ? { textShadow: '0 0 10px rgba(6,182,212,0.8)' } : {}}>
                        {val !== undefined ? (Number.isInteger(val) ? val : val.toFixed(2)) : '-'}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {sortedPitchers.length === 0 && (
                <tr>
                  <td colSpan={pitcherColumns.length + 2} className="px-5 py-10 text-center text-slate-400 text-lg">데이터가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.6);
          border-radius: 5px;
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.3);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 1);
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.6);
        }
      `}</style>
    </div>
  );
};

