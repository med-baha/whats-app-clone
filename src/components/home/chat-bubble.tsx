import { IMessage, useConversationStore } from "@/store/chat-store";
import ChatBubbleAvatar from "./chat-bubble-avatar";
import { MessageSeenSvg } from "@/lib/svgs";
import DateIndicator from "./date-indicator";
import Image from "next/image";
import {  useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogPortal, DialogTitle } from "@radix-ui/react-dialog";
type ChatBubbleProps={
	message:IMessage,
	me:any,
	previousMessage?:IMessage
}
const ChatBubble = ({message,me,previousMessage}:ChatBubbleProps) => {
	const date = new Date(message._creationTime);
	const hour = date.getHours().toString().padStart(2, "0");
	const minute = date.getMinutes().toString().padStart(2, "0");
	const time = `${hour}:${minute}`;
	const {selectedConversation}=useConversationStore()
	const isMember=selectedConversation?.participants.includes(message.sender._id)||false
	const isGroup=selectedConversation?.isGroup
	const fromMe=message.sender._id===me._id
	const bgClass = fromMe ? "bg-green-500" : "bg-white dark:bg-gray-800";
	const isAi:boolean=false
	const [open, setOpen] = useState(false);

	const renderMessageContent = () => {
		switch (message.messageType) {
			case "text":
				return <TextMessage message={message} />;
			case "image":
		
			return <ImageMessage message={message} handleClick={() => setOpen(true)} />;
			case "video":
				return <VideoMessage message={message} />;
			default:
				return null;
		}
	};
	
	

	if (!fromMe) {
	return (
		<>
		<DateIndicator message={message} previousMessage={previousMessage}/>
		<div className='flex gap-1 w-2/3'>
			<ChatBubbleAvatar message={message} isGroup={isGroup} isMember={isMember} fromAI={isAi} />

			<div className={`flex flex-col z-20 max-w-fit px-2 pt-1 rounded-md shadow-md relative ${bgClass}`}>
				<OtherMessageIndicator />
				{renderMessageContent()}
				{open && <ImageDialog src={message.content} open={open} onClose={() => setOpen(false)} />}
				
				<MessageTime time={time} fromMe={fromMe} />
			</div>
		</div>
		</>
	)
}

return (
	<>
	<DateIndicator message={message} previousMessage={previousMessage}/>

	<div className='flex gap-1 w-2/3 ml-auto'>
		<div className={`flex z-20 max-w-fit px-2 pt-1 rounded-md shadow-md ml-auto relative ${bgClass}`}>
			<SelfMessageIndicator />
			{renderMessageContent()}		
			{open && <ImageDialog src={message.content} open={open} onClose={() => setOpen(false)} />}
		
			<MessageTime time={time} fromMe={fromMe} />
		</div>
	</div>
	
	</>
	
)

};
export default ChatBubble;
const MessageTime = ({ time, fromMe }: { time: string; fromMe: boolean }) => {
	return (
		<p className='text-[10px] mt-2 self-end flex gap-1 items-center'>
			{time} {fromMe && <MessageSeenSvg />}
		</p>
	);
};
const SelfMessageIndicator = () => (
	<div className='absolute bg-green-chat top-0 -right-[3px] w-3 h-3 rounded-br-full overflow-hidden' />
);

const OtherMessageIndicator = () => (
	<div className='absolut  dark:bg-gray-primary top-0 -left-[4px] w-3 h-3 rounded-bl-full' />
);
const TextMessage = ({ message }: { message: IMessage }) => {
	const isLink = /^(ftp|http|https):\/\/[^ "]+$/.test(message.content); // Check if the content is a URL

	return (
		<div>
			{isLink ? (
				<a 
					href={message.content}
					target='_blank'
					rel='noopener noreferrer'
					className={`mr-2 text-sm font-light text-blue-800 underline`}
				>
					{message.content}
				</a>
			) : (
				<p className={`mr-2 text-sm font-light`}>{message.content}</p>
			)}
		</div>
	);
};
const ImageMessage = ({ message, handleClick }: { message: IMessage; handleClick: () => void }) => {
	return (
		<div className='w-[250px] h-[250px] m-2 relative'>
			<Image
				src={message.content}
				fill
				className='cursor-pointer object-cover rounded'
				alt='image'
				onClick={handleClick}
			/>
		</div>
	);
};
const VideoMessage = ({ message }: { message: IMessage }) => {
  return (
    <video
      src={message.content}
      width={250}
      height={250}
      controls
      poster="" // optional: use a thumbnail image if you want
    />
  );
};
const ImageDialog = ({
	open,
	src,
	onClose,
}: {
	open: boolean;
	src: string;
	onClose: () => void;
}) => {
	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) onClose();
			}}
		>
			<DialogPortal>
				{/* Dark overlay */}
				<div className="fixed inset-0 bg-black/80 z-[9998]" />

				{/* Centered dialog */}
				<DialogContent
					className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
					flex flex-col items-center justify-center 
					w-[800px] h-[500px] max-w-[95vw] max-h-[90vh] 
					bg-transparent border-none shadow-none z-[9999]"
				>
					<DialogTitle className="sr-only">Image Preview</DialogTitle>

					<div className="relative w-full h-full flex items-center justify-center">
						<Image
							src={src}
							fill
							className="rounded-lg object-contain"
							alt="preview image"
						/>
					</div>
				</DialogContent>
			</DialogPortal>
		</Dialog>
	);
};
