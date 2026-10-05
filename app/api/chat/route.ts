import { NextResponse } from "next/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"
import type { UserProfile } from "./_components/types"

import { getMarketData } from "./_components/market-data"
import { getMarketSignals } from "./_components/signals"
import { decisionEngine } from "./_components/decision-engine"
import { createProjections } from "./_components/projections"
import { extractUserIntent, generateAdvisorResponse } from "./_components/gemini"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

function mergeProfiles(existing: UserProfile, extracted: UserProfile): UserProfile {
  return {
    goal: extracted.goal ?? existing.goal,
    amount: extracted.amount ?? existing.amount,
    duration: extracted.duration ?? existing.duration,
    risk: extracted.risk ?? existing.risk,
  }
}

function getMissingFields(profile: UserProfile): string[] {
  const missing: string[] = []
  if (!profile.goal) missing.push("goal")
  if (profile.amount === undefined) missing.push("amount")
  if (profile.duration === undefined) missing.push("duration")
  if (!profile.risk) missing.push("risk")
  return missing
}

function createMissingInfoResponse(missingFields: string[]) {
  let summary = ""
  if (missingFields.length === 1) {
    const field = missingFields[0]
    if (field === "goal") summary = "I'd be happy to help. What are you investing for — for example, buying a house, buying a car, building wealth, or retirement?"
    if (field === "amount") summary = "Got it. How much are you planning to invest?"
    if (field === "duration") summary = "Got it. What time horizon are you targeting for this goal — for example, 3, 5, or 10 years?"
    if (field === "risk") summary = "Got it. How comfortable are you with investment risk — low, medium, or high?"
  } else {
    const questions: string[] = []
    if (missingFields.includes("goal")) questions.push("what you're investing for")
    if (missingFields.includes("amount")) questions.push("how much you plan to invest")
    if (missingFields.includes("duration")) questions.push("your investment time horizon")
    if (missingFields.includes("risk")) questions.push("your risk preference (low, medium, or high)")
    summary = `To build a suitable investment plan, please tell me ${questions.join(", ")}.`
  }
  return JSON.stringify({
    summary,
    table: [],
    note: "I need a little more information before creating your investment plan.",
  })
}

export async function POST(req: Request) {
  const requestStart = Date.now()
  try {
    const { message, email } = await req.json()
    console.log("================================")
    console.log("🚀 CHAT REQUEST START")
    console.log("================================")

    if (!message || !email) {
      return NextResponse.json({ error: "Missing message or email" }, { status: 400 })
    }

    const saveUserStart = Date.now()
    await convex.mutation(api.chats.saveChat, { email, role: "user", message })
    console.log(`💾 Convex save user: ${Date.now() - saveUserStart}ms`)

    const profileStart = Date.now()
    const existingProfile = await convex.query(api.investmentProfiles.getActiveProfile, { email })
    const extractedProfile = await extractUserIntent(
    message,
    existingProfile ?? {}
    )
    const profile = mergeProfiles(existingProfile ?? {}, extractedProfile)
    console.log(`🧠 Profile extraction: ${Date.now() - profileStart}ms`)
    console.log("🧠 Active profile:", profile)

    const missingFields = getMissingFields(profile)
    console.log("❓ Missing fields:", missingFields)

    if (missingFields.length > 0) {
      await convex.mutation(api.investmentProfiles.upsertProfile, {
        email,
        goal: profile.goal,
        amount: profile.amount,
        duration: profile.duration,
        risk: profile.risk,
        status: "collecting",
      })

      const reply = createMissingInfoResponse(missingFields)
      console.log("⏸️ Waiting for more user information")
      console.log(`🚀 TOTAL REQUEST: ${Date.now() - requestStart}ms`)

      return NextResponse.json({
        reply,
        profile,
        missingFields,
      })
    }

    await convex.mutation(api.investmentProfiles.upsertProfile, {
      email,
      goal: profile.goal,
      amount: profile.amount,
      duration: profile.duration,
      risk: profile.risk,
      status: "collecting",
    })

    const marketStart = Date.now()
    const marketData = await getMarketData()
    console.log(`📈 Market data: ${Date.now() - marketStart}ms`)

    const signalsStart = Date.now()
    const signals = getMarketSignals(marketData)
    console.log(`📊 Market signals: ${Date.now() - signalsStart}ms`)

    const decisionStart = Date.now()
    const decision = decisionEngine(profile, signals)
    console.log(`⚙️ Decision engine: ${Date.now() - decisionStart}ms`)
    console.log("Decision:", decision)

    if (decision.type === "NEED_MORE_INFO") {
      const reply = JSON.stringify({
        summary: decision.message,
        table: [],
        note: "I need a little more information before creating your investment plan.",
      })

      console.log(`🚀 TOTAL REQUEST: ${Date.now() - requestStart}ms`)
      return NextResponse.json({ reply, profile })
    }

    const projectionStart = Date.now()
    const projections = createProjections(decision, profile.amount!, profile.duration!)
    console.log(`📈 Projections: ${Date.now() - projectionStart}ms`)

    const geminiStart = Date.now()
    const aiReply = await generateAdvisorResponse(
    decision,
    projections,
    signals,
    message
    )
    console.log(`🤖 Gemini total: ${Date.now() - geminiStart}ms`)

    const saveAssistantStart = Date.now()
    await convex.mutation(api.chats.saveChat, {
      email,
      role: "assistant",
      message: aiReply,
    })
    console.log(`💾 Convex save assistant: ${Date.now() - saveAssistantStart}ms`)

    await convex.mutation(api.investmentProfiles.resetProfile, { email })
    console.log("♻️ Active investment profile reset")

    console.log("================================")
    console.log(`🚀 TOTAL /api/chat: ${Date.now() - requestStart}ms`)
    console.log("================================")

    return NextResponse.json({
      reply: aiReply,
      profile,
      projections,
      marketData: {
        cached: false,
        fetchedAt: marketData.fetchedAt,
      },
    })
  } catch (error) {
    console.error("❌ CHAT API ERROR:", error)
    console.error(`Failed after ${Date.now() - requestStart}ms`)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}