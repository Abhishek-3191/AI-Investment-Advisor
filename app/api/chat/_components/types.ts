import type { Asset } from "../_data/assets"

export type UserProfile = {
  goal?: string
  goalType?: "wealth_building" | "target_based"
  targetAmount?: number
  amount?: number
  monthlyIncome?: number
  monthlyExpenses?: number
  monthlyInvestment?: number
  duration?: number
  risk?: "low" | "medium" | "high"
  investmentMode?: "lump_sum" | "monthly" | "both"
}

export type IntentResult = {
  profile: UserProfile
  status: "collecting" | "complete"
  nextQuestion: string | null
}

export type MarketData = {
  niftyPoint: number
  niftyPE: number
  inflation: number
  interestRate: number
  trend: "bullish" | "bearish" | "neutral"
  fetchedAt: string
}

export type MarketSignals = {
  valuation: "overvalued" | "undervalued" | "fair"
  inflationRegime: "high" | "normal"
  rateRegime: "tight" | "easy"
  trend: "bullish" | "bearish" | "neutral"
}

export type AllocationItem = {
  asset: string
  percent: number
  score: number
  expectedReturn: number
}

export type AdviceDecision = {
  type: "ADVICE"
  context: string
  allocation: AllocationItem[]
  signals: MarketSignals
}

export type NeedInfoDecision = {
  type: "NEED_MORE_INFO"
  message: string
}

export type DecisionResult = AdviceDecision | NeedInfoDecision

export type Projection = {
  asset: string
  invested: number
  expectedReturn: number
  futureValue: number
  percent: number
}

export type ScoredAsset = Asset & {
  score: number
}
