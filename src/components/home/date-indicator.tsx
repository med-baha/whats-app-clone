import { getRelativeDateTime, isSameDay } from "@/lib/utils";
import { IMessage } from "@/store/chat-store";

type DateIndicatorProps = {
	message: IMessage;
	previousMessage?: IMessage;
};
const DateIndicator = ({ message, previousMessage }: DateIndicatorProps) => {
	return (
		<>
			{!previousMessage || !isSameDay(previousMessage._creationTime, message._creationTime) ? (
				<div className='flex justify-center'>
					<p className='text-sm text-black dark:text-black mb-2 p-1 z-50 rounded-md bg-gray-400 dark:bg-gray-primary'>
						{getRelativeDateTime(message, previousMessage)}
					</p>
				</div>
			) : null}
		</>
	);
};
export default DateIndicator;