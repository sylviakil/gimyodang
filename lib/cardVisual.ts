import { CardVisualConfig } from '@/types';

export function generateCardConfig(
  desireCode: string,
  era: string,
  endingTone: string
): CardVisualConfig {
  const palette: Record<string, string> = {
    '①': '#3D4F6B',
    '②': '#5C4A1A',
    '③': '#8B3A4A',
    '④': '#2C1A1A',
    '⑤': '#2A4A5C',
    '⑥': '#3A4A2A',
    '⑦': '#2A3A4A',
  };

  const texture: Record<string, string> = {
    joseon: 'hanji',
    modern: 'concrete',
  };

  const border: Record<string, string> = {
    warm: '#C9A84C',
    cold: '#9BA8B5',
    open: 'transparent',
  };

  return {
    bgColor:      palette[desireCode] ?? '#2C1A1A',
    textureClass: texture[era] ?? 'hanji',
    borderColor:  border[endingTone] ?? '#C9A84C',
    borderStyle:  endingTone === 'open' ? 'dashed' : 'solid',
  };
}
