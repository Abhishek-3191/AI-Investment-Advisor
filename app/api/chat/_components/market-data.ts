import { redis } from "../../../../lib/redis"
import type { MarketData } from "./types"

export const MARKET_CACHE_KEY = "market-data:v1"
export const MARKET_CACHE_TTL = 60 * 30

async function fetchWithTimeout(
  url: string,
  timeoutMs = 8_000
) {
  const controller = new AbortController()

  const timeout = setTimeout(
    () => controller.abort(),
    timeoutMs
  )

  try {
    return await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
    })
  } finally {
    clearTimeout(timeout)
  }
}

export async function getMarketData(): Promise<MarketData> {
  // --------------------------------------------------
  // REDIS CACHE CHECK
  // --------------------------------------------------

  try {
    const cached = await redis.get<MarketData>(
      MARKET_CACHE_KEY
    )

    if (cached) {
      console.log("🟢 REDIS CACHE HIT")
      console.log("Cached market data:", cached)

      return cached
    }

    console.log("🟡 REDIS CACHE MISS")
  } catch (error) {
    console.error("Redis GET failed:", error)
  }

  // --------------------------------------------------
  // FETCH FRESH MARKET DATA
  // --------------------------------------------------

  try {
    console.log("🌐 Fetching fresh market data...")

    const trendPromise = fetchWithTimeout(
      "https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEI?range=1mo&interval=1d"
    )

    const pePromise = fetchWithTimeout(
      "https://api.allorigins.win/raw?url=https://www.screener.in/api/company/NIFTY/"
    )

    const inflationPromise = fetchWithTimeout(
      "https://api.worldbank.org/v2/country/IN/indicator/FP.CPI.TOTL.ZG?format=json"
    )

    const [
      trendResult,
      peResult,
      inflationResult,
    ] = await Promise.allSettled([
      trendPromise,
      pePromise,
      inflationPromise,
    ])

    // --------------------------------------------------
    // NIFTY TREND
    // --------------------------------------------------

    let last = 0
    let trend: MarketData["trend"] = "neutral"

    if (
      trendResult.status === "fulfilled" &&
      trendResult.value.ok
    ) {
      const trendData =
        await trendResult.value.json()

      const prices =
        trendData?.chart?.result?.[0]
          ?.indicators?.quote?.[0]?.close ?? []

      const cleanPrices = prices.filter(
        (price: unknown): price is number =>
          typeof price === "number"
      )

      const first = cleanPrices[0] ?? 0
      last = cleanPrices.at(-1) ?? 0

      if (last > first * 1.03) {
        trend = "bullish"
      } else if (last < first * 0.97) {
        trend = "bearish"
      }

      console.log("📈 Nifty Point:", last)
      console.log("📊 Nifty Trend:", trend)
    }

    // --------------------------------------------------
    // NIFTY PE
    // --------------------------------------------------

    let niftyPE = 21

    if (
      peResult.status === "fulfilled" &&
      peResult.value.ok
    ) {
      const text = await peResult.value.text()

      const match = text.match(
        /"pe":\s*([\d.]+)/
      )

      if (match) {
        niftyPE = Number(match[1])
      }
    }

    console.log("📊 Nifty PE:", niftyPE)

    // --------------------------------------------------
    // INFLATION
    // --------------------------------------------------

    let inflation = 6.5

    if (
      inflationResult.status === "fulfilled" &&
      inflationResult.value.ok
    ) {
      const data =
        await inflationResult.value.json()

      inflation =
        data?.[1]?.[0]?.value ?? 6.5
    }

    console.log("📈 Inflation:", inflation)

    // --------------------------------------------------
    // INTEREST RATE
    // --------------------------------------------------

    // Kept as the project's existing prototype assumption.
    // Replace with a verified live RBI source before production use.

    const interestRate = 6.5

    console.log(
      "🏦 Interest Rate:",
      interestRate
    )

    // --------------------------------------------------
    // BUILD MARKET DATA
    // --------------------------------------------------

    const marketData: MarketData = {
      niftyPoint: last,
      niftyPE,
      inflation,
      interestRate,
      trend,
      fetchedAt:
        new Date().toISOString(),
    }

    console.log(
      "📦 Fresh market data:",
      marketData
    )

    // --------------------------------------------------
    // SAVE TO REDIS
    // --------------------------------------------------

    try {
      await redis.set(
        MARKET_CACHE_KEY,
        marketData,
        {
          ex: MARKET_CACHE_TTL,
        }
      )

      console.log("🔵 REDIS CACHE SET")
      console.log(
        `⏱️ Cache TTL: ${MARKET_CACHE_TTL} seconds`
      )
    } catch (error) {
      console.error(
        "Redis SET failed:",
        error
      )
    }

    return marketData
  } catch (error) {
    // --------------------------------------------------
    // FALLBACK
    // --------------------------------------------------

    console.error(
      "Market data fetch failed:",
      error
    )

    return {
      niftyPoint: 0,
      niftyPE: 22,
      inflation: 6.5,
      interestRate: 6.5,
      trend: "neutral",
      fetchedAt:
        new Date().toISOString(),
    }
  }
}