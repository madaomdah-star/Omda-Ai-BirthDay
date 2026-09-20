import React, { useState } from 'react';
import { Sparkles, Check, Wand2, Compass, Heart, Zap, FileText, X } from 'lucide-react';
import { SceneClip } from '../types';
import { BASE_FLOW_PROMPT } from '../data/defaultProject';

export type MoodType = 'intimate' | 'energetic' | 'documentary' | 'cinematic' | 'nostalgic';

export interface MoodPreset {
  id: MoodType;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: React.ComponentType<{ className?: string }>;
  promptModifier: string;
  cameraMovement: string;
  cameraMovementAr: string;
}

export const MOOD_PRESETS: MoodPreset[] = [
  {
    id: 'intimate',
    name: 'Intimate & Tender',
    nameAr: 'حميمي ورومانسي هادئ',
    description: 'Extremely subtle natural breathing, gentle push-in, deep affection and quiet warmth.',
    descriptionAr: 'تنفس طبيعي خافت جداً، تقريب كاميرا فائق الهدوء، دفء ومشاعر هادئة وصادقة.',
    icon: Heart,
    promptModifier:
      'Over eight seconds, make a very slow, gentle camera push-in. Allow only barely perceptible natural breathing. Keep facial expressions and gaze affectionate, quiet, and deeply loving. Preserve original photorealistic skin tone, lighting, and textures without alteration.',
    cameraMovement: 'Very slow, gentle push-in toward the eyes with barely perceptible natural breathing.',
    cameraMovementAr: 'تقريب فائق الهدوء نحو الملامح مع حركة تنفس طبيعية خافتة جداً.',
  },
  {
    id: 'documentary',
    name: 'Documentary & Authentic',
    nameAr: 'وثائقي واقعي خالص',
    description: 'Unfiltered archival realism, steady authentic framing, zero synthetic beautification.',
    descriptionAr: 'واقعية توثيقية حقيقية، تأطير ثابت أصيل، صفر تجميل صناعي أو تغيير في الهيئة.',
    icon: FileText,
    promptModifier:
      'Treat the image as a museum-grade archival documentary capture. Use a rock-steady cinematic frame with minimal handheld ambient sway. Absolute photorealism with zero digital retouching or face altering. Natural ambient micro-movement.',
    cameraMovement: 'Steady cinematic tripod hold with minimal natural atmospheric presence.',
    cameraMovementAr: 'ثبات سينمائي تام كحامل كاميرا وثائقي مع نبض حياة طبيعي غير ملحوظ.',
  },
  {
    id: 'energetic',
    name: 'Energetic & Joyful',
    nameAr: 'مبهج وحيوي ودافئ',
    description: 'Lively ambient movement, warm natural smiles, gentle dynamic camera glide.',
    descriptionAr: 'حيوية طبيعية دافئة، ابتسامات حقيقية ومشرقة، حركة كاميرا انسيابية بطيئة.',
    icon: Zap,
    promptModifier:
      'Infuse the scene with warmth and genuine celebratory energy while rigidly locking facial bone structure and original identity. Gentle smooth camera tracking. Natural cheerful eyes and genuine smiles preserved precisely from the photograph.',
    cameraMovement: 'Gentle smooth camera glide, highlighting joyful smiles and authentic emotion.',
    cameraMovementAr: 'انسياب كاميرا ناعم يبرز الابتسامات الصادقة وتفاصيل البهجة دون تشويه.',
  },
  {
    id: 'cinematic',
    name: 'Cinematic Elegance',
    nameAr: 'سينمائي درامي راقٍ',
    description: 'Slow anamorphic push, rich natural depth of field, sophisticated golden-hour feel.',
    descriptionAr: 'حركة سينمائية عميقة، عزل بصري طبيعي، أجواء سينمائية ذهبية وراقية.',
    icon: Compass,
    promptModifier:
      'Create an elegant, high-end cinematic living frame. Slow deliberate slow-motion camera push (24fps pacing). Retain 100% facial features, clothing, and background authenticity. Cinematic lighting depth preserved with utmost fidelity.',
    cameraMovement: 'Slow deliberate cinematic push-in with rich depth of field and steady focus.',
    cameraMovementAr: 'تقريب سينمائي مدروس ببطء مع ثبات ملامح الوجه والألوان الأصلية.',
  },
  {
    id: 'nostalgic',
    name: 'Nostalgic & Timeless',
    nameAr: 'حنين دافئ وذكريات خالدة',
    description: 'Gentle timeless drift, sentimental tone, honoring past memories with reverence.',
    descriptionAr: 'حنين دافئ يحترم قدسية الذكريات العائلية مع حركة بطيئة توحي بالخلود.',
    icon: Wand2,
    promptModifier:
      'Evoke a timeless nostalgic memory. Very gentle optical drift revealing the emotional weight of the photograph. No face morphing, no modern synthetic effects. The feeling is of a cherished memory preserved across time.',
    cameraMovement: 'Gentle slow drift honoring the photograph as an enduring family memory.',
    cameraMovementAr: 'انسياب بطيء يحيي الصورة كذكرى عائلية غالية لا تنسى.',
  },
];

interface QuickPromptGeneratorProps {
  scenes: SceneClip[];
  onApplyMoodToScenes: (selectedSceneIds: string[], mood: MoodPreset) => void;
  language: 'ar' | 'en';
  onClose?: () => void;
}

export const QuickPromptGenerator: React.FC<QuickPromptGeneratorProps> = ({
  scenes,
  onApplyMoodToScenes,
  language,
  onClose,
}) => {
  const isAr = language === 'ar';
  const [selectedMoodId, setSelectedMoodId] = useState<MoodType>('intimate');
  const [selectedSceneIds, setSelectedSceneIds] = useState<string[]>(scenes.map((s) => s.id));
  const [appliedNotification, setAppliedNotification] = useState<boolean>(false);

  const currentMood = MOOD_PRESETS.find((m) => m.id === selectedMoodId) || MOOD_PRESETS[0];

  const toggleSceneSelection = (id: string) => {
    setSelectedSceneIds((prev) =>
      prev.includes(id) ? prev.filter((sceneId) => sceneId !== id) : [...prev, id]
    );
  };

  const selectAllScenes = () => {
    setSelectedSceneIds(scenes.map((s) => s.id));
  };

  const deselectAllScenes = () => {
    setSelectedSceneIds([]);
  };

  const handleApply = () => {
    if (selectedSceneIds.length === 0) return;
    onApplyMoodToScenes(selectedSceneIds, currentMood);
    setAppliedNotification(true);
    setTimeout(() => {
      setAppliedNotification(false);
      if (onClose) onClose();
    }, 1800);
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-neutral-950 border border-neutral-800 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md">
            <Wand2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{isAr ? 'مولد الأوامر السريع والمزاج البصري' : 'Quick Prompt Generator'}</span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300">
                {isAr ? 'تحديث موحد' : 'Batch Mood'}
              </span>
            </h3>
            <p className="text-xs text-neutral-400">
              {isAr
                ? 'اختر المزاج العام (Mood) لتحديث أوامر Google Flow وVeo لجميع المشاهد المحددة مع قفل الملامح'
                : 'Select a mood to automatically generate and update flow prompts for all chosen scenes'}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mood Buttons Grid */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-neutral-300">
          {isAr ? '1. اختر المزاج البصري والأسلوب الشعوري:' : '1. Select the Film Mood & Emotional Vibe:'}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {MOOD_PRESETS.map((mood) => {
            const Icon = mood.icon;
            const isSelected = selectedMoodId === mood.id;
            return (
              <button
                key={mood.id}
                onClick={() => setSelectedMoodId(mood.id)}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  isAr ? 'text-right' : 'text-left'
                } ${
                  isSelected
                    ? 'bg-rose-500/10 border-rose-500/60 ring-1 ring-rose-500/30 text-white'
                    : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <Icon
                    className={`w-4 h-4 ${isSelected ? 'text-rose-400' : 'text-neutral-500'}`}
                  />
                  {isSelected && <Check className="w-3.5 h-3.5 text-rose-400" />}
                </div>
                <div>
                  <div className="text-xs font-bold leading-snug">
                    {isAr ? mood.nameAr : mood.name}
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-1 line-clamp-2 leading-tight">
                    {isAr ? mood.descriptionAr : mood.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview of Generated Prompt */}
      <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {isAr ? 'معاينة نص أمر المشهد (مع قفل الملامح الصارم):' : 'Generated Strict Flow Prompt Preview:'}
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">
            {isAr ? '✓ متوافق مع Veo وGoogle Flow' : '✓ Veo & Flow Compatible'}
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-black/60 border border-neutral-800 text-[11px] font-mono text-neutral-300 leading-relaxed max-h-24 overflow-y-auto">
          {BASE_FLOW_PROMPT}
          <br />
          <br />
          <span className="text-amber-300 font-semibold">{currentMood.promptModifier}</span>
        </div>
      </div>

      {/* Target Scenes Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-semibold text-neutral-300">
            {isAr
              ? `2. حدد المشاهد التي تريد تحديثها (${selectedSceneIds.length} من أصل ${scenes.length}):`
              : `2. Choose Scenes to Update (${selectedSceneIds.length} of ${scenes.length} selected):`}
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={selectAllScenes}
              className="text-[11px] text-rose-400 hover:text-rose-300 transition-colors"
            >
              {isAr ? 'تحديد الكل' : 'Select All'}
            </button>
            <span className="text-neutral-600">•</span>
            <button
              onClick={deselectAllScenes}
              className="text-[11px] text-neutral-400 hover:text-neutral-300 transition-colors"
            >
              {isAr ? 'إلغاء التحديد' : 'Deselect All'}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {scenes.map((scene, idx) => {
            const isChecked = selectedSceneIds.includes(scene.id);
            return (
              <button
                key={scene.id}
                onClick={() => toggleSceneSelection(scene.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  isChecked
                    ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <span className="w-4 h-4 rounded bg-neutral-800 flex items-center justify-center font-mono text-[10px]">
                  {idx + 1}
                </span>
                <span className="truncate max-w-[140px]">{isAr ? scene.titleAr : scene.title}</span>
                {isChecked && <Check className="w-3 h-3 text-rose-400 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Apply Action Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
        <p className="text-[11px] text-neutral-400">
          {isAr
            ? 'سيتم استبدال flowPrompt في المشاهد المحددة مع الحفاظ على نصوص الترجمة والوسائط الأصلية.'
            : 'Updates flowPrompt across selected scenes while keeping your captions and media intact.'}
        </p>

        <button
          onClick={handleApply}
          disabled={selectedSceneIds.length === 0 || appliedNotification}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
            appliedNotification
              ? 'bg-emerald-600 text-white'
              : 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white disabled:opacity-40 disabled:cursor-not-allowed'
          }`}
        >
          {appliedNotification ? (
            <>
              <Check className="w-4 h-4" />
              <span>{isAr ? 'تم تحديث الأوامر بنجاح!' : 'Prompts Updated!'}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>
                {isAr
                  ? `تطبيق مزاج "${currentMood.nameAr}" على المشاهد`
                  : `Apply "${currentMood.name}" to Selected Scenes`}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
