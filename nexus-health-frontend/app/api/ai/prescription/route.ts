import { NextResponse } from "next/server";

const GEMINI_MODEL = "gemini-2.5-flash-lite";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SYSTEM_PROMPT = `You are a friendly, patient-facing medical prescription explainer for NexusHealth.

Your job is to take a doctor's prescription or treatment plan (which may contain medical shorthand, abbreviations, and jargon) and translate it into clear, simple, plain-English instructions that any patient can understand.

For each medication or treatment mentioned, provide:
1. **name**: The drug name (expand abbreviations — e.g., "PCM" → "Paracetamol (Tylenol/Calpol)")
2. **purpose**: What the drug is used for in simple terms (e.g., "Reduces fever and mild pain")
3. **dosage**: The exact dosage mentioned (e.g., "650mg per tablet")
4. **timing**: Plain-English timing instructions (e.g., "Take one tablet three times a day, after meals" — expand abbreviations like TDS, BD, OD, HS, ac, pc, SOS into full English)
5. **sideEffects**: Common side effects to watch for (2-3 key ones, in simple language)
6. **advice**: Practical tips or warnings (e.g., "Avoid driving after taking this", "Take with a full glass of water", "Do not crush or chew")

Also provide a "generalAdvice" string with overall guidance like hydration, rest, when to seek emergency help, and follow-up reminders.

Respond ONLY with this JSON structure:
{
  "medications": [
    {
      "name": "...",
      "purpose": "...",
      "dosage": "...",
      "timing": "...",
      "sideEffects": "...",
      "advice": "..."
    }
  ],
  "generalAdvice": "..."
}

Rules:
- Expand ALL medical abbreviations into plain English.
- Use warm, friendly, reassuring language — the patient should feel informed, not scared.
- If a medication is not a drug (e.g., "rest in dark room", "increase fluid intake"), still include it as an entry with purpose and timing where applicable, and mark dosage as "N/A".
- Do not invent medications not mentioned in the prescription.
- Keep each field concise: 1-2 sentences max.
- Include at least one practical safety warning in generalAdvice (e.g., when to go to the ER).`;

export async function POST(request: Request) {
  try {
    const { prescription } = await request.json();

    if (!prescription || typeof prescription !== "string" || prescription.trim().length < 5) {
      return NextResponse.json(
        { error: "No prescription text provided to decode." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_free_api_key_from_google_ai_studio") {
      console.error("GEMINI_API_KEY is not set or still has the placeholder value.");
      return NextResponse.json(
        { error: "AI service is not configured. Please set the GEMINI_API_KEY environment variable." },
        { status: 500 }
      );
    }

    const userPrompt = `Doctor's Prescription / Treatment Plan:\n"${prescription.trim()}"`;

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${SYSTEM_PROMPT}\n\n${userPrompt}` }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1200,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Gemini API error [${response.status}]:`, errorData);

      let userMessage = "AI service is temporarily unavailable. Please try again.";
      if (response.status === 400) {
        userMessage = "Invalid request to AI service. The API key may be incorrect.";
      } else if (response.status === 403) {
        userMessage = "AI API key is invalid or expired. Please check your GEMINI_API_KEY.";
      } else if (response.status === 404) {
        userMessage = `AI model '${GEMINI_MODEL}' not found. The model may have been updated.`;
      } else if (response.status === 429) {
        userMessage = "AI rate limit reached. Please wait a moment and try again.";
      }

      return NextResponse.json({ error: userMessage }, { status: 502 });
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Clean potential markdown code fences
    const cleaned = rawText
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    return NextResponse.json({
      medications: Array.isArray(parsed.medications) ? parsed.medications : [],
      generalAdvice: parsed.generalAdvice || "Follow your doctor's instructions and stay hydrated.",
    });
  } catch (error: any) {
    console.error("Prescription Explainer API error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          medications: [],
          generalAdvice: "We couldn't decode this prescription automatically. Please consult your pharmacist or doctor for clarification.",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
