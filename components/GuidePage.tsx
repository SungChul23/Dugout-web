import React, { useState } from 'react';

// --- TERMINOLOGY DATA ---
const PITCHER_TRADITIONAL = [
  { abbr: 'W', name: '승', desc: '팀이 승리하고, 해당 투수가 승리 조건 충족 시 부여' },
  { abbr: 'L', name: '패', desc: '팀이 패배하고, 해당 투수가 결정적인 실점을 했을 경우' },
  { abbr: 'SV', name: '세이브', desc: '마무리 투수가 리드를 지키고 경기를 끝낼 경우' },
  { abbr: 'H', name: '홀드', desc: '중간 투수가 리드를 유지한 채 다음 투수에게 넘길 경우' },
  { abbr: 'BS', name: '블론 세이브', desc: '세이브 상황에서 동점을 허용한 경우' },
  { abbr: 'QS', name: '퀄리티 스타트', desc: '6이닝 이상, 3자책점 이하의 선발투수 성적' },
  { abbr: 'CG', name: '완투', desc: '한 투수가 전 이닝을 모두 책임짐' },
  { abbr: 'SHO', name: '완봉', desc: '완투 + 실점 0점' },
  { abbr: 'IP', name: '이닝', desc: '던진 이닝 수 (1이닝 = 3아웃)' },
  { abbr: 'ER', name: '자책점', desc: '투수 책임 실점 (수비 실책 제외)' },
  { abbr: 'ERA', name: '평균자책점', desc: '(자책점 × 9) ÷ 이닝 — 투수 실력 대표 지표', highlight: true },
  { abbr: 'SO / K', name: '삼진', desc: '타자를 아웃시킨 수 (헛스윙 or 루킹)' },
  { abbr: 'BB', name: '볼넷', desc: '스트라이크 존 벗어난 공 4개로 타자 출루' },
  { abbr: 'HBP', name: '사구', desc: '몸에 맞는 공 (자동 출루)' },
  { abbr: 'NP', name: '투구 수', desc: '총 던진 공의 수' },
];

const PITCHER_ADVANCED = [
  { abbr: 'WHIP', name: '이닝당 주자 허용', desc: '(볼넷 + 피안타) ÷ 이닝 — 주자 억제 능력' },
  { abbr: 'K/9', name: '9이닝당 삼진', desc: '(삼진 × 9) ÷ 이닝 — 탈삼진 능력' },
  { abbr: 'BB/9', name: '9이닝당 볼넷', desc: '(볼넷 × 9) ÷ 이닝 — 제구 능력' },
  { abbr: 'K/BB', name: '삼진:볼넷 비율', desc: '높은 비율일수록 제구 + 탈삼진 우수' },
  { abbr: 'FIP', name: '수비 무관 ERA', desc: '삼진, 볼넷, 홈런만 고려해 투수 능력을 평가', highlight: true },
  { abbr: 'xFIP', name: '조정 FIP', desc: 'FIP에서 홈런 비율을 리그 평균으로 보정' },
  { abbr: 'ERA+', name: '리그 대비 ERA', desc: '리그 평균 ERA와 비교 (100 이상이면 평균 이상)' },
  { abbr: 'LOB%', name: '잔루율', desc: '주자를 홈에 들여보내지 않고 막은 비율' },
  { abbr: 'GB%', name: '땅볼 비율', desc: '땅볼 타구 비율 — 타구 유형 중 수비 유리' },
  { abbr: 'FB%', name: '뜬공 비율', desc: '뜬공 비율 — 피홈런 위험과 직결됨' },
  { abbr: 'HR/9', name: '9이닝당 피홈런', desc: '투수의 장타 억제 능력 평가 지표' },
];

const BATTER_BASIC = [
  { abbr: 'AVG', name: '타율', desc: '안타 ÷ 타수 — 0.300 이상이면 우수', highlight: true },
  { abbr: 'H', name: '안타', desc: '타자가 타격으로 1루 이상 진루' },
  { abbr: 'HR', name: '홈런', desc: '담장을 넘기는 타구 — 주자 모두 득점', highlight: true },
  { abbr: 'RBI', name: '타점', desc: '타격으로 주자가 홈을 밟은 수' },
  { abbr: 'R', name: '득점', desc: '타자가 직접 홈을 밟아 얻은 점수' },
  { abbr: 'SB', name: '도루', desc: '투수의 틈을 타 다음 루로 이동' },
  { abbr: 'BB', name: '볼넷', desc: '4볼로 1루 출루' },
  { abbr: 'SO', name: '삼진', desc: '타자가 스트라이크 아웃 당한 경우' },
  { abbr: 'GIDP', name: '병살타', desc: '타구로 인해 2명의 주자가 동시에 아웃' },
  { abbr: 'OBP', name: '출루율', desc: '(안타+볼넷+사구) ÷ (타수+볼넷+사구+희생플라이)' },
  { abbr: 'SLG', name: '장타율', desc: '총 루타 ÷ 타수 — 파워를 보여주는 지표' },
  { abbr: 'OPS', name: '종합 공격력', desc: '출루율 + 장타율 — 공격력 종합 지표', highlight: true },
];

const BATTER_ADVANCED = [
  { abbr: 'OPS+', name: '리그 대비 OPS', desc: 'OPS를 리그 및 구장 보정한 지표 (100 기준)' },
  { abbr: 'wOBA', name: '가중 출루율', desc: '출루마다 다른 가중치를 적용한 정확한 공격 지표' },
  { abbr: 'wRC+', name: '가중 득점 창출력', desc: '리그 평균 대비 득점 기여도 (100 기준)', highlight: true },
  { abbr: 'ISO', name: '순수 장타력', desc: 'SLG - AVG — 장타력만 분리한 파워 지표' },
  { abbr: 'BABIP', name: '인플레이 타구 타율', desc: '홈런/볼넷/삼진 제외 안타율 — 운 영향도 있음' },
  { abbr: 'BB%', name: '볼넷 비율', desc: '타석 중 볼넷 비율 — 선구안 지표' },
  { abbr: 'K%', name: '삼진 비율', desc: '타석 중 삼진 비율 — 콘택트 능력 지표' },
  { abbr: 'P/PA', name: '타석당 투구 수', desc: '끈질긴 타석, 투수 공 소비 능력 지표' },
  { abbr: 'XBH', name: '장타 수', desc: '2루타 + 3루타 + 홈런의 합' },
  { abbr: 'RE24', name: '기대득점 기여', desc: '타자의 상황별 득점 기여도 — 고급 분석 지표' },
];

const EXPRESSIONS = [
  { term: '루킹 삼진', desc: '스트라이크존 공을 휘두르지 않고 바라보다가 삼진' },
  { term: '헛스윙 삼진', desc: '스트라이크존 공에 방망이를 휘둘렀지만 맞추지 못한 삼진' },
  { term: '번트', desc: '방망이를 대서 공을 짧게 굴리는 기술, 희생전술로 자주 사용' },
  { term: '희생 플라이', desc: '외야로 공을 띄워 주자가 태그업 후 홈을 밟게 유도' },
  { term: '사구', desc: '투수가 던진 공이 타자의 몸에 맞은 경우 — 자동 출루' },
  { term: '내야안타', desc: '내야에 떨어진 공을 타자가 빠르게 달려 1루 세이프' },
  { term: '외야안타', desc: '외야에 공을 날려 안타가 된 경우' },
  { term: '주루사', desc: '주자가 진루 시도 중 아웃' },
  { term: '견제사', desc: '투수가 주자를 견제하다가 아웃시킴' },
  { term: '병살', desc: '한 타구로 두 명의 주자가 아웃되는 플레이 (GIDP)' },
];

const POSITIONS = [
  { code: '1', abbr: 'P', name: '투수', desc: '타자에게 공을 던지고 수비를 시작하는 중심 포지션' },
  { code: '2', abbr: 'C', name: '포수', desc: '투수의 공을 받고, 도루 저지 등 경기 운영을 맡음' },
  { code: '3', abbr: '1B', name: '1루수', desc: '1루 수비 담당, 송구를 많이 받음' },
  { code: '4', abbr: '2B', name: '2루수', desc: '민첩한 움직임으로 내야 수비의 중심 역할' },
  { code: '5', abbr: '3B', name: '3루수', desc: '강한 타구에 대비하는 핫코너 수비수' },
  { code: '6', abbr: 'SS', name: '유격수', desc: '내야 중간 수비, 커버 범위가 넓고 활동량 많음' },
  { code: '7', abbr: 'LF', name: '좌익수', desc: '좌측 외야 담당, 주자 보살도 자주 수행' },
  { code: '8', abbr: 'CF', name: '중견수', desc: '가장 넓은 외야를 커버, 빠른 판단력 요구' },
  { code: '9', abbr: 'RF', name: '우익수', desc: '우측 외야, 강한 어깨로 3루 보살도 수행' },
  { code: 'DH', abbr: 'DH', name: '지명타자', desc: '수비 없이 타격만 하는 타자' },
];

const SPECIAL_TERMS = [
  { term: '더블헤더', desc: '하루에 같은 팀이 두 번 연속 경기를 치르는 일정' },
  { term: '리드오프', desc: '1번 타자. 경기 첫 타석에 나서는 선수로 출루 능력이 중요' },
  { term: '클린업 트리오', desc: '3, 4, 5번 중심타자 조합. 타점 생산 중심' },
  { term: '마무리 투수', desc: '경기 마지막 이닝에 등판해 리드를 지키는 투수' },
  { term: '선발 투수', desc: '경기 시작과 함께 등판하는 첫 투수' },
  { term: '계투', desc: '중간계투 + 마무리 포함, 선발 이후 등판하는 투수 통칭' },
  { term: '6-4-3 병살', desc: '숫자 포지션으로 나타낸 병살 처리: 유격수 → 2루수 → 1루수' },
  { term: '노히트 노런', desc: '상대 타자에게 단 한 개의 안타도, 점수도 허용하지 않음' },
  { term: '퍼펙트 게임', desc: '한 명의 투수가 단 한 명의 주자도 출루시키지 않고 이긴 경기' },
  { term: '사이클링 히트', desc: '한 경기에서 1루타, 2루타, 3루타, 홈런을 모두 기록한 것' },
];

// --- RULE GUIDE DATA ---
const RULES_BASIC = [
  { title: '이닝과 아웃', desc: '한 이닝은 공수 교대로 진행되며, 3아웃이 되면 교대한다.', caution: '아웃은 선수 퇴장이 아님, 해당 타석/주자만 소멸.' },
  { title: '스트라이크와 볼', desc: '스트라이크존 안 공은 스트라이크, 밖은 볼.', caution: '2스트라이크 이후 파울은 카운트 유지(번트 예외).' },
  { title: '안타와 홈런', desc: '페어 지역에 떨어지면 안타, 담장 밖으로 넘어가면 홈런.', caution: '파울폴을 맞고 넘어가면 홈런.' },
  { title: '파울', desc: '페어 라인 밖으로 나간 타구.', caution: '파울팁은 포수가 완전히 잡으면 스트라이크.' },
  { title: '득점', desc: '주자가 홈 베이스를 밟으면 1점.', caution: '투아웃 상황에서 타자 아웃 전에 선행 주자가 홈 도착 시 득점 인정.' },
  { title: '대타와 대주', desc: '타석이나 주루에서 교체 선수를 투입할 수 있다.', caution: '교체된 선수는 재입장이 불가.' },
];

const RULES_OFFENSE = [
  { title: '타격 기본 (스윙·헛스윙·파울)', desc: '투수가 던진 공에 대해 타자가 스윙해 타구를 만들어내거나 판정을 받는 행위.', caution: '배트가 공에 스치기만 해도 페어 지역이면 안타 가능. 2스트 이후 번트 파울은 삼진.' },
  { title: '번트 (희생번트 포함)', desc: '배트를 고정해 타구를 내야에 짧게 떨어뜨리는 타격.', caution: '2스트라이크 이후 번트 파울은 삼진 처리됨.' },
  { title: '희생플라이 (SF)', desc: '외야로 뜬공을 타격해 주자가 태그업으로 득점하게 만드는 플레이.', caution: '얕은 외야 플라이는 태그업이 위험함. 타구 깊이 고려 필수.' },
  { title: '히트 앤 런 (Hit & Run)', desc: '투구와 동시에 주자가 스타트하고 타자는 반드시 배트를 내는 작전.', caution: '라인드라이브 타구가 야수 정면이면 주자 더블아웃 위험.' },
  { title: '스퀴즈 번트 (안전/자살)', desc: '3루 주자를 홈으로 불러들이기 위한 번트 작전.', caution: '자살 스퀴즈 시 타자가 번트를 놓치면 주자 횡사 위험 극대화.' },
  { title: '페이크 번트 & 슬래시', desc: '번트 자세로 수비 전진 유도 후 스윙으로 전환.', caution: '타이밍이 늦으면 얕은 파플이나 번트 파울 리스크 존재.' },
  { title: '진루 타격', desc: '안타보다 주자의 진루를 우선해 타구 방향을 조절.', caution: '팀 배팅의 정석. 개인 성적보다 팀 득점 기대값 우선.' },
  { title: '고의사구 대응', desc: '상대가 강타자를 피하려 할 때의 후속 전략.', caution: '만루 작전 유도시 병살 리스크 vs 장타 기대값의 균형 판단.' },
  { title: '파울팁', desc: '배트에 살짝 닿은 공을 포수가 연속 동작으로 포구한 경우.', caution: '포수가 잡으면 스트라이크이며, 2스트 시 삼진 아웃.' },
];

const RULES_DEFENSE = [
  { title: '포스 아웃 (Force Out)', desc: '진루가 강제된 주자를 베이스 터치로 아웃시킴.', caution: '포스 상황이 해제되면 베이스 터치만으론 아웃 불가(태그 필요).' },
  { title: '태그 아웃 (Tag Out)', desc: '공을 소지한 채 주자에게 직접 태그해 아웃시킴.', caution: '공을 떨어뜨리거나 손에 든 공과 다른 손으로 태그시 무효.' },
  { title: '더블플레이 (6-4-3 등)', desc: '한 타구로 연속 두 개의 아웃을 기록.', caution: '송구 정확도와 1루 베이스 포구 타이밍이 핵심.' },
  { title: '인필드 플라이', desc: '내야 뜬공 시 타자 자동 아웃(무사/1사, 1·2루 또는 만루).', caution: '타자만 자동 아웃. 주자는 상황에 따라 리스크 관리 필요.' },
  { title: '중계 플레이 & 컷오프', desc: '외야 송구를 내야가 중간에서 받아 연결하는 팀 수비.', caution: '팀간 약속 플레이와 콜사인이 중요.' },
  { title: '견제 / 픽오프', desc: '주루 리드를 좁히거나 아웃시키기 위한 송구.', caution: '투수 동작 위반시 보크 판정 주의.' },
];

const RULES_RUNNING = [
  { title: '베이스 터치 & 순서', desc: '1→2→3→홈 순서로 정확히 밟아야 함.', caution: '미터치 시 수비팀 어필에 의해 아웃 가능.' },
  { title: '리터치 (태그업)', desc: '뜬공 포구 후에만 원래 베이스 리터치 후 출발 가능.', caution: '포구 전 출발 시 반드시 돌아가서 리터치해야 함.' },
  { title: '1루 오버런 (Overrun)', desc: '1루 통과 후 직선 복귀 시 태그당해도 세이프.', caution: '2루 진루 의사를 보이며 턴하는 순간 태그 아웃 가능.' },
  { title: '주루선 (3피트 룰)', desc: '태그 회피를 위해 주루선에서 3피트 이상 이탈 시 아웃.', caution: '송구 방해가 실제로 수반되어야 판정되는 경우가 많음.' },
  { title: '주자 추월', desc: '뒤 주자가 앞 주자를 추월하면 뒤 주자 즉시 아웃.', caution: '타구 판단 미스로 앞 주자가 귀루 중일 때 사고 빈번.' },
  { title: '보크 시 진루', desc: '투수 보크 선언 시 모든 주자 한 베이스씩 진루.', caution: '1·3루 보크 시 3루 주자는 홈 득점 인정.' },
];

const RULES_PITCHING = [
  { title: '보크 (Balk)', desc: '투수가 비정상적인 동작 또는 규정 위반으로 주자를 속이거나 투구·견제를 어기면 선언. 주자가 있을 경우 모든 주자는 1루씩 진루.', caution: '보크는 주자가 있는 상태에서만 유효함. 주자 없으면 경고 또는 무효 처리.' },
  { title: '고의사구 (Intentional Walk)', desc: '감독 또는 포수가 사인을 보내면 투수가 투구 없이 타자를 1루로 보냄.', caution: 'KBO 역시 MLB와 동일하게 4구 투구 생략 자동 허용 제도 적용 중.' },
  { title: '투수 교체 & 투구수 제한', desc: '투수는 최소 1명의 타자를 상대해야 함. 프로 리그는 투구수 제한이 없으나 전략적 관리가 중요.', caution: '부상 시에는 타자 상대 조건과 관계없이 교체 가능.' },
  { title: '세트 포지션 (정지 동작)', desc: '주자가 있을 때 투구 전 명확한 정지 동작(1초 이상)을 취해야 함.', caution: '정지 없이 바로 던지면 보크 선언. 퀵모션 시 특히 주의 필요.' },
  { title: '로진백 & 투수판 규정', desc: '마운드 위 로진백 사용은 자유로우나, 투구는 반드시 투수판 위에서 이루어져야 함.', caution: '투수판에서 벗어난 채 투구하면 불법 투구로 판정될 수 있음.' },
  { title: '투구 동작의 종류: 윈드업 vs 세트', desc: '윈드업은 주자 없을 때 큰 동작, 세트는 주자 있을 때 간결한 동작.', caution: '동작보다 정지의 유무가 보크 판정의 핵심.' },
  { title: '투수의 공수교대 시 위치 변경', desc: '투수가 타 포지션 이동 후 다시 마운드 복귀 시 최소 1타자 상대 원칙.', caution: 'KBO는 단순 포지션 변경만으로 마운드 재진입이 불가함.' },
];

const RULES_JUDGMENT = [
  { title: '인필드 플라이 (Infield Fly)', desc: '0~1아웃, 1·2루 또는 만루에서 내야수가 충분히 잡을 수 있는 뜬공 시 타자 자동 아웃.', caution: '타자만 아웃이며, 주자는 포구 후 태그업 진루가 가능함.' },
  { title: '체크스윙 (Check Swing)', desc: '방망이를 내다 멈춘 경우 주심이 판정하며, 요청 시 루심이 최종 판단.', caution: '비디오 판독 불가 항목이었으나 2025년 시즌 중 도입 예정.' },
  { title: '인터페어런스 (방해)', desc: '공격/수비 측이 상대 플레이를 물리적/시각적으로 방해하는 행위.', caution: '고의성보다 결과적 방해 여부가 판정의 핵심.' },
  { title: '그라운드룰 더블 (Ground Rule Double)', desc: '타구가 바운드되어 담장을 넘어가거나 끼인 경우.', caution: '타자와 주자 모두 2개 베이스 진루권 부여.' },
  { title: '비디오 판독 (Video Review)', desc: '9이닝 내 2회(연장 1회) 요청 가능. 세이프/아웃, 홈런 여부 등이 대상.', caution: '스트라이크/볼 판정은 비디오 판독 대상이 아님.' },
  { title: '콜드 / 서스펜디드 / 노게임', desc: '우천 등 중단 시 5이닝 이상이면 콜드(기록 인정), 미만이면 노게임(무효).', caution: '서스펜디드는 중단된 시점부터 나중에 다시 이어가는 경기.' },
];

const RULES_KBO = [
  { title: '연장전 규정', desc: '정규시즌은 12회 종료 시까지 진행하며 동점 시 무승부. 포스트시즌은 승부 날 때까지 진행.', caution: 'MLB와 달리 정규시즌 승부치기는 아직 도입되지 않음.' },
  { title: '더블헤더 규정', desc: '하루 2경기 시 9이닝 고정, 연장전 없음. 1차전 종료 30분 후 2차전 시작.', caution: '정규 경기와 달리 콜드게임 판정이 더 잦을 수 있음.' },
  { title: '지명타자제 (DH)', desc: 'KBO 전 구단 의무 적용. 투수는 타석에 들어서지 않음.', caution: '경기 중 DH가 수비로 들어가면 해당 타순에 투수가 들어가야 함.' },
  { title: '외국인 선수 제한', desc: '팀당 최대 3명 보유(보통 투수2+타자1). 1경기 동시 출장은 2명까지 가능.', caution: '시즌 중 교체 횟수는 제한되어 있으므로 신중한 결정 필요.' },
  { title: '퓨처스 리그 차이점', desc: '기본 7이닝 경기, 지명타자 의무 동일, 연장전 없음.', caution: '1군과 룰이 다르므로 시청 시 혼동 주의.' },
];

const RULES_MISCONCEPTIONS = [
  { title: '1. 파울팁 = 무조건 파울?', desc: '배트에 닿은 공이 뒤로 가더라도 포수가 바로 잡으면 스트라이크 판정.', caution: '2스트라이크 상황에서 포수가 잡으면 삼진 아웃 처리됨.' },
  { title: '2. 몸에 맞으면 무조건 출루?', desc: '회피 의도가 없거나 스트라이크 존 안에서 맞으면 인정 안 될 수 있음.', caution: '심판이 타자가 일부러 맞았다고 판단하면 볼 판정만 함.' },
  { title: '3. 모든 포스 플레이는 베이스만 밟으면 아웃?', desc: '주자가 다음 루로 가야만 하는 의무가 있을 때(포스)만 유효.', caution: '의무가 없는 상황(역주행 등)에서는 반드시 주자를 태그해야 함.' },
  { title: '4. 수비방해는 공격자 마음대로?', desc: '타자/주자가 수비수랑 부딪히면 무조건 수비 방해는 아님. 공을 처리하려는 수비수에게만 우선권이 있음.', caution: '공과 관계 없는 접촉은 오히려 주루방해로 판정됨.' },
  { title: '5. 스윙 안 했으면 무조건 볼?', desc: '스윙 의도가 보였다고 판단되면 체크스윙이라도 스트라이크 판정 가능.', caution: '판정 기준은 손목의 꺾임이나 배트 헤드의 위치 등 심판 주관.' },
  { title: '6. 3루 베이스를 밟으면 자동으로 아웃?', desc: '포스 상황일 때만 자동 아웃이며, 아니면 태그 필요.', caution: '포스 해제된 상황은 꼭 태그해야 함.' },
  { title: '7. 투수는 반드시 세트 포지션을 취해야 한다?', desc: '주자가 없으면 와인드업, 있어도 선택 가능함.', caution: '동작의 명칭보다 정지의 유무가 보크 판정의 핵심.' },
  { title: '8. 번트는 무조건 안타를 노리는 기술이다?', desc: '대부분은 희생번트로 타자 아웃을 감수하는 작전임.', caution: '희생플라이와 비슷한 전략적 희생임.' },
  { title: '9. 공이 한 번 땅에 튀면 무조건 파울?', desc: '페어존에 튀면 페어, 파울라인 기준임.', caution: '포지션이 아닌 라인 기준임을 기억해야 함.' },
  { title: '10. 홈 플레이트 밟으면 무조건 점수?', desc: '아웃 선언 전 도달해야 점수가 인정됨.', caution: '타자 아웃 전 도착 여부가 중요함.' },
  { title: '11. 야수가 공을 떨어뜨리면 모두 세이프?', desc: '수비수의 실책으로 기록되고 플레이는 계속됨.', caution: '일부러 떨어뜨리는 고의 낙구는 반칙 처리.' },
  { title: '12. 투수가 던진 공이 심판에 맞으면 볼?', desc: '심판은 경기의 일부로 간주되어 판정 기준 그대로 적용.', caution: '존 안에 들어오면 스트라이크임.' },
  { title: '13. 공 튀겨서 넘으면 홈런 아니다?', desc: '담장 맞고 튀어 넘어가면 그라운드룰 더블(2루타).', caution: '홈런은 직진으로 넘겨야 유효함.' },
  { title: '14. 고의 사구는 반드시 4개 던져야 한다?', desc: '감독 지시만으로 자동 고의사구 선언 가능.', caution: '2019년부터 KBO 전면 도입됨.' },
  { title: '15. 병살 상황에서 타자와 주자 모두 세이프 될 수 없다?', desc: '주자가 빠르거나 수비 실수 시 타자만 아웃 가능.', caution: '병살은 선택이지 확정이 아님.' },
  { title: '16. 심판이 선언해야 인필드 플라이가 된다?', desc: '조건 충족 시 선언 없이도 적용될 수 있음.', caution: '보통 심판이 콜을 하여 혼동을 방지함.' },
  { title: '17. 삼진은 공을 못 쳐야만 인정된다?', desc: '파울팁 포구나 체크스윙 인정도 삼진임.', caution: '스트라이크 카운트 기준 확인 필수.' },
  { title: '18. 더블 스틸 시 앞선 주자가 잡히면 뒷주자도 무효?', desc: '뒤 주자가 세이프면 유효, 각자 독립적으로 판정.', caution: '주자별로 독립적인 결과가 나옴.' },
  { title: '19. 안타 치고 1루 밟았으면 주루 끝?', desc: '1루 통과 후 2루 진루 의사를 보이면 다시 태그 아웃 가능.', caution: '오버런 후 방향 틀면 주의해야 함.' },
  { title: '20. 주자가 피하지 못하고 공에 맞으면 무조건 아웃?', desc: '고의성 없고 회피 불가 판단 시 세이프 가능.', caution: '2루 이후 수비 무관 시 인플레이 판정 가능.' },
];

interface GuidePageProps {
  onCancel: () => void;
}

const GuidePage: React.FC<GuidePageProps> = ({ onCancel }) => {
  const [mainView, setMainView] = useState<'term' | 'rule'>('term');
  const [activeTab, setActiveTab] = useState<string>('pitcher');
  const [activeRuleTab, setActiveRuleTab] = useState<string>('basic');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  const renderTermContent = () => {
    switch(activeTab) {
      case 'pitcher':
        return (
          <div className="space-y-16 animate-fade-in-up">
            <div>
              <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                <span className="w-2 h-6 bg-cyan-400 rounded-full"></span>
                투수 기록 (Pitcher Stats)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...PITCHER_TRADITIONAL, ...PITCHER_ADVANCED].map((item) => (
                  <div key={item.abbr} className={`bg-[#0a0f1e]/60 border border-white/5 p-6 rounded-2xl hover:border-cyan-400/30 transition-all group ${item.highlight ? 'ring-1 ring-cyan-400/20 bg-cyan-400/5' : ''}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-black text-cyan-400 font-mono italic tracking-tighter">{item.abbr}</span>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{item.name}</span>
                    </div>
                    <p className="text-sm text-slate-400 font-light leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'batter':
        return (
          <div className="space-y-16 animate-fade-in-up">
            <div>
              <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                <span className="w-2 h-6 bg-pink-500 rounded-full"></span>
                타자 기록 (Batter Stats)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...BATTER_BASIC, ...BATTER_ADVANCED].map((item) => (
                  <div key={item.abbr} className={`bg-[#0a0f1e]/60 border border-white/5 p-6 rounded-2xl hover:border-pink-500/30 transition-all group ${item.highlight ? 'ring-1 ring-pink-500/20 bg-pink-500/5' : ''}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-black text-pink-500 font-mono italic tracking-tighter">{item.abbr}</span>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{item.name}</span>
                    </div>
                    <p className="text-sm text-slate-400 font-light leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'position':
        return (
          <div className="animate-fade-in-up">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="bg-[#0a0f1e] border border-white/10 rounded-3xl p-6 flex items-center justify-center">
                <img src="https://myspringstudybucket.s3.ap-northeast-2.amazonaws.com/test/positionNum.png" alt="Field" className="w-full h-auto rounded-xl shadow-2xl" />
              </div>
              <div className="space-y-4">
                {POSITIONS.map(pos => (
                  <div key={pos.abbr} className="flex items-start gap-4 bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-pink-500/30 transition-colors">
                    <div className="min-w-[50px] h-[50px] bg-brand-dark border border-pink-500/30 rounded-lg flex items-center justify-center font-black text-pink-500 text-xl">{pos.code}</div>
                    <div>
                      <h4 className="font-bold text-white text-lg">{pos.name} <span className="text-slate-500 font-mono text-sm">({pos.abbr})</span></h4>
                      <p className="text-sm text-slate-400 font-light leading-snug">{pos.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'special':
      default:
        return (
          <div className="space-y-12 animate-fade-in-up">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div>
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-orange-400 rounded-full"></span>
                    경기 빈출 표현
                  </h3>
                  <div className="space-y-3">
                    {EXPRESSIONS.map(e => (
                      <div key={e.term} className="bg-white/5 p-5 rounded-xl border border-white/5 flex justify-between items-center group hover:border-orange-400/30 transition-all">
                        <span className="font-bold text-slate-200 group-hover:text-orange-400 transition-colors">{e.term}</span>
                        <span className="text-xs text-slate-500 font-light max-w-[60%] text-right">{e.desc}</span>
                      </div>
                    ))}
                  </div>
               </div>
               <div>
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-brand-glow rounded-full"></span>
                    특수 용어 사전
                  </h3>
                  <div className="space-y-3">
                    {SPECIAL_TERMS.map(e => (
                      <div key={e.term} className="bg-white/5 p-5 rounded-xl border border-white/5 flex justify-between items-center group hover:border-brand-glow/30 transition-all">
                        <span className="font-bold text-slate-200 group-hover:text-brand-glow transition-colors">{e.term}</span>
                        <span className="text-xs text-slate-500 font-light max-w-[60%] text-right">{e.desc}</span>
                      </div>
                    ))}
                  </div>
               </div>
             </div>
          </div>
        );
    }
  };

  const renderRuleContent = () => {
    let currentData = RULES_BASIC;
    if(activeRuleTab === 'offense') currentData = RULES_OFFENSE;
    if(activeRuleTab === 'defense') currentData = RULES_DEFENSE;
    if(activeRuleTab === 'running') currentData = RULES_RUNNING;
    if(activeRuleTab === 'pitching') currentData = RULES_PITCHING;
    if(activeRuleTab === 'judgment') currentData = RULES_JUDGMENT;
    if(activeRuleTab === 'kbo') currentData = RULES_KBO;
    if(activeRuleTab === 'misconceptions') currentData = RULES_MISCONCEPTIONS;

    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="flex items-center gap-3 bg-pink-500/10 border border-pink-500/20 p-5 rounded-2xl mb-8">
          <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-pink-300 font-medium tracking-tight">TIP: 각 항목을 클릭하여 세부 규칙을 확인하세요. 오해하기 쉬운 포인트는 별도로 정리했습니다.</span>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {currentData.map((rule, idx) => (
            <div key={idx} className={`bg-[#0a0f1e] border transition-all duration-300 rounded-2xl overflow-hidden ${expandedIndex === idx ? 'border-pink-500/50 shadow-[0_15px_30px_rgba(236,72,153,0.1)]' : 'border-white/5 hover:border-white/10'}`}>
              <button 
                onClick={() => toggleExpand(idx)}
                className="w-full flex items-center justify-between p-7 text-left group"
              >
                <div className="flex items-center gap-4">
                   <div className={`w-1.5 h-6 rounded-full transition-colors ${expandedIndex === idx ? 'bg-pink-500' : 'bg-white/10 group-hover:bg-white/30'}`}></div>
                   <span className="text-xl font-bold text-white tracking-tight">{rule.title}</span>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${expandedIndex === idx ? 'bg-pink-500 text-white rotate-180' : 'bg-white/5 text-slate-500'}`}>
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </button>
              
              <div className={`transition-all duration-500 ${expandedIndex === idx ? 'max-h-[1000px] opacity-100 pb-8 px-7' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="pt-2 border-t border-white/5">
                  <div className="mt-6 mb-8">
                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Rule Definition</h5>
                    <p className="text-slate-300 text-lg leading-relaxed font-light">{rule.desc}</p>
                  </div>
                  <div className="bg-pink-500/5 border border-pink-500/20 p-5 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10 text-pink-500">
                      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                       <h5 className="text-xs font-black text-pink-500 uppercase tracking-widest">⚠️ Caution & Misconception</h5>
                    </div>
                    <p className="text-sm text-pink-200/90 font-medium leading-relaxed">{rule.caution}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="relative z-10 w-full animate-fade-in-up pb-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Top Header */}
        <div className="flex justify-between items-end mb-16">
          <div>
            <div className="inline-flex items-center space-x-2 bg-pink-500/10 border border-pink-500/20 rounded-full px-3 py-1 mb-4 backdrop-blur-sm">
               <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
               <span className="text-[10px] md:text-xs font-mono text-pink-300">DUGOUT Data & Rule Guide</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-4 uppercase italic leading-none">
              BASEBALL <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">ENCYCLOPEDIA</span>
            </h2>
            <p className="text-slate-400 text-xl font-light max-w-3xl leading-relaxed">
              데이터와 규칙을 알면 야구가 더 재미있어집니다. 10개 구단 모든 팬들을 위한 완벽 가이드.
            </p>
          </div>
          <button onClick={onCancel} className="hidden lg:flex items-center gap-3 text-slate-400 hover:text-white transition-all border border-white/10 px-8 py-4 rounded-2xl hover:bg-white/5 group">
             <span className="text-sm font-black tracking-widest">CLOSE</span>
             <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Main Navigation Toggles */}
        <div className="flex p-2 bg-slate-900/60 backdrop-blur border border-white/10 rounded-2xl w-fit mb-14 shadow-2xl">
          <button onClick={() => {setMainView('term'); setExpandedIndex(null);}} className={`px-12 py-4 rounded-xl text-lg font-black transition-all ${mainView === 'term' ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-xl scale-[1.02]' : 'text-slate-500 hover:text-white'}`}>야구 용어 사전</button>
          <button onClick={() => {setMainView('rule'); setExpandedIndex(null);}} className={`px-12 py-4 rounded-xl text-lg font-black transition-all ${mainView === 'rule' ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-xl scale-[1.02]' : 'text-slate-500 hover:text-white'}`}>야구 룰 가이드</button>
        </div>

        {/* CONTENT */}
        {mainView === 'term' ? (
          <div>
            <div className="flex flex-wrap gap-4 mb-12 border-b border-white/5 pb-8">
              {[
                { id: 'pitcher', label: '투수 지표', colorActive: 'bg-cyan-400 text-brand-dark' },
                { id: 'batter', label: '타자 지표', colorActive: 'bg-pink-500 text-white' },
                { id: 'position', label: '포지션 가이드', colorActive: 'bg-pink-500 text-white' },
                { id: 'special', label: '특수 용어 사전', colorActive: 'bg-pink-500 text-white' }
              ].map(t => (
                <button 
                  key={t.id} 
                  onClick={() => setActiveTab(t.id)} 
                  className={`px-10 py-4 rounded-2xl text-lg font-black tracking-wide transition-all ${activeTab === t.id ? `${t.colorActive} shadow-2xl scale-105` : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-white'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {renderTermContent()}
          </div>
        ) : (
          <div>
            <div className="flex flex-wrap gap-3 mb-12 border-b border-white/5 pb-8">
              {[
                { id: 'basic', label: '기본 룰' },
                { id: 'offense', label: '공격 작전' },
                { id: 'defense', label: '수비 전략' },
                { id: 'running', label: '주루 규정' },
                { id: 'pitching', label: '투구 규정' },
                { id: 'judgment', label: '판정 및 신호' },
                { id: 'kbo', label: 'KBO 전용 규정' },
                { id: 'misconceptions', label: '오해 TOP 20' }
              ].map(t => (
                <button 
                  key={t.id} 
                  onClick={() => {setActiveRuleTab(t.id); setExpandedIndex(null);}} 
                  className={`px-8 py-4 rounded-2xl text-lg font-black transition-all ${activeRuleTab === t.id ? 'bg-pink-500 text-white shadow-2xl scale-105' : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-white'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {renderRuleContent()}
          </div>
        )}

      </div>
    </div>
  );
};

export default GuidePage;