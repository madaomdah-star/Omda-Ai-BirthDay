export type AspectRatio = '16:9' | '9:16';

export type SceneRole = 
  | 'title_card'
  | 'portrait'
  | 'couple_old'
  | 'couple_new'
  | 'children'
  | 'family'
  | 'whole_family'
  | 'custom';

export type TransitionType = 'fade' | 'dissolve' | 'cut';

export interface SceneClip {
  id: string;
  role: SceneRole;
  title: string;
  titleAr: string;
  photoUrl: string | null;
  photoName?: string;
  videoUrl: string | null;
  videoName?: string;
  isVideoReal: boolean; // Flag to indicate if this is genuine video or photo
  flowPrompt: string;
  cameraMovementPrompt: string;
  captionText: string;
  captionTextAr: string;
  duration: number; // in seconds
  transition: TransitionType;
  isVerified: boolean;
  verificationNotes?: string;
  faceChecks?: {
    facialStructureOk: boolean;
    expressionNatural: boolean;
    noMorphing: boolean;
    clothingKept: boolean;
  };
}

export interface AudioSettings {
  voiceoverBlobUrl: string | null;
  voiceoverDuration: number;
  selectedMusicTrack: 'piano_peace' | 'acoustic_warmth' | 'gentle_strings' | 'custom' | 'none';
  customMusicUrl: string | null;
  musicVolume: number; // 0 to 1
  voiceVolume: number; // 0 to 1
  videoSoundVolume: number; // 0 to 1
  audioDucking: boolean;
}

export interface ProjectState {
  projectName: string;
  aspectRatio: AspectRatio;
  scenes: SceneClip[];
  audio: AudioSettings;
  language: 'ar' | 'en';
}
