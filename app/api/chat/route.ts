import { NextResponse } from "next/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"
import type { UserProfile } from "./_components/types"
import { getMarketData } from "./_components/market-data"
import { getMarketSignals } from "./_components/signals"
import { decisionEngine } from "./_components/decision-engine"
import { createProjections } from "./_components/projections"
import { extractUserIntent,generateAdvisorResponse,generateConversationResponse } from "./_components/gemini"
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)
const MAX_MESSAGE_LENGTH = 4000
const FRESH_PLAN_MARKER = "[[FRESH_PLAN]]"
type MessageIntent = "repeat" | "greeting" | "hypothetical" | "new_plan" | "conversation" | "normal"
type NewPlanChoice = "goal_achieved" | "continue_goal" | "different_priority" | "unknown"
type ChatRecord = { role: string; message: string }
type ProfileRecord = Partial<UserProfile> & { email?: string; status?: "collecting" | "completed" }
function getNewPlanChoice(message: string): NewPlanChoice {
  const text = message.toLowerCase().trim()
  if (/\b(different|new|another|change|changed)\b.*\b(goal|priority|plan|financial|purpose)\b/.test(text) || /\b(different financial priority|new financial priority|start over|start from scratch|fresh start|different goal)\b/.test(text) || /\b(option\s*3|number\s*3|third option)\b/.test(text)) return "different_priority"
  if (/\b(achieved|completed|reached|done with|already met|hit my target)\b.*\b(goal|target|milestone)\b/.test(text) || /\b(goal achieved|i achieved it|i reached it|target reached|i am done with my goal)\b/.test(text) || /\b(option\s*2|number\s*2|second option)\b/.test(text)) return "goal_achieved"
  if (/\b(continue|keep|same|still|carry on|carry forward|work toward|working toward)\b.*\b(goal|plan|target|it|existing)\b/.test(text) || /\b(continue|keep|same|still)\b/.test(text) || /\b(option\s*1|number\s*1|first option)\b/.test(text)) return "continue_goal"
  return "unknown"
}
function getMessageIntent(message: string): MessageIntent {
  const text = message.toLowerCase().trim()
  if (/^(hi|hello|hey|good morning|good afternoon|good evening)[!. ]*$/.test(text)) return "greeting"
  if (/\b(new|different|another|fresh)\s+(investment\s+)?plan\b/.test(text) || /\b(start|restart|reset|erase|clear|forget)\b.*\b(plan|profile|investment|it|everything)\b/.test(text) || /\b(start|begin)\s+(over|again|from scratch)\b/.test(text) || /\bwant a different plan\b/.test(text) || /\bnew financial goal\b/.test(text) || /\bstart fresh\b/.test(text)) return "new_plan"
  if (/\b(repeat|say that again|show that again|previous answer|repeat that)\b/.test(text)) return "repeat"
  if (/\b(what if|suppose|hypothetically|compare another|alternative scenario|what would happen if)\b/.test(text)) return "hypothetical"
  if (/\b(thanks|thank you|who are you|what can you do|how are you)\b/.test(text)) return "conversation"
  return "normal"
}
function getLastAssistantMessage(chats: ChatRecord[]): string | null {
  for (let i = chats.length - 1; i >= 0; i--) {
    if (chats[i].role === "assistant") return chats[i].message
  }
  return null
}
function mergeProfiles(existing: Partial<UserProfile>, extracted: Partial<UserProfile>): UserProfile {
  return {
    goal: extracted.goal ?? existing.goal,
    goalType: extracted.goalType ?? existing.goalType,
    targetAmount: extracted.targetAmount ?? existing.targetAmount,
    amount: extracted.amount ?? existing.amount,
    monthlyIncome: extracted.monthlyIncome ?? existing.monthlyIncome,
    monthlyExpenses: extracted.monthlyExpenses ?? existing.monthlyExpenses,
    monthlyInvestment: extracted.monthlyInvestment ?? existing.monthlyInvestment,
    duration: extracted.duration ?? existing.duration,
    risk: extracted.risk ?? existing.risk,
    investmentMode: extracted.investmentMode ?? existing.investmentMode
  } as UserProfile
}
function sanitizeProfile(profile: UserProfile): UserProfile {
  const safe: Record<string, unknown> = { ...profile }
  if (typeof safe.goal !== "string" || !safe.goal.trim()) delete safe.goal
  if (safe.goalType !== "wealth_building" && safe.goalType !== "target_based") delete safe.goalType
  for (const key of ["targetAmount","amount","monthlyIncome","monthlyExpenses","monthlyInvestment","duration"]) {
    const value = safe[key]
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) delete safe[key]
  }
  if (safe.risk !== "low" && safe.risk !== "medium" && safe.risk !== "high") delete safe.risk
  if (safe.investmentMode !== "lump_sum" && safe.investmentMode !== "monthly" && safe.investmentMode !== "both") delete safe.investmentMode
  return safe as UserProfile
}
function getMissingProfileFields(profile: Partial<UserProfile>): string[] {
  const missing: string[] = []
  if (!profile.goal) missing.push("goal")
  if (!profile.goalType) missing.push("goalType")
  if (profile.goalType === "target_based" && (!profile.targetAmount || profile.targetAmount <= 0)) missing.push("targetAmount")
  if (!profile.duration || profile.duration <= 0) missing.push("duration")
  if (!profile.risk) missing.push("risk")
  if (!profile.investmentMode) missing.push("investmentMode")
  if (profile.investmentMode === "lump_sum" && (!profile.amount || profile.amount <= 0)) missing.push("amount")
  if (profile.investmentMode === "monthly" && (!profile.monthlyInvestment || profile.monthlyInvestment <= 0)) missing.push("monthlyInvestment")
  if (profile.investmentMode === "both") {
    if (!profile.amount || profile.amount <= 0) missing.push("amount")
    if (!profile.monthlyInvestment || profile.monthlyInvestment <= 0) missing.push("monthlyInvestment")
  }
  return missing
}
function getFallbackQuestion(profile: Partial<UserProfile>): string {
  if (!profile.goal) return "What is your financial goal? For example, buying a house, saving for education, or building long-term wealth."
  if (!profile.goalType) return "Are you looking to build wealth over time or reach a specific financial target?"
  if (profile.goalType === "target_based" && (!profile.targetAmount || profile.targetAmount <= 0)) return "What target amount would you like to work toward?"
  if (!profile.duration || profile.duration <= 0) return "What time frame are you considering for this goal, in years?"
  if (!profile.investmentMode) return "Would you prefer to invest monthly, as a lump sum, or combine both?"
  if (profile.investmentMode === "lump_sum" && (!profile.amount || profile.amount <= 0)) return "How much do you currently have available to invest as a lump sum?"
  if (profile.investmentMode === "monthly" && (!profile.monthlyInvestment || profile.monthlyInvestment <= 0)) return "How much could you comfortably invest each month?"
  if (profile.investmentMode === "both" && (!profile.amount || profile.amount <= 0)) return "How much would you like to invest as a lump sum?"
  if (profile.investmentMode === "both" && (!profile.monthlyInvestment || profile.monthlyInvestment <= 0)) return "How much could you comfortably invest each month?"
  if (!profile.risk) return "How comfortable are you with investment risk: low, medium, or high?"
  return "What would you like to clarify about your investment goal?"
}
function createReply(summary: string, note = ""): string {
  return JSON.stringify({ summary, table: [], note })
}
function validateReply(raw: string): string {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed === "string") return createReply(parsed)
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return createReply("I couldn't safely format the generated response. Please try again.")
    const data = parsed as Record<string, unknown>
    if (typeof data.summary !== "string" || !data.summary.trim()) return createReply("I couldn't safely format the generated response. Please try again.")
    return JSON.stringify({
      summary: data.summary.slice(0, 12000),
      table: Array.isArray(data.table) ? data.table.slice(0, 30) : [],
      note: typeof data.note === "string" ? data.note.slice(0, 2000) : ""
    })
  } catch {
    if (!raw.trim()) return createReply("I couldn't generate a response just now. Please try again.")
    return createReply(raw.slice(0, 12000))
  }
}
async function saveMessage(email: string, role: "user" | "assistant", message: string) {
  await convex.mutation(api.chats.saveChat, { email, role, message })
}
async function saveProfile(email: string, profile: UserProfile, status: "collecting" | "completed") {
  await convex.mutation(api.investmentProfiles.upsertProfile, {
    email,
    goal: profile.goal,
    goalType: profile.goalType,
    targetAmount: profile.targetAmount,
    amount: profile.amount,
    monthlyIncome: profile.monthlyIncome,
    monthlyExpenses: profile.monthlyExpenses,
    monthlyInvestment: profile.monthlyInvestment,
    duration: profile.duration,
    risk: profile.risk,
    investmentMode: profile.investmentMode,
    status
  })
}
async function saveSession(email: string, workflowStatus: "idle" | "collecting" | "clarifying_new_plan" | "awaiting_confirmation", pendingIntent?: "collect_profile" | "new_plan_choice" | "confirm_plan", pendingQuestion?: string) {
  await convex.mutation(api.planningSessions.savePlanningSession, {
    email,
    workflowStatus,
    pendingIntent,
    pendingQuestion
  })
}
async function getConversationReply(message: string, profile: UserProfile, conversation: string): Promise<string> {
  const summary = await generateConversationResponse(message, profile, conversation)
  return createReply(summary, "I can explain your saved plan or discuss alternatives. Hypothetical comparisons do not change your saved profile.")
}
function logEvaluation(input: { intent: MessageIntent; missingFields: string[]; freshPlan: boolean; responseValid: boolean; durationMs: number }) {
  console.info("[CHAT_EVAL]", JSON.stringify({
    ...input,
    timestamp: new Date().toISOString()
  }))
}
export async function POST(req: Request) {
  const requestStart = Date.now()
  let messageIntent: MessageIntent = "normal"
  let isFreshPlan = false
  let responseValid = false
  let missingFields: string[] = []
  try {
    const body = await req.json()
    const message = typeof body.message === "string" ? body.message.trim() : ""
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
    if (!message || !email) return NextResponse.json({ error: "Missing message or email" }, { status: 400 })
    if (message.length > MAX_MESSAGE_LENGTH) return NextResponse.json({ error: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.` }, { status: 413 })
    if (email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "A valid email is required." }, { status: 400 })
    const [recentChats, profileRecord, planningSession] = await Promise.all([
      convex.query(api.chats.getRecentChats, { email, limit: 10 }),
      convex.query(api.investmentProfiles.getActiveProfile, { email }),
      convex.query(api.planningSessions.getPlanningSession, { email })
    ])
    const existingProfile = (profileRecord ?? {}) as ProfileRecord
    isFreshPlan = Boolean(
      planningSession?.workflowStatus === "collecting" &&
      planningSession?.pendingIntent === "collect_profile" &&
      planningSession?.pendingQuestion?.includes(FRESH_PLAN_MARKER)
    )
    const currentProfile = (isFreshPlan ? {} : existingProfile) as Partial<UserProfile>
    const currentMissing = getMissingProfileFields(currentProfile)
    const hasCompletedProfile = existingProfile.status === "completed" && currentMissing.length === 0
    messageIntent = getMessageIntent(message)
    const previousConversation = recentChats.map(chat => `${chat.role}: ${chat.message}`).join("\n")
    const conversation = isFreshPlan ? "" : previousConversation
    if (planningSession?.workflowStatus === "clarifying_new_plan") {
      const choice = getNewPlanChoice(message)
      if (choice === "different_priority" || choice === "goal_achieved") {
        await convex.mutation(api.investmentProfiles.resetProfile, { email })
        const replyText = choice === "goal_achieved"
          ? "Congratulations on reaching your previous goal. Let's start a fresh plan for what matters next. What is your new financial goal?"
          : "Sure — we'll start from scratch and won't reuse the previous goal or investment amounts. What is your new financial goal?"
        const pendingQuestion = `${FRESH_PLAN_MARKER} ${replyText}`
        await saveSession(email, "collecting", "collect_profile", pendingQuestion)
        const reply = createReply(replyText, "Your previous profile is not being used for this new plan.")
        await saveMessage(email, "user", message)
        await saveMessage(email, "assistant", reply)
        responseValid = true
        logEvaluation({ intent: messageIntent, missingFields: ["goal"], freshPlan: true, responseValid, durationMs: Date.now() - requestStart })
        return NextResponse.json({ reply, profile: {}, status: "collecting", intent: "new_plan" })
      }
      if (choice === "continue_goal") {
        await saveSession(email, "idle")
        const reply = createReply("Understood — we'll keep your existing goal and saved profile. Tell me what you'd like to update or ask about it.")
        await saveMessage(email, "user", message)
        await saveMessage(email, "assistant", reply)
        responseValid = true
        logEvaluation({ intent: "conversation", missingFields: [], freshPlan: false, responseValid, durationMs: Date.now() - requestStart })
        return NextResponse.json({ reply, profile: existingProfile, status: "conversation", intent: "continue_goal" })
      }
      const replyText = "Please choose one: (1) continue working toward your existing goal, (2) mark that goal as achieved and start fresh, or (3) start fresh with a different financial priority."
      await saveSession(email, "clarifying_new_plan", "new_plan_choice", replyText)
      const reply = createReply(replyText)
      await saveMessage(email, "user", message)
      await saveMessage(email, "assistant", reply)
      responseValid = true
      logEvaluation({ intent: messageIntent, missingFields: [], freshPlan: false, responseValid, durationMs: Date.now() - requestStart })
      return NextResponse.json({ reply, profile: existingProfile, status: "clarifying_new_plan", intent: "new_plan_choice" })
    }
    if (messageIntent === "new_plan" && hasCompletedProfile) {
      const replyText = "Before we build another plan, choose what applies: (1) continue working toward your existing goal, (2) mark that goal as achieved and start fresh, or (3) start fresh with a different financial priority."
      await saveSession(email, "clarifying_new_plan", "new_plan_choice", replyText)
      const reply = createReply(replyText, "Your current profile has not been changed.")
      await saveMessage(email, "user", message)
      await saveMessage(email, "assistant", reply)
      responseValid = true
      logEvaluation({ intent: messageIntent, missingFields: [], freshPlan: false, responseValid, durationMs: Date.now() - requestStart })
      return NextResponse.json({ reply, profile: existingProfile, status: "clarifying_new_plan", intent: "new_plan_choice" })
    }
    if (messageIntent === "repeat") {
      const previousReply = getLastAssistantMessage(recentChats)
      const reply = previousReply ?? createReply("I haven't answered a question yet. What would you like help with?")
      await saveMessage(email, "user", message)
      await saveMessage(email, "assistant", reply)
      responseValid = true
      logEvaluation({ intent: messageIntent, missingFields: currentMissing, freshPlan: isFreshPlan, responseValid, durationMs: Date.now() - requestStart })
      return NextResponse.json({ reply, profile: currentProfile, status: "conversation", intent: messageIntent })
    }
    await saveMessage(email, "user", message)
    if ((messageIntent === "greeting" || messageIntent === "conversation") && hasCompletedProfile) {
      const reply = validateReply(await getConversationReply(message, currentProfile as UserProfile, conversation))
      await saveMessage(email, "assistant", reply)
      responseValid = true
      logEvaluation({ intent: messageIntent, missingFields: [], freshPlan: isFreshPlan, responseValid, durationMs: Date.now() - requestStart })
      return NextResponse.json({ reply, profile: currentProfile, status: "conversation", intent: messageIntent })
    }
    const intentConversation = isFreshPlan ? "" : conversation
    const intent = await extractUserIntent(message, currentProfile as UserProfile, intentConversation)
    const extractedProfile = sanitizeProfile((intent?.profile ?? {}) as UserProfile)
    const workingProfile = sanitizeProfile(mergeProfiles(currentProfile, extractedProfile))
    const isHypothetical = messageIntent === "hypothetical" && hasCompletedProfile && !isFreshPlan
    missingFields = getMissingProfileFields(workingProfile)
    console.info("[CHAT_INTENT]", JSON.stringify({ messageIntent, extractedFields: Object.keys(extractedProfile).filter(key => (extractedProfile as Record<string, unknown>)[key] !== undefined), freshPlan: isFreshPlan, hypothetical: isHypothetical }))
    if (missingFields.length > 0) {
      if (!isHypothetical) {
        await saveProfile(email, workingProfile, "collecting")
        const question = intent?.nextQuestion?.trim() || getFallbackQuestion(workingProfile)
        const pendingQuestion = isFreshPlan ? `${FRESH_PLAN_MARKER} ${question}` : question
        await saveSession(email, "collecting", "collect_profile", pendingQuestion)
      }
      const nextQuestion = intent?.nextQuestion?.trim() || getFallbackQuestion(workingProfile)
      const reply = createReply(nextQuestion, "I need a little more information before creating an investment plan.")
      await saveMessage(email, "assistant", reply)
      responseValid = true
      logEvaluation({ intent: messageIntent, missingFields, freshPlan: isFreshPlan, responseValid, durationMs: Date.now() - requestStart })
      return NextResponse.json({ reply, profile: isHypothetical ? currentProfile : workingProfile, status: "collecting", intent: messageIntent, missingFields })
    }
    const marketData = await getMarketData()
    const signals = getMarketSignals(marketData)
    const decision = decisionEngine(workingProfile, signals)
    console.info("[CHAT_DECISION]", JSON.stringify({ type: decision.type, freshPlan: isFreshPlan, hypothetical: isHypothetical }))
    if (decision.type === "NEED_MORE_INFO") {
      if (!isHypothetical) {
        await saveProfile(email, workingProfile, "collecting")
        await saveSession(email, "collecting", "collect_profile", isFreshPlan ? `${FRESH_PLAN_MARKER} ${decision.message}` : decision.message)
      }
      const reply = createReply(decision.message, "I need a little more information before creating an investment plan.")
      await saveMessage(email, "assistant", reply)
      responseValid = true
      logEvaluation({ intent: messageIntent, missingFields, freshPlan: isFreshPlan, responseValid, durationMs: Date.now() - requestStart })
      return NextResponse.json({ reply, profile: isHypothetical ? currentProfile : workingProfile, status: "collecting", intent: messageIntent })
    }
    const projections = createProjections(decision, workingProfile, workingProfile.duration!)
    const rawAiReply = await generateAdvisorResponse(decision, projections, signals, message)
    let aiReply = validateReply(rawAiReply)
    if (isHypothetical) {
      let summary = "A hypothetical comparison was generated."
      try {
        const parsed = JSON.parse(aiReply) as { summary?: string }
        if (typeof parsed.summary === "string") summary = parsed.summary
      } catch {
        summary = "A hypothetical comparison was generated."
      }
      aiReply = createReply(`Hypothetical comparison only — your saved plan has not been changed.\n\n${summary}`, "This alternative scenario does not replace your saved plan.")
    }
    await saveMessage(email, "assistant", aiReply)
    if (!isHypothetical) {
      await saveProfile(email, workingProfile, "completed")
      await saveSession(email, "idle")
    }
    responseValid = true
    logEvaluation({ intent: messageIntent, missingFields: [], freshPlan: isFreshPlan, responseValid, durationMs: Date.now() - requestStart })
    return NextResponse.json({
      reply: aiReply,
      profile: isHypothetical ? currentProfile : workingProfile,
      projections,
      marketData: { cached: false, fetchedAt: marketData.fetchedAt },
      status: isHypothetical ? "hypothetical" : "completed",
      intent: messageIntent
    })
  } catch (error) {
    console.error("[CHAT_API_ERROR]", error)
    logEvaluation({ intent: messageIntent, missingFields, freshPlan: isFreshPlan, responseValid, durationMs: Date.now() - requestStart })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}