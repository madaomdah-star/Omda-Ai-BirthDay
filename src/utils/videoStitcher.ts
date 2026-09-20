import { SceneClip, AspectRatio } from '../types';
import { createMixedAudioStream } from './audioSynthesizer';

export interface RenderProgress {
  percent: number;
  currentSceneIndex: number;
  totalScenes: number;
  currentSceneTitle: string;
  statusText: string;
}

/**
 * Calculates canvas dimensions based on aspect ratio and target quality.
 */
export function getCanvasDimensions(aspectRatio: AspectRatio, quality: '1080p' | '720p' = '1080p') {
  if (aspectRatio === '16:9') {
    return quality === '1080p' ? { width: 1920, height: 1080 } : { width: 1280, height: 720 };
  } else {
    // 9:16 portrait
    return quality === '1080p' ? { width: 1080, height: 1920 } : { width: 720, height: 1280 };
  }
}

/**
 * Helper to load an HTMLImageElement safely.
 */
export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Fallback placeholder canvas if image fails to load
      const placeholder = document.createElement('canvas');
      placeholder.width = 800;
      placeholder.height = 600;
      const ctx = placeholder.getContext('2d')!;
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(0, 0, 800, 600);
      ctx.fillStyle = '#f5f5f4';
      ctx.font = '28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Reference Photo', 400, 300);
      const fallbackImg = new Image();
      fallbackImg.src = placeholder.toDataURL();
      fallbackImg.onload = () => resolve(fallbackImg);
    };
    img.src = url;
  });
}

/**
 * Prepares and seeks a video element for frame extraction and playback.
 */
export function createVideoElement(url: string): Promise<HTMLVideoElement> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.playsInline = true;
    video.muted = true;
    video.preload = 'auto';

    let isResolved = false;
    const onLoaded = () => {
      if (!isResolved) {
        isResolved = true;
        resolve(video);
      }
    };

    video.onloadeddata = onLoaded;
    video.oncanplay = onLoaded;
    video.onerror = () => {
      if (!isResolved) {
        isResolved = true;
        resolve(video);
      }
    };

    // Timeout fallback in case video cannot buffer
    setTimeout(onLoaded, 3000);
    video.src = url;
  });
}

/**
 * Draws image or video onto canvas respecting aspect ratio (cover/contain style with subtle vignette).
 */
export function drawMediaToCanvas(
  ctx: CanvasRenderingContext2D,
  media: HTMLImageElement | HTMLVideoElement,
  canvasWidth: number,
  canvasHeight: number,
  zoomFactor = 1.0,
  panX = 0,
  panY = 0
) {
  ctx.save();

  // Draw background fill
  ctx.fillStyle = '#09090b';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  const mediaWidth = (media as HTMLVideoElement).videoWidth || (media as HTMLImageElement).naturalWidth || 800;
  const mediaHeight = (media as HTMLVideoElement).videoHeight || (media as HTMLImageElement).naturalHeight || 600;

  const hRatio = canvasWidth / mediaWidth;
  const vRatio = canvasHeight / mediaHeight;
  const scale = Math.max(hRatio, vRatio) * zoomFactor;

  const drawWidth = mediaWidth * scale;
  const drawHeight = mediaHeight * scale;
  const drawX = (canvasWidth - drawWidth) / 2 + panX;
  const drawY = (canvasHeight - drawHeight) / 2 + panY;

  ctx.drawImage(media, drawX, drawY, drawWidth, drawHeight);

  // Subtle cinematic dark vignette at edges
  const gradient = ctx.createRadialGradient(
    canvasWidth / 2,
    canvasHeight / 2,
    canvasWidth * 0.35,
    canvasWidth / 2,
    canvasHeight / 2,
    canvasWidth * 0.75
  );
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.restore();
}

/**
 * Draws cinematic caption subtitle text onto the canvas.
 */
export function drawCaption(
  ctx: CanvasRenderingContext2D,
  caption: string,
  canvasWidth: number,
  canvasHeight: number,
  isTitleCard = false
) {
  if (!caption || caption.trim() === '') return;

  ctx.save();
  ctx.textAlign = 'center';

  if (isTitleCard) {
    // Elegant centerpiece title for opening card
    ctx.font = `600 ${Math.round(canvasWidth * 0.042)}px 'Cairo', 'Cinzel', serif`;
    const yPos = canvasHeight / 2;

    // Glowing subtle shadow
    ctx.shadowColor = 'rgba(0,0,0,0.85)';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(caption, canvasWidth / 2, yPos);
  } else {
    // Bottom caption positioned safely away from faces
    const fontSize = Math.max(22, Math.round(canvasWidth * 0.024));
    ctx.font = `500 ${fontSize}px 'Cairo', 'Plus Jakarta Sans', sans-serif`;

    const paddingX = Math.round(fontSize * 1.2);
    const paddingY = Math.round(fontSize * 0.6);
    const textWidth = ctx.measureText(caption).width;
    const boxWidth = Math.min(canvasWidth * 0.88, textWidth + paddingX * 2);
    const boxHeight = fontSize + paddingY * 2;
    const boxX = (canvasWidth - boxWidth) / 2;
    const boxY = canvasHeight - Math.round(canvasHeight * 0.14);

    // Pill background with glass effect
    ctx.fillStyle = 'rgba(12, 10, 9, 0.72)';
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 14);
    ctx.fill();

    // Subtle golden/rose border accent
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Text
    ctx.fillStyle = '#f5f5f4';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 6;
    ctx.fillText(caption, canvasWidth / 2, boxY + paddingY + fontSize * 0.82);
  }

  ctx.restore();
}

/**
 * Fully renders and stitches all scenes, mixed audio, and captions into an MP4/WebM downloadable blob.
 */
export async function stitchAndExportVideo(
  scenes: SceneClip[],
  aspectRatio: AspectRatio,
  voiceBlob: Blob | null,
  musicType: string,
  musicVolume: number,
  voiceVolume: number,
  language: 'ar' | 'en',
  onProgress: (progress: RenderProgress) => void
): Promise<Blob> {
  const { width, height } = getCanvasDimensions(aspectRatio, '1080p');
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const totalDuration = scenes.reduce((acc, s) => acc + s.duration, 0);

  // Setup Mixed Audio
  const audioMix = await createMixedAudioStream(voiceBlob, musicType, musicVolume, voiceVolume, totalDuration);

  // Canvas Stream at 30 fps
  const canvasStream = canvas.captureStream(30);

  // Combine video and audio tracks
  const combinedTracks = [...canvasStream.getVideoTracks(), ...audioMix.stream.getAudioTracks()];
  const exportStream = new MediaStream(combinedTracks);

  let mimeType = 'video/webm;codecs=vp9,opus';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm';
  }

  const recorder = new MediaRecorder(exportStream, {
    mimeType,
    videoBitsPerSecond: 8000000 // 8 Mbps for high fidelity 1080p
  });

  const recordedChunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  recorder.start();

  // Render scenes sequentially
  let elapsedTime = 0;
  const fps = 30;
  const frameInterval = 1000 / fps;

  for (let sceneIndex = 0; sceneIndex < scenes.length; sceneIndex++) {
    const scene = scenes[sceneIndex];
    const sceneDuration = scene.duration;
    const totalSceneFrames = Math.round(sceneDuration * fps);

    // Preload media
    let videoEl: HTMLVideoElement | null = null;
    let photoEl: HTMLImageElement | null = null;

    if (scene.videoUrl) {
      videoEl = await createVideoElement(scene.videoUrl);
      try {
        videoEl.currentTime = 0;
        await videoEl.play().catch(() => {});
      } catch (e) {}
    }

    if (scene.photoUrl) {
      photoEl = await loadImage(scene.photoUrl);
    }

    for (let frame = 0; frame < totalSceneFrames; frame++) {
      const sceneProgress = frame / totalSceneFrames;
      const overallPercent = Math.min(99, Math.round(((elapsedTime + (frame / fps)) / totalDuration) * 100));

      // Calculate camera push-in (from 100% to 105% over duration as per guide)
      const zoom = 1.0 + (sceneProgress * 0.05);

      if (videoEl && videoEl.readyState >= 2) {
        drawMediaToCanvas(ctx, videoEl, width, height, zoom);
      } else if (photoEl) {
        drawMediaToCanvas(ctx, photoEl, width, height, zoom);
      } else {
        // Fallback title or neutral card
        ctx.fillStyle = '#171717';
        ctx.fillRect(0, 0, width, height);
      }

      // Transition dissolve effect at start of scene
      if (frame < 15 && sceneIndex > 0) {
        const fadeAlpha = 1 - (frame / 15);
        ctx.fillStyle = `rgba(0, 0, 0, ${fadeAlpha})`;
        ctx.fillRect(0, 0, width, height);
      }

      // Render caption
      const caption = language === 'ar' ? (scene.captionTextAr || scene.captionText) : scene.captionText;
      const isTitleCard = scene.role === 'title_card';
      drawCaption(ctx, caption, width, height, isTitleCard);

      onProgress({
        percent: overallPercent,
        currentSceneIndex: sceneIndex + 1,
        totalScenes: scenes.length,
        currentSceneTitle: language === 'ar' ? scene.titleAr : scene.title,
        statusText: language === 'ar'
          ? `جاري دمج المشهد ${sceneIndex + 1} من ${scenes.length} بدقة 1080p...`
          : `Stitching Scene ${sceneIndex + 1} of ${scenes.length} in 1080p...`
      });

      // Pause briefly for next frame capture
      await new Promise((r) => setTimeout(r, frameInterval));
    }

    if (videoEl) {
      try {
        videoEl.pause();
      } catch (e) {}
    }

    elapsedTime += sceneDuration;
  }

  // Stop recording and finalize
  return new Promise((resolve) => {
    recorder.onstop = () => {
      audioMix.cleanup();
      const finalBlob = new Blob(recordedChunks, { type: mimeType });
      onProgress({
        percent: 100,
        currentSceneIndex: scenes.length,
        totalScenes: scenes.length,
        currentSceneTitle: language === 'ar' ? 'تم اكتمال الفيلم!' : 'Completed!',
        statusText: language === 'ar' ? 'تم دمج وتصدير الفيديو بنجاح!' : 'Video film stitched and ready!'
      });
      resolve(finalBlob);
    };

    recorder.stop();
  });
}
