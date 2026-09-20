import React, { useState, useRef } from 'react';
import { X, CheckCircle2, AlertTriangle, Play, Pause, RotateCcw, ShieldCheck, Camera, Image as ImageIcon } from 'lucide-react';
import { SceneClip } from '../types';

interface FaceVerificationModalProps {
  scene: SceneClip | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveVerification: (sceneId: string, isVerified: boolean, checks: any) => void;
  language: 'ar' | 'en';
}

export const FaceVerificationModal: React.FC<FaceVerificationModalProps> = ({
  scene,
  isOpen,
  onClose,
  onSaveVerification,
  language,
}) => {
  if (!isOpen || !scene) return null;

  const isAr = language === 'ar';
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const [checks, setChecks] = useState({
    facialStructureOk: scene.faceChecks?.facialStructureOk ?? true,
    expressionNatural: scene.faceChecks?.expressionNatural ?? true,
    noMorphing: scene.faceChecks?.noMorphing ?? true,
    clothingKept: scene.faceChecks?.clothingKept ?? true,
  });

  const toggleCheck = (key: keyof typeof checks) => {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allPassed = Object.values(checks).every(Boolean);

  const handleTimeSeek = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleSave = () => {
    onSaveVerification(scene.id, allPassed, checks);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[94vh] flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden text-neutral-200 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/70">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${allPassed ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>{isAr ? 'فاحص تطابق الوجوه ومنع التشويه' : 'Face Integrity Inspector'}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300">
                  {isAr ? scene.titleAr : scene.title}
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                {isAr
                  ? 'مقارنة دقيقة بين الصورة الأصلية وإطارات الفيديو عند (البداية، المنتصف، النهاية) لضمان عدم تغيير ملامح أي شخص'
                  : 'Compare original reference photo vs video clip at 0s, 4s, and 8s to guarantee zero face morphing'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Viewer */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Left: Original Reference Photo */}
            <div className="flex flex-col bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden">
              <div className="px-3.5 py-2.5 bg-neutral-900/80 border-b border-neutral-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                  {isAr ? 'الصورة الفوتوغرافية الأصلية (المرجع)' : 'Original Reference Photo'}
                </span>
                <span className="text-[10px] uppercase font-bold text-blue-400 px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                  Source
                </span>
              </div>
              <div className="relative aspect-video sm:aspect-square flex items-center justify-center bg-black/50 overflow-hidden">
                {scene.photoUrl ? (
                  <img
                    src={scene.photoUrl}
                    alt="Original Reference"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-xs text-neutral-500 text-center p-4">
                    {isAr ? 'لم يتم إرفاق صورة أصلية بعد' : 'No reference photo uploaded'}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Generated / Uploaded Real Video Clip */}
            <div className="flex flex-col bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden">
              <div className="px-3.5 py-2.5 bg-neutral-900/80 border-b border-neutral-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-rose-400" />
                  {isAr ? 'مقطع الفيديو (Google Flow / Real Clip)' : 'Video Output Clip'}
                </span>
                <span className="text-[10px] font-medium text-neutral-400 font-mono">
                  {currentTime.toFixed(1)}s / {scene.duration}s
                </span>
              </div>
              <div className="relative aspect-video sm:aspect-square flex items-center justify-center bg-black overflow-hidden group">
                {scene.videoUrl ? (
                  <video
                    ref={videoRef}
                    src={scene.videoUrl}
                    playsInline
                    className="w-full h-full object-contain"
                    onTimeUpdate={() => {
                      if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
                    }}
                    onEnded={() => setIsPlaying(false)}
                  />
                ) : (
                  <div className="text-xs text-neutral-500 text-center p-4">
                    {isAr ? 'لم يتم إرفاق فيديو لهذا المشهد بعد' : 'No video clip loaded'}
                  </div>
                )}

                {/* Video Play Overlay */}
                {scene.videoUrl && (
                  <button
                    onClick={togglePlay}
                    className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-black/60 hover:bg-rose-600/90 text-white flex items-center justify-center transition-all opacity-80 group-hover:opacity-100"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5 rtl:ml-0 rtl:mr-0.5" />}
                  </button>
                )}
              </div>

              {/* Quick Frame Inspector Scrubber */}
              <div className="px-3 py-2 bg-neutral-900/70 border-t border-neutral-800 flex items-center justify-between gap-2">
                <span className="text-[11px] text-neutral-400 font-medium">
                  {isAr ? 'قفزات الفحص:' : 'Inspect Frames:'}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleTimeSeek(0.1)}
                    className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[11px] font-mono text-neutral-200 transition-colors"
                  >
                    {isAr ? 'البداية (0s)' : 'Start (0s)'}
                  </button>
                  <button
                    onClick={() => handleTimeSeek(scene.duration / 2)}
                    className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[11px] font-mono text-neutral-200 transition-colors"
                  >
                    {isAr ? 'المنتصف (4s)' : 'Mid (4s)'}
                  </button>
                  <button
                    onClick={() => handleTimeSeek(Math.max(0, scene.duration - 0.5))}
                    className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[11px] font-mono text-neutral-200 transition-colors"
                  >
                    {isAr ? 'النهاية (8s)' : 'End (8s)'}
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Verification Checklist Questions (From Step 4 in Guide) */}
          <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {isAr ? 'قائمة الفحص الصارمة لتطابق الملامح (Checklist)' : 'Identity Verification Checklist'}
              </h3>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${allPassed ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                {allPassed ? (isAr ? 'مقبول ومطابق 100%' : '100% Match Approved') : (isAr ? 'يتطلب تدقيق' : 'Needs Review')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {[
                {
                  key: 'facialStructureOk',
                  labelAr: 'شكل العينين والأنف والفم وهيكل الوجه سليم ومطابق تماماً',
                  labelEn: 'Eyes, nose, mouth and face shape are completely unchanged',
                },
                {
                  key: 'expressionNatural',
                  labelAr: 'التعبيرات طبيعية وبدون فتح فم مصطنع أو حركة رأس غير مريحة',
                  labelEn: 'Expressions are natural with no awkward morphing or head turns',
                },
                {
                  key: 'noMorphing',
                  labelAr: 'لا يوجد ذوبان أو تحول تدريجي للملامح على مدار الثواني الثماني',
                  labelEn: 'Zero facial morphing or distortion across all 8 seconds',
                },
                {
                  key: 'clothingKept',
                  labelAr: 'الملابس، الإكسسوارات، والخلفية بقيت كما هي دون إضافات دخيلة',
                  labelEn: 'Clothing, accessories, lighting, and background are preserved',
                },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleCheck(item.key as keyof typeof checks)}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left rtl:text-right transition-all ${
                    checks[item.key as keyof typeof checks]
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="mt-0.5">
                    {checks[item.key as keyof typeof checks] ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-neutral-600"></div>
                    )}
                  </div>
                  <span className="text-xs font-medium leading-relaxed">
                    {isAr ? item.labelAr : item.labelEn}
                  </span>
                </button>
              ))}
            </div>

            {!allPassed && (
              <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/20 flex gap-2 text-amber-300 text-xs">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  {isAr
                    ? 'تنبيه من الدليل: إذا تغيرت أي ملامح أو ظهر تشويه، لا تعتمد المقطع لمجرد أن الحركة مبهرة! يوصى بالاعتماد على الصورة الأصلية مع زووم سينمائي بطيء للحفاظ على كرامة وجمال الأشخاص.'
                    : 'Recommendation: If facial features morphed, do not keep an inaccurate clip just because movement looks impressive. Use original photo with slow camera zoom instead.'}
                </span>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
          
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isAr ? 'اعتماد نتيجة الفحص والمتابعة' : 'Accept & Save Verification'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
