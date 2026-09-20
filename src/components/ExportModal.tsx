import React, { useState } from 'react';
import { X, Download, Film, CheckCircle2, Loader2, Sparkles, Share2, Play } from 'lucide-react';
import { RenderProgress } from '../utils/videoStitcher';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRendering: boolean;
  progress: RenderProgress | null;
  exportedBlob: Blob | null;
  language: 'ar' | 'en';
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  isRendering,
  progress,
  exportedBlob,
  language,
}) => {
  if (!isOpen) return null;

  const isAr = language === 'ar';
  const downloadUrl = exportedBlob ? URL.createObjectURL(exportedBlob) : null;

  const handleDownload = () => {
    if (!downloadUrl) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `Birthday_Film_1080p_${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden text-neutral-200 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {isAr ? 'محرك دمج وتصدير الفيلم (1080p)' : 'Film Stitching & Export Studio'}
              </h2>
              <p className="text-xs text-neutral-400">
                {isAr
                  ? 'دمج جميع مقاطع الفيديو الواقعية في ملف فيديو واحد طويل ومتصل مع الصوت والترجمة'
                  : 'Automated video stitching, transitions, synchronized captions & audio mixing'}
              </p>
            </div>
          </div>
          {!isRendering && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {isRendering ? (
            /* Rendering State */
            <div className="flex flex-col items-center justify-center space-y-5 py-4 text-center">
              <div className="relative">
                <Loader2 className="w-14 h-14 text-rose-500 animate-spin" />
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold font-mono text-white">
                  {progress?.percent ?? 0}%
                </span>
              </div>

              <div className="space-y-1.5 w-full">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {progress?.statusText || (isAr ? 'جاري تهيئة الإطارات والدمج...' : 'Stitching frames...')}
                </h3>
                <p className="text-xs text-neutral-400">
                  {progress?.currentSceneTitle ? (
                    <span className="text-rose-400 font-semibold">{progress.currentSceneTitle}</span>
                  ) : null}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-neutral-800 h-3 rounded-full overflow-hidden p-0.5 border border-neutral-700">
                <div
                  className="h-full bg-gradient-to-r from-rose-600 via-amber-500 to-emerald-500 rounded-full transition-all duration-150"
                  style={{ width: `${progress?.percent ?? 0}%` }}
                ></div>
              </div>

              <p className="text-[11px] text-neutral-500 max-w-sm">
                {isAr
                  ? 'يقوم المحرك برسم المقاطع بمعدل 30 إطاراً في الثانية، تطبيق تدرجات الانتقال الناعمة، وميكس الصوت بدقة 1080p.'
                  : 'Rendering 30fps frames, cross-dissolving transitions, compositing typography & encoding mixed audio tracks.'}
              </p>
            </div>
          ) : exportedBlob ? (
            /* Completed State */
            <div className="flex flex-col items-center justify-center space-y-5 py-2 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {isAr ? 'تم إنتاج ودمج الفيلم بنجاح تام!' : 'Your Video Film is Ready!'}
                </h3>
                <p className="text-xs text-neutral-400 max-w-md">
                  {isAr
                    ? 'تم لصق جميع المقاطع الواقعية في فيديو واحد طويل عالي الدقة (1080p)، مع الحفاظ الصارم على ملامح الوجوه ومزامنة الرسالة الصوتية.'
                    : 'All video clips have been automatically stitched with 100% facial preservation, synchronized captions, and audio mix.'}
                </p>
              </div>

              {/* Video Preview Player */}
              <div className="w-full rounded-xl overflow-hidden border border-neutral-800 bg-black aspect-video max-h-52">
                <video
                  src={downloadUrl!}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-center gap-3 w-full pt-2">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 active:scale-95 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>{isAr ? 'تحميل الفيديو الآن (MP4/WebM 1080p)' : 'Download Full Film (1080p)'}</span>
                </button>
              </div>
            </div>
          ) : null}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
