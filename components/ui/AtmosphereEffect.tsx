'use client';
import { useEffect, useState } from 'react';

interface Petal {
  id: number;
  left: string;
  size: string;
  delay: string;
  duration: string;
  opacity: number;
}

export default function AtmosphereEffect() {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    const newPetals: Petal[] = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 6 + 5}px`,
      delay: `${Math.random() * 10}s`,
      duration: `${Math.random() * 12 + 10}s`,
      opacity: Math.random() * 0.35 + 0.2,
    }));
    setPetals(newPetals);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* 배경 빛 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[350px] rounded-full bg-[#C9A84C] opacity-[0.04] blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[250px] rounded-full bg-[#8B2635] opacity-[0.06] blur-[100px]" />
      {/* 매화꽃 파티클 */}
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
