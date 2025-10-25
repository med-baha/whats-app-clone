"use client";

import { ListFilter, Search } from "lucide-react";
import { Input } from "../ui/input";
import ThemeSwitch from "./theme-switch";
import Conversations from "./conversions";
import { UserButton, useUser } from "@clerk/nextjs";
import UserListDialog from "./users-list-dialog";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const LeftPanel = () => {
  const { user, isLoaded } = useUser();
  const conversations = useQuery(api.conversation.getMyConversations);

  if (!isLoaded) {
    return (
      <div className="w-1/4 border-gray-600 border-r flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  // ✅ If user not signed in, don’t render chats
  if (!user) {
    return (
      <div className="w-1/4 border-gray-600 border-r flex items-center justify-center">
        <p className="text-gray-500 text-sm">Please sign in to view chats</p>
      </div>
    );
  }

  return (
    <div className="w-1/4 border-gray-600 border-r">
      <div className="sticky top-0 bg-left-panel z-10">
        {/* Header */}
        <div className="flex justify-between bg-gray-primary p-3 items-center">
          <UserButton />
          <div className="flex items-center gap-3">
            <UserListDialog />
            <ThemeSwitch />
          </div>
        </div>

        {/* Search */}
        <div className="p-3 flex items-center">
          <div className="relative h-10 mx-3 flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10"
              size={18}
            />
            <Input
              type="text"
              placeholder="Search or start a new chat"
              className="pl-10 py-2 text-sm w-full rounded shadow-sm bg-gray-primary focus-visible:ring-transparent"
            />
          </div>
          <ListFilter className="cursor-pointer" />
        </div>
      </div>

      {/* Chat List */}
      <div className="my-3 flex flex-col gap-0 max-h-[80%] overflow-auto">
        {conversations &&
          conversations.map((c) => (
            <Conversations key={c._id} conversation={c} />
          ))}

        {conversations?.length === 0 && (
          <>
            <p className="text-center text-gray-500 text-sm mt-3">
              No conversations yet
            </p>
            <p className="text-center text-gray-500 text-sm mt-3">
              We understand {"you're"} an introvert, but {"you've"} got to start somewhere 😊
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default LeftPanel;
