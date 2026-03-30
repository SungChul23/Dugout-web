
import React, { useState, useEffect } from 'react';
import { TEAMS } from '../constants';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../api';

interface TeamPlayerStatsProps {
  onCancel: () => void;
  user?: {
    nickname: string;
    favoriteTeam?: string;
  } | null;
}

// --- MOCK DATA TYPES ---

// Updated to match TeamRankResponseDto
interface TeamRankResponseDto {
  rankingDate: string;    // date (using string for mock)
  teamId: number;         // bigint
  teamName: string;       // 팀 식별을 위한 이름 추가 (선택사항)
  awayRecord: string;     // varchar(255)
  draws: number;          // int
  gamesBehind: number;    // decimal(4,1)
  homeRecord: string;     // varchar(255)
  losses: number;         // int
  teamRank: number;       // int
  recent10games: string;  // varchar(255)
  streak: string;         // varchar(255)
  totalGames: number;     // int
  winRate: number;        // decimal(5,3)
  wins: number;           // int
  gamesPlayed: number;    // int
  last10games: string;    // varchar(255)
}

interface LeaderItem {
  rank: number;
  name: string; // Team Name or Player Name
  subInfo?: string; // Team Name for players
  value: string | number;
  unit?: string;
  teamCode?: string; // For coloring
}

interface MetricLeaderboard {
  title: string;
  key: string;
  items: LeaderItem[];
}

// --- MOCK DATA ---

// Updated Mock Data based on TeamRankResponseDto
const ACTUAL_RANKING: TeamRankResponseDto[] = [
  { rankingDate: '2026-04-01', teamId: 1, teamName: 'KIA 타이거즈', gamesPlayed: 144, wins: 87, draws: 2, losses: 55, winRate: 0.613, gamesBehind: 0.0, streak: '2연승', recent10games: '7승 3패', last10games: '7승 3패', homeRecord: '45-1-26', awayRecord: '42-1-29', totalGames: 144, teamRank: 1 },
  { rankingDate: '2026-04-01', teamId: 2, teamName: '삼성 라이온즈', gamesPlayed: 144, wins: 78, draws: 2, losses: 64, winRate: 0.549, gamesBehind: 9.0, streak: '1연패', recent10games: '5승 5패', last10games: '5승 5패', homeRecord: '40-1-31', awayRecord: '38-1-33', totalGames: 144, teamRank: 2 },
  { rankingDate: '2026-04-01', teamId: 3, teamName: 'LG 트윈스', gamesPlayed: 144, wins: 76, draws: 2, losses: 66, winRate: 0.535, gamesBehind: 11.0, streak: '3연승', recent10games: '6승 4패', last10games: '6승 4패', homeRecord: '42-1-29', awayRecord: '34-1-37', totalGames: 144, teamRank: 3 },
  { rankingDate: '2026-04-01', teamId: 4, teamName: '두산 베어스', gamesPlayed: 144, wins: 74, draws: 2, losses: 68, winRate: 0.521, gamesBehind: 13.0, streak: '1연승', recent10games: '4승 6패', last10games: '4승 6패', homeRecord: '39-1-32', awayRecord: '35-1-36', totalGames: 144, teamRank: 4 },
  { rankingDate: '2026-04-01', teamId: 5, teamName: 'kt wiz', gamesPlayed: 144, wins: 72, draws: 2, losses: 70, winRate: 0.507, gamesBehind: 15.0, streak: '2연패', recent10games: '5승 5패', last10games: '5승 5패', homeRecord: '38-1-33', awayRecord: '34-1-37', totalGames: 144, teamRank: 5 },
  { rankingDate: '2026-04-01', teamId: 6, teamName: 'SSG 랜더스', gamesPlayed: 144, wins: 72, draws: 2, losses: 70, winRate: 0.507, gamesBehind: 15.0, streak: '1연승', recent10games: '6승 4패', last10games: '6승 4패', homeRecord: '37-1-34', awayRecord: '35-1-36', totalGames: 144, teamRank: 6 },
  { rankingDate: '2026-04-01', teamId: 7, teamName: '롯데 자이언츠', gamesPlayed: 144, wins: 66, draws: 4, losses: 74, winRate: 0.471, gamesBehind: 20.0, streak: '3연패', recent10games: '3승 7패', last10games: '3승 7패', homeRecord: '35-2-35', awayRecord: '31-2-39', totalGames: 144, teamRank: 7 },
  { rankingDate: '2026-04-01', teamId: 8, teamName: '한화 이글스', gamesPlayed: 144, wins: 66, draws: 2, losses: 76, winRate: 0.465, gamesBehind: 21.0, streak: '1연패', recent10games: '4승 6패', last10games: '4승 6패', homeRecord: '36-1-35', awayRecord: '30-1-41', totalGames: 144, teamRank: 8 },
  { rankingDate: '2026-04-01', teamId: 9, teamName: 'NC 다이노스', gamesPlayed: 144, wins: 61, draws: 2, losses: 81, winRate: 0.430, gamesBehind: 26.0, streak: '2연승', recent10games: '5승 5패', last10games: '5승 5패', homeRecord: '32-1-39', awayRecord: '29-1-42', totalGames: 144, teamRank: 9 },
  { rankingDate: '2026-04-01', teamId: 10, teamName: '키움 히어로즈', gamesPlayed: 144, wins: 58, draws: 0, losses: 86, winRate: 0.403, gamesBehind: 30.0, streak: '4연패', recent10games: '2승 8패', last10games: '2승 8패', homeRecord: '30-0-42', awayRecord: '28-0-44', totalGames: 144, teamRank: 10 },
];

// Mock Data for Rank Trend Chart (Simulated for visualization - Game by Game)
const MOCK_RANK_HISTORY = [
  { game: '시작', KIA: 1, SAMSUNG: 2, LG: 3, DOOSAN: 4, KT: 5, SSG: 6, HANWHA: 7, LOTTE: 8, NC: 9, KIWOOM: 10 },
  { game: '10경기' },
  { game: '20경기' },
  { game: '30경기' },
  { game: '40경기' },
  { game: '50경기' },
];

// Helper to get Korean Team Name
const getKoreanTeamName = (code: string) => {
  const team = TEAMS.find(t => t.code === code);
  // Map English names to Korean names manually if needed, or use a mapping object
  // Since TEAMS has English names, we'll map codes to Korean names here
  const koreanNames: Record<string, string> = {
    'KIA': 'KIA 타이거즈',
    'SAMSUNG': '삼성 라이온즈',
    'LG': 'LG 트윈스',
    'DOOSAN': '두산 베어스',
    'KT': 'kt wiz',
    'SSG': 'SSG 랜더스',
    'LOTTE': '롯데 자이언츠',
    'HANWHA': '한화 이글스',
    'NC': 'NC 다이노스',
    'KIWOOM': '키움 히어로즈'
  };
  return koreanNames[code] || team?.name || code;
};

// Helper to get Team Code from Korean Name
const getTeamCodeFromName = (name: string) => {
  const koreanNames: Record<string, string> = {
    'KIA 타이거즈': 'KIA',
    '삼성 라이온즈': 'SAMSUNG',
    'LG 트윈스': 'LG',
    '두산 베어스': 'DOOSAN',
    'kt wiz': 'KT',
    'SSG 랜더스': 'SSG',
    '롯데 자이언츠': 'LOTTE',
    '한화 이글스': 'HANWHA',
    'NC 다이노스': 'NC',
    '키움 히어로즈': 'KIWOOM'
  };
  return koreanNames[name] || '';
};

// ... (Metrics Data Omitted for Brevity as it is unchanged from previous request) ...
// --- LEADERBOARDS DATA (BASIC) ---

const TEAM_METRICS_BASIC: MetricLeaderboard[] = [
  {
    title: '팀 타율 (AVG)',
    key: 'avg',
    items: [
      { rank: 1, name: 'KIA 타이거즈', value: '0.301', teamCode: 'KIA' },
      { rank: 2, name: 'LG 트윈스', value: '0.285', teamCode: 'LG' },
      { rank: 3, name: '두산 베어스', value: '0.280', teamCode: 'DOOSAN' },
      { rank: 4, name: '삼성 라이온즈', value: '0.270', teamCode: 'SAMSUNG' },
      { rank: 5, name: '롯데 자이언츠', value: '0.268', teamCode: 'LOTTE' },
    ]
  },
  {
    title: '팀 평균자책점 (ERA)',
    key: 'era',
    items: [
      { rank: 1, name: 'KIA 타이거즈', value: '3.85', teamCode: 'KIA' },
      { rank: 2, name: 'LG 트윈스', value: '4.12', teamCode: 'LG' },
      { rank: 3, name: 'kt wiz', value: '4.20', teamCode: 'KT' },
      { rank: 4, name: 'NC 다이노스', value: '4.35', teamCode: 'NC' },
      { rank: 5, name: '두산 베어스', value: '4.40', teamCode: 'DOOSAN' },
    ]
  },
  {
    title: '팀 홈런 (HR)',
    key: 'hr',
    items: [
      { rank: 1, name: '삼성 라이온즈', value: '185', teamCode: 'SAMSUNG' },
      { rank: 2, name: 'KIA 타이거즈', value: '163', teamCode: 'KIA' },
      { rank: 3, name: 'SSG 랜더스', value: '150', teamCode: 'SSG' },
      { rank: 4, name: 'NC 다이노스', value: '148', teamCode: 'NC' },
      { rank: 5, name: '한화 이글스', value: '130', teamCode: 'HANWHA' },
    ]
  }
];

const BATTER_METRICS_BASIC: MetricLeaderboard[] = [
    { 
      title: '타율 (AVG)', 
      key: 'avg', 
      items: [
        { rank: 1, name: '김도영', subInfo: 'KIA 타이거즈', value: '0.347', teamCode: 'KIA' },
        { rank: 2, name: '구자욱', subInfo: '삼성 라이온즈', value: '0.343', teamCode: 'SAMSUNG' },
        { rank: 3, name: '오스틴', subInfo: 'LG 트윈스', value: '0.335', teamCode: 'LG' },
        { rank: 4, name: '에레디아', subInfo: 'SSG 랜더스', value: '0.333', teamCode: 'SSG' },
        { rank: 5, name: '로하스', subInfo: 'kt wiz', value: '0.329', teamCode: 'KT' },
      ] 
    },
    { 
      title: '홈런 (HR)', 
      key: 'hr', 
      items: [
        { rank: 1, name: '데이비슨', subInfo: 'NC 다이노스', value: '46', teamCode: 'NC' },
        { rank: 2, name: '김도영', subInfo: 'KIA 타이거즈', value: '38', teamCode: 'KIA' },
        { rank: 3, name: '최정', subInfo: 'SSG 랜더스', value: '37', teamCode: 'SSG' },
        { rank: 4, name: '오스틴', subInfo: 'LG 트윈스', value: '32', teamCode: 'LG' },
        { rank: 5, name: '구자욱', subInfo: '삼성 라이온즈', value: '31', teamCode: 'SAMSUNG' },
      ] 
    },
    { 
      title: '타점 (RBI)', 
      key: 'rbi', 
      items: [
        { rank: 1, name: '오스틴', subInfo: 'LG 트윈스', value: '132', teamCode: 'LG' },
        { rank: 2, name: '데이비슨', subInfo: 'NC 다이노스', value: '119', teamCode: 'NC' },
        { rank: 3, name: '구자욱', subInfo: '삼성 라이온즈', value: '115', teamCode: 'SAMSUNG' },
        { rank: 4, name: '로하스', subInfo: 'kt wiz', value: '112', teamCode: 'KT' },
        { rank: 5, name: '김도영', subInfo: 'KIA 타이거즈', value: '109', teamCode: 'KIA' },
      ] 
    },
];
const PITCHER_METRICS_BASIC: MetricLeaderboard[] = [
    { 
      title: '평균자책점 (ERA)', 
      key: 'era', 
      items: [
        { rank: 1, name: '네일', subInfo: 'KIA 타이거즈', value: '2.53', teamCode: 'KIA' },
        { rank: 2, name: '하트', subInfo: 'NC 다이노스', value: '2.69', teamCode: 'NC' },
        { rank: 3, name: '엔스', subInfo: 'LG 트윈스', value: '3.15', teamCode: 'LG' },
        { rank: 4, name: '원태인', subInfo: '삼성 라이온즈', value: '3.66', teamCode: 'SAMSUNG' },
        { rank: 5, name: '류현진', subInfo: '한화 이글스', value: '3.87', teamCode: 'HANWHA' },
      ] 
    },
    { 
      title: '다승 (W)', 
      key: 'w', 
      items: [
        { rank: 1, name: '원태인', subInfo: '삼성 라이온즈', value: '15', teamCode: 'SAMSUNG' },
        { rank: 2, name: '곽빈', subInfo: '두산 베어스', value: '15', teamCode: 'DOOSAN' },
        { rank: 3, name: '엔스', subInfo: 'LG 트윈스', value: '13', teamCode: 'LG' },
        { rank: 4, name: '하트', subInfo: 'NC 다이노스', value: '13', teamCode: 'NC' },
        { rank: 5, name: '네일', subInfo: 'KIA 타이거즈', value: '12', teamCode: 'KIA' },
      ] 
    },
    { 
      title: '탈삼진 (SO)', 
      key: 'so', 
      items: [
        { rank: 1, name: '하트', subInfo: 'NC 다이노스', value: '182', teamCode: 'NC' },
        { rank: 2, name: '엔스', subInfo: 'LG 트윈스', value: '157', teamCode: 'LG' },
        { rank: 3, name: '곽빈', subInfo: '두산 베어스', value: '154', teamCode: 'DOOSAN' },
        { rank: 4, name: '쿠에바스', subInfo: 'kt wiz', value: '150', teamCode: 'KT' },
        { rank: 5, name: '네일', subInfo: 'KIA 타이거즈', value: '138', teamCode: 'KIA' },
      ] 
    },
];
const TEAM_METRICS_ADVANCED: MetricLeaderboard[] = [
  {
    title: '팀 OPS',
    key: 'ops',
    items: [
      { rank: 1, name: 'KIA 타이거즈', value: '0.820', teamCode: 'KIA' },
      { rank: 2, name: 'LG 트윈스', value: '0.795', teamCode: 'LG' },
      { rank: 3, name: '삼성 라이온즈', value: '0.780', teamCode: 'SAMSUNG' },
      { rank: 4, name: 'SSG 랜더스', value: '0.775', teamCode: 'SSG' },
      { rank: 5, name: '두산 베어스', value: '0.760', teamCode: 'DOOSAN' },
    ]
  },
  {
    title: '팀 WHIP',
    key: 'whip',
    items: [
      { rank: 1, name: 'KIA 타이거즈', value: '1.32', teamCode: 'KIA' },
      { rank: 2, name: 'NC 다이노스', value: '1.35', teamCode: 'NC' },
      { rank: 3, name: 'LG 트윈스', value: '1.38', teamCode: 'LG' },
      { rank: 4, name: 'kt wiz', value: '1.40', teamCode: 'KT' },
      { rank: 5, name: '두산 베어스', value: '1.42', teamCode: 'DOOSAN' },
    ]
  },
  {
    title: '팀 WAR',
    key: 'war',
    items: [
      { rank: 1, name: 'KIA 타이거즈', value: '45.2', teamCode: 'KIA' },
      { rank: 2, name: 'LG 트윈스', value: '42.1', teamCode: 'LG' },
      { rank: 3, name: '삼성 라이온즈', value: '39.5', teamCode: 'SAMSUNG' },
      { rank: 4, name: '두산 베어스', value: '38.0', teamCode: 'DOOSAN' },
      { rank: 5, name: 'NC 다이노스', value: '36.5', teamCode: 'NC' },
    ]
  }
];
const BATTER_METRICS_ADVANCED: MetricLeaderboard[] = [
  {
    title: 'wRC+',
    key: 'wrcplus',
    items: [
      { rank: 1, name: '김도영', subInfo: 'KIA 타이거즈', value: '175.2', teamCode: 'KIA' },
      { rank: 2, name: '구자욱', subInfo: '삼성 라이온즈', value: '168.5', teamCode: 'SAMSUNG' },
      { rank: 3, name: '오스틴', subInfo: 'LG 트윈스', value: '165.0', teamCode: 'LG' },
      { rank: 4, name: '데이비슨', subInfo: 'NC 다이노스', value: '160.2', teamCode: 'NC' },
      { rank: 5, name: '로하스', subInfo: 'kt wiz', value: '158.9', teamCode: 'KT' },
    ]
  },
  {
    title: 'OPS',
    key: 'ops',
    items: [
      { rank: 1, name: '김도영', subInfo: 'KIA 타이거즈', value: '1.067', teamCode: 'KIA' },
      { rank: 2, name: '구자욱', subInfo: '삼성 라이온즈', value: '1.044', teamCode: 'SAMSUNG' },
      { rank: 3, name: '데이비슨', subInfo: 'NC 다이노스', value: '1.020', teamCode: 'NC' },
      { rank: 4, name: '오스틴', subInfo: 'LG 트윈스', value: '1.015', teamCode: 'LG' },
      { rank: 5, name: '최정', subInfo: 'SSG 랜더스', value: '0.985', teamCode: 'SSG' },
    ]
  },
  {
    title: 'WAR',
    key: 'war',
    items: [
      { rank: 1, name: '김도영', subInfo: 'KIA 타이거즈', value: '8.32', teamCode: 'KIA' },
      { rank: 2, name: '구자욱', subInfo: '삼성 라이온즈', value: '7.15', teamCode: 'SAMSUNG' },
      { rank: 3, name: '오스틴', subInfo: 'LG 트윈스', value: '6.80', teamCode: 'LG' },
      { rank: 4, name: '로하스', subInfo: 'kt wiz', value: '6.55', teamCode: 'KT' },
      { rank: 5, name: '에레디아', subInfo: 'SSG 랜더스', value: '6.10', teamCode: 'SSG' },
    ]
  }
];
const PITCHER_METRICS_ADVANCED: MetricLeaderboard[] = [
  {
    title: 'FIP',
    key: 'fip',
    items: [
      { rank: 1, name: '네일', subInfo: 'KIA 타이거즈', value: '2.85', teamCode: 'KIA' },
      { rank: 2, name: '하트', subInfo: 'NC 다이노스', value: '2.92', teamCode: 'NC' },
      { rank: 3, name: '엔스', subInfo: 'LG 트윈스', value: '3.20', teamCode: 'LG' },
      { rank: 4, name: '원태인', subInfo: '삼성 라이온즈', value: '3.45', teamCode: 'SAMSUNG' },
      { rank: 5, name: '곽빈', subInfo: '두산 베어스', value: '3.60', teamCode: 'DOOSAN' },
    ]
  },
  {
    title: 'WHIP',
    key: 'whip',
    items: [
      { rank: 1, name: '네일', subInfo: 'KIA 타이거즈', value: '1.05', teamCode: 'KIA' },
      { rank: 2, name: '하트', subInfo: 'NC 다이노스', value: '1.08', teamCode: 'NC' },
      { rank: 3, name: '엔스', subInfo: 'LG 트윈스', value: '1.15', teamCode: 'LG' },
      { rank: 4, name: '원태인', subInfo: '삼성 라이온즈', value: '1.18', teamCode: 'SAMSUNG' },
      { rank: 5, name: '쿠에바스', subInfo: 'kt wiz', value: '1.20', teamCode: 'KT' },
    ]
  },
  {
    title: 'WAR',
    key: 'war',
    items: [
      { rank: 1, name: '하트', subInfo: 'NC 다이노스', value: '6.50', teamCode: 'NC' },
      { rank: 2, name: '네일', subInfo: 'KIA 타이거즈', value: '6.20', teamCode: 'KIA' },
      { rank: 3, name: '엔스', subInfo: 'LG 트윈스', value: '5.80', teamCode: 'LG' },
      { rank: 4, name: '원태인', subInfo: '삼성 라이온즈', value: '5.40', teamCode: 'SAMSUNG' },
      { rank: 5, name: '곽빈', subInfo: '두산 베어스', value: '5.10', teamCode: 'DOOSAN' },
    ]
  }
];


export interface TeamPerformanceResponseDto {
    teamId: number;
    teamName: string;
    baseDate: string;

    // 1. 팀 타자 지표 (12개)
    avg: number;
    hr: number;
    runs: number;
    hits: number;
    rbi: number;
    obp: number;
    ops: number;
    risp: number;
    slg: number;
    phBa: number;
    multiHit: number;
    totalBases: number;

    // 2. 팀 투수 지표 (12개)
    era: number;
    wins: number;
    so: number;
    sv: number;
    hld: number;
    wpct: number;
    whip: number;
    qs: number;
    oppAvg: number;
    bsv: number;
    np: number;
    hrAllowed: number;

    // 3. 팀 수비/주루 지표 (12개)
    sb: number;
    sbRate: number;
    error: number;
    fpct: number;
    dp: number;
    csRate: number;
    oob: number;
    sba: number;
    pkoR: number;
    pkoD: number;
    cs: number;
    sbAllowed: number;
}

interface MetricDef {
  name: string;
  desc: string;
  key: keyof TeamPerformanceResponseDto;
  format: (val: any) => string;
}

const formatDec3 = (v: any) => Number(v).toFixed(3);
const formatDec2 = (v: any) => Number(v).toFixed(2);
const formatInt = (v: any) => Number(v).toString();

const TEAM_BATTER_GENERAL: MetricDef[] = [
  { name: '팀 타율', desc: '팀 공격의 가장 기본적인 정확도 지표', key: 'avg', format: formatDec3 },
  { name: '홈런', desc: '팀의 슬러거 파워와 득점 생산의 핵심', key: 'hr', format: formatInt },
  { name: '득점', desc: '공격의 최종 결과물 (가장 직관적)', key: 'runs', format: formatInt },
  { name: '안타', desc: '팀의 누적 타격 횟수', key: 'hits', format: formatInt },
  { name: '타점', desc: '찬스에서의 해결사 능력', key: 'rbi', format: formatInt },
  { name: '출루율', desc: '얼마나 끈질기게 베이스에 나가는가', key: 'obp', format: formatDec3 },
];

const TEAM_BATTER_ADVANCED: MetricDef[] = [
  { name: 'OPS', desc: '출루율+장타율. 현대 야구 타격 평가의 표준', key: 'ops', format: formatDec3 },
  { name: '득점권 타율', desc: '찬스 상황(RISP)에서의 집중력 (팬들이 가장 민감함)', key: 'risp', format: formatDec3 },
  { name: '장타율', desc: '타구의 질과 베이스 진루 능력', key: 'slg', format: formatDec3 },
  { name: '대타 타율', desc: '벤치 뎁스와 대타 작전의 성공률', key: 'phBa', format: formatDec3 },
  { name: '멀티히트', desc: '한 경기 2안타 이상 기록 횟수 (팀의 타격 컨디션)', key: 'multiHit', format: formatInt },
  { name: '루타 수', desc: '단타보다 가중치를 둔 생산성 지표', key: 'totalBases', format: formatInt },
];

const TEAM_PITCHER_GENERAL: MetricDef[] = [
  { name: '평균자책점', desc: '투수진의 실력 지표 (낮을수록 강팀)', key: 'era', format: formatDec2 },
  { name: '팀 승리', desc: '투수들이 지켜낸 승리 횟수', key: 'wins', format: formatInt },
  { name: '탈삼진', desc: '구위가 압도적인 팀인지 확인', key: 'so', format: formatInt },
  { name: '세이브', desc: '뒷문(클로저)의 안정감', key: 'sv', format: formatInt },
  { name: '홀드', desc: '허리(중간계투)의 탄탄함', key: 'hld', format: formatInt },
  { name: '팀 승률', desc: '투수진의 승리 기여 효율', key: 'wpct', format: formatDec3 },
];

const TEAM_PITCHER_ADVANCED: MetricDef[] = [
  { name: 'WHIP', desc: '이닝당 출루 허용률 (마운드의 안정감)', key: 'whip', format: formatDec2 },
  { name: '퀄리티 스타트', desc: '선발진이 6이닝 3자책 이하로 던진 횟수', key: 'qs', format: formatInt },
  { name: '피안타율', desc: '상대 타자가 우리 투수진을 공략하기 힘든 정도', key: 'oppAvg', format: formatDec3 },
  { name: '블론세이브', desc: '승리를 놓친 횟수 (불펜의 불안 요소 지표)', key: 'bsv', format: formatInt },
  { name: '투구수', desc: '팀 전체 투수의 어깨 소모도 측정', key: 'np', format: formatInt },
  { name: '피홈런', desc: '투수진의 피장타 억제 능력', key: 'hrAllowed', format: formatInt },
];

const TEAM_DEFENSE_GENERAL: MetricDef[] = [
  { name: '도루 성공', desc: '팀이 베이스를 얼마나 적극적으로 훔쳤는지 보여주는 기동력 지표', key: 'sb', format: formatInt },
  { name: '도루 성공률', desc: '시도 대비 성공 비율로, 주루의 효율성과 정확도를 평가', key: 'sbRate', format: formatDec3 },
  { name: '실책', desc: '수비 실수의 총합. 낮을수록 기본기가 탄탄한 팀임을 증명', key: 'error', format: formatInt },
  { name: '수비율', desc: '전체 수비 기회 중 실책 없이 처리한 비율 (수비 안정성)', key: 'fpct', format: formatDec3 },
  { name: '병살 유도', desc: '내야 수비의 조직력과 위기 관리 능력을 보여주는 지표', key: 'dp', format: formatInt },
  { name: '도루 저지율', desc: '상대 주자의 도루를 잡아낸 비율 (포수/투수의 수비 핵심)', key: 'csRate', format: formatDec3 },
];

const TEAM_DEFENSE_ADVANCED: MetricDef[] = [
  { name: '주루사', desc: '진루 과정에서 아웃된 횟수. 과감함과 무모함 사이의 판단력 척도', key: 'oob', format: formatInt },
  { name: '도루 시도', desc: '결과와 상관없이 얼마나 공격적인 주루 성향을 가졌는지 확인', key: 'sba', format: formatInt },
  { name: '견제사 당함', desc: '베이스 러닝 중 상대 견제에 걸린 횟수 (주자의 집중력 지표)', key: 'pkoR', format: formatInt },
  { name: '견제사 (수비)', desc: '수비 시 투수나 포수의 견제로 주자를 잡아낸 횟수', key: 'pkoD', format: formatInt },
  { name: '도루 저지', desc: '도루를 시도하는 주자를 잡아낸 총 횟수 (Raw Count)', key: 'cs', format: formatInt },
  { name: '도루 허용', desc: '수비 시 상대 팀에게 내준 도루 횟수 (배터리의 주자 억제력)', key: 'sbAllowed', format: formatInt },
];

const TeamPlayerStats: React.FC<TeamPlayerStatsProps> = ({ onCancel, user }) => {
  const [viewMode, setViewMode] = useState<'ranking' | 'records' | 'players'>('ranking');
  const [activeTab, setActiveTab] = useState<'batter' | 'pitcher'>('batter');
  const [isAdvanced, setIsAdvanced] = useState(false); // Maniac Mode State
  const [allRankings, setAllRankings] = useState<TeamRankResponseDto[]>(ACTUAL_RANKING);
  const [isLoading, setIsLoading] = useState(false);

  // New state for Team Stats
  const [teamStats, setTeamStats] = useState<TeamPerformanceResponseDto[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [teamStatCategory, setTeamStatCategory] = useState<'batter' | 'pitcher' | 'defense'>('batter');

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/api/v1/performance/team-ranking');
        if (response.data && response.data.length > 0) {
          setAllRankings(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch team rankings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRankings();
  }, []);

  useEffect(() => {
    const fetchTeamStats = async () => {
      try {
        const response = await api.get('/api/v1/performance/stats');
        if (response.data && response.data.length > 0) {
          setTeamStats(response.data);
          
          let defaultTeamId = response.data[0].teamId;
          if (user?.favoriteTeam) {
            const favTeam = TEAMS.find(t => t.name === user.favoriteTeam);
            if (favTeam) {
              defaultTeamId = Number(favTeam.id);
            }
          }
          setSelectedTeamId(defaultTeamId);
        }
      } catch (error) {
        console.error('Failed to fetch team stats:', error);
      }
    };
    fetchTeamStats();
  }, [user]);

  // 1. 테이블용 최신 순위 데이터
  const latestRankings = React.useMemo(() => {
    if (allRankings.length === 0) return [];
    const latestDate = allRankings.reduce((max, p) => p.rankingDate > max ? p.rankingDate : max, allRankings[0].rankingDate);
    return allRankings.filter(r => r.rankingDate === latestDate).sort((a, b) => a.teamRank - b.teamRank);
  }, [allRankings]);

  // 2. 차트용 일자별 순위 데이터
  const chartData = React.useMemo(() => {
    if (allRankings.length === 0) return [];
    
    const grouped = allRankings.reduce((acc, curr) => {
      const date = curr.rankingDate;
      if (!acc[date]) {
        const d = new Date(date);
        const displayDate = `${d.getMonth() + 1}.${d.getDate()}`;
        acc[date] = { date, displayDate };
      }
      const teamCode = getTeamCodeFromName(curr.teamName);
      if (teamCode) {
        acc[date][teamCode] = curr.teamRank;
      }
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [allRankings]);

  const getTeamColor = (code: string | undefined) => {
    const team = TEAMS.find(t => t.code === code);
    return team ? team.color : '#334155';
  };

  const getActiveMetrics = () => {
    if (isAdvanced) {
      // Return Advanced Metrics
      switch (activeTab) {
        case 'team': return TEAM_METRICS_ADVANCED;
        case 'batter': return BATTER_METRICS_ADVANCED;
        case 'pitcher': return PITCHER_METRICS_ADVANCED;
        default: return [];
      }
    } else {
      // Return Basic Metrics
      switch (activeTab) {
        case 'team': return TEAM_METRICS_BASIC;
        case 'batter': return BATTER_METRICS_BASIC;
        case 'pitcher': return PITCHER_METRICS_BASIC;
        default: return [];
      }
    }
  };

  // 랭크 렌더링 헬퍼 함수
  const renderRank = (rank: number) => {
    if (rank === 1) return <span className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] text-xl md:text-2xl font-black">1</span>;
    if (rank === 2) return <span className="text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.8)] text-xl md:text-2xl font-black">2</span>;
    if (rank === 3) return <span className="text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.8)] text-xl md:text-2xl font-black">3</span>;
    return <span className="text-slate-400 text-lg md:text-xl font-bold">{rank}</span>;
  };

  const renderTeamStats = () => {
    if (teamStats.length === 0) {
      return <div className="text-center text-slate-400 py-10">데이터를 불러오는 중입니다...</div>;
    }

    const selectedTeamData = teamStats.find(t => t.teamId === selectedTeamId) || teamStats[0];
    const selectedTeamInfo = TEAMS.find(t => t.name === selectedTeamData.teamName || t.koreanName === selectedTeamData.teamName) || TEAMS.find(t => t.id === selectedTeamData.teamId.toString());
    const teamColor = getTeamColor(selectedTeamInfo?.code);

    let currentMetrics: MetricDef[] = [];
    if (teamStatCategory === 'batter') {
      currentMetrics = isAdvanced ? TEAM_BATTER_ADVANCED : TEAM_BATTER_GENERAL;
    } else if (teamStatCategory === 'pitcher') {
      currentMetrics = isAdvanced ? TEAM_PITCHER_ADVANCED : TEAM_PITCHER_GENERAL;
    } else if (teamStatCategory === 'defense') {
      currentMetrics = isAdvanced ? TEAM_DEFENSE_ADVANCED : TEAM_DEFENSE_GENERAL;
    }

    return (
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
        {/* Sidebar: Team Selector */}
        <div className="w-full lg:w-72 flex-shrink-0 z-20">
          <div className="sticky top-24">
            <label className="block text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest px-2">Select Team</label>
            <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-3 pb-4 lg:pb-0 no-scrollbar">
              {teamStats.map(team => {
                const teamInfo = TEAMS.find(t => t.name === team.teamName || t.koreanName === team.teamName) || TEAMS.find(t => t.id === team.teamId.toString());
                const tColor = teamInfo?.color || '#334155';
                const isSelected = selectedTeamId === team.teamId;
                return (
                  <button
                    key={team.teamId}
                    onClick={() => setSelectedTeamId(team.teamId)}
                    className={`
                      flex-shrink-0 flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-500 ease-out w-auto lg:w-full group relative overflow-hidden
                      ${isSelected 
                        ? 'bg-white text-brand-dark shadow-[0_0_30px_rgba(255,255,255,0.4)] lg:translate-x-6 scale-105 z-10' 
                        : 'bg-[#0a0f1e] text-slate-400 border border-white/5 hover:bg-white/5 hover:text-white hover:lg:translate-x-2'
                      }
                    `}
                  >
                    <div 
                      className={`w-1.5 h-10 rounded-full transition-all duration-300 ${isSelected ? 'scale-y-100' : 'scale-y-50 group-hover:scale-y-75'}`}
                      style={{ backgroundColor: tColor }}
                    ></div>
                    <div className="text-left flex-1">
                      <span className={`block font-bold text-lg leading-none whitespace-nowrap ${isSelected ? 'text-black' : 'text-slate-300'}`}>
                        {teamInfo?.koreanName || teamInfo?.name || team.teamName}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-8">
          {/* Category Toggle */}
          <div className="flex flex-wrap justify-start gap-4">
            <button
              onClick={() => setTeamStatCategory('batter')}
              className={`px-6 py-2 rounded-full font-bold transition-all ${teamStatCategory === 'batter' ? 'bg-pink-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              팀 타자
            </button>
            <button
              onClick={() => setTeamStatCategory('pitcher')}
              className={`px-6 py-2 rounded-full font-bold transition-all ${teamStatCategory === 'pitcher' ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              팀 투수
            </button>
            <button
              onClick={() => setTeamStatCategory('defense')}
              className={`px-6 py-2 rounded-full font-bold transition-all ${teamStatCategory === 'defense' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              팀 수비/주루
            </button>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {currentMetrics.map((metric, idx) => {
              const val = selectedTeamData[metric.key];
              const formattedVal = metric.format(val);
              return (
                <motion.div
                  key={metric.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="bg-[#050814] border border-white/10 rounded-2xl p-6 relative overflow-hidden group"
                >
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[50px] opacity-10 group-hover:opacity-30 transition-opacity" style={{ backgroundColor: teamColor }}></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <h4 className="text-xl font-bold text-white">{metric.name}</h4>
                  </div>
                  <div className="text-4xl font-black mb-2 relative z-10" style={{ color: teamColor === '#000000' ? '#ffffff' : teamColor }}>
                    {formattedVal}
                  </div>
                  <p className="text-base text-slate-300 relative z-10 leading-relaxed">
                    {metric.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Rotating Leaderboard State
  const [currentLeaderboardIndex, setCurrentLeaderboardIndex] = useState(0);

  // Define the metrics for the rotating leaderboard
  const rotatingMetrics = [
    { title: '팀 타율 TOP 5', dataKey: 'avg', format: formatDec3 },
    { title: '팀 홈런 TOP 5', dataKey: 'hr', format: formatInt },
    { title: '팀 평균자책점 TOP 5', dataKey: 'era', format: formatDec2 },
    { title: '팀 도루 TOP 5', dataKey: 'sb', format: formatInt },
  ];

  // Auto-rotate the leaderboard every 5 seconds
  useEffect(() => {
    if (teamStats.length === 0) return;
    const interval = setInterval(() => {
      setCurrentLeaderboardIndex((prev) => (prev + 1) % rotatingMetrics.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [teamStats, rotatingMetrics.length]);

  return (
    <div className="relative z-10 w-full animate-fade-in-up min-h-screen pb-20">
      <div className="w-[95%] max-w-[1600px] mx-auto px-4 md:px-8 py-8 md:py-12">
        
        {/* Header - Font Size Increased */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-6 md:mb-10 gap-6 border-b border-white/5 pb-6 md:pb-8">
          <div>
            <div className="inline-flex items-center space-x-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-3 py-1 md:px-4 md:py-1.5 mb-4 md:mb-6 backdrop-blur-sm">
               <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-cyan-400 animate-pulse"></span>
               <span className="text-[10px] md:text-sm font-mono text-cyan-400 font-bold uppercase tracking-widest">2026 Season Analytics Center</span>
            </div>
            <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter mb-2 md:mb-4 leading-tight">
              KBO <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">STATS & RANKING</span>
            </h2>
            <p className="text-slate-400 text-base md:text-2xl font-light leading-relaxed">
              실제 데이터와 <span className="text-white font-bold">더그아웃</span>이 예측한 미래 순위의 정밀 분석
            </p>
          </div>
          <button 
            onClick={onCancel}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors border border-white/10 px-4 py-2 md:px-8 md:py-4 rounded-xl md:rounded-2xl hover:bg-white/5 bg-[#0a0f1e]"
          >
            <span className="text-xs md:text-base font-bold">메인으로</span>
            <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Navigation Tabs (Ranking vs Records vs Players) */}
        <div className="flex justify-center mb-8 md:mb-12">
          <div className="bg-[#0a0f1e] p-1 rounded-full border border-white/10 flex relative">
             {/* Sliding Background */}
             <motion.div 
               className="absolute top-1 bottom-1 bg-white rounded-full shadow-lg z-0"
               initial={false}
               animate={{ 
                 left: viewMode === 'ranking' ? '4px' : viewMode === 'records' ? '33.33%' : 'calc(66.66% - 4px)', 
                 width: 'calc(33.33% - 4px)',
                 x: 0
               }}
               transition={{ type: "spring", stiffness: 300, damping: 30 }}
             />
             
             <button
               onClick={() => setViewMode('ranking')}
               className={`relative z-10 px-6 md:px-10 py-2 md:py-3 rounded-full text-sm md:text-lg font-bold transition-colors duration-300 ${viewMode === 'ranking' ? 'text-black' : 'text-slate-400 hover:text-white'}`}
             >
               순위 (Ranking)
             </button>
             <button
               onClick={() => setViewMode('records')}
               className={`relative z-10 px-6 md:px-10 py-2 md:py-3 rounded-full text-sm md:text-lg font-bold transition-colors duration-300 ${viewMode === 'records' ? 'text-black' : 'text-slate-400 hover:text-white'}`}
             >
               기록 (Records)
             </button>
             <button
               onClick={() => setViewMode('players')}
               className={`relative z-10 px-6 md:px-10 py-2 md:py-3 rounded-full text-sm md:text-lg font-bold transition-colors duration-300 ${viewMode === 'players' ? 'text-black' : 'text-slate-400 hover:text-white'}`}
             >
               선수 별 성적 (Players)
             </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {viewMode === 'ranking' && (
            <motion.div
              key="ranking"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8 md:space-y-12"
            >
              {/* SECTION 1: RANKING TABLE */}
              <div className="w-full bg-[#0a0f1e]/80 border border-white/10 rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-8 overflow-hidden">
                <h3 className="text-lg md:text-3xl font-black text-white mb-4 md:mb-6 flex items-center gap-3 md:gap-4">
                  <span className="w-1.5 h-5 md:w-2 md:h-8 bg-slate-500 rounded-full"></span>
                  2026 KBO 정규리그 순위
                </h3>
                
                {/* Progress Bar & Date */}
                {latestRankings.length > 0 && (
                  <div className="mb-6 bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6">
                    <div className="flex justify-between items-end mb-3">
                      <div className="text-sm md:text-base text-slate-400">
                        기준일: <span className="text-white font-mono">{latestRankings[0].rankingDate}</span>
                      </div>
                      <div className="text-sm md:text-base font-bold text-cyan-400">
                        2026 시즌 {Math.min(100, (Math.max(...latestRankings.map(r => r.gamesPlayed)) / (latestRankings[0].totalGames || 144)) * 100).toFixed(1)}% 진행 중
                      </div>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2.5 md:h-3 overflow-hidden">
                      <motion.div 
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2.5 md:h-3 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (Math.max(...latestRankings.map(r => r.gamesPlayed)) / (latestRankings[0].totalGames || 144)) * 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                  <table className="w-full text-left whitespace-nowrap min-w-[1000px] md:min-w-0 border-collapse">
                    <thead className="text-slate-500 font-bold border-b border-white/5 text-sm md:text-base">
                      <tr>
                        <th className="px-2 md:px-4 py-3 md:py-4 text-center">순위</th>
                        <th className="px-2 md:px-4 py-3 md:py-4">팀명</th>
                        <th className="px-2 md:px-4 py-3 md:py-4 text-center">경기수</th>
                        <th className="px-2 md:px-4 py-3 md:py-4 text-center">승-무-패</th>
                        <th className="px-2 md:px-4 py-3 md:py-4 text-center text-cyan-400">승률</th>
                        <th className="px-2 md:px-4 py-3 md:py-4 text-center text-teal-400">게임차</th>
                        <th className="px-2 md:px-4 py-3 md:py-4 text-center">연속</th>
                        <th className="px-2 md:px-4 py-3 md:py-4 text-center">최근 10경기</th>
                        <th className="px-2 md:px-4 py-3 md:py-4 text-center">홈</th>
                        <th className="px-2 md:px-4 py-3 md:py-4 text-center">원정</th>
                      </tr>
                    </thead>
                    <tbody className="text-base md:text-lg">
                      {isLoading ? (
                        <tr>
                          <td colSpan={10} className="text-center py-10 text-slate-500">데이터를 불러오는 중입니다...</td>
                        </tr>
                      ) : latestRankings.map((team) => {
                        const teamCode = getTeamCodeFromName(team.teamName);
                        const teamColor = getTeamColor(teamCode);
                        
                        return (
                          <tr 
                            key={team.teamName} 
                            className="group transition-all duration-300 relative border-b border-white/5 last:border-0"
                            style={{
                              background: `linear-gradient(90deg, ${teamColor}60 0%, ${teamColor}15 40%, transparent 100%)`
                            }}
                          >
                            <td className="px-2 md:px-4 py-3 md:py-5 font-mono text-center relative z-10">
                              {renderRank(team.teamRank)}
                            </td>
                            <td className="px-2 md:px-4 py-3 md:py-5 font-black text-white text-lg md:text-2xl relative z-10">
                              {team.teamName}
                            </td>
                            <td className="px-2 md:px-4 py-3 md:py-5 text-slate-400 text-center relative z-10 font-medium">{team.gamesPlayed}</td>
                            <td className="px-2 md:px-4 py-3 md:py-5 text-slate-300 text-center relative z-10 font-bold">{team.wins}-{team.draws}-{team.losses}</td>
                            <td className="px-2 md:px-4 py-3 md:py-5 font-mono font-black text-cyan-400 text-center text-lg md:text-2xl relative z-10">{team.winRate.toFixed(3)}</td>
                            <td className="px-2 md:px-4 py-3 md:py-5 font-mono font-black text-teal-400 text-center text-lg md:text-2xl relative z-10">{team.gamesBehind.toFixed(1)}</td>
                            <td className="px-2 md:px-4 py-3 md:py-5 text-center relative z-10">
                              <span className={`px-3 py-1.5 rounded-lg text-sm font-black ${team.streak.includes('승') ? 'bg-red-500/20 text-red-400' : team.streak.includes('패') ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-500/20 text-slate-400'}`}>
                                {team.streak}
                              </span>
                            </td>
                            <td className="px-2 md:px-4 py-3 md:py-5 text-slate-400 text-center relative z-10 font-medium">{team.last10games || team.recent10games}</td>
                            <td className="px-2 md:px-4 py-3 md:py-5 text-slate-500 text-center text-sm md:text-base relative z-10">{team.homeRecord}</td>
                            <td className="px-2 md:px-4 py-3 md:py-5 text-slate-500 text-center text-sm md:text-base relative z-10">{team.awayRecord}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 2: RANK TREND CHART */}
              <div className="w-full bg-[#0a0f1e]/80 border border-white/10 rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-8 flex flex-col">
                <h3 className="text-base md:text-2xl font-black text-white mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
                  <span className="w-1.5 h-5 md:w-2 md:h-6 bg-cyan-500 rounded-full"></span>
                  순위 변동 그래프 (일자별)
                </h3>
                <div className="w-full h-[400px] md:h-[500px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                      <XAxis 
                        dataKey="displayDate" 
                        stroke="#94a3b8" 
                        tick={{ fill: '#94a3b8', fontSize: 12 }} 
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                      />
                      <YAxis 
                        reversed 
                        domain={[1, 10]} 
                        stroke="#94a3b8" 
                        tick={{ fill: '#94a3b8', fontSize: 12 }} 
                        tickLine={false}
                        axisLine={false}
                        width={40}
                        ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                        itemStyle={{ color: '#f8fafc', padding: '2px 0' }}
                        labelStyle={{ color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 'bold' }}
                        formatter={(value: number, name: string) => [`${value}위`, getKoreanTeamName(name)]}
                        labelFormatter={(label) => `${label} 순위`}
                        cursor={{ stroke: '#ffffff', strokeWidth: 1, strokeDasharray: '5 5', opacity: 0.5 }}
                      />
                      <Legend 
                        formatter={(value) => <span style={{ color: '#cbd5e1', fontSize: '12px', fontWeight: 'bold', marginRight: '10px' }}>{getKoreanTeamName(value)}</span>}
                        wrapperStyle={{ paddingTop: '20px' }}
                      />
                      {TEAMS.map((team) => (
                        <Line
                          key={team.code}
                          type="monotone"
                          dataKey={team.code}
                          stroke={team.color}
                          strokeWidth={3}
                          dot={{ r: 6, strokeWidth: 2, stroke: '#0f172a' }}
                          activeDot={{ r: 8, strokeWidth: 0 }}
                          name={team.code} // Use code here, formatter handles display
                          animationDuration={1500}
                          animationEasing="ease-in-out"
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-slate-500 mt-4 text-center">
                  * 실제 경기 데이터를 기반으로 한 일자별 순위 변동입니다.
                </p>
              </div>
            </motion.div>
          )}

          {viewMode === 'records' && (
            <motion.div
              key="records"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              {/* Marquee Leaderboard */}
              {teamStats.length > 0 && (
                <div className="bg-[#0a0f1e] border border-white/10 rounded-3xl p-6 md:p-8 overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
                  
                  <div className="flex overflow-hidden relative w-full">
                    <div className="flex animate-marquee whitespace-nowrap gap-8">
                      {/* Render metrics twice for seamless loop */}
                      {[...rotatingMetrics, ...rotatingMetrics].map((metric, mIdx) => {
                        const sortedTeams = [...teamStats].sort((a, b) => {
                          const valA = Number(a[metric.dataKey as keyof TeamPerformanceResponseDto]);
                          const valB = Number(b[metric.dataKey as keyof TeamPerformanceResponseDto]);
                          if (metric.dataKey === 'era') return valA - valB;
                          return valB - valA;
                        }).slice(0, 5);

                        return (
                          <div key={`${metric.dataKey}-${mIdx}`} className="flex flex-col md:flex-row items-center gap-8 bg-white/5 p-6 rounded-2xl border border-white/10 min-w-max">
                            <div className="flex-shrink-0 text-center md:text-left">
                              <h3 className="text-xl md:text-2xl font-black text-white mb-2">
                                {metric.title}
                              </h3>
                              <p className="text-slate-400 text-sm">2026 시즌 전체 구단 기준</p>
                            </div>
                            <div className="flex gap-4">
                              {sortedTeams.map((team, idx) => {
                                const teamInfo = TEAMS.find(t => t.name === team.teamName || t.koreanName === team.teamName) || TEAMS.find(t => t.id === team.teamId.toString());
                                const tColor = teamInfo?.color || '#334155';
                                const val = team[metric.dataKey as keyof TeamPerformanceResponseDto];
                                return (
                                  <div key={team.teamId} className="flex flex-col items-center bg-[#050814] border border-white/5 rounded-2xl p-4 min-w-[120px] relative overflow-hidden group">
                                    <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-[30px] opacity-20" style={{ backgroundColor: tColor }}></div>
                                    <div className="text-3xl font-black mb-1" style={{ color: tColor }}>
                                      {idx + 1}
                                    </div>
                                    <div className="text-sm font-bold text-white mb-2">{teamInfo?.koreanName || team.teamName}</div>
                                    <div className="text-xl font-mono text-slate-300 bg-white/5 px-3 py-1 rounded-lg">
                                      {metric.format(val)}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Team Stats */}
              {renderTeamStats()}
            </motion.div>
          )}

          {viewMode === 'players' && (
            <motion.div
              key="players"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* SECTION 2: STATS TABS with Maniac Mode Toggle */}
              <div className="mb-12 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-white/10 pb-6 relative">
                 {/* Tabs - Larger */}
                 <div className="flex flex-wrap gap-2 md:gap-4 justify-center md:justify-start">
                    <button 
                      onClick={() => setActiveTab('batter')}
                      className={`px-5 md:px-8 py-2 md:py-3 rounded-2xl text-base md:text-xl font-black transition-all ${activeTab === 'batter' ? 'bg-pink-500 text-white shadow-[0_0_20px_rgba(236,72,153,0.5)]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                    >
                      타자 기록
                    </button>
                    <button 
                      onClick={() => setActiveTab('pitcher')}
                      className={`px-5 md:px-8 py-2 md:py-3 rounded-2xl text-base md:text-xl font-black transition-all ${activeTab === 'pitcher' ? 'bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                    >
                      투수 기록
                    </button>
                 </div>
     
                 {/* Maniac Mode Toggle - Increased Size & Text */}
                 <div className="flex items-center gap-4 bg-gradient-to-r from-slate-900 to-black border border-white/10 px-6 py-3 rounded-full shadow-lg">
                    <span className="text-sm md:text-lg text-slate-400 font-bold whitespace-nowrap hidden sm:inline-block">
                      {isAdvanced ? "🤓 야구 좀 보시네요! 심화 분석 중" : "🤔 진짜 야구팬은 숫자의 깊이를 봅니다"}
                    </span>
                    <button 
                      onClick={() => setIsAdvanced(!isAdvanced)}
                      className={`relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none ${isAdvanced ? 'bg-brand-accent' : 'bg-slate-700'}`}
                    >
                       <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-sm ${isAdvanced ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                    <span className={`text-sm md:text-base font-black tracking-wider ${isAdvanced ? 'text-brand-accent' : 'text-slate-500'}`}>
                      {isAdvanced ? 'MANIAC ON' : 'OFF'}
                    </span>
                 </div>
              </div>
     
              {/* SECTION 3: LEADERBOARDS GRID */}
              <AnimatePresence mode="wait">
                <motion.div 
                  key={`${activeTab}-${isAdvanced ? 'advanced' : 'basic'}`}
                  initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -30, filter: 'blur(8px)' }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10"
                >
                  {getActiveMetrics().map((metric, mIdx) => {
                    const themeColor = activeTab === 'batter' ? '#ec4899' : '#06b6d4';
                    const shadowColor = activeTab === 'batter' ? 'rgba(236,72,153,0.3)' : 'rgba(6,182,212,0.3)';
                    
                    return (
                      <motion.div 
                        key={metric.key} 
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: mIdx * 0.15, ease: "easeOut" }}
                        className="relative bg-[#050814] rounded-xl p-6 md:p-8 flex flex-col group overflow-hidden"
                        style={{ 
                          border: `1px solid ${themeColor}40`,
                          boxShadow: `0 10px 40px -10px ${shadowColor}, inset 0 0 20px -10px ${shadowColor}`
                        }}
                      >
                        {/* Neon Ambient Glow */}
                        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[80px] opacity-20 pointer-events-none transition-opacity group-hover:opacity-40" style={{ backgroundColor: themeColor }}></div>
                        
                        <h4 className="text-2xl md:text-3xl font-black mb-8 relative z-10 flex items-center gap-3 tracking-tight" style={{ color: themeColor, textShadow: `0 0 15px ${themeColor}80` }}>
                          {metric.title}
                        </h4>
                        
                        <div className="flex-1 relative z-10">
                          {metric.items.length > 0 ? (
                            <ul className="space-y-4">
                              {metric.items.map((item, idx) => {
                                const isFirst = item.rank === 1;
                                const teamColor = getTeamColor(item.teamCode);
                                
                                return (
                                  <li 
                                    key={idx} 
                                    className={`flex items-center justify-between transition-all duration-300 ${
                                      isFirst 
                                        ? 'p-5 md:p-6 rounded-lg bg-white/10 border-l-4 shadow-2xl scale-105 my-6 backdrop-blur-sm' 
                                        : 'p-4 rounded-md bg-white/5 hover:bg-white/10 border border-white/5'
                                    }`}
                                    style={{ 
                                      borderLeftColor: isFirst ? teamColor : 'transparent',
                                      boxShadow: isFirst ? `0 10px 30px -10px ${teamColor}60` : 'none'
                                    }}
                                  >
                                    <div className="flex items-center gap-4 md:gap-5">
                                      <span className={`font-mono font-black text-center ${
                                        isFirst 
                                          ? 'text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_2px_10px_rgba(250,204,21,0.8)] w-10' 
                                          : 'text-xl md:text-2xl text-slate-500 w-8'
                                      }`}>
                                        {item.rank}
                                      </span>
                                      <div>
                                        <p className={`font-black text-white tracking-tight ${isFirst ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'}`}>
                                          {item.name}
                                        </p>
                                        {(item.subInfo || item.teamCode) && (
                                          <p className={`font-bold mt-1 ${isFirst ? 'text-sm md:text-base' : 'text-xs md:text-sm'}`} style={{ color: teamColor }}>
                                            {item.subInfo || getKoreanTeamName(item.teamCode!)}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <span className={`font-mono font-black tracking-tighter ${
                                        isFirst ? 'text-3xl md:text-4xl' : 'text-xl md:text-2xl'
                                      }`} style={{ color: isFirst ? '#fff' : themeColor, textShadow: isFirst ? `0 0 20px ${themeColor}` : 'none' }}>
                                        {item.value}
                                      </span>
                                      {item.unit && <span className={`block mt-0.5 ${isFirst ? 'text-sm text-slate-300' : 'text-xs text-slate-500'}`}>{item.unit}</span>}
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          ) : (
                            <div className="h-full flex items-center justify-center text-slate-500 text-lg py-10 font-light">
                              데이터가 없습니다.
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default TeamPlayerStats;
