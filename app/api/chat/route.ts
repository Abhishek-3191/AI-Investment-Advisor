/* ---------------- DECISION ENGINE V5---------------- */

type UserProfile = {
  amount?: number
  duration?: number
  risk?: "low" | "medium" | "high"
  goal?: string
}
type AdviceDecision = {
  type: "ADVICE"
  context: string
  allocation: { asset: string; percent: number }[]
  signals: any
}

type NeedInfoDecision = {
  type: "NEED_MORE_INFO"
  message: string
}

type DecisionResult = AdviceDecision | NeedInfoDecision


function extractUserProfile(message: string): UserProfile {
  const amountMatch = message.match(/(\d+)\s?(k|lakh|lac|crore)?/i)
  const durationMatch = message.match(/(\d+)\s?(year|years)/i)

  let amount
  if (amountMatch) {
    let val = parseInt(amountMatch[1])
    const unit = amountMatch[2]?.toLowerCase()

    if (unit === "k") val *= 1000
    if (unit === "lakh" || unit === "lac") val *= 100000
    if (unit === "crore") val *= 10000000

    amount = val
  }

  return {
    amount,
    duration: durationMatch ? parseInt(durationMatch[1]) : undefined,
    risk: message.toLowerCase().includes("high")
      ? "high"
      : message.toLowerCase().includes("low")
      ? "low"
      : message.toLowerCase().includes("medium")
      ? "medium" 
      : undefined,
    goal: message,
  }
}


async function getMarketData() {
  try {
    /* ---------------- 1️⃣ NIFTY TREND (Yahoo - reliable) ---------------- */
    const trendRes = await fetch(
      "https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEI?range=1mo&interval=1d"
    )
    const trendData = await trendRes.json()
    console.log("trendData",trendData)
    const prices =
      trendData?.chart?.result?.[0]?.indicators?.quote?.[0]?.close || []

    const first = prices[0] || 0
    const last = prices[prices.length - 1] || 0

    let trend = "neutral"
    if (last > first * 1.03) trend = "bullish"
    else if (last < first * 0.97) trend = "bearish"


    /* ---------------- 2️⃣ NIFTY PE (SCRAPER FALLBACK) ---------------- */
    let niftyPE = 21

    try {
      const peRes = await fetch(
        "https://api.allorigins.win/raw?url=https://www.screener.in/api/company/NIFTY/"
      )
      const text = await peRes.text()

      const match = text.match(/"pe":\s*([\d.]+)/)
      if (match) {
        niftyPE = parseFloat(match[1])
        console.log("niftyPE",niftyPE);
      }
    } catch (e) {
      console.log("PE fetch failed, using fallback")
    }


    /* ---------------- 3️⃣ INFLATION ---------------- */
    let inflation = 6.5
    let interestRate = 6.5
try {
  const res = await fetch("https://api.worldbank.org/v2/country/IN/indicator/FP.CPI.TOTL.ZG?format=json")
  const data = await res.json()
  inflation = data?.[1]?.[0]?.value || 6.5
  console.log("inflation",inflation)
} catch {
  console.log("Inflation fallback used")
}


    /* ---------------- FINAL RETURN ---------------- */
    return {
      niftyPoint: last,
      niftyPE,
      inflation,
      interestRate,
      trend,
       fetchedAt: new Date().toISOString(),
    }

  } catch (e) {
    console.log("Market data failed, fallback used")

    return {
      niftyPE: 21,
      inflation: 6.5,
      interestRate: 6.5,
      trend: "neutral",
    }
  }
}

/* ---------------- MARKET SIGNALS ---------------- */

function getMarketSignals(data: any) {
  return {
    valuation:
      data.niftyPE > 22
        ? "overvalued"
        : data.niftyPE < 16
        ? "undervalued"
        : "fair",

    inflationRegime:
      data.inflation > 6 ? "high" : "normal",

    rateRegime:
      data.interestRate >= 6.5 ? "tight" : "easy",

    trend: data.trend, // bullish / bearish / neutral
  }
}

function getExpectedReturns(signals: any) {
  let equity = 12
  let gold = 9
  let debt = 7

  // 📉 Overvalued → lower equity return expectation
  if (signals.valuation === "overvalued") equity -= 2

  // 📈 Undervalued → higher equity return
  if (signals.valuation === "undervalued") equity += 2

  // 📊 Trend boost
  if (signals.trend === "bullish") equity += 1
  if (signals.trend === "bearish") equity -= 1

  // 🪙 Inflation → gold performs better
  if (signals.inflationRegime === "high") gold += 1

  return { equity, gold, debt }
}

function calculateFutureValue(
  principal: number,
  rate: number,
  years: number
) {
  return Math.round(principal * Math.pow(1 + rate / 100, years))
}

//new one
function decisionEngine(profile: UserProfile, signals: any): DecisionResult {
  const { amount, duration, risk } = profile

  if (!amount || !duration || !risk) {
    let missing = []
    if (!amount) missing.push("amount")
    if (!duration) missing.push("duration")
    if (!risk) missing.push("risk preference")

    return {
      type: "NEED_MORE_INFO",
      message: `Please provide ${missing.join(", ")}.`,
    }
  }

  /* ---------------- STEP 1: ASSET UNIVERSE ---------------- */

 const ASSETS = [
  {
    name: "Nifty 50",
    category: "equity",
    riskLevel: "moderate",
    expectedReturn: 12,
    base: 1.0,
  },
  {
    name: "Flexi Cap Fund",
    category: "equity",
    riskLevel: "moderate",
    expectedReturn: 11,
    base: 1.1,
  },
  {
    name: "Midcap Fund",
    category: "equity",
    riskLevel: "high",
    expectedReturn: 13,
    base: 1.2,
  },
  {
    name: "Small Cap Fund",
    category: "equity",
    riskLevel: "high",
    expectedReturn: 14,
    base: 1.3,
  },
  {
    name: "Banking Sector Fund",
    category: "equity",
    riskLevel: "high",
    expectedReturn: 12,
    base: 1.15,
  },

  {
    name: "US Index Fund",
    category: "international",
    riskLevel: "moderate",
    expectedReturn: 10,
    base: 1.0,
  },

  {
    name: "Gold ETF",
    category: "gold",
    riskLevel: "moderate",
    expectedReturn: 9,
    base: 1.0,
  },
  {
    name: "Silver ETF",
    category: "gold",
    riskLevel: "high",
    expectedReturn: 9,
    base: 1.1,
  },

  {
    name: "Corporate Bond Fund",
    category: "debt",
    riskLevel: "low",
    expectedReturn: 7,
    base: 1.0,
  },
  {
    name: "Liquid Fund",
    category: "debt",
    riskLevel: "low",
    expectedReturn: 7,
    base: 0.9,
  },
]

  

  /* ---------------- STEP 2: SCORING ---------------- */
 const filteredAssets = ASSETS.filter(a => {
  // Low-risk investors should avoid high-risk assets
  if (risk === "low" && a.riskLevel === "high") {
    return false
  }

  // Short investment horizons should avoid high-risk assets
  if (duration <= 3 && a.riskLevel === "high") {
    return false
  }

  return true
})

  const scored = filteredAssets.map(a => {
  let score = a.base

  // Expected return
  score += (a.expectedReturn - 9) * 0.1

  // Market conditions
  if (signals.trend === "bullish" && a.category === "equity") {
    score += 0.6
  }

  if (signals.trend === "bearish" && a.category === "debt") {
    score += 0.6
  }

  if (signals.inflationRegime === "high" && a.category === "gold") {
    score += 0.7
  }

  // Risk preference
  if (risk === "high") {
    if (a.riskLevel === "high") score += 0.5
    if (a.riskLevel === "moderate") score += 0.3
  }

  if (risk === "medium") {
    if (a.riskLevel === "moderate") score += 0.5
    if (a.riskLevel === "high") score += 0.2
    if (a.riskLevel === "low") score += 0.1
  }

  if (risk === "low") {
    if (a.riskLevel === "low") score += 0.6
    if (a.riskLevel === "moderate") score += 0.2
  }

  // Investment horizon
if (duration < 1) {
  // Very short horizon: prioritize capital stability
  if (a.category === "debt") score += 1.0
  if (a.category === "gold") score += 0.3
  if (a.category === "equity") score -= 0.8
}

else if (duration < 3) {
  // Short horizon: defensive allocation
  if (a.category === "debt") score += 0.7
  if (a.category === "gold") score += 0.3
  if (a.category === "equity") score -= 0.4
}

else if (duration <= 5) {
  // Medium horizon: balanced growth + stability
  if (a.category === "equity") score += 0.2
  if (a.category === "debt") score += 0.2
  if (a.category === "gold") score += 0.2
}

else if (duration <= 10) {
  // Long horizon: greater ability to tolerate equity volatility
  if (a.category === "equity") score += 0.6
  if (a.category === "gold") score += 0.3
  if (a.category === "debt") score += 0.1
}

else {
  // Very long horizon: prioritize long-term growth
  if (a.category === "equity") score += 0.8
  if (a.category === "gold") score += 0.3
  if (a.category === "debt") score += 0.0
}

  return {
    ...a,
    score,
  }
})

  /* ---------------- STEP 3: SORT ---------------- */

  scored.sort((a, b) => b.score - a.score)

  /* ---------------- STEP 4: PICK TOP ASSETS ---------------- */

  let topN = 5
  if (risk === "low") topN = 4
  if (risk === "high") topN = 6

  let equityTarget = 0
  let debtTarget = 0
  let goldTarget = 0

  // Portfolio structure based on risk + investment horizon
if (duration < 1) {
  // Very short horizon
  equityTarget = risk === "high" ? 15 : 5
  debtTarget = risk === "high" ? 70 : 85
  goldTarget = 15
}

else if (duration < 3) {
  // Short horizon
  equityTarget = risk === "high" ? 30 : risk === "medium" ? 20 : 10
  debtTarget = risk === "high" ? 50 : risk === "medium" ? 60 : 75
  goldTarget = 20
}

else if (duration <= 5) {
  // Medium horizon
  equityTarget = risk === "high" ? 70 : risk === "medium" ? 55 : 30
  debtTarget = risk === "high" ? 15 : risk === "medium" ? 30 : 50
  goldTarget = 15
}

else if (duration <= 10) {
  // Long horizon
  equityTarget = risk === "high" ? 80 : risk === "medium" ? 65 : 45
  debtTarget = risk === "high" ? 10 : risk === "medium" ? 20 : 40
  goldTarget = 10
}

else {
  // Very long horizon
  equityTarget = risk === "high" ? 85 : risk === "medium" ? 70 : 50
  debtTarget = risk === "high" ? 5 : risk === "medium" ? 15 : 35
  goldTarget = 10
}

  // const selected = scored.slice(0, topN)

  /* ---------------- STEP 5: NORMALIZE ---------------- */

  // const totalScore = selected.reduce((sum, a) => sum + a.score, 0)

  // const allocation = selected.map(a => ({
  //   asset: a.name,
  //   percent: Math.round((a.score / totalScore) * 100),
  // }))

  // Select the best assets from each category
const equityAssets = scored
  .filter(a => a.category === "equity")
  .sort((a, b) => b.score - a.score)

const debtAssets = scored
  .filter(a => a.category === "debt")
  .sort((a, b) => b.score - a.score)

const goldAssets = scored
  .filter(a => a.category === "gold")
  .sort((a, b) => b.score - a.score)

const selected = [
  ...equityAssets.slice(0, 2),
  ...debtAssets.slice(0, 2),
  ...goldAssets.slice(0, 1),
]

const selectedEquity = equityAssets.slice(0, 2)
const selectedDebt = debtAssets.slice(0, 2)
const selectedGold = goldAssets.slice(0, 1)

const allocateByScore = (
  assets: typeof scored,
  targetPercent: number
) => {
  if (assets.length === 0 || targetPercent === 0) {
    return []
  }

  const totalScore = assets.reduce(
    (sum, asset) => sum + asset.score,
    0
  )

  return assets.map(asset => ({
    asset: asset.name,
    percent: Math.round(
      (asset.score / totalScore) * targetPercent
    ),
  }))
}

const rawAllocation = [
  ...allocateByScore(selectedEquity, equityTarget),
  ...allocateByScore(selectedDebt, debtTarget),
  ...allocateByScore(selectedGold, goldTarget),
]

const allocationTotal = rawAllocation.reduce(
  (sum, item) => sum + item.percent,
  0
)

const difference = 100 - allocationTotal

const allocation = rawAllocation.map((item, index) => {
  if (index === 0) {
    return {
      ...item,
      percent: item.percent + difference,
    }
  }

  return item
})
  return {
    type: "ADVICE",
    context: "AI-selected portfolio using scoring + market signals",
    allocation,
    signals,
  }
}


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
You are a deterministic AI Investment Advisor for Indian users.

⚠️ CORE RULE:
You are NOT allowed to think, estimate, or reinterpret.
You ONLY structure and explain data provided.

----------------------------------------
INPUT SOURCES (STRICT PRIORITY)
----------------------------------------
1. Decision Engine → FINAL allocation (DO NOT CHANGE)
2. Projections → FINAL returns & future values (DO NOT CHANGE)
3. Market Signals → ONLY for explanation

----------------------------------------
STRICT BEHAVIOR RULES
----------------------------------------
- DO NOT modify allocation percentages
- DO NOT rename assets
- DO NOT calculate returns
- DO NOT estimate future values
- DO NOT use historical assumptions if projections exist
- DO NOT add new financial logic

----------------------------------------
PROJECTION RULES (CRITICAL)
----------------------------------------
- expectedReturn MUST EXACTLY match projection.expectedReturn + "%"
- futureValue MUST EXACTLY match projection.futureValue
- reasoning MUST reference projection.futureValue
- If projections are provided → IGNORE historical data completely

❌ INVALID:
"historically returns are..."
"expected ~12-14%"

✅ VALID:
"expectedReturn": "12%"

----------------------------------------
SUMMARY RULES
----------------------------------------
- MUST use Decision Engine "context"
- MUST include market signals (valuation, trend, inflation, rates)
- Keep it 2-3 lines MAX
- No storytelling

----------------------------------------
OUTPUT FORMAT (STRICT JSON ONLY)
----------------------------------------
{
  "summary": "Short explanation (2-3 lines)",
  "table": [
    {
      "asset": "Name",
      "type": "Mutual Fund / ETF / Gold / FD / Stock",
      "risk": "Low / Moderate / High",
      "expectedReturn": "EXACT projection value (e.g. 12%)",
      "timeHorizon": "years",
      "reason": "Must include projected future value",
      "allocation": "Amount + %"
    }
  ],
  "note": "This is not financial advice"
}

----------------------------------------
TABLE RULES
----------------------------------------
- EXACTLY match Decision Engine assets
- MAX 5 rows
- allocation MUST match Decision Engine
- expectedReturn MUST match projections
- reason MUST include projected future value

----------------------------------------
VALIDATION (VERY IMPORTANT)
----------------------------------------
If ANY rule is violated:
→ Output is INVALID
→ Regenerate correctly

----------------------------------------
LEGAL
----------------------------------------
- You are NOT a SEBI registered advisor
- Do NOT guarantee returns
- Always include disclaimer

----------------------------------------
STYLE
----------------------------------------
- Short
- Structured
- No extra text outside JSON

----------------------------------------
END ALWAYS:
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


/* 3️⃣ DECISION ENGINE new version */


const profile = extractUserProfile(message)

/* 🔥 Market */
const marketData = await getMarketData()
const signals = getMarketSignals(marketData)
console.log("Signals:", signals);

/* 🔥 Decision */
const decision = decisionEngine(profile, signals)

/* 🚨 HANDLE NEED_MORE_INFO FIRST */
if (decision.type === "NEED_MORE_INFO") {
  return NextResponse.json({
    reply: JSON.stringify({
      summary: decision.message,
      table: [],
      note: "Provide complete details",
    }),
  })
}

/* ✅ SAFE AFTER THIS POINT */
const returns = getExpectedReturns(signals)

/* 🔥 PROJECTIONS (SAFE NOW) */
const projections = decision.allocation.map(asset => {
  const invested = (profile.amount! * asset.percent) / 100


  let rate

if (asset.asset.includes("Small")) rate = returns.equity + 3
else if (asset.asset.includes("Midcap")) rate = returns.equity + 2
else if (asset.asset.includes("Nifty")) rate = returns.equity
else if (asset.asset.includes("Flexi")) rate = returns.equity
else if (asset.asset.includes("US")) rate = returns.equity
else if (asset.asset.includes("Gold")) rate = returns.gold
else if (asset.asset.includes("Silver")) rate = returns.gold + 1
else rate = returns.debt


  return {
    asset: asset.asset,
    invested,
    expectedReturn: rate,
    futureValue: calculateFutureValue(
      invested,
      rate,
      profile.duration!
    ),
  }
})


const enhancedPrompt = `
${SYSTEM_PROMPT}

Decision Engine Insight:
${JSON.stringify(decision)}

Market Conditions:
- Valuation: ${signals.valuation}
- Trend: ${signals.trend}
- Inflation: ${signals.inflationRegime}
- Interest Rates: ${signals.rateRegime}

Projections (USE THESE STRICTLY):
${JSON.stringify(projections)}

STRICT INSTRUCTION:
- DO NOT change allocation
- DO NOT guess returns
- Use projection expectedReturn values
- Use projection futureValue to explain growth

Conversation so far:
${history}

User: ${message}
`


const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: enhancedPrompt,
})


let aiReply =
  response.candidates?.[0]?.content?.parts?.[0]?.text ||
  "Sorry, I couldn't understand that."

console.log("Raw Response:", aiReply)


/* 🔥 STEP 1: Remove markdown */
aiReply = aiReply
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim()

/* 🔥 STEP 2: Extract ONLY JSON */
const firstBrace = aiReply.indexOf("{")
const lastBrace = aiReply.lastIndexOf("}")

if (firstBrace !== -1 && lastBrace !== -1) {
  aiReply = aiReply.substring(firstBrace, lastBrace + 1)
}

console.log("Final Clean JSON:", aiReply)


/* 4️⃣ Save AI message */
await convex.mutation(api.chats.saveChat, {
  email,
  role: "assistant",
  message: aiReply,
})

return NextResponse.json({
  reply: aiReply,
  projections,
})

} catch (error) {
    console.error("CHAT API ERROR:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

