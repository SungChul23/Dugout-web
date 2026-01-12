

import React, { useState } from 'react';
import { TEAMS } from '../constants';

interface TeamPlayerStatsProps {
  onCancel: () => void;
}

// --- MOCK DATA TYPES ---

interface TeamRank {
  rank: number;
  name: string;
  played: number;
  win: number;
  draw: number;
  loss: number;
  winRate: string;
  gameBehind: number | string;
}

interface PredictedRank {
  rank: number;
  name: string;
  probability: number;
  change: 'up' | 'down' | 'same';
  changeVal: number;
  comment: string;
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

const ACTUAL_RANKING: TeamRank[] = [
  { rank: 1, name: 'KIA 타이거즈', played: 144, win: 87, draw: 2, loss: 55, winRate: '0.613', gameBehind: 0 },
  { rank: 2, name: '삼성 라이온즈', played: 144, win: 78, draw: 2, loss: 64, winRate: '0.549', gameBehind: 9.0 },
  { rank: 3, name: 'LG 트윈스', played: 144, win: 76, draw: 2, loss: 66, winRate: '0.535', gameBehind: 11.0 },
  { rank: 4, name: '두산 베어스', played: 144, win: 74, draw: 2, loss: 68, winRate: '0.521', gameBehind: 13.0 },
  { rank: 5, name: 'kt wiz', played: 144, win: 72, draw: 2, loss: 70, winRate: '0.507', gameBehind: 15.0 },
  { rank: 6, name: 'SSG 랜더스', played: 144, win: 72, draw: 2, loss: 70, winRate: '0.507', gameBehind: 15.0 },
  { rank: 7, name: '롯데 자이언츠', played: 144, win: 66, draw: 4, loss: 74, winRate: '0.471', gameBehind: 20.0 },
  { rank: 8, name: '한화 이글스', played: 144, win: 66, draw: 2, loss: 76, winRate: '0.465', gameBehind: 21.0 },
  { rank: 9, name: 'NC 다이노스', played: 144, win: 61, draw: 2, loss: 81, winRate: '0.430', gameBehind: 26.0 },
  { rank: 10, name: '키움 히어로즈', played: 144, win: 58, draw: 0, loss: 86, winRate: '0.403', gameBehind: 30.0 },
];

const PREDICTED_RANKING: PredictedRank[] = [
  { rank: 1, name: 'KIA 타이거즈', probability: 92.5, change: 'same', changeVal: 0, comment: '압도적 전력 유지' },
  { rank: 2, name: 'LG 트윈스', probability: 68.2, change: 'up', changeVal: 1, comment: '막판 스퍼트 예상' },
  { rank: 3, name: '삼성 라이온즈', probability: 65.4, change: 'down', changeVal: 1, comment: '불펜 불안요소 감지' },
  { rank: 4, name: 'kt wiz', probability: 55.1, change: 'up', changeVal: 1, comment: '마법 같은 후반기' },
  { rank: 5, name: '두산 베어스', probability: 51.8, change: 'down', changeVal: 1, comment: '부상 변수 발생' },
  { rank: 6, name: 'SSG 랜더스', probability: 48.2, change: 'same', changeVal: 0, comment: '5강 경쟁 치열' },
  { rank: 7, name: '한화 이글스', probability: 35.0, change: 'up', changeVal: 1, comment: '고춧가루 부대' },
  { rank: 8, name: '롯데 자이언츠', probability: 32.5, change: 'down', changeVal: 1, comment: '투타 엇박자' },
  { rank: 9, name: 'NC 다이노스', probability: 15.2, change: 'same', changeVal: 0, comment: '리빌딩 모드' },
  { rank: 10, name: '키움 히어로즈', probability: 8.5, change: 'same', changeVal: 0, comment: '유망주 경험치' },
];

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
    title: '팀 홈런 (HR)',
    key: 'hr',
    items: [
      { rank: 1, name: '삼성 라이온즈', value: 185, unit: '개', teamCode: 'SAMSUNG' },
      { rank: 2, name: 'KIA 타이거즈', value: 163, unit: '개', teamCode: 'KIA' },
      { rank: 3, name: 'NC 다이노스', value: 158, unit: '개', teamCode: 'NC' },
      { rank: 4, name: 'SSG 랜더스', value: 145, unit: '개', teamCode: 'SSG' },
      { rank: 5, name: '한화 이글스', value: 130, unit: '개', teamCode: 'HANWHA' },
    ]
  },
  {
    title: '팀 평균자책점 (ERA)',
    key: 'era',
    items: [
      { rank: 1, name: 'KIA 타이거즈', value: '4.40', teamCode: 'KIA' },
      { rank: 2, name: '두산 베어스', value: '4.55', teamCode: 'DOOSAN' },
      { rank: 3, name: 'LG 트윈스', value: '4.62', teamCode: 'LG' },
      { rank: 4, name: '삼성 라이온즈', value: '4.68', teamCode: 'SAMSUNG' },
      { rank: 5, name: 'kt wiz', value: '4.75', teamCode: 'KT' },
    ]
  },
  {
    title: '팀 OPS',
    key: 'ops',
    items: [
      { rank: 1, name: 'KIA 타이거즈', value: '0.830', teamCode: 'KIA' },
      { rank: 2, name: '삼성 라이온즈', value: '0.800', teamCode: 'SAMSUNG' },
      { rank: 3, name: 'LG 트윈스', value: '0.785', teamCode: 'LG' },
      { rank: 4, name: 'NC 다이노스', value: '0.780', teamCode: 'NC' },
      { rank: 5, name: 'SSG 랜더스', value: '0.772', teamCode: 'SSG' },
    ]
  },
  {
    title: '팀 득점 (Runs)',
    key: 'runs',
    items: [
      { rank: 1, name: 'KIA 타이거즈', value: 850, unit: '점', teamCode: 'KIA' },
      { rank: 2, name: 'LG 트윈스', value: 802, unit: '점', teamCode: 'LG' },
      { rank: 3, name: '두산 베어스', value: 785, unit: '점', teamCode: 'DOOSAN' },
      { rank: 4, name: '삼성 라이온즈', value: 750, unit: '점', teamCode: 'SAMSUNG' },
      { rank: 5, name: 'NC 다이노스', value: 740, unit: '점', teamCode: 'NC' },
    ]
  },
  {
    title: '팀 승률 (WPCT)',
    key: 'wpct',
    items: [
      { rank: 1, name: 'KIA 타이거즈', value: '0.613', teamCode: 'KIA' },
      { rank: 2, name: '삼성 라이온즈', value: '0.549', teamCode: 'SAMSUNG' },
      { rank: 3, name: 'LG 트윈스', value: '0.535', teamCode: 'LG' },
      { rank: 4, name: '두산 베어스', value: '0.521', teamCode: 'DOOSAN' },
      { rank: 5, name: 'kt wiz', value: '0.507', teamCode: 'KT' },
    ]
  },
];

const BATTER_METRICS_BASIC: MetricLeaderboard[] = [
  {
    title: '타율 (AVG)',
    key: 'avg',
    items: [
      { rank: 1, name: '에레디아', subInfo: 'SSG', value: '0.360', teamCode: 'SSG' },
      { rank: 2, name: '레이예스', subInfo: '롯데', value: '0.352', teamCode: 'LOTTE' },
      { rank: 3, name: '김도영', subInfo: 'KIA', value: '0.347', teamCode: 'KIA' },
      { rank: 4, name: '구자욱', subInfo: '삼성', value: '0.343', teamCode: 'SAMSUNG' },
      { rank: 5, name: '송성문', subInfo: '키움', value: '0.340', teamCode: 'KIWOOM' },
    ]
  },
  {
    title: '홈런 (HR)',
    key: 'hr',
    items: [
      { rank: 1, name: '김도영', subInfo: 'KIA', value: 38, unit: '개', teamCode: 'KIA' },
      { rank: 2, name: '데이비슨', subInfo: 'NC', value: 46, unit: '개', teamCode: 'NC' },
      { rank: 3, name: '구자욱', subInfo: '삼성', value: 33, unit: '개', teamCode: 'SAMSUNG' },
      { rank: 4, name: '최정', subInfo: 'SSG', value: 30, unit: '개', teamCode: 'SSG' },
      { rank: 5, name: '강백호', subInfo: 'KT', value: 26, unit: '개', teamCode: 'KT' },
    ]
  },
  {
    title: '타점 (RBI)',
    key: 'rbi',
    items: [
      { rank: 1, name: '오스틴', subInfo: 'LG', value: 132, unit: '점', teamCode: 'LG' },
      { rank: 2, name: '에레디아', subInfo: 'SSG', value: 118, unit: '점', teamCode: 'SSG' },
      { rank: 3, name: '구자욱', subInfo: '삼성', value: 115, unit: '점', teamCode: 'SAMSUNG' },
      { rank: 4, name: '데이비슨', subInfo: 'NC', value: 112, unit: '점', teamCode: 'NC' },
      { rank: 5, name: '김도영', subInfo: 'KIA', value: 109, unit: '점', teamCode: 'KIA' },
    ]
  },
  {
    title: 'OPS (출루+장타)',
    key: 'ops',
    items: [
      { rank: 1, name: '김도영', subInfo: 'KIA', value: '1.067', teamCode: 'KIA' },
      { rank: 2, name: '구자욱', subInfo: '삼성', value: '1.044', teamCode: 'SAMSUNG' },
      { rank: 3, name: '데이비슨', subInfo: 'NC', value: '0.985', teamCode: 'NC' },
      { rank: 4, name: '에레디아', subInfo: 'SSG', value: '0.945', teamCode: 'SSG' },
      { rank: 5, name: '송성문', subInfo: '키움', value: '0.932', teamCode: 'KIWOOM' },
    ]
  },
  {
    title: '도루 (SB)',
    key: 'sb',
    items: [
      { rank: 1, name: '조수행', subInfo: '두산', value: 64, unit: '개', teamCode: 'DOOSAN' },
      { rank: 2, name: '황성빈', subInfo: '롯데', value: 50, unit: '개', teamCode: 'LOTTE' },
      { rank: 3, name: '정수빈', subInfo: '두산', value: 48, unit: '개', teamCode: 'DOOSAN' },
      { rank: 4, name: '김도영', subInfo: 'KIA', value: 40, unit: '개', teamCode: 'KIA' },
      { rank: 5, name: '박해민', subInfo: 'LG', value: 38, unit: '개', teamCode: 'LG' },
    ]
  },
  {
    title: '안타 (Hits)',
    key: 'hits',
    items: [
      { rank: 1, name: '레이예스', subInfo: '롯데', value: 202, unit: '개', teamCode: 'LOTTE' },
      { rank: 2, name: '에레디아', subInfo: 'SSG', value: 198, unit: '개', teamCode: 'SSG' },
      { rank: 3, name: '김도영', subInfo: 'KIA', value: 189, unit: '개', teamCode: 'KIA' },
      { rank: 4, name: '송성문', subInfo: '키움', value: 175, unit: '개', teamCode: 'KIWOOM' },
      { rank: 5, name: '홍창기', subInfo: 'LG', value: 174, unit: '개', teamCode: 'LG' },
    ]
  },
];

const PITCHER_METRICS_BASIC: MetricLeaderboard[] = [
  {
    title: '평균자책점 (ERA)',
    key: 'era',
    items: [
      { rank: 1, name: '네일', subInfo: 'KIA', value: '2.53', teamCode: 'KIA' },
      { rank: 2, name: '하트', subInfo: 'NC', value: '2.69', teamCode: 'NC' },
      { rank: 3, name: '원태인', subInfo: '삼성', value: '3.66', teamCode: 'SAMSUNG' },
      { rank: 4, name: '윌커슨', subInfo: '롯데', value: '3.88', teamCode: 'LOTTE' },
      { rank: 5, name: '헤이수스', subInfo: '키움', value: '3.68', teamCode: 'KIWOOM' },
    ]
  },
  {
    title: '다승 (Wins)',
    key: 'win',
    items: [
      { rank: 1, name: '원태인', subInfo: '삼성', value: 15, unit: '승', teamCode: 'SAMSUNG' },
      { rank: 2, name: '곽빈', subInfo: '두산', value: 15, unit: '승', teamCode: 'DOOSAN' },
      { rank: 3, name: '네일', subInfo: 'KIA', value: 12, unit: '승', teamCode: 'KIA' },
      { rank: 4, name: '하트', subInfo: 'NC', value: 13, unit: '승', teamCode: 'NC' },
      { rank: 5, name: '헤이수스', subInfo: '키움', value: 13, unit: '승', teamCode: 'KIWOOM' },
    ]
  },
  {
    title: '탈삼진 (SO)',
    key: 'so',
    items: [
      { rank: 1, name: '하트', subInfo: 'NC', value: 182, unit: '개', teamCode: 'NC' },
      { rank: 2, name: '헤이수스', subInfo: '키움', value: 178, unit: '개', teamCode: 'KIWOOM' },
      { rank: 3, name: '엔스', subInfo: 'LG', value: 150, unit: '개', teamCode: 'LG' },
      { rank: 4, name: '쿠에바스', subInfo: 'KT', value: 145, unit: '개', teamCode: 'KT' },
      { rank: 5, name: '네일', subInfo: 'KIA', value: 138, unit: '개', teamCode: 'KIA' },
    ]
  },
  {
    title: '세이브 (SV)',
    key: 'sv',
    items: [
      { rank: 1, name: '정해영', subInfo: 'KIA', value: 31, unit: '세', teamCode: 'KIA' },
      { rank: 2, name: '오승환', subInfo: '삼성', value: 27, unit: '세', teamCode: 'SAMSUNG' },
      { rank: 3, name: '김원중', subInfo: '롯데', value: 25, unit: '세', teamCode: 'LOTTE' },
      { rank: 4, name: '주현상', subInfo: '한화', value: 23, unit: '세', teamCode: 'HANWHA' },
      { rank: 5, name: '유영찬', subInfo: 'LG', value: 22, unit: '세', teamCode: 'LG' },
    ]
  },
  {
    title: 'WHIP (이닝당 출루)',
    key: 'whip',
    items: [
      { rank: 1, name: '하트', subInfo: 'NC', value: '1.03', teamCode: 'NC' },
      { rank: 2, name: '후라도', subInfo: '키움', value: '1.18', teamCode: 'KIWOOM' },
      { rank: 3, name: '원태인', subInfo: '삼성', value: '1.20', teamCode: 'SAMSUNG' },
      { rank: 4, name: '코너', subInfo: '삼성', value: '1.23', teamCode: 'SAMSUNG' },
      { rank: 5, name: '헤이수스', subInfo: '키움', value: '1.25', teamCode: 'KIWOOM' },
    ]
  },
  {
    title: '홀드 (Hold)',
    key: 'hold',
    items: [
      { rank: 1, name: '노경은', subInfo: 'SSG', value: 38, unit: '홀', teamCode: 'SSG' },
      { rank: 2, name: '김재윤', subInfo: '삼성', value: 25, unit: '홀', teamCode: 'SAMSUNG' },
      { rank: 3, name: '임기영', subInfo: 'KIA', value: 22, unit: '홀', teamCode: 'KIA' },
      { rank: 4, name: '이영하', subInfo: '두산', value: 20, unit: '홀', teamCode: 'DOOSAN' },
      { rank: 5, name: '박영현', subInfo: 'KT', value: 18, unit: '홀', teamCode: 'KT' },
    ]
  },
];

// --- LEADERBOARDS DATA (ADVANCED) ---

const TEAM_METRICS_ADVANCED: MetricLeaderboard[] = [
  {
    title: '득점권 타율 (RISP)',
    key: 'risp',
    items: [
      { rank: 1, name: 'KIA 타이거즈', value: '0.320', teamCode: 'KIA' },
      { rank: 2, name: 'LG 트윈스', value: '0.305', teamCode: 'LG' },
      { rank: 3, name: '두산 베어스', value: '0.290', teamCode: 'DOOSAN' },
      { rank: 4, name: '삼성 라이온즈', value: '0.280', teamCode: 'SAMSUNG' },
      { rank: 5, name: '키움 히어로즈', value: '0.278', teamCode: 'KIWOOM' },
    ]
  },
  {
    title: '볼넷/삼진 (BB/SO)',
    key: 'bb_so',
    items: [
      { rank: 1, name: 'LG 트윈스', value: '0.70', teamCode: 'LG' },
      { rank: 2, name: 'KIA 타이거즈', value: '0.65', teamCode: 'KIA' },
      { rank: 3, name: '두산 베어스', value: '0.60', teamCode: 'DOOSAN' },
      { rank: 4, name: '삼성 라이온즈', value: '0.55', teamCode: 'SAMSUNG' },
      { rank: 5, name: 'kt wiz', value: '0.52', teamCode: 'KT' },
    ]
  },
  {
    title: '대타 타율 (PH-BA)',
    key: 'ph_ba',
    items: [
      { rank: 1, name: 'LG 트윈스', value: '0.310', teamCode: 'LG' },
      { rank: 2, name: 'KIA 타이거즈', value: '0.290', teamCode: 'KIA' },
      { rank: 3, name: '두산 베어스', value: '0.270', teamCode: 'DOOSAN' },
      { rank: 4, name: '롯데 자이언츠', value: '0.265', teamCode: 'LOTTE' },
      { rank: 5, name: '삼성 라이온즈', value: '0.250', teamCode: 'SAMSUNG' },
    ]
  },
  {
    title: '병살타 (GDP) *낮을수록 좋음',
    key: 'gdp',
    items: [
      { rank: 1, name: 'KIA 타이거즈', value: 90, unit: '개', teamCode: 'KIA' },
      { rank: 2, name: 'LG 트윈스', value: 95, unit: '개', teamCode: 'LG' },
      { rank: 3, name: '두산 베어스', value: 105, unit: '개', teamCode: 'DOOSAN' },
      { rank: 4, name: '삼성 라이온즈', value: 110, unit: '개', teamCode: 'SAMSUNG' },
      { rank: 5, name: '롯데 자이언츠', value: 112, unit: '개', teamCode: 'LOTTE' },
    ]
  },
  {
    title: '블론 세이브 (BSV) *낮을수록 좋음',
    key: 'bsv',
    items: [
      { rank: 1, name: 'KIA 타이거즈', value: 15, unit: '개', teamCode: 'KIA' },
      { rank: 2, name: 'LG 트윈스', value: 18, unit: '개', teamCode: 'LG' },
      { rank: 3, name: '삼성 라이온즈', value: 20, unit: '개', teamCode: 'SAMSUNG' },
      { rank: 4, name: '두산 베어스', value: 22, unit: '개', teamCode: 'DOOSAN' },
      { rank: 5, name: '한화 이글스', value: 24, unit: '개', teamCode: 'HANWHA' },
    ]
  },
  {
    title: '폭투+보크 (WP+BK) *낮을수록 좋음',
    key: 'wp_bk',
    items: [
      { rank: 1, name: '삼성 라이온즈', value: 37, unit: '개', teamCode: 'SAMSUNG' },
      { rank: 2, name: 'LG 트윈스', value: 42, unit: '개', teamCode: 'LG' },
      { rank: 3, name: 'KIA 타이거즈', value: 43, unit: '개', teamCode: 'KIA' },
      { rank: 4, name: '두산 베어스', value: 43, unit: '개', teamCode: 'DOOSAN' },
      { rank: 5, name: 'SSG 랜더스', value: 48, unit: '개', teamCode: 'SSG' },
    ]
  }
];

const BATTER_METRICS_ADVANCED: MetricLeaderboard[] = [
  {
    title: 'wRC+ (조정 득점 생산력)',
    key: 'wrc',
    items: [
      { rank: 1, name: '김도영', subInfo: 'KIA', value: '185.2', teamCode: 'KIA' },
      { rank: 2, name: '구자욱', subInfo: '삼성', value: '172.5', teamCode: 'SAMSUNG' },
      { rank: 3, name: '데이비슨', subInfo: 'NC', value: '168.0', teamCode: 'NC' },
      { rank: 4, name: '에레디아', subInfo: 'SSG', value: '160.5', teamCode: 'SSG' },
      { rank: 5, name: '오스틴', subInfo: 'LG', value: '155.8', teamCode: 'LG' },
    ]
  },
  {
    title: 'ISO (순수 장타율)',
    key: 'iso',
    items: [
      { rank: 1, name: '김도영', subInfo: 'KIA', value: '0.350', teamCode: 'KIA' },
      { rank: 2, name: '데이비슨', subInfo: 'NC', value: '0.340', teamCode: 'NC' },
      { rank: 3, name: '구자욱', subInfo: '삼성', value: '0.320', teamCode: 'SAMSUNG' },
      { rank: 4, name: '최정', subInfo: 'SSG', value: '0.305', teamCode: 'SSG' },
      { rank: 5, name: '강백호', subInfo: 'KT', value: '0.280', teamCode: 'KT' },
    ]
  },
  {
    title: 'BB/K (볼넷/삼진)',
    key: 'bb_k_batter',
    items: [
      { rank: 1, name: '홍창기', subInfo: 'LG', value: '1.25', teamCode: 'LG' },
      { rank: 2, name: '송성문', subInfo: '키움', value: '1.10', teamCode: 'KIWOOM' },
      { rank: 3, name: '박건우', subInfo: 'NC', value: '0.95', teamCode: 'NC' },
      { rank: 4, name: '김도영', subInfo: 'KIA', value: '0.92', teamCode: 'KIA' },
      { rank: 5, name: '구자욱', subInfo: '삼성', value: '0.88', teamCode: 'SAMSUNG' },
    ]
  },
  {
    title: 'BABIP (인플레이 타율)',
    key: 'babip',
    items: [
      { rank: 1, name: '에레디아', subInfo: 'SSG', value: '0.395', teamCode: 'SSG' },
      { rank: 2, name: '레이예스', subInfo: '롯데', value: '0.388', teamCode: 'LOTTE' },
      { rank: 3, name: '송성문', subInfo: '키움', value: '0.375', teamCode: 'KIWOOM' },
      { rank: 4, name: '김도영', subInfo: 'KIA', value: '0.370', teamCode: 'KIA' },
      { rank: 5, name: '구자욱', subInfo: '삼성', value: '0.365', teamCode: 'SAMSUNG' },
    ]
  },
  {
    title: 'WPA (승리 확률 기여)',
    key: 'wpa',
    items: [
      { rank: 1, name: '김도영', subInfo: 'KIA', value: '6.50', teamCode: 'KIA' },
      { rank: 2, name: '구자욱', subInfo: '삼성', value: '5.80', teamCode: 'SAMSUNG' },
      { rank: 3, name: '오스틴', subInfo: 'LG', value: '5.20', teamCode: 'LG' },
      { rank: 4, name: '최정', subInfo: 'SSG', value: '4.80', teamCode: 'SSG' },
      { rank: 5, name: '상우', subInfo: '키움', value: '4.50', teamCode: 'KIWOOM' },
    ]
  },
  {
    title: 'OPS+ (조정 OPS)',
    key: 'ops_plus',
    items: [
      { rank: 1, name: '김도영', subInfo: 'KIA', value: '190.5', teamCode: 'KIA' },
      { rank: 2, name: '구자욱', subInfo: '삼성', value: '180.2', teamCode: 'SAMSUNG' },
      { rank: 3, name: '데이비슨', subInfo: 'NC', value: '175.5', teamCode: 'NC' },
      { rank: 4, name: '에레디아', subInfo: 'SSG', value: '165.0', teamCode: 'SSG' },
      { rank: 5, name: '오스틴', subInfo: 'LG', value: '160.0', teamCode: 'LG' },
    ]
  }
];

const PITCHER_METRICS_ADVANCED: MetricLeaderboard[] = [
  {
    title: 'FIP (수비 무관 ERA)',
    key: 'fip',
    items: [
      { rank: 1, name: '하트', subInfo: 'NC', value: '2.50', teamCode: 'NC' },
      { rank: 2, name: '네일', subInfo: 'KIA', value: '2.80', teamCode: 'KIA' },
      { rank: 3, name: '엔스', subInfo: 'LG', value: '3.10', teamCode: 'LG' },
      { rank: 4, name: '쿠에바스', subInfo: 'KT', value: '3.25', teamCode: 'KT' },
      { rank: 5, name: '원태인', subInfo: '삼성', value: '3.40', teamCode: 'SAMSUNG' },
    ]
  },
  {
    title: 'K/9 (9이닝당 삼진)',
    key: 'k9',
    items: [
      { rank: 1, name: '하트', subInfo: 'NC', value: '11.5', teamCode: 'NC' },
      { rank: 2, name: '헤이수스', subInfo: '키움', value: '10.8', teamCode: 'KIWOOM' },
      { rank: 3, name: '엔스', subInfo: 'LG', value: '10.2', teamCode: 'LG' },
      { rank: 4, name: '쿠에바스', subInfo: 'KT', value: '9.8', teamCode: 'KT' },
      { rank: 5, name: '네일', subInfo: 'KIA', value: '9.5', teamCode: 'KIA' },
    ]
  },
  {
    title: 'BB/9 (9이닝당 볼넷) *낮을수록 좋음',
    key: 'bb9',
    items: [
      { rank: 1, name: '원태인', subInfo: '삼성', value: '1.8', teamCode: 'SAMSUNG' },
      { rank: 2, name: '윌커슨', subInfo: '롯데', value: '2.0', teamCode: 'LOTTE' },
      { rank: 3, name: '후라도', subInfo: '키움', value: '2.1', teamCode: 'KIWOOM' },
      { rank: 4, name: '네일', subInfo: 'KIA', value: '2.2', teamCode: 'KIA' },
      { rank: 5, name: '하트', subInfo: 'NC', value: '2.3', teamCode: 'NC' },
    ]
  },
  {
    title: 'ERA+ (조정 ERA)',
    key: 'era_plus',
    items: [
      { rank: 1, name: '네일', subInfo: 'KIA', value: '180', teamCode: 'KIA' },
      { rank: 2, name: '하트', subInfo: 'NC', value: '175', teamCode: 'NC' },
      { rank: 3, name: '원태인', subInfo: '삼성', value: '150', teamCode: 'SAMSUNG' },
      { rank: 4, name: '윌커슨', subInfo: '롯데', value: '145', teamCode: 'LOTTE' },
      { rank: 5, name: '헤이수스', subInfo: '키움', value: '140', teamCode: 'KIWOOM' },
    ]
  },
  {
    title: 'QS (퀄리티 스타트)',
    key: 'qs',
    items: [
      { rank: 1, name: '후라도', subInfo: '키움', value: 20, unit: '회', teamCode: 'KIWOOM' },
      { rank: 2, name: '헤이수스', subInfo: '키움', value: 18, unit: '회', teamCode: 'KIWOOM' },
      { rank: 3, name: '원태인', subInfo: '삼성', value: 17, unit: '회', teamCode: 'SAMSUNG' },
      { rank: 4, name: '하트', subInfo: 'NC', value: 17, unit: '회', teamCode: 'NC' },
      { rank: 5, name: '윌커슨', subInfo: '롯데', value: 16, unit: '회', teamCode: 'LOTTE' },
    ]
  },
  {
    title: 'LOB% (잔루율)',
    key: 'lob',
    items: [
      { rank: 1, name: '네일', subInfo: 'KIA', value: '82.5', unit: '%', teamCode: 'KIA' },
      { rank: 2, name: '하트', subInfo: 'NC', value: '80.0', unit: '%', teamCode: 'NC' },
      { rank: 3, name: '원태인', subInfo: '삼성', value: '78.5', unit: '%', teamCode: 'SAMSUNG' },
      { rank: 4, name: '후라도', subInfo: '키움', value: '77.0', unit: '%', teamCode: 'KIWOOM' },
      { rank: 5, name: '윌커슨', subInfo: '롯데', value: '76.5', unit: '%', teamCode: 'LOTTE' },
    ]
  }
];

const TeamPlayerStats: React.FC<TeamPlayerStatsProps> = ({ onCancel }) => {
  const [activeTab, setActiveTab] = useState<'batter' | 'pitcher' | 'team'>('team');
  const [isAdvanced, setIsAdvanced] = useState(false); // Maniac Mode State

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

  return (
    <div className="relative z-10 w-full animate-fade-in-up min-h-screen pb-20">
      <div className="w-[95%] max-w-[1600px] mx-auto px-4 md:px-8 py-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6 border-b border-white/5 pb-8">
          <div>
            <div className="inline-flex items-center space-x-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-3 py-1 mb-4 backdrop-blur-sm">
               <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
               <span className="text-[10px] md:text-xs font-mono text-cyan-400">2026 Season Analytics Center</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-2">
              KBO <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">STATS & RANKING</span>
            </h2>
            <p className="text-slate-400 text-lg font-light">
              실제 데이터와 <span className="text-white font-bold">더그아웃</span>이 예측한 미래 순위의 정밀 분석
            </p>
          </div>
          <button 
            onClick={onCancel}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors border border-white/10 px-6 py-3 rounded-xl hover:bg-white/5 bg-[#0a0f1e]"
          >
            <span className="text-sm font-bold">메인으로</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* SECTION 1: RANKING COMPARISON */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-16">
          
          {/* Actual Ranking */}
          <div className="bg-[#0a0f1e]/80 border border-white/10 rounded-3xl p-6 md:p-8">
            <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-slate-500 rounded-full"></span>
              2026 KBO 정규리그 순위
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-slate-500 uppercase font-bold border-b border-white/5">
                  <tr>
                    <th className="px-4 py-3">Rank</th>
                    <th className="px-4 py-3">Team</th>
                    <th className="px-4 py-3">G</th>
                    <th className="px-4 py-3">W-D-L</th>
                    <th className="px-4 py-3 text-cyan-400">Win Rate</th>
                    <th className="px-4 py-3">GB</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {ACTUAL_RANKING.map((team) => (
                    <tr key={team.name} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-300">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded ${team.rank <= 5 ? 'bg-slate-700 text-white' : 'bg-transparent text-slate-500'}`}>
                          {team.rank}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-white text-lg">{team.name}</td>
                      <td className="px-4 py-3 text-slate-400">{team.played}</td>
                      <td className="px-4 py-3 text-slate-400">{team.win}-{team.draw}-{team.loss}</td>
                      <td className="px-4 py-3 font-mono font-bold text-cyan-400 text-lg">{team.winRate}</td>
                      <td className="px-4 py-3 text-slate-500">{team.gameBehind}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Predicted Ranking */}
          <div className="bg-gradient-to-br from-[#0f172a] to-[#1e1b4b] border border-cyan-500/30 rounded-3xl p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none"></div>
            
            <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3 relative z-10">
              <span className="w-1.5 h-6 bg-cyan-400 rounded-full animate-pulse"></span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                DUGOUT Predicted Final Ranking
              </span>
            </h3>
            <div className="overflow-x-auto relative z-10">
              <table className="w-full text-sm text-left">
                <thead className="text-blue-300/70 uppercase font-bold border-b border-white/5">
                  <tr>
                    <th className="px-4 py-3">Pred Rank</th>
                    <th className="px-4 py-3">Team</th>
                    <th className="px-4 py-3">Trend</th>
                    <th className="px-4 py-3">Analysis Comment</th>
                    <th className="px-4 py-3 text-right">Probability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {PREDICTED_RANKING.map((team) => (
                    <tr key={team.name} className="hover:bg-white/5 transition-colors group">
                      <td className="px-4 py-3 font-mono font-bold text-white">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded ${team.rank === 1 ? 'bg-yellow-500 text-black' : team.rank <= 5 ? 'bg-blue-600 text-white' : 'bg-transparent text-blue-400'}`}>
                          {team.rank}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-blue-100 text-lg">{team.name}</td>
                      <td className="px-4 py-3">
                        {team.change === 'up' && <span className="text-red-400 flex items-center gap-1 font-bold">▲ {team.changeVal}</span>}
                        {team.change === 'down' && <span className="text-blue-400 flex items-center gap-1 font-bold">▼ {team.changeVal}</span>}
                        {team.change === 'same' && <span className="text-slate-500">-</span>}
                      </td>
                      <td className="px-4 py-3 text-blue-200 text-xs">{team.comment}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-400" style={{ width: `${team.probability}%` }}></div>
                          </div>
                          <span className="font-mono text-cyan-400">{team.probability}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SECTION 2: STATS TABS with Maniac Mode Toggle */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-white/10 pb-4">
           {/* Tabs */}
           <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => setActiveTab('team')}
                className={`px-6 py-2 rounded-xl text-lg font-bold transition-all ${activeTab === 'team' ? 'bg-white text-black' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
              >
                팀 기록
              </button>
              <button 
                onClick={() => setActiveTab('batter')}
                className={`px-6 py-2 rounded-xl text-lg font-bold transition-all ${activeTab === 'batter' ? 'bg-pink-500 text-white' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
              >
                타자 기록
              </button>
              <button 
                onClick={() => setActiveTab('pitcher')}
                className={`px-6 py-2 rounded-xl text-lg font-bold transition-all ${activeTab === 'pitcher' ? 'bg-cyan-500 text-white' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
              >
                투수 기록
              </button>
           </div>

           {/* Maniac Mode Toggle */}
           <div className="flex items-center gap-3 bg-gradient-to-r from-slate-900 to-black border border-white/10 px-5 py-2 rounded-full shadow-lg">
              <span className="text-xs text-slate-400 font-medium whitespace-nowrap hidden sm:inline-block">
                {isAdvanced ? "🤓 야구 좀 보시네요! 심화 분석 중" : "🤔 진짜 야구팬은 숫자의 깊이를 봅니다"}
              </span>
              <button 
                onClick={() => setIsAdvanced(!isAdvanced)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${isAdvanced ? 'bg-brand-accent' : 'bg-slate-700'}`}
              >
                 <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm ${isAdvanced ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
              <span className={`text-xs font-black tracking-wider ${isAdvanced ? 'text-brand-accent' : 'text-slate-500'}`}>
                {isAdvanced ? 'MANIAC ON' : 'OFF'}
              </span>
           </div>
        </div>

        {/* STATS CONTENT: RANKING CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
          {getActiveMetrics().map((metric) => (
            <div key={metric.key} className="bg-[#0a0f1e] border border-white/10 rounded-[2rem] overflow-hidden flex flex-col shadow-lg hover:border-white/20 transition-all duration-300">
              {/* Header */}
              <div className="px-6 py-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <h4 className={`text-xl font-bold ${activeTab === 'batter' ? 'text-pink-500' : activeTab === 'pitcher' ? 'text-cyan-400' : 'text-white'}`}>{metric.title}</h4>
                <div className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded border border-white/5 font-bold">TOP 5</div>
              </div>

              {/* 1st Place - Hero Section */}
              <div className="p-6 flex items-center justify-between relative overflow-hidden">
                {/* Background Glow */}
                <div 
                  className="absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-10 blur-2xl" 
                  style={{ backgroundColor: getTeamColor(metric.items[0].teamCode) }}
                ></div>

                <div className="flex flex-col items-start z-10">
                   <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-black font-black text-sm shadow-lg shadow-yellow-500/20">1</div>
                      <span className="text-3xl font-black text-white">{metric.items[0].value}<span className="text-base font-normal text-slate-400 ml-1">{metric.items[0].unit}</span></span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-lg font-bold text-slate-200">{metric.items[0].name}</span>
                      {metric.items[0].subInfo && <span className="text-sm text-slate-500">{metric.items[0].subInfo}</span>}
                   </div>
                </div>

                {/* Team Logo / Symbol */}
                <div className="z-10">
                   <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-2xl border-2 border-white/10"
                      style={{ backgroundColor: getTeamColor(metric.items[0].teamCode) }}
                   >
                     {metric.items[0].teamCode || metric.items[0].name.substring(0, 2)}
                   </div>
                </div>
              </div>

              {/* 2nd ~ 5th Place - List */}
              <div className="flex-1 bg-[#0f1629]">
                 {metric.items.slice(1).map((item) => (
                   <div key={item.rank} className="flex items-center justify-between px-6 py-4 border-t border-white/5 hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-4">
                         <span className="text-slate-500 font-mono font-bold w-4">{item.rank}</span>
                         <div className="flex items-center gap-3">
                            <div className="w-2 h-8 rounded-full" style={{ backgroundColor: getTeamColor(item.teamCode) }}></div>
                            <div className="flex flex-col">
                               <span className="text-base font-bold text-slate-300">{item.name}</span>
                               {item.subInfo && <span className="text-xs text-slate-500">{item.subInfo}</span>}
                            </div>
                         </div>
                      </div>
                      <span className="text-lg font-mono font-bold text-white">{item.value}<span className="text-xs font-normal text-slate-500 ml-1">{item.unit}</span></span>
                   </div>
                 ))}
              </div>
              
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default TeamPlayerStats;
