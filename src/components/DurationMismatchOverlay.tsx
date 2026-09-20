import React from 'react';
import { Mic, Film, AlertTriangle, CheckCircle2, Clock, ArrowRight, VolumeX } from 'lucide-react';
import { AspectRatio } from '../types';

interface DurationMismatchOverlayProps {
  voiceDuration: number; // in seconds
  scenesDuration: number; // in seconds
  hasVoiceover: boolean;
  language: 'ar' | 'en';
  onAdjustScenes?: () => void;
  onRecordVoice?: () => void;
  className?: string;
  isCompact?: boolean;
}

export const DurationMismatchOverlay: React.FC<DurationMismatchOverlayProps> = ({
  voiceDuration,
  scenesDuration,
  hasVoiceover,
  language,
  onAdjustScenes,
  onRecordVoice,
  className = '',
  isCompact = false,
}) => {
  const isAr = language === 'ar';

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = Math.floor(sec % 60);
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  // If no voiceover has been recorded yet
  if (!hasVoiceover || voiceDuration <= 0) {
    return (
      <div
        className={`flex items-center justify-between p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs backdrop-blur-md ${className}`}
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400">
            <VolumeX className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-neutral-200">
              {isAr ? 'لم يتم تسجيل رسالة صوتية بعد' : 'No Voiceover Recorded Yet'}
            </p>
            <p className="text-[11px] text-neutral-400">
              {isAr
                ? `مدة المشاهد المحددة: ${formatSeconds(scenesDuration)} (${scenesDuration} ثانية)`
                : `Total scenes duration: ${formatSeconds(scenesDuration)} (${scenesDuration}s)`}
            </p>
          </div>
        </div>

        {onRecordVoice && (
          <button
            onClick={onRecordVoice}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-500 text-white font-medium text-xs shadow-sm transition-all"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>{isAr ? 'سجل صوتك' : 'Record Voice'}</span>
          </button>
        )}
      </div>
    );
  }

  // Calculate difference
  const diff = voiceDuration - scenesDuration; // positive = voice is longer, negative = voice is shorter
  const absDiff = Math.abs(diff);
  const isExactOrClose = absDiff <= 3; // 3 seconds tolerance is considered balanced
  const isVoiceTooLong = diff > 3;
  const isVoiceTooShort = diff < -3;

  // Percentage calculations for visual progress bars
  const maxScale = Math.max(voiceDuration, scenesDuration, 1);
  const voicePercent = Math.min(100, Math.round((voiceDuration / maxScale) * 100));
  const scenePercent = Math.min(100, Math.round((scenesDuration / maxScale) * 100));

  if (isCompact) {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs backdrop-blur-md ${
          isExactOrClose
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
            : isVoiceTooLong
            ? 'bg-amber-950/50 border-amber-500/40 text-amber-300'
            : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
        } ${className}`}
      >
        {isExactOrClose ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
        )}
        <span className="font-mono font-bold">
          {formatSeconds(voiceDuration)} vs {formatSeconds(scenesDuration)}
        </span>
        <span className="text-[11px] opacity-80">
          {isExactOrClose
            ? (isAr ? 'تطابق ممتاز' : 'Synced')
            : isVoiceTooLong
            ? (isAr ? `الصوت أطول (+${Math.round(absDiff)}ث)` : `Voice +${Math.round(absDiff)}s`)
            : (isAr ? `المشاهد أطول (+${Math.round(absDiff)}ث)` : `Clips +${Math.round(absDiff)}s`)}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border p-4 transition-all duration-300 backdrop-blur-md shadow-xl ${
        isExactOrClose
          ? 'bg-gradient-to-r from-emerald-950/40 via-neutral-900/90 to-emerald-950/30 border-emerald-500/40'
          : isVoiceTooLong
          ? 'bg-gradient-to-r from-amber-950/40 via-neutral-900/90 to-amber-950/30 border-amber-500/40'
          : 'bg-gradient-to-r from-rose-950/40 via-neutral-900/90 to-rose-950/30 border-rose-500/40'
      } ${className}`}
    >
      {/* Top Header Row with Status Tag */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {isExactOrClose ? (
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          ) : (
            <div
              className={`p-1.5 rounded-lg border ${
                isVoiceTooLong
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          )}
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <span>{isAr ? 'مؤشر تزامن وقت الصوت ومشاهد الفيديو' : 'Voiceover vs Video Clips Duration Sync'}</span>
            </h4>
            <p className="text-[11px] text-neutral-400">
              {isExactOrClose
                ? isAr
                  ? 'تزامن مثالي! ينتهي الصوت مع نهاية المشاهد بسلاسة تامة.'
                  : 'Perfect timing! Narration ends synchronously with the video clips.'
                : isVoiceTooLong
                ? isAr
                  ? `تنبيه: التسجيل الصوتي أطول من مجموع مشاهد الفيديو بمقدار ${Math.round(absDiff)} ثانية (قد ينقطع الصوت قبل إتمام رسالتك).`
                  : `Mismatch: Voiceover is ${Math.round(absDiff)}s longer than video clips (narration will be cut off before the end).`
                : isAr
                ? `تنبيه: مشاهد الفيديو أطول من رسالتك الصوتية بمقدار ${Math.round(absDiff)} ثانية (سيظل الفيديو يعرض بعد صمت صوتك).`
                : `Mismatch: Video clips run for ${Math.round(absDiff)}s after voiceover ends (extended silence at the end).`}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div
          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border shadow-sm ${
            isExactOrClose
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
              : isVoiceTooLong
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 animate-pulse'
              : 'bg-rose-500/10 border-rose-500/40 text-rose-300 animate-pulse'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>
            {isExactOrClose
              ? isAr
                ? 'متطابق بدقة'
                : 'Balanced Sync'
              : isVoiceTooLong
              ? isAr
                ? `الصوت أطول بـ ${Math.round(absDiff)}ث`
                : `Voice +${Math.round(absDiff)}s Over`
              : isAr
              ? `المشاهد أطول بـ ${Math.round(absDiff)}ث`
              : `Video +${Math.round(absDiff)}s Over`}
          </span>
        </div>
      </div>

      {/* Visual Dual Bars Display */}
      <div className="space-y-2.5 pt-1">
        
        {/* Voiceover Duration Bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="flex items-center gap-1.5 text-neutral-300 font-medium">
              <Mic className="w-3.5 h-3.5 text-rose-400" />
              <span>{isAr ? 'مدة الرسالة الصوتية:' : 'Recorded Voiceover:'}</span>
            </span>
            <span className="font-mono font-bold text-white text-xs">
              {formatSeconds(voiceDuration)} <span className="text-neutral-400 font-normal">({Math.round(voiceDuration)}s)</span>
            </span>
          </div>
          <div className="w-full bg-neutral-950/80 h-2.5 rounded-full overflow-hidden border border-neutral-800 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isVoiceTooLong
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                  : 'bg-gradient-to-r from-rose-500 to-rose-400'
              }`}
              style={{ width: `${voicePercent}%` }}
            />
          </div>
        </div>

        {/* Video Scenes Duration Bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="flex items-center gap-1.5 text-neutral-300 font-medium">
              <Film className="w-3.5 h-3.5 text-blue-400" />
              <span>{isAr ? 'مجموع مدة مشاهد الفيديو:' : 'Combined Video Scenes:'}</span>
            </span>
            <span className="font-mono font-bold text-white text-xs">
              {formatSeconds(scenesDuration)} <span className="text-neutral-400 font-normal">({Math.round(scenesDuration)}s)</span>
            </span>
          </div>
          <div className="w-full bg-neutral-950/80 h-2.5 rounded-full overflow-hidden border border-neutral-800 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isVoiceTooShort
                  ? 'bg-gradient-to-r from-blue-500 to-rose-500'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-400'
              }`}
              style={{ width: `${scenePercent}%` }}
            />
          </div>
        </div>

      </div>

      {/* Suggested Quick Actions */}
      {!isExactOrClose && (
        <div className="mt-3 pt-3 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <p className="text-neutral-400 text-[11px]">
            {isVoiceTooLong
              ? isAr
                ? '💡 حل مقترح: قم بزيادة مدة المشاهد أو إضافة مشهد جديد، أو إعادة التسجيل بنبرة أسرع.'
                : '💡 Fix: Increase scene durations or add another scene, or speak slightly faster.'
              : isAr
              ? '💡 حل مقترح: قلل مدة بعض المشاهد أو أضف كلمات إضافية للرسالة الصوتية لتعبئة الفراغ.'
              : '💡 Fix: Trim clip durations to match voiceover, or add a concluding line in voiceover.'}
          </p>

          <div className="flex items-center gap-2">
            {onRecordVoice && (
              <button
                onClick={onRecordVoice}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-medium transition-colors"
              >
                {isAr ? 'إعادة تسجيل الصوت' : 'Re-record Voice'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
