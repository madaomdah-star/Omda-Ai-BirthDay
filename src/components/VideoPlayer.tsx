import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize, Film, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import { SceneClip, AspectRatio, AudioSettings } from '../types';
import { DurationMismatchOverlay } from './DurationMismatchOverlay';

interface VideoPlayerProps {
  scenes: SceneClip[];
  aspectRatio: AspectRatio;
  audioSettings: AudioSettings;
  language: 'ar' | 'en';
  onInspectScene: (scene: SceneClip) => void;
  onOpenVoiceRecorder?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  scenes,
  aspectRatio,
  audioSettings,
  language,
  onInspectScene,
  onOpenVoiceRecorder,
}) => {
  const isAr = language === 'ar';
  const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);

  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDurationOverlay, setShowDurationOverlay] = useState(true);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement>>({});
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Find active scene based on currentTime
  let accumulatedTime = 0;
  let activeSceneIndex = 0;
  let activeScene: SceneClip = scenes[0] || null;
  let activeSceneLocalTime = 0;

  for (let i = 0; i < scenes.length; i++) {
    const s = scenes[i];
    if (currentTime >= accumulatedTime && currentTime < accumulatedTime + s.duration) {
      activeSceneIndex = i;
      activeScene = s;
      activeSceneLocalTime = currentTime - accumulatedTime;
      break;
    }
    accumulatedTime += s.duration;
  }
  if (currentTime >= totalDuration && scenes.length > 0) {
    activeSceneIndex = scenes.length - 1;
    activeScene = scenes[scenes.length - 1];
    activeSceneLocalTime = activeScene.duration;
  }

  // Playback Loop
  useEffect(() => {
    let lastTimestamp = performance.now();

    const loop = (timestamp: number) => {
      if (!isPlaying) return;
      const delta = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      setCurrentTime((prev) => {
        const next = prev + delta;
        if (next >= totalDuration) {
          setIsPlaying(false);
          return totalDuration;
        }
        return next;
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    if (isPlaying) {
      lastTimestamp = performance.now();
      animFrameRef.current = requestAnimationFrame(loop);
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, totalDuration]);

  // Synchronize active video element with currentTime
  useEffect(() => {
    const currentVideo = videoRefs.current[activeScene?.id];
    if (currentVideo) {
      const targetTime = activeSceneLocalTime % (currentVideo.duration || activeScene?.duration || 8);
      if (Math.abs(currentVideo.currentTime - targetTime) > 0.3) {
        currentVideo.currentTime = targetTime;
      }
      if (isPlaying && currentVideo.paused) {
        currentVideo.play().catch(() => {});
      } else if (!isPlaying && !currentVideo.paused) {
        currentVideo.pause();
      }
    }

    // Synchronize Voiceover
    if (voiceAudioRef.current) {
      if (Math.abs(voiceAudioRef.current.currentTime - currentTime) > 0.4) {
        voiceAudioRef.current.currentTime = currentTime;
      }
      if (isPlaying && voiceAudioRef.current.paused) {
        voiceAudioRef.current.play().catch(() => {});
      } else if (!isPlaying && !voiceAudioRef.current.paused) {
        voiceAudioRef.current.pause();
      }
    }
  }, [activeScene?.id, activeSceneLocalTime, isPlaying, currentTime]);

  const togglePlay = () => {
    if (currentTime >= totalDuration) {
      setCurrentTime(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
  };

  const handleReplay = () => {
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const activeCaption = isAr
    ? (activeScene?.captionTextAr || activeScene?.captionText)
    : activeScene?.captionText;

  // Gentle camera zoom factor calculation based on local time in scene
  const sceneProgress = activeScene ? (activeSceneLocalTime / activeScene.duration) : 0;
  const zoomScale = 1.0 + (sceneProgress * 0.05); // 100% to 105% smooth push-in

  return (
    <div
      ref={playerContainerRef}
      className="flex flex-col bg-neutral-950 rounded-2xl border border-neutral-800/80 shadow-2xl overflow-hidden"
    >
      {/* Voiceover hidden audio tag for playback */}
      {audioSettings.voiceoverBlobUrl && (
        <audio
          ref={voiceAudioRef}
          src={audioSettings.voiceoverBlobUrl}
          muted={isMuted}
        />
      )}

      {/* Screen Frame with Dynamic Aspect Ratio */}
      <div className="relative w-full bg-black flex items-center justify-center overflow-hidden select-none">
        
        <div
          className={`relative w-full flex items-center justify-center transition-all duration-300 ${
            aspectRatio === '16:9' ? 'aspect-video max-h-[68vh]' : 'aspect-[9/16] max-h-[75vh]'
          }`}
        >
          {/* Render Active Scene Media */}
          {activeScene ? (
            <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
              
              {activeScene.videoUrl ? (
                <video
                  ref={(el) => {
                    if (el) videoRefs.current[activeScene.id] = el;
                  }}
                  src={activeScene.videoUrl}
                  playsInline
                  muted={isMuted || audioSettings.videoSoundVolume === 0}
                  className="w-full h-full object-cover transition-transform duration-300 ease-out"
                  style={{ transform: `scale(${zoomScale})` }}
                  onEnded={() => {
                    // Loop or handle next
                  }}
                />
              ) : activeScene.photoUrl ? (
                <img
                  src={activeScene.photoUrl}
                  alt={activeScene.title}
                  className="w-full h-full object-cover transition-transform duration-300 ease-out"
                  style={{ transform: `scale(${zoomScale})` }}
                />
              ) : (
                <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-neutral-500 text-sm">
                  {isAr ? 'مشهد نصي / فارغ' : 'Empty Scene'}
                </div>
              )}

              {/* Cinematic Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none"></div>

              {/* Caption Overlay */}
              {activeCaption && (
                <div className="absolute inset-x-0 bottom-6 sm:bottom-10 flex justify-center px-4 z-10 pointer-events-none">
                  {activeScene.role === 'title_card' ? (
                    <div className="text-center space-y-1 animate-in fade-in duration-700">
                      <p className="text-2xl sm:text-4xl font-bold font-serif text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] tracking-wide">
                        {activeCaption}
                      </p>
                    </div>
                  ) : (
                    <div className="px-5 py-2.5 rounded-2xl bg-neutral-950/75 border border-rose-500/30 backdrop-blur-md shadow-2xl text-center max-w-xl animate-in fade-in duration-300">
                      <p className="text-sm sm:text-base font-semibold text-neutral-100 drop-shadow-sm leading-relaxed">
                        {activeCaption}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Top Scene Info & Integrity Badge */}
              <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10 pointer-events-none">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-xs font-medium text-white shadow-lg">
                  <Film className="w-3.5 h-3.5 text-rose-400" />
                  <span>{isAr ? activeScene.titleAr : activeScene.title}</span>
                  <span className="text-neutral-400 font-mono text-[11px]">
                    ({activeSceneIndex + 1}/{scenes.length})
                  </span>
                </div>

                <div className="flex items-center gap-2 pointer-events-auto">
                  {/* Compact Duration Sync Tag on Video Frame */}
                  {audioSettings.voiceoverBlobUrl && (
                    <DurationMismatchOverlay
                      voiceDuration={audioSettings.voiceoverDuration}
                      scenesDuration={totalDuration}
                      hasVoiceover={Boolean(audioSettings.voiceoverBlobUrl)}
                      language={language}
                      isCompact={true}
                      className="shadow-lg"
                    />
                  )}

                  <button
                    onClick={() => onInspectScene(activeScene)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 backdrop-blur-md border border-emerald-500/40 text-emerald-400 text-xs font-semibold shadow-lg transition-colors"
                    title={isAr ? 'فحص تطابق ملامح الوجه' : 'Inspect Face Integrity'}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isAr ? 'مطابقة الملامح' : 'Face Lock'}</span>
                  </button>
                </div>
              </div>

            </div>
          ) : null}

          {/* Central Play/Pause Watermark Overlay on Click */}
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-transparent z-20 group"
          >
            {!isPlaying && (
              <div className="w-16 h-16 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-2xl ring-4 ring-rose-500/30 group-hover:scale-110 transition-transform">
                <Play className="w-7 h-7 ml-1 rtl:ml-0 rtl:mr-1 fill-white" />
              </div>
            )}
          </button>

        </div>

      </div>

      {/* Interactive Timeline & Scrubber */}
      <div className="p-4 sm:p-5 bg-neutral-950 border-t border-neutral-800/80 space-y-3">
        
        {/* Scrubber Bar with Scene Segment Markers */}
        <div className="relative w-full group">
          {/* Scene Marks Markers */}
          <div className="absolute inset-x-0 -top-2 flex h-2 pointer-events-none">
            {scenes.map((s, idx) => {
              const startFraction = (scenes.slice(0, idx).reduce((a, c) => a + c.duration, 0) / totalDuration) * 100;
              return (
                <div
                  key={s.id}
                  className="absolute h-full border-r border-neutral-700/60"
                  style={{ left: `${startFraction}%` }}
                />
              );
            })}
          </div>

          <input
            type="range"
            min="0"
            max={totalDuration}
            step="0.05"
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500 focus:outline-none"
          />
        </div>

        {/* Playback Controls & Status */}
        <div className="flex items-center justify-between gap-4">
          
          {/* Left: Play, Replay, Timecode */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={togglePlay}
              className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950/40 transition-all active:scale-95"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 ml-0.5 rtl:ml-0 rtl:mr-0.5 fill-white" />}
            </button>

            <button
              onClick={handleReplay}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors"
              title={isAr ? 'إعادة من البداية' : 'Replay'}
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Timecode & Voiceover Mismatch Indicator */}
            <div className="flex items-center gap-2">
              <div className="text-xs font-mono font-semibold text-neutral-300 flex items-center gap-1">
                <span className="text-white">{formatTime(currentTime)}</span>
                <span className="text-neutral-500">/</span>
                <span className="text-neutral-400">{formatTime(totalDuration)}</span>
              </div>

              {/* Quick Mismatch Tag if voiceover exists */}
              {audioSettings.voiceoverBlobUrl && (
                (() => {
                  const diff = audioSettings.voiceoverDuration - totalDuration;
                  const absDiff = Math.abs(diff);
                  const isClose = absDiff <= 3;
                  return (
                    <button
                      onClick={onOpenVoiceRecorder}
                      className={`text-[11px] font-mono px-2 py-0.5 rounded-md border flex items-center gap-1 transition-all ${
                        isClose
                          ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                          : diff > 3
                          ? 'bg-amber-950/40 border-amber-500/40 text-amber-400'
                          : 'bg-rose-950/40 border-rose-500/40 text-rose-400'
                      }`}
                      title={
                        isClose
                          ? (isAr ? 'تزامن مثالي بين الصوت والمشاهد' : 'Voice and clips timing synchronized')
                          : diff > 3
                          ? (isAr ? `تنبيه: التسجيل الصوتي أطول بـ ${Math.round(absDiff)}ث من المشاهد` : `Warning: Voiceover is ${Math.round(absDiff)}s longer than clips`)
                          : (isAr ? `تنبيه: المشاهد أطول بـ ${Math.round(absDiff)}ث من التسجيل الصوتي` : `Warning: Clips are ${Math.round(absDiff)}s longer than voiceover`)
                      }
                    >
                      <Clock className="w-3 h-3" />
                      <span>
                        {isClose
                          ? (isAr ? 'متطابق' : 'Sync OK')
                          : diff > 3
                          ? `+${Math.round(absDiff)}s ${isAr ? 'صوت' : 'Voice'}`
                          : `+${Math.round(absDiff)}s ${isAr ? 'فيديو' : 'Video'}`}
                      </span>
                    </button>
                  );
                })()
              )}
            </div>
          </div>

          {/* Right: Audio ducking indicator, Volume & Fullscreen */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {audioSettings.voiceoverBlobUrl && (
              <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                <Sparkles className="w-3 h-3" />
                {isAr ? 'الرسالة الصوتية مفعلة' : 'Voiceover Active'}
              </span>
            )}

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors"
              title={isAr ? 'شاشة كاملة' : 'Fullscreen'}
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
