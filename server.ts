import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Lazy Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// API: Generate & Optimize strict Flow/Veo Identity-Preserving Prompts
app.post("/api/ai/optimize-prompt", async (req, res) => {
  try {
    const { sceneType, subjectDescription, emotion, aspect } = req.body;
    const ai = getGenAI();

    if (!ai) {
      // Return smart template fallback if API key is not configured yet
      const baseNegative = "Keep every person recognisable and preserve their original facial structure, age, skin tone, hairstyle, expression, body proportions, clothing, and accessories. Keep the same people, positions, background, and lighting as the original photograph. Movement should be extremely subtle. Keep faces and hands steady. No talking, lip movement, head turns, new gestures, exaggerated expressions, beauty retouching, skin smoothing, or changes to teeth. Do not add or remove people or objects. No text, titles, music, or dialogue.";
      const prompt = `Use the uploaded photograph as the starting frame and visual reference. Create a restrained, photorealistic living photograph, not a redesigned scene. ${baseNegative} Over 8 seconds, make a very slow, gentle camera push-in. Allow only barely perceptible natural breathing. The feeling is ${emotion || "intimate and affectionate"}.`;
      return res.json({ prompt, basePrompt: baseNegative, guidance: "Guidance: Always leave end frame empty in Google Flow to prevent face morphing." });
    }

    const systemInstruction = `You are an expert prompt engineer for video generation tools (Google Flow, Veo) specialized in STRICT FACIAL & CHARACTER PRESERVATION. 
Your goal is to produce prompts that keep characters 100% true to their original photo with ZERO face morphing, zero distortion, zero exaggerated movements, and subtle natural breathing/gentle camera moves.
Always output strict photorealistic living portrait instructions.`;

    const promptRequest = `Create an optimized video prompt for a photo scene:
- Scene Type: ${sceneType || "Romantic couple or portrait"}
- Subject Description: ${subjectDescription || "A portrait from real family photo"}
- Mood/Emotion: ${emotion || "Intimate and affectionate"}
- Target Aspect Ratio: ${aspect || "16:9"}

Provide output strictly as JSON with fields:
- prompt: The complete Flow prompt (including base strict identity preservation text + camera move)
- captionSuggestion: A warm, touching 1-line caption (in both English and Arabic)
- tips: 2-3 critical tips for Google Flow generation for this exact photo`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: promptRequest,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("AI prompt error:", error);
    res.status(500).json({ error: error.message || "Failed to generate prompt" });
  }
});

// API: Generate / Polish narration voiceover script
app.post("/api/ai/narrate-script", async (req, res) => {
  try {
    const { occasion, recipientName, tone, language } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.json({
        arabicScript: [
          "كل عام وأنتِ بخير يا حبيبتي الغالية.",
          "النظر إلى هذه الصور يذكرني بكم أنا محظوظ بمشاركتكِ هذه الحياة.",
          "أحب ذكرياتنا الكبرى، ولكنني أعشق أيامنا البسيطة المعتادة أكثر.",
          "رؤيتكِ مع أطفالنا ومع من يحبونكِ تمنح هذه اللحظات معنى أعظم.",
          "أتمنى لكِ في يومكِ هذا كل الحب والتقدير الذي تستحقينه.",
          "إلى مزيد من الضحكات والمغامرات وسنواتٍ مديدة معاً.",
          "أحبكِ دائماً.. ونحبكِ جميعاً."
        ],
        englishScript: [
          "Happy birthday, my love.",
          "Looking at these pictures reminds me how lucky I am to share my life with you.",
          "I love the big memories we've made, but I love our ordinary days just as much.",
          "Seeing you with our children, and with the people who love you, gives these pictures even more meaning.",
          "Today, I hope you feel as loved and appreciated as you deserve.",
          "Here's to more laughter, more adventures, and many more birthdays together.",
          "I love you. We all do."
        ]
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `Create a warm, genuine 60-second voiceover narration script for a family video film:
Occasion: ${occasion || "Birthday"}
Recipient: ${recipientName || "My Love / Wife"}
Tone: ${tone || "Intimate, affectionate, and grateful"}
Requested Language: ${language || "both Arabic and English"}

Return JSON:
{
  "arabicScript": ["line 1", "line 2", ...],
  "englishScript": ["line 1", "line 2", ...]
}`,
      config: {
        responseMimeType: "application/json",
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("AI script error:", error);
    res.status(500).json({ error: error.message || "Failed to generate script" });
  }
});

// ==========================================
// VEO VIDEO GENERATION ENDPOINTS
// Model: veo-3.1-fast-generate-preview
// Aspect Ratio: 16:9 or 9:16
// ==========================================

// 1. Start Veo Video Generation (POST /api/generate-video)
app.post("/api/generate-video", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", prompt, aspectRatio = "16:9" } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.status(400).json({ 
        error: "GEMINI_API_KEY is not configured in environment variables. Please provide an API key in settings." 
      });
    }

    const cleanBase64 = imageBase64 ? imageBase64.replace(/^data:image\/[a-z]+;base64,/, "") : null;
    const validAspectRatio = aspectRatio === "9:16" ? "9:16" : "16:9";

    const defaultFacePrompt = "Create a restrained, photorealistic living photograph. Keep facial structure, identity, expression, and clothing completely preserved. Subtle natural breathing and gentle slow camera drift.";
    const finalPrompt = prompt && prompt.trim().length > 0 ? prompt : defaultFacePrompt;

    const generatePayload: any = {
      model: "veo-3.1-fast-generate-preview",
      prompt: finalPrompt,
      config: {
        numberOfVideos: 1,
        resolution: "720p",
        aspectRatio: validAspectRatio,
      },
    };

    if (cleanBase64) {
      generatePayload.image = {
        imageBytes: cleanBase64,
        mimeType: mimeType || "image/jpeg",
      };
    }

    console.log(`Starting Veo generation (model: veo-3.1-fast-generate-preview, aspect: ${validAspectRatio})...`);
    const operation = await ai.models.generateVideos(generatePayload);

    if (!operation || !operation.name) {
      throw new Error("Did not receive an operation name from Veo API.");
    }

    console.log(`Veo operation initiated: ${operation.name}`);
    res.json({ operationName: operation.name });
  } catch (error: any) {
    console.error("Veo generate-video error:", error);
    res.status(500).json({ error: error.message || "Failed to initiate Veo video generation" });
  }
});

// 2. Poll Veo Video Operation Status (POST /api/video-status)
app.post("/api/video-status", async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: "Missing operationName parameter" });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.status(400).json({ error: "GEMINI_API_KEY is not configured" });
    }

    // Pass operation descriptor to getVideosOperation
    const opDescriptor: any = { name: operationName };
    const updated = await ai.operations.getVideosOperation({ operation: opDescriptor });

    res.json({
      done: Boolean(updated.done),
      error: updated.error || null,
    });
  } catch (error: any) {
    console.error("Veo video-status error:", error);
    res.status(500).json({ error: error.message || "Failed to poll video status" });
  }
});

// 3. Download Generated Video (POST /api/video-download)
app.post("/api/video-download", async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: "Missing operationName parameter" });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.status(400).json({ error: "GEMINI_API_KEY is not configured" });
    }

    const opDescriptor: any = { name: operationName };
    const updated = await ai.operations.getVideosOperation({ operation: opDescriptor });

    if (!updated.done) {
      return res.status(400).json({ error: "Video generation operation is not complete yet" });
    }

    if (updated.error) {
      return res.status(500).json({ error: updated.error.message || "Video generation failed" });
    }

    const videoUri = updated.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) {
      return res.status(500).json({ error: "No video URI found in completed operation" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const videoRes = await fetch(videoUri, {
      headers: {
        "x-goog-api-key": apiKey || "",
      },
    });

    if (!videoRes.ok) {
      throw new Error(`Failed to fetch video from storage URI: ${videoRes.statusText}`);
    }

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", 'inline; filename="veo-generated.mp4"');

    const arrayBuffer = await videoRes.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (error: any) {
    console.error("Veo video-download error:", error);
    res.status(500).json({ error: error.message || "Failed to download generated video" });
  }
});

// ==========================================
// SMART REORDER & FACE/THEMATIC ANALYSIS ENDPOINT
// Detects faces, roles, chronological progression, and thematic continuity
// ==========================================
app.post("/api/ai/smart-reorder", async (req, res) => {
  try {
    const { scenes, preference = "thematic_story" } = req.body;
    // preference: "thematic_story" | "chronological_romance" | "family_focused"

    if (!Array.isArray(scenes) || scenes.length === 0) {
      return res.status(400).json({ error: "Missing or invalid scenes array" });
    }

    const ai = getGenAI();

    // Prepare scene summary for model
    const scenesSummary = scenes.map((s: any, idx: number) => ({
      index: idx,
      id: s.id,
      title: s.title,
      titleAr: s.titleAr,
      role: s.role,
      captionText: s.captionText,
      photoUrl: s.photoUrl ? s.photoUrl.slice(0, 120) : null,
      hasPhoto: Boolean(s.photoUrl),
      hasVideo: Boolean(s.videoUrl),
      flowPrompt: s.flowPrompt ? s.flowPrompt.slice(0, 150) : "",
      faceChecks: s.faceChecks || null,
    }));

    if (!ai) {
      // Deterministic Story Flow Fallback based on Birthday/Family Romance Guide:
      // Ideal flow:
      // 1. title_card (Opening / Intro)
      // 2. portrait (Her solo portrait / appreciation)
      // 3. couple_old (Our beginnings / early youth / nostalgia)
      // 4. couple_new (Present couple / Still us / mature bond)
      // 5. children (Mom with children / maternal love)
      // 6. family (Extended family / circle of loved ones)
      // 7. whole_family (Everyone together / home / grand finale)
      // 8. custom (Additional personal memories)
      const rolePriority: Record<string, number> = {
        title_card: 0,
        portrait: 1,
        couple_old: 2,
        couple_new: 3,
        children: 4,
        family: 5,
        whole_family: 6,
        custom: 7,
      };

      const sortedScenes = [...scenes].sort((a: any, b: any) => {
        const pA = rolePriority[a.role] ?? 8;
        const pB = rolePriority[b.role] ?? 8;
        return pA - pB;
      });

      return res.json({
        reorderedSceneIds: sortedScenes.map((s: any) => s.id),
        detectedFaceGroups: [
          { groupName: "Solo Portrait (Wife)", sceneIds: scenes.filter((s: any) => s.role === "portrait").map((s: any) => s.id), description: "Close-up solo focus with preserved facial features" },
          { groupName: "The Couple (Romance)", sceneIds: scenes.filter((s: any) => s.role === "couple_old" || s.role === "couple_new").map((s: any) => s.id), description: "Two faces: husband & wife spanning early years to present" },
          { groupName: "Family & Children", sceneIds: scenes.filter((s: any) => s.role === "children" || s.role === "family" || s.role === "whole_family").map((s: any) => s.id), description: "Multi-person group scenes, children and extended family" }
        ],
        storylineNarrativeAr: "تم الترتيب وفق القوس الدرامي المثالي: البداية الرومانسية الشخصية، ثم الذكريات الأولى، وصولاً إلى دفء العائلة والتهنئة الختامية.",
        storylineNarrativeEn: "Arranged for optimal emotional storytelling: starting intimate with her portrait, journeying through your beginnings, and culminating in family love and the finale.",
        themesDetected: ["Intimate Romance", "Early Memories", "Lasting Partnership", "Maternal Love & Children", "Family Circle & Finale"]
      });
    }

    // Call Gemini to analyze scene metadata, detected faces, emotional arc, and chronological themes
    const prompt = `You are a professional documentary video director and visual narrative storyteller.
Analyze the following video scenes for a personal family/birthday memory film.
Scenes list:
${JSON.stringify(scenesSummary, null, 2)}

User storytelling preference: "${preference}".
The film must maintain strict face identity continuity, and progress in an emotional, cinematic sequence:
1. Opening Title Card (if any) sets the stage.
2. Intimate solo focus on the recipient (portrait).
3. The early romantic beginnings / nostalgia (dating, wedding, younger days).
4. Present couple connection (comfort, deep companionship).
5. The children and family expanding (warmth, motherly love).
6. Extended family and close friends circle.
7. Grand finale with the whole family / home celebration.

Task:
1. Group scenes by detected faces / subjects (e.g. Solo Recipient, Couple Romance, Children & Mom, Extended Family, Whole Group).
2. Determine the optimal chronological and thematic order of all scenes (return an array of scene IDs in the exact recommended sequence).
3. Provide a brief explanation of why this sequence maximizes emotional impact and visual flow.

Return strictly JSON with:
{
  "reorderedSceneIds": ["scene-id-1", "scene-id-2", ...],
  "detectedFaceGroups": [
    {
      "groupName": "Subject/Theme name",
      "sceneIds": ["id1", "id2"],
      "description": "Short explanation of faces and visual tone"
    }
  ],
  "storylineNarrativeEn": "Why this sequence works best",
  "storylineNarrativeAr": "شرح باللغة العربية لسبب هذا الترتيب القصصي والدرامي",
  "themesDetected": ["Theme 1", "Theme 2", ...]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    // Ensure all original scene IDs exist in the reordered output
    if (Array.isArray(parsed.reorderedSceneIds)) {
      const existingIds = new Set(scenes.map((s: any) => s.id));
      const validReordered = parsed.reorderedSceneIds.filter((id: string) => existingIds.has(id));
      // Append any scenes that were accidentally omitted
      scenes.forEach((s: any) => {
        if (!validReordered.includes(s.id)) validReordered.push(s.id);
      });
      parsed.reorderedSceneIds = validReordered;
    } else {
      parsed.reorderedSceneIds = scenes.map((s: any) => s.id);
    }

    return res.json(parsed);
  } catch (error: any) {
    console.error("Smart reorder error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze and smart reorder scenes" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
