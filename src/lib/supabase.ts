/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';

// Access public client-side variables
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are set
export const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseUrl !== 'https://your-project.supabase.co' && 
  supabaseAnonKey && 
  supabaseAnonKey !== 'your-anon-key';

// Instantiate Supabase client if configured, otherwise return null
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Super lightweight Local Storage Simulation fallback to keep the applet 
 * fully working inside the preview until the user populates their .env variables.
 */
class SupabaseSimulation {
  private users: Record<string, string> = {
    'guest@gimyodang.com': 'password123',
    'guest@gmail.com': 'password123'
  };
  private curUser: { email: string; id: string } | null = null;
  private savedPrescriptions: any[] = [
    {
      id: 'mock-1',
      user_email: 'guest@gimyodang.com',
      prescription: {
        original: '망각약과 (忘却藥果)',
        name: '반망각과 (半忘却果)',
        visual: '밀가루와 참기름으로 구운 약과. 중앙만 베어 먹도록 잘려있는 고운 갈색 빛.',
        ingredients: '꿀(욕망의 단맛)과 도라지 정과(苦, 감춰진 쓴맛).',
        effect: '중앙을 조심히 먹으면 그 사람과의 가장 아릿한 추억이 흐릿해집니다.',
        price: '나머지 조각에는 그 사람 때문에 가슴 치며 기뻐했던 첫 마음이 남겨집니다.',
        desire_code: '①',
        price_code: 'A',
        scale: '雙'
      },
      created_at: new Date('2026-05-30').toISOString()
    },
    {
      id: 'mock-2',
      user_email: 'guest@gimyodang.com',
      prescription: {
        original: '올란 (栗卵)',
        name: '회귀올란 (回歸栗卵)',
        visual: '밤을 부드럽게 으깨어 서늘한 꿀강정을 두른 둥근 형태.',
        ingredients: '아침 이슬 품은 밤(土, 귀환)과 계피(火, 자극).',
        effect: '과거 잃어버렸던 소중한 추억의 장면이 눈앞에 아지랑이처럼 맺힙니다.',
        price: '다시 빚어진 기억을 삼키는 순간, 현실의 어떤 가치있는 약속이 서서히 풍화됩니다.',
        desire_code: '⑥',
        price_code: 'E',
        scale: '個'
      },
      created_at: new Date('2026-06-01').toISOString()
    }
  ];

  constructor() {
    // Load existing prescriptions from localStorage if available
    try {
      const persisted = localStorage.getItem('gimyodang_sim_prescriptions');
      if (persisted) {
        this.savedPrescriptions = JSON.parse(persisted);
      }
    } catch (e) {
      console.warn('LocalStorage access is blocked or unavailable:', e);
    }
  }

  getCurrentUser() {
    return this.curUser;
  }

  async signUp(email: string, pass: string) {
    if (this.users[email]) {
      throw new Error('이미 등록된 은밀한 영혼(이메일)입니다.');
    }
    this.users[email] = pass;
    this.curUser = { email, id: `user-${Math.random().toString(36).substr(2, 9)}` };
    return { data: { user: this.curUser }, error: null };
  }

  async signIn(email: string, pass: string) {
    if (this.users[email] && this.users[email] === pass) {
      this.curUser = { email, id: `user-${email}` };
      return { data: { user: this.curUser }, error: null };
    }
    throw new Error('가입되지 않은 영혼이거나 비밀의 신호(암호)가 맞지 않습니다.');
  }

  async signOut() {
    this.curUser = null;
    return { error: null };
  }

  async getPrescriptions() {
    return { data: this.savedPrescriptions, error: null };
  }

  async savePrescription(prescription: any) {
    const newRecord = {
      id: `pres-${Date.now()}`,
      user_email: this.curUser?.email || 'anonymous',
      prescription,
      created_at: new Date().toISOString()
    };
    this.savedPrescriptions = [newRecord, ...this.savedPrescriptions];
    try {
      localStorage.setItem('gimyodang_sim_prescriptions', JSON.stringify(this.savedPrescriptions));
    } catch (e) {
      console.error('Failed to write storage simulation:', e);
    }
    return { data: newRecord, error: null };
  }
}

export const simulatedSupabase = new SupabaseSimulation();
