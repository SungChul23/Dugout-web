
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = "https://dugout.cloud";

const KBO_TEAMS = [
  'KIA 타이거즈', '삼성 라이온즈', 'LG 트윈스', '두산 베어스', 'KT 위즈',
  'SSG 랜더스', '한화 이글스', '롯데 자이언츠', 'NC 다이노스', '키움 히어로즈'
];

interface SignupProps {
  onCancel: () => void;
  onLoginSuccess: (nickname: string, favoriteTeam: string, teamSlogan?: string) => void;
  onFindTeamClick: () => void;
}

const Signup: React.FC<SignupProps> = ({ onCancel, onLoginSuccess, onFindTeamClick }) => {
  const [formData, setFormData] = useState({
    nickname: '',
    email: '',
    password: '',
    confirmPassword: '',
    favoriteTeamName: '',
  });

  const [checkingId, setCheckingId] = useState(false);
  const [idAvailable, setIdAvailable] = useState<boolean | null>(null);
  const [nicknameMessage, setNicknameMessage] = useState<string>(''); // 서버 메시지 저장
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [shake, setShake] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'nickname') {
      setIdAvailable(null);
      setNicknameMessage('');
    }
  };

  const checkNickname = async () => {
    if (!formData.nickname) return;
    
    // Client-side validation: Only Korean, English allowed. No numbers, special chars, or spaces.
    const isValidNickname = /^[a-zA-Z가-힣]+$/.test(formData.nickname);
    
    if (!isValidNickname) {
      setIdAvailable(false);
      setNicknameMessage('닉네임은 공백, 숫자, 특수문자 없이 한글과 영문만 가능합니다.');
      triggerShake();
      return;
    }

    setCheckingId(true);
    setError(null);
    setNicknameMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/members/check-id?nickname=${encodeURIComponent(formData.nickname)}`);
      
      if (!response.ok) {
        throw new Error('서버 통신 오류가 발생했습니다.');
      }

      // NicknameCheckResponseDto: { isAvailable: boolean, message: string }
      const data = await response.json();
      
      // isAvailable 필드가 없는 경우 대비 (Jackson serialization issue 등)
      const available = data.isAvailable !== undefined ? data.isAvailable : data.available;
      
      setIdAvailable(!!available);
      setNicknameMessage(data.message || (available ? '사용 가능한 닉네임입니다.' : '이미 사용 중인 닉네임입니다.'));
      
      if (!available) {
        triggerShake();
      }
      
    } catch (err) {
      console.error(err);
      setError('닉네임 중복 확인 중 오류가 발생했습니다');
      setIdAvailable(null);
      triggerShake();
    } finally {
      setCheckingId(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    // Password validation: at least 8 chars, including letter and number
    const hasLetter = /[a-zA-Z]/.test(formData.password);
    const hasNumber = /\d/.test(formData.password);
    if (formData.password.length < 8 || !hasLetter || !hasNumber) {
      setError('비밀번호는 영문과 숫자를 포함하여 8자 이상이어야 합니다.');
      triggerShake();
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      triggerShake();
      return;
    }
    if (!formData.favoriteTeamName) {
      setError('선호 팀을 선택해주세요.');
      triggerShake();
      return;
    }
    if (idAvailable !== true) {
      setError('닉네임 중복 확인을 해주세요.');
      triggerShake();
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
          favoriteTeamName: formData.favoriteTeamName
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '회원가입에 실패했습니다.');
      }

      // AccessToken 저장
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }
      
      // RefreshToken은 HttpOnly Cookie로 처리됨

      setTimeout(() => {
        alert(`${formData.nickname}님 환영합니다! 자동으로 로그인되었습니다.`);
        setLoading(false);

        // 사용자가 입력한 정보를 우선 사용하여 로그인 상태 업데이트 (서버 응답 불일치 방지)
        // 응답 데이터에 teamSlogan이 있다면 사용
        onLoginSuccess(formData.nickname, formData.favoriteTeamName, data.teamSlogan);

        onCancel(); 
      }, 500);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || '회원가입 처리 중 오류가 발생했습니다.');
      triggerShake();
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
        animate={{ 
          scale: 1, 
          opacity: 1, 
          y: 0,
          x: shake ? [0, -10, 10, -10, 10, 0] : 0 
        }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ 
          type: "spring", 
          duration: 0.5, 
          bounce: 0.3,
          x: { type: "tween", duration: 0.4 } 
        }}
        className="bg-[#0a0f1e]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-14 shadow-[0_40px_80px_rgba(0,0,0,0.7)] relative w-full max-w-2xl my-4 md:my-8 overflow-y-auto max-h-[90vh]"
      >
        {/* Background Glow Effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-brand-primary/20 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-brand-accent/10 rounded-full blur-[80px] pointer-events-none"></div>

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

        <div className="text-center mb-8 md:mb-12 relative z-10 mt-8 md:mt-0">
          <motion.h2 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-black text-white mb-2 md:mb-4 tracking-tight"
          >
            DUGOUT <span className="text-brand-accent font-light">Membership</span>
          </motion.h2>
          <motion.p 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-base font-light"
          >
            프로 수준의 데이터 분석과 예측, 지금 바로 시작하세요.
          </motion.p>
        </div>

        <form onSubmit={handleSignup} className="space-y-8 relative z-10">
          {/* Nickname Field */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <label className="text-base font-bold text-slate-400 uppercase tracking-wider block ml-1">닉네임</label>
            <div className="flex gap-4">
              <div className="relative group flex-1">
                <input
                  type="text"
                  name="nickname"
                  required
                  value={formData.nickname}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/50 transition-all text-base group-hover:border-white/20"
                  placeholder="사용하실 닉네임을 입력하세요"
                />
                <div className="absolute inset-0 rounded-2xl bg-brand-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
              <button
                type="button"
                onClick={checkNickname}
                disabled={checkingId || !formData.nickname}
                className="whitespace-nowrap bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold px-6 rounded-2xl transition-all text-sm border border-white/5 hover:border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {checkingId ? '확인 중...' : '중복 확인'}
              </button>
            </div>
            <AnimatePresence>
              {idAvailable === true && (
                <motion.p 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="text-sm text-green-400 ml-1 flex items-center gap-1 mt-1"
                >
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                  {nicknameMessage || '사용 가능한 닉네임입니다.'}
                </motion.p>
              )}
              {idAvailable === false && (
                <motion.p 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="text-sm text-red-400 ml-1 flex items-center gap-1 mt-1"
                >
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                  {nicknameMessage || '이미 사용 중인 닉네임입니다.'}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Email Field */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <label className="text-base font-bold text-slate-400 uppercase tracking-wider block ml-1">이메일</label>
            <div className="relative group">
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/50 transition-all text-base group-hover:border-white/20"
                placeholder="example@dugout.com"
              />
              <div className="absolute inset-0 rounded-2xl bg-brand-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
          </motion.div>

          {/* Password Fields */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="space-y-3">
              <label className="text-base font-bold text-slate-400 uppercase tracking-wider block ml-1">비밀번호</label>
              <div className="relative group">
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-brand-accent transition-all text-base group-hover:border-white/20"
                  placeholder="영문과 숫자를 포함하여 8자 이상"
                />
                <div className="absolute inset-0 rounded-2xl bg-brand-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-base font-bold text-slate-400 uppercase tracking-wider block ml-1">비밀번호 확인</label>
              <div className="relative group">
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-brand-accent transition-all text-base group-hover:border-white/20"
                  placeholder="비밀번호 재입력"
                />
                <div className="absolute inset-0 rounded-2xl bg-brand-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            </div>
          </motion.div>

          {/* Team Selection - Dropdown */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            <label className="text-base font-bold text-slate-400 uppercase tracking-wider block ml-1">선호 구단</label>
            <div className="relative group">
              <select
                name="favoriteTeamName"
                value={formData.favoriteTeamName}
                onChange={handleInputChange}
                className="w-full appearance-none bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/50 transition-all text-base cursor-pointer group-hover:border-white/20"
              >
                <option value="" disabled className="text-slate-500">응원하는 팀을 선택해주세요</option>
                {KBO_TEAMS.map(team => (
                  <option key={team} value={team} className="bg-slate-900 text-white py-2">
                    {team}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-6 text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <div className="absolute inset-0 rounded-2xl bg-brand-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
            
            {/* Find My Team Link */}
            <div className="mt-3 flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse"></span>
                <span className="text-sm text-slate-400">아직 응원하는 팀을 못 고르셨나요?</span>
              </div>
              <button
                type="button"
                onClick={onFindTeamClick}
                className="text-sm font-bold text-brand-accent hover:text-white transition-colors flex items-center gap-1 group"
              >
                나의 팀 찾기
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
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
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-2xl text-red-400 text-sm flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="pt-6"
          >
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-brand-accent to-brand-primary hover:from-cyan-400 hover:to-blue-400 text-brand-dark font-black py-5 rounded-2xl text-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all transform hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 disabled:transform-none relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span className="relative z-10">
                {loading ? '가입 및 로그인 처리 중...' : '회원가입 완료 (자동 로그인)'}
              </span>
            </button>
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default Signup;
