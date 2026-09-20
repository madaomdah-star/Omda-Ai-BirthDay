import React from 'react';
import { Video, Sparkles, Mic, Music, BookOpen, Download, Monitor, Smartphone, Globe } from 'lucide-react';
import { AspectRatio } from '../types';

interface HeaderProps {
  aspectRatio: AspectRatio;
  onAspectRatioChange: (aspect: AspectRatio) => void;
  language: 'ar' | 'en';
  onLanguageToggle: () => void;
  onOpenGuide: () => void;
  onOpenVoiceRecorder: () => void;
  onOpenAudioMixer: () => void;
  onExport: () => void;
  hasVoiceover: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  aspectRatio,
  onAspectRatioChange,
  language,
  onLanguageToggle,
  onOpenGuide,
  onOpenVoiceRecorder,
  onOpenAudioMixer,
  onExport,
  hasVoiceover,
}) => {
  const isAr = language === 'ar';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/85 backdrop-blur-md px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Title */}
        <div className="flex items-center gap-3.5 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-amber-600 to-rose-500 flex items-center justify-center shadow-lg shadow-rose-950/40 ring-1 ring-white/20">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  {isAr ? 'صانع ومجمّع الفيديو الواقعي' : 'PhotoToVideo Story Studio'}
                </h1>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {isAr ? 'حفظ الملامح' : 'Face-Locked'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 hidden sm:block">
                {isAr
                  ? 'صناعة ودمج مقاطع الفيديو من الصور مع الحفاظ التام على ملامح الوجوه'
                  : 'Stitch real video scenes with 100% facial preservation & voiceover'}
              </p>
            </div>
          </div>

          {/* Mobile language & aspect controls */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onLanguageToggle}
              className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-semibold"
            >
              {isAr ? 'EN' : 'عربي'}
            </button>
          </div>
        </div>

        {/* Center & Right Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          
          {/* Aspect Ratio Selector */}
          <div className="flex items-center bg-neutral-900/90 p-1 rounded-xl border border-neutral-800">
            <button
              onClick={() => onAspectRatioChange('16:9')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                aspectRatio === '16:9'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="16:9 Landscape (TV / Laptop)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>16:9</span>
            </button>
            <button
              onClick={() => onAspectRatioChange('9:16')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                aspectRatio === '9:16'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="9:16 Portrait (Reels / TikTok)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>9:16</span>
            </button>
          </div>

          {/* Guide Modal Button */}
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800/90 border border-neutral-800 text-neutral-200 text-xs font-medium transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>{isAr ? 'دليل الخطوات (Google Flow)' : 'Flow Guide'}</span>
          </button>

          {/* Voiceover Recording Button */}
          <button
            onClick={onOpenVoiceRecorder}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
              hasVoiceover
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-200 hover:bg-rose-900/50'
                : 'bg-neutral-900/90 hover:bg-neutral-800/90 border-neutral-800 text-neutral-200'
            }`}
          >
            <Mic className={`w-3.5 h-3.5 ${hasVoiceover ? 'text-rose-400 animate-pulse' : 'text-neutral-400'}`} />
            <span>{isAr ? 'تسجيل الصوت' : 'Voiceover'}</span>
            {hasVoiceover && <span className="w-2 h-2 rounded-full bg-rose-500"></span>}
          </button>

          {/* Audio Mixer Button */}
          <button
            onClick={onOpenAudioMixer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800/90 border border-neutral-800 text-neutral-200 text-xs font-medium transition-colors"
          >
            <Music className="w-3.5 h-3.5 text-blue-400" />
            <span>{isAr ? 'الموسيقى والميكس' : 'Audio Mix'}</span>
          </button>

          {/* Desktop Language Switcher */}
          <button
            onClick={onLanguageToggle}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800/90 border border-neutral-800 text-neutral-300 text-xs font-medium"
            title={isAr ? 'التبديل إلى الإنجليزية' : 'Switch to Arabic'}
          >
            <Globe className="w-3.5 h-3.5 text-neutral-400" />
            <span>{isAr ? 'English' : 'عربي'}</span>
          </button>

          {/* Export Merged Film Button */}
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-semibold shadow-md shadow-rose-950/30 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{isAr ? 'تصدير الفيديو المدمج' : 'Export Merged Film'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
