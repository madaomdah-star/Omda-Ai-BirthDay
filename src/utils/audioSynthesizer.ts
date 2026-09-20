// Web Audio procedural gentle background soundtrack generator
// Generates soft acoustic / piano ambient music suitable for sentimental family videos

let audioCtx: AudioContext | null = null;
let currentSourceNodes: (AudioNode | number)[] = [];
let isPlayingTrack = false;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function stopBackgroundMusic() {
  isPlayingTrack = false;
  currentSourceNodes.forEach((node) => {
    if (typeof node === 'number') {
      window.clearTimeout(node);
    } else {
      try {
        (node as any).stop?.();
        (node as any).disconnect?.();
      } catch (e) {
        // ignore
      }
    }
  });
  currentSourceNodes = [];
}

// Gentle Piano Melody pattern (C major / A minor soft progression: C, G, Am, F)
const PIANO_FREQUENCIES: Record<string, number> = {
  'C3': 130.81, 'E3': 164.81, 'G3': 196.00,
  'A3': 220.00, 'C4': 261.63, 'D4': 293.66,
  'E4': 329.63, 'G4': 392.00, 'A4': 440.00,
  'B4': 493.88, 'C5': 523.25, 'D5': 587.33,
  'E5': 659.25, 'G5': 783.99
};

const PIANO_PROGRESSIONS = [
  ['C3', 'E4', 'G4', 'C5'],
  ['G3', 'D4', 'G4', 'B4'],
  ['A3', 'C4', 'E4', 'A4'],
  ['F3', 'C4', 'E4', 'A4']
];

export function playProceduralPianoTrack(masterVolume = 0.3): void {
  stopBackgroundMusic();
  const ctx = getAudioContext();
  isPlayingTrack = true;

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(masterVolume * 0.4, ctx.currentTime);
  masterGain.connect(ctx.destination);
  currentSourceNodes.push(masterGain);

  let step = 0;
  const beatInterval = 850; // ms

  function playNote(freq: number, timeOffset: number, duration: number, gainVal: number) {
    if (!isPlayingTrack) return;
    const osc = ctx.createOscillator();
    const noteGain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + timeOffset);

    // Warm soft envelope
    const start = ctx.currentTime + timeOffset;
    noteGain.gain.setValueAtTime(0.0001, start);
    noteGain.gain.exponentialRampToValueAtTime(gainVal, start + 0.04);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    osc.connect(noteGain);
    noteGain.connect(masterGain);

    osc.start(start);
    osc.stop(start + duration + 0.1);
    currentSourceNodes.push(osc);
  }

  function loopSequence() {
    if (!isPlayingTrack) return;
    const chordIndex = Math.floor(step / 4) % PIANO_PROGRESSIONS.length;
    const chord = PIANO_PROGRESSIONS[chordIndex];
    const noteName = chord[step % chord.length];
    const freq = PIANO_FREQUENCIES[noteName] || 261.63;

    // Arpeggio note
    playNote(freq, 0, 1.8, 0.18);
    // Soft octave bass note on first beat
    if (step % 4 === 0) {
      const bassFreq = (PIANO_FREQUENCIES[chord[0]] || 130) * 0.5;
      playNote(bassFreq, 0, 3.2, 0.25);
    }

    step++;
    const timer = window.setTimeout(loopSequence, beatInterval);
    currentSourceNodes.push(timer);
  }

  loopSequence();
}

/**
 * Creates an AudioNode graph or AudioDestinationNode for rendering audio during video stitching.
 */
export async function createMixedAudioStream(
  voiceBlob: Blob | null,
  musicType: string,
  musicVolume: number,
  voiceVolume: number,
  totalDurationSeconds: number
): Promise<{ stream: MediaStream; cleanup: () => void }> {
  const ctx = getAudioContext();
  const dest = ctx.createMediaStreamDestination();

  const cleanupFns: (() => void)[] = [];

  // Voiceover track
  if (voiceBlob) {
    try {
      const arrayBuffer = await voiceBlob.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      const voiceSource = ctx.createBufferSource();
      voiceSource.buffer = audioBuffer;

      const voiceGain = ctx.createGain();
      voiceGain.gain.setValueAtTime(voiceVolume, ctx.currentTime);

      voiceSource.connect(voiceGain);
      voiceGain.connect(dest);

      voiceSource.start(0);
      cleanupFns.push(() => {
        try {
          voiceSource.stop();
        } catch (e) {}
      });
    } catch (e) {
      console.warn("Could not decode voiceover audio", e);
    }
  }

  // Background music track (synthesized or loaded)
  if (musicType !== 'none' && musicVolume > 0.01) {
    const musicGain = ctx.createGain();
    musicGain.gain.setValueAtTime(musicVolume * 0.25, ctx.currentTime);
    musicGain.connect(dest);

    // Play subtle soft chord tones into destination
    let isSynthRunning = true;
    let step = 0;
    const interval = 900;

    const timer = window.setInterval(() => {
      if (!isSynthRunning || ctx.state === 'closed') return;
      const chordIndex = Math.floor(step / 4) % PIANO_PROGRESSIONS.length;
      const chord = PIANO_PROGRESSIONS[chordIndex];
      const noteName = chord[step % chord.length];
      const freq = PIANO_FREQUENCIES[noteName] || 261.63;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.0);

      osc.connect(gain);
      gain.connect(musicGain);

      osc.start();
      osc.stop(ctx.currentTime + 2.1);
      step++;
    }, interval);

    cleanupFns.push(() => {
      isSynthRunning = false;
      window.clearInterval(timer);
    });
  }

  return {
    stream: dest.stream,
    cleanup: () => {
      cleanupFns.forEach((fn) => fn());
    }
  };
}
