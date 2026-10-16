import { GoogleGenAI } from "@google/genai";
import type { AdviceDecision, MarketSignals, Projection, UserProfile, IntentResult } from "./types";
import { buildInvestmentIntakePrompt } from "./prompt/investment-intake";
import { buildAdvisorExplanationPrompt } from "./prompt/advisor-explaination";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const MODEL = "gemini-3.5-flash-lite";
function cleanJson(text: string): string {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  return firstBrace !== -1 && lastBrace !== -1 ? cleaned.substring(firstBrace, lastBrace + 1) : cleaned;
}
function normalizeProfile(profile: unknown): UserProfile {
  const value = profile as Record<string, unknown> | null | undefined;
  return {
    goal: typeof value?.goal === "string" && value.goal.trim() ? value.goal.trim() : undefined,
    goalType: value?.goalType === "wealth_building" || value?.goalType === "target_based" ? value.goalType : undefined,
    targetAmount: typeof value?.targetAmount === "number" && Number.isFinite(value.targetAmount) && value.targetAmount >= 0 ? value.targetAmount : undefined,
    amount: typeof value?.amount === "number" && Number.isFinite(value.amount) && value.amount >= 0 ? value.amount : undefined,
    monthlyIncome: typeof value?.monthlyIncome === "number" && Number.isFinite(value.monthlyIncome) && value.monthlyIncome >= 0 ? value.monthlyIncome : undefined,
    monthlyExpenses: typeof value?.monthlyExpenses === "number" && Number.isFinite(value.monthlyExpenses) && value.monthlyExpenses >= 0 ? value.monthlyExpenses : undefined,
    monthlyInvestment: typeof value?.monthlyInvestment === "number" && Number.isFinite(value.monthlyInvestment) && value.monthlyInvestment >= 0 ? value.monthlyInvestment : undefined,
    duration: typeof value?.duration === "number" && Number.isFinite(value.duration) && value.duration > 0 ? value.duration : undefined,
    risk: value?.risk === "low" || value?.risk === "medium" || value?.risk === "high" ? value.risk : undefined,
    investmentMode: value?.investmentMode === "lump_sum" || value?.investmentMode === "monthly" || value?.investmentMode === "both" ? value.investmentMode : undefined
  };
}
function mergeProfiles(existing: UserProfile, extracted: UserProfile): UserProfile {
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
  };
}
function getMissingFields(profile: UserProfile): string[] {
  const missing: string[] = [];
  if (!profile.goal) missing.push("goal");
  if (!profile.goalType) missing.push("goalType");
  if (profile.goalType === "target_based" && (!profile.targetAmount || profile.targetAmount <= 0)) missing.push("targetAmount");
  if (!profile.duration || profile.duration <= 0) missing.push("duration");
  if (!profile.investmentMode) missing.push("investmentMode");
  if (profile.investmentMode === "lump_sum" && (!profile.amount || profile.amount <= 0)) missing.push("amount");
  if (profile.investmentMode === "monthly" && (!profile.monthlyInvestment || profile.monthlyInvestment <= 0)) missing.push("monthlyInvestment");
  if (profile.investmentMode === "both") {
    if (!profile.amount || profile.amount <= 0) missing.push("amount");
    if (!profile.monthlyInvestment || profile.monthlyInvestment <= 0) missing.push("monthlyInvestment");
  }
  if (!profile.risk) missing.push("risk");
  return missing;
}
function getFallbackQuestion(profile: UserProfile): string {
  if (!profile.goal) return "No worries if you haven't decided yet. Are you mainly looking to grow your savings, save for something specific, or build long-term financial security?";
  if (!profile.goalType) return "Are you looking to build wealth over time or reach a specific financial target?";
  if (!profile.investmentMode) return "Would you prefer to invest monthly, as a lump sum, or combine both?";
  if (profile.goalType === "target_based" && (!profile.targetAmount || profile.targetAmount <= 0)) return "What target amount would you like to work toward, or would you like help estimating one?";
  if (!profile.duration || profile.duration <= 0) return "What time frame are you considering for this goal?";
  if (profile.investmentMode === "lump_sum" && (!profile.amount || profile.amount <= 0)) return "How much do you currently have available to invest as a lump sum?";
  if (profile.investmentMode === "monthly" && (!profile.monthlyInvestment || profile.monthlyInvestment <= 0)) return "How much could you comfortably invest each month?";
  if (profile.investmentMode === "both" && (!profile.amount || profile.amount <= 0)) return "How much would you like to invest as a lump sum?";
  if (profile.investmentMode === "both" && (!profile.monthlyInvestment || profile.monthlyInvestment <= 0)) return "How much could you comfortably invest each month?";
  if (!profile.risk) return "How comfortable are you with investment risk: low, medium, or high?";
  return "What would you like to explore about your investment plan?";
}
export async function extractUserIntent(message: string, existingProfile: UserProfile, conversation: string): Promise<IntentResult> {
  const prompt = buildInvestmentIntakePrompt({ existingProfile, conversation, message });
  console.log("🧠 CONVERSATIONAL INTENT START");
  const start = Date.now();
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json", temperature: 0.4 }
    });
    console.log(`🧠 CONVERSATIONAL INTENT: ${Date.now() - start}ms`);
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    const parsed = JSON.parse(cleanJson(text));
    const extractedProfile = normalizeProfile(parsed?.profile);
    const mergedProfile = mergeProfiles(existingProfile, extractedProfile);
    const missingFields = getMissingFields(mergedProfile);
    const isComplete = missingFields.length === 0;
    const modelReply = typeof parsed?.nextQuestion === "string" ? parsed.nextQuestion.trim() : "";
    const nextQuestion = isComplete ? null : modelReply || getFallbackQuestion(mergedProfile);
    console.log("🧠 Extracted profile:", extractedProfile);
    console.log("🧠 Missing fields:", missingFields);
    console.log("🧠 Complete:", isComplete);
    return { profile: extractedProfile, status: isComplete ? "complete" : "collecting", nextQuestion };
  } catch (error) {
    console.error(`❌ CONVERSATIONAL INTENT FAILED AFTER ${Date.now() - start}ms`, error);
    const missingFields = getMissingFields(existingProfile);
    return {
      profile: existingProfile,
      status: missingFields.length === 0 ? "complete" : "collecting",
      nextQuestion: missingFields.length === 0 ? null : getFallbackQuestion(existingProfile)
    };
  }
}
export async function generateConversationResponse(message: string, profile: UserProfile, conversation: string): Promise<string> {
  const prompt = `
You are a conversational AI investment advisor for Indian users.
Your job in this turn is to answer the user's message naturally. Do not automatically create a new investment recommendation.
CURRENT SAVED PROFILE:
${JSON.stringify(profile, null, 2)}
RECENT CONVERSATION:
${conversation || "(No previous conversation)"}
LATEST USER MESSAGE:
${message}
RULES:
- Be friendly, clear, and concise. Use simple language.
- Use the saved profile and conversation when relevant.
- For a greeting, greet naturally. Do not restart the intake if the user already has a complete saved profile.
- If the user asks about their current plan, explain it using only the available profile facts. Do not invent allocations or returns that are not included in the profile.
- If the user asks what a term means, explain the term rather than generating a new plan.
- If the user asks a hypothetical question, explain that the scenario can be compared separately. Do not claim that the saved profile has changed.
- If the user asks to start a new plan or change goals, ask whether the old goal is achieved, still important, or replaced by a new priority. Do not erase the saved profile.
- If the user expresses concern about affordability, acknowledge it and ask whether their planned contribution is still comfortable. Do not pressure them to invest.
- Never invent income, expenses, risk tolerance, targets, market facts, portfolio allocations, or guaranteed returns.
- Do not claim to have executed an action or saved a change unless the application actually did so.
- This is general educational information, not personalized regulated financial advice or a guarantee of returns.
Return JSON only in this format: {"summary":"Your natural response","table":[],"note":"A short relevant note or empty string"}
`;
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: { responseMimeType: "application/json", temperature: 0.4 }
  });
  const text = response.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!text.trim()) throw new Error("Gemini returned an empty conversational response.");
  const cleaned = cleanJson(text);
  const parsed = JSON.parse(cleaned);
  if (typeof parsed.summary !== "string" || !parsed.summary.trim()) throw new Error("Gemini returned no conversational summary.");
  return parsed.summary.trim();
}
export async function generateAdvisorResponse(decision: AdviceDecision, projections: Projection[], signals: MarketSignals, userMessage: string): Promise<string> {
  const prompt = buildAdvisorExplanationPrompt({ decision, projections, signals, userMessage });
  console.log("🤖 GEMINI EXPLANATION START");
  console.log("Prompt length:", prompt.length, "characters");
  const start = Date.now();
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json", temperature: 0.2 }
    });
    console.log(`🤖 GEMINI EXPLANATION: ${Date.now() - start}ms`);
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    if (!text.trim()) throw new Error("Gemini returned an empty explanation.");
    return cleanJson(text);
  } catch (error) {
    console.error(`❌ GEMINI EXPLANATION FAILED AFTER ${Date.now() - start}ms`, error);
    throw error;
  }
}