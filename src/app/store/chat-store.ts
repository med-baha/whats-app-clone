import { conversations } from "@/components/dummy-data/db";
import { Id } from "../../../convex/_generated/dataModel";
import { create } from "zustand";

export type Conversation = {
	_id: Id<"conversations">;
	image?: string;
	participants: Id<"users">[];
	isGroup: boolean;
	name?: string;
	groupImage?: string;
	groupName?: string;
	admin?: Id<"users">;
	isOnline?: boolean;
	lastMessage?: {
		_id: Id<"messages">;
		conversation: Id<"conversations">;
		content: string;
		sender: Id<"users">;
	};
};

type conversationStore={
    selectedConversation:Conversation | null
    setSelectedConversation:(conversation:Conversation | null)=> void
}

export const useConversationStore= create<conversationStore>((set)=>({selectedConversation:null,
setSelectedConversation:(conversation)=>set({selectedConversation:conversation})
}))