// import { defineSchema, defineTable } from "convex/server"
// import { v } from "convex/values"

// export default defineSchema({
//   users: defineTable({
//     name: v.string(),
//     email: v.string(),
//     createdAt: v.number(),
//   }),

//   chats: defineTable({
//     email: v.string(), // user identifier
//     role: v.union(v.literal("user"), v.literal("assistant")),
//     message: v.string(),
//     createdAt: v.number(),
//   }),
// })
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
})
