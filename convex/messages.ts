import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { text } from "stream/consumers";
import { handler } from "next/dist/build/templates/app-page";

export const sendMessage=mutation({
    args:{
        sender:v.string(),
        content:v.string(),
        conversation: v.id("conversations")
    },
    handler: async(ctx,args)=>{
        const identity= await ctx.auth.getUserIdentity()
        if (!identity) throw new ConvexError("Unauthorized !")

        const user=await ctx.db.query("users").withIndex("by_tokenIdentifier",(q)=>
            q.eq("tokenIdentifier",identity.tokenIdentifier))
            .unique()


        //const conversation= ctx.db.query("conversations").filter((q)=>q.eq(q.field("_id"),args.conversation)).take(1)
        // or just
        const conversation = await ctx.db.get(args.conversation);

        if (!conversation){
            throw new ConvexError("conversation not found")
        }
        //@ts-ignore
        if (!conversation.participants.includes(user?._id))
        throw new ConvexError("Unauthorized")
        
        await ctx.db.insert("messages",{
            sender:args.sender,
            content:args.content,
            conversation:args.conversation,
            messageType:"text",

        })
        
    }
})
export const getMessages=query({
    args:{conversation: v.id("conversations")},
    handler:async(ctx,args)=>{
    const messages=await ctx.db.query("messages").
    withIndex("by_conversation",q=>(q.eq("conversation",args.conversation)))
    .collect()
    const  messagesWithsender=Promise.all(
        messages.map(async msg=>{
            const sender= await ctx.db.query("users")
            .filter(q=> q.eq(q.field("_id"),msg.sender)).unique()
            return {...msg,sender}
        })

    )
    return messagesWithsender
    }
})
export const sendImage=mutation({
    args:{sender:v.id("users"),
        conversation:v.id("conversations"),
        imgId:v.id("_storage")
    },
    handler:async(ctx,args)=>{
        const identity=ctx.auth.getUserIdentity();
        if(!identity) return new ConvexError("Unauthoraized!")
        const content=(await ctx.storage.getUrl(args.imgId)) as string;
        
        await ctx.db.insert("messages",{
            sender:args.sender,
            conversation:args.conversation,
            content:content,
            messageType:"image"
        })

    }
})

export const sendVideo=mutation({
    args:{sender:v.id("users"),
        conversation:v.id("conversations"),
        videoId:v.id("_storage")},
    handler:async(ctx,args)=>{
        const identity=ctx.auth.getUserIdentity();
        if(!identity) return new ConvexError("Unauthoraized!")

            
        const content=(await ctx.storage.getUrl(args.videoId)) as string;

            await ctx.db.insert("messages",{
            sender:args.sender,
            conversation:args.conversation,
            content:content,
            messageType:"video"
        })

        
    }
})