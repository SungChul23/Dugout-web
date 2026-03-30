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
