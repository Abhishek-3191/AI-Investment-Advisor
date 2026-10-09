import type {
  AdviceDecision,
  Projection,
  UserProfile,
} from "./types"
import { ASSETS } from "../_data/assets"

export function calculateFutureValue(
  principal: number,
  rate: number,
  years: number
) {
  return Math.round(
    principal *
      Math.pow(1 + rate / 100, years)
  )
}

export function calculateSipFutureValue(
  monthlyInvestment: number,
  annualReturn: number,
  years: number
) {
  const months = Math.round(years * 12)
  const monthlyRate =
    annualReturn / 100 / 12

  if (months <= 0) {
    return 0
  }

  if (monthlyRate === 0) {
    return Math.round(
      monthlyInvestment * months
    )
  }

  return Math.round(
    monthlyInvestment *
      (
        (Math.pow(
          1 + monthlyRate,
          months
        ) -
          1) /
        monthlyRate
      )
  )
}

export function createProjections(
  decision: AdviceDecision,
  profile: UserProfile,
  duration: number
): Projection[] {
  if (
    profile.investmentMode === "lump_sum" &&
    profile.amount === undefined
  ) {
    throw new Error(
      "Lump-sum amount is required for lump-sum projections"
    )
  }

  if (
    profile.investmentMode === "monthly" &&
    profile.monthlyInvestment === undefined
  ) {
    throw new Error(
      "Monthly investment is required for monthly projections"
    )
  }

  if (
    profile.investmentMode === "both" &&
    (
      profile.amount === undefined ||
      profile.monthlyInvestment === undefined
    )
  ) {
    throw new Error(
      "Both lump-sum and monthly investment are required"
    )
  }

  return decision.allocation.map(
    allocation => {
      const metadata = ASSETS.find(
        asset =>
          asset.name === allocation.asset
      )

      if (!metadata) {
        throw new Error(
          `Missing asset metadata: ${allocation.asset}`
        )
      }

      const expectedReturn =
        metadata.expectedReturn

      let invested = 0
      let futureValue = 0

      if (
        profile.investmentMode === "lump_sum"
      ) {
        invested =
          (profile.amount! *
            allocation.percent) /
          100

        futureValue =
          calculateFutureValue(
            invested,
            expectedReturn,
            duration
          )
      }

      if (
        profile.investmentMode === "monthly"
      ) {
        invested =
          profile.monthlyInvestment! *
          12 *
          duration *
          allocation.percent /
          100

        const monthlyAllocation =
          (profile.monthlyInvestment! *
            allocation.percent) /
          100

        futureValue =
          calculateSipFutureValue(
            monthlyAllocation,
            expectedReturn,
            duration
          )
      }

      if (
        profile.investmentMode === "both"
      ) {
        const lumpSumAllocation =
          (profile.amount! *
            allocation.percent) /
          100

        const monthlyAllocation =
          (profile.monthlyInvestment! *
            allocation.percent) /
          100

        const lumpSumFutureValue =
          calculateFutureValue(
            lumpSumAllocation,
            expectedReturn,
            duration
          )

        const monthlyFutureValue =
          calculateSipFutureValue(
            monthlyAllocation,
            expectedReturn,
            duration
          )

        invested =
          lumpSumAllocation +
          monthlyAllocation *
            12 *
            duration

        futureValue =
          lumpSumFutureValue +
          monthlyFutureValue
      }

      return {
        asset: allocation.asset,
        invested,
        expectedReturn,
        futureValue,
        percent: allocation.percent,
      }
    }
  )
}

export function getAssetMetadata(
  assetName: string
) {
  return ASSETS.find(
    asset => asset.name === assetName
  )
}