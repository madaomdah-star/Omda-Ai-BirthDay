import React from 'react';
import { X, Music, Volume2, Mic, VolumeX, Sparkles, Check, Play, Square } from 'lucide-react';
import { AudioSettings } from '../types';
import { playProceduralPianoTrack, stopBackgroundMusic } from '../utils/audioSynthesizer';

interface AudioMixerModalProps {
  audioSettings: AudioSettings;
  onChange: (settings: AudioSettings) => void;
  isOpen: boolean;
  onClose: () => void;
  language: 'ar' | 'en';
}

export const AudioMixerModal: React.FC<AudioMixerModalProps> = ({
  audioSettings,
  onChange,
  isOpen,
  onClose,
  language,
}) => {
  const isAr = language === 'ar';
  const [isPlayingTest, setIsPlayingTest] = React.useState(false);

  if (!isOpen) return null;

  const handleTestMusic = () => {
    if (isPlayingTest) {
      stopBackgroundMusic();
      setIsPlayingTest(false);
    } else {
      playProceduralPianoTrack(audioSettings.musicVolume);
      setIsPlayingTest(true);
    }
  };

  const handleClose = () => {
    stopBackgroundMusic();
    setIsPlayingTest(false);
    onClose();
  };

  const handleCustomMusicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onChange({
        ...audioSettings,
        selectedMusicTrack: 'custom',
        customMusicUrl: url,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden text-neutral-200 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {isAr ? 'غرفة الميكس وهندسة الصوت' : 'Audio Mixing & Soundtrack Studio'}
              </h2>
              <p className="text-xs text-neutral-400">
                {isAr
                  ? 'خطوة 8: ضبط توازن الموسيقى الهادئة، التعليق الصوتي، وكتم ضجيج مقاطع Flow'
                  : 'Step 8: Balance background music, voiceover level & mute unwanted Flow noise'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Background Music Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-blue-400" />
                {isAr ? 'الموسيقى التصويرية الهادئة (Soundtrack):' : 'Soundtrack Selection:'}
              </label>
              <button
                onClick={handleTestMusic}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors"
              >
                {isPlayingTest ? <Square className="w-3.5 h-3.5 fill-rose-400 text-rose-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{isPlayingTest ? (isAr ? 'إيقاف التجربة' : 'Stop') : (isAr ? 'معاينة الموسيقى' : 'Test Music')}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              {[
                { id: 'piano_peace', labelAr: 'بيانو رومانسي هادئ (Piano Peace)', labelEn: 'Romantic Gentle Piano' },
                { id: 'acoustic_warmth', labelAr: 'أكوستيك دافئ للعائلة (Warm Acoustic)', labelEn: 'Warm Acoustic Strings' },
                { id: 'gentle_strings', labelAr: 'وتريات سينمائية ناعمة (Soft Strings)', labelEn: 'Cinematic Gentle Strings' },
                { id: 'none', labelAr: 'بدون موسيقى (صوت فقط)', labelEn: 'No Music (Voice Only)' },
              ].map((track) => (
                <button
                  key={track.id}
                  onClick={() => onChange({ ...audioSettings, selectedMusicTrack: track.id as any })}
                  className={`p-3 rounded-xl border text-left rtl:text-right transition-all ${
                    audioSettings.selectedMusicTrack === track.id
                      ? 'bg-blue-950/40 border-blue-500/60 text-white font-semibold'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <p className="leading-snug">{isAr ? track.labelAr : track.labelEn}</p>
                </button>
              ))}
            </div>

            {/* Custom Music Upload */}
            <div className="pt-1">
              <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-dashed border-neutral-800 hover:border-neutral-700 cursor-pointer text-xs transition-colors">
                <span className="text-neutral-300 font-medium">
                  {audioSettings.customMusicUrl
                    ? (isAr ? 'تم رفع ملف موسيقى مخصص' : 'Custom Music Loaded')
                    : (isAr ? 'أو ارفع ملف موسيقى خاص بك (MP3 / WAV)' : 'Or Upload Custom MP3 Track')}
                </span>
                <span className="px-2.5 py-1 rounded bg-neutral-800 text-neutral-200 font-semibold">
                  {isAr ? 'اختيار ملف' : 'Browse'}
                </span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleCustomMusicUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Volume Controls */}
          <div className="space-y-4 pt-2 border-t border-neutral-800">
            <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              {isAr ? 'مستويات الصوت وتوازن القنوات' : 'Channel Volume Sliders'}
            </h4>

            {/* Voice Volume */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-300 flex items-center gap-1.5 font-medium">
                  <Mic className="w-3.5 h-3.5 text-rose-400" />
                  {isAr ? 'مستوى صوت الرسالة (Voiceover):' : 'Voiceover Volume:'}
                </span>
                <span className="font-mono text-neutral-400">{Math.round(audioSettings.voiceVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={audioSettings.voiceVolume}
                onChange={(e) => onChange({ ...audioSettings, voiceVolume: parseFloat(e.target.value) })}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            {/* Music Volume */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-300 flex items-center gap-1.5 font-medium">
                  <Music className="w-3.5 h-3.5 text-blue-400" />
                  {isAr ? 'مستوى صوت الموسيقى الخلفية (Background Music):' : 'Music Volume:'}
                </span>
                <span className="font-mono text-neutral-400">{Math.round(audioSettings.musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={audioSettings.musicVolume}
                onChange={(e) => onChange({ ...audioSettings, musicVolume: parseFloat(e.target.value) })}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <p className="text-[11px] text-neutral-500">
                {isAr ? 'موصى به في الدليل: إبقاء الموسيقى أهدأ بكثير من صوت الرسالة (30% - 40%)' : 'Recommended: Keep music well below voice (30% - 40%)'}
              </p>
            </div>

            {/* Video Original Audio (Flow Noise Mute) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-300 flex items-center gap-1.5 font-medium">
                  <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                  {isAr ? 'صوت مقاطع الفيديو الأصلية (Google Flow Audio):' : 'Original Video Clips Audio:'}
                </span>
                <span className="font-mono text-neutral-400">{Math.round(audioSettings.videoSoundVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={audioSettings.videoSoundVolume}
                onChange={(e) => onChange({ ...audioSettings, videoSoundVolume: parseFloat(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <p className="text-[11px] text-amber-400/80">
                {isAr ? 'موصى به: كتم صوت مقاطع Flow (0%) لأنها غالباً تحتوي على أصوات غير مرغوبة' : 'Recommended: Keep at 0% to mute unwanted generated noises'}
              </p>
            </div>

            {/* Smart Audio Ducking */}
            <div className="pt-2">
              <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800 cursor-pointer text-xs">
                <div>
                  <p className="font-semibold text-neutral-200">
                    {isAr ? 'تفعيل الخفض الذكي للموسيقى (Smart Audio Ducking)' : 'Smart Audio Ducking'}
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    {isAr ? 'يتم خفض الموسيقى تلقائياً كلما كان صوتك يتحدث في الرسالة' : 'Automatically lowers music volume while voiceover is speaking'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={audioSettings.audioDucking}
                  onChange={(e) => onChange({ ...audioSettings, audioDucking: e.target.checked })}
                  className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                />
              </label>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-end">
          <button
            onClick={handleClose}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition-all"
          >
            <Check className="w-4 h-4" />
            <span>{isAr ? 'حفظ إعدادات الميكس' : 'Done'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
