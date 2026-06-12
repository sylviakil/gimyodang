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
    // Generate randomized styling variables for 15 plum-blossom petals
    const newPetals: Petal[] = Array.from({ length: 15 }).map((_, i) => {
      const left = `${Math.random() * 100}%`;
      const size = `${Math.random() * 8 + 6}px`;
      const delay = `${Math.random() * 10}s`;
      const duration = `${Math.random() * 12 + 10}s`;
      const opacity = Math.random() * 0.4 + 0.3;

      return {
        id: i,
        left,
        size,
        delay,
        duration,
        opacity,
      };
    });

    setPetals(newPetals);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Mystical vignetting / background light source */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#4D869B] opacity-[0.11] blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] rounded-full bg-[#336063] opacity-[0.09] blur-[100px]" />

      {/* Cascading petals */}
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
