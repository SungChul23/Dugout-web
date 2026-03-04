
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = "https://dugout.cloud";

interface LoginProps {
  onCancel: () => void;
  onSignupClick: () => void;
  onLoginSuccess: (nickname: string, favoriteTeam: string, teamSlogan?: string) => void;
}

const Login: React.FC<LoginProps> = ({ onCancel, onSignupClick, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null); // Clear error on typing
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/members/login`, {
       method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password
      })
    });

    if (!response.ok) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    const data = await response.json();
    
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
    }
    
    setSuccess(true);
    
    setTimeout(() => {
      onLoginSuccess(data.nickname, data.favoriteTeamName, data.teamSlogan); 
    }, 800);

  } catch (err) {
    console.error(err);
    setError(err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다.');
  } finally {
    setLoading(false);
  }
};

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
        className={`bg-[#0a0f1e]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-14 shadow-[0_40px_80px_rgba(0,0,0,0.7)] relative w-full max-w-lg overflow-hidden my-auto ${error ? 'border-red-500/30' : ''}`}
      >
        {/* Background Glow Effects */}
        <div className="absolute top-[-20%] left-[-20%] w-[300px] h-[300px] bg-brand-primary/20 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[300px] h-[300px] bg-brand-accent/10 rounded-full blur-[80px] pointer-events-none"></div>

        {/* Top Close Button */}
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 md:top-8 md:right-8 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all z-10"
          aria-label="닫기"
        >
          <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-10 relative z-10">
          <motion.h2 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-black text-white mb-3 tracking-tight"
          >
            Welcome Back
          </motion.h2>
          <motion.p 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-base font-light"
          >
            DUGOUT의 프리미엄 분석을 계속 이용하세요.
          </motion.p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 relative z-10">
          {/* Email Field */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block ml-1">이메일</label>
            <div className="relative group">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/50 transition-all text-base group-hover:border-white/20"
                placeholder="example@dugout.com"
              />
              <div className="absolute inset-0 rounded-2xl bg-brand-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
          </motion.div>

          {/* Password Field */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-2"
          >
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block ml-1">비밀번호</label>
            </div>
            <div className="relative group">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/50 transition-all text-base group-hover:border-white/20"
                placeholder="••••••••"
              />
              <div className="absolute inset-0 rounded-2xl bg-brand-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-2xl text-red-400 text-sm flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="pt-2"
          >
            <button
              type="submit"
              disabled={loading || success}
              className={`
                w-full font-black py-5 rounded-2xl text-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] 
                transition-all transform hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 disabled:transform-none
                flex items-center justify-center gap-2 relative overflow-hidden group
                ${success 
                  ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.5)]' 
                  : 'bg-gradient-to-r from-brand-accent to-brand-primary hover:from-cyan-400 hover:to-blue-400 text-brand-dark hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]'
                }
              `}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span className="relative z-10 flex items-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-6 w-6 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    로그인 중...
                  </>
                ) : success ? (
                  <>
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    로그인 성공!
                  </>
                ) : (
                  '로그인'
                )}
              </span>
            </button>
          </motion.div>
        </form>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 pt-6 border-t border-white/5 text-center relative z-10"
        >
          <p className="text-slate-400 text-base">
            아직 계정이 없으신가요?{' '}
            <button 
              onClick={onSignupClick}
              className="text-brand-accent hover:text-white font-bold transition-colors ml-1 relative group"
            >
              회원가입하기
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-accent transition-all group-hover:w-full"></span>
            </button>
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Login;
