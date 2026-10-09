import { NextResponse } from "next/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"
import type { UserProfile } from "./_components/types"

import { getMarketData } from "./_components/market-data"
import { getMarketSignals } from "./_components/signals"
import { decisionEngine } from "./_components/decision-engine"
import { createProjections } from "./_components/projections"
import {
  extractUserIntent,
  generateAdvisorResponse,
} from "./_components/gemini"

const convex = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!
)

function mergeProfiles(
  existing: UserProfile,
  extracted: UserProfile
): UserProfile {
  return {
    goal:
      extracted.goal ??
      existing.goal,

    goalType:
      extracted.goalType ??
      existing.goalType,

    targetAmount:
      extracted.targetAmount ??
      existing.targetAmount,

    amount:
      extracted.amount ??
      existing.amount,

    monthlyIncome:
      extracted.monthlyIncome ??
      existing.monthlyIncome,

    monthlyExpenses:
      extracted.monthlyExpenses ??
      existing.monthlyExpenses,

    monthlyInvestment:
      extracted.monthlyInvestment ??
      existing.monthlyInvestment,

    duration:
      extracted.duration ??
      existing.duration,

    risk:
      extracted.risk ??
      existing.risk,

    investmentMode:
      extracted.investmentMode ??
      existing.investmentMode,
  }
}

/**
 * Backend source of truth for profile completeness.
 *
 * Gemini extracts information.
 * Backend decides whether enough information exists
 * to safely run the deterministic investment engine.
 */
function getMissingProfileFields(
  profile: UserProfile
): string[] {
  const missing: string[] = []

  if (!profile.goal) {
    missing.push("goal")
  }

  if (!profile.goalType) {
    missing.push("goalType")
  }

  /**
   * Target amount is ONLY required when the user
   * has a specific financial target.
   *
   * Example:
   * "I want to reach ₹1 crore"
   *
   * But NOT:
   * "I want to build long-term wealth."
   */
  if (
    profile.goalType === "target_based" &&
    (
      profile.targetAmount === undefined ||
      profile.targetAmount <= 0
    )
  ) {
    missing.push("targetAmount")
  }

  if (
    profile.duration === undefined ||
    profile.duration <= 0
  ) {
    missing.push("duration")
  }

  if (!profile.risk) {
    missing.push("risk")
  }

  if (!profile.investmentMode) {
    missing.push("investmentMode")
  }

  /**
   * Investment mode validation.
   */
  if (
    profile.investmentMode === "lump_sum"
  ) {
    if (
      profile.amount === undefined ||
      profile.amount <= 0
    ) {
      missing.push("amount")
    }
  }

  if (
    profile.investmentMode === "monthly"
  ) {
    if (
      profile.monthlyInvestment === undefined ||
      profile.monthlyInvestment <= 0
    ) {
      missing.push("monthlyInvestment")
    }
  }

  if (
    profile.investmentMode === "both"
  ) {
    if (
      profile.amount === undefined ||
      profile.amount <= 0
    ) {
      missing.push("amount")
    }

    if (
      profile.monthlyInvestment === undefined ||
      profile.monthlyInvestment <= 0
    ) {
      missing.push("monthlyInvestment")
    }
  }

  return missing
}

/**
 * Fallback question generator.
 *
 * This is only used when Gemini does not provide
 * a useful next question.
 */
function getFallbackQuestion(
  profile: UserProfile
): string {
  if (!profile.goal) {
    return "What are you hoping to achieve with this money?"
  }

  if (!profile.goalType) {
    return "Are you mainly trying to build long-term wealth, or are you trying to reach a specific financial target?"
  }

  if (
    profile.goalType === "target_based" &&
    (
      profile.targetAmount === undefined ||
      profile.targetAmount <= 0
    )
  ) {
    return "What exact amount would you like to reach for this goal?"
  }

  if (
    profile.duration === undefined ||
    profile.duration <= 0
  ) {
    return "How long are you comfortable keeping this money invested?"
  }

  if (!profile.investmentMode) {
    return "Would you like to invest this as a lump sum, monthly, or both?"
  }

  if (
    profile.investmentMode === "lump_sum" &&
    (
      profile.amount === undefined ||
      profile.amount <= 0
    )
  ) {
    return "How much do you currently have available to invest as a lump sum?"
  }

  if (
    profile.investmentMode === "monthly" &&
    (
      profile.monthlyInvestment === undefined ||
      profile.monthlyInvestment <= 0
    )
  ) {
    return "Approximately how much would you like to invest every month?"
  }

  if (
    profile.investmentMode === "both"
  ) {
    if (
      profile.amount === undefined ||
      profile.amount <= 0
    ) {
      return "How much would you like to invest as a lump sum right now?"
    }

    if (
      profile.monthlyInvestment === undefined ||
      profile.monthlyInvestment <= 0
    ) {
      return "Approximately how much would you like to invest every month?"
    }
  }

  if (!profile.risk) {
    return "What level of investment risk are you comfortable with: low, medium, or high?"
  }

  return "Could you tell me anything else about your investment plan?"
}

export async function POST(req: Request) {
  const requestStart = Date.now()

  try {
    const {
      message,
      email,
    } = await req.json()

    console.log("================================")
    console.log("🚀 CHAT REQUEST START")
    console.log("================================")

    if (!message || !email) {
      return NextResponse.json(
        {
          error:
            "Missing message or email",
        },
        {
          status: 400,
        }
      )
    }

    // --------------------------------------------------
    // 1. SAVE USER MESSAGE
    // --------------------------------------------------

    const saveUserStart =
      Date.now()

    await convex.mutation(
      api.chats.saveChat,
      {
        email,
        role: "user",
        message,
      }
    )

    console.log(
      `💾 Convex save user: ${
        Date.now() - saveUserStart
      }ms`
    )

    // --------------------------------------------------
    // 2. GET ACTIVE INVESTMENT PROFILE
    // --------------------------------------------------

    const profileStart =
      Date.now()

    const existingProfile =
      await convex.query(
        api.investmentProfiles
          .getActiveProfile,
        {
          email,
        }
      )

    console.log(
      `📋 Active profile fetch: ${
        Date.now() - profileStart
      }ms`
    )

    // --------------------------------------------------
    // 3. GET RECENT CONVERSATION
    // --------------------------------------------------

    const recentChats =
      await convex.query(
        api.chats.getRecentChats,
        {
          email,
          limit: 10,
        }
      )

    const conversation =
      recentChats
        .map(
          chat =>
            `${chat.role}: ${chat.message}`
        )
        .join("\n")

    console.log(
      `💬 Recent conversation messages: ${
        recentChats.length
      }`
    )

    // --------------------------------------------------
    // 4. GEMINI CONVERSATIONAL INTAKE
    // --------------------------------------------------

    const intentStart =
      Date.now()

    const intent =
      await extractUserIntent(
        message,
        existingProfile ?? {},
        conversation
      )

    console.log(
      `🧠 Conversational intent: ${
        Date.now() - intentStart
      }ms`
    )

    console.log(
      "🧠 Gemini intent:",
      intent
    )

    // --------------------------------------------------
    // 5. MERGE PROFILE
    // --------------------------------------------------

    const profile =
      mergeProfiles(
        existingProfile ?? {},
        intent.profile
      )

    console.log(
      "🧠 Active profile:",
      profile
    )

    // --------------------------------------------------
    // 6. BACKEND COMPLETENESS CHECK
    // --------------------------------------------------

    /**
     * IMPORTANT:
     *
     * Do NOT trust:
     *
     * intent.status
     *
     * Gemini is only responsible for extraction.
     *
     * The backend decides whether the profile
     * is complete enough to run the investment engine.
     */
    const missingFields =
      getMissingProfileFields(
        profile
      )

    const isProfileComplete =
      missingFields.length === 0

    console.log(
      "🧠 Missing profile fields:",
      missingFields
    )

    console.log(
      "🧠 Backend profile complete:",
      isProfileComplete
    )

    // --------------------------------------------------
    // 7. STILL COLLECTING INFORMATION
    // --------------------------------------------------

    if (!isProfileComplete) {
      await convex.mutation(
        api.investmentProfiles
          .upsertProfile,
        {
          email,
          goal: profile.goal,
          goalType:
            profile.goalType,
          targetAmount:
            profile.targetAmount,
          amount:
            profile.amount,
          monthlyIncome:
            profile.monthlyIncome,
          monthlyExpenses:
            profile.monthlyExpenses,
          monthlyInvestment:
            profile.monthlyInvestment,
          duration:
            profile.duration,
          risk:
            profile.risk,
          investmentMode:
            profile.investmentMode,
          status: "collecting",
        }
      )

      /**
       * Prefer Gemini's question because it has
       * conversation context.
       *
       * But if Gemini fails to provide one,
       * use our deterministic fallback.
       */
      const nextQuestion =
        intent.nextQuestion?.trim() ||
        getFallbackQuestion(
          profile
        )

      const reply =
        JSON.stringify({
          summary:
            nextQuestion,
          table: [],
          note:
            "I need a little more information before creating your investment plan.",
        })

      await convex.mutation(
        api.chats.saveChat,
        {
          email,
          role: "assistant",
          message: reply,
        }
      )

      console.log(
        "⏸️ Waiting for more user information"
      )

      console.log(
        `🚀 TOTAL REQUEST: ${
          Date.now() - requestStart
        }ms`
      )

      return NextResponse.json({
        reply,
        profile,
        status: "collecting",
      })
    }

    // --------------------------------------------------
    // 8. PROFILE COMPLETE
    // --------------------------------------------------

    console.log(
      "✅ Investment profile complete"
    )

    await convex.mutation(
      api.investmentProfiles
        .upsertProfile,
      {
        email,
        goal: profile.goal,
        goalType:
          profile.goalType,
        targetAmount:
          profile.targetAmount,
        amount:
          profile.amount,
        monthlyIncome:
          profile.monthlyIncome,
        monthlyExpenses:
          profile.monthlyExpenses,
        monthlyInvestment:
          profile.monthlyInvestment,
        duration:
          profile.duration,
        risk:
          profile.risk,
        investmentMode:
          profile.investmentMode,
        status: "completed",
      }
    )

    // --------------------------------------------------
    // 9. MARKET DATA
    // --------------------------------------------------

    const marketStart =
      Date.now()

    const marketData =
      await getMarketData()

    console.log(
      `📈 Market data: ${
        Date.now() - marketStart
      }ms`
    )

    // --------------------------------------------------
    // 10. MARKET SIGNALS
    // --------------------------------------------------

    const signalsStart =
      Date.now()

    const signals =
      getMarketSignals(
        marketData
      )

    console.log(
      `📊 Market signals: ${
        Date.now() - signalsStart
      }ms`
    )

    // --------------------------------------------------
    // 11. DETERMINISTIC DECISION ENGINE
    // --------------------------------------------------

    const decisionStart =
      Date.now()

    const decision =
      decisionEngine(
        profile,
        signals
      )

    console.log(
      `⚙️ Decision engine: ${
        Date.now() - decisionStart
      }ms`
    )

    console.log(
      "Decision:",
      decision
    )

    // --------------------------------------------------
    // 12. SAFETY CHECK
    // --------------------------------------------------

    if (
      decision.type ===
      "NEED_MORE_INFO"
    ) {
      const reply =
        JSON.stringify({
          summary:
            decision.message,
          table: [],
          note:
            "I need a little more information before creating your investment plan.",
        })

      await convex.mutation(
        api.chats.saveChat,
        {
          email,
          role: "assistant",
          message: reply,
        }
      )

      console.log(
        `🚀 TOTAL REQUEST: ${
          Date.now() - requestStart
        }ms`
      )

      return NextResponse.json({
        reply,
        profile,
        status: "collecting",
      })
    }

    // --------------------------------------------------
    // 13. PROJECTIONS
    // --------------------------------------------------

    const projectionStart =
      Date.now()

    const projections =
      createProjections(
        decision,
        profile,
        profile.duration!
      )

    console.log(
      `📈 Projections: ${
        Date.now() - projectionStart
      }ms`
    )

    // --------------------------------------------------
    // 14. GEMINI EXPLANATION
    // --------------------------------------------------

    const geminiStart =
      Date.now()

    const aiReply =
      await generateAdvisorResponse(
        decision,
        projections,
        signals,
        message
      )

    console.log(
      `🤖 Gemini total: ${
        Date.now() - geminiStart
      }ms`
    )

    // --------------------------------------------------
    // 15. SAVE FINAL ASSISTANT RESPONSE
    // --------------------------------------------------

    const saveAssistantStart =
      Date.now()

    await convex.mutation(
      api.chats.saveChat,
      {
        email,
        role: "assistant",
        message: aiReply,
      }
    )

    console.log(
      `💾 Convex save assistant: ${
        Date.now() -
        saveAssistantStart
      }ms`
    )

    // --------------------------------------------------
    // 16. RESET ACTIVE PROFILE
    // --------------------------------------------------

    await convex.mutation(
      api.investmentProfiles
        .resetProfile,
      {
        email,
      }
    )

    console.log(
      "♻️ Active investment profile reset"
    )

    console.log(
      "================================"
    )

    console.log(
      `🚀 TOTAL /api/chat: ${
        Date.now() - requestStart
      }ms`
    )

    console.log(
      "================================"
    )

    // --------------------------------------------------
    // 17. RESPONSE
    // --------------------------------------------------

    return NextResponse.json({
      reply: aiReply,
      profile,
      projections,
      marketData: {
        cached: false,
        fetchedAt:
          marketData.fetchedAt,
      },
      status: "completed",
    })
  } catch (error) {
    console.error(
      "❌ CHAT API ERROR:",
      error
    )

    console.error(
      `Failed after ${
        Date.now() - requestStart
      }ms`
    )

    return NextResponse.json(
      {
        error:
          "Internal server error",
      },
      {
        status: 500,
      }
    )
  }
}