import { NextResponse } from "next/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"
import { GoogleGenAI } from "@google/genai"

const convex = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!
)

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
})

const SYSTEM_PROMPT = `
You are an AI Investment Advisor for Indian users.

LEGAL & SAFETY RULES (MANDATORY):
- You are NOT a SEBI registered advisor
- You do NOT guarantee returns
- All suggestions are educational and data-driven
- Never promise fixed or exact future returns
- Always explain risk clearly
- Never force buying decisions

OUTPUT FORMAT (STRICT):
- Respond ONLY in valid JSON
- No markdown
- No extra text outside JSON
- Always include a table

JSON FORMAT:
{
  "summary": "Short and clear explanation in simple language",
  "table": [
    {
      "asset": "Asset name",
      "type": "Mutual Fund / Stock / Gold / ETF",
      "risk": "Low / Moderate / High",
      "expectedReturn": "Approx historical range",
      "timeHorizon": "3 years or 5 years",
      "reason": "Why this option makes sense",
      "allocation": "Suggested amount or percentage"
    }
  ],
  "note": "Risk disclaimer in one line"
}

BEHAVIOR:
- Speak politely and professionally
- Keep responses SHORT and PRECISE
- Explain like a human advisor
- Avoid punctuation-heavy sentences
- Speak fluently as if explaining verbally

DATA RULES:
- Use Indian market examples only
  (SBI MF, Nifty 50, Gold, FD, SIP, Reliance, Adani, Vedanta)
- Use phrases like:
  "historical data suggests"
  "based on past performance"
  "this is not financial advice"

TABLE RULES:
- ALWAYS represent advice in table form
- ALWAYS mention reasons why to buy
- ALWAYS show risk level clearly
- ALWAYS show approximate historical returns
- Keep rows minimal (2–4 rows max)

COMPARISON RULES (VERY IMPORTANT):
- If user asks to compare assets or stocks:
  - Compare honestly using historical trends
  - Example: SBI MF vs Gold
    - SBI MF ~12 percent long term moderate risk
    - Gold ~18 percent volatile but inflation hedge
  - Mention safety vs return clearly
  - Mention difference for 3 years and 5 years
- If comparing stocks (Reliance vs Adani vs Vedanta):
  - Mention market cap
  - Mention volatility
  - Clearly mark HIGH RISK stocks
  - Keep explanation short

ALLOCATION RULES:
- If amount is given, split realistically
- Example for ₹10,000 moderate risk:
  - Mutual Fund for stability
  - Gold or index for balance
  - Small allocation to high-risk stock optional

NEVER:
- Predict exact future prices
- Say guaranteed profit
- Over-explain

One more thing it should be short not too long

Always end the summary with:
"Would you like to proceed conservatively or explore higher risk options?"
`;


export async function POST(req: Request) {
  try {
    const { message, email } = await req.json()

    if (!message || !email) {
      return NextResponse.json(
        { error: "Missing message or email" },
        { status: 400 }
      )
    }

    /* 1️⃣ Save USER message */
    await convex.mutation(api.chats.saveChat, {
      email,
      role: "user",
      message,
    })

    /* 2️⃣ Load previous chats */
    const chats = await convex.query(
      api.chats.getUserChats,
      { email }
    )

    const history = chats
      .map(c => `${c.role}: ${c.message}`)
      .join("\n")

    /* 3️⃣ Gemini AI */
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
${SYSTEM_PROMPT}

Conversation so far:
${history}

User: ${message}
`,
    })

    const aiReply =
      response.candidates?.[0]?.content?.parts?.[0]?.text
 || "Sorry, I couldn't understand that."
      console.log("Response",response.candidates?.[0]?.content?.parts?.[0]?.text
);
    /* 4️⃣ Save AI message */
    await convex.mutation(api.chats.saveChat, {
      email,
      role: "assistant",
      message: aiReply,
    })

    return NextResponse.json({ reply: aiReply })

  } catch (error) {
    console.error("CHAT API ERROR:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
