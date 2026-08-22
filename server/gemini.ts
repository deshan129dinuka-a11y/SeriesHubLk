import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not configured in environment.");
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Helper to delay for backoff
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generateSinhalaDescription(
  title: string,
  year: number | string,
  genres: string[] = [],
  overview: string = "",
  directorOrCreator: string = "",
  type: "movie" | "series" = "movie",
  additionalInfo?: {
    cast?: string[];
    rating?: number | string;
    runtimeOrSeasons?: string;
    customPrompt?: string;
  }
): Promise<string> {
  const ai = getAIClient();
  const genreStr = genres.length > 0 ? genres.join(", ") : "Action / Drama";
  const castStr = additionalInfo?.cast?.length ? additionalInfo.cast.join(", ") : "";
  const ratingStr = additionalInfo?.rating ? `IMDb Rating: ${additionalInfo.rating}/10` : "";

  if (ai) {
    const prompt = `You are a premier Sri Lankan film critic, professional cinema journalist, and master Sinhala subtitle translator for SeriesHubLk (Sri Lanka's top cinema & subtitle platform).

Write a captivating, comprehensive, and highly detailed Sinhala review and synopsis (සිංහල සිනමා විචාරය සහ කතා සාරාංශය) for the following ${type}:

═══════════════════════════════════════════
DETAILS:
• Title: ${title} (${year})
• Media Type: ${type === "movie" ? "Feature Film (සිනමා පටය)" : "TV Series (ටෙලි කතා මාලාව)"}
• Genres: ${genreStr}
• Director / Creators: ${directorOrCreator || "Acclaimed Filmmakers"}
${castStr ? `• Main Cast: ${castStr}` : ""}
${ratingStr ? `• Rating: ${ratingStr}` : ""}
${additionalInfo?.runtimeOrSeasons ? `• Duration / Seasons: ${additionalInfo.runtimeOrSeasons}` : ""}
• English Plot Summary: ${overview || "A thrilling cinematic journey with deep conflicts, twists, and emotional stakes."}
${additionalInfo?.customPrompt ? `• Special Focus Instructions: ${additionalInfo.customPrompt}` : ""}
═══════════════════════════════════════════

CRITICAL GUIDELINES FOR THE REVIEW (නීති හා උපදෙස්):
1. **NO SPOILERS (කිසිදු Spoiler එකක් ඇතුළත් නොකරන්න)**: Explain the initial premise, character dilemmas, atmospheric tension, and stakes WITHOUT revealing climax twists, deaths, surprises, or ending solutions. Keep the mystery alive to entice the audience.
2. **RICH & DETAILED STRUCTURE (පැහැදිලි ඡේද 3-4 කින් සමන්විත විස්තරය)**:
   - **1 වන ඡේදය (හැඳින්වීම හා සිනමා පසුබිම)**: ${title} හි ආරම්භක පසුබිම, ලෝක සිනමාවේ ලැබූ ප්‍රසාදය, අධ්‍යක්ෂණය සහ එහි ප්‍රභේදයේ (Genre) සුවිශේෂත්වය.
   - **2 වන ඡේදය (කතා සාරාංශය - Spoiler Free Premise)**: කතාව ආරම්භ වන ආකාරය, ප්‍රධාන චරිතය මුහුණ දෙන මූලික අභියෝගය, මතුවන අනපේක්ෂිත ගැටුම සහ කුතුහලය.
   - **3 වන ඡේදය (රංගනය, තාක්ෂණික අංග හා සිනමා අත්දැකීම)**: නළු නිළියන්ගේ රංගනය, කැමරාකරණය, පසුබිම් සංගීතය (BGM) හා Action/Emotional අවස්ථා වල ඇති විශිෂ්ටත්වය.
   - **4 වන ඡේදය (නැරඹීමට ආරාධනය)**: මෙම ${type === "movie" ? "චිත්‍රපටය" : "සීරීස් එක"} සිනමා ලෝලීන් අනිවාර්යයෙන්ම සිංහල උපසිරැසි සමඟින් SeriesHubLk වෙතින් නැරඹිය යුතු හේතුව.
3. **TONE & STYLE**: Write in elegant, fluent, modern Sinhala (ශ්‍රී ලාංකේය සිනමා රසිකයින් ආකර්ෂණය වන චතුර, සුහදශීලී සිංහල භාෂාවෙන්). Keep "${title}" in English when mentioning the title name.
4. **FORMATTING**: Output pure Sinhala text with clear paragraph breaks. Do NOT include markdown headers like '###' or meta-text.`;

    // Candidate models ordered for optimal availability and fallback
    const candidateModels = [
      "gemini-3.1-flash-lite",
      "gemini-3.7-flash",
      "gemini-flash-latest",
      "gemini-3.1-pro-preview",
    ];

    for (const modelName of candidateModels) {
      let attempts = 0;
      const maxAttempts = 2;

      while (attempts < maxAttempts) {
        attempts++;
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction:
                "You are Sri Lanka's leading film journalist and Sinhala subtitle translator. You write detailed, captivating, rich, and 100% spoiler-free Sinhala movie and TV series reviews.",
              temperature: 0.7,
            },
          });

          const text = response.text?.trim();
          if (text && text.length > 50) {
            return text;
          }
          break; // Empty or short response, try next model
        } catch (error: any) {
          const status = error?.status || error?.code || error?.error?.code;
          const isTransient = status === 503 || status === 429 || status === "UNAVAILABLE";
          
          if (isTransient && attempts < maxAttempts) {
            // Short backoff before retry on high-demand
            await delay(300 * attempts);
            continue;
          }
          // Move to next candidate model
          break;
        }
      }
    }
  }

  // Rich Multi-Paragraph Sinhala Fallback (guaranteed high-quality output if API is temporarily unavailable)
  const overviewFallback = overview
    ? `කතාව ගලායන්නේ අනපේක්ෂිත සිදුවීම් දාමයක් වටා ය. ${overview.length > 180 ? overview.substring(0, 180) + "..." : overview} ප්‍රධාන චරිතයන් මුහුණ දෙන අනපේක්ෂිත අභියෝග සහ ගැටුම් හමුවේ කතාව ඉදිරියට ඇදෙන අතර, කිසිදු අවස්ථාවක කුතුහලය ගිලිහී යාමට ඉඩ නොතබයි.`
    : `අනපේක්ෂිත හැරවුම් ලක්ෂ්‍ය රැසකින් සහ ත්‍රාසජනක සිදුවීම් පෙළකින් සමන්විත මෙම කතාව, ප්‍රේක්ෂකයා එක මොහොතකටවත් තිරයෙන් ඉවතට නෙත් නොගන්නා ආකාරයේ ආකර්ෂණීය තිර පිටපතකින් යුක්තය.`;

  return `${title} (${year}) යනු ලොව පුරා සිනමා ලෝලීන්ගේ ඉහළ ප්‍රසාදයට පාත්‍ර වූ, ${genreStr} ගණයේ විශිෂ්ටතම ${
    type === "movie" ? "සිනමා පටයකි" : "ටෙලි නාට්‍ය මාලාවකි"
  }. ${directorOrCreator ? `${directorOrCreator} ගේ විශිෂ්ට අධ්‍යක්ෂණයෙන් හැඩගැන්වුණු` : "සුවිශේෂී නිර්මාණශීලීත්වයකින් යුතු"} මෙම නිර්මාණය, ආරම්භයේ සිට අවසානය දක්වාම ප්‍රේක්ෂකයා කුතුහලයේ ඉහළම තලයක රඳවා තබා ගැනීමට සමත් වේ.\n\n${overviewFallback}\n\nඋසස්ම තාක්ෂණික ප්‍රමිතීන්ගෙන් යුතු මෙම නිර්මාණය, සිංහල උපසිරැසි සමඟින් SeriesHubLk වෙතින් රසවිඳින්න!`;
}

// Season-wise Sinhala Synopsis Generator
export async function generateSeasonSynopsis(options: {
  seriesTitle: string;
  seasonNumber: number;
  seasonName?: string;
  seasonOverview?: string;
  seriesOverview?: string;
  customPrompt?: string;
}): Promise<string> {
  const { seriesTitle, seasonNumber, seasonName, seasonOverview, seriesOverview, customPrompt } = options;

  const promptParts = [
    "You are Sri Lanka's top television journalist and Sinhala subtitle translator.",
    "Write an engaging, compelling, detailed, and 100% spoiler-free Sinhala synopsis and review specifically for Season " + seasonNumber + " of the TV series \"" + seriesTitle + "\".",
    "",
    "TV Series: " + seriesTitle,
    "Season: " + (seasonName || ("Season " + seasonNumber)),
    seasonOverview ? "Season Overview: " + seasonOverview : "",
    seriesOverview ? "Series Context: " + seriesOverview : "",
    customPrompt ? "Admin Special Instructions: " + customPrompt : "",
    "",
    "GUIDELINES:",
    "1. Focus on the main arcs, stakes, tone, and character development of Season " + seasonNumber + ".",
    "2. Write 2-3 well-structured Sinhala paragraphs.",
    "3. Keep the language natural, modern, and exciting for Sri Lankan TV series fans.",
    "4. Do NOT output markdown headers like '###' or introductory English labels. Output purely Sinhala text."
  ];
  const prompt = promptParts.filter(Boolean).join("\n");

  const ai = getAIClient();
  if (ai) {
    const candidateModels = [
      "gemini-3.1-flash-lite",
      "gemini-3.7-flash",
      "gemini-flash-latest",
      "gemini-3.1-pro-preview",
    ];

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction:
              "You are Sri Lanka's leading TV series reviewer. Write fluent, highly engaging Sinhala reviews for specific seasons of TV series.",
            temperature: 0.7,
          },
        });

        const text = response.text?.trim();
        if (text && text.length > 50) {
          return text;
        }
      } catch (e) {
        // try next candidate
      }
    }
  }

  // Fallback
  const extraInfo = seasonOverview ? seasonOverview : "කලින් Season එක අවසානයේ මතු වූ ප්‍රශ්න සහ අභිරහස් රැසකට පිළිතුරු මෙම Season එක ඔස්සේ විවර වේ.";
  return "'" + seriesTitle + "' කතා මාලාවේ " + seasonNumber + " වන Season එක (" + (seasonName || ("Season " + seasonNumber)) + ") ආරම්භයේ සිටම උණුසුම් හා ත්‍රාසජනක සිදුවීම් මාලාවකින් සමන්විත වේ. " + extraInfo + "\n\nචරිතයන් මුහුණ දෙන දැවැන්ත අභියෝග සහ නොසිතූ හැරවුම් ලක්ෂ්‍ය නිසා මෙම Season එක ප්‍රේක්ෂකයා මොහොතකටවත් තිරයෙන් ඉවතට නොගන්නා ආකාරයේ උච්චතම කුතුහලයකින් යුක්තය. 720p සහ 1080p ඉහළම ගුණාත්මකභාවයෙන් යුත් සිංහල උපසිරැසි සමඟින් මෙම Season එක දැන්ම නරඹන්න!";
}


