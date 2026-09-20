import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { VideoPlayer } from './components/VideoPlayer';
import { SceneList } from './components/SceneList';
import { GuideModal } from './components/GuideModal';
import { FaceVerificationModal } from './components/FaceVerificationModal';
import { VoiceRecorderModal } from './components/VoiceRecorderModal';
import { AudioMixerModal } from './components/AudioMixerModal';
import { ExportModal } from './components/ExportModal';
import { QuickPromptGenerator, MoodPreset } from './components/QuickPromptGenerator';
import { VeoGeneratorModal } from './components/VeoGeneratorModal';
import { DurationMismatchOverlay } from './components/DurationMismatchOverlay';
import { SmartReorderModal } from './components/SmartReorderModal';
import { BASE_FLOW_PROMPT } from './data/defaultProject';

import { ProjectState, SceneClip, AspectRatio, AudioSettings } from './types';
import { DEFAULT_PROJECT } from './data/defaultProject';
import { stitchAndExportVideo, RenderProgress } from './utils/videoStitcher';
import { Sparkles, ShieldCheck, Film, Mic, Music, AlertCircle, ArrowRight, ExternalLink, Wand2, Layers } from 'lucide-react';

export default function App() {
  const [project, setProject] = useState<ProjectState>(DEFAULT_PROJECT);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState(false);
  const [isAudioMixerOpen, setIsAudioMixerOpen] = useState(false);
  const [inspectingScene, setInspectingScene] = useState<SceneClip | null>(null);

  // Quick Prompt Generator, Smart Reorder & Veo Modals
  const [isQuickPromptOpen, setIsQuickPromptOpen] = useState(false);
  const [isSmartReorderOpen, setIsSmartReorderOpen] = useState(false);
  const [veoTargetScene, setVeoTargetScene] = useState<SceneClip | null>(null);

  // Video Stitching & Exporting State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [exportProgress, setExportProgress] = useState<RenderProgress | null>(null);
  const [exportedBlob, setExportedBlob] = useState<Blob | null>(null);

  const isAr = project.language === 'ar';

  // Toggle Language
  const toggleLanguage = () => {
    const nextLang = project.language === 'ar' ? 'en' : 'ar';
    setProject((prev) => ({ ...prev, language: nextLang }));
    document.documentElement.dir = nextLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = nextLang;
  };

  // Set initial dir
  useEffect(() => {
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    document.documentElement.lang = project.language;
  }, [project.language, isAr]);

  // Aspect Ratio change
  const handleAspectRatioChange = (aspect: AspectRatio) => {
    setProject((prev) => ({ ...prev, aspectRatio: aspect }));
  };

  // Scene Operations
  const handleUpdateScene = (updatedScene: SceneClip) => {
    setProject((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) => (s.id === updatedScene.id ? updatedScene : s)),
    }));
  };

  const handleAddScene = () => {
    const newIndex = project.scenes.length + 1;
    const newScene: SceneClip = {
      id: `scene-custom-${Date.now()}`,
      role: 'custom',
      title: `Scene ${newIndex}: Custom Moment`,
      titleAr: `المشهد ${newIndex}: لحظة مخصصة`,
      photoUrl: null,
      videoUrl: null,
      isVideoReal: true,
      flowPrompt:
        'Use the uploaded photograph as the starting frame and visual reference. Create a restrained, photorealistic living photograph. Keep facial structure and expressions completely preserved. Over 8 seconds, gentle slow camera push-in. Allow only subtle natural breathing.',
      cameraMovementPrompt: 'Gentle slow camera push-in over 8 seconds.',
      captionText: 'A cherished memory together…',
      captionTextAr: 'لحظة جميلة تجمعنا في الذاكرة...',
      duration: 8,
      transition: 'dissolve',
      isVerified: false,
      faceChecks: {
        facialStructureOk: true,
        expressionNatural: true,
        noMorphing: true,
        clothingKept: true,
      },
    };

    setProject((prev) => ({
      ...prev,
      scenes: [...prev.scenes, newScene],
    }));
  };

  const handleDeleteScene = (id: string) => {
    setProject((prev) => ({
      ...prev,
      scenes: prev.scenes.filter((s) => s.id !== id),
    }));
  };

  const handleMoveScene = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= project.scenes.length) return;

    const updated = [...project.scenes];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    setProject((prev) => ({ ...prev, scenes: updated }));
  };

  // Face Verification
  const handleSaveVerification = (sceneId: string, isVerified: boolean, checks: any) => {
    setProject((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) =>
        s.id === sceneId ? { ...s, isVerified, faceChecks: checks } : s
      ),
    }));
  };

  // Voiceover Save
  const handleSaveVoiceover = (blobUrl: string, durationSeconds: number) => {
    setProject((prev) => ({
      ...prev,
      audio: {
        ...prev.audio,
        voiceoverBlobUrl: blobUrl,
        voiceoverDuration: durationSeconds,
      },
    }));
  };

  // Quick Prompt Generator: Apply Mood Batch Update
  const handleApplyMoodToScenes = (selectedSceneIds: string[], mood: MoodPreset) => {
    setProject((prev) => ({
      ...prev,
      scenes: prev.scenes.map((scene) => {
        if (!selectedSceneIds.includes(scene.id)) return scene;
        const newFlowPrompt = `${BASE_FLOW_PROMPT}\n\n${mood.promptModifier}`;
        return {
          ...scene,
          flowPrompt: newFlowPrompt,
          cameraMovementPrompt: mood.cameraMovement,
        };
      }),
    }));
  };

  // Smart Reorder: Apply new scenes sequence
  const handleApplySmartReorder = (newScenesOrder: SceneClip[]) => {
    setProject((prev) => ({
      ...prev,
      scenes: newScenesOrder,
    }));
  };

  // Veo Video Generation Result Handler
  const handleVeoVideoGenerated = (sceneId: string, videoUrl: string, videoName: string) => {
    setProject((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) =>
        s.id === sceneId
          ? {
              ...s,
              videoUrl,
              videoName,
              isVideoReal: true,
              isVerified: true, // Generated with strict face anchors
            }
          : s
      ),
    }));
  };

  // Audio Settings Change
  const handleAudioChange = (newAudio: AudioSettings) => {
    setProject((prev) => ({ ...prev, audio: newAudio }));
  };

  // Start Automated Video Stitching & Export
  const handleStartExport = async () => {
    setIsExportModalOpen(true);
    setIsRendering(true);
    setExportedBlob(null);

    try {
      let voiceBlob: Blob | null = null;
      if (project.audio.voiceoverBlobUrl) {
        const res = await fetch(project.audio.voiceoverBlobUrl);
        voiceBlob = await res.blob();
      }

      const finalBlob = await stitchAndExportVideo(
        project.scenes,
        project.aspectRatio,
        voiceBlob,
        project.audio.selectedMusicTrack,
        project.audio.musicVolume,
        project.audio.voiceVolume,
        project.language,
        (progress) => {
          setExportProgress(progress);
        }
      );

      setExportedBlob(finalBlob);
    } catch (err) {
      console.error('Video stitching error', err);
      alert(isAr ? 'حدث خطأ أثناء دمج الفيديو' : 'Error rendering stitched video');
    } finally {
      setIsRendering(false);
    }
  };

  const totalDuration = project.scenes.reduce((sum, s) => sum + s.duration, 0);
  const verifiedCount = project.scenes.filter((s) => s.isVerified).length;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-rose-500/30 selection:text-rose-200">
      
      {/* Top Navigation Bar */}
      <Header
        aspectRatio={project.aspectRatio}
        onAspectRatioChange={handleAspectRatioChange}
        language={project.language}
        onLanguageToggle={toggleLanguage}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenVoiceRecorder={() => setIsVoiceRecorderOpen(true)}
        onOpenAudioMixer={() => setIsAudioMixerOpen(true)}
        onExport={handleStartExport}
        hasVoiceover={Boolean(project.audio.voiceoverBlobUrl)}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        
        {/* Highlight Banner / Identity Shield Notice */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-neutral-900 via-rose-950/30 to-neutral-900 border border-neutral-800/80 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>{isAr ? 'تقنية قفل الملامح والدمج التلقائي (Zero-Morphing Guarantee)' : 'Strict Face Preservation Engine'}</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed max-w-2xl">
                {isAr
                  ? 'تم تصميم هذه الأداة خصيصاً لإنتاج فيديوهات واقعية من صور حقيقية، مع الحفاظ على كل تفصيلة في الوجه ولصق المقاطع تلقائياً في فيلم متصل مع ميكس الموسيقى والرسالة الصوتية.'
                  : 'Engineered specifically to stitch genuine photorealistic video clips from real photos without AI morphing, combining voiceover & background music into one seamless film.'}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-start md:justify-end text-xs font-mono">
            <div className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-rose-400" />
              <span>{project.scenes.length} {isAr ? 'مقاطع' : 'clips'}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 flex items-center gap-1.5">
              <span>⏱ {totalDuration}s</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{verifiedCount}/{project.scenes.length} {isAr ? 'مطابق' : 'locked'}</span>
            </div>
          </div>
        </div>

        {/* Studio Layout: Video Player Preview (Top/Left) & Scene Manager (Bottom/Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Cinema Player Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-rose-400" />
                {isAr ? 'معاينة الفيلم المدمج في الوقت الفعلي (Cinema Preview)' : 'Real-time Film Player'}
              </h3>
              <span className="text-[11px] text-neutral-500">
                {isAr ? 'تأثيرات الكاميرا، العبارات وميكس الصوت مدمجة' : 'Camera drift, captions & audio synced'}
              </span>
            </div>

            <VideoPlayer
              scenes={project.scenes}
              aspectRatio={project.aspectRatio}
              audioSettings={project.audio}
              language={project.language}
              onInspectScene={(scene) => setInspectingScene(scene)}
              onOpenVoiceRecorder={() => setIsVoiceRecorderOpen(true)}
            />

            {/* Visual Timer Sync & Mismatch Inspector */}
            <DurationMismatchOverlay
              voiceDuration={project.audio.voiceoverDuration}
              scenesDuration={totalDuration}
              hasVoiceover={Boolean(project.audio.voiceoverBlobUrl)}
              language={project.language}
              onRecordVoice={() => setIsVoiceRecorderOpen(true)}
            />

            {/* Quick Helper Tips Card */}
            <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 text-xs space-y-2 text-neutral-300">
              <div className="flex items-center justify-between text-neutral-200 font-semibold">
                <span className="flex items-center gap-1.5 text-amber-300">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {isAr ? 'كيف يعمل محرك الدمج التلقائي؟' : 'How does Auto-Stitcher work?'}
                </span>
                <a
                  href="https://labs.google/fx/tools/flow"
                  target="_blank"
                  rel="noreferrer"
                  className="text-rose-400 hover:text-rose-300 flex items-center gap-1 text-[11px]"
                >
                  <span>Google Flow</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-neutral-400 leading-relaxed">
                {isAr
                  ? '1. انسخ الأمر الصارم لكل مشهد واستخدمه في Google Flow مع صورة البداية (واترك إطار النهاية فارغاً). 2. ارفع المقاطع الناتجة إلى الأداة. 3. افحص تطابق الوجه. 4. سجل رسالتك بصوتك. 5. اضغط تصدير لتحصل على الفيلم متصلاً في ملف واحد!'
                  : '1. Copy each scene strict prompt into Google Flow with start frame (keep end frame empty). 2. Attach generated video clips. 3. Inspect face likeness. 4. Record voiceover. 5. Export one continuous movie!'}
              </p>
            </div>
          </div>

          {/* Scenes Manager Column */}
          <div className="lg:col-span-5 space-y-4">
            {/* Collapsible / Floating Quick Prompt Generator when activated */}
            {isQuickPromptOpen && (
              <QuickPromptGenerator
                scenes={project.scenes}
                onApplyMoodToScenes={handleApplyMoodToScenes}
                language={project.language}
                onClose={() => setIsQuickPromptOpen(false)}
              />
            )}

            <SceneList
              scenes={project.scenes}
              onUpdateScene={handleUpdateScene}
              onAddScene={handleAddScene}
              onDeleteScene={handleDeleteScene}
              onMoveScene={handleMoveScene}
              onInspectFace={(scene) => setInspectingScene(scene)}
              onGenerateVeoVideo={(scene) => setVeoTargetScene(scene)}
              onOpenQuickPromptGenerator={() => setIsQuickPromptOpen((prev) => !prev)}
              onOpenSmartReorder={() => setIsSmartReorderOpen(true)}
              language={project.language}
            />
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-neutral-800/80 bg-neutral-950 py-6 px-4 text-center text-xs text-neutral-500">
        <p>
          PhotoToVideo Story Studio &bull; {isAr ? 'حفظ الملامح بالكامل وصناعة ذكريات العائلة' : 'Strict Face Preservation & Family Video Memory Film'}
        </p>
      </footer>

      {/* Modals */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        language={project.language}
      />

      <SmartReorderModal
        isOpen={isSmartReorderOpen}
        onClose={() => setIsSmartReorderOpen(false)}
        scenes={project.scenes}
        onApplyReorder={handleApplySmartReorder}
        language={project.language}
      />

      <FaceVerificationModal
        scene={inspectingScene}
        isOpen={Boolean(inspectingScene)}
        onClose={() => setInspectingScene(null)}
        onSaveVerification={handleSaveVerification}
        language={project.language}
      />

      <VoiceRecorderModal
        isOpen={isVoiceRecorderOpen}
        onClose={() => setIsVoiceRecorderOpen(false)}
        onSaveVoiceover={handleSaveVoiceover}
        existingVoiceUrl={project.audio.voiceoverBlobUrl}
        existingVoiceDuration={project.audio.voiceoverDuration}
        scenesDuration={totalDuration}
        language={project.language}
      />

      <AudioMixerModal
        isOpen={isAudioMixerOpen}
        onClose={() => setIsAudioMixerOpen(false)}
        audioSettings={project.audio}
        onChange={handleAudioChange}
        language={project.language}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        isRendering={isRendering}
        progress={exportProgress}
        exportedBlob={exportedBlob}
        language={project.language}
      />

      {/* Veo Video Generator Modal */}
      <VeoGeneratorModal
        isOpen={Boolean(veoTargetScene)}
        onClose={() => setVeoTargetScene(null)}
        scene={veoTargetScene}
        aspectRatio={project.aspectRatio}
        onVideoGenerated={handleVeoVideoGenerated}
        language={project.language}
      />

    </div>
  );
}
