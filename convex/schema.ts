
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  chats: defineTable({
    email: v.string(),
    role: v.union(
      v.literal("user"),
      v.literal("assistant")
    ),
    message: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  investmentProfiles: defineTable({
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
  }).index("by_email", ["email"]),

  planningSessions: defineTable({
    email: v.string(),

    workflowStatus: v.union(
      v.literal("idle"),
      v.literal("collecting"),
      v.literal("clarifying_new_plan"),
      v.literal("awaiting_confirmation")
    ),

    pendingIntent: v.optional(
      v.union(
        v.literal("collect_profile"),
        v.literal("new_plan_choice"),
        v.literal("confirm_plan")
      )
    ),

    pendingQuestion: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_email", ["email"]),
})
