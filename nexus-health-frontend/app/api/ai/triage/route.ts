import { NextResponse } from "next/server";

const GEMINI_MODEL = "gemini-flash-latest";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SYSTEM_PROMPT = `You are an AI medical triage assistant for NexusHealth, a hospital management platform.

Your job:
1. Analyze the patient's described symptoms.
2. Provide a brief, empathetic summary of their concern and what it might indicate (max 3 sentences).
3. Recommend a single doctor specialization from this list ONLY:
   GENERAL, CARDIOLOGY, DERMATOLOGY, GASTROENTEROLOGY, NEUROLOGY, ORTHOPEDICS, PEDIATRICS, PSYCHIATRY, GYNECOLOGY, OPHTHALMOLOGY, ENT, DENTISTRY, UROLOGY, PULMONOLOGY, ENDOCRINOLOGY
4. Determine if the symptoms suggest a life-threatening emergency.

You MUST respond with valid JSON only, no markdown, no code fences, no extra text. Use this exact structure:
{
  "analysis": "Your friendly 2-3 sentence summary here.",
  "specialty": "SPECIALIZATION_NAME",
  "isEmergency": false
}

Rules:
- If you are unsure, default specialty to "GENERAL".
- If symptoms include chest pain, difficulty breathing, signs of stroke, severe bleeding, loss of consciousness, or suicidal thoughts, set isEmergency to true.
- Never diagnose. Say "this may be related to..." not "you have...".
- Always remind them this is AI-generated guidance, not a medical diagnosis.`;

export async function POST(request: Request) {
  try {
    const { symptoms } = await request.json();

    if (!symptoms || typeof symptoms !== "string" || symptoms.trim().length < 3) {
      return NextResponse.json(
        { error: "Please describe your symptoms in at least a few words." },
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

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${SYSTEM_PROMPT}\n\nPatient symptoms: "${symptoms.trim()}"`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 300,
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

      return NextResponse.json(
        { error: userMessage },
        { status: 502 }
      );
    }

    const data = await response.json();

    // Extract the text from Gemini's response structure
    const rawText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Clean potential markdown code fences the model might add despite instructions
    const cleaned = rawText
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    // Parse the JSON response
    const parsed = JSON.parse(cleaned);

    return NextResponse.json({
      analysis: parsed.analysis || "Unable to analyze symptoms. Please consult a doctor.",
      specialty: parsed.specialty || "GENERAL",
      isEmergency: parsed.isEmergency === true,
    });
  } catch (error: any) {
    console.error("Triage API error:", error);

    // If JSON parsing failed, the model returned bad output
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          analysis:
            "I wasn't able to fully process your symptoms. Please try describing them differently, or consult a doctor directly.",
          specialty: "GENERAL",
          isEmergency: false,
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
