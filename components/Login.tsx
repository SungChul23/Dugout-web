import React, { useState } from 'react';

const API_BASE_URL = "https://dugout.cloud";

interface LoginProps {
  onCancel: () => void;
  onSignupClick: () => void;
  onLoginSuccess: (nickname: string, favoriteTeam: string) => void;
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

    // 1. 서버 응답이 성공(200 OK)인지 확인
    if (!response.ok) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    // 2. 서버가 보낸 실제 데이터(예: { "nickname": "성철", "favoriteTeam": "KIA 타이거즈" })를 읽음
    const data = await response.json(); 
    
    setSuccess(true);
    
    // 3. 서버에서 받은 진짜 닉네임과 선호 구단으로 로그인 처리
    setTimeout(() => {
      onLoginSuccess(data.nickname, data.favoriteTeam); 
    }, 500);

  } catch (err) {
    console.error(err);
    setError(err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="relative z-10 max-w-md mx-auto px-6 py-20 animate-fade-in-up">
      <div className={`bg-[#0a0f1e]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-[0_30px_60px_rgba(0,0,0,0.6)] relative transition-all duration-300 ${error ? 'animate-shake border-red-500/30' : ''}`}>
        
        {/* Top Close Button */}
        <button 
          onClick={onCancel}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
          aria-label="닫기"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-slate-400 text-sm font-light">
            DUGOUT의 프리미엄 분석을 계속 이용하세요.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block ml-1">이메일</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/50 transition-all text-sm"
              placeholder="example@dugout.com"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block ml-1">비밀번호</label>
              <a href="#" className="text-xs text-brand-primary hover:text-brand-accent transition-colors">비밀번호를 잊으셨나요?</a>
            </div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/50 transition-all text-sm"
              placeholder="••••••••"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-xs flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || success}
              className={`
                w-full font-black py-4 rounded-xl text-lg shadow-[0_0_20px_rgba(6,182,212,0.3)] 
                transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none
                flex items-center justify-center gap-2
                ${success 
                  ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.5)]' 
                  : 'bg-gradient-to-r from-brand-accent to-brand-primary hover:from-cyan-400 hover:to-blue-400 text-brand-dark hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]'
                }
              `}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  로그인 중...
                </>
              ) : success ? (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  로그인 성공!
                </>
              ) : (
                '로그인'
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-slate-400 text-sm">
            아직 계정이 없으신가요?{' '}
            <button 
              onClick={onSignupClick}
              className="text-brand-accent hover:text-white font-bold transition-colors ml-1"
            >
              회원가입하기
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;