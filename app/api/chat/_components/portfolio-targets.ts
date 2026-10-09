import type { UserProfile } from "./types"

export type PortfolioTargets = {
  equity: number
  debt: number
  gold: number
}

export function getPortfolioTargets(
  duration: number,
  risk: NonNullable<UserProfile["risk"]>
): PortfolioTargets {
  if (duration < 1) {
    // Keep the V1 portfolio within a maximum of 5 assets.
    if (risk === "low") {
      return { equity: 0, debt: 85, gold: 15 }
    }

    return {
      equity: risk === "high" ? 15 : 5,
      debt: risk === "high" ? 70 : 80,
      gold: 15,
    }
  }

  if (duration < 3) {
    return {
      equity:
        risk === "high"
          ? 30
          : risk === "medium"
          ? 20
          : 10,
      debt:
        risk === "high"
          ? 50
          : risk === "medium"
          ? 60
          : 70,
      gold: 20,
    }
  }

  if (duration <= 5) {
    return {
      equity:
        risk === "high"
          ? 70
          : risk === "medium"
          ? 55
          : 30,
      debt:
        risk === "high"
          ? 15
          : risk === "medium"
          ? 30
          : 50,
      gold:
        risk === "low" ? 20 : 15,
    }
  }

  if (duration <= 10) {
    return {
      equity:
        risk === "high"
          ? 80
          : risk === "medium"
          ? 65
          : 45,
      debt:
        risk === "high"
          ? 10
          : risk === "medium"
          ? 20
          : 40,
      gold:
        risk === "high" ? 10 : 15,
    }
  }

  return {
    equity:
      risk === "high"
        ? 85
        : risk === "medium"
        ? 70
        : 50,
    debt:
      risk === "high"
        ? 5
        : risk === "medium"
        ? 15
        : 35,
    gold:
      risk === "high" ? 10 : 15,
  }
}

export function assertTargets(
  targets: PortfolioTargets
) {
  const total =
    targets.equity +
    targets.debt +
    targets.gold

  if (total !== 100) {
    throw new Error(
      `Portfolio targets must equal 100%, got ${total}%`
    )
  }
}
