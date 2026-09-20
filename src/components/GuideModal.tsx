import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, ShieldCheck, AlertCircle, Sparkles, Film, Mic, Music } from 'lucide-react';
import { BASE_FLOW_PROMPT } from '../data/defaultProject';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'ar' | 'en';
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose, language }) => {
  const [copiedBase, setCopiedBase] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const isAr = language === 'ar';

  if (!isOpen) return null;

  const handleCopyBasePrompt = () => {
    navigator.clipboard.writeText(BASE_FLOW_PROMPT);
    setCopiedBase(true);
    setTimeout(() => setCopiedBase(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden text-neutral-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {isAr ? 'دليل صناعة فيلم الذكريات والحفاظ التام على الملامح' : 'Birthday & Family Video Blueprint'}
              </h2>
              <p className="text-xs text-neutral-400">
                {isAr
                  ? 'خطة عملية خطوة بخطوة باستخدام صورك الحقيقية و Google Flow مع الدمج التلقائي'
                  : 'Complete 8-step guide to photorealistic living portraits without face distortion'}
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

        {/* Steps Navigation */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/30 overflow-x-auto text-xs font-medium px-4 py-2 gap-2 scrollbar-none">
          {[
            { id: 1, labelAr: '1. اختيار الصور', labelEn: '1. Photos' },
            { id: 2, labelAr: '2. إعداد Flow', labelEn: '2. Flow Setup' },
            { id: 3, labelAr: '3. الأمر الصارم', labelEn: '3. Base Prompt' },
            { id: 4, labelAr: '4. المقاطع الرومانسية', labelEn: '4. Romantic Clips' },
            { id: 5, labelAr: '5. قسم العائلة', labelEn: '5. Family Section' },
            { id: 6, labelAr: '6. ترتيب الفيلم', labelEn: '6. Assembly' },
            { id: 7, labelAr: '7. التسجيل الصوتي', labelEn: '7. Voice Script' },
            { id: 8, labelAr: '8. التصدير والميكس', labelEn: '8. Export' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveStep(s.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                activeStep === s.id
                  ? 'bg-rose-600 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
              }`}
            >
              {isAr ? s.labelAr : s.labelEn}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-sm text-neutral-300">
          
          {/* Critical Rule Notice */}
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 flex gap-3 text-amber-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-400" />
            <div className="text-xs leading-relaxed space-y-1">
              <p className="font-bold text-amber-300">
                {isAr ? 'القاعدة الذهبية لمنع تشويه الوجوه:' : 'The Golden Rule of Face Preservation:'}
              </p>
              <p>
                {isAr
                  ? 'في Google Flow أو أي نموذج فيديو ذكي: ضع صورتك في إطار البداية (+ Add start frame) واترك إطار النهاية (End frame) فارغاً تماماً! لا تضع صورة ثانية كإطار نهاية لأن النموذج سيقوم بتذويب ومسخ الملامح (Morphing). اعتمد دائماً على حركة كاميرا هادئة جداً (Push-in).'
                  : 'In Google Flow: Drag your photo to "+ Add start frame" and ALWAYS LEAVE THE END FRAME EMPTY. Never use a second photo as end frame, as the model will morph facial features. Keep motion strictly subtle.'}
              </p>
            </div>
          </div>

          {activeStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-400" />
                {isAr ? 'الخطوة 1: اختيار 6 صور عالية الجودة' : 'Step 1: Choose Six Clear Photos'}
              </h3>
              <p>
                {isAr
                  ? 'اختر الصور الأصلية الواضحة والابتعاد عن لقطات الشاشة (Screenshots). يفضل أن تكون الوجوه واضحة المعالم وبدون فلاتر تجميلية مسبقة.'
                  : 'Use the clearest originals rather than screenshots. Faces should be reasonably large, clear, and without beauty filters.'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  { n: 1, ar: 'أفضل صورة بورتريه للزوجة', en: 'A favourite portrait of your wife' },
                  { n: 2, ar: 'صورة قديمة لكما معاً (البدايات)', en: 'An older photo of you together' },
                  { n: 3, ar: 'صورة حديثة لكما معاً', en: 'A more recent photo of you together' },
                  { n: 4, ar: 'صورة الزوجة مع الأطفال', en: 'Your wife with the children' },
                  { n: 5, ar: 'صورة الزوجة مع العائلة والأقارب', en: 'Your wife with her family & relatives' },
                  { n: 6, ar: 'صورة العائلة بأكملها مجتمعة', en: 'Your favourite whole-family photo' },
                ].map((item) => (
                  <div key={item.n} className="p-3 rounded-xl bg-neutral-950/50 border border-neutral-800 flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 font-bold text-xs flex items-center justify-center border border-rose-500/30">
                      {item.n}
                    </span>
                    <span className="text-xs font-medium text-neutral-200">
                      {isAr ? item.ar : item.en}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-rose-400" />
                {isAr ? 'الخطوة 2: إعداد أداة Google Flow' : 'Step 2: Set up Google Flow'}
              </h3>
              <div className="space-y-2 text-xs leading-relaxed">
                <p>1. افتح منصة Google Flow عبر الرابط الرسمي:</p>
                <a
                  href="https://labs.google/fx/tools/flow"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs my-1"
                >
                  <span>labs.google/fx/tools/flow</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <p>2. أنشئ مشروعاً جديداً واختر نمط: <strong>Video → Frames</strong> (أو Frames to Video).</p>
                <p>3. اسحب الصورة إلى خانة <strong>+ Add start frame</strong>.</p>
                <p>4. <strong>اترك خانة End frame فارغة تماماً!</strong></p>
                <p>5. حدد نسبة الأبعاد (16:9 للشاشات والتلفاز، أو 9:16 للهاتف)، والمدة 8 ثوانٍ.</p>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  {isAr ? 'الخطوة 3: الأمر الأساسي الصارم لحفظ الهوية (Base Prompt)' : 'Step 3: Base Prompt for Every Flow Clip'}
                </h3>
                <button
                  onClick={handleCopyBasePrompt}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors"
                >
                  {copiedBase ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedBase ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ الأمر' : 'Copy Prompt')}</span>
                </button>
              </div>
              <p className="text-xs text-neutral-400">
                {isAr
                  ? 'الصق هذا النص أولاً في صندوق الأمر، ثم أضف تحته أمر حركة الكاميرا المخصص لكل مشهد.'
                  : 'Paste this first, then add the scene-specific camera instruction below it.'}
              </p>
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-300 leading-relaxed max-h-48 overflow-y-auto select-all">
                {BASE_FLOW_PROMPT}
              </div>
            </div>
          )}

          {activeStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">
                {isAr ? 'الخطوة 4: المقاطع الرومانسية الثلاثة (مع التحقق)' : 'Step 4: Three Romantic Living Clips'}
              </h3>
              <p className="text-xs text-neutral-400">
                {isAr
                  ? 'يتم توليد كل مقطع على حدة بدقة انطلاقاً من الصورة الأصلية، ثم فحصه في الأداة قبل اعتماده:'
                  : 'Generate each clip separately from its original photo, then check frames before continuing:'}
              </p>
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-rose-400">
                    <span>{isAr ? 'المشهد 1: صورتها الشخصية (You)' : 'Clip 1: Her Portrait'}</span>
                    <span className="text-neutral-400">Caption: To my favourite person…</span>
                  </div>
                  <p className="text-xs text-neutral-300">
                    Over eight seconds, make a very slow, gentle camera push-in toward the woman. Keep her original pose, gaze, and expression unchanged. Allow only barely perceptible natural breathing.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-rose-400">
                    <span>{isAr ? 'المشهد 2: بدايتنا (Our beginning)' : 'Clip 2: Older Couple Photo'}</span>
                    <span className="text-neutral-400">Caption: My favourite story began with you.</span>
                  </div>
                  <p className="text-xs text-neutral-300">
                    Over eight seconds, use a very gentle camera push-in toward the couple, keeping both faces fully visible throughout. Do not invent kisses or head turns.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-rose-400">
                    <span>{isAr ? 'المشهد 3: ما زلنا نحن (Still us)' : 'Clip 3: Recent Couple Photo'}</span>
                    <span className="text-neutral-400">Caption: And I would choose you all over again.</span>
                  </div>
                  <p className="text-xs text-neutral-300">
                    Create an eight-second, almost-still living portrait of this couple. Use a steady camera with only a very subtle push-in.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">
                {isAr ? 'الخطوة 5: قسم العائلة والأطفال' : 'Step 5: Family & Children Section'}
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {isAr
                  ? 'لحماية ملامح الأطفال الحساسة والعائلة الكبيرة من أي تشويه بالذكاء الاصطناعي، تتيح لك الأداة استخدام مقاطع فيديو أصلية مسجلة من هاتفك، أو تفعيل تقريب بطيء (100% إلى 104%) بدون تحريك اصطناعي للوجوه.'
                  : 'For children and large family groups, the safest way to guarantee zero distortion is real camera clips or gentle authentic photo motion from 100% to 104% without facial morphing.'}
              </p>
            </div>
          )}

          {activeStep === 6 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">
                {isAr ? 'الخطوة 6: جدول دمج الفيلم تلقائياً (مدة دقيقة واحدة)' : 'Step 6: One-Minute Timeline Assembly'}
              </h3>
              <div className="border border-neutral-800 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left rtl:text-right">
                  <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800">
                    <tr>
                      <th className="p-2.5">{isAr ? 'التوقيت' : 'Time'}</th>
                      <th className="p-2.5">{isAr ? 'المشهد المرئي' : 'Visual Clip'}</th>
                      <th className="p-2.5">{isAr ? 'الترجمة / النص' : 'Caption'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 text-neutral-300">
                    <tr><td className="p-2.5 text-neutral-400">0–4 sec</td><td className="p-2.5 font-medium">بطاقة المقدمة</td><td className="p-2.5">For you, my love</td></tr>
                    <tr><td className="p-2.5 text-neutral-400">4–12 sec</td><td className="p-2.5 font-medium">بورتريه الزوجة</td><td className="p-2.5">To my favourite person…</td></tr>
                    <tr><td className="p-2.5 text-neutral-400">12–20 sec</td><td className="p-2.5 font-medium">صورة قديمة لكما</td><td className="p-2.5">My favourite story began with you.</td></tr>
                    <tr><td className="p-2.5 text-neutral-400">20–28 sec</td><td className="p-2.5 font-medium">صورة حديثة لكما</td><td className="p-2.5">And I would choose you all over again.</td></tr>
                    <tr><td className="p-2.5 text-neutral-400">28–36 sec</td><td className="p-2.5 font-medium">الزوجة مع الأطفال</td><td className="p-2.5">The love you give our children means everything.</td></tr>
                    <tr><td className="p-2.5 text-neutral-400">36–44 sec</td><td className="p-2.5 font-medium">الزوجة مع العائلة</td><td className="p-2.5">So many memories. So much love around you.</td></tr>
                    <tr><td className="p-2.5 text-neutral-400">44–52 sec</td><td className="p-2.5 font-medium">صورة العائلة بأكملها</td><td className="p-2.5">Our happiest place is together.</td></tr>
                    <tr><td className="p-2.5 text-neutral-400">52–60 sec</td><td className="p-2.5 font-medium">تثبيت الصورة والتهنئة</td><td className="p-2.5">Happy birthday, my love. We love you.</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeStep === 7 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Mic className="w-4 h-4 text-rose-400" />
                {isAr ? 'الخطوة 7: تسجيل رسالتك بصوتك الحقيقي' : 'Step 7: Record Your Message'}
              </h3>
              <p className="text-xs text-neutral-300">
                {isAr
                  ? 'اقرأ هذه الرسالة بهدوء وصدق من داخل استوديو تسجيل الصوت في التطبيق:'
                  : 'Read this script slowly and naturally in your own voice:'}
              </p>
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs leading-relaxed text-neutral-200">
                <p className="font-semibold text-rose-300">"كل عام وأنتِ بخير يا حبيبتي الغالية."</p>
                <p>"النظر إلى هذه الصور يذكرني بكم أنا محظوظ بمشاركتكِ هذه الحياة."</p>
                <p>"أحب ذكرياتنا الكبرى، ولكنني أعشق أيامنا البسيطة المعتادة أكثر."</p>
                <p>"رؤيتكِ مع أطفالنا ومع من يحبونكِ تمنح هذه اللحظات معنى أعظم."</p>
                <p>"أتمنى لكِ في يومكِ هذا كل الحب والتقدير الذي تستحقينه."</p>
                <p>"إلى مزيد من الضحكات والمغامرات وسنواتٍ مديدة معاً."</p>
                <p className="font-semibold text-amber-300">"أحبكِ دائماً.. ونحبكِ جميعاً."</p>
              </div>
            </div>
          )}

          {activeStep === 8 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Music className="w-4 h-4 text-blue-400" />
                {isAr ? 'الخطوة 8: الميكس الموسيقي وتصدير الفيلم 1080p' : 'Step 8: Audio Mix & 1080p Export'}
              </h3>
              <ul className="list-disc list-inside space-y-2 text-xs text-neutral-300">
                <li>{isAr ? 'اختر موسيقى بيانو أو أكوستيك هادئة مدمجة في الأداة.' : 'Choose gentle instrumental piano or acoustic music.'}</li>
                <li>{isAr ? 'كتم أي صوت عشوائي صادر من مقاطع الذكاء الاصطناعي (Mute Flow audio).' : 'Mute any unwanted audio generated by Flow clips.'}</li>
                <li>{isAr ? 'ميزة خفض الموسيقى الذاتي عند التحدث (Audio Ducking) مفعلة تلقائياً.' : 'Smart audio ducking keeps music softer than your voice.'}</li>
                <li>{isAr ? 'اضغط "تصدير الفيديو المدمج" للحصول على فيلم متكامل عالي الدقة 1080p.' : 'Click "Export Merged Film" for full 1080p downloadable video.'}</li>
              </ul>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between">
          <div className="flex gap-2">
            {activeStep > 1 && (
              <button
                onClick={() => setActiveStep(activeStep - 1)}
                className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors"
              >
                {isAr ? 'السابق' : 'Previous'}
              </button>
            )}
            {activeStep < 8 && (
              <button
                onClick={() => setActiveStep(activeStep + 1)}
                className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors"
              >
                {isAr ? 'التالي' : 'Next'}
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors"
          >
            {isAr ? 'فهمت، البدء الآن' : 'Got it, Let’s Build'}
          </button>
        </div>

      </div>
    </div>
  );
};
