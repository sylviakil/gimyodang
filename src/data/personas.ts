/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PersonaItem {
  id: string;
  label: string;
  description: string;
}

export interface PersonaCategory {
  id: string;
  label: string;
  description: string;
  items: PersonaItem[];
}

export interface PersonaState {
  category: string;      // Category ID or 'custom'
  job: string;           // Selected job label or custom string
  gender: 'yin' | 'yang';
  ageGroup: 'adult' | 'middle' | 'elder' | 'senior';
  name: string;
}

export const GENDER_OPTIONS = [
  { id: 'yin', label: '여성', desc: '여성' },
  { id: 'yang', label: '남성', desc: '남성' }
] as const;

export const AGE_OPTIONS = [
  { id: 'adult', label: '20-30대', desc: '20-30대' },
  { id: 'middle', label: '40-50대', desc: '40-50대' },
  { id: 'elder', label: '60대', desc: '60대' },
  { id: 'senior', label: '70대 이상', desc: '70대 이상' }
] as const;

export const JOSEON_PERSONAS: PersonaCategory[] = [
  {
    id: 'yangban',
    label: '양반 / 종친 (Nobiles)',
    description: '명예와 유교의 법도 뒤에 숨겨진 추악과 한',
    items: [
      { id: 'fallen_schol', label: '몰락한 사대부 학인', description: '가문이 역모로 멸문당해 뼈저린 복수심으로 밤낮없이 맹세하는 학인' },
      { id: 'corrupt_gov', label: '탐관오리 부패 관료', description: '백성들의 골수를 짜 사유 금고를 채웠으나 죽은 이들의 원혼에 가위눌리는 수인' },
      { id: 'chaste_noble', label: '가문의 절개에 갇힌 후사', description: '가문의 절개를 위해 엄격한 규율과 감금을 강요당하고 어둠 속 방에서 흐느끼는 고독한 존재' },
      { id: 'failed_student', label: '과거 급제 낙방생', description: '수십 성상 낙방하여 가문의 폐쇄적인 눈초리와 비아냥에 미쳐버린 식자' }
    ]
  },
  {
    id: 'jungin',
    label: '중인 (Middle Class)',
    description: '전문 의술, 대외 통역, 그림과 천문이 부른 비극',
    items: [
      { id: 'physician', label: '혜민서 비술 의관', description: '독초와 비상의 조화를 탐구하여 극약 처방전을 밀거래하는 어두운 의학인' },
      { id: 'translator', label: '사역원 밀무역 역관', description: '명나라와 왜국 상인들의 극장적 거래를 통역하며 군사 기밀을 밀수하는 첩자' },
      { id: 'painter', label: '도화서 환각 화원', description: '지체 높은 이들의 은밀한 나체나 처참한 궁중 비사를 몰래 그리다 저주받은 화공' },
      { id: 'astronomer', label: '관상감 기화 천문관', description: '하늘에 떠오른 불길한 역병성과 몰락의 궤적을 궁궐 몰래 새기는 별지기' }
    ]
  },
  {
    id: 'sangmin',
    label: '상민 / 양민 (Commoners)',
    description: '지독한 생존경쟁과 수고로운 생살 뒤의 깊은 상흔',
    items: [
      { id: 'peddler', label: '보부상 장돌뱅이 장수', description: '전국 난전과 산맥을 맨발로 질주하다 재물 신령에 홀려 미친 방랑객' },
      { id: 'merchant', label: '육의전 사채 비단상인', description: '금전을 수탈하기 위해 혈안이 되다 자식 대에 흉한 재앙을 거둔 모비' },
      { id: 'blacksmith', label: '대장간 풀무 불꽃꾼', description: '천만 번 쇠를 담금질하다 끓어오르는 혈기를 이기지 못한 화병 환자' },
      { id: 'ferryman', label: '나루터 안개 사공', description: '강물에 빠진 시적 소망과 차마 이승을 떠나지 못한 사념을 몰고 다니는 뱃사공' }
    ]
  },
  {
    id: 'cheonmin',
    label: '천민 / 노비 (Outcasts)',
    description: '억울한 쇠사슬 아래 분출되지 못한 야수성과 절망',
    items: [
      { id: 'runaway_slave', label: '도망침을 도모하는 노비', description: '주인의 잔혹한 채찍과 수탈을 피해 주술적 결계로 도주를 꿈꾸는 도망인' },
      { id: 'butcher', label: '백정 소 도살 우인', description: '비천하게 가축의 피를 뒤집어쓰고 일했으나 이제 사람의 원을 베어 내려는 자' },
      { id: 'acrobat', label: '광대 극단 줄타기 재인', description: '허공 줄 위에서 부자들의 부도덕함을 웃어넘기지만 가슴속엔 칼을 품은 인물' },
      { id: 'groomsman', label: '역졸 파발 마필 전령', description: '밤낮없이 불사(不死)의 말을 타고 서찰을 전하느라 몸이 반쯤 사멸해 가는 소역' }
    ]
  },
  {
    id: 'shaman_outlier',
    label: '무속 및 기인 (Shamans)',
    description: '신적인 미치광이와 이승의 차가움의 경계선',
    items: [
      { id: 'beggar_inspector', label: '어출 걸식 부장 암행어사', description: '임금의 마패를 뒤로 한 채 타락한 사대부들을 염탐하다 부랑자로 눌러앉은 의사' },
      { id: 'powerless_mudang', label: '신기 떨어진 세습 무당', description: '더이상 조상신의 공수가 들리지 않아 억지 주술과 조청물에 소원을 비는 무당' },
      { id: 'scapegoat_exorcist', label: '대속 정수 액받이 광두', description: '지상 고귀한 이들의 지독한 액운과 사형 살을 제 살로 대속하는 육신적 피해자' },
      { id: 'geomancer', label: '음택 전문 묘자리 풍수가', description: '수려한 명당 대신 가문을 멸문 지화 할 수 있는 흉당과 독혈을 발굴하는 감별사' }
    ]
  }
];

export const MODERN_PERSONAS: PersonaCategory[] = [
  {
    id: 'it_tech',
    label: 'IT 및 첨단과학 직군',
    description: '알고리즘 연산 지옥과 가상계 정보의 고독사',
    items: [
      { id: 'dev_burnout', label: '번아웃 스타트업 개발자', description: '새벽 코딩과 카페인에 기대 서버 장애와 주주들의 폭언에 연소 중인 디지털 노예' },
      { id: 'ai_scientist', label: 'AI 딥러닝 인공지능 연구원', description: '기계에 심장을 주려 학습을 반복시키다 인간 고유의 감정에 공포를 느끼는 인지주의자' },
      { id: 'white_hacker', label: '화이트햇 사이버 보안관', description: '딥웹의 뒤틀린 범죄, 불법 암호자산 추적에 지쳐 가상계를 부수려는 보안전문가' },
      { id: 'crypto_speculator', label: '가상자산 단타 거래 중독자', description: '차트의 붉고 푸른 양봉 음봉 뒤에서 이성의 영혼을 베팅하고 불면에 절어버린 투기자' }
    ]
  },
  {
    id: 'finance_legal',
    label: '금융, 의료 및 전문직',
    description: '냉혹한 진실을 거래하는 지식 뒤의 피폐',
    items: [
      { id: 'dirty_wealth_mgr', label: '검은돈 전담 자산관리사', description: '최상류층의 차명 비자금 세탁과 부도 장부를 숨기며 영혼의 이면을 위조하는 인물' },
      { id: 'er_surgeon', label: '소생 불가 응급실 외과의사', description: '가위눌림과 생명의 한계를 절감하며 가운 아래 서릿발 같은 피의 저주를 쫓는 이' },
      { id: 'divorce_lawyer', label: '파탄 이혼 전문 법률가', description: '서로 죽이지 못해 안달 난 수백 쌍 부부들의 쓰레기 같은 부고 서명을 가위질하는 법조인' },
      { id: 'hft_quant', label: '고주파 트레이딩 퀀트매니저', description: '소형 투자자들을 파멸의 도가니에 몰아넣고 수익률에 이성을 봉납한 기계식 딜러' }
    ]
  },
  {
    id: 'arts_media',
    label: '예술, 연예 및 디지털 미디어',
    description: '화려한 명주의 이면에서 타인 비난과 평가에 으스러진 혼령',
    items: [
      { id: 'malicious_idol', label: '익명 테러에 뼈 삭은 아이돌', description: '수백만 개의 손가락질과 악의적 프레임 속에 항우울제 가루를 타 먹는 고립된 광대' },
      { id: 'webtoon_author', label: '휴재 유예 가위손 웹툰 작가', description: '지독한 고관절 파열과 7일 주기의 지옥 같은 복제 마감 노동에 좀비가 된 창작자' },
      { id: 'documentary_pd', label: '진실 소멸 불발 미디어 PD', description: '은폐된 권력 살인 비사를 도촬 폭로하고자 하나 역로비 속에 필름을 찢긴 고발인' },
      { id: 'indie_director', label: '명예 갈취 독립 영화 감독', description: '오직 걸작이라는 극치에 닿기 위해 자신과 스태프의 영과 육을 고혈로 쥐어짜는 예인' }
    ]
  },
  {
    id: 'service_labor',
    label: '대중 서비스 및 노무 자영업',
    description: '극단적 진상 갑질과 외딴 인생들이 교차하는 공간',
    items: [
      { id: 'cafe_damaged', label: '허위 별점 테러 카페 가솔', description: '장난 어린 악플 마녀사냥으로 평생 모은 개업 자금과 빚더미에 쓰러지는 자영자' },
      { id: 'night_chauffeur', label: '심야 만취 지옥 대리운전사', description: '인생들이 망토를 벗은 채 내뱉는 비밀 폭로와 음해를 묵묵히 귓가에 담는 관찰자' },
      { id: 'death_cleaner', label: '고독사 청소 유품정리사', description: '아무도 돌보지 않은 채 외롭게 썩어버린 육체들의 유품과 저주 서린 수첩을 닦는 역솔' },
      { id: 'dept_vip_mgr', label: 'VIP 초호화 명품관 총괄', description: '상류층의 가가대호 갑질을 수용하며 밤마다 자고 가던 고객들을 흑주술 인형으로 저주하는 자' }
    ]
  },
  {
    id: 'youth_seeking',
    label: '피폐한 구직자 및 취업 수험생',
    description: '사회적 죽음 위에서 끝없이 미소 짓는 가련한 자',
    items: [
      { id: 'govt_exam_repeater', label: '7년 낙방 고시원 공시생', description: '반 평 짜리 고시원에서 세상을 지운 채 시험이라는 단두대 앞에 7년 째 무릎 꿇은 고스트' },
      { id: 'rejected_candidate', label: '대기업 면접 최종 불합격생', description: '마지막 문턱에서 비웃음을 산 채 떨어져 친구들의 화려한 날개 지껄임에 미쳐 버린 한림' },
      { id: 'multijob_parttimer', label: '쓰리잡 새벽 배달 기행 전령', description: '생계 유지를 위해 오토바이를 몰며 도로 위에서 매일 죽음의 바퀴 자국을 피하는 소인' },
      { id: 'isolated_stud_abroad', label: '절해고도 아웃캐스트 유학생', description: '낯선 언어와 외딴 인종 속에서 극단적 소외감을 느끼며 홀로 조총 차를 벌컥이는 인물' }
    ]
  }
];
