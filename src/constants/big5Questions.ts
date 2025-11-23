/**
 * Big5 성격 분석 질문 (10문항)
 *
 * Big5 5가지 요소:
 * - Openness (개방성): 호기심, 창의성, 새로운 경험에 대한 개방성
 * - Conscientiousness (성실성): 조직력, 책임감, 목표지향성
 * - Extraversion (외향성): 사교성, 활동성, 긍정적 감정
 * - Agreeableness (친화성): 협력성, 공감능력, 이타성
 * - Neuroticism (신경성): 불안, 우울, 정서적 불안정성
 *
 * 점수: 1 (전혀 그렇지 않다) ~ 5 (매우 그렇다)
 */

export interface Big5Question {
  id: number;
  text: string;
  trait: 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism';
  reverse: boolean; // true면 역문항 (점수 반전)
}

export const BIG5_QUESTIONS: Big5Question[] = [
  // 1. Extraversion (외향성) - 긍정 문항
  {
    id: 1,
    text: "나는 새로운 사람들을 만나고 대화하는 것을 즐긴다",
    trait: "extraversion",
    reverse: false
  },

  // 2. Agreeableness (친화성) - 긍정 문항
  {
    id: 2,
    text: "나는 다른 사람들의 감정을 잘 이해하고 공감한다",
    trait: "agreeableness",
    reverse: false
  },

  // 3. Conscientiousness (성실성) - 긍정 문항
  {
    id: 3,
    text: "나는 계획을 세우고 그것을 철저히 따른다",
    trait: "conscientiousness",
    reverse: false
  },

  // 4. Neuroticism (신경성) - 긍정 문항 (높을수록 불안정)
  {
    id: 4,
    text: "나는 작은 일에도 쉽게 걱정하고 불안해한다",
    trait: "neuroticism",
    reverse: false
  },

  // 5. Openness (개방성) - 긍정 문항
  {
    id: 5,
    text: "나는 새로운 아이디어와 경험을 시도하는 것을 좋아한다",
    trait: "openness",
    reverse: false
  },

  // 6. Extraversion (외향성) - 역문항
  {
    id: 6,
    text: "나는 혼자 있는 시간이 더 편하고 좋다",
    trait: "extraversion",
    reverse: true
  },

  // 7. Conscientiousness (성실성) - 역문항
  {
    id: 7,
    text: "나는 종종 일을 미루고 계획 없이 행동한다",
    trait: "conscientiousness",
    reverse: true
  },

  // 8. Openness (개방성) - 역문항
  {
    id: 8,
    text: "나는 익숙한 것을 선호하고 변화를 싫어한다",
    trait: "openness",
    reverse: true
  },

  // 9. Agreeableness (친화성) - 역문항
  {
    id: 9,
    text: "나는 다른 사람의 의견보다 내 방식대로 하는 것을 선호한다",
    trait: "agreeableness",
    reverse: true
  },

  // 10. Neuroticism (신경성) - 역문항
  {
    id: 10,
    text: "나는 스트레스 상황에서도 침착함을 유지한다",
    trait: "neuroticism",
    reverse: true
  }
];

/**
 * 점수 척도
 */
export const SCORE_OPTIONS = [
  { value: 1, label: "전혀 그렇지 않다" },
  { value: 2, label: "그렇지 않다" },
  { value: 3, label: "보통이다" },
  { value: 4, label: "그렇다" },
  { value: 5, label: "매우 그렇다" }
];

/**
 * Big5 특성별 설명
 */
export const BIG5_DESCRIPTIONS = {
  openness: {
    name: "개방성",
    high: "창의적이고 호기심이 많으며, 새로운 경험을 즐깁니다.",
    low: "실용적이고 전통적이며, 익숙한 것을 선호합니다."
  },
  conscientiousness: {
    name: "성실성",
    high: "조직적이고 계획적이며, 목표 지향적입니다.",
    low: "자발적이고 융통성 있으며, 즉흥적입니다."
  },
  extraversion: {
    name: "외향성",
    high: "사교적이고 활동적이며, 에너지가 넘칩니다.",
    low: "조용하고 신중하며, 내성적입니다."
  },
  agreeableness: {
    name: "친화성",
    high: "협조적이고 공감 능력이 뛰어나며, 이타적입니다.",
    low: "독립적이고 경쟁적이며, 비판적입니다."
  },
  neuroticism: {
    name: "신경성",
    high: "민감하고 감정 기복이 있으며, 불안해하기 쉽습니다.",
    low: "안정적이고 차분하며, 스트레스에 강합니다."
  }
};
