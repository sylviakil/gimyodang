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

export const JOSEON_PERSONAS: PersonaCategory[] = [
  {
    id: 'yangban',
    label: '양반 / 종친 (Nobiles)',
    description: '명예와 유교의 법도 뒤에 숨겨진 추악과 한',
    items: [
      { id: 'fallen_schol',  label: '몰락한 사대부 학인',    description: '가문이 역모로 멸문당해 복수심으로 맹세하는 학인' },
      { id: 'corrupt_gov',   label: '탐관오리 부패 관료',    description: '백성의 골수를 짜내다 원혼에 가위눌리는 수인' },
      { id: 'chaste_noble',  label: '가문의 절개에 갇힌 후사', description: '절개를 강요당하고 어둠 속에서 흐느끼는 존재' },
      { id: 'failed_student','label': '과거 급제 낙방생',     description: '수십 성상 낙방하여 비아냥에 미쳐버린 식자' },
    ],
  },
  {
    id: 'jungin',
    label: '중인 (Middle Class)',
    description: '전문 지식이 부른 비극과 음모',
    items: [
      { id: 'physician',    label: '혜민서 비술 의관',    description: '독초 처방전을 밀거래하는 의학인' },
      { id: 'translator',   label: '사역원 밀무역 역관',   description: '군사 기밀을 밀수하는 첩자' },
      { id: 'painter',      label: '도화서 환각 화원',    description: '궁중 비사를 몰래 그리다 저주받은 화공' },
      { id: 'astronomer',   label: '관상감 기화 천문관',   description: '불길한 징조를 궁궐 몰래 새기는 별지기' },
    ],
  },
  {
    id: 'sangmin',
    label: '상민 / 양민 (Commoners)',
    description: '지독한 생존과 수고 뒤의 상흔',
    items: [
      { id: 'peddler',    label: '보부상 장돌뱅이 장수', description: '재물 신령에 홀려 미친 방랑객' },
      { id: 'merchant',   label: '육의전 사채 비단상인', description: '자식 대에 흉한 재앙을 거둔 모비' },
      { id: 'blacksmith', label: '대장간 풀무 불꽃꾼',  description: '혈기를 이기지 못한 화병 환자' },
      { id: 'ferryman',   label: '나루터 안개 사공',    description: '사념을 몰고 다니는 뱃사공' },
    ],
  },
  {
    id: 'cheonmin',
    label: '천민 / 노비 (Outcasts)',
    description: '쇠사슬 아래 분출되지 못한 야수성',
    items: [
      { id: 'runaway_slave', label: '도망침을 도모하는 노비',    description: '주술로 도주를 꿈꾸는 도망인' },
      { id: 'butcher',       label: '백정 소 도살 우인',        description: '사람의 원을 베어 내려는 자' },
      { id: 'acrobat',       label: '광대 극단 줄타기 재인',    description: '가슴속에 칼을 품은 인물' },
      { id: 'groomsman',     label: '역졸 파발 마필 전령',      description: '몸이 반쯤 사멸해 가는 소역' },
    ],
  },
  {
    id: 'shaman_outlier',
    label: '무속 및 기인 (Shamans)',
    description: '신적인 광기와 이승의 차가움의 경계',
    items: [
      { id: 'beggar_inspector',  label: '어출 걸식 암행어사',     description: '타락한 사대부를 염탐하다 부랑자가 된 의사' },
      { id: 'powerless_mudang',  label: '신기 떨어진 세습 무당',  description: '공수가 들리지 않아 억지 주술을 비는 무당' },
      { id: 'scapegoat_exorcist','label': '대속 정수 액받이 광두', description: '타인의 액운을 제 살로 대속하는 피해자' },
      { id: 'geomancer',         label: '음택 전문 묘자리 풍수가', description: '흉당과 독혈을 발굴하는 감별사' },
    ],
  },
];

export const MODERN_PERSONAS: PersonaCategory[] = [
  {
    id: 'it_tech',
    label: 'IT 및 첨단과학 직군',
    description: '알고리즘 연산 지옥과 번아웃',
    items: [
      { id: 'dev_burnout',      label: '번아웃 스타트업 개발자', description: '서버 장애와 폭언에 연소 중인 디지털 노예' },
      { id: 'ai_scientist',     label: 'AI 딥러닝 연구원',       description: '기계에 감정을 주다 자아가 붕괴된 학자' },
      { id: 'white_hacker',     label: '화이트햇 사이버 보안관', description: '딥웹의 뒤틀린 범죄에 지친 보안전문가' },
      { id: 'crypto_speculator','label': '가상자산 단타 중독자',  description: '불면에 절어버린 투기자' },
    ],
  },
  {
    id: 'finance_legal',
    label: '금융, 의료 및 전문직',
    description: '냉혹한 진실 뒤의 피폐',
    items: [
      { id: 'dirty_wealth_mgr', label: '검은돈 전담 자산관리사',   description: '영혼의 이면을 위조하는 인물' },
      { id: 'er_surgeon',       label: '소생 불가 응급실 외과의', description: '가위눌림에 시달리는 백의' },
      { id: 'divorce_lawyer',   label: '파탄 이혼 전문 법률가',   description: '유혈극의 서류를 가위질하는 법조인' },
      { id: 'hft_quant',        label: '고주파 트레이딩 퀀트매니저', description: '이성을 봉납한 기계식 딜러' },
    ],
  },
  {
    id: 'arts_media',
    label: '예술, 연예 및 디지털 미디어',
    description: '화려한 이면에서 으스러진 혼령',
    items: [
      { id: 'malicious_idol',   label: '악플 테러에 시달리는 아이돌', description: '항우울제를 털어 넣는 고립된 광대' },
      { id: 'webtoon_author',   label: '마감 지옥 웹툰 작가',        description: '신경이 파열된 창작자' },
      { id: 'documentary_pd',   label: '고발 불발 다큐멘터리 PD',    description: '역로비에 필름을 찢긴 고발인' },
      { id: 'indie_director',   label: '명예 갈취 독립 영화 감독',   description: '영과 육을 고혈로 쥐어짜는 예인' },
    ],
  },
  {
    id: 'service_labor',
    label: '대중 서비스 및 노무 자영업',
    description: '갑질과 고독이 교차하는 공간',
    items: [
      { id: 'cafe_damaged',   label: '허위 별점 테러 카페 점주',   description: '빚더미에 쓰러지는 자영자' },
      { id: 'night_chauffeur','label': '심야 만취 대리운전사',      description: '비밀 폭로를 귓가에 담는 관찰자' },
      { id: 'death_cleaner',  label: '고독사 청소 유품정리사',     description: '저주 서린 수첩을 닦는 역솔' },
      { id: 'dept_vip_mgr',   label: 'VIP 명품관 총괄 매니저',    description: '밤마다 고객을 저주하는 자' },
    ],
  },
  {
    id: 'youth_seeking',
    label: '피폐한 구직자 및 취업 수험생',
    description: '사회적 죽음 위에서 미소 짓는 가련한 자',
    items: [
      { id: 'govt_exam_repeater',  label: '7년 낙방 고시원 공시생',       description: '단두대 앞에 7년째 무릎 꿇은 고스트' },
      { id: 'rejected_candidate',  label: '대기업 면접 최종 불합격생',    description: '친구들의 합격 소식에 미쳐버린 한림' },
      { id: 'multijob_parttimer',  label: '쓰리잡 새벽 배달 전령',        description: '매일 죽음의 바퀴 자국을 피하는 소인' },
      { id: 'isolated_stud_abroad','label': '절해고도 외딴 유학생',        description: '홀로 차를 벌컥이는 인물' },
    ],
  },
];
