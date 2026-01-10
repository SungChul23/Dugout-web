import React, { useState } from 'react';

const API_BASE_URL = "https://dugout.cloud";

const KBO_TEAMS = [
  'KIA 타이거즈', '삼성 라이온즈', 'LG 트윈스', '두산 베어스', 'kt wiz',
  'SSG 랜더스', '한화 이글스', '롯데 자이언츠', 'NC 다이노스', '키움 히어로즈',
  '없음'
];

interface SignupProps {
  onCancel: () => void;
}

const Signup: React.FC<SignupProps> = ({ onCancel }) => {
  const [formData, setFormData] = useState({
    nickname: '',
    email: '',
    password: '',
    confirmPassword: '',
    favoriteTeam: '',
  });

  const [checkingId, setCheckingId] = useState(false);
  const [idAvailable, setIdAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'nickname') setIdAvailable(null); // Reset check on change
  };

  const checkNickname = async () => {
    if (!formData.nickname) return;
    setCheckingId(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/members/check-id?nickname=${encodeURIComponent(formData.nickname)}`);
      
    // 2. 서버가 보낸 true(사용가능) 또는 false(중복됨) 값을 읽습니다.
    const isAvailable = await response.json(); 
    
    // 3. 서버의 실제 결과를 상태에 반영합니다.
    setIdAvailable(isAvailable); 
    
  } catch (err) {
    console.error(err);
    setError('닉네임 중복 확인 중 오류가 발생했습니다');
  } finally {
    setCheckingId(false);
  }
};

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!formData.favoriteTeam) {
      setError('선호 팀을 선택해주세요.');
      return;
    }
    if (idAvailable !== true) {
      setError('닉네임 중복 확인을 해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/members/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: formData.nickname,
          email: formData.email,
          password: formData.password,
          favoriteTeam: formData.favoriteTeam
        })
      });

      if (!response.ok) {
        throw new Error('Signup failed');
      }

      setTimeout(() => {
        alert('회원가입이 완료되었습니다!');
        setLoading(false);
        onCancel();
      }, 500);
    } catch (err) {
      console.error(err);
      setError('회원가입 처리 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 max-w-xl mx-auto px-6 py-12 animate-fade-in-up">
      <div className="bg-[#0a0f1e]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-[0_30px_60px_rgba(0,0,0,0.6)] relative">
        
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
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">
            DUGOUT <span className="text-brand-accent font-light">Membership</span>
          </h2>
          <p className="text-slate-400 text-sm font-light">
            프로 수준의 데이터 분석과 예측, 지금 바로 시작하세요.
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          {/* Nickname Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block ml-1">닉네임</label>
            <div className="flex gap-3">
              <input
                type="text"
                name="nickname"
                required
                value={formData.nickname}
                onChange={handleInputChange}
                className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/50 transition-all text-sm"
                placeholder="사용하실 닉네임을 입력하세요"
              />
              <button
                type="button"
                onClick={checkNickname}
                disabled={checkingId || !formData.nickname}
                className="whitespace-nowrap bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold px-4 rounded-xl transition-all text-xs border border-white/5"
              >
                {checkingId ? '확인 중...' : '중복 확인'}
              </button>
            </div>
            {idAvailable === true && <p className="text-[10px] text-green-400 ml-1 flex items-center gap-1"><span className="w-1 h-1 bg-green-400 rounded-full"></span>사용 가능한 닉네임입니다.</p>}
            {idAvailable === false && <p className="text-[10px] text-red-400 ml-1 flex items-center gap-1"><span className="w-1 h-1 bg-red-400 rounded-full"></span>이미 사용 중인 닉네임입니다.</p>}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block ml-1">이메일</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/50 transition-all text-sm"
              placeholder="example@dugout.com"
            />
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block ml-1">비밀번호</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-brand-accent transition-all text-sm"
                placeholder="8자 이상 입력"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block ml-1">비밀번호 확인</label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-brand-accent transition-all text-sm"
                placeholder="비밀번호 재입력"
              />
            </div>
          </div>

          {/* Team Selection - Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block ml-1">선호 구단</label>
            <div className="relative">
              <select
                name="favoriteTeam"
                value={formData.favoriteTeam}
                onChange={handleInputChange}
                className="w-full appearance-none bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/50 transition-all text-sm cursor-pointer"
              >
                <option value="" disabled className="text-slate-500">응원하는 팀을 선택해주세요</option>
                {KBO_TEAMS.map(team => (
                  <option key={team} value={team} className="bg-slate-900 text-white py-2">
                    {team}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-xs flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              {error}
            </div>
          )}

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-brand-accent to-brand-primary hover:from-cyan-400 hover:to-blue-400 text-brand-dark font-black py-4 rounded-xl text-lg shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none"
            >
              {loading ? '가입 처리 중...' : '회원가입 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;