import { ASSETS, type Asset } from "../_data/assets"
import { getPortfolioTargets } from "./portfolio-targets"
import type {
  AdviceDecision,
  DecisionResult,
  MarketSignals,
  ScoredAsset,
  UserProfile,
} from "./types"

const MAX_ASSET_ALLOCATION = {
  low: 25,
  medium: 30,
  high: 35,
} as const

function scoreAsset(
  asset: Asset,
  risk: NonNullable<UserProfile["risk"]>,
  duration: number,
  signals: MarketSignals
) {
  let score = asset.base

  // Prototype assumption. This influences ranking only.
  score += (asset.expectedReturn - 9) * 0.1

  if (
    signals.trend === "bullish" &&
    asset.portfolioCategory === "equity"
  ) {
    score += 0.6
  }

  if (
    signals.trend === "bearish" &&
    asset.portfolioCategory === "debt"
  ) {
    score += 0.6
  }

  if (
    signals.inflationRegime === "high" &&
    asset.portfolioCategory === "gold"
  ) {
    score += 0.7
  }

  if (risk === "high") {
    if (asset.riskLevel === "high") score += 0.5
    if (asset.riskLevel === "moderate") score += 0.3
  }

  if (risk === "medium") {
    if (asset.riskLevel === "moderate") score += 0.5
    if (asset.riskLevel === "high") score += 0.2
    if (asset.riskLevel === "low") score += 0.1
  }

  if (risk === "low") {
    if (asset.riskLevel === "low") score += 0.6
    if (asset.riskLevel === "moderate") score += 0.2
  }

  if (duration < 1) {
    if (asset.portfolioCategory === "debt") score += 1.0
    if (asset.portfolioCategory === "gold") score += 0.3
    if (asset.portfolioCategory === "equity") score -= 0.8
  } else if (duration < 3) {
    if (asset.portfolioCategory === "debt") score += 0.7
    if (asset.portfolioCategory === "gold") score += 0.3
    if (asset.portfolioCategory === "equity") score -= 0.4
  } else if (duration <= 5) {
    score += 0.2
  } else if (duration <= 10) {
    if (asset.portfolioCategory === "equity") score += 0.6
    if (asset.portfolioCategory === "gold") score += 0.3
    if (asset.portfolioCategory === "debt") score += 0.1
  } else {
    if (asset.portfolioCategory === "equity") score += 0.8
    if (asset.portfolioCategory === "gold") score += 0.3
  }

  return Math.max(score, 0.01)
}

function requiredAssetCount(
  targetPercent: number,
  maxAssetAllocation: number
) {
  return targetPercent === 0
    ? 0
    : Math.ceil(targetPercent / maxAssetAllocation)
}

function selectAssets(
  assets: ScoredAsset[],
  targetPercent: number,
  maxAssetAllocation: number
) {
  const count = requiredAssetCount(
    targetPercent,
    maxAssetAllocation
  )

  return assets
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
}

function allocateCategory(
  assets: ScoredAsset[],
  targetPercent: number,
  maxAssetAllocation: number
) {
  if (targetPercent === 0) return []

  if (assets.length === 0) {
    throw new Error(
      `No assets available for category target ${targetPercent}%`
    )
  }

  const totalScore = assets.reduce(
    (sum, asset) => sum + asset.score,
    0
  )

  const result = assets.map(asset => ({
    asset: asset.name,
    percent: Math.min(
      Math.floor(
        (asset.score / totalScore) *
          targetPercent
      ),
      maxAssetAllocation
    ),
    score: asset.score,
    expectedReturn: asset.expectedReturn,
  }))

  let remaining =
    targetPercent -
    result.reduce(
      (sum, item) => sum + item.percent,
      0
    )

  while (remaining > 0) {
    const candidates = result
      .map((item, index) => ({
        item,
        index,
      }))
      .filter(
        ({ item }) =>
          item.percent < maxAssetAllocation
      )
      .sort(
        (a, b) =>
          b.item.score - a.item.score
      )

    if (candidates.length === 0) {
      throw new Error(
        `Cannot satisfy ${targetPercent}% category target with ${assets.length} assets and ${maxAssetAllocation}% cap`
      )
    }

    result[candidates[0].index].percent += 1
    remaining -= 1
  }

  return result
}

function validateInvestmentMode(
  profile: UserProfile
): string | null {
  if (!profile.investmentMode) {
    return "Please choose whether you want to invest monthly, as a lump sum, or both."
  }

  if (profile.investmentMode === "lump_sum") {
    if (
      profile.amount === undefined ||
      profile.amount <= 0
    ) {
      return "Please provide the amount you currently have available to invest as a lump sum."
    }
  }

  if (profile.investmentMode === "monthly") {
    if (
      profile.monthlyInvestment === undefined ||
      profile.monthlyInvestment <= 0
    ) {
      return "Please provide how much you would like to invest every month."
    }
  }

  if (profile.investmentMode === "both") {
    if (
      profile.amount === undefined ||
      profile.amount <= 0
    ) {
      return "Please provide the lump-sum amount you currently have available to invest."
    }

    if (
      profile.monthlyInvestment === undefined ||
      profile.monthlyInvestment <= 0
    ) {
      return "Please provide how much you would like to invest every month."
    }
  }

  return null
}

export function decisionEngine(
  profile: UserProfile,
  signals: MarketSignals
): DecisionResult {
  const { duration, risk } = profile

  if (duration === undefined || duration <= 0) {
    return {
      type: "NEED_MORE_INFO",
      message:
        "Please provide your investment time horizon.",
    }
  }

  if (!risk) {
    return {
      type: "NEED_MORE_INFO",
      message:
        "What level of investment risk are you comfortable with: low, medium, or high?",
    }
  }

  const investmentModeError =
    validateInvestmentMode(profile)

  if (investmentModeError) {
    return {
      type: "NEED_MORE_INFO",
      message: investmentModeError,
    }
  }

  const maxAssetAllocation =
    MAX_ASSET_ALLOCATION[risk]

  const filteredAssets = ASSETS.filter(
    asset => {
      if (
        risk === "low" &&
        asset.riskLevel === "high"
      ) {
        return false
      }

      if (
        duration <= 3 &&
        asset.riskLevel === "high"
      ) {
        return false
      }

      return true
    }
  )

  const scored = filteredAssets
    .map(asset => ({
      ...asset,
      score: scoreAsset(
        asset,
        risk,
        duration,
        signals
      ),
    }))
    .sort((a, b) => b.score - a.score)

  const targets = getPortfolioTargets(
    duration,
    risk
  )

  const equityAssets = scored.filter(
    asset =>
      asset.portfolioCategory === "equity"
  )

  const debtAssets = scored.filter(
    asset =>
      asset.portfolioCategory === "debt"
  )

  const goldAssets = scored.filter(
    asset =>
      asset.portfolioCategory === "gold"
  )

  const selectedEquity = selectAssets(
    equityAssets,
    targets.equity,
    maxAssetAllocation
  )

  const selectedDebt = selectAssets(
    debtAssets,
    targets.debt,
    maxAssetAllocation
  )

  const selectedGold = selectAssets(
    goldAssets,
    targets.gold,
    maxAssetAllocation
  )

  const allocation = [
    ...allocateCategory(
      selectedEquity,
      targets.equity,
      maxAssetAllocation
    ),
    ...allocateCategory(
      selectedDebt,
      targets.debt,
      maxAssetAllocation
    ),
    ...allocateCategory(
      selectedGold,
      targets.gold,
      maxAssetAllocation
    ),
  ]

  const finalTotal = allocation.reduce(
    (sum, item) => sum + item.percent,
    0
  )

  if (finalTotal !== 100) {
    throw new Error(
      `Invalid portfolio allocation: ${finalTotal}%`
    )
  }

  if (
    allocation.some(
      item =>
        item.percent > maxAssetAllocation
    )
  ) {
    throw new Error(
      "Invalid portfolio allocation: asset exceeds maximum allocation"
    )
  }

  return {
    type: "ADVICE",
    context:
      "AI-selected portfolio using deterministic scoring, portfolio targets, and market signals",
    allocation,
    signals,
  } satisfies AdviceDecision
}