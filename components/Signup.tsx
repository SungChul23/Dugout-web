
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api';

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
      const response = await api.get(`/api/v1/members/check-id?nickname=${encodeURIComponent(formData.nickname)}`);
      
      const data = response.data;
      
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
      const response = await api.post('/api/v1/members/signup', {
        nickname: formData.nickname,
        email: formData.email,
        password: formData.password,
        favoriteTeamName: formData.favoriteTeamName
      });

      const data = response.data;

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
      setError(err.response?.data?.message || err.message || '회원가입 처리 중 오류가 발생했습니다.');
      triggerShake();
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 bg-[#020617]/80 backdrop-blur-md overflow-y-auto"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ 
          scale: 1, 
          opacity: 1, 
          y: 0,
          x: shake ? [0, -10, 10, -10, 10, 0] : 0 
        }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        transition={{ 
          type: "spring", 
          duration: 0.6, 
          bounce: 0.2,
          x: { type: "tween", duration: 0.4 } 
        }}
        className="bg-[#0a0f1e] border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] relative w-full max-w-6xl flex flex-col md:flex-row overflow-hidden min-h-[760px] max-h-[95vh]"
      >
        {/* Left Side: Branding / Guide */}
        <div className="hidden md:flex md:w-[45%] bg-gradient-to-br from-[#0f172a] via-brand-dark to-[#020617] p-8 lg:p-12 flex-col justify-between relative border-r border-white/5">
           {/* Decorative elements */}
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
           <div className="absolute top-[-20%] left-[-20%] w-[400px] h-[400px] bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
           <div className="absolute bottom-[-20%] right-[-20%] w-[400px] h-[400px] bg-brand-accent/5 rounded-full blur-[100px] pointer-events-none"></div>
           
           <div className="relative z-10 h-full flex flex-col">
             <div className="mb-6">
               <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-accent/10 border border-brand-accent/20 mb-4">
                 <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse"></span>
                 <span className="text-[10px] font-bold text-brand-accent uppercase tracking-widest">Premium Analytics</span>
               </div>
               <h2 className="text-4xl lg:text-5xl font-black text-white mb-4 tracking-tighter leading-tight">
                 DUGOUT <br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-cyan-300">만의 차별점</span>
               </h2>
               <p className="text-slate-400 text-lg leading-relaxed font-light max-w-md">
                 더그아웃은 단순한 기록 제공을 넘어, AI 기반의 심층 분석과 예측을 통해 야구를 보는 새로운 시각을 제공합니다.
               </p>
             </div>

             <div className="flex-1 flex flex-col justify-center py-4">
               <ul className="space-y-8">
                 {[
                   { icon: '📈', title: '선수 미래 성적 예측', color: 'brand-accent' },
                   { icon: '🏷️', title: 'FA 시장 등급 분석', color: 'blue-400' },
                   { icon: '📊', title: '나만의 대시보드', color: 'purple-400' },
                   { icon: '🏆', title: '골든글러브 예측', color: 'amber-400' }
                 ].map((item, idx) => (
                   <motion.li 
                     key={idx}
                     initial={{ x: -20, opacity: 0 }}
                     animate={{ x: 0, opacity: 1 }}
                     transition={{ delay: 0.4 + idx * 0.1 }}
                     className="flex items-center gap-4 group"
                   >
                     <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/10 group-hover:border-${item.color}/30 transition-colors`}>
                       <span className="text-xl">{item.icon}</span>
                     </div>
                     <div>
                       <h4 className="text-white font-bold text-lg group-hover:text-brand-accent transition-colors">{item.title}</h4>
                     </div>
                   </motion.li>
                 ))}
               </ul>
             </div>
             
             <div className="mt-6 pt-6 border-t border-white/5">
               <p className="text-brand-accent/80 text-sm font-medium mb-2">
                 회원가입 후, 더그아웃의 핵심 분석 기능을 이용할 수 있습니다.
               </p>
               <div className="flex items-center gap-3 text-slate-500 italic text-sm">
                 <span className="text-2xl text-white/10">"</span>
                 기록은 과거를 남기고, 데이터는 다음 경기를 준비한다.
                 <span className="text-2xl text-white/10">"</span>
               </div>
             </div>
           </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-[55%] p-8 lg:p-12 relative flex flex-col bg-[#0a0f1e] overflow-y-auto no-scrollbar">
          {/* Top Close Button */}
          <button 
            onClick={onCancel}
            className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-all z-20"
            aria-label="닫기"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="mb-8 relative z-10">
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex items-center gap-3 mb-2"
            >
              <div className="h-[1px] w-8 bg-brand-accent/50"></div>
              <span className="text-brand-accent text-xs font-bold uppercase tracking-[0.4em]">Registration</span>
            </motion.div>
            <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight mb-2">
              DUGOUT <span className="text-slate-500 font-light italic">Join</span>
            </h2>
            <p className="text-slate-400 text-base font-light">
              기록, 분석, 예측까지 이어지는 더그아웃.
            </p>
          </div>

          <form onSubmit={handleSignup} className="flex-1 space-y-5 relative z-10 pr-2">
            {/* Nickname Field */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">닉네임</label>
              <div className="flex gap-3">
                <div className="relative group flex-1">
                  <input
                    type="text"
                    name="nickname"
                    required
                    value={formData.nickname}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-brand-accent transition-all text-base group-hover:border-white/20"
                    placeholder="사용하실 닉네임을 입력하세요"
                  />
                </div>
                <button
                  type="button"
                  onClick={checkNickname}
                  disabled={checkingId || !formData.nickname}
                  className="whitespace-nowrap bg-brand-accent/10 hover:bg-brand-accent/20 disabled:opacity-50 text-brand-accent font-bold px-6 rounded-xl transition-all text-sm border border-brand-accent/20"
                >
                  {checkingId ? '...' : '중복 확인'}
                </button>
              </div>
              <AnimatePresence>
                {nicknameMessage && (
                  <motion.p 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className={`text-xs ml-1 mt-1 flex items-center gap-2 ${idAvailable ? 'text-green-400' : 'text-red-400'}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${idAvailable ? 'bg-green-400' : 'bg-red-400'}`}></span>
                    {nicknameMessage}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">이메일</label>
              <div className="relative group">
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-brand-accent transition-all text-base group-hover:border-white/20"
                  placeholder="example@dugout.com"
                />
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">비밀번호</label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-brand-accent transition-all text-base group-hover:border-white/20"
                  placeholder="영문+숫자 8자 이상"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">비밀번호 확인</label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-brand-accent transition-all text-base group-hover:border-white/20"
                  placeholder="비밀번호 재입력"
                />
              </div>
            </div>

            {/* Team Selection */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">선호 구단</label>
              <div className="relative group">
                <select
                  name="favoriteTeamName"
                  value={formData.favoriteTeamName}
                  onChange={handleInputChange}
                  className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-brand-accent transition-all text-base cursor-pointer group-hover:border-white/20"
                >
                  <option value="" disabled className="text-slate-500">응원하는 팀을 선택해주세요</option>
                  {KBO_TEAMS.map(team => (
                    <option key={team} value={team} className="bg-[#0f172a] text-white">
                      {team}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-brand-accent/10 rounded-xl border border-brand-accent/20 mt-3 shadow-sm">
                <span className="text-sm font-medium text-slate-300">아직 응원하는 팀을 못 고르셨나요?</span>
                <button
                  type="button"
                  onClick={onFindTeamClick}
                  className="text-sm font-black text-brand-accent hover:text-cyan-300 hover:underline flex items-center gap-1.5 transition-colors"
                >
                  나의 팀 찾기 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
              </motion.div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-brand-accent to-brand-primary text-brand-dark font-black py-4 rounded-xl text-base shadow-lg shadow-brand-accent/20 hover:shadow-brand-accent/40 transition-all transform hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? '처리 중...' : '회원가입 완료 (자동 로그인)'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Signup;
