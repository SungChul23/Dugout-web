
import { Team, Feature, TickerItem } from './types';

export const TEAMS: Team[] = [
  { 
    id: '1', 
    name: 'KIA TIGERS', 
    koreanName: 'KIA 타이거즈',
    code: 'KIA', 
    rank: 1, 
    winRate: 0.612, 
    gamesBehind: 0.0, 
    color: '#EA0029', // KIA Red
    ticketUrl: 'https://www.ticketlink.co.kr/sports/137/58'
  },
  { 
    id: '2', 
    name: 'SAMSUNG LIONS', 
    koreanName: '삼성 라이온즈',
    code: 'SAMSUNG', 
    rank: 2, 
    winRate: 0.543, 
    gamesBehind: 5.5, 
    color: '#074CA1', // Samsung Blue
    ticketUrl: 'https://www.ticketlink.co.kr/sports/137/57'
  },
  { 
    id: '3', 
    name: 'LG TWINS', 
    koreanName: 'LG 트윈스',
    code: 'LG', 
    rank: 3, 
    winRate: 0.528, 
    gamesBehind: 7.5, 
    color: '#C30452', // LG Magenta
    ticketUrl: 'https://www.ticketlink.co.kr/sports/137/59'
  },
  { 
    id: '4', 
    name: 'DOOSAN BEARS', 
    koreanName: '두산 베어스',
    code: 'DOOSAN', 
    rank: 4, 
    winRate: 0.515, 
    gamesBehind: 9.0, 
    color: '#1A1748', // Brighter Doosan Navy
    ticketUrl: 'https://ticket.interpark.com/Contents/Sports/GoodsInfo?SportsCode=07001&TeamCode=PB004'
  },
  { 
    id: '5', 
    name: 'KT WIZ', 
    koreanName: 'KT 위즈',
    code: 'KT', 
    rank: 5, 
    winRate: 0.493, 
    gamesBehind: 12.0, 
    color: '#FFFFFF', // KT White (changed from Black for visibility)
    ticketUrl: 'https://www.ticketlink.co.kr/sports/137/62'
  },
  { 
    id: '6', 
    name: 'SSG LANDERS', 
    koreanName: 'SSG 랜더스',
    code: 'SSG', 
    rank: 6, 
    winRate: 0.489, 
    gamesBehind: 12.5, 
    color: '#CE0E2D', // SSG Red
    ticketUrl: 'https://www.ticketlink.co.kr/sports/137/476'
  },
  { 
    id: '7', 
    name: 'HANWHA EAGLES', 
    koreanName: '한화 이글스',
    code: 'HANWHA', 
    rank: 7, 
    winRate: 0.470, 
    gamesBehind: 15.0, 
    color: '#FF6600', // Hanwha Orange
    ticketUrl: 'https://www.ticketlink.co.kr/sports/137/63'
  },
  { 
    id: '8', 
    name: 'LOTTE GIANTS', 
    koreanName: '롯데 자이언츠',
    code: 'LOTTE', 
    rank: 8, 
    winRate: 0.465, 
    gamesBehind: 15.5, 
    color: '#1E3A8A', // Brighter Lotte Navy
    ticketUrl: 'https://www.giantsclub.com/html/?pcode=339'
  },
  { 
    id: '9', 
    name: 'NC DINOS', 
    koreanName: 'NC 다이노스',
    code: 'NC', 
    rank: 9, 
    winRate: 0.450, 
    gamesBehind: 17.5, 
    color: '#315288', // NC Marine Blue
    ticketUrl: 'https://www.ncdinos.com/homepage.do'
  },
  { 
    id: '10', 
    name: 'KIWOOM HEROES', 
    koreanName: '키움 히어로즈',
    code: 'KIWOOM', 
    rank: 10, 
    winRate: 0.415, 
    gamesBehind: 22.0, 
    color: '#570514', // Kiwoom Burgundy
    ticketUrl: 'https://ticket.interpark.com/Contents/Sports/GoodsInfo?SportsCode=07001&TeamCode=PB003'
  },
];

export const FEATURES: Feature[] = [
  { id: '1', category: 'Game Data Center', title: 'KBO 팀/성적 순위', description: '실제 기록과 AI 보정 지표를 비교 분석' },
  { id: '2', category: 'Game Data Center', title: '경기 일정 & 결과', description: '전 구단 경기 일정 및 실시간 라인업 확인' },
  { id: '3', category: 'Game Data Center', title: '실시간 KBO 뉴스', description: '구단별 주요 속보와 이슈 큐레이션' },
  { id: '4', category: 'AI Predictive Insight', title: '선수 미래 성적 예측', description: '타율·OPS·엘리트 투수 등 시즌 종료 시점 성적 시뮬레이션' },
  { id: '5', category: 'AI Predictive Insight', title: '골든글러브 수상 예측', description: '데이터 기반 수상 확률 산출' },
  { id: '6', category: 'AI Predictive Insight', title: 'FA 시장 등급 분석', description: '예비 FA 선수의 가치와 리스크를 정량적으로 분석' },
  { id: '7', category: 'Fan Experience', title: '구단별 티켓 예매', description: '각 구단 예매 사이트 직링 및 일정 알림' },
  { id: '8', category: 'Fan Experience', title: '나의 팀 찾기', description: '당신의 야구취향 데이터를 분석해 가장 잘 맞는 구단을 추천' },
  { id: '9', category: 'Fan Experience', title: '야구 용어 & 룰 가이드', description: '초보부터 마니아까지, 야구를 구조적으로 이해하는 가이드' },
];

export const TICKER_ITEMS: TickerItem[] = [
  { id: '1', type: 'TREND', text: 'SYSTEM NOTICE', highlight: true },
  { id: '2', type: 'SPEED', text: '현재 실시간 데이터 파이프라인 구축 중입니다.' },
  { id: '3', type: 'PREDICTION', text: '2026 KBO 정규시즌 개막에 맞춰 정식 서비스가 시작됩니다.' },
  { id: '4', type: 'TICKET', text: '더그아웃 AI 분석 엔진 최적화 진행 중' },
  { id: '5', type: 'TREND', text: 'SYSTEM NOTICE', highlight: true },
  { id: '6', type: 'SPEED', text: '현재 실시간 데이터 파이프라인 구축 중입니다.' },
  { id: '7', type: 'PREDICTION', text: '2026 KBO 정규시즌 개막에 맞춰 정식 서비스가 시작됩니다.' },
  { id: '8', type: 'TICKET', text: '더그아웃 AI 분석 엔진 최적화 진행 중' },
];

// Mock Data for Dashboard
export const KEY_PLAYERS: Record<string, Array<{name: string, position: string, statLabel: string, statValue: string, aiPrediction: string, aiConfidence: number}>> = {
  'KIA 타이거즈': [
    { name: '김도영', position: '3B', statLabel: 'AVG', statValue: '0.347', aiPrediction: '0.352 (MVP 유력)', aiConfidence: 98 },
    { name: '양현종', position: 'SP', statLabel: 'ERA', statValue: '3.12', aiPrediction: '3.05 (10승 달성)', aiConfidence: 92 },
    { name: '나성범', position: 'RF', statLabel: 'HR', statValue: '18', aiPrediction: '25 HR 페이스', aiConfidence: 89 },
  ],
  '삼성 라이온즈': [
    { name: '구자욱', position: 'RF', statLabel: 'OPS', statValue: '0.980', aiPrediction: '1.020 (커리어하이)', aiConfidence: 95 },
    { name: '원태인', position: 'SP', statLabel: 'Wins', statValue: '9', aiPrediction: '14승 예측', aiConfidence: 91 },
    { name: '김영웅', position: '3B', statLabel: 'HR', statValue: '21', aiPrediction: '28 HR 달성', aiConfidence: 88 },
  ],
  'LG 트윈스': [
    { name: '홍창기', position: 'RF', statLabel: 'OBP', statValue: '0.450', aiPrediction: '0.465 (출루왕)', aiConfidence: 97 },
    { name: '오스틴', position: '1B', statLabel: 'RBI', statValue: '88', aiPrediction: '120 타점 페이스', aiConfidence: 94 },
    { name: '손주영', position: 'SP', statLabel: 'ERA', statValue: '3.50', aiPrediction: '3.38 (신인왕 경쟁)', aiConfidence: 85 },
  ],
  'SSG 랜더스': [
    { name: '최정', position: '3B', statLabel: 'HR', statValue: '24', aiPrediction: '35 HR (홈런왕 경쟁)', aiConfidence: 96 },
    { name: '에레디아', position: 'LF', statLabel: 'AVG', statValue: '0.362', aiPrediction: '0.355 (타격왕 경쟁)', aiConfidence: 93 },
    { name: '김광현', position: 'SP', statLabel: 'K', statValue: '105', aiPrediction: '150 K 달성', aiConfidence: 90 },
  ],
  // Fallback for others (Demo purpose)
  'default': [
    { name: '팀 에이스', position: 'SP', statLabel: 'ERA', statValue: '3.20', aiPrediction: '3.10 (상승세)', aiConfidence: 80 },
    { name: '4번 타자', position: '1B', statLabel: 'HR', statValue: '20', aiPrediction: '30 HR 예측', aiConfidence: 85 },
    { name: '특급 신인', position: 'RP', statLabel: 'Hold', statValue: '15', aiPrediction: '20 Hold 달성', aiConfidence: 75 },
  ]
};
