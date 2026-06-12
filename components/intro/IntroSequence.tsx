'use client';
import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, ArrowRight, AlertTriangle } from 'lucide-react';

interface IntroSequenceProps {
  onEnter: () => void;
}

const VIDEOS = ['/motion/1.mp4', '/motion/2.mp4', '/motion/3.mp4', '/motion/4.mp4'];

const SUBTITLES = [
  '자욱한 향기가 공간의 가장자리를 가득 채우고 있습니다...',
  '그늘을 찾아 헤매다 보면 시공조차 멈춘 기묘당(奇妙堂)의 문이 드러납니다.',
  '이곳에서는 어떤 도덕적 손가락질도, 마음 아픈 훈계도 허물어집니다.',
  '오직 그대 가슴속 검붉은 한(恨)과 집착만이 이 기묘한 가열의 재료가 됩니다.',
];

export default function IntroSequence({ onEnter }: IntroSequenceProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoIdx, setVideoIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [subIdx, setSubIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const ratio = video.currentTime / video.duration;
    setProgress(ratio * 100);
    setSubIdx(Math.min(Math.floor(ratio * SUBTITLES.length), SUBTITLES.length - 1));
  };

  const handleVideoEnded = () => {
    setVideoIdx((prev) => (prev + 1) % VIDEOS.length);
    setProgress(0);
    setSubIdx(0);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) video.pause(); else video.play().catch(() => {});
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="h-screen w-full flex items-center justify-center overflow-hidden px-4">
      <div className="w-full max-w-3xl flex flex-col gap-3 rounded-2xl p-4 md:p-6 relative overflow-hidden"
        style={{
          maxHeight: 'calc(100vh - 48px)',
          background: 'linear-gradient(145deg, rgba(18,30,52,0.7) 0%, rgba(10,18,36,0.78) 50%, rgba(6,10,22,0.82) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(45,72,110,0.4)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        }}
      >
        <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-[#4a7aaa]/40 to-transparent" />
        {/* 세로 빛줄기 */}
        <div className="absolute top-0 left-[18%] w-[1px] h-full opacity-[0.07]"
          style={{ background: 'linear-gradient(to bottom, transparent, #5a80aa, transparent)' }} />
        <div className="absolute top-0 right-[22%] w-[1px] h-full opacity-[0.05]"
          style={{ background: 'linear-gradient(to bottom, transparent, #3d5a7a, transparent)' }} />

        {/* 비디오 플레이어 */}
        <div className="relative aspect-video w-full rounded-lg bg-black overflow-hidden shadow-2xl">
          <video
            ref={videoRef}
            key={VIDEOS[videoIdx]}
            src={VIDEOS[videoIdx]}
            autoPlay
            muted={isMuted}
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnded}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none z-10" />

          {/* 상태 표시 */}
          <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center px-4 py-3 text-[10px] font-sans tracking-widest uppercase">
            <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm border border-[#C9A84C]/20 px-2 py-0.5 rounded text-[#C9A84C]">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              롤링 프롤로그 무비
            </span>
            <span className="font-mono text-white/40 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded">
              {videoIdx + 1} / {VIDEOS.length}
            </span>
          </div>

          {/* 자막 */}
          <div className="absolute bottom-10 left-0 right-0 z-20 px-6 text-center pointer-events-none">
            <p key={subIdx} className="text-white text-sm md:text-base tracking-wide leading-relaxed font-serif drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              "{SUBTITLES[subIdx]}"
            </p>
          </div>

          {/* 프로그레스 바 */}
          <div className="absolute bottom-0 left-0 right-0 z-20 h-0.5 bg-white/10">
            <div className="h-full bg-[#C9A84C]/60 transition-all" style={{ width: `${progress}%` }} />
          </div>

          {/* 컨트롤 */}
          <div className="absolute bottom-2 left-0 right-0 z-20 flex justify-between items-center px-4">
            <div className="flex items-center gap-2">
              <button onClick={togglePlay} className="p-1 px-2.5 rounded bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-colors flex items-center gap-1.5 text-white text-xs focus:outline-none">
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? '일시 정지' : '재생'}</span>
              </button>
              <button onClick={toggleMute} className="p-1.5 hover:bg-black/50 rounded backdrop-blur-sm transition-colors focus:outline-none">
                {isMuted
                  ? <VolumeX className="w-3.5 h-3.5 text-red-400" />
                  : <Volume2 className="w-3.5 h-3.5 text-[#C9A84C]" />}
              </button>
            </div>
            {isPlaying && (
              <div className="flex items-end gap-0.5 h-3">
                {[0.8, 1.2, 0.5, 1, 0.7].map((d, i) => (
                  <span key={i} className="w-0.5 bg-[#C9A84C]" style={{ height: `${d * 14}px`, animation: `bounce ${d}s infinite` }} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 안내 문구 */}
        <div className="space-y-2.5">
          <div className="flex items-start gap-4 p-4 rounded-lg backdrop-blur-sm border text-[#C9A84C]/90"
            style={{ background: 'rgba(26,42,66,0.45)', borderColor: 'rgba(74,122,170,0.25)' }}>
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-xs font-sans leading-relaxed">
              <h4 className="font-serif font-bold text-[#C9A84C] mb-1">⚠️ 심장 거래 규약</h4>
              <p className="text-white/60 font-serif text-[11px]">
                기묘당의 조제 효력에는 반드시 운명의 대가가 따릅니다.
                갤러리 감상은 자유이나, 연화와의 조제 대화에는 결계 입장(로그인)이 필요합니다.
              </p>
            </div>
          </div>
          <div className="text-center">
            <button
              onClick={onEnter}
              className="w-full md:w-auto px-8 py-3 rounded bg-[#C9A84C] text-black hover:bg-[#d6b26d] font-bold tracking-widest text-xs uppercase shadow-lg transition-all duration-300 hover:scale-[1.01] inline-flex items-center justify-center gap-3 focus:outline-none cursor-pointer"
            >
              <span>기묘당에 들어서다</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
