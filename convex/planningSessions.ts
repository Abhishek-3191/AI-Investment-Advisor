
import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

const workflowStatus = v.union(
  v.literal("idle"),
  v.literal("collecting"),
  v.literal("clarifying_new_plan"),
  v.literal("awaiting_confirmation")
)

const pendingIntent = v.optional(
  v.union(
    v.literal("collect_profile"),
    v.literal("new_plan_choice"),
    v.literal("confirm_plan")
  )
)

export const getPlanningSession = query({
  args: {
    email: v.string(),
  },

  handler: async (ctx, args) => {
    return await ctx.db
      .query("planningSessions")
      .withIndex("by_email", q =>
        q.eq("email", args.email)
      )
      .first()
  },
})

export const savePlanningSession = mutation({
  args: {
    email: v.string(),
    workflowStatus,
    pendingIntent,
    pendingQuestion: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("planningSessions")
      .withIndex("by_email", q =>
        q.eq("email", args.email)
      )
      .first()

    const data = {
      email: args.email,
      workflowStatus: args.workflowStatus,
      pendingIntent: args.pendingIntent,
      pendingQuestion: args.pendingQuestion,
      updatedAt: Date.now(),
    }

    if (existing) {
      await ctx.db.patch(existing._id, data)
      return existing._id
    }

    return await ctx.db.insert("planningSessions", data)
  },
})
