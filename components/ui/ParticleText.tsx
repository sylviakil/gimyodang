'use client';
import { useEffect, useRef } from 'react';

interface ParticleTextProps {
  text: string;
  className?: string;
}

export default function ParticleText({ text, className = '' }: ParticleTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width  = W;
    canvas.height = H;

    // 텍스트를 캔버스에 그려 픽셀 좌표 추출
    ctx.fillStyle = '#C9A84C';
    ctx.font = `bold ${Math.floor(H * 0.6)}px "Nanum Myeongjo", serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, W / 2, H / 2);

    const imageData = ctx.getImageData(0, 0, W, H);
    const pixels = imageData.data;
    const targetPoints: { x: number; y: number }[] = [];

    const step = 4;
    for (let y = 0; y < H; y += step) {
      for (let x = 0; x < W; x += step) {
        const idx = (y * W + x) * 4;
        if (pixels[idx + 3] > 128) {
          targetPoints.push({ x, y });
        }
      }
    }

    ctx.clearRect(0, 0, W, H);

    // 파티클 초기화 (화면 랜덤 위치에서 시작해 목표로 이동)
    const particles = targetPoints.map((tp) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      tx: tp.x,
      ty: tp.y,
    }));

    let frame = 0;
    const totalFrames = 60;

    const animate = () => {
      ctx.clearRect(0, 0, W, H);
      const t = Math.min(frame / totalFrames, 1);
      const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic

      ctx.fillStyle = '#C9A84C';
      for (const p of particles) {
        const cx = p.x + (p.tx - p.x) * ease;
        const cy = p.y + (p.ty - p.y) * ease;
        ctx.beginPath();
        ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      frame++;
      if (frame <= totalFrames + 10) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [text]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      style={{ display: 'block' }}
    />
  );
}
