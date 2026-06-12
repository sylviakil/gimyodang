import { DesireCard } from '@/types';

// 18개 카드, 매 세션 랜덤 5개 노출
// 내부 코드(①~⑦)는 AI 프롬프트용, UI에는 label만 노출
export const ALL_DESIRE_CARDS: DesireCard[] = [
  { id: 'd1',  code: '①', label: '잊고 싶다',      description: '기억에 새긴 상흔을 어둠 속에 완전히 묻어두고 싶을 때',         icon: 'Sparkles' },
  { id: 'd2',  code: '①', label: '사라지고 싶다',  description: '지금 이 존재 자체를 어딘가로 지워버리고 싶을 때',               icon: 'Sparkles' },
  { id: 'd3',  code: '①', label: '멈추고 싶다',    description: '끝없이 흘러가는 시간과 고통을 이 자리에서 멈추고 싶을 때',       icon: 'Sparkles' },
  { id: 'd4',  code: '②', label: '이기고 싶다',    description: '타인과의 경쟁에서 반드시 앞서고 우위를 점하고 싶을 때',         icon: 'Sword' },
  { id: 'd5',  code: '②', label: '증명하고 싶다',  description: '나의 가치와 능력을 세상에 기어코 보여주고 싶을 때',             icon: 'Sword' },
  { id: 'd6',  code: '②', label: '소유하고 싶다',  description: '손에 쥐지 못한 것을 완전히 내 것으로 만들고 싶을 때',           icon: 'Sword' },
  { id: 'd7',  code: '③', label: '사랑받고 싶다',  description: '더 깊이 이어지고 온기를 받아 안고 싶을 때',                     icon: 'Heart' },
  { id: 'd8',  code: '③', label: '용서받고 싶다',  description: '오래된 죄책과 상처를 털고 관계를 되살리고 싶을 때',             icon: 'Heart' },
  { id: 'd9',  code: '③', label: '연결되고 싶다',  description: '단절과 고독에서 벗어나 무언가와 이어지고 싶을 때',               icon: 'Heart' },
  { id: 'd10', code: '④', label: '복수하고 싶다',  description: '나에게 상처 준 흔적을 고스란히 되돌려주고 싶을 때',             icon: 'Flame' },
  { id: 'd11', code: '⑤', label: '알고 싶다',      description: '감춰진 진실과 비밀을 기어코 들추고 싶을 때',                   icon: 'Eye' },
  { id: 'd12', code: '⑤', label: '숨기고 싶다',    description: '드러나선 안 될 것을 영원히 품고 봉인하고 싶을 때',              icon: 'Eye' },
  { id: 'd13', code: '⑤', label: '믿고 싶다',      description: '의심과 불신의 안개를 걷고 온전히 믿음을 갖고 싶을 때',         icon: 'Eye' },
  { id: 'd14', code: '⑥', label: '되찾고 싶다',    description: '잃어버린 것을 어떻게든 다시 손에 쥐고 싶을 때',                icon: 'Undo2' },
  { id: 'd15', code: '⑥', label: '돌아가고 싶다',  description: '망가지기 이전 그 순간으로 발길을 돌리고 싶을 때',              icon: 'Undo2' },
  { id: 'd16', code: '⑥', label: '고치고 싶다',    description: '어긋난 선택과 관계를 고쳐 다시 온전하게 만들고 싶을 때',       icon: 'Undo2' },
  { id: 'd17', code: '⑦', label: '벗어나고 싶다',  description: '무거운 억압과 굴레를 완전히 던져버리고 싶을 때',               icon: 'Wind' },
  { id: 'd18', code: '⑦', label: '놓아주고 싶다',  description: '오랜 집착과 미련을 손에서 놓아 자유로워지고 싶을 때',           icon: 'Wind' },
];

export function getRandomCards(count = 5): DesireCard[] {
  return [...ALL_DESIRE_CARDS]
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
}
