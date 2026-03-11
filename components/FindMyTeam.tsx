
import React, { useState } from 'react';
import { TEAMS } from '../constants'; // 팀 정보 및 컬러 매핑을 위해 Import
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api';

interface FindMyTeamProps {
  onCancel: () => void;
}

interface TeamRecommendationResponseDto {
  year: string;
  teamName: string;
  originalName: string;
  score: number;
  reason: string;
  statsSummary: string;
}

const QUESTIONS = [
  {
    id: 'q1',
    icon: '💥',
    title: '화끈한 거포 군단',
    desc: '시원하게 담장을 넘기는 홈런 쇼를 보는 것을 얼마나 선호하시나요?',
    leftLabel: '정교함이 중요',
    rightLabel: '홈런이 최고',
  },
  {
    id: 'q2',
    icon: '🏃',
    title: '끈질긴 소총 부대',
    desc: '안타를 몰아쳐서 끊임없이 출루하고 찬스를 이어가는 스타일을 선호하시나요?',
    leftLabel: '한방이 중요',
    rightLabel: '연속 안타 선호',
  },
  {
    id: 'q3',
    icon: '🏔️',
    title: '압도적인 선발진',
    desc: '상대 타선을 꽁꽁 묶는 선발 투수의 긴 이닝 소화와 완벽한 방어력을 중시하시나요?',
    leftLabel: '타격전 선호',
    rightLabel: '에이스 투수 선호',
  },
  {
    id: 'q4',
    icon: '🔒',
    title: '짜릿한 뒷문 단속',
    desc: '경기 후반 1점 차 리드를 끝까지 지켜내는 마무리 투수의 활약을 얼마나 중시하시나요?',
    leftLabel: '역전승의 묘미',
    rightLabel: '철벽 마무리',
  },
  {
    id: 'q5',
    icon: '⚖️',
    title: '공수 완벽 밸런스',
    desc: '공격과 수비 모든 면에서 약점이 없는 리그를 압도하는 \'빈틈없는 강팀\'을 원하시나요?',
    leftLabel: '특색 있는 팀',
    rightLabel: '육각형 팀',
  },
  {
    id: 'q6',
    icon: '🏆',
    title: '꾸준한 전통의 강호',
    desc: '당장의 화려함보다 역대 우승 횟수나 꾸준한 상위권 유지 같은 \'팀의 근성\'을 보시나요?',
    leftLabel: '언더독 반란',
    rightLabel: '왕조의 역사',
  },
];

const YEARS = Array.from({ length: 25 }, (_, i) => 2025 - i); // 2025 to 2001

const FindMyTeam: React.FC<FindMyTeamProps> = ({ onCancel }) => {
  const [step, setStep] = useState(0); // 0: Intro, 1~6: Questions, 7: Analysis Loading, 8: Result View
  const [startYear, setStartYear] = useState<number>(2024);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiResult, setApiResult] = useState<TeamRecommendationResponseDto[] | null>(null);

  const handleYearSelect = (year: number) => {
    setStartYear(year);
  };

  const handleStart = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setStep(1);
      setIsAnimating(false);
    }, 400);
  };

  const handleAnswer = (score: number) => {
    if (isAnimating) return;
    
    // 현재 시점의 최신 답변을 변수에 담습니다.
    const updatedAnswers = { ...answers, [`q${step}`]: score };
    setAnswers(updatedAnswers); // 상태 업데이트 (UI용)
    
    setIsAnimating(true);
    setTimeout(() => {
      if (step < QUESTIONS.length) {
        setStep(prev => prev + 1);
      } else {
        // 최신 값을 인자로 직접 넘깁니다!
        submitSurvey(updatedAnswers); 
      }
      setIsAnimating(false);
    }, 500);
  };

  // --- API CALL IMPLEMENTATION ---
  const submitSurvey = async (finalAnswers?: Record<string, number>) => {
    setStep(7);
    setIsSubmitting(true);

    const currentAnswers = finalAnswers || answers;

    try {
      const payload = {
        startYear: startYear,
        preferences: currentAnswers,
      };

      console.log("Submitting to DUGOUT Analytics:", payload);

      const response = await api.post('/api/v1/fanexperience/match-team', payload);

      const data: TeamRecommendationResponseDto[] = response.data;
      setApiResult(data);
      
      // 결과 화면으로 이동
      setTimeout(() => {
        setStep(8);
        setIsSubmitting(false);
      }, 1500);

    } catch (error) {
      console.error("API Error:", error);
      alert("분석 서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
      setStep(0); // 초기 화면으로 리셋
      setAnswers({});
      setIsSubmitting(false);
    }
  };

  // 백엔드 한글 팀명을 기반으로 TEAMS 상수의 스타일(Color, ID)을 찾거나
  // 과거 구단(예: 현대 유니콘스)을 위한 커스텀 스타일을 반환하는 함수
  const getTeamStyle = (serverTeamName: string) => {
    const name = serverTeamName.replace(/\s/g, ''); // 공백 제거

    // 1. 현재 구단 매핑 (TEAMS 상수 활용)
    if (name.includes('KIA') || name.includes('기아')) return TEAMS.find(t => t.code === 'KIA');
    if (name.includes('삼성')) return TEAMS.find(t => t.code === 'SAMSUNG');
    if (name.includes('LG') || name.includes('트윈스')) return TEAMS.find(t => t.code === 'LG');
    if (name.includes('두산')) return TEAMS.find(t => t.code === 'DOOSAN');
    if (name.includes('kt') || name.includes('KT')) return TEAMS.find(t => t.code === 'KT');
    if (name.includes('SSG') || name.includes('랜더스') || name.includes('SK')) return TEAMS.find(t => t.code === 'SSG');
    if (name.includes('한화')) return TEAMS.find(t => t.code === 'HANWHA');
    if (name.includes('롯데')) return TEAMS.find(t => t.code === 'LOTTE');
    if (name.includes('NC') || name.includes('엔씨')) return TEAMS.find(t => t.code === 'NC');
    if (name.includes('키움') || name.includes('넥센')) return TEAMS.find(t => t.code === 'KIWOOM');

    // 2. 과거 구단 커스텀 매핑 (TEAMS에 없는 경우)
    if (name.includes('현대')) {
      return {
        code: 'HYUNDAI',
        name: '현대 유니콘스',
        color: '#1a2c22', // Deep Green / Black style
        rank: 'Legend', // 현재 순위 대신 레전드 표시
      };
    }
    
    // Fallback: 정보가 없을 경우 기본 스타일
    return {
      code: 'KBO',
      name: serverTeamName,
      color: '#ec4899', // Default Pink
      rank: '-',
    };
  };

  // 화면 표시용 팀명 포맷팅 함수 (ex: "SSG" -> "SSG 랜더스")
  const formatTeamName = (rawName: string) => {
    const n = rawName.replace(/\s/g, '').toUpperCase();
    
    if (n.includes('KIA') || n.includes('기아')) return 'KIA 타이거즈';
    if (n.includes('SAMSUNG') || n.includes('삼성')) return '삼성 라이온즈';
    if (n.includes('LG') || n.includes('엘지')) return 'LG 트윈스';
    if (n.includes('DOOSAN') || n.includes('두산')) return '두산 베어스';
    if (n.includes('KT') || n.includes('케이티') || n.includes('WIZ')) return 'kt wiz';
    if (n.includes('SSG') || n.includes('랜더스')) return 'SSG 랜더스';
    if (n.includes('HANWHA') || n.includes('한화')) return '한화 이글스';
    if (n.includes('LOTTE') || n.includes('롯데')) return '롯데 자이언츠';
    if (n.includes('NC') || n.includes('엔씨') || n.includes('다이노스')) return 'NC 다이노스';
    if (n.includes('KIWOOM') || n.includes('키움') || n.includes('히어로즈')) return '키움 히어로즈';
    
    // Historical
    if (n.includes('현대')) return '현대 유니콘스';
    if (n.includes('SK') && !n.includes('SSG')) return 'SK 와이번스';

    return rawName;
  };

  const calculateProgress = () => {
    if (step === 0) return 0;
    return ((step - 1) / QUESTIONS.length) * 100;
  };

  // --- STEP 8: Result View (API Result Visualization) ---
  if (step === 8 && apiResult && apiResult.length > 0) {
    // 1순위 팀 (Main) for Insight Text
    const topTeam = apiResult[0];

    return (
      <div className="relative z-10 w-full min-h-[80vh] flex flex-col items-center justify-center animate-fade-in-up px-6 pb-12 overflow-y-auto">
        <div className="max-w-7xl w-full mx-auto">
          
          {/* Header Badge */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-pink-500/20 to-cyan-400/20 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-md">
               <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
               <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400 uppercase tracking-widest">
                 AI Analysis Complete
               </span>
            </div>
            <h2 className="text-4xl font-black text-white mt-6 mb-2">
              당신의 <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400">운명의 팀</span>을 찾았습니다
            </h2>
            <p className="text-slate-400">
              데이터가 분석한 당신의 취향과 가장 완벽하게 일치하는 TOP 3 구단입니다.
            </p>
          </div>

          {/* Top 3 Teams Grid (Horizontal) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-stretch">
            {apiResult.slice(0, 3).map((team, index) => {
              const isFirst = index === 0;
              const style = getTeamStyle(team.teamName);
              const color = style?.color || '#ec4899';
              const displayName = formatTeamName(team.teamName);

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative group overflow-hidden rounded-[2rem] border transition-all duration-300 flex flex-col ${
                    isFirst 
                      ? 'bg-[#0a0f1e] border-pink-500/50 shadow-[0_0_30px_rgba(236,72,153,0.15)] md:-mt-4 md:mb-4 z-10 ring-1 ring-pink-500/30' 
                      : 'bg-[#0a0f1e]/80 border-white/10 hover:border-white/20'
                  }`}
                >
                   {/* Background Gradient for First Place */}
                   {isFirst && (
                     <div className="absolute inset-0 bg-gradient-to-b from-pink-500/10 to-transparent opacity-50 pointer-events-none"></div>
                   )}
                   
                   <div className="p-6 flex flex-col items-center text-center relative z-10 h-full">
                      {/* Rank Badge */}
                      <div className={`mb-6 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        isFirst ? 'bg-pink-500 text-white shadow-lg' : 'bg-white/10 text-slate-400'
                      }`}>
                        {isFirst ? 'Best Match' : `Rank ${index + 1}`}
                      </div>

                      {/* Logo */}
                      <div className="mb-6 transform group-hover:scale-110 transition-transform duration-500">
                        <div 
                          className={`rounded-full flex items-center justify-center font-black text-white shadow-lg border-4 ${
                            isFirst ? 'w-32 h-32 text-4xl' : 'w-24 h-24 text-3xl'
                          }`}
                          style={{ backgroundColor: color, borderColor: 'rgba(255,255,255,0.1)' }}
                        >
                          {style?.code?.substring(0, 1) || 'K'}
                        </div>
                      </div>

                      {/* Team Name */}
                      <h3 className={`font-black text-white mb-2 break-keep ${isFirst ? 'text-2xl' : 'text-xl'}`}>
                        {displayName}
                      </h3>
                      <p className="text-slate-400 font-bold mb-4">{team.year} 시즌</p>

                      {/* Stats Summary */}
                      <div className="mt-auto w-full bg-white/5 rounded-xl p-4 text-xs text-slate-300 leading-relaxed border border-white/5">
                        {team.statsSummary}
                      </div>
                   </div>
                </motion.div>
              );
            })}
          </div>

          {/* Insight / Reason Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white/5 border border-white/5 rounded-[2rem] p-8 md:p-10 shadow-inner relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full"></div>
             
             <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
               <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               AI Matching Insight
             </h4>
             
             <div className="text-slate-100 leading-relaxed text-lg font-light whitespace-pre-line markdown-body">
               <ReactMarkdown
                 components={{
                   strong: ({node, ...props}) => <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400" {...props} />
                 }}
               >
                 {topTeam.reason}
               </ReactMarkdown>
             </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-8 justify-center">
            <button 
              onClick={onCancel}
              className="w-full sm:w-auto px-8 bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 text-white font-black py-4 rounded-xl text-lg shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_40px_rgba(34,211,238,0.5)] transition-all transform hover:-translate-y-1"
            >
              메인으로 돌아가기
            </button>
            <button 
                onClick={() => { setStep(0); setAnswers({}); setApiResult(null); }}
                className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all font-bold text-lg"
            >
              다시 분석하기
            </button>
          </div>

        </div>
      </div>
    );
  }

  // --- STEP 7: Loading Screen ---
  if (step === 7) {
    return (
      <div className="relative z-10 w-full min-h-[80vh] flex flex-col items-center justify-center animate-fade-in-up px-6">
        <div className="w-32 h-32 relative mb-12">
           {/* Outer Ring: Pink (Fan Experience) */}
           <div className="absolute inset-0 rounded-full border-4 border-pink-500/20 animate-spin-slow"></div>
           <div className="absolute inset-0 rounded-full border-4 border-t-pink-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
           
           {/* Inner Ring: Cyan (Dugout) */}
           <div className="absolute inset-4 rounded-full border-4 border-cyan-400/20 animate-spin-slow direction-reverse"></div>
           <div className="absolute inset-4 rounded-full border-4 border-b-cyan-400 border-l-transparent border-t-transparent border-r-transparent animate-spin direction-reverse"></div>
           
           <div className="absolute inset-0 flex items-center justify-center text-5xl animate-pulse">⚾️</div>
        </div>
        
        <h2 className="text-3xl font-black text-white mb-4 text-center">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400">DUGOUT 스카우터</span>가<br/>
          당신의 야구 DNA를 분석 중입니다.
        </h2>
        <p className="text-slate-400 text-center max-w-md">
          {startYear}년부터 축적된 10개 구단의 경기 데이터를 기반으로<br/>
          당신의 취향과 가장 유사한 승리 패턴을 찾고 있습니다.
        </p>
      </div>
    );
  }

  // --- STEP 1~6: Questions ---
  if (step > 0) {
    const question = QUESTIONS[step - 1];
    
    return (
      <div className="relative z-10 w-full min-h-[80vh] flex flex-col justify-center animate-fade-in-up">
        <div className="max-w-3xl mx-auto w-full px-6">
          
          {/* Progress Bar with Gradient */}
          <div className="mb-12">
            <div className="flex justify-between text-xs text-slate-500 font-bold mb-2 uppercase tracking-widest">
              <span>Question {step} / {QUESTIONS.length}</span>
              <span className="text-cyan-400">Matching...</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div 
            className={`transition-all duration-500 transform ${isAnimating ? 'opacity-0 translate-y-10 scale-95' : 'opacity-100 translate-y-0 scale-100'}`}
          >
             <div className="text-center mb-10">
               <div className="text-6xl mb-6 animate-float inline-block drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{question.icon}</div>
               <h2 className="text-3xl md:text-5xl font-black text-white mb-4">{question.title}</h2>
               <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
                 {question.desc}
               </p>
             </div>

             {/* Rating Scale (1-5) */}
             <div className="space-y-4">
                <div className="flex justify-between px-2 text-sm font-bold text-slate-400">
                   <span>{question.leftLabel}</span>
                   <span>{question.rightLabel}</span>
                </div>
                
                <div className="grid grid-cols-5 gap-3 md:gap-6">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => handleAnswer(score)}
                      className="group relative h-20 md:h-24 rounded-2xl border-2 border-white/10 bg-slate-900/40 hover:bg-white/5 hover:border-transparent transition-all duration-300 flex flex-col items-center justify-center overflow-hidden"
                    >
                      {/* Gradient Border on Hover */}
                      <div className="absolute inset-0 rounded-2xl p-[2px] bg-gradient-to-br from-pink-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="w-full h-full bg-[#0a0f1e] rounded-[14px]"></div>
                      </div>

                      <span className="relative z-10 text-2xl md:text-3xl font-black text-slate-500 group-hover:text-white transition-colors">
                        {score}
                      </span>
                      
                      {score === 1 && <span className="relative z-10 text-[10px] text-pink-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2 font-bold">NOPE</span>}
                      {score === 5 && <span className="relative z-10 text-[10px] text-cyan-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2 font-bold">LOVE IT</span>}
                    </button>
                  ))}
                </div>
             </div>

             <div className="mt-12 flex justify-center">
               <button onClick={() => setStep(step - 1)} className="text-slate-500 hover:text-white text-sm underline underline-offset-4 transition-colors">
                 이전 질문으로
               </button>
             </div>
          </div>

        </div>
      </div>
    );
  }

  // --- STEP 0: Intro & Year Selection ---
  return (
    <div className="relative z-10 w-full min-h-[80vh] flex items-center justify-center animate-fade-in-up">
       <div className={`max-w-2xl mx-auto px-6 text-center transition-all duration-500 ${isAnimating ? 'opacity-0 -translate-y-10' : 'opacity-100'}`}>
          
          <button onClick={onCancel} className="absolute top-0 right-0 m-6 text-slate-500 hover:text-white transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          {/* Badge: Pink + Mint Gradient */}
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-pink-500/10 to-cyan-400/10 border border-pink-500/20 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm">
             <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
             <span className="text-xs md:text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400 uppercase tracking-widest">
               Fan Experience Center
             </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            FIND YOUR<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400">
              DESTINY TEAM
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-400 mb-12 leading-relaxed">
            아직 내 팀을 못 찾으셨나요?<br/>
            <span className="text-cyan-400 font-bold">DUGOUT</span>의 데이터가 당신의 취향을 분석해<br/>
            운명적인 KBO 구단을 매칭해드립니다.
          </p>

          <div className="bg-[#0a0f1e]/80 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
             {/* Decorative Gradient Blob */}
             <div className="absolute -top-20 -right-20 w-40 h-40 bg-pink-500/20 rounded-full blur-[50px] pointer-events-none"></div>
             <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-400/20 rounded-full blur-[50px] pointer-events-none"></div>

             <label className="block text-sm font-bold text-slate-300 uppercase tracking-widest mb-4 relative z-10">
               Q. 언제부터 야구에 관심을 가지셨나요?
             </label>
             
             <div className="relative max-w-xs mx-auto mb-8 z-10">
               <select 
                 value={startYear}
                 onChange={(e) => handleYearSelect(Number(e.target.value))}
                 className="w-full appearance-none bg-[#020617] text-white text-xl font-bold py-4 px-6 rounded-xl border-2 border-white/10 focus:border-pink-500 focus:ring-0 focus:outline-none text-center cursor-pointer hover:border-pink-500/50 transition-colors"
               >
                 {YEARS.map(year => (
                   <option key={year} value={year}>{year}년</option>
                 ))}
               </select>
               <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-pink-500">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
               </div>
             </div>

             <button 
               onClick={handleStart}
               className="w-full relative overflow-hidden group bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 text-white font-black text-xl py-5 rounded-2xl shadow-[0_0_30px_rgba(236,72,153,0.3)] transition-all transform hover:-translate-y-1 hover:shadow-[0_0_50px_rgba(34,211,238,0.5)]"
             >
               <span className="relative z-10">Start Analysis</span>
               <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
             </button>
             <p className="text-[10px] text-slate-500 mt-4 relative z-10">
               * 선택하신 연도 이후의 데이터만을 기반으로 분석합니다.
             </p>
          </div>
       </div>
    </div>
  );
};

export default FindMyTeam;
