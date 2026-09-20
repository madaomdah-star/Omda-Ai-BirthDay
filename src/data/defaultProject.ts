import { SceneClip, ProjectState } from '../types';

export const BASE_FLOW_PROMPT = 
`Use the uploaded photograph as the starting frame and visual reference. Create a restrained, photorealistic living photograph, not a redesigned scene. Keep every person recognisable and preserve their original facial structure, age, skin tone, hairstyle, expression, body proportions, clothing, and accessories. Keep the same people, positions, background, and lighting as the original photograph. Movement should be extremely subtle. Keep faces and hands steady. No talking, lip movement, head turns, new gestures, exaggerated expressions, beauty retouching, skin smoothing, or changes to teeth. Do not add or remove people or objects. No text, titles, music, or dialogue.`;

export const INITIAL_SCENES: SceneClip[] = [
  {
    id: 'scene-0',
    role: 'title_card',
    title: 'Opening Title',
    titleAr: 'بطاقة المقدمة',
    photoUrl: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=80',
    photoName: 'romantic_intro.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    videoName: 'intro_ambience.mp4',
    isVideoReal: true,
    flowPrompt: 'Cinematic warm bokeh light with elegant soft particles moving slowly. Restrained and intimate.',
    cameraMovementPrompt: 'Gentle slow drift across warm ambient golden bokeh lights.',
    captionText: 'For you, my love',
    captionTextAr: 'إلى من أحب، كل عام وأنتِ بخير',
    duration: 4,
    transition: 'dissolve',
    isVerified: true,
    faceChecks: {
      facialStructureOk: true,
      expressionNatural: true,
      noMorphing: true,
      clothingKept: true
    }
  },
  {
    id: 'scene-1',
    role: 'portrait',
    title: 'Clip 1: Her Portrait',
    titleAr: 'المشهد 1: صورتها الشخصية',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
    photoName: 'portrait_wife.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    videoName: 'flow_clip_portrait.mp4',
    isVideoReal: true,
    flowPrompt: `${BASE_FLOW_PROMPT}\n\nOver eight seconds, make a very slow, gentle camera push-in toward the woman. Keep her original pose, gaze, and expression unchanged. Allow only barely perceptible natural breathing. Preserve the original colours and lighting. The feeling is intimate and affectionate, like quietly appreciating a favourite photograph.`,
    cameraMovementPrompt: 'Over eight seconds, make a very slow, gentle camera push-in toward the woman. Keep her original pose, gaze, and expression unchanged. Allow only barely perceptible natural breathing.',
    captionText: 'To my favourite person…',
    captionTextAr: 'إلى شخصي المفضل في هذا العالم...',
    duration: 8,
    transition: 'dissolve',
    isVerified: true,
    faceChecks: {
      facialStructureOk: true,
      expressionNatural: true,
      noMorphing: true,
      clothingKept: true
    }
  },
  {
    id: 'scene-2',
    role: 'couple_old',
    title: 'Clip 2: Our Beginning',
    titleAr: 'المشهد 2: بداياتنا معاً',
    photoUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1000&q=80',
    photoName: 'older_couple.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    videoName: 'flow_clip_beginning.mp4',
    isVideoReal: true,
    flowPrompt: `${BASE_FLOW_PROMPT}\n\nOver eight seconds, use a very gentle camera push-in toward the couple, keeping both faces fully visible throughout. Both people remain in their original pose with the same expressions and gaze direction as the photograph. Do not invent a kiss, embrace, or head movement. Preserve the photograph's original atmosphere. The feeling is a treasured memory of our beginning.`,
    cameraMovementPrompt: 'Over eight seconds, use a very gentle camera push-in toward the couple, keeping both faces fully visible throughout. Both people remain in their original pose with the same expressions and gaze direction.',
    captionText: 'My favourite story began with you.',
    captionTextAr: 'أجمل قصة في حياتي بدأت معكِ.',
    duration: 8,
    transition: 'dissolve',
    isVerified: true,
    faceChecks: {
      facialStructureOk: true,
      expressionNatural: true,
      noMorphing: true,
      clothingKept: true
    }
  },
  {
    id: 'scene-3',
    role: 'couple_new',
    title: 'Clip 3: Still Us',
    titleAr: 'المشهد 3: ما زلنا نحن',
    photoUrl: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1000&q=80',
    photoName: 'recent_couple.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    videoName: 'flow_clip_still_us.mp4',
    isVideoReal: true,
    flowPrompt: `${BASE_FLOW_PROMPT}\n\nCreate an eight-second, almost-still living portrait of this couple. Use a steady camera with only a very subtle push-in. Keep their original expressions, positions, and physical contact exactly as shown. Allow barely perceptible breathing, with no other deliberate body movement. Preserve the real setting and lighting. The feeling is comfortable, lasting love.`,
    cameraMovementPrompt: 'Create an eight-second, almost-still living portrait of this couple. Use a steady camera with only a very subtle push-in. Keep their original expressions and physical contact unchanged.',
    captionText: 'And I would choose you all over again.',
    captionTextAr: 'وسأختاركِ في كل مرة من جديد دون تردد.',
    duration: 8,
    transition: 'dissolve',
    isVerified: true,
    faceChecks: {
      facialStructureOk: true,
      expressionNatural: true,
      noMorphing: true,
      clothingKept: true
    }
  },
  {
    id: 'scene-4',
    role: 'children',
    title: 'Clip 4: You as Their Mum',
    titleAr: 'المشهد 4: أنتِ وأطفالنا',
    photoUrl: 'https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?auto=format&fit=crop&w=1000&q=80',
    photoName: 'wife_with_children.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    videoName: 'family_mom_children.mp4',
    isVideoReal: true,
    flowPrompt: `${BASE_FLOW_PROMPT}\n\nTreat this image as a still photograph or gentle authentic capture. Create only a very slow camera push-in over eight seconds from 100% to 104%. All people remain motionless, with unchanged expressions, gaze directions, hands, and body positions. Keep every child and mother face fully visible without distortion.`,
    cameraMovementPrompt: 'Slowly zoom from approximately 100% to 104% over 8 seconds. Keep every child face in frame. No artificial face morphing.',
    captionText: 'The love you give our children means everything.',
    captionTextAr: 'حبكِ وحنانكِ لأطفالنا يعني لنا كل شيء في هذه الحياة.',
    duration: 8,
    transition: 'dissolve',
    isVerified: true,
    faceChecks: {
      facialStructureOk: true,
      expressionNatural: true,
      noMorphing: true,
      clothingKept: true
    }
  },
  {
    id: 'scene-5',
    role: 'family',
    title: 'Clip 5: The People Who Love You',
    titleAr: 'المشهد 5: عائلتك ومحبوكِ',
    photoUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1000&q=80',
    photoName: 'wife_with_family.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    videoName: 'family_circle.mp4',
    isVideoReal: true,
    flowPrompt: `${BASE_FLOW_PROMPT}\n\nKeep the whole group visible. Use a very gentle slow camera drift or gentle zoom. Avoid panning past anyone's face. Keep all family members authentic with exact likeness and zero face smoothing.`,
    cameraMovementPrompt: 'Keep the whole group visible. Use a very gentle zoom, keeping everyone in frame without altering anyone.',
    captionText: 'So many memories. So much love around you.',
    captionTextAr: 'ذكريات لا تُحصى، ومحبة تحيط بكِ أينما كنتِ.',
    duration: 8,
    transition: 'dissolve',
    isVerified: true,
    faceChecks: {
      facialStructureOk: true,
      expressionNatural: true,
      noMorphing: true,
      clothingKept: true
    }
  },
  {
    id: 'scene-6',
    role: 'whole_family',
    title: 'Clip 6: Our Home & Final Wish',
    titleAr: 'المشهد 6: بيتنا والتهنئة الختامية',
    photoUrl: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?auto=format&fit=crop&w=1000&q=80',
    photoName: 'whole_family.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    videoName: 'whole_family_finale.mp4',
    isVideoReal: true,
    flowPrompt: `${BASE_FLOW_PROMPT}\n\nStart slightly zoomed in, and slowly reveal the full photograph of the whole family together over 12 seconds. Keep every face completely unaltered, preserving real smiles, eyes, and body positions. Pure authentic family portrait.`,
    cameraMovementPrompt: 'Start slightly zoomed in, slowly zoom out to reveal the full photograph. Hold with warmth.',
    captionText: 'Our happiest place is together. Happy birthday, my love. We love you!',
    captionTextAr: 'أسعد أوقاتنا هي حين نكون معاً.. كل عام وأنتِ بخير يا حبيبتي، نحبكِ جميعاً!',
    duration: 12,
    transition: 'fade',
    isVerified: true,
    faceChecks: {
      facialStructureOk: true,
      expressionNatural: true,
      noMorphing: true,
      clothingKept: true
    }
  }
];

export const DEFAULT_PROJECT: ProjectState = {
  projectName: 'Birthday Romance & Family Film',
  aspectRatio: '16:9',
  scenes: INITIAL_SCENES,
  audio: {
    voiceoverBlobUrl: null,
    voiceoverDuration: 0,
    selectedMusicTrack: 'piano_peace',
    customMusicUrl: null,
    musicVolume: 0.35,
    voiceVolume: 0.95,
    videoSoundVolume: 0.0, // muted by default as recommended in guide Step 8
    audioDucking: true
  },
  language: 'ar'
};
