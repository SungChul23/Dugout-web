import React, { useState, useEffect, useRef, useMemo } from 'react';
import { api } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { PostseasonBackground } from './PostseasonBackground';
import { POSTSEASON_RULES, PostseasonRoundRule } from './postseasonRules';
import { TEAMS } from '../constants';

interface TeamStat {
  rankingDate?: string;
  teamId: number;
  teamName: string;
  teamRank: number;
  winRate: number;
  gamesBehind?: number;
  wins?: number;
  losses?: number;
  draws?: number;
  gamesPlayed?: number;
  totalGames?: number;
  homeRecord?: string;
  awayRecord?: string;
  recent10games?: string;
  last10games?: string;
  streak?: string;
}

interface Matchup {
  round: 'WILD_CARD' | 'SEMI_PLAYOFF' | 'PLAYOFF' | 'KOREAN_SERIES';
  higherSeedTeamId: number | null;
  higherSeedTeamName: string | null;
  lowerSeedTeamId: number | null;
  lowerSeedTeamName: string | null;
}

interface BracketData {
  top5Teams: TeamStat[];
  matchups: Matchup[];
}

interface TopPlayer {
  playerName: string;
  avg?: number;
  hr?: number;
  ops?: number;
  era?: number;
  w?: number;
  so?: number;
}

interface TeamTopPlayers {
  teamId: number;
  teamName: string;
  topBatters: TopPlayer[];
  topPitchers: TopPlayer[];
}

interface DetailedTeamStats {
  winRate: number;
  avg: number;
  era: number;
  hr: number;
  ops: number;
  starterEra: number;
  bullpenEra: number;
}

interface TeamOverview {
  teamId: number;
  teamName: string;
  slogan: string | null;
  stadiumName: string;
  championshipCount: number | null;
  season: number;
  teamRank: number;
  winRate: number;
  wins: number;
  losses: number;
  draws: number;
  teamAvg: number | null;
  teamAvgRank?: number | null;
  teamEra: number | null;
  teamEraRank?: number | null;
  teamHr: number | null;
  teamHrRank?: number | null;
  homeRecord: { wins: number; losses: number; draws: number } | null;
  awayRecord: { wins: number; losses: number; draws: number } | null;
  summary: string | null;
}

interface TeamRankTrendItem {
  rankingDate: string;
  teamId: number;
  teamName?: string;
  teamRank: number | null;
  wins: number;
  losses: number;
  draws: number;
  winRate: number | null;
  gamesBehind: number | null;
  gamesPlayed?: number;
  totalGames?: number;
  streak?: string;
  recent10games?: string;
  last10games?: string;
  homeRecord?: string;
  awayRecord?: string;
}

interface PostseasonProps {
  onCancel: () => void;
  user: { nickname: string; favoriteTeam?: string } | null;
}

const ROUND_KEYS: ('WILD_CARD' | 'SEMI_PLAYOFF' | 'PLAYOFF' | 'KOREAN_SERIES')[] = [
  'WILD_CARD',
  'SEMI_PLAYOFF',
  'PLAYOFF',
  'KOREAN_SERIES'
];

const FALLBACK_BRACKET: BracketData = {
  top5Teams: [
    { teamId: 5, teamName: "KIA 타이거즈", teamRank: 1, winRate: 0.612, wins: 88, losses: 56, recent10games: "7-0-3", streak: "3연승" },
    { teamId: 1, teamName: "삼성 라이온즈", teamRank: 2, winRate: 0.543, wins: 78, losses: 65, recent10games: "6-1-3", streak: "1패" },
    { teamId: 3, teamName: "LG 트윈스", teamRank: 3, winRate: 0.528, wins: 76, losses: 68, recent10games: "5-2-3", streak: "2연승" },
    { teamId: 2, teamName: "두산 베어스", teamRank: 4, winRate: 0.515, wins: 74, losses: 70, recent10games: "6-4-0", streak: "1승" },
    { teamId: 10, teamName: "KT 위즈", teamRank: 5, winRate: 0.493, wins: 71, losses: 73, recent10games: "8-2-0", streak: "4연승" },
  ],
  matchups: [
    { round: "WILD_CARD", higherSeedTeamId: 2, higherSeedTeamName: "두산 베어스", lowerSeedTeamId: 10, lowerSeedTeamName: "KT 위즈" },
    { round: "SEMI_PLAYOFF", higherSeedTeamId: 3, higherSeedTeamName: "LG 트윈스", lowerSeedTeamId: null, lowerSeedTeamName: "TBD" },
    { round: "PLAYOFF", higherSeedTeamId: 1, higherSeedTeamName: "삼성 라이온즈", lowerSeedTeamId: null, lowerSeedTeamName: "TBD" },
    { round: "KOREAN_SERIES", higherSeedTeamId: 5, higherSeedTeamName: "KIA 타이거즈", lowerSeedTeamId: null, lowerSeedTeamName: "TBD" }
  ]
};

const FOUNDING_YEARS: Record<number, string> = {
  1: "1982년 창단",
  2: "1982년 창단",
  3: "1990년 창단",
  4: "1982년 창단",
  5: "1982년 창단",
  6: "1986년 창단",
  7: "2021년 창단",
  8: "2008년 창단",
  9: "2011년 창단",
  10: "2013년 창단"
};

// 2026시즌 구단별 종합 스탯 데이터베이스
const TEAM_DETAILED_STATS: Record<string, DetailedTeamStats> = {
  "KIA 타이거즈": { winRate: 0.612, avg: 0.288, era: 3.82, hr: 168, ops: 0.812, starterEra: 3.65, bullpenEra: 4.02 },
  "삼성 라이온즈": { winRate: 0.543, avg: 0.269, era: 4.15, hr: 185, ops: 0.785, starterEra: 4.05, bullpenEra: 4.28 },
  "LG 트윈스": { winRate: 0.528, avg: 0.283, era: 3.92, hr: 115, ops: 0.778, starterEra: 3.88, bullpenEra: 3.96 },
  "두산 베어스": { winRate: 0.515, avg: 0.276, era: 4.28, hr: 142, ops: 0.762, starterEra: 4.20, bullpenEra: 4.38 },
  "KT 위즈": { winRate: 0.493, avg: 0.271, era: 4.35, hr: 138, ops: 0.755, starterEra: 4.30, bullpenEra: 4.41 },
  "SSG 랜더스": { winRate: 0.489, avg: 0.268, era: 4.42, hr: 152, ops: 0.750, starterEra: 4.35, bullpenEra: 4.52 },
  "한화 이글스": { winRate: 0.470, avg: 0.262, era: 4.48, hr: 130, ops: 0.738, starterEra: 4.40, bullpenEra: 4.60 },
  "롯데 자이언츠": { winRate: 0.465, avg: 0.274, era: 4.62, hr: 122, ops: 0.745, starterEra: 4.55, bullpenEra: 4.72 },
  "NC 다이노스": { winRate: 0.450, avg: 0.265, era: 4.58, hr: 140, ops: 0.740, starterEra: 4.50, bullpenEra: 4.68 },
  "키움 히어로즈": { winRate: 0.415, avg: 0.258, era: 4.85, hr: 104, ops: 0.710, starterEra: 4.80, bullpenEra: 4.92 },
};

// 2026시즌 상대 전적 및 관전 포인트 데이터베이스
const MATCHUP_H2H_DATABASE: Record<string, { higherWins: number; lowerWins: number; draws: number; summary: string; points: string[] }> = {
  "두산 베어스vsKT 위즈": {
    higherWins: 9,
    lowerWins: 7,
    draws: 0,
    summary: "정규시즌 16차전에서 두산이 9승 7패로 근소한 우위를 점했습니다. 두산의 선발 마운드와 KT의 불펜진 및 후반기 무서운 상승세가 정면 충돌합니다.",
    points: [
      "두산: 에이스 곽빈의 활약과 양의지-김재환 중심 타선의 장타력 방출 여부",
      "KT: 로하스-강백호 테이블 세터진의 출루율 및 고영표-엄상백 선발 투수진의 안정감",
      "와일드카드 특성: 4위 두산은 1승 또는 1무승부만 거둬도 준플레이오프 진출 확정"
    ]
  },
  "LG 트윈스vsKT 위즈": {
    higherWins: 10,
    lowerWins: 6,
    draws: 0,
    summary: "LG가 2026 정규시즌 KT를 상대로 10승 6패 우세를 기록했습니다. 출루율 1위 LG 타선과 KT의 끈질긴 경기 운영 능력이 관전 포인트입니다.",
    points: [
      "LG: 홍창기-오스틴으로 이어지는 출루 및 타점 생산력과 필승조 유영찬의 마무리 능력",
      "KT: 체력적 열세를 극복할 베테랑 선수들의 경험과 주자 견제 능력",
      "준플레이오프 5전 3선승제: 1·2차전 기선 제압이 시리즈 전체의 향방 결정"
    ]
  },
  "LG 트윈스vs두산 베어스": {
    higherWins: 9,
    lowerWins: 7,
    draws: 0,
    summary: "서울 라이벌전! 정규시즌 LG가 9승 7패로 한 발 앞섰으나, 잠실구장을 공유하는 두 팀의 상대 전적은 언제나 박빙이었습니다.",
    points: [
      "LG: 잠실 라이벌전 특유의 긴장감 속 투수진의 사사구 최소화",
      "두산: 강승호-김재환의 잠실 담장을 넘기는 한 방과 불펜 운용",
      "잠실구장 홈/원정 이점이 사실상 없는 최고 몰입도의 라이벌 매치업"
    ]
  },
  "삼성 라이온즈vsLG 트윈스": {
    higherWins: 8,
    lowerWins: 8,
    draws: 0,
    summary: "2026 정규시즌 16차전 8승 8패 팽팽한 백중세! 대구 삼성라이온즈파크의 홈런 타선과 LG의 기동력·불펜진이 격돌합니다.",
    points: [
      "삼성: 구자욱-디아즈-김영웅 중심 타선의 홈런포 가동 여부 및 원태인 선발 피칭",
      "LG: 임찬규-엔스 1·2선발의 피안타율 관리 및 촘촘한 야수 수비진",
      "플레이오프 5전 3선승제: 홈런 타자들의 장타 한 방이 승부의 흐름을 좌우"
    ]
  },
  "KIA 타이거즈vs삼성 라이온즈": {
    higherWins: 12,
    lowerWins: 4,
    draws: 0,
    summary: "KIA가 정규시즌 삼성전 12승 4패로 강력한 상대 우위를 보였습니다. 88승으로 정규시즌을 제패한 KIA의 막강한 화력이 돋보입니다.",
    points: [
      "KIA: MVP급 활약 김도영의 발과 방망이, 제임스 네일-양현종 원투펀치의 압도적 피칭",
      "삼성: 라팍에서 발휘되는 가을야구 DNA와 불펜진의 완막 집중력",
      "한국시리즈 7전 4선승제: 1·2차전 KIA 광주 홈구장 주도권 싸움이 핵심"
    ]
  },
  "KIA 타이거즈vsLG 트윈스": {
    higherWins: 11,
    lowerWins: 5,
    draws: 0,
    summary: "KIA가 2026 정규시즌 LG 상대 11승 5패로 우세를 나타냈습니다. 전통의 라이벌 매치로서 광주와 잠실의 뜨거운 가을 열기가 기대됩니다.",
    points: [
      "KIA: 팀 OPS 1위 화력과 마무리 정해영의 안정감",
      "LG: 디펜딩 챔피언급 가을 경험과 조직적인 야구 운영",
      "한국시리즈 2-3-2 방식: 광주 1·2차전 결과가 우승 트로피의 임계점"
    ]
  }
};

const FALLBACK_TOP_PLAYERS: Record<number, TeamTopPlayers> = {
  1: {
    teamId: 1,
    teamName: "삼성 라이온즈",
    topBatters: [
      { playerName: "구자욱", avg: 0.343, hr: 33, ops: 1.044 },
      { playerName: "디아즈", avg: 0.282, hr: 21, ops: 0.935 },
      { playerName: "김영웅", avg: 0.252, hr: 28, ops: 0.812 }
    ],
    topPitchers: [
      { playerName: "원태인", era: 3.66, w: 15, so: 119 },
      { playerName: "레예스", era: 3.81, w: 11, so: 112 },
      { playerName: "오승환", era: 4.91, w: 3, so: 60 }
    ]
  },
  2: {
    teamId: 2,
    teamName: "두산 베어스",
    topBatters: [
      { playerName: "양의지", avg: 0.310, hr: 17, ops: 0.938 },
      { playerName: "김재환", avg: 0.273, hr: 29, ops: 0.865 },
      { playerName: "강승호", avg: 0.276, hr: 13, ops: 0.770 }
    ],
    topPitchers: [
      { playerName: "곽빈", era: 4.24, w: 15, so: 154 },
      { playerName: "시라카와", era: 4.70, w: 5, so: 56 },
      { playerName: "홍건희", era: 3.12, w: 4, so: 45 }
    ]
  },
  3: {
    teamId: 3,
    teamName: "LG 트윈스",
    topBatters: [
      { playerName: "오스틴", avg: 0.319, hr: 32, ops: 0.998 },
      { playerName: "홍창기", avg: 0.335, hr: 3, ops: 0.895 },
      { playerName: "문보경", avg: 0.301, hr: 22, ops: 0.880 }
    ],
    topPitchers: [
      { playerName: "임찬규", era: 3.83, w: 10, so: 103 },
      { playerName: "엔스", era: 4.19, w: 13, so: 157 },
      { playerName: "유영찬", era: 2.97, w: 7, so: 75 }
    ]
  },
  5: {
    teamId: 5,
    teamName: "KIA 타이거즈",
    topBatters: [
      { playerName: "김도영", avg: 0.347, hr: 38, ops: 1.067 },
      { playerName: "최형우", avg: 0.285, hr: 22, ops: 0.890 },
      { playerName: "소크라테스", avg: 0.310, hr: 26, ops: 0.920 }
    ],
    topPitchers: [
      { playerName: "제임스 네일", era: 2.53, w: 12, so: 138 },
      { playerName: "양현종", era: 3.10, w: 11, so: 115 },
      { playerName: "정해영", era: 2.45, w: 2, so: 58 }
    ]
  },
  10: {
    teamId: 10,
    teamName: "KT 위즈",
    topBatters: [
      { playerName: "로하스", avg: 0.329, hr: 32, ops: 0.990 },
      { playerName: "강백호", avg: 0.289, hr: 26, ops: 0.875 },
      { playerName: "황재균", avg: 0.268, hr: 11, ops: 0.750 }
    ],
    topPitchers: [
      { playerName: "고영표", era: 4.95, w: 6, so: 82 },
      { playerName: "엄상백", era: 4.88, w: 13, so: 120 },
      { playerName: "박영현", era: 3.52, w: 10, so: 87 }
    ]
  }
};

// KT 고유 팀 컬러 색상(Pure White #FFFFFF) 적용
const getTeamColor = (teamName: string | null): string => {
  if (!teamName || teamName === 'TBD') return '#64748b';
  
  if (teamName.includes('KT') || teamName.includes('케이티') || teamName.toLowerCase().includes('kt')) {
    return '#FFFFFF';
  }

  const found = TEAMS.find(t => 
    t.koreanName === teamName || 
    t.name.toLowerCase().includes(teamName.toLowerCase()) || 
    teamName.includes(t.code) ||
    (t.koreanName && teamName.includes(t.koreanName.split(' ')[0]))
  );
  
  if (!found) return '#d97706';
  if (found.color === '#FFFFFF') return '#FFFFFF';
  if (found.color === '#1A1748') return '#6366f1';
  if (found.color === '#1E3A8A') return '#3b82f6';
  if (found.color === '#570514') return '#e11d48';
  return found.color;
};

// KBO 구단 공식 영문명 매핑 헬퍼 함수
const getEnglishTeamName = (teamName: string | null): string => {
  if (!teamName || teamName === 'TBD') return 'KBO CLUB';
  const found = TEAMS.find(t => 
    t.koreanName === teamName || 
    t.name.toLowerCase().includes(teamName.toLowerCase()) || 
    teamName.includes(t.code) ||
    (t.koreanName && teamName.includes(t.koreanName.split(' ')[0]))
  );
  if (found) return found.name;
  if (teamName.includes('KIA')) return 'KIA TIGERS';
  if (teamName.includes('삼성')) return 'SAMSUNG LIONS';
  if (teamName.includes('LG')) return 'LG TWINS';
  if (teamName.includes('두산')) return 'DOOSAN BEARS';
  if (teamName.includes('KT')) return 'KT WIZ';
  if (teamName.includes('SSG')) return 'SSG LANDERS';
  if (teamName.includes('한화')) return 'HANWHA EAGLES';
  if (teamName.includes('롯데')) return 'LOTTE GIANTS';
  if (teamName.includes('NC')) return 'NC DINOS';
  if (teamName.includes('키움')) return 'KIWOOM HEROES';
  return 'KBO BASEBALL CLUB';
};

const CustomRankTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data: TeamRankTrendItem = payload[0].payload;
    return (
      <div className="p-3 rounded-xl bg-slate-950/95 border border-amber-500/40 shadow-2xl backdrop-blur-md text-xs space-y-1.5 font-sans min-w-[170px]">
        <div className="font-mono text-slate-300 font-bold border-b border-white/15 pb-1.5 flex justify-between gap-3">
          <span>📅 {data.rankingDate}</span>
          <span className="text-amber-400 font-black">정규 {data.teamRank}위</span>
        </div>
        <div className="text-slate-200 font-bold flex justify-between gap-3 pt-0.5">
          <span className="text-slate-400">성적</span>
          <span className="text-white font-mono font-black">{data.wins}승 {data.draws}무 {data.losses}패</span>
        </div>
        <div className="text-slate-200 font-bold flex justify-between gap-3">
          <span className="text-slate-400">승률</span>
          <span className="text-amber-300 font-mono font-black">{data.winRate != null ? data.winRate.toFixed(3) : '-'}</span>
        </div>
        <div className="text-slate-200 font-bold flex justify-between gap-3">
          <span className="text-slate-400">게임차</span>
          <span className="text-cyan-300 font-mono font-black">{data.gamesBehind != null ? `${data.gamesBehind} GB` : '-'}</span>
        </div>
      </div>
    );
  }
  return null;
};

const Postseason: React.FC<PostseasonProps> = ({ onCancel }) => {
  const [bracketData, setBracketData] = useState<BracketData>(FALLBACK_BRACKET);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRound, setSelectedRound] = useState<'WILD_CARD' | 'SEMI_PLAYOFF' | 'PLAYOFF' | 'KOREAN_SERIES'>('WILD_CARD');
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [teamTopPlayers, setTeamTopPlayers] = useState<TeamTopPlayers | null>(null);
  const [teamOverview, setTeamOverview] = useState<TeamOverview | null>(null);
  const [overviewError, setOverviewError] = useState<boolean>(false);
  const [rankTrend, setRankTrend] = useState<TeamRankTrendItem[] | null>(null);
  const [rankTrendError, setRankTrendError] = useState<boolean>(false);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [entranceAnimationDone, setEntranceAnimationDone] = useState<boolean>(false);

  // 팀 정보 모달 안에서의 active tab
  const [activeTeamTab, setActiveTeamTab] = useState<'profile' | 'players'>('profile');
  const [modalTab, setModalTab] = useState<'all' | 'trend' | 'overview' | 'players'>('all');

  // 메인 가을야구 페이지 뷰 탭 (5강 영광의 5개 구단 vs 토너먼트 대진표)
  const [postseasonTab, setPostseasonTab] = useState<'teams' | 'bracket'>('teams');

  // 26시즌 상대 전적 & 팀 전력 비교 모달 상태
  const [showComparisonModal, setShowComparisonModal] = useState<boolean>(false);

  // Touch Swipe Ref
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setEntranceAnimationDone(true);
    }, 1200);

    const fetchBracket = async () => {
      try {
        const res = await api.get('/api/v1/postseason/bracket');
        if (res.data && res.data.top5Teams) {
          setBracketData(res.data);
        }
      } catch (err) {
        console.warn("Using fallback postseason bracket data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBracket();

    return () => clearTimeout(timer);
  }, []);

  const changeRound = (newRound: 'WILD_CARD' | 'SEMI_PLAYOFF' | 'PLAYOFF' | 'KOREAN_SERIES') => {
    const curIdx = ROUND_KEYS.indexOf(selectedRound);
    const newIdx = ROUND_KEYS.indexOf(newRound);
    if (curIdx === newIdx) return;

    setSlideDirection(newIdx > curIdx ? 'right' : 'left');
    setSelectedRound(newRound);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedTeamId !== null || showComparisonModal) return;
      const curIdx = ROUND_KEYS.indexOf(selectedRound);
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        if (curIdx < ROUND_KEYS.length - 1) changeRound(ROUND_KEYS[curIdx + 1]);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        if (curIdx > 0) changeRound(ROUND_KEYS[curIdx - 1]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRound, selectedTeamId, showComparisonModal]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX.current - touchEndX;

    if (Math.abs(diffX) > 50) {
      const curIdx = ROUND_KEYS.indexOf(selectedRound);
      if (diffX > 0 && curIdx < ROUND_KEYS.length - 1) {
        changeRound(ROUND_KEYS[curIdx + 1]);
      } else if (diffX < 0 && curIdx > 0) {
        changeRound(ROUND_KEYS[curIdx - 1]);
      }
    }
    touchStartX.current = null;
  };

  const handleTeamClick = async (teamId: number | null) => {
    if (!teamId) return;
    setSelectedTeamId(teamId);
    setTeamOverview(null);
    setOverviewError(false);
    setTeamTopPlayers(null);
    setRankTrend(null);
    setRankTrendError(false);
    setActiveTeamTab('profile');
    setModalTab('all');
    setModalLoading(true);

    const [playersRes, overviewRes, rankTrendRes] = await Promise.allSettled([
      api.get(`/api/v1/postseason/teams/${teamId}/top-players`),
      api.get(`/api/v1/postseason/teams/${teamId}/overview`),
      api.get(`/api/v1/postseason/teams/${teamId}/rank-trend`)
    ]);

    if (playersRes.status === 'fulfilled' && playersRes.value?.data) {
      setTeamTopPlayers(playersRes.value.data);
    } else {
      setTeamTopPlayers(FALLBACK_TOP_PLAYERS[teamId] || null);
    }

    if (overviewRes.status === 'fulfilled' && overviewRes.value?.data) {
      setTeamOverview(overviewRes.value.data);
      setOverviewError(false);
    } else {
      setTeamOverview(null);
      setOverviewError(true);
    }

    if (rankTrendRes.status === 'fulfilled' && Array.isArray(rankTrendRes.value?.data)) {
      setRankTrend(rankTrendRes.value.data);
      setRankTrendError(false);
    } else {
      setRankTrend(null);
      setRankTrendError(true);
    }

    setModalLoading(false);
  };

  const validTrendData = useMemo(() => {
    if (!rankTrend) return [];
    return rankTrend.filter((item): item is TeamRankTrendItem & { teamRank: number } => item.teamRank !== null);
  }, [rankTrend]);

  const summaryStats = useMemo(() => {
    if (!validTrendData || validTrendData.length === 0) return null;
    const ranks = validTrendData.map(d => d.teamRank);
    const best = Math.min(...ranks);
    const worst = Math.max(...ranks);
    const current = validTrendData[validTrendData.length - 1].teamRank;
    return { best, worst, current };
  }, [validTrendData]);

  const currentMatchup = bracketData.matchups.find(m => m.round === selectedRound) || {
    round: selectedRound,
    higherSeedTeamId: null,
    higherSeedTeamName: 'TBD',
    lowerSeedTeamId: null,
    lowerSeedTeamName: 'TBD'
  };
  const currentRule: PostseasonRoundRule = POSTSEASON_RULES[selectedRound];

  const higherColor = getTeamColor(currentMatchup.higherSeedTeamName);
  const lowerColor = getTeamColor(currentMatchup.lowerSeedTeamName);

  // 5등 구단이 왼쪽에 오도록 5위 -> 4위 -> 3위 -> 2위 -> 1위 순 정렬
  const sortedTop5Teams = [...bracketData.top5Teams].sort((a, b) => b.teamRank - a.teamRank);

  // 매치업 두 구단 상대 전적 & 스탯 데이터 계산
  const getMatchupH2H = () => {
    const high = currentMatchup.higherSeedTeamName || '상위 구단';
    const low = currentMatchup.lowerSeedTeamName || '하위 구단';
    const key = `${high}vs${low}`;
    const reverseKey = `${low}vs${high}`;

    if (MATCHUP_H2H_DATABASE[key]) {
      return { ...MATCHUP_H2H_DATABASE[key], higherName: high, lowerName: low };
    } else if (MATCHUP_H2H_DATABASE[reverseKey]) {
      const rev = MATCHUP_H2H_DATABASE[reverseKey];
      return {
        higherWins: rev.lowerWins,
        lowerWins: rev.higherWins,
        draws: rev.draws,
        summary: rev.summary,
        points: rev.points,
        higherName: high,
        lowerName: low
      };
    }

    const highWins = currentRule.id === 'KOREAN_SERIES' ? 12 : 10;
    const lowWins = currentRule.id === 'KOREAN_SERIES' ? 4 : 6;
    return {
      higherWins: highWins,
      lowerWins: lowWins,
      draws: 0,
      summary: `${high}와(과) ${low}의 2026시즌 상대 전적 데이터입니다. 단기전 포스트시즌 선발 마운드와 핵심 타선의 파괴력이 승부처가 될 전망입니다.`,
      points: [
        `${high}: 상위 시드 홈경기 우위와 정규시즌 안정적인 팀 밸런스`,
        `${low}: 단기전 기선 제압을 위한 에이스 투수 투입 및 타선의 집중력`,
        `2026 포스트시즌 승리와 시리즈 진출을 위한 맞대결 전력 분석`
      ],
      higherName: high,
      lowerName: low
    };
  };

  const h2hData = getMatchupH2H();
  const higherStats = TEAM_DETAILED_STATS[currentMatchup.higherSeedTeamName || ''] || { winRate: 0.580, avg: 0.280, era: 3.90, hr: 150, ops: 0.790, starterEra: 3.80, bullpenEra: 4.10 };
  const lowerStats = TEAM_DETAILED_STATS[currentMatchup.lowerSeedTeamName || ''] || { winRate: 0.510, avg: 0.272, era: 4.20, hr: 135, ops: 0.758, starterEra: 4.15, bullpenEra: 4.25 };

  const renderLeagueRankBadge = (rank: number | null | undefined) => {
    if (rank == null) return null;
    
    let colorClasses = '';
    if (rank >= 1 && rank <= 3) {
      colorClasses = 'bg-amber-500/25 text-amber-300 border-amber-500/60 font-black shadow-[0_0_8px_rgba(245,158,11,0.3)]';
    } else if (rank >= 4 && rank <= 7) {
      colorClasses = 'bg-cyan-500/25 text-cyan-300 border-cyan-500/50 font-bold';
    } else {
      colorClasses = 'bg-slate-800/80 text-slate-400 border-slate-700/60 font-medium';
    }

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] md:text-xs border shrink-0 ${colorClasses}`}>
        리그 {rank}위
      </span>
    );
  };

  const displayTeamName = teamOverview?.teamName || teamTopPlayers?.teamName || bracketData.top5Teams.find(t => t.teamId === selectedTeamId)?.teamName || "KBO 구단";
  const currentTeamColor = selectedTeamId ? getTeamColor(displayTeamName) : '#f59e0b';

  return (
    <PostseasonBackground>
      {/* Immersive Entrance Animation Overlay */}
      <AnimatePresence>
        {!entranceAnimationDone && (
          <motion.div 
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6 } }}
            className="fixed inset-0 z-50 bg-[#020617] flex flex-col items-center justify-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-amber-950/40 via-red-950/20 to-transparent pointer-events-none"></div>
            
            <motion.div 
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1.05, opacity: 1 }}
              transition={{ duration: 1.0, ease: "easeOut" }}
              className="text-center z-10 px-6 max-w-3xl"
            >
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-400 font-bold text-base mb-6 animate-pulse">
                <span>🍁</span> 2026 KBO POSTSEASON STADIUM
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-tight">
                가을야구의 전율 속으로 <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-500">
                  입장하고 있습니다
                </span>
              </h1>
              <p className="text-slate-300 text-lg md:text-xl font-medium">
                관중들의 우렁찬 함성과 함께 5강 팀들의 치열한 토너먼트가 펼쳐집니다.
              </p>
              
              <div className="mt-10 flex justify-center gap-3">
                <span className="w-4 h-4 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0s' }}></span>
                <span className="w-4 h-4 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-4 h-4 rounded-full bg-red-500 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-[1750px] mx-auto py-8 md:py-10 px-4 md:px-8 lg:px-12 relative z-10">
        {/* Header Navigation & Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-white/15 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-sm font-extrabold mb-3 shadow-md">
              <span>🍁</span> 2026 KBO POSTSEASON BRACKET
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight flex items-center gap-4">
              가을야구 토너먼트 
              <span className="text-amber-400 font-black text-3xl md:text-5xl tracking-normal">
                POSTSEASON
              </span>
            </h1>
            <p className="text-slate-200 text-base md:text-lg font-medium mt-2">
              정규시즌 상위 5개 구단이 펼치는 가을야구 단계별 대진표 및 2026시즌 상대 전적 분석입니다.
            </p>
          </div>

          <button 
            onClick={onCancel}
            className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-base font-black transition-all flex items-center gap-3 shadow-xl hover:scale-105"
          >
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            메인 홈으로 돌아가기
          </button>
        </div>

        {/* Primary View Selector Tabs (페이지 분리 / 탭 스위처) */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10 border-b border-white/15 pb-8">
          <button
            onClick={() => setPostseasonTab('teams')}
            className={`px-7 py-4 rounded-2xl font-black text-base md:text-xl transition-all flex items-center gap-3 shadow-2xl ${
              postseasonTab === 'teams'
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-slate-950 ring-4 ring-amber-300/60 shadow-amber-500/35 scale-105'
                : 'bg-slate-900/90 hover:bg-white/10 text-slate-300 border border-white/20'
            }`}
          >
            <span className="text-2xl">🏆</span>
            <span>2026 정규시즌 TOP 5 영광의 5강</span>
            <span className="px-3 py-1 rounded-full bg-slate-950/50 text-xs md:text-sm font-mono font-bold text-amber-300 border border-amber-500/30">
              5개 구단
            </span>
          </button>

          <button
            onClick={() => setPostseasonTab('bracket')}
            className={`px-7 py-4 rounded-2xl font-black text-base md:text-xl transition-all flex items-center gap-3 shadow-2xl ${
              postseasonTab === 'bracket'
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-slate-950 ring-4 ring-amber-300/60 shadow-amber-500/35 scale-105'
                : 'bg-slate-900/90 hover:bg-white/10 text-slate-300 border border-white/20'
            }`}
          >
            <span className="text-2xl">🍁</span>
            <span>포스트시즌 토너먼트 대진표</span>
            <span className="px-3 py-1 rounded-full bg-slate-950/50 text-xs md:text-sm font-mono font-bold text-cyan-300 border border-cyan-500/30">
              단계별 대진
            </span>
          </button>
        </div>

        {/* VIEW 1: 🏆 2026 정규시즌 TOP 5 영광의 5강 (시원시원한 세로 나열 카드) */}
        {postseasonTab === 'teams' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div className="bg-slate-900/80 backdrop-blur-2xl border-2 border-amber-500/40 rounded-3xl p-6 md:p-10 shadow-[0_0_50px_rgba(245,158,11,0.2)]">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-white/15 pb-6">
                <div>
                  <h2 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 flex items-center gap-3 tracking-tight">
                    <span className="text-3xl md:text-4xl animate-pulse">🏆</span> 2026 KBO 정규시즌 TOP 5 영광의 5강
                  </h2>
                  <p className="text-slate-300 text-sm md:text-base font-medium mt-2">
                    치열한 정규시즌 144경기를 뚫고 포스트시즌 진출 티켓을 획득한 5개 구단의 명예로운 기록입니다.
                  </p>
                </div>
                <span className="text-xs md:text-sm text-amber-300 font-extrabold bg-amber-500/15 px-4 py-2 rounded-full border border-amber-500/40">
                  💡 구단 카드를 클릭하면 상세 프로필 & 전력 대시보드가 열립니다
                </span>
              </div>

              {/* 세로 나열 5강 구단 시원시원한 대형 카드 */}
              <div className="space-y-5 md:space-y-6">
                {[...bracketData.top5Teams].sort((a, b) => a.teamRank - b.teamRank).map((team) => {
                  const teamColor = getTeamColor(team.teamName);
                  const isFirstRank = team.teamRank === 1;

                  const rankLabels: Record<number, string> = {
                    1: "정규시즌 1위 · 한국시리즈 직행 👑",
                    2: "정규시즌 2위 · 플레이오프 직행 🔥",
                    3: "정규시즌 3위 · 준플레이오프 직행 ⚡",
                    4: "정규시즌 4위 · 와일드카드 1승 어드밴티지 ⚾",
                    5: "정규시즌 5위 · 와일드카드 결정전 진출 🎯"
                  };

                  return (
                    <motion.div 
                      key={team.teamId}
                      onClick={() => handleTeamClick(team.teamId)}
                      whileHover={{ scale: 1.01 }}
                      style={{
                        borderColor: isFirstRank ? '#f59e0b' : (teamColor === '#FFFFFF' ? '#ffffff' : teamColor),
                        boxShadow: `0 0 30px ${teamColor === '#FFFFFF' ? 'rgba(255,255,255,0.25)' : `${teamColor}35`}`
                      }}
                      className={`p-6 md:p-8 rounded-3xl border-2 backdrop-blur-2xl transition-all cursor-pointer relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 shadow-2xl ${
                        isFirstRank 
                          ? 'bg-gradient-to-r from-amber-500/25 via-slate-900/95 to-slate-950/95 ring-2 ring-amber-400/50' 
                          : 'bg-gradient-to-r from-slate-900/95 via-slate-950/95 to-[#070c1d]'
                      }`}
                    >
                      {/* Left Accent Bar */}
                      <div 
                        className="w-2 absolute top-0 bottom-0 left-0" 
                        style={{ 
                          backgroundColor: teamColor,
                          boxShadow: `0 0 15px ${teamColor}` 
                        }} 
                      />

                      {/* Left Info: Rank Badge, Team Name, English Name */}
                      <div className="pl-3 space-y-2.5">
                        <div className="flex flex-wrap items-center gap-3">
                          <span 
                            className="px-3.5 py-1 rounded-xl text-xs md:text-sm font-black tracking-wider border shadow-md"
                            style={{ 
                              borderColor: teamColor === '#FFFFFF' ? '#ffffff' : teamColor, 
                              color: teamColor === '#FFFFFF' ? '#ffffff' : teamColor, 
                              backgroundColor: teamColor === '#FFFFFF' ? 'rgba(255,255,255,0.15)' : `${teamColor}22` 
                            }}
                          >
                            {rankLabels[team.teamRank] || `정규 ${team.teamRank}위`}
                          </span>

                          {selectedTeamId && FOUNDING_YEARS[team.teamId] && (
                            <span className="px-3 py-1 rounded-xl bg-white/10 text-xs font-mono font-bold text-slate-200 border border-white/15">
                              {FOUNDING_YEARS[team.teamId]}
                            </span>
                          )}
                        </div>

                        <h3 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tight leading-none">
                          {team.teamName.split(' ')[0]} <span style={{ color: teamColor === '#FFFFFF' ? '#ffffff' : teamColor }}>{team.teamName.split(' ')[1] || ''}</span>
                        </h3>
                        
                        <p className="text-xs md:text-sm text-slate-400 font-extrabold uppercase tracking-widest font-mono">
                          {getEnglishTeamName(team.teamName)}
                        </p>
                      </div>

                      {/* Center Stats Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto text-center font-mono">
                        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/15">
                          <span className="text-xs text-slate-400 font-bold block mb-0.5">승률</span>
                          <span className="text-xl md:text-2xl font-black text-amber-400 block">
                            {team.winRate.toFixed(3)}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/15">
                          <span className="text-xs text-slate-400 font-bold block mb-0.5">정규 성적</span>
                          <span className="text-sm md:text-base font-black text-white block">
                            {team.wins}승 {team.losses}패 {team.draws ?? 0}무
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/15">
                          <span className="text-xs text-slate-400 font-bold block mb-0.5">게임차</span>
                          <span className="text-xl md:text-2xl font-black text-cyan-400 block">
                            {team.gamesBehind != null ? `${team.gamesBehind}GB` : '-'}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/15">
                          <span className="text-xs text-slate-400 font-bold block mb-0.5">최근 10경기</span>
                          <span className="text-sm md:text-base font-black text-slate-200 block">
                            {team.recent10games || '-'}
                          </span>
                        </div>
                      </div>

                      {/* Right Action Button */}
                      <div className="w-full lg:w-auto shrink-0 flex justify-end">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTeamClick(team.teamId);
                          }}
                          className="w-full lg:w-auto px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm md:text-base transition-all flex items-center justify-center gap-2 shadow-lg hover:scale-105"
                        >
                          <span>📊 통합 분석 대시보드</span>
                          <span>➔</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Link to Tournament Bracket */}
            <div className="text-center pt-2">
              <button
                onClick={() => setPostseasonTab('bracket')}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 hover:bg-white/10 border-2 border-amber-500/40 text-amber-300 font-black text-lg transition-all shadow-xl hover:scale-105"
              >
                <span>🍁 단계별 토너먼트 대진표 보러가기</span>
                <span className="text-xl">➔</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* VIEW 2: 🍁 포스트시즌 토너먼트 대진표 */}
        {postseasonTab === 'bracket' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >

        {/* Overall Progress Flow Tabs */}
        <div className="mb-10 p-5 rounded-2xl bg-slate-950/80 border-2 border-white/15 backdrop-blur-md flex items-center justify-around overflow-x-auto gap-3">
          {ROUND_KEYS.map((rk, idx) => {
            const rule = POSTSEASON_RULES[rk];
            const isSelected = selectedRound === rk;
            const matchup = bracketData.matchups.find(m => m.round === rk);

            return (
              <React.Fragment key={rk}>
                <button
                  onClick={() => changeRound(rk)}
                  className={`flex items-center gap-3 px-5 py-3 rounded-xl text-sm md:text-base font-black transition-all whitespace-nowrap ${
                    isSelected 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-xl shadow-amber-500/25 scale-105 ring-2 ring-amber-300' 
                      : 'text-slate-300 hover:text-white bg-white/5 hover:bg-white/15'
                  }`}
                >
                  <span className="text-lg">{rule.badge.split(' ')[0]}</span>
                  <span>{rule.shortName}</span>
                  {matchup?.higherSeedTeamName && (
                    <span className="opacity-90 font-mono text-xs font-bold bg-black/30 px-2 py-0.5 rounded">
                      {matchup.higherSeedTeamName.split(' ')[0]}
                    </span>
                  )}
                </button>
                {idx < ROUND_KEYS.length - 1 && (
                  <span className="text-amber-500/80 text-lg font-black">➔</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Main Split View Section (Left: Stage List 35%, Right: Detailed Panel 65%) */}
        <div 
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* LEFT COLUMN: Stage Menu List */}
          <div className="lg:col-span-4 space-y-4">
            <div className="hidden lg:flex text-sm font-extrabold text-amber-400 uppercase tracking-wide px-1 mb-1 items-center gap-2">
              <span className="text-lg">🏟️</span> 포스트시즌 단계 선택 (키보드 ◀/▶)
            </div>

            {/* Desktop Vertical Menu */}
            <div className="hidden lg:flex flex-col gap-4">
              {ROUND_KEYS.map((rk) => {
                const rule = POSTSEASON_RULES[rk];
                const isSelected = selectedRound === rk;
                const matchup = bracketData.matchups.find(m => m.round === rk);

                return (
                  <div
                    key={rk}
                    onClick={() => changeRound(rk)}
                    className={`relative p-6 md:p-7 rounded-3xl border-2 transition-all cursor-pointer overflow-hidden backdrop-blur-2xl ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-950/60 via-orange-950/40 to-slate-900/95 border-amber-400 shadow-2xl shadow-amber-500/20 scale-[1.02]'
                        : 'bg-slate-900/70 border-white/15 hover:border-amber-400/50 hover:bg-slate-900/90'
                    }`}
                  >
                    {isSelected && (
                      <motion.div 
                        layoutId="activeBar"
                        className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-amber-400 via-orange-500 to-red-500"
                      />
                    )}

                    <div className="flex justify-between items-center mb-3">
                      <span className={`text-xs md:text-sm font-black px-3 py-1 rounded-full ${
                        isSelected ? 'bg-amber-400 text-slate-950 shadow' : 'bg-white/10 text-slate-200'
                      }`}>
                        {rule.badge}
                      </span>
                      <span className="text-xs md:text-sm font-mono text-amber-400 font-extrabold">
                        {rule.format}
                      </span>
                    </div>

                    <h3 className="text-2xl md:text-3xl font-black text-white mb-2">
                      {rule.name}
                    </h3>

                    <p className="text-xs md:text-sm text-slate-300 font-medium line-clamp-2 mb-4 leading-relaxed">
                      {rule.description}
                    </p>

                    <div className="pt-3 border-t border-white/15 flex justify-between items-center text-xs md:text-sm font-bold">
                      <span className="text-white">
                        {matchup?.higherSeedTeamName || 'TBD'} vs {matchup?.lowerSeedTeamName || 'TBD'}
                      </span>
                      <span className="text-amber-400 flex items-center gap-1 font-extrabold">
                        상세보기 ➔
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile Horizontal Scroll Tabs */}
            <div className="lg:hidden flex overflow-x-auto gap-3 pb-2 scrollbar-none">
              {ROUND_KEYS.map((rk) => {
                const rule = POSTSEASON_RULES[rk];
                const isSelected = selectedRound === rk;
                return (
                  <button
                    key={rk}
                    onClick={() => changeRound(rk)}
                    className={`flex-shrink-0 px-5 py-4 rounded-2xl border-2 text-sm font-black transition-all flex flex-col items-start gap-1 ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-xl'
                        : 'bg-slate-900/90 text-slate-200 border-white/15'
                    }`}
                  >
                    <span className="text-xs opacity-90">{rule.shortName}</span>
                    <span className="text-base font-black">{rule.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: Detailed Panel */}
          <div className="lg:col-span-8 min-h-[600px] relative overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={selectedRound}
                initial={{ opacity: 0, x: slideDirection === 'right' ? 80 : -80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: slideDirection === 'right' ? -80 : 80 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="bg-slate-900/85 border-2 border-amber-500/35 rounded-3xl p-8 md:p-10 backdrop-blur-2xl shadow-2xl relative"
              >
                {/* Round Badge Header */}
                <div className="flex flex-wrap justify-between items-center gap-4 mb-8 pb-6 border-b border-white/15">
                  <div>
                    <span className="px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-sm font-extrabold font-mono">
                      {currentRule.badge}
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black text-white mt-3 tracking-tight">
                      {currentRule.name}
                    </h2>
                  </div>

                  <div className="text-right">
                    <span className="text-sm md:text-base text-amber-400 font-mono font-extrabold block">
                      {currentRule.format}
                    </span>
                    <span className="text-xs md:text-sm text-slate-300 font-semibold">
                      {currentRule.statusText}
                    </span>
                  </div>
                </div>

                {/* Matchup Versus Cards Section */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm md:text-base font-extrabold text-amber-400 uppercase tracking-wide flex items-center gap-2">
                      <span className="text-lg">⚔️</span> 공식 대진 및 진출 구단
                    </h3>
                    <span className="text-xs text-slate-300 font-bold hidden sm:inline">구단 클릭 시 슬로건 & 주요 선수 확인</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Higher Seed Team Card */}
                    <div
                      onClick={() => handleTeamClick(currentMatchup.higherSeedTeamId)}
                      style={{
                        borderColor: higherColor === '#FFFFFF' ? '#ffffff' : `${higherColor}`,
                        boxShadow: `0 0 30px ${higherColor === '#FFFFFF' ? 'rgba(255,255,255,0.3)' : `${higherColor}30`}`
                      }}
                      className="p-6 md:p-8 rounded-3xl bg-slate-950/80 border-2 transition-all cursor-pointer group hover:scale-[1.02] relative overflow-hidden"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span 
                          className="text-xs md:text-sm font-black px-3 py-1 rounded shadow"
                          style={{ backgroundColor: higherColor, color: '#090d16' }}
                        >
                          상위 시드 (홈 우위)
                        </span>
                        <span className="text-xs md:text-sm text-slate-300 font-mono font-bold">
                          {currentRule.id === 'WILD_CARD' ? '4위 팀' : '상위 라운드 대기'}
                        </span>
                      </div>

                      <h4 className="text-3xl md:text-4xl font-black text-white group-hover:text-amber-300 transition-colors my-3">
                        {currentMatchup.higherSeedTeamName || 'TBD'}
                      </h4>

                      <p className="text-xs md:text-sm text-amber-400 flex items-center gap-2 font-extrabold">
                        <span>구단 프로필 & 선수단 확인</span>
                        <span className="group-hover:translate-x-1.5 transition-transform text-base">➔</span>
                      </p>
                    </div>

                    {/* Lower Seed Team Card */}
                    <div
                      onClick={() => currentMatchup.lowerSeedTeamId && handleTeamClick(currentMatchup.lowerSeedTeamId)}
                      style={{
                        borderColor: currentMatchup.lowerSeedTeamId 
                          ? (lowerColor === '#FFFFFF' ? '#ffffff' : `${lowerColor}`) 
                          : '#475569',
                        boxShadow: currentMatchup.lowerSeedTeamId 
                          ? `0 0 30px ${lowerColor === '#FFFFFF' ? 'rgba(255,255,255,0.3)' : `${lowerColor}30`}` 
                          : 'none'
                      }}
                      className={`p-6 md:p-8 rounded-3xl border-2 transition-all relative overflow-hidden ${
                        currentMatchup.lowerSeedTeamId
                          ? 'bg-slate-950/80 cursor-pointer group hover:scale-[1.02]'
                          : 'bg-slate-950/40 border-dashed opacity-75'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span 
                          className="text-xs md:text-sm font-black px-3 py-1 rounded shadow"
                          style={{ backgroundColor: lowerColor, color: '#090d16' }}
                        >
                          하위 시드 / 이전 승자
                        </span>
                        <span className="text-xs md:text-sm text-slate-300 font-mono font-bold">
                          {currentMatchup.lowerSeedTeamId ? '진출 확정' : '상대팀 결정 전'}
                        </span>
                      </div>

                      <h4 className={`text-3xl md:text-4xl font-black my-3 ${currentMatchup.lowerSeedTeamId ? 'text-white group-hover:text-amber-300' : 'text-slate-400 italic'}`}>
                        {currentMatchup.lowerSeedTeamName || 'TBD (상대팀 결정 전)'}
                      </h4>

                      <p className="text-xs md:text-sm text-amber-400 flex items-center gap-2 font-extrabold">
                        {currentMatchup.lowerSeedTeamId ? '구단 프로필 & 선수단 확인 ➔' : '전 라운드 승자 대기 중'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Prominent Button for 2026 Season H2H & Team Stats Comparison Analysis (비활성화 / 준비 중) */}
                <div className="mb-8">
                  <button
                    disabled
                    onClick={() => alert('상대 전적 & 팀 전력 비교 분석 서비스 준비 중입니다.')}
                    className="w-full py-4 px-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-slate-400 font-bold text-base md:text-lg flex items-center justify-center gap-3 cursor-not-allowed opacity-85 shadow-md"
                  >
                    <span className="text-xl">⚡</span>
                    <span>2026시즌 상대 전적 & 팀 전력 비교 분석</span>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs md:text-sm font-mono font-black border border-amber-500/30">
                      준비 중
                    </span>
                  </button>
                </div>

                {/* Special Advantage Diagram for Wildcard */}
                {selectedRound === 'WILD_CARD' && (
                  <div className="mb-8 p-6 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40">
                    <h4 className="text-sm md:text-base font-extrabold text-amber-300 mb-3 flex items-center gap-2">
                      <span className="text-lg">💡</span> 와일드카드 결정전 어드밴티지 규정
                    </h4>
                    <p className="text-xs md:text-sm text-slate-200 leading-relaxed mb-4 font-medium">
                      {currentRule.advantage}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-center text-xs md:text-sm font-mono">
                      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-amber-500/40">
                        <span className="text-amber-400 font-extrabold block mb-1 text-sm">4위 팀 진출 조건</span>
                        <span className="text-slate-200 font-bold">1차전 승리 or 무승부 (1경기 만에 확정)</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-white/20">
                        <span className="text-orange-400 font-extrabold block mb-1 text-sm">5위 팀 진출 조건</span>
                        <span className="text-slate-200 font-bold">1·2차전 모두 승리 (연승 필수)</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Games Schedule Timeline */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm md:text-base font-extrabold text-amber-400 uppercase tracking-wide flex items-center gap-2">
                      <span className="text-lg">📅</span> 경기 일정 및 홈/원정 배정 타임라인
                    </h3>
                    <span className="text-xs text-slate-300 font-mono font-bold">
                      {currentRule.homeNote}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
                    {currentRule.gamesTimeline.map((game) => {
                      const isHigherHome = game.homeType === 'HIGHER';
                      const homeTeamName = isHigherHome ? currentMatchup.higherSeedTeamName : currentMatchup.lowerSeedTeamName;
                      const gameColor = getTeamColor(homeTeamName);

                      return (
                        <div
                          key={game.gameNo}
                          style={{ borderColor: gameColor === '#FFFFFF' ? '#ffffff' : `${gameColor}80` }}
                          className="p-4 rounded-2xl bg-slate-950/90 border-2 text-center transition-all hover:bg-slate-900"
                        >
                          <span className="text-xs md:text-sm font-black text-amber-400 block mb-1">
                            {game.gameNo}차전
                          </span>
                          <span 
                            className="text-xs md:text-sm font-black px-2 py-1 rounded block truncate shadow my-1"
                            style={{ backgroundColor: gameColor, color: '#090d16' }}
                          >
                            {homeTeamName || '홈구장'}
                          </span>
                          {game.note && (
                            <span className="text-[11px] text-slate-300 block font-mono font-medium">
                              ({game.note})
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Korean Series Home Allocation Notice */}
                {selectedRound === 'KOREAN_SERIES' && (
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/20 text-xs md:text-sm text-slate-300 font-medium flex items-start gap-3">
                    <span className="text-amber-400 font-extrabold text-base">※</span>
                    <span>
                      한국시리즈 홈 배정은 KBO 공식 규정(2-3-2 방식)에 따라 1위 팀이 1·2·6·7차전 홈경기를 치릅니다.
                    </span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    )}

        {/* 상대 전적 비교분석 - 콤팩트 직사각형 모달 */}
        <AnimatePresence>
          {showComparisonModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 md:p-6 pt-20 md:pt-24 pb-6 overflow-y-auto"
              onClick={() => setShowComparisonModal(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="bg-[#090e22] border-2 border-amber-500/50 rounded-3xl max-w-5xl md:max-w-6xl w-full max-h-[85vh] flex flex-col shadow-[0_0_50px_rgba(245,158,11,0.25)] relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Sticky Header inside modal */}
                <div className="flex justify-between items-center p-5 md:p-6 border-b border-white/15 bg-[#090e22]/95 backdrop-blur-md shrink-0">
                  <div>
                    <span className="text-xs font-black text-amber-400 tracking-wider uppercase font-mono bg-amber-500/15 px-3 py-1 rounded-full border border-amber-500/30">
                      2026 POSTSEASON MATCHUP COMPARISON
                    </span>
                    <h2 className="text-xl md:text-3xl font-black text-white mt-1 flex items-center gap-3">
                      {currentRule.name} 맞대결 전력 비교
                      <span className="text-amber-400 text-xs md:text-sm font-extrabold font-mono px-3 py-0.5 bg-white/10 rounded-full">
                        와이드 대시보드
                      </span>
                    </h2>
                  </div>
                  <button 
                    onClick={() => setShowComparisonModal(false)}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all hover:scale-110"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                {/* Scrollable Rectangular Content Area */}
                <div className="p-5 md:p-7 overflow-y-auto flex-1 space-y-6">
                  {/* Matchup Teams Banner */}
                  <div className="grid grid-cols-11 items-center gap-2 p-4 rounded-2xl bg-slate-950/90 border border-white/15 text-center">
                    <div className="col-span-5 flex items-center justify-start gap-3 text-left px-2">
                      <span 
                        className="text-xs font-black px-3 py-1 rounded shadow"
                        style={{ backgroundColor: higherColor, color: '#090d16' }}
                      >
                        상위 시드
                      </span>
                      <div>
                        <h3 className="text-xl md:text-3xl font-black text-white truncate">
                          {h2hData.higherName}
                        </h3>
                        <span className="text-xs text-amber-400 font-mono font-bold">2026시즌 {higherStats.winRate.toFixed(3)}</span>
                      </div>
                    </div>

                    <div className="col-span-1 flex flex-col items-center justify-center">
                      <span className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 text-slate-950 font-black text-sm md:text-base flex items-center justify-center shadow-xl ring-2 ring-amber-300/50">
                        VS
                      </span>
                    </div>

                    <div className="col-span-5 flex items-center justify-end gap-3 text-right px-2">
                      <div>
                        <h3 className="text-xl md:text-3xl font-black text-white truncate">
                          {h2hData.lowerName}
                        </h3>
                        <span className="text-xs text-cyan-400 font-mono font-bold">2026시즌 {lowerStats.winRate.toFixed(3)}</span>
                      </div>
                      <span 
                        className="text-xs font-black px-3 py-1 rounded shadow"
                        style={{ backgroundColor: lowerColor, color: '#090d16' }}
                      >
                        하위 시드
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Grid Content */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Left Column (5 cols) */}
                    <div className="lg:col-span-5 space-y-5">
                      <div className="p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30">
                        <h4 className="text-sm md:text-base font-extrabold text-amber-300 mb-3 flex items-center gap-2">
                          <span className="text-lg">⚾</span> 2026 정규시즌 상대 전적 (16차전)
                        </h4>
                        
                        <div className="flex justify-between items-center bg-slate-950/80 p-3.5 rounded-xl mb-3 border border-white/10 text-center font-mono">
                          <div className="text-xl md:text-3xl font-black" style={{ color: higherColor === '#FFFFFF' ? '#ffffff' : higherColor }}>
                            {h2hData.higherWins}승
                          </div>
                          <div className="text-xs text-slate-400 font-bold px-2.5 py-0.5 bg-white/5 rounded-full">
                            {h2hData.draws > 0 ? `${h2hData.draws}무` : '0무'}
                          </div>
                          <div className="text-xl md:text-3xl font-black" style={{ color: lowerColor === '#FFFFFF' ? '#ffffff' : lowerColor }}>
                            {h2hData.lowerWins}승
                          </div>
                        </div>

                        <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex mb-3 border border-white/10">
                          <div 
                            style={{ 
                              width: `${(h2hData.higherWins / (h2hData.higherWins + h2hData.lowerWins || 1)) * 100}%`, 
                              backgroundColor: higherColor 
                            }} 
                            className="h-full transition-all"
                          />
                          <div 
                            style={{ 
                              width: `${(h2hData.lowerWins / (h2hData.higherWins + h2hData.lowerWins || 1)) * 100}%`, 
                              backgroundColor: lowerColor 
                            }} 
                            className="h-full transition-all"
                          />
                        </div>

                        <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-medium">
                          {h2hData.summary}
                        </p>
                      </div>

                      <div className="p-5 rounded-2xl bg-slate-950/80 border-2 border-white/15">
                        <h4 className="text-sm md:text-base font-extrabold text-amber-400 mb-3 flex items-center gap-2">
                          <span className="text-lg">🎯</span> 가을야구 관전 핵심 포인트
                        </h4>
                        <ul className="space-y-2.5">
                          {h2hData.points.map((pt, idx) => (
                            <li key={idx} className="text-xs md:text-sm text-slate-200 flex items-start gap-2 leading-relaxed font-medium">
                              <span className="text-amber-400 font-bold">•</span>
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Right Column (7 cols): Horizontal Comparative Gauge Bars */}
                    <div className="lg:col-span-7 bg-slate-950/80 p-5 md:p-6 rounded-2xl border-2 border-white/15">
                      <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
                        <h4 className="text-sm md:text-base font-extrabold text-amber-400 flex items-center gap-2">
                          <span className="text-lg">📊</span> 주요 팀 지표 1:1 가로 비교
                        </h4>
                        <div className="flex gap-3 text-xs font-mono font-extrabold">
                          <span style={{ color: higherColor === '#FFFFFF' ? '#ffffff' : higherColor }}>{h2hData.higherName}</span>
                          <span className="text-slate-500">vs</span>
                          <span style={{ color: lowerColor === '#FFFFFF' ? '#ffffff' : lowerColor }}>{h2hData.lowerName}</span>
                        </div>
                      </div>

                      <div className="space-y-3 font-mono">
                        {[
                          { label: "시즌 승률", val1: higherStats.winRate.toFixed(3), val2: lowerStats.winRate.toFixed(3), pct1: (higherStats.winRate / 0.7) * 100, pct2: (lowerStats.winRate / 0.7) * 100, higherBetter: higherStats.winRate >= lowerStats.winRate },
                          { label: "팀 타율", val1: higherStats.avg.toFixed(3), val2: lowerStats.avg.toFixed(3), pct1: (higherStats.avg / 0.32) * 100, pct2: (lowerStats.avg / 0.32) * 100, higherBetter: higherStats.avg >= lowerStats.avg },
                          { label: "팀 ERA", val1: higherStats.era.toFixed(2), val2: lowerStats.era.toFixed(2), pct1: ((5.5 - higherStats.era) / 2.5) * 100, pct2: ((5.5 - lowerStats.era) / 2.5) * 100, higherBetter: higherStats.era <= lowerStats.era },
                          { label: "팀 홈런", val1: `${higherStats.hr}개`, val2: `${lowerStats.hr}개`, pct1: (higherStats.hr / 200) * 100, pct2: (lowerStats.hr / 200) * 100, higherBetter: higherStats.hr >= lowerStats.hr },
                          { label: "팀 OPS", val1: higherStats.ops.toFixed(3), val2: lowerStats.ops.toFixed(3), pct1: (higherStats.ops / 0.9) * 100, pct2: (lowerStats.ops / 0.9) * 100, higherBetter: higherStats.ops >= lowerStats.ops },
                          { label: "선발 ERA", val1: higherStats.starterEra.toFixed(2), val2: lowerStats.starterEra.toFixed(2), pct1: ((5.5 - higherStats.starterEra) / 2.5) * 100, pct2: ((5.5 - lowerStats.starterEra) / 2.5) * 100, higherBetter: higherStats.starterEra <= lowerStats.starterEra },
                          { label: "불펜 ERA", val1: higherStats.bullpenEra.toFixed(2), val2: lowerStats.bullpenEra.toFixed(2), pct1: ((5.5 - higherStats.bullpenEra) / 2.5) * 100, pct2: ((5.5 - lowerStats.bullpenEra) / 2.5) * 100, higherBetter: higherStats.bullpenEra <= lowerStats.bullpenEra },
                        ].map((stat, i) => (
                          <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1.5">
                            <div className="flex justify-between items-center text-xs md:text-sm font-bold">
                              <span className={`font-mono font-black ${stat.higherBetter ? 'text-amber-400' : 'text-slate-300'}`}>
                                {stat.higherBetter && '👑 '} {stat.val1}
                              </span>

                              <span className="text-slate-200 font-sans text-xs text-center">
                                {stat.label}
                              </span>

                              <span className={`font-mono font-black ${!stat.higherBetter ? 'text-amber-400' : 'text-slate-300'}`}>
                                {stat.val2} {!stat.higherBetter && ' 👑'}
                              </span>
                            </div>

                            <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden flex border border-white/10">
                              <div 
                                style={{ width: `${Math.min(100, Math.max(10, stat.pct1))}%`, backgroundColor: higherColor }} 
                                className="h-full rounded-l-full transition-all opacity-90"
                              />
                              <div className="w-0.5 h-full bg-slate-700" />
                              <div 
                                style={{ width: `${Math.min(100, Math.max(10, stat.pct2))}%`, backgroundColor: lowerColor }} 
                                className="h-full rounded-r-full transition-all opacity-90"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sticky Footer */}
                <div className="p-4 border-t border-white/15 bg-[#090e22] shrink-0 flex flex-col sm:flex-row gap-3">
                  {currentMatchup.higherSeedTeamId && (
                    <button
                      onClick={() => {
                        setShowComparisonModal(false);
                        handleTeamClick(currentMatchup.higherSeedTeamId);
                      }}
                      className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs md:text-sm border border-white/20 transition-all"
                    >
                      {h2hData.higherName} 프로필 & 선수단 보기
                    </button>
                  )}

                  {currentMatchup.lowerSeedTeamId && (
                    <button
                      onClick={() => {
                        setShowComparisonModal(false);
                        handleTeamClick(currentMatchup.lowerSeedTeamId);
                      }}
                      className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs md:text-sm border border-white/20 transition-all"
                    >
                      {h2hData.lowerName} 프로필 & 선수단 보기
                    </button>
                  )}

                  <button 
                    onClick={() => setShowComparisonModal(false)}
                    className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs md:text-sm transition-all shadow-lg"
                  >
                    확인 완료
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 5강 구단 선택 시 통합 구단 대시보드 모달 (시원시원한 초대형 가로 확장 모달) */}
        <AnimatePresence>
          {selectedTeamId && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[150] bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 md:p-6 pt-20 md:pt-24 pb-6 overflow-y-auto"
              onClick={() => setSelectedTeamId(null)}
            >
              <motion.div 
                initial={{ scale: 0.94, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.94, y: 10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                style={{
                  borderColor: currentTeamColor === '#FFFFFF' ? '#ffffff' : currentTeamColor,
                  boxShadow: `0 0 50px ${currentTeamColor === '#FFFFFF' ? 'rgba(255,255,255,0.25)' : `${currentTeamColor}35`}`
                }}
                className="bg-[#070d1f] border-2 rounded-2xl md:rounded-3xl w-full max-w-6xl lg:max-w-7xl xl:max-w-[1550px] max-h-[85vh] md:max-h-[88vh] flex flex-col shadow-2xl relative overflow-hidden my-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Neon Top Bar Accent */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r z-10"
                  style={{
                    backgroundColor: currentTeamColor,
                    boxShadow: `0 0 15px ${currentTeamColor}`
                  }}
                />

                {/* Top-Right Corner Close (X) Button */}
                <button 
                  onClick={() => setSelectedTeamId(null)}
                  className="absolute top-3.5 right-3.5 md:top-4 md:right-4 z-30 p-2 md:p-2.5 rounded-full bg-slate-900/80 hover:bg-white/20 text-slate-300 hover:text-white transition-all hover:scale-110 border border-white/20 shadow-lg"
                  title="닫기"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Top Header Section & Horizontal Section Navigation Menu Bar */}
                <div className="p-4 md:p-6 pr-12 md:pr-16 border-b border-white/15 bg-[#070d1f]/95 backdrop-blur-md shrink-0 space-y-4">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="space-y-2 w-full">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-xs flex items-center gap-1.5 shadow-sm">
                          <span>HM</span> {teamOverview?.season || 2026} KBO 구단 대시보드
                        </span>
                        <span 
                          className="px-3 py-0.5 rounded-lg text-xs font-black tracking-wider border shadow-md"
                          style={{ 
                            borderColor: currentTeamColor === '#FFFFFF' ? '#ffffff' : currentTeamColor, 
                            color: currentTeamColor === '#FFFFFF' ? '#ffffff' : currentTeamColor, 
                            backgroundColor: currentTeamColor === '#FFFFFF' ? 'rgba(255,255,255,0.2)' : `${currentTeamColor}30` 
                          }}
                        >
                          정규 {teamOverview?.teamRank ?? (bracketData.top5Teams.find(t => t.teamId === selectedTeamId)?.teamRank || 5)}위 · {getEnglishTeamName(displayTeamName)}
                        </span>
                        {selectedTeamId && FOUNDING_YEARS[selectedTeamId] && (
                          <span className="px-2.5 py-0.5 rounded-lg bg-white/10 text-xs text-slate-200 font-mono font-black border border-white/15">
                            {FOUNDING_YEARS[selectedTeamId]}
                          </span>
                        )}
                      </div>

                      <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tight leading-tight">
                        {displayTeamName.split(' ')[0]} <span style={{ color: currentTeamColor === '#FFFFFF' ? '#ffffff' : currentTeamColor }}>{displayTeamName.split(' ')[1] || ''}</span>
                      </h2>

                      {/* Team Slogan */}
                      {teamOverview?.slogan && (
                        <div className="pt-0.5">
                          <div className="flex items-center gap-2 p-2.5 md:p-3 rounded-xl bg-black/40 border border-amber-500/30 backdrop-blur-md inline-flex shadow-md">
                            <svg className="w-4 h-4 md:w-5 md:h-5 text-amber-400/70 shrink-0 transform rotate-180" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.0548 14.5946 14.6596 15.6329 13.5651C16.8926 12.3023 18.5725 11.6667 21.0001 11.6667L21.0001 10.3333C18.6672 10.3333 16.9242 9.69769 15.6644 8.52906C14.6261 7.51909 14.0485 6.09503 14.0485 4L11.0485 4C11.0485 6.7454 11.8532 8.87708 13.4111 10.6667C12.0569 10.6667 10.7495 10.6667 9.98292 10.6667L9.98292 11.6667C10.6133 11.6667 11.7766 11.6667 12.969 11.6667C11.3813 13.5186 10.6133 15.6811 10.6133 18.25L10.6133 21L14.017 21ZM4.98292 21L4.98292 18C4.98292 16.0548 5.56052 14.6596 6.59877 13.5651C7.85848 12.3023 9.53837 11.6667 11.966 11.6667L11.966 10.3333C9.63309 10.3333 7.89012 9.69769 6.63032 8.52906C5.59207 7.51909 5.01446 6.09503 5.01446 4L2.01446 4C2.01446 6.7454 2.81912 8.87708 4.377 10.6667C3.02283 10.6667 1.71542 10.6667 0.948835 10.6667L0.948835 11.6667C1.57919 11.6667 2.74249 11.6667 3.93489 11.6667C2.34721 13.5186 1.57919 15.6811 1.57919 18.25L1.57919 21L4.98292 21Z" /></svg>
                            <p className="text-sm md:text-base text-amber-200 font-serif italic tracking-wide font-medium" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
                              "{teamOverview.slogan}"
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 상단 우승 역사 및 홈구장 배너 */}
                    {teamOverview && !modalLoading && !overviewError && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
                        <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center gap-3 shadow-md">
                          <span className="text-2xl md:text-3xl">🏆</span>
                          <div>
                            <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider block">우승 역사</span>
                            <span className="text-base md:text-lg font-black text-white mt-0.5 block">
                              {teamOverview.championshipCount != null && teamOverview.championshipCount >= 1
                                ? `V${teamOverview.championshipCount} (한국시리즈 우승 ${teamOverview.championshipCount}회)`
                                : "한국시리즈 우승 기록 없음"}
                            </span>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/20 flex items-center gap-3 shadow-md">
                          <span className="text-2xl md:text-3xl">🏟️</span>
                          <div>
                            <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider block">홈구장</span>
                            <span className="text-base md:text-lg font-black text-white mt-0.5 block">
                              {teamOverview.stadiumName || "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 요청된 순서의 가로 메뉴 네비게이션 탭 바 */}
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 p-2 rounded-2xl bg-slate-950/90 border border-white/20 shadow-xl">
                    <button
                      onClick={() => setModalTab('all')}
                      className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all ${
                        modalTab === 'all'
                          ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      📋 전체 보기
                    </button>

                    <button
                      onClick={() => setModalTab('trend')}
                      className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all flex items-center gap-2 ${
                        modalTab === 'trend'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md scale-105'
                          : 'text-slate-300 hover:text-white hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      <span className="text-base">📈</span>
                      <span>정규시즌 순위 변동 추이</span>
                    </button>

                    <button
                      onClick={() => setModalTab('overview')}
                      className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all flex items-center gap-2 ${
                        modalTab === 'overview'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md scale-105'
                          : 'text-slate-300 hover:text-white hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      <span className="text-base">📊</span>
                      <span>2026시즌 구단 주요 지표</span>
                    </button>

                    <button
                      onClick={() => setModalTab('players')}
                      className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all flex items-center gap-2 ${
                        modalTab === 'players'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md scale-105'
                          : 'text-slate-300 hover:text-white hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      <span className="text-base">⭐</span>
                      <span>포스트시즌 핵심 선수 TOP 3</span>
                    </button>
                  </div>
                </div>

                {/* Modal Content Scroll Area (요청된 1 -> 2 -> 3 순서대로 시원하게 나열) */}
                <div className="p-5 md:p-8 overflow-y-auto flex-1 space-y-6">
                  
                  {/* [순서 1] 정규시즌 순위 변동 추이 */}
                  {(modalTab === 'all' || modalTab === 'trend') && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 md:p-7 rounded-2xl bg-slate-950/90 border border-amber-500/30 shadow-xl space-y-4"
                    >
                      <div className="flex flex-wrap justify-between items-center gap-3 border-b border-white/15 pb-3">
                        <h3 className="text-lg md:text-2xl font-black text-amber-400 flex items-center gap-2">
                          <span className="text-2xl">📈</span> 1. 정규시즌 순위 변동 추이
                        </h3>
                        {/* 요약 한 줄: 시즌 최고 N위 · 최저 N위 · 현재 N위 */}
                        {summaryStats && (
                          <div className="text-xs md:text-sm font-bold font-mono text-slate-200 bg-white/10 px-4 py-2 rounded-xl border border-white/15 shadow-sm">
                            시즌 최고 <strong className="text-amber-400 text-sm md:text-base">{summaryStats.best}위</strong> · 최저 <strong className="text-slate-400 text-sm md:text-base">{summaryStats.worst}위</strong> · 현재 <strong className="text-cyan-400 text-sm md:text-base">{summaryStats.current}위</strong>
                          </div>
                        )}
                      </div>

                      {modalLoading ? (
                        <div className="h-64 md:h-72 flex items-center justify-center text-slate-300 font-bold text-sm">
                          <div className="animate-pulse flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                            순위 변동 데이터를 불러오는 중입니다...
                          </div>
                        </div>
                      ) : rankTrendError || !validTrendData || validTrendData.length === 0 ? (
                        <div className="h-36 flex items-center justify-center text-slate-400 font-bold text-sm">
                          순위 변동 데이터를 불러올 수 없습니다.
                        </div>
                      ) : (
                        <div className="w-full h-64 md:h-72 pt-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={validTrendData} margin={{ top: 20, right: 35, left: -20, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                              <XAxis 
                                dataKey="rankingDate" 
                                tickFormatter={(dateStr) => {
                                  if (!dateStr) return '';
                                  const parts = dateStr.split('-');
                                  return parts.length >= 3 ? `${parseInt(parts[1])}/${parseInt(parts[2])}` : dateStr;
                                }}
                                stroke="#94a3b8" 
                                tick={{ fill: '#cbd5e1', fontSize: 12, fontWeight: 'bold' }}
                                interval="preserveStartEnd"
                              />
                              <YAxis 
                                domain={[1, 10]} 
                                reversed={true} 
                                ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} 
                                stroke="#94a3b8" 
                                tick={{ fill: '#cbd5e1', fontSize: 12, fontWeight: 'bold' }} 
                              />
                              <Tooltip content={<CustomRankTooltip />} />
                              <ReferenceLine 
                                y={5.5} 
                                stroke="#f59e0b" 
                                strokeDasharray="4 4" 
                                label={{ value: '가을야구 진출선', fill: '#f59e0b', fontSize: 12, position: 'insideTopRight', fontWeight: 'bold' }} 
                              />
                              <Line 
                                type="monotone" 
                                dataKey="teamRank" 
                                stroke={currentTeamColor} 
                                strokeWidth={3.5} 
                                dot={(props) => {
                                  const { cx, cy, index } = props;
                                  const isLast = index === validTrendData.length - 1;
                                  if (isLast) {
                                    return (
                                      <g key={`dot-${index}`}>
                                        <circle cx={cx} cy={cy} r={8} fill={currentTeamColor} stroke="#ffffff" strokeWidth={3} />
                                      </g>
                                    );
                                  }
                                  return <circle key={`dot-${index}`} cx={cx} cy={cy} r={4} fill={currentTeamColor} stroke="#0f172a" strokeWidth={1} />;
                                }}
                                activeDot={{ r: 8, stroke: '#ffffff', strokeWidth: 2 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* [순서 2] 2026시즌 구단 주요 지표 */}
                  {(modalTab === 'all' || modalTab === 'overview') && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 md:p-7 rounded-2xl bg-slate-950/90 border border-white/15 shadow-xl space-y-5"
                    >
                      <h3 className="text-lg md:text-2xl font-black text-amber-400 flex items-center gap-2 border-b border-white/15 pb-3">
                        <span className="text-2xl">📊</span> 2. {teamOverview?.season || 2026}시즌 구단 주요 지표
                      </h3>

                      {modalLoading ? (
                        <div className="py-12 text-center text-slate-300 font-black text-sm">
                          구단 정보를 불러오는 중입니다...
                        </div>
                      ) : overviewError || !teamOverview ? (
                        <div className="p-5 rounded-xl bg-slate-950/90 border border-red-500/30 text-center text-slate-300 font-black text-sm py-12">
                          구단 정보를 불러오지 못했습니다.
                        </div>
                      ) : (
                        <div className="space-y-5">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-center">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/15 shadow-inner">
                              <span className="text-xs md:text-sm text-slate-300 font-bold block mb-1">정규시즌 승률</span>
                              <span className="text-2xl md:text-3xl font-black text-amber-400">
                                {teamOverview.winRate != null ? teamOverview.winRate.toFixed(3) : "-"}
                              </span>
                              <span className="text-xs text-slate-300 font-bold block mt-1">
                                {teamOverview.wins != null ? `${teamOverview.wins}승 ${teamOverview.losses ?? 0}패 ${teamOverview.draws ?? 0}무` : "-"}
                              </span>
                            </div>

                            <div className="p-4 rounded-2xl bg-white/5 border border-white/15 shadow-inner flex flex-col justify-between">
                              <span className="text-xs md:text-sm text-slate-300 font-bold block mb-1">팀 타율</span>
                              <div className="flex items-center justify-center gap-2 flex-wrap">
                                <span className="text-2xl md:text-3xl font-black text-white">
                                  {teamOverview.teamAvg != null ? teamOverview.teamAvg.toFixed(3) : "-"}
                                </span>
                                {renderLeagueRankBadge(teamOverview.teamAvgRank)}
                              </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-white/5 border border-white/15 shadow-inner flex flex-col justify-between">
                              <span className="text-xs md:text-sm text-slate-300 font-bold block mb-1">팀 ERA</span>
                              <div className="flex items-center justify-center gap-2 flex-wrap">
                                <span className="text-2xl md:text-3xl font-black text-cyan-400">
                                  {teamOverview.teamEra != null ? teamOverview.teamEra.toFixed(2) : "-"}
                                </span>
                                {renderLeagueRankBadge(teamOverview.teamEraRank)}
                              </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-white/5 border border-white/15 shadow-inner flex flex-col justify-between">
                              <span className="text-xs md:text-sm text-slate-300 font-bold block mb-1">팀 홈런</span>
                              <div className="flex items-center justify-center gap-2 flex-wrap">
                                <span className="text-2xl md:text-3xl font-black text-orange-400">
                                  {teamOverview.teamHr != null ? `${teamOverview.teamHr}개` : "-"}
                                </span>
                                {renderLeagueRankBadge(teamOverview.teamHrRank)}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-center pt-3 border-t border-white/15">
                            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/15">
                              <span className="text-slate-300 font-bold text-xs md:text-sm block mb-1">홈 경기 성적</span>
                              <span className="text-lg md:text-xl font-black text-white block">
                                {teamOverview.homeRecord
                                  ? `${teamOverview.homeRecord.wins}승 ${teamOverview.homeRecord.losses}패 ${teamOverview.homeRecord.draws}무`
                                  : "-"}
                              </span>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/15">
                              <span className="text-slate-300 font-bold text-xs md:text-sm block mb-1">원정 경기 성적</span>
                              <span className="text-lg md:text-xl font-black text-white block">
                                {teamOverview.awayRecord
                                  ? `${teamOverview.awayRecord.wins}승 ${teamOverview.awayRecord.losses}패 ${teamOverview.awayRecord.draws}무`
                                  : "-"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* [순서 3] 포스트시즌 핵심 선수 TOP 3 */}
                  {(modalTab === 'all' || modalTab === 'players') && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 md:p-7 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900/90 to-slate-950 border border-amber-500/30 shadow-xl space-y-5"
                    >
                      <h3 className="text-lg md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 flex items-center gap-2 border-b border-white/15 pb-3">
                        <span className="text-2xl animate-pulse">⭐</span> 3. 포스트시즌 핵심 선수 TOP 3
                      </h3>

                      {modalLoading ? (
                        <div className="py-8 text-center text-slate-300 font-black text-sm">선수 데이터를 불러오는 중입니다...</div>
                      ) : teamTopPlayers ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Top 3 Batters */}
                          <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                            <h4 className="text-base md:text-lg font-black text-amber-400 flex items-center gap-2">
                              <span>⚾</span> 주요 타자 TOP 3
                            </h4>
                            <div className="space-y-2.5">
                              {teamTopPlayers.topBatters.map((batter, i) => (
                                <motion.div 
                                  key={i}
                                  initial={{ opacity: 0, y: 6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.2, delay: 0.05 + i * 0.05 }}
                                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 flex flex-wrap sm:flex-nowrap justify-between items-center gap-2 transition-all shadow-sm"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="w-7 h-7 rounded-full bg-amber-500/25 text-amber-300 text-xs md:text-sm font-black flex items-center justify-center font-mono border border-amber-500/40">
                                      {i + 1}
                                    </span>
                                    <span className="font-black text-white text-base md:text-lg">{batter.playerName}</span>
                                  </div>
                                  <div className="flex gap-3 text-xs md:text-sm font-mono text-slate-200 font-bold">
                                    <span>타율 <strong className="text-amber-400 text-sm md:text-base font-black">{batter.avg != null ? batter.avg.toFixed(3) : '-'}</strong></span>
                                    <span>홈런 <strong className="text-orange-400 text-sm md:text-base font-black">{batter.hr ?? '-'}</strong></span>
                                    <span>OPS <strong className="text-white text-sm md:text-base font-black">{batter.ops != null ? batter.ops.toFixed(3) : '-'}</strong></span>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>

                          {/* Top 3 Pitchers */}
                          <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                            <h4 className="text-base md:text-lg font-black text-cyan-400 flex items-center gap-2">
                              <span>🎯</span> 주요 투수 TOP 3
                            </h4>
                            <div className="space-y-2.5">
                              {teamTopPlayers.topPitchers.map((pitcher, i) => (
                                <motion.div 
                                  key={i}
                                  initial={{ opacity: 0, y: 6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.2, delay: 0.05 + i * 0.05 }}
                                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 flex flex-wrap sm:flex-nowrap justify-between items-center gap-2 transition-all shadow-sm"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="w-7 h-7 rounded-full bg-cyan-500/25 text-cyan-300 text-xs md:text-sm font-black flex items-center justify-center font-mono border border-cyan-500/40">
                                      {i + 1}
                                    </span>
                                    <span className="font-black text-white text-base md:text-lg">{pitcher.playerName}</span>
                                  </div>
                                  <div className="flex gap-3 text-xs md:text-sm font-mono text-slate-200 font-bold">
                                    <span>ERA <strong className="text-cyan-400 text-sm md:text-base font-black">{pitcher.era != null ? pitcher.era.toFixed(2) : '-'}</strong></span>
                                    <span>승리 <strong className="text-emerald-400 text-sm md:text-base font-black">{pitcher.w != null ? `${pitcher.w}승` : '-'}</strong></span>
                                    <span>탈삼진 <strong className="text-white text-sm md:text-base font-black">{pitcher.so != null ? `${pitcher.so}K` : '-'}</strong></span>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-6 text-center text-slate-300 font-bold text-xs">선수 데이터가 없습니다.</div>
                      )}
                    </motion.div>
                  )}

                </div>

                {/* Modal Sticky Footer */}
                <div className="p-3 border-t border-white/15 bg-[#070d1f] shrink-0 text-center">
                  <button 
                    onClick={() => setSelectedTeamId(null)}
                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm md:text-base transition-all shadow-md"
                  >
                    확인 완료
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PostseasonBackground>
  );
};

export default Postseason;
