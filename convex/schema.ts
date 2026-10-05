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
    role: v.union(v.literal("user"), v.literal("assistant")),
    message: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),
  investmentProfiles: defineTable({
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
})
  .index("by_email", ["email"])
})
