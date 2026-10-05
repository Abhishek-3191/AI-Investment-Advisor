import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const getActiveProfile = query({
  args: {
    email: v.string(),
  },

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
    amount: v.optional(v.number()),
    duration: v.optional(v.number()),
    risk: v.optional(
      v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high")
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

    if (existing) {
      await ctx.db.patch(existing._id, {
        goal: args.goal,
        amount: args.amount,
        duration: args.duration,
        risk: args.risk,
        status: args.status,
      })

      return existing._id
    }

    return await ctx.db.insert("investmentProfiles", {
      email: args.email,
      goal: args.goal,
      amount: args.amount,
      duration: args.duration,
      risk: args.risk,
      status: args.status,
    })
  },
})

export const resetProfile = mutation({
  args: {
    email: v.string(),
  },

  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("investmentProfiles")
      .withIndex("by_email", q => q.eq("email", args.email))
      .first()

    if (!existing) return

    await ctx.db.patch(existing._id, {
      goal: undefined,
      amount: undefined,
      duration: undefined,
      risk: undefined,
      status: "collecting",
    })
  },
})