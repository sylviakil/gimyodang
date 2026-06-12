/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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

// Responses from server matching the specification
export interface GimyodangResponse {
  yeonhwa_speech?: string;
  flashback?: Flashback;
  yeonhwa_question?: string;
  prescription?: Prescription;
  ending?: {
    text: string;
    tone: 'warm' | 'cold' | 'open';
    last_image: string;
  };
  error?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'yeonhwa';
  text: string;
  prescription?: Prescription; // Attach if it was a prescription
  flashback?: Flashback;       // Attach if it was a flashback
  yeonhwa_question?: string;
  timestamp: string;
}
