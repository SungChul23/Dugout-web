
import React, { useState, useEffect } from 'react';
import { TEAMS } from '../constants';

const API_BASE_URL = "https://dugout.cloud";

interface MyDashboardProps {
  user: { nickname: string; favoriteTeam?: string };
  onFindTeamClick: () => void;
  onUpdateTeam: (newTeam: string) => void;
}

// 서버 DTO 구조
interface PlayerInsightDto {
  slotNumber: number;
  playerId: number;
  name: string;
  position: string;
  predictedStat: string; // 예: "0.352 (MVP 유력)"
  confidence: number;   // 신뢰도 (0~100)
  isEmpty: boolean;
}

interface DashboardResponse {
  favoriteTeamName: string;
  insights: PlayerInsightDto[];
}

// Internal Sub-component: Settings Modal
const SettingsModal: React.FC<{currentTeam: string, onClose: () => void, onUpdate: (t: string) => void, color: string}> = ({ currentTeam, onClose, onUpdate, color }) => {
  const [selected, setSelected] = useState(currentTeam);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-8 w-full max-w-md relative z-10 shadow-2xl animate-fade-in-up">
        <h3 className="text-xl font-bold text-white mb-6">선호 구단 변경</h3>
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {TEAMS.map(team => (
            <button
              key={team.id}
              onClick={() => setSelected(team.name)}
              className={`w-full text-left px-5 py-4 rounded-xl border transition-all flex items-center justify-between ${selected === team.name ? 'bg-white/10 border-white/30' : 'bg-transparent border-white/5 hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-3">
                 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color }}></div>
                 <span className={selected === team.name ? 'text-white font-bold' : 'text-slate-400'}>{team.name}</span>
              </div>
              {selected === team.name && <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
            </button>
          ))}
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-colors">취소</button>
          <button 
            onClick={() => { onUpdate(selected); onClose(); }} 
            className="flex-1 py-3 rounded-xl font-bold text-white shadow-lg"
            style={{ backgroundColor: color }}
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
};

const MyDashboard: React.FC<MyDashboardProps> = ({ user, onFindTeamClick, onUpdateTeam }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  
  // 데이터 가져오기
  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/dashboard`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        } else {
          console.error("Failed to fetch dashboard data");
        }
      } catch (error) {
        console.error("API Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user.favoriteTeam]); // 팀 변경 시 재호출

  // 팀 정보 매칭 (서버 데이터 우선, 없으면 로컬 user prop 사용)
  const currentTeamName = dashboardData?.favoriteTeamName || user.favoriteTeam;
  
  // TEAMS 상수에서 매칭되는 팀 정보 찾기 (공백 제거 후 비교 등 유연한 매칭)
  const myTeam = TEAMS.find(t => 
    t.name === currentTeamName || 
    t.name.replace(/\s/g, '') === currentTeamName?.replace(/\s/g, '')
  );

  const teamColor = myTeam?.color || '#06b6d4';
  
  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center animate-pulse">
        <div className="w-16 h-16 border-4 border-brand-accent border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400">AI가 데이터를 분석 중입니다...</p>
      </div>
    );
  }

  // --- CASE 1: 팀이 없는 경우 (Empty State) ---
  if (!currentTeamName || currentTeamName === '없음' || currentTeamName === '') {
    return (
      <div className="relative z-10 w-full animate-fade-in-up min-h-[60vh] flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-slate-800 to-slate-900 rounded-full flex items-center justify-center mb-8 border border-white/10 shadow-2xl relative">
            <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            <div className="absolute top-0 right-0 w-8 h-8 bg-brand-accent rounded-full flex items-center justify-center animate-bounce">
              <span className="text-brand-dark font-bold text-lg">?</span>
            </div>
          </div>
          
          <h2 className="text-4xl font-black text-white mb-4">
            아직 응원하는 팀이 없으신가요?
          </h2>
          <p className="text-slate-400 text-lg mb-10 leading-relaxed">
            더그아웃의 <span className="text-brand-accent font-bold">AI 매칭 시스템</span>이 
            고객님의 성향을 분석하여<br/>가장 잘 어울리는 KBO 구단을 추천해 드립니다.
          </p>
          
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <button 
              onClick={onFindTeamClick}
              className="bg-gradient-to-r from-brand-accent to-brand-primary text-brand-dark font-black px-8 py-4 rounded-xl text-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all transform hover:-translate-y-1"
            >
              나의 팀 찾기 (AI 매칭)
            </button>
            <button 
              onClick={() => setShowSettings(true)}
              className="bg-white/5 text-slate-300 font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-all border border-white/10"
            >
              직접 선택하기
            </button>
          </div>
        </div>

        {/* Settings Modal (Team Selector) */}
        {showSettings && (
          <SettingsModal 
            currentTeam={currentTeamName || ''} 
            onClose={() => setShowSettings(false)} 
            onUpdate={onUpdateTeam}
            color={teamColor}
          />
        )}
      </div>
    );
  }

  // --- CASE 2: 팀이 있는 경우 (Dashboard) ---
  const insights = dashboardData?.insights || [
    { slotNumber: 1, isEmpty: true },
    { slotNumber: 2, isEmpty: true },
    { slotNumber: 3, isEmpty: true },
  ] as PlayerInsightDto[];

  return (
    <div className="relative z-10 w-full animate-fade-in-up pb-24">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* 1. Header Section */}
        <header className="relative mb-12 rounded-[2.5rem] overflow-hidden border border-white/10 group">
           {/* Dynamic Background */}
           <div 
             className="absolute inset-0 opacity-20 transition-all duration-1000"
             style={{ background: `linear-gradient(135deg, ${teamColor}, #020617 80%)` }}
           ></div>
           
           <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row justify-between items-end gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                   <span 
                    className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border"
                    style={{ borderColor: teamColor, color: teamColor, backgroundColor: `${teamColor}11` }}
                   >
                     My Favorite Team
                   </span>
                   <button onClick={() => setShowSettings(true)} className="text-slate-500 hover:text-white transition-colors">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                   </button>
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none mb-2">
                  {myTeam?.name.split(' ')[0]} <span style={{ color: teamColor }}>{myTeam?.name.split(' ')[1] || ''}</span>
                </h1>
                <p className="text-slate-400 font-light text-lg">
                  {user.nickname}님의 전용 데이터 대시보드
                </p>
              </div>

              {/* Rank Card inside Header */}
              <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex items-center gap-8 min-w-[280px]">
                 <div>
                    <span className="block text-xs text-slate-400 uppercase tracking-widest mb-1">Current Rank</span>
                    <span className="text-5xl font-black text-white italic">#{myTeam?.rank || '-'}</span>
                 </div>
                 <div className="h-12 w-[1px] bg-white/10"></div>
                 <div>
                    <div className="flex justify-between w-32 mb-1">
                      <span className="text-xs text-slate-400">Win Rate</span>
                      <span className="text-xs font-mono font-bold" style={{ color: teamColor }}>{myTeam?.winRate || '-.--'}</span>
                    </div>
                    <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ width: `${(myTeam?.winRate || 0) * 100}%`, backgroundColor: teamColor }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 text-right">게임차 {myTeam?.gamesBehind ?? '-'}</p>
                 </div>
              </div>
           </div>
        </header>

        {/* 2. Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Key Players (Span 2) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-6 rounded-full" style={{ backgroundColor: teamColor }}></span>
                AI Key Player Insight
              </h3>
              <span className="text-xs text-slate-500 font-mono">* 실시간 데이터 기반</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {insights.map((insight, idx) => {
                // predictedStat 파싱 (예: "0.352 (MVP 유력)" -> value: 0.352, label: MVP 유력)
                let mainValue = "-";
                let subLabel = "";
                
                if (insight.predictedStat) {
                  const parts = insight.predictedStat.split(' ');
                  mainValue = parts[0];
                  subLabel = parts.slice(1).join(' ').replace(/[()]/g, ''); // 괄호 제거
                }

                return (
                  <div 
                    key={idx}
                    className="bg-[#0a0f1e]/80 border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between min-h-[220px]"
                    style={{ borderColor: `${teamColor}33` }}
                  >
                    {/* Background Accents */}
                    <div className="absolute -right-10 -top-10 w-32 h-32 opacity-10 blur-3xl rounded-full" style={{ backgroundColor: teamColor }}></div>
                    
                    {insight.isEmpty ? (
                      // Empty / Loading State for Slot
                      <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-3">
                         <div className="w-12 h-12 rounded-full border-2 border-slate-700 border-dashed animate-spin-slow"></div>
                         <span className="text-xs font-mono">PLAYER ANALYSIS...</span>
                      </div>
                    ) : (
                      <div className="relative z-10 flex flex-col h-full">
                        {/* Header: Position & Main Stat */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-white/5 text-slate-400 font-black text-xs">
                             {insight.position}
                          </div>
                          <div className="text-right">
                             {/* Main AI Prediction Value */}
                            <span className="block text-3xl font-black text-white italic tracking-tight">{mainValue}</span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{subLabel || 'AI PREDICTION'}</span>
                          </div>
                        </div>

                        {/* Player Name */}
                        <h4 className="text-xl font-bold text-white mb-auto">{insight.name}</h4>
                        
                        <div className="w-full h-[1px] bg-white/10 my-4"></div>

                        {/* Footer: Confidence */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                             <span className="text-xs text-slate-400">예측 신뢰도</span>
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold" style={{ color: teamColor }}>{insight.confidence}%</span>
                             </div>
                          </div>
                          <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                             <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${insight.confidence}%`, backgroundColor: teamColor }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Additional Chart / Graph Placeholder */}
            <div className="bg-[#0a0f1e]/60 border border-white/5 rounded-3xl p-8 flex flex-col md:flex-row gap-8 items-center">
               <div className="flex-1 space-y-4">
                  <h4 className="text-lg font-bold text-white">이번 주 승부 예측</h4>
                  <p className="text-slate-400 text-sm font-light">
                    최근 팀 타격 사이클과 상대 선발 투수 데이터를 분석했을 때, 
                    <span style={{ color: teamColor }} className="font-bold mx-1">이번 주 4승 2패</span> 
                    이상의 성적이 유력합니다.
                  </p>
                  <button className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 mt-4 hover:opacity-80 transition-opacity" style={{ color: teamColor }}>
                    View Full Analysis <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </button>
               </div>
               <div className="w-full md:w-48 h-32 bg-slate-800/50 rounded-xl flex items-center justify-center border border-white/5 relative overflow-hidden">
                  {/* Mock Chart Visual */}
                  <div className="absolute bottom-0 left-0 right-0 h-full flex items-end justify-between px-4 pb-4">
                     {[40, 60, 35, 70, 50, 80].map((h, i) => (
                       <div key={i} className="w-4 rounded-t-sm opacity-60" style={{ height: `${h}%`, backgroundColor: teamColor }}></div>
                     ))}
                  </div>
               </div>
            </div>
          </div>

          {/* Right Column: Mini News & Quick Links */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white">Latest News</h3>
              <button className="text-xs text-slate-500 hover:text-white transition-colors">More</button>
            </div>
            
            <div className="bg-[#0a0f1e]/80 border border-white/5 rounded-3xl p-6 space-y-6">
               {[1, 2, 3].map((_, i) => (
                 <div key={i} className="group cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-[10px] text-slate-500 border border-white/10 px-1.5 py-0.5 rounded">TODAY</span>
                    </div>
                    <h5 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors line-clamp-2 mb-2">
                       {myTeam?.name}의 {i === 0 ? '핵심 불펜 투수 복귀 임박' : i === 1 ? '주말 시리즈 예매 매진 행렬' : '신인 드래프트 전략 분석'}
                    </h5>
                    <p className="text-xs text-slate-500 line-clamp-1">더그아웃 AI가 분석한 결과 긍정적인 신호가 포착되었습니다.</p>
                 </div>
               ))}
            </div>

            <div className="p-6 rounded-3xl border border-white/5 relative overflow-hidden group cursor-pointer" style={{ backgroundColor: `${teamColor}11` }}>
               <div className="relative z-10 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-white mb-1">직관 티켓 예매</h4>
                    <p className="text-xs text-slate-400">이번 주말, 경기장으로!</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center transform group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                  </div>
               </div>
            </div>
          </div>

        </div>

        {/* Settings Modal (Reused) */}
        {showSettings && (
          <SettingsModal 
            currentTeam={currentTeamName || ''} 
            onClose={() => setShowSettings(false)} 
            onUpdate={onUpdateTeam}
            color={teamColor}
          />
        )}
      </div>
    </div>
  );
};

export default MyDashboard;
