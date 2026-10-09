import type {
  MarketData,
  MarketSignals,
} from "./types"

export function getMarketSignals(
  data: MarketData
): MarketSignals {
  return {
    valuation:
      data.niftyPE > 22
        ? "overvalued"
        : data.niftyPE < 16
        ? "undervalued"
        : "fair",

    inflationRegime:
      data.inflation > 6
        ? "high"
        : "normal",

    rateRegime:
      data.interestRate >= 6.5
        ? "tight"
        : "easy",

    trend: data.trend,
  }
}
