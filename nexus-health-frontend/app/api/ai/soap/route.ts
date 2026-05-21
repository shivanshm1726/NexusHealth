import { NextResponse } from "next/server";

const GEMINI_MODEL = "gemini-flash-latest";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SYSTEM_PROMPT = `You are a professional medical documentation assistant for NexusHealth, a hospital management platform.

Your job is to take raw, unstructured doctor notes from a consultation and transform them into a well-organized clinical document using the SOAP (Subjective, Objective, Assessment, Plan) format.

SOAP Format:
- **Subjective (S):** What the patient reports — their symptoms, complaints, history, and how they feel. Written in third person.
- **Objective (O):** Observable and measurable clinical findings — vitals, physical exam results, lab results mentioned.
- **Assessment (A):** The doctor's clinical impression or differential diagnosis based on subjective and objective data.
- **Plan (P):** The treatment plan — medications prescribed, follow-up instructions, referrals, tests ordered, lifestyle advice.

You MUST respond with valid JSON only, no markdown, no code fences, no extra text. Use this exact structure:
{
  "subjective": "...",
  "objective": "...",
  "assessment": "...",
  "plan": "...",
  "summary": "A one-line summary of the consultation for records."
}

Rules:
- If information for a section is not provided in the raw notes, write "Not documented in this consultation."
- Use professional medical language but keep it clear and concise.
- Expand common medical abbreviations where possible (e.g., "PCM" → "Paracetamol", "OD" → "once daily", "TDS" → "three times daily", "BD" → "twice daily", "HS" → "at bedtime", "ac" → "before meals", "pc" → "after meals").
- Do not invent information not present in the raw notes.
- Each section should be 2-4 sentences.`;

export async function POST(request: Request) {
  try {
    const { notes, patientInfo } = await request.json();

    if (!notes || typeof notes !== "string" || notes.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide more detailed consultation notes (at least a few words)." },
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

    const userPrompt = patientInfo
      ? `Patient Context: ${patientInfo}\n\nRaw Consultation Notes:\n"${notes.trim()}"`
      : `Raw Consultation Notes:\n"${notes.trim()}"`;

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
          temperature: 0.2,
          maxOutputTokens: 600,
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
      subjective: parsed.subjective || "Not documented.",
      objective: parsed.objective || "Not documented.",
      assessment: parsed.assessment || "Not documented.",
      plan: parsed.plan || "Not documented.",
      summary: parsed.summary || "Consultation completed.",
    });
  } catch (error: any) {
    console.error("SOAP API error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          subjective: "Unable to process notes automatically.",
          objective: "N/A",
          assessment: "Please try again with more detailed notes.",
          plan: "N/A",
          summary: "AI processing encountered an issue.",
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
