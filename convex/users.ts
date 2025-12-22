import { mutation } from "./_generated/server"
import { v } from "convex/values"

export const saveUserIfNotExists = mutation({
  args: {
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("email"), args.email))
      .first()

    if (!existing) {
      await ctx.db.insert("users", {
        name: args.name,
        email: args.email,
        createdAt: Date.now(),
      })
    }
  },
})
