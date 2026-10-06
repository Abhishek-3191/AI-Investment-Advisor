import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const saveChat = mutation({
  args: {
    email: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    message: v.string(),
  },

  handler: async (ctx, args) => {
    await ctx.db.insert("chats", {
      email: args.email,
      role: args.role,
      message: args.message,
      createdAt: Date.now(),
    })
  },
})

export const getUserChats = query({
  args: { email: v.string() },

  handler: async (ctx, args) => {
    return ctx.db
      .query("chats")
      .filter(q =>
        q.eq(q.field("email"), args.email)
      )
      .order("asc")
      .collect()
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
      .withIndex("by_email", q =>
        q.eq("email", args.email)
      )
      .order("desc")
      .take(args.limit)

    return chats.reverse()
  },
})