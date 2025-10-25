import { ConvexError, v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { users } from "@clerk/clerk-sdk-node";

export const createUser = internalMutation({
	args: {
		tokenIdentifier: v.string(),
		email: v.string(),
		name: v.string(),
		image: v.string(),
	},
	handler: async (ctx, args) => {
		await ctx.db.insert("users", {
			tokenIdentifier: args.tokenIdentifier,
			email: args.email,
			name: args.name,
			image: args.image,
			isOnline: true,
		});
	},
});

export const updateUser = internalMutation({
	args: { tokenIdentifier: v.string(), image: v.string() },
	async handler(ctx, args) {
		const user = await ctx.db
			.query("users")
			.withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
			.unique();

		if (!user) {
			throw new ConvexError("User not found");
		}

		await ctx.db.patch(user._id, {
			image: args.image,
		});
	},
});

export const setUserOnline = internalMutation({
	args: { tokenIdentifier: v.string() },
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
			.unique();

		if (!user) {
			throw new ConvexError("User not found");
		}

		await ctx.db.patch(user._id, { isOnline: true });
	},
});

export const setUserOffline = internalMutation({
	args: { tokenIdentifier: v.string() },
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
			.unique();

		if (!user) {
			throw new ConvexError("User not found");
		}

		await ctx.db.patch(user._id, { isOnline: false });
	},
});

export const getUsers=query({
args:{},
handler:async(ctx,args)=>{
const identety =await ctx.auth.getUserIdentity() 
if(!identety){
throw new ConvexError("Unauthaurized")

} 
return await ctx.db
.query("users")
.collect()
}

})



export const getMe=query({
args:{},
handler: async(ctx,args)=>{
const identety =await ctx.auth.getUserIdentity() 
if (!identety){
	throw new ConvexError("Unauthaurized")
}
 const user=ctx.db.query("users")
 .withIndex("by_tokenIdentifier",(q)=>q.eq("tokenIdentifier",identety.tokenIdentifier))
 .unique()
 
	if (!user){
		throw new ConvexError("user not found")
	}
	return user
}


})
 