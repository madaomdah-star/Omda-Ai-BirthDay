import React, { useState } from 'react';
import { 
  Copy, Check, ShieldCheck, Upload, Video, Image as ImageIcon, 
  Trash2, Plus, Sparkles, Clock, Edit3, ChevronUp, ChevronDown, ExternalLink, AlertCircle, Wand2, Layers 
} from 'lucide-react';
import { SceneClip, TransitionType } from '../types';

interface SceneListProps {
  scenes: SceneClip[];
  onUpdateScene: (scene: SceneClip) => void;
  onAddScene: () => void;
  onDeleteScene: (id: string) => void;
  onMoveScene: (index: number, direction: 'up' | 'down') => void;
  onInspectFace: (scene: SceneClip) => void;
  onGenerateVeoVideo: (scene: SceneClip) => void;
  onOpenQuickPromptGenerator: () => void;
  onOpenSmartReorder: () => void;
  language: 'ar' | 'en';
}

export const SceneList: React.FC<SceneListProps> = ({
  scenes,
  onUpdateScene,
  onAddScene,
  onDeleteScene,
  onMoveScene,
  onInspectFace,
  onGenerateVeoVideo,
  onOpenQuickPromptGenerator,
  onOpenSmartReorder,
  language,
}) => {
  const isAr = language === 'ar';
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isOptimizingId, setIsOptimizingId] = useState<string | null>(null);

  const handleCopyPrompt = (scene: SceneClip) => {
    navigator.clipboard.writeText(scene.flowPrompt);
    setCopiedId(scene.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handlePhotoUpload = (scene: SceneClip, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onUpdateScene({
        ...scene,
        photoUrl: url,
        photoName: file.name,
      });
    }
  };

  const handleVideoUpload = (scene: SceneClip, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onUpdateScene({
        ...scene,
        videoUrl: url,
        videoName: file.name,
        isVideoReal: true,
      });
    }
  };

  const handleAIOptimizePrompt = async (scene: SceneClip) => {
    setIsOptimizingId(scene.id);
    try {
      const res = await fetch('/api/ai/optimize-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneType: scene.title,
          subjectDescription: scene.captionText,
          emotion: 'Intimate and affectionate',
          aspect: '16:9'
        }),
      });
      const data = await res.json();
      if (data.prompt) {
        onUpdateScene({
          ...scene,
          flowPrompt: data.prompt,
        });
      }
    } catch (err) {
      console.warn('AI optimize error', err);
    } finally {
      setIsOptimizingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header, Quick Prompt Generator, and Add Scene */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-950 p-4 rounded-2xl border border-neutral-800/80">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span>{isAr ? 'مشاهد الفيلم ومقاطع الفيديو الواقعية' : 'Scenes & Video Story Clips'}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300 font-normal">
              {scenes.length} {isAr ? 'مشاهد' : 'scenes'}
            </span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            {isAr
              ? 'اربط كل صورة فوتوغرافية بمقطع الفيديو الحقيقي المولد أو المسجل، وتأكد من مطابقة الملامح'
              : 'Pair each photo with its generated real video clip, inspect face likeness, and customize captions'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Smart Reorder Button */}
          <button
            onClick={onOpenSmartReorder}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold transition-all shadow-sm"
            title={isAr ? 'ترتيب ذكي للمشاهد بالذكاء الاصطناعي بناءً على الوجوه والقصة' : 'Smart Reorder scenes by face detection & narrative flow'}
          >
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>{isAr ? 'الترتيب الذكي (Smart Reorder)' : 'Smart Reorder'}</span>
          </button>

          {/* Quick Prompt Generator Helper Button */}
          <button
            onClick={onOpenQuickPromptGenerator}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all shadow-sm"
            title={isAr ? 'تحديث المزاج ونصوص الأوامر لجميع المشاهد' : 'Batch update flowPrompt by mood'}
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-400" />
            <span>{isAr ? 'مولد الأوامر السريع' : 'Quick Prompts'}</span>
          </button>

          {/* Add Scene Button */}
          <button
            onClick={onAddScene}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-rose-400" />
            <span>{isAr ? 'إضافة مشهد' : 'Add Scene'}</span>
          </button>
        </div>
      </div>

      {/* Scene Cards Grid / List */}
      <div className="space-y-3.5">
        {scenes.map((scene, index) => {
          const isFirst = index === 0;
          const isLast = index === scenes.length - 1;

          return (
            <div
              key={scene.id}
              className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/90 hover:border-neutral-700/80 transition-all shadow-md space-y-3.5 group"
            >
              {/* Scene Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{isAr ? scene.titleAr : scene.title}</span>
                      {scene.isVerified && (
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          {isAr ? 'ملامح مطابقة' : 'Verified'}
                        </span>
                      )}
                    </h3>
                  </div>
                </div>

                {/* Card Controls (Move, Inspect, Delete) */}
                <div className="flex items-center gap-1.5">
                  {/* Veo Generation Button */}
                  <button
                    onClick={() => onGenerateVeoVideo(scene)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-500/40 text-xs font-semibold transition-all shadow-sm"
                    title={isAr ? 'توليد فيديو بالذكاء الاصطناعي عبر نموذج Veo' : 'Generate video with Veo AI'}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>{isAr ? 'توليد Veo' : 'Veo Gen'}</span>
                  </button>

                  <button
                    onClick={() => onInspectFace(scene)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition-colors"
                    title={isAr ? 'فحص تطابق ملامح الوجه' : 'Inspect Face Integrity'}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{isAr ? 'فحص الملامح' : 'Inspect'}</span>
                  </button>

                  <div className="flex items-center bg-neutral-900 rounded-lg border border-neutral-800 p-0.5">
                    <button
                      onClick={() => onMoveScene(index, 'up')}
                      disabled={isFirst}
                      className="p-1 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onMoveScene(index, 'down')}
                      disabled={isLast}
                      className="p-1 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {scenes.length > 1 && (
                    <button
                      onClick={() => onDeleteScene(scene.id)}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-neutral-900 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Media Thumbnails Row (Photo vs Video) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Reference Photo Box */}
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
                  <div className="w-14 h-14 rounded-lg bg-black overflow-hidden flex-shrink-0 border border-neutral-800 flex items-center justify-center">
                    {scene.photoUrl ? (
                      <img src={scene.photoUrl} alt="Photo" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-neutral-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-neutral-300 flex items-center gap-1">
                      <ImageIcon className="w-3 h-3 text-blue-400" />
                      {isAr ? 'الصورة الفوتوغرافية الأصلية' : 'Original Photo'}
                    </p>
                    <p className="text-[11px] text-neutral-500 truncate">
                      {scene.photoName || (isAr ? 'صورة مرجعية محددة' : 'Preset image')}
                    </p>
                    <label className="inline-block mt-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 cursor-pointer">
                      <span>{isAr ? 'تغيير الصورة' : 'Replace Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(scene, e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Real Video Clip Box */}
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
                  <div className="w-14 h-14 rounded-lg bg-black overflow-hidden flex-shrink-0 border border-neutral-800 flex items-center justify-center">
                    {scene.videoUrl ? (
                      <video src={scene.videoUrl} className="w-full h-full object-cover" muted />
                    ) : (
                      <Video className="w-6 h-6 text-neutral-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-neutral-300 flex items-center gap-1">
                      <Video className="w-3 h-3 text-rose-400" />
                      {isAr ? 'مقطع الفيديو الحقيقي' : 'Real Video Clip'}
                    </p>
                    <p className="text-[11px] text-neutral-500 truncate">
                      {scene.videoName || (isAr ? 'مقطع Flow مدمج' : 'Flow video attached')}
                    </p>
                    <label className="inline-block mt-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 cursor-pointer">
                      <span>{isAr ? 'رفع مقطع الفيديو (MP4)' : 'Upload Video Clip'}</span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleVideoUpload(scene, e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

              </div>

              {/* Flow Prompt Box with Strict Identity Lock */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    {isAr ? 'أمر توليد الفيديو في Google Flow (مع قفل الملامح):' : 'Google Flow Strict Prompt:'}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAIOptimizePrompt(scene)}
                      disabled={isOptimizingId === scene.id}
                      className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition-colors"
                      title={isAr ? 'تحسين الأمر بالذكاء الاصطناعي' : 'Optimize with Gemini AI'}
                    >
                      <Sparkles className={`w-3 h-3 text-rose-400 ${isOptimizingId === scene.id ? 'animate-spin' : ''}`} />
                      <span>{isAr ? 'تحسين بالذكاء الاصطناعي' : 'AI Tune'}</span>
                    </button>

                    <button
                      onClick={() => handleCopyPrompt(scene)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-[11px] font-semibold text-neutral-200 transition-colors"
                    >
                      {copiedId === scene.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === scene.id ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ الأمر' : 'Copy Prompt')}</span>
                    </button>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800/80 text-[11px] font-mono text-neutral-300 max-h-20 overflow-y-auto leading-relaxed select-all">
                  {scene.flowPrompt}
                </div>
              </div>

              {/* Caption and Timing Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-neutral-800/60">
                {/* Caption Editor */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1">
                    <Edit3 className="w-3 h-3" />
                    {isAr ? 'الترجمة / النص المعروض على المشهد:' : 'Subtitle Caption Text:'}
                  </label>
                  <input
                    type="text"
                    value={isAr ? scene.captionTextAr : scene.captionText}
                    onChange={(e) => {
                      if (isAr) {
                        onUpdateScene({ ...scene, captionTextAr: e.target.value });
                      } else {
                        onUpdateScene({ ...scene, captionText: e.target.value });
                      }
                    }}
                    placeholder={isAr ? 'اكتب عبارة المشهد هنا...' : 'Enter caption text...'}
                    className="w-full px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>

                {/* Duration & Transition */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 space-y-1">
                    <label className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {isAr ? 'المدة (ثوانٍ):' : 'Duration (s):'}
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="20"
                      value={scene.duration}
                      onChange={(e) => onUpdateScene({ ...scene, duration: parseInt(e.target.value) || 8 })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="flex-1 space-y-1">
                    <label className="text-[11px] font-semibold text-neutral-400">
                      {isAr ? 'الانتقال:' : 'Transition:'}
                    </label>
                    <select
                      value={scene.transition}
                      onChange={(e) => onUpdateScene({ ...scene, transition: e.target.value as TransitionType })}
                      className="w-full px-2 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="dissolve">{isAr ? 'ذوبان (Dissolve)' : 'Dissolve'}</option>
                      <option value="fade">{isAr ? 'تلاشي أسود (Fade)' : 'Fade Black'}</option>
                      <option value="cut">{isAr ? 'قطع سريع (Cut)' : 'Hard Cut'}</option>
                    </select>
                  </div>
                </div>

              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
