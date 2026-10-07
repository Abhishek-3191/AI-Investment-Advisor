export type AssetCategory = "equity" | "international" | "gold" | "debt"
export type PortfolioCategory = "equity" | "gold" | "debt"
export type RiskLevel = "low" | "moderate" | "high"

export type Asset = {
  name: string
  category: AssetCategory
  portfolioCategory: PortfolioCategory
  riskLevel: RiskLevel
  expectedReturn: number
  base: number
  instrumentType: "Mutual Fund" | "ETF"
}

export const ASSETS: Asset[] = [
  {
    name: "Nifty 50",
    category: "equity",
    portfolioCategory: "equity",
    riskLevel: "moderate",
    expectedReturn: 12,
    base: 1.0,
    instrumentType: "Mutual Fund",
  },
  {
    name: "Flexi Cap Fund",
    category: "equity",
    portfolioCategory: "equity",
    riskLevel: "moderate",
    expectedReturn: 11,
    base: 1.1,
    instrumentType: "Mutual Fund",
  },
  {
    name: "Midcap Fund",
    category: "equity",
    portfolioCategory: "equity",
    riskLevel: "high",
    expectedReturn: 13,
    base: 1.2,
    instrumentType: "Mutual Fund",
  },
  {
    name: "Small Cap Fund",
    category: "equity",
    portfolioCategory: "equity",
    riskLevel: "high",
    expectedReturn: 14,
    base: 1.3,
    instrumentType: "Mutual Fund",
  },
  {
    name: "Banking Sector Fund",
    category: "equity",
    portfolioCategory: "equity",
    riskLevel: "high",
    expectedReturn: 12,
    base: 1.15,
    instrumentType: "Mutual Fund",
  },
  {
    name: "US Index Fund",
    category: "international",
    portfolioCategory: "equity",
    riskLevel: "moderate",
    expectedReturn: 10,
    base: 1.0,
    instrumentType: "Mutual Fund",
  },
  {
    name: "Gold ETF",
    category: "gold",
    portfolioCategory: "gold",
    riskLevel: "moderate",
    expectedReturn: 9,
    base: 1.0,
    instrumentType: "ETF",
  },
  {
    name: "Silver ETF",
    category: "gold",
    portfolioCategory: "gold",
    riskLevel: "high",
    expectedReturn: 10,
    base: 1.1,
    instrumentType: "ETF",
  },
  {
    name: "Corporate Bond Fund",
    category: "debt",
    portfolioCategory: "debt",
    riskLevel: "low",
    expectedReturn: 7,
    base: 1.0,
    instrumentType: "Mutual Fund",
  },
  {
    name: "Liquid Fund",
    category: "debt",
    portfolioCategory: "debt",
    riskLevel: "low",
    expectedReturn: 7,
    base: 0.9,
    instrumentType: "Mutual Fund",
  },
  {
    name: "Short Duration Debt Fund",
    category: "debt",
    portfolioCategory: "debt",
    riskLevel: "low",
    expectedReturn: 7,
    base: 0.95,
    instrumentType: "Mutual Fund",
  },
  {
    name: "Government Bond Fund",
    category: "debt",
    portfolioCategory: "debt",
    riskLevel: "low",
    expectedReturn: 7,
    base: 0.95,
    instrumentType: "Mutual Fund",
  },
]
