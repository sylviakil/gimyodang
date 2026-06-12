/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, ArrowRight, AlertTriangle } from 'lucide-react';

interface PrologueVideoProps {
  onEnter: () => void;
}

const VIDEOS = ['/motion/1.mp4', '/motion/2.mp4', '/motion/3.mp4', '/motion/4.mp4'];

const SUBTITLES = [
  "자욱한 향기가 공간의 가장자리를 가득 채우고 있습니다...",
  "그늘을 찾아 헤매다 보면 어둑어둑한 한복판, 시공조차 멈춘 기묘당(奇妙堂)의 문이 드러납니다.",
  "이곳에서는 어떤 도덕적 손가락질도, 마음 아픈 훈계도 허물어집니다.",
  "오직 그대 가슴속에 차곡차곡 쌓인 검붉은 한(恨)과 집착만이 이 기묘한 가열의 재료가 됩니다."
];

export default function PrologueVideo({ onEnter }: PrologueVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoIdx, setVideoIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [subIdx, setSubIdx] = useState(0);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const ratio = video.currentTime / video.duration;
    setProgress(ratio * 100);
    // 자막 4개를 영상 길이에 균등 배분
    setSubIdx(Math.min(Math.floor(ratio * SUBTITLES.length), SUBTITLES.length - 1));
  };

  // 영상 끝나면 다음 영상으로 루핑
  const handleVideoEnded = () => {
    setVideoIdx((prev) => (prev + 1) % VIDEOS.length);
    setProgress(0);
    setSubIdx(0);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 md:p-8 max-w-4xl mx-auto shadow-2xl relative overflow-hidden flex flex-col font-serif">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#4D869B]/20 via-[#88BAC8]/80 to-[#422C47]/20" />

      {/* Video player */}
      <div className="relative aspect-video w-full rounded-lg bg-black overflow-hidden select-none shadow-2xl">

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

        {/* 하단 그라디언트 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none z-10" />

        {/* 상단 상태 표시 */}
        <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center px-4 py-3 text-[10px] font-sans tracking-widest uppercase">
          <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm border border-[#88BAC8]/20 px-2 py-0.5 rounded text-[#88BAC8]">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            <span>롤링 프롤로그 무비 (PROLOGUE VIDEO)</span>
          </span>
          <span className="font-mono text-white/40 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded">
            {videoIdx + 1} / {VIDEOS.length}
          </span>
        </div>

        {/* 자막 — 배경 없이 텍스트만 */}
        <div className="absolute bottom-10 left-0 right-0 z-20 px-6 text-center pointer-events-none">
          <p
            key={subIdx}
            className="text-white text-sm md:text-base tracking-wide leading-relaxed font-serif font-light drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] transition-opacity duration-700"
          >
            "{SUBTITLES[subIdx]}"
          </p>
        </div>

        {/* 컨트롤 */}
        <div className="absolute bottom-2 left-0 right-0 z-20 flex justify-between items-center px-4 text-xs text-white/60 font-sans select-none">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="p-1 px-2.5 rounded bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-colors flex items-center gap-1.5 text-white focus:outline-none"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? '일시 정지' : '재생'}</span>
            </button>
            <button
              onClick={toggleMute}
              className="p-1.5 hover:bg-black/50 rounded backdrop-blur-sm transition-colors focus:outline-none"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-[#88BAC8]" />}
            </button>
          </div>

          {isPlaying && (
            <div className="flex items-end gap-0.5 h-3">
              <span className="w-0.5 bg-[#88BAC8] animate-[bounce_0.8s_infinite] h-1" />
              <span className="w-0.5 bg-[#88BAC8] animate-[bounce_1.2s_infinite] h-3" />
              <span className="w-0.5 bg-[#88BAC8] animate-[bounce_0.5s_infinite] h-2" />
              <span className="w-0.5 bg-[#88BAC8] animate-[bounce_1s_infinite] h-3.5" />
              <span className="w-0.5 bg-[#88BAC8] animate-[bounce_0.7s_infinite] h-1.5" />
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <div className="flex items-start gap-4 p-4 rounded-lg bg-sky-950/20 backdrop-blur-sm border border-[#4D869B]/30 text-[#88BAC8]/90 shadow-xl">
          <AlertTriangle className="w-5 h-5 shrink-0 text-[#88BAC8]/90 mt-1" />
          <div className="text-xs md:text-sm font-sans leading-relaxed">
            <h4 className="font-serif font-bold text-white mb-1 tracking-tight text-[#88BAC8]">⚠️ 심장 거래 규약 (Consequence & Penalty Accordance)</h4>
            <p className="text-white/60 font-light font-serif text-[11px] md:text-xs">
              기묘당에서 발휘되는 가공할 달콤한 조제 효력에는 그에 따르는 운명 대가가 양날의 검처럼 교직됩니다.
              로그인 없이 갤러리와 5장면 프롤로그 관람은 자유로우나, 연화와의 맞춤 조제 질문지에 대답하여 나만의 단과자를 생성하려면 결계 입장(로그인)이 필수적입니다.
            </p>
          </div>
        </div>

        <div className="pt-3 text-center">
          <button
            onClick={onEnter}
            className="w-full md:w-auto px-10 py-4 rounded bg-[#88BAC8] text-black hover:bg-[#a5cbd6] font-bold tracking-widest text-xs uppercase shadow-lg shadow-[#88BAC8]/10 transition-all duration-300 transform hover:scale-[1.01] inline-flex items-center justify-center gap-3 focus:outline-none cursor-pointer"
          >
            <span>시대 선택하기</span>
            <ArrowRight className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
