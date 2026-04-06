export const MOCK_GOLDEN_GLOVE_DATA = {
  "baseDate": "2026-04-06",
  "leaderboardByPosition": {
    "P": [
      {
        "playerCode": "11111",
        "playerName": "네일",
        "teamName": "KIA",
        "position": "P",
        "subPosition": "투수",
        "winProbStr": "75.4%",
        "rank": 1,
        "top3Positive": [
          { "feature": "ERA", "score": 0.412 },
          { "feature": "W", "score": 0.350 },
          { "feature": "SO", "score": 0.280 }
        ],
        "top1Negative": [
          { "feature": "BB", "score": -0.105 }
        ],
        "aiExplanation": "네일(KIA)은(는) 현재 약 75.4%의 확률로 골든글러브 수상이 예상됩니다. 압도적인 평균자책점(ERA)과 다승 부문에서의 활약이 주요 가점 요인으로 분석되었습니다. 볼넷 허용이 다소 아쉬운 부분이나, 강력한 구위를 바탕으로 한 탈삼진 능력이 이를 상쇄하며 투수 부문 1위 자격을 굳건히 지키고 있습니다."
      },
      {
        "playerCode": "11112",
        "playerName": "원태인",
        "teamName": "삼성",
        "position": "P",
        "subPosition": "투수",
        "winProbStr": "15.2%",
        "rank": 2,
        "top3Positive": [
          { "feature": "W", "score": 0.380 },
          { "feature": "IP", "score": 0.310 },
          { "feature": "ERA", "score": 0.250 }
        ],
        "top1Negative": [
          { "feature": "SO", "score": -0.120 }
        ],
        "aiExplanation": "원태인(삼성)은 꾸준한 이닝 소화력과 다승을 바탕으로 2위에 올랐습니다."
      },
      {
        "playerCode": "11113",
        "playerName": "곽빈",
        "teamName": "두산",
        "position": "P",
        "subPosition": "투수",
        "winProbStr": "5.1%",
        "rank": 3,
        "top3Positive": [
          { "feature": "SO", "score": 0.360 },
          { "feature": "ERA", "score": 0.290 },
          { "feature": "W", "score": 0.210 }
        ],
        "top1Negative": [
          { "feature": "BB", "score": -0.150 }
        ],
        "aiExplanation": "곽빈(두산)은 뛰어난 탈삼진 능력을 보여주며 3위에 랭크되었습니다."
      }
    ],
    "C": [
      {
        "playerCode": "22221",
        "playerName": "양의지",
        "teamName": "두산",
        "position": "C",
        "subPosition": "포수",
        "winProbStr": "82.1%",
        "rank": 1,
        "top3Positive": [
          { "feature": "AVG", "score": 0.380 },
          { "feature": "OPS", "score": 0.340 },
          { "feature": "HR", "score": 0.290 }
        ],
        "top1Negative": [
          { "feature": "CS%", "score": -0.110 }
        ],
        "aiExplanation": "양의지(두산)은(는) 포수 포지션에서 압도적인 타격 지표를 바탕으로 1위를 달리고 있습니다."
      },
      {
        "playerCode": "22222",
        "playerName": "박동원",
        "teamName": "LG",
        "position": "C",
        "subPosition": "포수",
        "winProbStr": "12.5%",
        "rank": 2,
        "top3Positive": [
          { "feature": "HR", "score": 0.350 },
          { "feature": "CS%", "score": 0.320 },
          { "feature": "RBI", "score": 0.280 }
        ],
        "top1Negative": [
          { "feature": "AVG", "score": -0.140 }
        ],
        "aiExplanation": "박동원(LG)은 강력한 장타력과 도루 저지율로 2위에 올랐습니다."
      },
      {
        "playerCode": "22223",
        "playerName": "강민호",
        "teamName": "삼성",
        "position": "C",
        "subPosition": "포수",
        "winProbStr": "4.2%",
        "rank": 3,
        "top3Positive": [
          { "feature": "AVG", "score": 0.310 },
          { "feature": "RBI", "score": 0.290 },
          { "feature": "OPS", "score": 0.250 }
        ],
        "top1Negative": [
          { "feature": "CS%", "score": -0.160 }
        ],
        "aiExplanation": "강민호(삼성)는 베테랑다운 안정적인 타격으로 3위를 기록 중입니다."
      }
    ],
    "1B": [
      {
        "playerCode": "53123",
        "playerName": "오스틴",
        "teamName": "LG",
        "position": "1B",
        "subPosition": "1루수",
        "winProbStr": "80.2%",
        "rank": 1,
        "top3Positive": [
          { "feature": "R_pos_ratio", "score": 0.395 },
          { "feature": "H_pos_ratio", "score": 0.318 },
          { "feature": "AVG", "score": 0.312 }
        ],
        "top1Negative": [
          { "feature": "RBI_pos_ratio", "score": -0.147 }
        ],
        "aiExplanation": "오스틴(LG)은(는) 현재 약 80.2%의 확률로 골든글러브 수상이 예상됩니다. 동일 포지션 내 타 선수들과 비교했을 때 상대적으로 높은 득점 생산력, 안타 생산력, 타율(AVG)이(가) 주요 가점 요인으로 분석되었습니다. 타점 생산력은(는) 다소 아쉬운 부분이나, 팀의 중심 타자로서 강력한 장타력과 타점 생산 능력이 필수적으로 요구되는 1B 포지션의 특성을 고려하면 1위 자격을 유지하기에 충분한 수치로 평가됩니다. 종합적으로 볼 때, 안정적인 지표 밸런스를 바탕으로 현재 해당 부문 1위로 분류됩니다."
      },
      {
        "playerCode": "53124",
        "playerName": "데이비슨",
        "teamName": "NC",
        "position": "1B",
        "subPosition": "1루수",
        "winProbStr": "15.5%",
        "rank": 2,
        "top3Positive": [
          { "feature": "HR_pos_ratio", "score": 0.420 },
          { "feature": "SLG", "score": 0.350 },
          { "feature": "RBI_pos_ratio", "score": 0.310 }
        ],
        "top1Negative": [
          { "feature": "SO_pos_ratio", "score": -0.180 }
        ],
        "aiExplanation": "데이비슨(NC)은 압도적인 홈런 생산력을 바탕으로 2위에 랭크되었습니다."
      },
      {
        "playerCode": "53125",
        "playerName": "구자욱",
        "teamName": "삼성",
        "position": "1B",
        "subPosition": "1루수",
        "winProbStr": "3.1%",
        "rank": 3,
        "top3Positive": [
          { "feature": "AVG", "score": 0.340 },
          { "feature": "OBP", "score": 0.320 },
          { "feature": "R_pos_ratio", "score": 0.290 }
        ],
        "top1Negative": [
          { "feature": "HR_pos_ratio", "score": -0.120 }
        ],
        "aiExplanation": "구자욱(삼성)은 정교한 타격과 출루 능력을 보여주며 3위를 기록 중입니다."
      }
    ],
    "2B": [
      {
        "playerCode": "44441",
        "playerName": "김혜성",
        "teamName": "키움",
        "position": "2B",
        "subPosition": "2루수",
        "winProbStr": "88.5%",
        "rank": 1,
        "top3Positive": [
          { "feature": "AVG", "score": 0.390 },
          { "feature": "SB", "score": 0.350 },
          { "feature": "R", "score": 0.310 }
        ],
        "top1Negative": [
          { "feature": "HR", "score": -0.080 }
        ],
        "aiExplanation": "김혜성(키움)은 정교한 타격과 압도적인 주루 능력을 바탕으로 2루수 부문 1위가 유력합니다."
      },
      {
        "playerCode": "44442",
        "playerName": "신민재",
        "teamName": "LG",
        "position": "2B",
        "subPosition": "2루수",
        "winProbStr": "8.2%",
        "rank": 2,
        "top3Positive": [
          { "feature": "SB", "score": 0.360 },
          { "feature": "OBP", "score": 0.290 },
          { "feature": "R", "score": 0.250 }
        ],
        "top1Negative": [
          { "feature": "SLG", "score": -0.150 }
        ],
        "aiExplanation": "신민재(LG)는 뛰어난 출루율과 도루 능력으로 2위에 올랐습니다."
      },
      {
        "playerCode": "44443",
        "playerName": "김지찬",
        "teamName": "삼성",
        "position": "2B",
        "subPosition": "2루수",
        "winProbStr": "2.1%",
        "rank": 3,
        "top3Positive": [
          { "feature": "AVG", "score": 0.320 },
          { "feature": "SB", "score": 0.280 },
          { "feature": "OBP", "score": 0.240 }
        ],
        "top1Negative": [
          { "feature": "HR", "score": -0.180 }
        ],
        "aiExplanation": "김지찬(삼성)은 빠른 발과 컨택 능력으로 3위를 기록 중입니다."
      }
    ],
    "3B": [
      {
        "playerCode": "55551",
        "playerName": "김도영",
        "teamName": "KIA",
        "position": "3B",
        "subPosition": "3루수",
        "winProbStr": "99.1%",
        "rank": 1,
        "top3Positive": [
          { "feature": "OPS", "score": 0.450 },
          { "feature": "HR", "score": 0.380 },
          { "feature": "SB", "score": 0.350 }
        ],
        "top1Negative": [
          { "feature": "E", "score": -0.050 }
        ],
        "aiExplanation": "김도영(KIA)은 역사적인 40-40 클럽 가입 페이스를 보여주며 3루수 부문에서 압도적인 1위를 달리고 있습니다."
      },
      {
        "playerCode": "55552",
        "playerName": "최정",
        "teamName": "SSG",
        "position": "3B",
        "subPosition": "3루수",
        "winProbStr": "0.5%",
        "rank": 2,
        "top3Positive": [
          { "feature": "HR", "score": 0.390 },
          { "feature": "OPS", "score": 0.340 },
          { "feature": "RBI", "score": 0.310 }
        ],
        "top1Negative": [
          { "feature": "AVG", "score": -0.120 }
        ],
        "aiExplanation": "최정(SSG)은 여전한 장타력을 과시하며 2위에 랭크되었습니다."
      },
      {
        "playerCode": "55553",
        "playerName": "문보경",
        "teamName": "LG",
        "position": "3B",
        "subPosition": "3루수",
        "winProbStr": "0.2%",
        "rank": 3,
        "top3Positive": [
          { "feature": "AVG", "score": 0.330 },
          { "feature": "OBP", "score": 0.310 },
          { "feature": "RBI", "score": 0.280 }
        ],
        "top1Negative": [
          { "feature": "HR", "score": -0.140 }
        ],
        "aiExplanation": "문보경(LG)은 안정적인 공수 밸런스로 3위를 기록 중입니다."
      }
    ],
    "SS": [
      {
        "playerCode": "66661",
        "playerName": "박찬호",
        "teamName": "KIA",
        "position": "SS",
        "subPosition": "유격수",
        "winProbStr": "65.2%",
        "rank": 1,
        "top3Positive": [
          { "feature": "SB", "score": 0.360 },
          { "feature": "AVG", "score": 0.320 },
          { "feature": "R", "score": 0.290 }
        ],
        "top1Negative": [
          { "feature": "OPS", "score": -0.110 }
        ],
        "aiExplanation": "박찬호(KIA)는 뛰어난 수비와 주루 능력을 바탕으로 유격수 부문 1위를 달리고 있습니다."
      },
      {
        "playerCode": "66662",
        "playerName": "이재현",
        "teamName": "삼성",
        "position": "SS",
        "subPosition": "유격수",
        "winProbStr": "25.4%",
        "rank": 2,
        "top3Positive": [
          { "feature": "HR", "score": 0.340 },
          { "feature": "OPS", "score": 0.310 },
          { "feature": "RBI", "score": 0.280 }
        ],
        "top1Negative": [
          { "feature": "AVG", "score": -0.130 }
        ],
        "aiExplanation": "이재현(삼성)은 유격수로서 뛰어난 장타력을 보여주며 2위에 올랐습니다."
      },
      {
        "playerCode": "66663",
        "playerName": "오지환",
        "teamName": "LG",
        "position": "SS",
        "subPosition": "유격수",
        "winProbStr": "7.1%",
        "rank": 3,
        "top3Positive": [
          { "feature": "OBP", "score": 0.320 },
          { "feature": "SB", "score": 0.290 },
          { "feature": "HR", "score": 0.250 }
        ],
        "top1Negative": [
          { "feature": "AVG", "score": -0.150 }
        ],
        "aiExplanation": "오지환(LG)은 베테랑의 품격을 보여주며 3위를 기록 중입니다."
      }
    ],
    "OF": [
      {
        "playerCode": "77771",
        "playerName": "에레디아",
        "teamName": "SSG",
        "position": "OF",
        "subPosition": "좌익수",
        "winProbStr": "92.5%",
        "rank": 1,
        "top3Positive": [
          { "feature": "AVG", "score": 0.410 },
          { "feature": "OPS", "score": 0.380 },
          { "feature": "RBI", "score": 0.350 }
        ],
        "top1Negative": [
          { "feature": "SB", "score": -0.050 }
        ],
        "aiExplanation": "에레디아(SSG)는 리그 최고 수준의 타율과 생산력을 보여주며 외야수 부문 1위가 유력합니다."
      },
      {
        "playerCode": "77772",
        "playerName": "홍창기",
        "teamName": "LG",
        "position": "OF",
        "subPosition": "중견수",
        "winProbStr": "85.2%",
        "rank": 2,
        "top3Positive": [
          { "feature": "OBP", "score": 0.430 },
          { "feature": "R", "score": 0.390 },
          { "feature": "AVG", "score": 0.340 }
        ],
        "top1Negative": [
          { "feature": "HR", "score": -0.120 }
        ],
        "aiExplanation": "홍창기(LG)는 압도적인 출루율과 득점 생산력으로 외야수 한 자리를 차지할 것으로 보입니다."
      },
      {
        "playerCode": "77773",
        "playerName": "로하스",
        "teamName": "KT",
        "position": "OF",
        "subPosition": "우익수",
        "winProbStr": "78.4%",
        "rank": 3,
        "top3Positive": [
          { "feature": "HR", "score": 0.400 },
          { "feature": "OPS", "score": 0.370 },
          { "feature": "RBI", "score": 0.340 }
        ],
        "top1Negative": [
          { "feature": "SO", "score": -0.110 }
        ],
        "aiExplanation": "로하스(KT)는 강력한 파워를 바탕으로 외야수 부문 3위에 랭크되었습니다."
      },
      {
        "playerCode": "77774",
        "playerName": "구자욱",
        "teamName": "삼성",
        "position": "OF",
        "subPosition": "좌익수",
        "winProbStr": "45.2%",
        "rank": 4,
        "top3Positive": [
          { "feature": "AVG", "score": 0.360 },
          { "feature": "OPS", "score": 0.330 },
          { "feature": "R", "score": 0.310 }
        ],
        "top1Negative": [
          { "feature": "SB", "score": -0.090 }
        ],
        "aiExplanation": "구자욱(삼성)은 정교한 타격으로 4위를 기록하며 수상 가능성을 열어두고 있습니다."
      },
      {
        "playerCode": "77775",
        "playerName": "도슨",
        "teamName": "키움",
        "position": "OF",
        "subPosition": "중견수",
        "winProbStr": "22.1%",
        "rank": 5,
        "top3Positive": [
          { "feature": "AVG", "score": 0.350 },
          { "feature": "OBP", "score": 0.320 },
          { "feature": "R", "score": 0.290 }
        ],
        "top1Negative": [
          { "feature": "HR", "score": -0.140 }
        ],
        "aiExplanation": "도슨(키움)은 꾸준한 활약으로 5위에 랭크되었습니다."
      },
      {
        "playerCode": "77776",
        "playerName": "소크라테스",
        "teamName": "KIA",
        "position": "OF",
        "subPosition": "중견수",
        "winProbStr": "15.8%",
        "rank": 6,
        "top3Positive": [
          { "feature": "HR", "score": 0.320 },
          { "feature": "RBI", "score": 0.300 },
          { "feature": "OPS", "score": 0.280 }
        ],
        "top1Negative": [
          { "feature": "AVG", "score": -0.130 }
        ],
        "aiExplanation": "소크라테스(KIA)는 장타력을 바탕으로 6위에 올랐습니다."
      }
    ],
    "DH": [
      {
        "playerCode": "88881",
        "playerName": "최형우",
        "teamName": "KIA",
        "position": "DH",
        "subPosition": "지명타자",
        "winProbStr": "72.5%",
        "rank": 1,
        "top3Positive": [
          { "feature": "RBI", "score": 0.420 },
          { "feature": "OPS", "score": 0.380 },
          { "feature": "HR", "score": 0.350 }
        ],
        "top1Negative": [
          { "feature": "AVG", "score": -0.080 }
        ],
        "aiExplanation": "최형우(KIA)는 해결사 본능을 과시하며 지명타자 부문 1위가 유력합니다."
      },
      {
        "playerCode": "88882",
        "playerName": "전준우",
        "teamName": "롯데",
        "position": "DH",
        "subPosition": "지명타자",
        "winProbStr": "18.2%",
        "rank": 2,
        "top3Positive": [
          { "feature": "AVG", "score": 0.360 },
          { "feature": "OBP", "score": 0.330 },
          { "feature": "H", "score": 0.310 }
        ],
        "top1Negative": [
          { "feature": "HR", "score": -0.120 }
        ],
        "aiExplanation": "전준우(롯데)는 정교한 타격으로 2위에 올랐습니다."
      },
      {
        "playerCode": "88883",
        "playerName": "페라자",
        "teamName": "한화",
        "position": "DH",
        "subPosition": "지명타자",
        "winProbStr": "5.1%",
        "rank": 3,
        "top3Positive": [
          { "feature": "HR", "score": 0.380 },
          { "feature": "OPS", "score": 0.340 },
          { "feature": "SLG", "score": 0.320 }
        ],
        "top1Negative": [
          { "feature": "SO", "score": -0.160 }
        ],
        "aiExplanation": "페라자(한화)는 강력한 파워를 바탕으로 3위를 기록 중입니다."
      }
    ]
  }
};
