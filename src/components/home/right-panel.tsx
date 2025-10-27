"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X } from "lucide-react";
import MessageInput from "./message-input";
import MessageContainer from "./message-container";
import ChatPlaceHolder from "@/components/home/chat-placeholder";
import GroupMembersDialog from "./group-members-dialog";
import { useConversationStore } from "@/store/chat-store";

const RightPanel = () => {
	const {selectedConversation,setSelectedConversation}=useConversationStore();
	if (!selectedConversation) return <ChatPlaceHolder />;

	const conversationName = selectedConversation.groupName||selectedConversation.name;
	
	return (
		<div className='w-3/4 flex flex-col'>
			<div className='w-full sticky top-0 z-50'>
				{/* Header */}
				<div className='flex justify-between bg-gray-primary p-3'>
					<div className='flex gap-3 items-center'>
						<Avatar>
							<AvatarImage src={selectedConversation.groupImage||selectedConversation.image} className='object-cover' />
							<AvatarFallback>
								<div className='animate-pulse bg-gray-tertiary w-full h-full rounded-full' />
							</AvatarFallback>
						</Avatar>
						<div className='flex flex-col'>
							<p>{conversationName}</p>
								{selectedConversation.isGroup && (
								<GroupMembersDialog selectedConversation={selectedConversation} />
							)}
						</div>
					</div>

					<div className='flex items-center gap-7 mr-5'>
						
						<X size={16} className='cursor-pointer' 
						onClick={()=>setSelectedConversation(null)}/>
					</div>
				</div>
			</div>
			{/* CHAT MESSAGES */}
			<MessageContainer />
			{/* INPUT */}
			<MessageInput />
		</div>
	);
};
export default RightPanel;