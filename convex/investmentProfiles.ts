import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const getActiveProfile = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("investmentProfiles")
      .withIndex("by_email", q => q.eq("email", args.email))
      .first()
  },
})

export const upsertProfile = mutation({
  args: {
    email: v.string(),
    goal: v.optional(v.string()),
    goalType: v.optional(
  v.union(
    v.literal("wealth_building"),
    v.literal("target_based")
  )
),
    targetAmount: v.optional(v.number()),
    amount: v.optional(v.number()),
    monthlyIncome: v.optional(v.number()),
    monthlyExpenses: v.optional(v.number()),
    monthlyInvestment: v.optional(v.number()),
    duration: v.optional(v.number()),
    risk: v.optional(
      v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high")
      )
    ),
    investmentMode: v.optional(
      v.union(
        v.literal("lump_sum"),
        v.literal("monthly"),
        v.literal("both")
      )
    ),
    status: v.union(
      v.literal("collecting"),
      v.literal("completed")
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("investmentProfiles")
      .withIndex("by_email", q => q.eq("email", args.email))
      .first()

    const profile = {
      goal: args.goal,
      targetAmount: args.targetAmount,
      goalType: args.goalType,
      amount: args.amount,
      monthlyIncome: args.monthlyIncome,
      monthlyExpenses: args.monthlyExpenses,
      monthlyInvestment: args.monthlyInvestment,
      duration: args.duration,
      risk: args.risk,
      investmentMode: args.investmentMode,
      status: args.status,
    }

    if (existing) {
      await ctx.db.patch(existing._id, profile)
      return existing._id
    }

    return await ctx.db.insert("investmentProfiles", {
      email: args.email,
      ...profile,
    })
  },
})

export const resetProfile = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("investmentProfiles")
      .withIndex("by_email", q => q.eq("email", args.email))
      .first()

    if (!existing) return

    await ctx.db.patch(existing._id, {
      goal: undefined,
      targetAmount: undefined,
      amount: undefined,
      monthlyIncome: undefined,
      monthlyExpenses: undefined,
      goalType: undefined,
      monthlyInvestment: undefined,
      duration: undefined,
      risk: undefined,
      investmentMode: undefined,
      status: "collecting",
    })
  },
})

export const getRecentChats = query({
  args: {
    email: v.string(),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const chats = await ctx.db
      .query("chats")
      .withIndex("by_email", q => q.eq("email", args.email))
      .order("desc")
      .take(args.limit)

    return chats.reverse()
  },
})