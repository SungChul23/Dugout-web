export interface PostseasonRoundRule {
  id: 'WILD_CARD' | 'SEMI_PLAYOFF' | 'PLAYOFF' | 'KOREAN_SERIES';
  name: string;
  shortName: string;
  badge: string;
  format: string; // 예: "최대 2경기", "5전 3선승제"
  advantage: string;
  description: string;
  statusText: string;
  gamesTimeline: {
    gameNo: number;
    homeType: 'HIGHER' | 'LOWER';
    label: string;
    note?: string;
  }[];
  homeNote?: string;
}

export const POSTSEASON_RULES: Record<string, PostseasonRoundRule> = {
  WILD_CARD: {
    id: 'WILD_CARD',
    name: '와일드카드 결정전',
    shortName: 'WILD CARD',
    badge: '🍁 Wild Card',
    format: '최대 2경기 (4위 1승 어드밴티지)',
    advantage: '4위 팀에게 1승 어드밴티지 부여 (4위는 1무 또는 1승시 준PO 진출, 5위는 2승을 거둬야 진출)',
    description: '정규시즌 4위와 5위 팀이 맞붙는 포스트시즌 첫 관문',
    statusText: '1차전 승리 시 4위 확정 / 5위 연승 필요',
    homeNote: '4위 팀이 1~2차전 모두 홈경기 개최',
    gamesTimeline: [
      { gameNo: 1, homeType: 'HIGHER', label: '1차전 (4위 홈)', note: '4위 승/무시 종료' },
      { gameNo: 2, homeType: 'HIGHER', label: '2차전 (4위 홈)', note: '5위가 1차전 승리시 진행' },
    ]
  },
  SEMI_PLAYOFF: {
    id: 'SEMI_PLAYOFF',
    name: '준플레이오프',
    shortName: '준PO',
    badge: '🍁 Semi-Playoff',
    format: '5전 3선승제',
    advantage: '없음 (정규시즌 3위 팀이 1·2·5차전 홈 우위)',
    description: '정규시즌 3위 팀과 와일드카드 승자 팀의 5전 3선승제 대결',
    statusText: '3승 선점 시 플레이오프 진출',
    homeNote: '3위 팀이 1·2·5차전, WC 승자 팀이 3·4차전 홈',
    gamesTimeline: [
      { gameNo: 1, homeType: 'HIGHER', label: '1차전 (3위 홈)' },
      { gameNo: 2, homeType: 'HIGHER', label: '2차전 (3위 홈)' },
      { gameNo: 3, homeType: 'LOWER', label: '3차전 (상대 홈)' },
      { gameNo: 4, homeType: 'LOWER', label: '4차전 (상대 홈)', note: '필요시' },
      { gameNo: 5, homeType: 'HIGHER', label: '5차전 (3위 홈)', note: '필요시' },
    ]
  },
  PLAYOFF: {
    id: 'PLAYOFF',
    name: '플레이오프',
    shortName: '플레이오프',
    badge: '🔥 Playoff',
    format: '5전 3선승제',
    advantage: '없음 (정규시즌 2위 팀이 1·2·5차전 홈 우위)',
    description: '정규시즌 2위 팀과 준플레이오프 승자 팀의 한국시리즈 진출전',
    statusText: '3승 선점 시 한국시리즈 진출',
    homeNote: '2위 팀이 1·2·5차전, 준PO 승자 팀이 3·4차전 홈',
    gamesTimeline: [
      { gameNo: 1, homeType: 'HIGHER', label: '1차전 (2위 홈)' },
      { gameNo: 2, homeType: 'HIGHER', label: '2차전 (2위 홈)' },
      { gameNo: 3, homeType: 'LOWER', label: '3차전 (상대 홈)' },
      { gameNo: 4, homeType: 'LOWER', label: '4차전 (상대 홈)', note: '필요시' },
      { gameNo: 5, homeType: 'HIGHER', label: '5차전 (2위 홈)', note: '필요시' },
    ]
  },
  KOREAN_SERIES: {
    id: 'KOREAN_SERIES',
    name: '한국시리즈',
    shortName: '한국시리즈',
    badge: '🏆 Korean Series',
    format: '7전 4선승제',
    advantage: '1위 직행 어드밴티지 및 1·2·6·7차전 홈 우위',
    description: 'KBO 리그 최후의 왕좌를 가리는 챔피언십 시리즈',
    statusText: '4승 선점 시 2026 KBO 통합 우승',
    homeNote: 'KBO 공식 규정 (2-3-2 방식): 1위 1·2·6·7차전 홈 / PO 승자 3·4·5차전 홈 (※ 중립구장 배치 등 일정에 따라 구장 배정은 일부 변동될 수 있습니다)',
    gamesTimeline: [
      { gameNo: 1, homeType: 'HIGHER', label: '1차전 (1위 홈)' },
      { gameNo: 2, homeType: 'HIGHER', label: '2차전 (1위 홈)' },
      { gameNo: 3, homeType: 'LOWER', label: '3차전 (상대 홈)' },
      { gameNo: 4, homeType: 'LOWER', label: '4차전 (상대 홈)' },
      { gameNo: 5, homeType: 'LOWER', label: '5차전 (상대 홈)', note: '필요시' },
      { gameNo: 6, homeType: 'HIGHER', label: '6차전 (1위 홈)', note: '필요시' },
      { gameNo: 7, homeType: 'HIGHER', label: '7차전 (1위 홈)', note: '필요시' },
    ]
  }
};
