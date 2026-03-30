import { TeamPerformanceResponseDto } from '../types';

export type MetricCategory = 'batter' | 'pitcher' | 'defense';
export type MetricLevel = 'general' | 'advanced';

export interface MetricConfig {
  id: string;
  name: string;
  column: string;
  description: string;
  key: keyof TeamPerformanceResponseDto;
  format: (val: number) => string;
}

const formatDecimal3 = (val: number) => val.toFixed(3);
const formatDecimal2 = (val: number) => val.toFixed(2);
const formatInteger = (val: number) => val.toString();

export const batterMetrics: Record<MetricLevel, MetricConfig[]> = {
  general: [
    { id: 'avg', name: '팀 타율', column: 'avg_h2', description: '팀 공격의 가장 기본적인 정확도 지표', key: 'avg', format: formatDecimal3 },
    { id: 'hr', name: '홈런', column: 'hr_h1', description: '팀의 슬러거 파워와 득점 생산의 핵심', key: 'hr', format: formatInteger },
    { id: 'runs', name: '득점', column: 'r_h1', description: '공격의 최종 결과물 (가장 직관적)', key: 'runs', format: formatInteger },
    { id: 'hits', name: '안타', column: 'h_h1', description: '팀의 누적 타격 횟수', key: 'hits', format: formatInteger },
    { id: 'rbi', name: '타점', column: 'rbi_h1', description: '찬스에서의 해결사 능력', key: 'rbi', format: formatInteger },
    { id: 'obp', name: '출루율', column: 'obp_h2', description: '얼마나 끈질기게 베이스에 나가는가', key: 'obp', format: formatDecimal3 },
  ],
  advanced: [
    { id: 'ops', name: 'OPS', column: 'ops_h2', description: '출루율+장타율. 현대 야구 타격 평가의 표준', key: 'ops', format: formatDecimal3 },
    { id: 'risp', name: '득점권 타율', column: 'risp_h2', description: '찬스 상황(RISP)에서의 집중력 (팬들이 가장 민감함)', key: 'risp', format: formatDecimal3 },
    { id: 'slg', name: '장타율', column: 'slg_h2', description: '타구의 질과 베이스 진루 능력', key: 'slg', format: formatDecimal3 },
    { id: 'phBa', name: '대타 타율', column: 'ph_ba_h2', description: '벤치 뎁스와 대타 작전의 성공률', key: 'phBa', format: formatDecimal3 },
    { id: 'multiHit', name: '멀티히트', column: 'mh_h2', description: '한 경기 2안타 이상 기록 횟수 (팀의 타격 컨디션)', key: 'multiHit', format: formatInteger },
    { id: 'totalBases', name: '루타 수', column: 'tb_h1', description: '단타보다 가중치를 둔 생산성 지표', key: 'totalBases', format: formatInteger },
  ]
};

export const pitcherMetrics: Record<MetricLevel, MetricConfig[]> = {
  general: [
    { id: 'era', name: '평균자책점', column: 'era_p1', description: '투수진의 실력 지표 (낮을수록 강팀)', key: 'era', format: formatDecimal2 },
    { id: 'wins', name: '팀 승리', column: 'w_p1', description: '투수들이 지켜낸 승리 횟수', key: 'wins', format: formatInteger },
    { id: 'so', name: '탈삼진', column: 'so_p1', description: '구위가 압도적인 팀인지 확인', key: 'so', format: formatInteger },
    { id: 'sv', name: '세이브', column: 'sv_p1', description: '뒷문(클로저)의 안정감', key: 'sv', format: formatInteger },
    { id: 'hld', name: '홀드', column: 'hld_p1', description: '허리(중간계투)의 탄탄함', key: 'hld', format: formatInteger },
    { id: 'wpct', name: '팀 승률', column: 'wpct_p1', description: '투수진의 승리 기여 효율', key: 'wpct', format: formatDecimal3 },
  ],
  advanced: [
    { id: 'whip', name: 'WHIP', column: 'whip_p1', description: '이닝당 출루 허용률 (마운드의 안정감)', key: 'whip', format: formatDecimal2 },
    { id: 'qs', name: '퀄리티 스타트', column: 'qs_p2', description: '선발진이 6이닝 3자책 이하로 던진 횟수', key: 'qs', format: formatInteger },
    { id: 'oppAvg', name: '피안타율', column: 'avg_p2', description: '상대 타자가 우리 투수진을 공략하기 힘든 정도', key: 'oppAvg', format: formatDecimal3 },
    { id: 'bsv', name: '블론세이브', column: 'bsv_p2', description: '승리를 놓친 횟수 (불펜의 불안 요소 지표)', key: 'bsv', format: formatInteger },
    { id: 'np', name: '투구수', column: 'np_p2', description: '팀 전체 투수의 어깨 소모도 측정', key: 'np', format: formatInteger },
    { id: 'hrAllowed', name: '피홈런', column: 'hr_p1', description: '투수진의 피장타 억제 능력', key: 'hrAllowed', format: formatInteger },
  ]
};

export const defenseMetrics: Record<MetricLevel, MetricConfig[]> = {
  general: [
    { id: 'sb', name: '도루 성공', column: 'sb_r', description: '팀이 베이스를 얼마나 적극적으로 훔쳤는지 보여주는 기동력 지표', key: 'sb', format: formatInteger },
    { id: 'sbRate', name: '도루 성공률', column: 'sb_rate_r', description: '시도 대비 성공 비율로, 주루의 효율성과 정확도를 평가', key: 'sbRate', format: formatDecimal3 },
    { id: 'error', name: '실책', column: 'e_d', description: '수비 실수의 총합. 낮을수록 기본기가 탄탄한 팀임을 증명', key: 'error', format: formatInteger },
    { id: 'fpct', name: '수비율', column: 'fpct_d', description: '전체 수비 기회 중 실책 없이 처리한 비율 (수비 안정성)', key: 'fpct', format: formatDecimal3 },
    { id: 'dp', name: '병살 유도', column: 'dp_d', description: '내야 수비의 조직력과 위기 관리 능력을 보여주는 지표', key: 'dp', format: formatInteger },
    { id: 'csRate', name: '도루 저지율', column: 'cs_rate_d', description: '상대 주자의 도루를 잡아낸 비율 (포수/투수의 수비 핵심)', key: 'csRate', format: formatDecimal3 },
  ],
  advanced: [
    { id: 'oob', name: '주루사', column: 'oob_r', description: '진루 과정에서 아웃된 횟수. 과감함과 무모함 사이의 판단력 척도', key: 'oob', format: formatInteger },
    { id: 'sba', name: '도루 시도', column: 'sba_r', description: '결과와 상관없이 얼마나 공격적인 주루 성향을 가졌는지 확인', key: 'sba', format: formatInteger },
    { id: 'pkoR', name: '견제사 당함', column: 'pko_r', description: '베이스 러닝 중 상대 견제에 걸린 횟수 (주자의 집중력 지표)', key: 'pkoR', format: formatInteger },
    { id: 'pkoD', name: '견제사 (수비)', column: 'pko_d', description: '수비 시 투수나 포수의 견제로 주자를 잡아낸 횟수', key: 'pkoD', format: formatInteger },
    { id: 'cs', name: '도루 저지', column: 'cs_d', description: '도루를 시도하는 주자를 잡아낸 총 횟수 (Raw Count)', key: 'cs', format: formatInteger },
    { id: 'sbAllowed', name: '도루 허용', column: 'sb_d', description: '수비 시 상대 팀에게 내준 도루 횟수 (배터리의 주자 억제력)', key: 'sbAllowed', format: formatInteger },
  ]
};
