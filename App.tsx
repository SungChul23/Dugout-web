
import React, { useState, useEffect } from 'react';
import { api } from './api';
import Navbar from './components/Navbar';
import AnalysisRing from './components/AnalysisRing';
import Ticker from './components/Ticker';
import FeaturesSection from './components/FeaturesSection';
import Footer from './components/Footer';
import Signup from './components/Signup';
import Login from './components/Login';
import TicketReservation from './components/TicketReservation';
import GuidePage from './components/GuidePage';
import KboNews from './components/KboNews';
import MyDashboard from './components/MyDashboard'; 
import FindMyTeam from './components/FindMyTeam';
import GameSchedule from './components/GameSchedule';
import TeamPlayerStats from './components/TeamPlayerStats';
import PlayerPrediction from './components/PlayerPrediction'; 
import FaAnalysis from './components/FaAnalysis';
import GoldenGlove from './components/GoldenGlove'; // New Import
import Postseason from './components/Postseason';
import NoticeModal from './components/NoticeModal';
import ChatBot from './components/ChatBot';
import { AnimatePresence } from 'framer-motion';

interface User {
  nickname: string;
  favoriteTeam?: string;
  teamSlogan?: string;
}

function App() {
  const [view, setView] = useState<'home' | 'signup' | 'login' | 'tickets' | 'guide' | 'news' | 'dashboard' | 'findTeam' | 'schedule' | 'stats' | 'prediction' | 'faAnalysis' | 'goldenglove' | 'postseason'>('home');
  const [user, setUser] = useState<User | null>(null);
  const [showNotice, setShowNotice] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [visitCount, setVisitCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchVisitCount = async () => {
      try {
        const response = await api.post('/api/v1/visits');
        if (response.data && typeof response.data.count === 'number') {
          setVisitCount(response.data.count);
        }
      } catch (error) {
        // 호출이 실패하면 방문자 수 영역을 숨김 (null 유지)
        console.error("Failed to fetch visit count:", error);
      }
    };
    fetchVisitCount();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/api/v1/members/me');
        if (response.data) {
          setUser({
            nickname: response.data.nickname,
            favoriteTeam: response.data.favoriteTeamName,
            teamSlogan: response.data.teamSlogan,
          });
        }
      } catch (error: any) {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          // Ignore authentication errors
        } else {
          console.error("Session restore failed:", error);
        }
      } finally {
        setIsAuthChecking(false);
      }
    };
    checkAuth();
  }, []);

  const navigateToHome = () => setView('home');
  const navigateToSignup = () => setView('signup');
  const navigateToLogin = () => setView('login');
  
  const navigateToDashboard = () => {
    if (user) {
      setView('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigateToLogin();
    }
  };
  
  // 통합 네비게이션 핸들러
  const handleMenuClick = (targetView: string) => {
    const v = targetView as any;
    
    // 로그인 필요한 페이지 체크 (FA 분석 추가)
    if (['dashboard'].includes(v) && !user) {
       alert('로그인이 필요한 서비스입니다.');
       navigateToLogin();
       return;
    }

    if (['schedule', 'stats', 'news', 'tickets', 'guide', 'findTeam', 'dashboard', 'home', 'prediction', 'faAnalysis', 'goldenglove', 'postseason'].includes(v)) {
      setView(v);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // 그 외 정의되지 않은 뷰
      console.warn('Unknown view:', targetView);
    }
  };

  const handleFeatureClick = (id: string) => {
    if (id === '1') handleMenuClick('stats');
    else if (id === '2') handleMenuClick('schedule');
    else if (id === '3') handleMenuClick('news');
    else if (id === '4') handleMenuClick('prediction'); 
    else if (id === '5') handleMenuClick('goldenglove');
    else if (id === '6') handleMenuClick('faAnalysis'); // ID 6: FA 시장 등급 분석
    else if (id === '7') handleMenuClick('tickets');
    else if (id === '8') handleMenuClick('findTeam');
    else if (id === '9') handleMenuClick('guide');
    else alert('해당 기능은 준비 중입니다.');
  };

  const handleLoginSuccess = (nickname: string, favoriteTeam: string, teamSlogan?: string) => {
    setUser({ nickname, favoriteTeam, teamSlogan });
    setView('home');
  };

  const handleLogout = async () => {
    console.log("로그아웃 프로세스 시작"); // 디버깅 로그

    try {
      // 2. 서버에 로그아웃 알리기
      await api.post('/api/v1/members/logout');
    } catch (error) {
      console.error("서버 로그아웃 통신 실패:", error);
    } finally {
      // 3. 로컬 스토리지의 모든 인증 정보 삭제 (무조건 실행) - 기존에 남아있을 수 있는 데이터 정리
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userNickname');
      localStorage.removeItem('favoriteTeam');

      // 4. 상태 초기화 및 홈으로 이동
      setUser(null);
      setView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      console.log("로그아웃 완료");
    }
  };

  if (isAuthChecking) {
    return <div className="min-h-screen bg-brand-dark flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-brand-dark text-white font-sans selection:bg-brand-accent/30 selection:text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-[100px]"></div>
      </div>

      <Navbar 
        user={user}
        onLogoClick={navigateToHome} 
        onSignupClick={navigateToSignup}
        onLoginClick={navigateToLogin}
        onLogoutClick={handleLogout}
        onProfileClick={navigateToDashboard}
        onNavigate={handleMenuClick}
        onNoticeClick={() => setShowNotice(true)}
      />

      <AnimatePresence>
        {showNotice && <NoticeModal onClose={() => setShowNotice(false)} />}
      </AnimatePresence>

      <main className="relative pt-20 md:pt-28 pb-12 overflow-hidden min-h-[calc(100vh-80px)]">
        {view === 'home' && (
          <div className="animate-fade-in-up">
            <div className="relative z-10 text-center px-4 mb-4 md:mb-8 pt-4 md:pt-16">
              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mb-6 md:mb-8">
                <div className="inline-flex items-center space-x-2.5 bg-white/10 border border-white/20 rounded-full px-4 py-2 md:px-5 md:py-2.5 backdrop-blur-md shadow-md">
                  <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                  <span className="text-xs md:text-sm lg:text-base font-semibold text-slate-100 tracking-wide">
                    2026 KBO 시즌 데이터 업데이트 완료
                  </span>
                </div>
                {visitCount !== null && (
                  <div className="inline-flex items-center space-x-2.5 bg-cyan-500/10 border border-cyan-400/40 rounded-full px-4 py-2 md:px-5 md:py-2.5 backdrop-blur-md shadow-md">
                    <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-cyan-400 animate-ping shrink-0"></span>
                    <span className="text-xs md:text-sm lg:text-base font-semibold text-slate-100 tracking-wide">
                      오늘 방문자 <strong className="text-cyan-300 font-extrabold text-sm md:text-base lg:text-lg ml-0.5">{visitCount}</strong>명
                    </span>
                  </div>
                )}
              </div>
              
              <h1 className="text-4xl md:text-7xl font-black mb-4 md:mb-6 leading-tight tracking-tight">
                <span className="block text-white">관중석이 아닌,</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent via-brand-primary to-brand-glow font-serif italic">
                  더그아웃의 시선으로.
                </span>
              </h1>
              
              <p className="max-w-2xl mx-auto text-slate-400 text-sm md:text-xl font-light leading-relaxed mb-8 md:mb-10 px-2 break-keep">
                10개 구단 모든 데이터의 중심. 실시간 트래킹부터 미래 성적 예측까지,<br className="md:hidden" /> 
                야구를 꿰뚫는 새로운 시각.
              </p>
            </div>

            {/* Responsive AnalysisRing */}
            <div className="w-full relative z-10 mb-8 md:mb-16 origin-center -mt-12 md:mt-0">
              <AnalysisRing />
            </div>

            <div className="relative z-20 flex flex-col sm:flex-row justify-center items-center gap-4 -mt-16 md:-mt-20 mb-16 md:mb-20 px-4">
              <button 
                onClick={user ? navigateToDashboard : navigateToSignup}
                className="group relative bg-white text-brand-dark px-6 py-3 md:px-8 md:py-4 rounded-full font-bold text-base md:text-lg shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(6,182,212,0.6)] transition-all transform hover:-translate-y-1 overflow-hidden"
              >
                 <span className="relative z-10 flex items-center">
                   {user ? '나의 분석 대시보드 보기' : '내 팀 분석하러 가기'}
                   <svg className="w-4 h-4 md:w-5 md:h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                   </svg>
                 </span>
                 <div className="absolute inset-0 bg-gradient-to-r from-brand-accent to-brand-primary opacity-0 group-hover:opacity-10 transition-opacity"></div>
              </button>

              <button 
                onClick={() => handleMenuClick('postseason')}
                className="group relative bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-black text-base md:text-lg shadow-[0_0_40px_rgba(245,158,11,0.4)] hover:shadow-[0_0_60px_rgba(239,68,68,0.7)] transition-all transform hover:-translate-y-1 overflow-hidden flex items-center gap-2"
              >
                 <span className="relative z-10 flex items-center">
                   <span>🍁 가을야구 입장하기</span>
                   <svg className="w-4 h-4 md:w-5 md:h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                   </svg>
                 </span>
                 <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
              </button>
            </div>

            <Ticker />
            <FeaturesSection onFeatureClick={handleFeatureClick} />
          </div>
        )}

        {/* Components Rendering */}
        {view === 'signup' && <Signup onCancel={navigateToHome} onLoginSuccess={handleLoginSuccess} onFindTeamClick={() => setView('findTeam')} />}
        {view === 'login' && <Login onLoginSuccess={handleLoginSuccess} onCancel={navigateToHome} onSignupClick={navigateToSignup} />}
        {view === 'tickets' && <TicketReservation onCancel={navigateToHome} />}
        {view === 'guide' && <GuidePage onCancel={navigateToHome} />}
        {view === 'news' && <KboNews onCancel={navigateToHome} defaultTeam={user?.favoriteTeam} />}
        {view === 'findTeam' && <FindMyTeam onCancel={navigateToHome} />}
        {view === 'schedule' && <GameSchedule onCancel={navigateToHome} user={user} />}
        {view === 'stats' && <TeamPlayerStats onCancel={navigateToHome} user={user} />}
        {view === 'prediction' && <PlayerPrediction onCancel={navigateToHome} user={user} />}
        {view === 'faAnalysis' && <FaAnalysis onCancel={navigateToHome} user={user} />} 
        {view === 'goldenglove' && <GoldenGlove onCancel={navigateToHome} user={user} />}
        {view === 'postseason' && <Postseason onCancel={navigateToHome} user={user} />}
        {view === 'dashboard' && user && (
          <MyDashboard 
            user={user} 
            onFindTeamClick={() => handleFeatureClick('8')} 
            onNewsClick={() => handleMenuClick('news')}
            onAddPlayerClick={() => handleMenuClick('prediction')}
            onRankClick={() => handleMenuClick('stats')}
            onScheduleClick={() => handleMenuClick('schedule')}
          />
        )}
      </main>

      <Footer />
      <ChatBot />
    </div>
  );
}

export default App;
