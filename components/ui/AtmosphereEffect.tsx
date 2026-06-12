'use client';
import { useEffect, useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

interface Petal {
  id: number;
  left: string;
  size: string;
  delay: string;
  duration: string;
  opacity: number;
}

export default function AtmosphereEffect() {
  const { settings } = useSettings();
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    const count = settings.particleCount;
    const speedMul = settings.animationSpeed === 'slow' ? 1.6 : settings.animationSpeed === 'fast' ? 0.6 : 1;
    const newPetals: Petal[] = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 6 + 5}px`,
      delay: `${Math.random() * 10}s`,
      duration: `${(Math.random() * 12 + 10) * speedMul}s`,
      opacity: Math.random() * 0.35 + 0.2,
    }));
    setPetals(newPetals);
  }, [settings.particleCount, settings.animationSpeed]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* 상단 중앙 — 딥네이비 빛기둥 */}
      <div className="absolute top-[-60px] left-1/2 -translate-x-1/2 w-[650px] h-[480px] rounded-full opacity-[0.38] blur-[100px]"
        style={{ background: 'radial-gradient(ellipse, #2d4060 0%, #1a2a42 40%, #0d1628 75%, transparent 100%)' }} />
      {/* 왼쪽 — 슬레이트블루 글로우 */}
      <div className="absolute top-[5%] left-[-60px] w-[400px] h-[440px] rounded-full opacity-[0.30] blur-[90px]"
        style={{ background: 'radial-gradient(ellipse, #243a5a 0%, #1a2d46 50%, #0d1a2e 80%, transparent 100%)' }} />
      {/* 오른쪽 하단 — 블루그레이 */}
      <div className="absolute bottom-[5%] right-[-40px] w-[440px] h-[380px] rounded-full opacity-[0.28] blur-[95px]"
        style={{ background: 'radial-gradient(ellipse, #2d3f5a 0%, #1e2d45 50%, #0a1422 80%, transparent 100%)' }} />
      {/* 중앙 하단 — 안개 레이어 */}
      <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2 w-[540px] h-[240px] rounded-full opacity-[0.22] blur-[85px]"
        style={{ background: 'radial-gradient(ellipse, #1e2e48 0%, #111e35 60%, transparent 100%)' }} />
      {/* 금빛 — 아주 은은하게 (기묘당 아이덴티티 유지) */}
      <div className="absolute top-[35%] left-1/2 -translate-x-1/2 w-[260px] h-[160px] rounded-full opacity-[0.07] blur-[70px]"
        style={{ background: 'radial-gradient(circle, #e8c97a 0%, #C9A84C 50%, transparent 100%)' }} />

      {/* 꽃잎 파티클 (보라/연보라 톤으로 유지) */}
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="plum-petal"
          style={{
            left: petal.left,
            width: petal.size,
            height: petal.size,
            animationDelay: petal.delay,
            animationDuration: petal.duration,
            opacity: petal.opacity,
          }}
        />
      ))}
    </div>
  );
}
