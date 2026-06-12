export type EraType = 'joseon' | 'modern';

export interface DesireCard {
  id: string;
  code: string;
  label: string;
  description: string;
  icon: string;
}

export interface Prescription {
  original: string;
  name: string;
  visual: string;
  ingredients: string;
  effect: string;
  price: string;
  desire_code: string;
  price_code: string;
  scale: '個' | '雙' | '群';
}

export interface Flashback {
  text: string;
  tags: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'yeonhwa';
  text: string;
  prescription?: Prescription;
  flashback?: Flashback;
  timestamp: string;
}

export interface Story {
  id: string;
  author_id: string | null;
  guest_name: string;
  guest_status: string | null;
  era: EraType;
  desire_type: string;
  desire_content: string;
  confection_original: string;
  confection_name: string;
  confection_ingredients: string;
  confection_effect: string;
  confection_price: string;
  ending_content: string;
  ending_tone: 'warm' | 'cold' | 'open';
  card_visual_config: CardVisualConfig | null;
  is_public: boolean;
  likes_count: number;
  created_at: string;
}

export interface CardVisualConfig {
  bgColor: string;
  textureClass: string;
  borderColor: string;
  borderStyle: 'solid' | 'dashed';
}

export interface PersonaState {
  category: string;
  job: string;
  gender: 'yin' | 'yang';
  ageGroup: 'youth' | 'adult' | 'middle' | 'elder';
  name: string;
}
