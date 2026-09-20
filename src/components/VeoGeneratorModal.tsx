import React, { useState, useEffect } from 'react';
import { 
  Video, Sparkles, AlertCircle, CheckCircle2, Loader2, Play, Download, 
  Image as ImageIcon, RefreshCw, X, ShieldAlert, Sliders, ExternalLink 
} from 'lucide-react';
import { SceneClip, AspectRatio } from '../types';

interface VeoGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  scene: SceneClip | null;
  aspectRatio: AspectRatio;
  onVideoGenerated: (sceneId: string, videoUrl: string, videoName: string) => void;
  language: 'ar' | 'en';
}

type GenerationStep = 'idle' | 'initiating' | 'polling' | 'downloading' | 'completed' | 'error';

export const VeoGeneratorModal: React.FC<VeoGeneratorModalProps> = ({
  isOpen,
  onClose,
  scene,
  aspectRatio,
  onVideoGenerated,
  language,
}) => {
  const isAr = language === 'ar';

  const [prompt, setPrompt] = useState<string>('');
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoMimeType, setPhotoMimeType] = useState<string>('image/jpeg');
  const [targetAspect, setTargetAspect] = useState<AspectRatio>(aspectRatio);
  
  const [status, setStatus] = useState<GenerationStep>('idle');
  const [operationName, setOperationName] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state when modal opens or scene changes
  useEffect(() => {
    if (scene) {
      setPrompt(scene.flowPrompt || '');
      setTargetAspect(aspectRatio);
      setStatus('idle');
      setOperationName(null);
      setStatusMessage('');
      setProgressPercent(0);
      setGeneratedVideoUrl(null);
      setErrorMessage(null);

      // If scene has photoUrl, attempt to convert to base64 if it's already a data URL or blob
      if (scene.photoUrl) {
        if (scene.photoUrl.startsWith('data:')) {
          setPhotoBase64(scene.photoUrl);
          const mimeMatch = scene.photoUrl.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
          if (mimeMatch) setPhotoMimeType(mimeMatch[1]);
        } else {
          // Fetch and convert image to base64
          fetch(scene.photoUrl)
            .then((r) => r.blob())
            .then((blob) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                const result = reader.result as string;
                setPhotoBase64(result);
                setPhotoMimeType(blob.type || 'image/jpeg');
              };
              reader.readAsDataURL(blob);
            })
            .catch((err) => console.warn('Could not pre-convert photoUrl to base64', err));
        }
      } else {
        setPhotoBase64(null);
      }
    }
  }, [scene, aspectRatio, isOpen]);

  if (!isOpen || !scene) return null;

  // Handle custom photo upload directly in modal
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result as string);
        setPhotoMimeType(file.type || 'image/jpeg');
      };
      reader.readAsDataURL(file);
    }
  };

  // Start Generation
  const handleStartGeneration = async () => {
    setStatus('initiating');
    setErrorMessage(null);
    setProgressPercent(10);
    setStatusMessage(
      isAr
        ? 'جاري إرسال الصورة والأمر إلى نموذج Veo (veo-3.1-fast-generate-preview)...'
        : 'Submitting photo & prompt to Veo (veo-3.1-fast-generate-preview)...'
    );

    try {
      const initRes = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: photoBase64,
          mimeType: photoMimeType,
          prompt,
          aspectRatio: targetAspect,
        }),
      });

      const initData = await initRes.json();
      if (!initRes.ok || !initData.operationName) {
        throw new Error(initData.error || 'Failed to start Veo video generation');
      }

      const opName = initData.operationName;
      setOperationName(opName);
      setStatus('polling');
      setProgressPercent(25);
      setStatusMessage(
        isAr
          ? 'نموذج Veo يعالج الفيديو الواقعي مع الحفاظ الصارم على ملامح الوجه... (قد يستغرق 30-90 ثانية)'
          : 'Veo is synthesizing authentic motion while locking facial integrity... (usually 30-90s)'
      );

      // Polling loop
      pollVideoOperation(opName);
    } catch (err: any) {
      console.error('Veo generation error:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Error occurred during generation');
    }
  };

  // Polling helper
  const pollVideoOperation = async (opName: string) => {
    let attempts = 0;
    const maxAttempts = 60; // Up to 5 minutes
    let currentProgress = 25;

    const interval = setInterval(async () => {
      attempts += 1;
      currentProgress = Math.min(90, currentProgress + 3);
      setProgressPercent(currentProgress);

      try {
        const pollRes = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName: opName }),
        });

        const pollData = await pollRes.json();

        if (pollData.error) {
          clearInterval(interval);
          setStatus('error');
          setErrorMessage(pollData.error.message || 'Generation operation failed');
          return;
        }

        if (pollData.done) {
          clearInterval(interval);
          setStatus('downloading');
          setProgressPercent(95);
          setStatusMessage(
            isAr
              ? 'اكتملت المعالجة في Veo! جاري تحميل وتجهيز ملف الفيديو MP4...'
              : 'Veo generation complete! Downloading high-fidelity MP4 video...'
          );
          downloadCompletedVideo(opName);
        } else {
          // Reassuring animated messages
          if (attempts === 5) {
            setStatusMessage(
              isAr
                ? 'نموذج Veo يطبق التثبيت البصري وحركة التنفس الطبيعي الهادئة...'
                : 'Veo is rendering subtle natural breathing and camera drift...'
            );
          } else if (attempts === 12) {
            setStatusMessage(
              isAr
                ? 'الحفاظ على ملامح الوجه الأصلية وتنعيم الإطارات دون تشويه...'
                : 'Securing facial landmarks and photo lighting consistency...'
            );
          }
        }
      } catch (pollErr: any) {
        console.warn('Poll attempt error, retrying...', pollErr);
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval);
        setStatus('error');
        setErrorMessage(
          isAr
            ? 'استغرقت العملية وقتاً أطول من المتوقع، يرجى المحاولة مرة أخرى.'
            : 'Generation timed out. Please try again.'
        );
      }
    }, 4000);
  };

  // Download Video from Backend
  const downloadCompletedVideo = async (opName: string) => {
    try {
      const dlRes = await fetch('/api/video-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName: opName }),
      });

      if (!dlRes.ok) {
        const errText = await dlRes.text();
        throw new Error(errText || 'Failed to download generated video');
      }

      const videoBlob = await dlRes.blob();
      const videoObjectUrl = URL.createObjectURL(videoBlob);

      setGeneratedVideoUrl(videoObjectUrl);
      setProgressPercent(100);
      setStatus('completed');
      setStatusMessage(
        isAr
          ? 'تم توليد مقطع الفيديو بنجاح عبر Veo بدقة وجودة عالية!'
          : 'Veo video generated successfully with strict facial likeness!'
      );
    } catch (dlErr: any) {
      console.error('Download video error:', dlErr);
      setStatus('error');
      setErrorMessage(dlErr.message || 'Failed to download final video');
    }
  };

  // Apply to scene and close
  const handleApplyToScene = () => {
    if (generatedVideoUrl) {
      const filename = `veo_${scene.id}_${Date.now()}.mp4`;
      onVideoGenerated(scene.id, generatedVideoUrl, filename);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in duration-200"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-950/40">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {isAr ? 'توليد الفيديو بالذكاء الاصطناعي عبر Veo' : 'Generate Video with Veo'}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  veo-3.1-fast-generate-preview
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                {isAr
                  ? `المشهد: ${scene.titleAr} • الحفاظ الصارم على ملامح الصورة`
                  : `Scene: ${scene.title} • Strict facial preservation & authentic motion`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Top Row: Photo & Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Source Photo Preview & Upload */}
            <div className="sm:col-span-1 space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                {isAr ? 'صورة البداية والمرجع:' : 'Starting Reference Photo:'}
              </label>

              <div className="relative aspect-square rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden flex flex-col items-center justify-center group">
                {photoBase64 ? (
                  <img
                    src={photoBase64}
                    alt="Starting Frame"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-3">
                    <ImageIcon className="w-8 h-8 text-neutral-600 mx-auto mb-1" />
                    <span className="text-[11px] text-neutral-400">
                      {isAr ? 'لا توجد صورة' : 'No photo uploaded'}
                    </span>
                  </div>
                )}

                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-semibold cursor-pointer transition-opacity">
                  <ImageIcon className="w-5 h-5 mb-1 text-rose-400" />
                  <span>{isAr ? 'تغيير الصورة' : 'Change Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="text-[10px] text-neutral-400 text-center">
                {isAr ? 'يتم استخدام الصورة كإطار بداية ثابت' : 'Used as the starting visual anchor'}
              </div>
            </div>

            {/* Prompt & Aspect Controls */}
            <div className="sm:col-span-2 space-y-3">
              {/* Aspect Ratio Selector */}
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-300">
                  {isAr ? 'أبعاد الفيديو المستهدف:' : 'Target Aspect Ratio:'}
                </label>
                <div className="flex items-center bg-neutral-900 p-0.5 rounded-xl border border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setTargetAspect('16:9')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      targetAspect === '16:9'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    16:9 {isAr ? '(عرضي)' : '(Landscape)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetAspect('9:16')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      targetAspect === '9:16'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    9:16 {isAr ? '(طولي)' : '(Portrait)'}
                  </button>
                </div>
              </div>

              {/* Prompt Textarea */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-neutral-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    {isAr ? 'أمر التوليد (Veo Prompt):' : 'Veo Generation Prompt:'}
                  </label>
                  <span className="text-[10px] text-rose-400 font-medium">
                    {isAr ? 'قفل تام للوجه' : 'Face-Preserving'}
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    isAr
                      ? 'اكتب تعليمات الحركة مع الحفاظ على ملامح الوجه دون تغيير...'
                      : 'Describe subtle camera movement and gentle natural breathing without face morphing...'
                  }
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 font-mono leading-relaxed"
                />
              </div>

              {/* Identity Protection Notice */}
              <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-[11px] text-purple-200 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <span>
                  {isAr
                    ? 'يستخدم Veo الصورة كمرجع بصري أولي لصناعة حركة واقعية. ننصح بإبقاء حركة الكاميرا بطيئة للحفاظ على دقة ملامح الأشخاص 100%.'
                    : 'Veo synthesizes authentic motion anchored to your photograph. Subtle camera push-ins best safeguard identity integrity.'}
                </span>
              </div>
            </div>
          </div>

          {/* Generation Progress / Status Area */}
          {(status === 'initiating' || status === 'polling' || status === 'downloading') && (
            <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-rose-400 animate-spin" />
                  <span>{statusMessage}</span>
                </span>
                <span className="font-mono text-neutral-400 font-bold">{progressPercent}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 via-purple-500 to-amber-500 transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="text-[11px] text-neutral-400 flex items-center justify-between">
                <span>
                  {isAr
                    ? 'جاري المعالجة السحابية عبر Google Veo...'
                    : 'Cloud processing via Google Veo...'}
                </span>
                <span className="font-mono text-[10px] text-neutral-500 truncate max-w-[200px]">
                  {operationName || 'init...'}
                </span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {status === 'error' && (
            <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">{isAr ? 'فشل التوليد:' : 'Generation Issue:'}</p>
                <p className="text-[11px] text-rose-300">{errorMessage}</p>
                <p className="text-[10px] text-neutral-400">
                  {isAr
                    ? 'تأكد من إدخال مفتاح GEMINI_API_KEY صالح في الإعدادات، أو جرب أمراً أهدأ.'
                    : 'Ensure GEMINI_API_KEY is configured in Settings and retry.'}
                </p>
              </div>
            </div>
          )}

          {/* Completed Video Preview */}
          {status === 'completed' && generatedVideoUrl && (
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  {isAr ? 'تم توليد مقطع Veo بنجاح!' : 'Veo Video Ready!'}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {targetAspect} • 720p HD
                </span>
              </div>

              <div className="relative aspect-video max-h-56 rounded-xl overflow-hidden bg-black border border-neutral-800 flex items-center justify-center">
                <video
                  src={generatedVideoUrl}
                  controls
                  autoPlay
                  loop
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <a
                  href={generatedVideoUrl}
                  download={`veo_${scene.id}.mp4`}
                  className="text-neutral-400 hover:text-white flex items-center gap-1 text-[11px]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تحميل MP4 للحفظ' : 'Download MP4'}</span>
                </a>

                <button
                  onClick={handleApplyToScene}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isAr ? 'ربط المقطع بهذا المشهد' : 'Attach to Scene'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-neutral-800 bg-neutral-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 text-xs font-semibold transition-colors"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>

          <div className="flex items-center gap-2">
            {status === 'completed' && (
              <button
                onClick={handleStartGeneration}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isAr ? 'إعادة التوليد' : 'Regenerate'}</span>
              </button>
            )}

            <button
              onClick={handleStartGeneration}
              disabled={status === 'initiating' || status === 'polling' || status === 'downloading' || !photoBase64}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-rose-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white text-xs font-bold shadow-lg shadow-purple-950/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {status === 'initiating' || status === 'polling'
                  ? isAr
                    ? 'جاري التوليد...'
                    : 'Generating...'
                  : isAr
                  ? 'بدء توليد فيديو Veo'
                  : 'Generate with Veo'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
