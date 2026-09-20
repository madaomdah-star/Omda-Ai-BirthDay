import React, { useState, useRef, useEffect } from 'react';
import { X, Mic, Square, Play, Pause, RotateCcw, Volume2, Check, Sparkles, AlertCircle } from 'lucide-react';
import { DurationMismatchOverlay } from './DurationMismatchOverlay';

interface VoiceRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveVoiceover: (blobUrl: string, durationSeconds: number) => void;
  existingVoiceUrl: string | null;
  existingVoiceDuration?: number;
  scenesDuration: number;
  language: 'ar' | 'en';
}

export const VoiceRecorderModal: React.FC<VoiceRecorderModalProps> = ({
  isOpen,
  onClose,
  onSaveVoiceover,
  existingVoiceUrl,
  existingVoiceDuration = 0,
  scenesDuration,
  language,
}) => {
  const isAr = language === 'ar';

  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(existingVoiceUrl);
  const [recordingDuration, setRecordingDuration] = useState(existingVoiceDuration || 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Script lines (Guide Step 7)
  const scriptLines = [
    { ar: 'كل عام وأنتِ بخير يا حبيبتي الغالية.', en: 'Happy birthday, my love.' },
    { ar: 'النظر إلى هذه الصور يذكرني بكم أنا محظوظ بمشاركتكِ هذه الحياة.', en: 'Looking at these pictures reminds me how lucky I am to share my life with you.' },
    { ar: 'أحب ذكرياتنا الكبرى، ولكنني أعشق أيامنا البسيطة المعتادة أكثر.', en: 'I love the big memories we\'ve made, but I love our ordinary days just as much.' },
    { ar: 'رؤيتكِ مع أطفالنا، ومع الأشخاص الذين يحبونكِ، تمنح هذه اللحظات معنى أعظم.', en: 'Seeing you with our children, and with the people who love you, gives these pictures even more meaning.' },
    { ar: 'اليوم، أتمنى أن تشعري بكل الحب والتقدير الذي تستحقينه دائماً.', en: 'Today, I hope you feel as loved and appreciated as you deserve.' },
    { ar: 'إلى مزيد من الضحكات، مزيد من المغامرات، وأعيادٍ مديدة تجمعنا سوياً.', en: 'Here\'s to more laughter, more adventures, and many more birthdays together.' },
    { ar: 'أحبكِ دائماً.. ونحبكِ جميعاً من كل قلوبنا.', en: 'I love you. We all do.' },
    { ar: '(صوت الأطفال): كل عام وأنتِ بخير يا ماما.. بنحبكِ أوي!', en: '(Children optional): Happy birthday Mum! We love you!' }
  ];

  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setRecordingDuration((prev) => {
          const next = prev + 1;
          const sentence = Math.min(scriptLines.length - 1, Math.floor(next / 7.5));
          setActiveSentenceIndex(sentence);
          return next;
        });
      }, 1000);
      timerRef.current = interval as unknown as number;
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, scriptLines.length]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      // Setup audio analyzer for volume feedback
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const average = sum / dataArray.length;
        setMicVolume(Math.min(100, Math.round(average * 1.5)));
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedBlobUrl(url);

        // Stop stream tracks
        stream.getTracks().forEach((track) => track.stop());
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        if (audioContextRef.current) audioContextRef.current.close();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      setActiveSentenceIndex(0);
    } catch (err) {
      alert(isAr ? 'يرجى السماح بصلاحية الميكروفون لتسجيل رسالتك بصوتك' : 'Microphone permission is required to record audio.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const togglePreviewPlay = () => {
    if (!audioPreviewRef.current) return;
    if (isPlaying) {
      audioPreviewRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPreviewRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleSave = () => {
    if (recordedBlobUrl) {
      onSaveVoiceover(recordedBlobUrl, recordingDuration || 60);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden text-neutral-200 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {isAr ? 'استوديو تسجيل الرسالة بصوتك الحقيقي' : 'Voice Message Recording Studio'}
              </h2>
              <p className="text-xs text-neutral-400">
                {isAr
                  ? 'خطوة 7: اقرأ الرسالة بهدوء وبنبرة دافئة مع الدليل الصوتي لتوقيت دقيقة واحدة'
                  : 'Step 7: Speak clearly and naturally with the synchronized teleprompter'}
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

        {/* Teleprompter Script */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          
          <div className="flex items-center justify-between text-xs text-neutral-400 pb-1">
            <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {isAr ? 'نص الرسالة الموصى به (Teleprompter):' : 'Teleprompter Script:'}
            </span>
            <span className="font-mono text-rose-400 font-bold">
              {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')} / 01:00
            </span>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-3 max-h-56 overflow-y-auto">
            {scriptLines.map((line, idx) => {
              const isActive = isRecording && activeSentenceIndex === idx;
              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg transition-all duration-300 text-xs sm:text-sm leading-relaxed ${
                    isActive
                      ? 'bg-rose-950/60 border border-rose-500/50 text-white font-semibold scale-[1.01] shadow-sm'
                      : 'text-neutral-400'
                  }`}
                >
                  <p>{isAr ? line.ar : line.en}</p>
                </div>
              );
            })}
          </div>

          {/* Recording Status & Meter */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 gap-3">
            {isRecording ? (
              <div className="flex flex-col items-center gap-3 w-full max-w-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                    {isAr ? 'جاري التسجيل...' : 'Recording Live...'}
                  </span>
                </div>

                {/* Live Volume Bar */}
                <div className="w-full bg-neutral-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 transition-all duration-75"
                    style={{ width: `${micVolume}%` }}
                  ></div>
                </div>

                <button
                  onClick={stopRecording}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950/50 transition-all"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>{isAr ? 'إيقاف وحفظ التسجيل' : 'Stop & Review Recording'}</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={startRecording}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-lg shadow-rose-950/40 transition-all"
                >
                  <Mic className="w-4 h-4" />
                  <span>{recordedBlobUrl ? (isAr ? 'إعادة تسجيل الصوت من جديد' : 'Re-record Voice') : (isAr ? 'بدء تسجيل الصوت الآن' : 'Start Recording Voice')}</span>
                </button>
                <p className="text-[11px] text-neutral-400">
                  {isAr ? 'سجل بهدوء، وسيتم دمجه تلقائياً مع مشاهد الفيلم والموسيقى' : 'Speak at a calm, natural pace. Voiceover will be mixed into the video film.'}
                </p>
              </div>
            )}

            {/* Audio Preview if already recorded */}
            {recordedBlobUrl && !isRecording && (
              <div className="w-full mt-2 pt-3 border-t border-neutral-800 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <audio
                    ref={audioPreviewRef}
                    src={recordedBlobUrl}
                    onLoadedMetadata={(e) => {
                      const dur = Math.round((e.target as HTMLAudioElement).duration);
                      if (dur && !isNaN(dur) && dur > 0) {
                        setRecordingDuration(dur);
                      }
                    }}
                    onEnded={() => setIsPlaying(false)}
                  />
                  <button
                    onClick={togglePreviewPlay}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlaying ? (isAr ? 'إيقاف مؤقت' : 'Pause') : (isAr ? 'استماع للتسجيل' : 'Preview Audio')}</span>
                  </button>
                  <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    {isAr ? 'التسجيل جاهز للدمج' : 'Voice track ready'}
                  </span>
                </div>

                {/* Duration Sync Overlay inside recorder modal */}
                <DurationMismatchOverlay
                  voiceDuration={recordingDuration}
                  scenesDuration={scenesDuration}
                  hasVoiceover={true}
                  language={language}
                />
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
            {isAr ? 'إغلاق' : 'Close'}
          </button>
          
          <button
            onClick={handleSave}
            disabled={!recordedBlobUrl}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-md transition-all"
          >
            <Check className="w-4 h-4" />
            <span>{isAr ? 'اعتماد الصوت للفيلم' : 'Apply to Movie'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
