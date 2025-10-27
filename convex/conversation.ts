import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";


export const createConversation=mutation({

    args:{
        participants:v.array(v.id("users")),
        isGroup:v.boolean(),
        groupName:v.optional(v.string()),
        groupImage:v.optional(v.id("_storage")),
        admin:v.optional(v.id("users"))

    },
    handler: async(ctx,args)=>{
        const identity =await ctx.auth.getUserIdentity()
        if (!identity) throw new ConvexError("Unauthorized")

        const exsitingConversation= await ctx.db.query("conversations")
        // jan and joe or joe and jan
        .filter((q)=>q.or(
            q.eq(q.field("participants"),args.participants),
            q.eq(q.field("participants"),args.participants.reverse())
            
        )).first()
        if (exsitingConversation)
            return exsitingConversation._id

        let groupImageUrl
        if (args.groupImage){
             groupImageUrl=(await ctx.storage.getUrl(args.groupImage)) 
        }
        const conversationId=await ctx.db.insert("conversations",{
            participants:args.participants,
            isGroup:args.isGroup,
			//@ts-ignore
            groupImage:groupImageUrl,
            groupName:args.groupName,
            admin:args.admin
        })
        return conversationId
    }
})
export const generateUploadUrl=mutation(async(ctx)=>{
    return ctx.storage.generateUploadUrl()
	//return a url to the storage section of the data base
})

export const getMyConversations = query({
	args: {},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new ConvexError("Unauthorized");

        //getting the current user
		const user = await ctx.db
			.query("users")
			.withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
			.unique();

		if (!user) throw new ConvexError("User not found");

        //getting all the conversation in the data base
		const conversations = await ctx.db.query("conversations").collect();

        //filtring the conversation that include the current user
		const myConversations = conversations.filter((conversation) => {
			return conversation.participants.includes(user._id);
		});

		const conversationsWithDetails = await Promise.all(
			myConversations.map(async (conversation) => {
				let userDetails = {};

				if (!conversation.isGroup) {
					const otherUserId = conversation.participants.find((id) => id !== user._id); // getting the  other user id'
					const userProfile = await ctx.db //usig the users id to get the acctual user  
						.query("users")
						.filter((q) => q.eq(q.field("_id"), otherUserId))
						.take(1);

					userDetails = userProfile[0]; // converting the arry to an object  
				}

				const lastMessage = await ctx.db
					.query("messages")
					.filter((q) => q.eq(q.field("conversation"), conversation._id))
					.order("desc")
					.take(1); // get the last message of the conversation 

				// return should be in this order, otherwise _id field will be overwritten
				return {
					...userDetails,
					...conversation,
					lastMessage: lastMessage[0] || null,
				};
			})
		);
        // return the filtered and modified conversation data 
		return conversationsWithDetails;
	},
});
