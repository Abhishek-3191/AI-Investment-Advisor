
// import { mutation } from "./_generated/server"
// import { v } from "convex/values"

// export const saveUserIfNotExists = mutation({
//   args: {
//     name: v.string(),
//     email: v.string(),
//   },
//   handler: async (ctx, args) => {
//     const user = await ctx.db
//       .query("users")
//       .withIndex("by_email", q => q.eq("email", args.email))
//       .unique()

//     if (user) return user

//     const id = await ctx.db.insert("users", {
//       name: args.name,
//       email: args.email,
//       createdAt: Date.now(),
//     })

//     return await ctx.db.get(id)
//   },
// })

import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createUserIfNotExists = mutation({
  args: {
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("email"), args.email))
      .first();

    if (existing) return existing;

    const user = {
      name: args.name,
      email: args.email,
      createdAt: Date.now(),
    };

    await ctx.db.insert("users", user);
    return user;
  },
});
