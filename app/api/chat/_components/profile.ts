// import { UserProfile } from "./types"
// export function extractUserProfile(message: string): UserProfile {
//   const amountMatch = message.match(/(\d+)\s?(k|lakh|lac|crore)?/i)
//   const durationMatch = message.match(/(\d+)\s?(year|years)/i)

//   let amount
//   if (amountMatch) {
//     let val = parseInt(amountMatch[1])
//     const unit = amountMatch[2]?.toLowerCase()

//     if (unit === "k") val *= 1000
//     if (unit === "lakh" || unit === "lac") val *= 100000
//     if (unit === "crore") val *= 10000000

//     amount = val
//   }

//   return {
//     amount,
//     duration: durationMatch ? parseInt(durationMatch[1]) : undefined,
//     risk: message.toLowerCase().includes("high")
//       ? "high"
//       : message.toLowerCase().includes("low")
//       ? "low"
//       : message.toLowerCase().includes("medium")
//       ? "medium" 
//       : undefined,
//     goal: message,
//   }
// }

import type { UserProfile } from "./types"

export function extractUserProfile(
  message: string
): UserProfile {
  const goal = extractGoal(message)
  const amount = extractAmount(message)
  const duration = extractDuration(message)
  const risk = extractRisk(message)

  return {
    goal,
    amount,
    duration,
    risk,
  }
}

// --------------------------------------------------
// Amount
// --------------------------------------------------

function extractAmount(
  message: string
): number | undefined {
  const patterns = [
    // amount is ₹20,00,000
    /(?:amount|investment\s+amount)\s*(?:is|:|=)?\s*(?:₹\s*)?([\d,]+(?:\.\d+)?)\s*(k|thousand|lakh|lac|crore)?/i,

    // investment amount of ₹20 lakh
    /(?:investment\s+amount|amount)\s+(?:of\s+)?(?:₹\s*)?([\d,]+(?:\.\d+)?)\s*(k|thousand|lakh|lac|crore)?/i,

    // I have ₹20 lakh to invest
    /(?:i\s+have|have)\s+(?:₹\s*)?([\d,]+(?:\.\d+)?)\s*(k|thousand|lakh|lac|crore)?\s+(?:to\s+)?invest/i,

    // I want to invest ₹20 lakh
    /(?:i\s+want\s+to\s+)?invest\s+(?:₹\s*)?([\d,]+(?:\.\d+)?)\s*(k|thousand|lakh|lac|crore)?/i,

    // investing ₹20 lakh
    /(?:investing|investment)\s+(?:of\s+)?(?:₹\s*)?([\d,]+(?:\.\d+)?)\s*(k|thousand|lakh|lac|crore)?/i,

    // lump sum of ₹20 lakh
    /lump[\s-]*sum\s+(?:of\s+)?(?:₹\s*)?([\d,]+(?:\.\d+)?)\s*(k|thousand|lakh|lac|crore)?/i,

    // ₹20 lakh to invest
    /(?:₹\s*)?([\d,]+(?:\.\d+)?)\s*(k|thousand|lakh|lac|crore)?\s+(?:to\s+)?invest/i,
  ]

  for (const pattern of patterns) {
    const match = message.match(pattern)

    if (match) {
      return parseIndianAmount(
        match[1],
        match[2]
      )
    }
  }

  return undefined
}

// --------------------------------------------------
// Duration
// --------------------------------------------------

function extractDuration(
  message: string
): number | undefined {
  const match = message.match(
    /(\d+(?:\.\d+)?)\s*(?:year|years|yr|yrs)/i
  )

  if (!match) {
    return undefined
  }

  return Number(match[1])
}

// --------------------------------------------------
// Risk
// --------------------------------------------------

function extractRisk(
  message: string
): UserProfile["risk"] {
  if (
    /\b(?:risk\s*(?:preference)?|risk\s*level)\s*(?:is|:|=|-)?\s*high\b/i.test(
      message
    ) ||
    /\bhigh\s+risk\b/i.test(message)
  ) {
    return "high"
  }

  if (
    /\b(?:risk\s*(?:preference)?|risk\s*level)\s*(?:is|:|=|-)?\s*medium\b/i.test(
      message
    ) ||
    /\bmedium\s+risk\b/i.test(message)
  ) {
    return "medium"
  }

  if (
    /\b(?:risk\s*(?:preference)?|risk\s*level)\s*(?:is|:|=|-)?\s*low\b/i.test(
      message
    ) ||
    /\blow\s+risk\b/i.test(message)
  ) {
    return "low"
  }

  return undefined
}

// --------------------------------------------------
// Goal
// --------------------------------------------------

function extractGoal(
  message: string
): string | undefined {
  const patterns = [
    // I want to buy an SUV in 5 years
    /(?:want|need|plan|planning)\s+to\s+(?:buy|purchase)\s+(?:a|an|the)?\s*(.+?)(?=\s+(?:in|within)\s+\d+\s*(?:year|years|yr|yrs)|\s+and\s+|\s+with\s+|\s+my\s+|\s*,|$)/i,

    // My goal is to buy a house
    /(?:my\s+)?goal\s+(?:is|:)\s*(?:to\s+)?(.+?)(?=\s+and\s+|\s+with\s+|\s+my\s+|$)/i,

    // I want to become rich
    /(?:want|need|plan|planning)\s+to\s+(.+?)(?=\s+in\s+\d+\s*(?:year|years|yr|yrs)|\s+and\s+|\s+with\s+|\s+my\s+|$)/i,
  ]

  for (const pattern of patterns) {
    const match = message.match(pattern)

    if (match) {
      return match[1].trim()
    }
  }

  return undefined
}

// --------------------------------------------------
// Indian amount parser
// --------------------------------------------------

function parseIndianAmount(
  rawValue: string,
  rawUnit?: string
): number {
  let value = Number(
    rawValue.replace(/,/g, "")
  )

  const unit = rawUnit?.toLowerCase()

  if (
    unit === "k" ||
    unit === "thousand"
  ) {
    value *= 1_000
  }

  if (
    unit === "lakh" ||
    unit === "lac"
  ) {
    value *= 100_000
  }

  if (unit === "crore") {
    value *= 10_000_000
  }

  return value
}