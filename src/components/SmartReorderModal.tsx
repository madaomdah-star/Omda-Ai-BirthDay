import React, { useState } from 'react';
import { 
  Sparkles, Layers, ArrowUpDown, Check, RefreshCw, X, Users, Film, 
  Clock, Heart, ShieldCheck, ChevronRight, AlertCircle, Play, Eye
} from 'lucide-react';
import { SceneClip } from '../types';

export interface SmartReorderResult {
  reorderedSceneIds: string[];
  detectedFaceGroups: Array<{
    groupName: string;
    sceneIds: string[];
    description: string;
  }>;
  storylineNarrativeAr: string;
  storylineNarrativeEn: string;
  themesDetected?: string[];
}

interface SmartReorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenes: SceneClip[];
  onApplyReorder: (newScenesOrder: SceneClip[]) => void;
  language: 'ar' | 'en';
}

export const SmartReorderModal: React.FC<SmartReorderModalProps> = ({
  isOpen,
  onClose,
  scenes,
  onApplyReorder,
  language,
}) => {
  const isAr = language === 'ar';

  const [preference, setPreference] = useState<'thematic_story' | 'chronological_romance' | 'family_focused'>('thematic_story');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SmartReorderResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAnalyzeAndReorder = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/smart-reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenes,
          preference,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to analyze and smart reorder scenes');
      }

      const data: SmartReorderResult = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error('Smart reorder error:', err);
      setError(err.message || 'An error occurred during scene reordering analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!result || !result.reorderedSceneIds) return;

    // Create reordered scenes list based on result.reorderedSceneIds
    const scenesMap = new Map(scenes.map((s) => [s.id, s]));
    const newScenes: SceneClip[] = [];

    result.reorderedSceneIds.forEach((id) => {
      const scene = scenesMap.get(id);
      if (scene) newScenes.push(scene);
    });

    // Add any missing scenes at the end
    scenes.forEach((s) => {
      if (!newScenes.some((item) => item.id === s.id)) {
        newScenes.push(s);
      }
    });

    onApplyReorder(newScenes);
    onClose();
  };

  // Map of scenes by ID for quick lookup during preview
  const scenesById = new Map(scenes.map((s) => [s.id, s]));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl max-h-[90vh] bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-500/20 via-rose-500/20 to-amber-500/20 border border-purple-500/30 text-purple-300">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>{isAr ? 'الترتيب الذكي للمشاهد والوجوه' : 'Smart Reorder: Faces & Story Flow'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold uppercase">
                  AI Storyteller
                </span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                {isAr
                  ? 'تحليل الوجوه وتجميع المشاهد زمنياً وموضوعياً لتحقيق أفضل تدفق سردي وقفل الملامح'
                  : 'Detect faces and group clips chronologically and thematically for maximum emotional impact'}
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Strategy Preference Selector */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2.5">
              {isAr ? 'اختر نمط التدفق السردي المفضل:' : 'Select Storytelling Narrative Style:'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Option 1: Thematic Story Arc */}
              <button
                type="button"
                onClick={() => setPreference('thematic_story')}
                className={`p-3.5 rounded-2xl border text-start transition-all ${
                  preference === 'thematic_story'
                    ? 'bg-purple-950/40 border-purple-500/60 shadow-lg text-white ring-1 ring-purple-500/40'
                    : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-rose-400" />
                    <span>{isAr ? 'القوس الدرامي الكلاسيكي' : 'Thematic Story Arc'}</span>
                  </span>
                  {preference === 'thematic_story' && <Check className="w-4 h-4 text-purple-400" />}
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  {isAr
                    ? 'صورة الشريكة أولاً، ثم بدايات الرومانسية، ثم الأطفال، ثم اجتماع كل العائلة.'
                    : 'Solo portrait first, early romance memories, then children & mom, finale with family.'}
                </p>
              </button>

              {/* Option 2: Chronological Romance */}
              <button
                type="button"
                onClick={() => setPreference('chronological_romance')}
                className={`p-3.5 rounded-2xl border text-start transition-all ${
                  preference === 'chronological_romance'
                    ? 'bg-purple-950/40 border-purple-500/60 shadow-lg text-white ring-1 ring-purple-500/40'
                    : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span>{isAr ? 'التسلسل الزمني للحب' : 'Chronological Journey'}</span>
                  </span>
                  {preference === 'chronological_romance' && <Check className="w-4 h-4 text-purple-400" />}
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  {isAr
                    ? 'من الصورة الأقدم وبدايات اللقاء والشباب وصولاً إلى الحاضر وأيامنا هذه.'
                    : 'From the earliest nostalgic photos and beginnings straight through to the present.'}
                </p>
              </button>

              {/* Option 3: Family-Centric Focus */}
              <button
                type="button"
                onClick={() => setPreference('family_focused')}
                className={`p-3.5 rounded-2xl border text-start transition-all ${
                  preference === 'family_focused'
                    ? 'bg-purple-950/40 border-purple-500/60 shadow-lg text-white ring-1 ring-purple-500/40'
                    : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>{isAr ? 'محور العائلة والأطفال' : 'Family & Children First'}</span>
                  </span>
                  {preference === 'family_focused' && <Check className="w-4 h-4 text-purple-400" />}
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  {isAr
                    ? 'التركيز على حب الأم والأبناء واجتماع الأهل كمحور أساسي في قلب الفيلم.'
                    : 'Emphasize maternal warmth, joy with children, and the protective family circle.'}
                </p>
              </button>

            </div>
          </div>

          {/* Trigger Analysis Button */}
          {!result && (
            <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-neutral-950 border border-neutral-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div className="max-w-md">
                <h4 className="text-sm font-bold text-white">
                  {isAr ? 'جاهز لتحليل الوجوه وإعادة الترتيب التلقائي' : 'Ready to Analyze Faces & Optimize Flow'}
                </h4>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  {isAr
                    ? `سيقوم الذكاء الاصطناعي بفحص المشاهد (${scenes.length} مشهد)، واكتشاف الأشخاص، وترتيبها بتناغم سينمائي يعزز التأثير العاطفي.`
                    : `AI will scan all ${scenes.length} clips, detect subjects and faces, and determine the most moving chronological order.`}
                </p>
              </div>

              <button
                onClick={handleAnalyzeAndReorder}
                disabled={isLoading}
                className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-lg shadow-purple-950/50 disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{isAr ? 'جاري الفحص البصري وترتيب المشاهد...' : 'Analyzing Faces & Narrative Flow...'}</span>
                  </>
                ) : (
                  <>
                    <Layers className="w-4 h-4" />
                    <span>{isAr ? 'بدء الفحص والترتيب الذكي الآن' : 'Run Smart Reorder Analysis'}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Analysis Results Display */}
          {result && (
            <div className="space-y-5 animate-in fade-in duration-300">
              
              {/* Narrative Storyline Explanation Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-neutral-900 to-rose-950/30 border border-purple-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>{isAr ? 'الرؤية الإخراجية والتدفق الدرامي المقترح:' : 'Director Narrative & Emotional Arc:'}</span>
                  </span>
                  <button
                    onClick={handleAnalyzeAndReorder}
                    disabled={isLoading}
                    className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>{isAr ? 'إعادة التحليل' : 'Re-analyze'}</span>
                  </button>
                </div>
                <p className="text-xs text-neutral-200 leading-relaxed">
                  {isAr ? result.storylineNarrativeAr : result.storylineNarrativeEn}
                </p>

                {/* Detected Themes Chips */}
                {result.themesDetected && result.themesDetected.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {result.themesDetected.map((theme, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-200"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Detected Face & Subject Clusters */}
              {result.detectedFaceGroups && result.detectedFaceGroups.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-rose-400" />
                    <span>{isAr ? 'مجموعات الوجوه المكتشفة والمترابطة:' : 'Detected Face & Thematic Clusters:'}</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {result.detectedFaceGroups.map((group, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-400" />
                            <span>{group.groupName}</span>
                          </span>
                          <span className="text-[11px] font-mono text-neutral-400">
                            {group.sceneIds.length} {isAr ? 'مشاهد' : 'clips'}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 leading-relaxed">
                          {group.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sequence Flow Preview (New Sequence) */}
              <div>
                <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-blue-400" />
                  <span>{isAr ? 'معاينة الترتيب المقترح للمشاهد (التسلسل النهائي):' : 'Recommended Scene Sequence:'}</span>
                </h4>

                <div className="space-y-2">
                  {result.reorderedSceneIds.map((sceneId, orderIndex) => {
                    const scene = scenesById.get(sceneId);
                    if (!scene) return null;

                    const originalIndex = scenes.findIndex((s) => s.id === sceneId);
                    const hasMoved = originalIndex !== orderIndex;

                    return (
                      <div
                        key={sceneId}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                          hasMoved
                            ? 'bg-neutral-950 border-purple-500/40 shadow-sm'
                            : 'bg-neutral-950/60 border-neutral-800'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Order Index Pill */}
                          <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-700 font-mono text-xs font-bold flex items-center justify-center text-white">
                            {orderIndex + 1}
                          </div>

                          {/* Media Thumbnail */}
                          <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-neutral-800 overflow-hidden flex-shrink-0">
                            {scene.photoUrl ? (
                              <img
                                src={scene.photoUrl}
                                alt={scene.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs">
                                No Pic
                              </div>
                            )}
                          </div>

                          {/* Scene Meta */}
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-white truncate">
                              {isAr ? scene.titleAr : scene.title}
                            </h5>
                            <p className="text-[11px] text-neutral-400 truncate max-w-sm">
                              {isAr ? scene.captionTextAr : scene.captionText}
                            </p>
                          </div>
                        </div>

                        {/* Position Shift Feedback */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {hasMoved ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium flex items-center gap-1 border border-purple-500/30">
                              <ArrowUpDown className="w-3 h-3" />
                              <span>{isAr ? `نُقل من (#${originalIndex + 1})` : `Shifted from #${originalIndex + 1}`}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 font-medium">
                              {isAr ? 'نفس الموضع' : 'Same spot'}
                            </span>
                          )}

                          <span className="text-xs font-mono text-neutral-400">
                            {scene.duration}s
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>

          {result ? (
            <button
              onClick={handleApply}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-semibold text-xs shadow-lg shadow-purple-950/50 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{isAr ? 'تطبيق هذا الترتيب الذكي على الفيلم' : 'Apply Smart Sequence to Timeline'}</span>
            </button>
          ) : (
            <button
              onClick={handleAnalyzeAndReorder}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors disabled:opacity-50"
            >
              <Layers className="w-4 h-4" />
              <span>{isAr ? 'فحص وترتيب المشاهد' : 'Analyze & Reorder'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
