"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FaUser } from "react-icons/fa";
import { JoinRequest } from "./page";
import { createClient } from "@/lib/axios-server";
import { useAuth } from "@/context/auth-context";
import { join } from "path";

type PendingJoinRequestsProps = {
  requests: JoinRequest;
  groupID: string;
};

export function PendingJoinRequests({
  requests: initialRequests,
  groupID,
}: PendingJoinRequestsProps) {
  const router = useRouter();
  const [requests, setRequests] = useState(initialRequests);
  const { user } = useAuth();

  const handleAccept = async (requestId: string) => {
    const loadingToast = toast.loading("Accepting join request...");
    try {
      const client = createClient(user?.token);

      const res = await client.post(`/api/Group/RespondToJoinRequest`, {
        joinRequestId: requestId,
        accept: true,
      });

      if (res.status !== 200) {
        throw new Error("Failed to accept join request");
      }
      setRequests(requests.filter((request) => request.id !== requestId));
      toast.success("Join request accepted", { id: loadingToast });
    } catch (error) {
      console.error("Error accepting join request:", error);
      toast.error("Failed to accept join request", { id: loadingToast });
    }
  };

  const handleDecline = async (requestId: string) => {
    const loadingToast = toast.loading("Declining join request...");
    try {
      const client = createClient(user?.token);

      const res = await client.post(`/api/Group/RespondToJoinRequest`, {
        joinRequestId: requestId,
        accept: false,
      });

      if (res.status !== 200) {
        throw new Error("Failed to decline join request");
      }

      setRequests(requests.filter((request) => request.id !== requestId));
      toast.success("Join request declined", { id: loadingToast });
    } catch (error) {
      console.error("Error declining join request:", error);
      toast.error("Failed to decline join request", { id: loadingToast });
    }
  };

  if (requests.length === 0) {
    return (
      <p className="text-gray-600 dark:text-gray-400">
        No pending join requests.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div
          key={request.id}
          className="flex flex-col rounded-lg border p-4 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="mb-4 flex items-center sm:mb-0">
            <Avatar className="mr-4 h-10 w-10">
              <AvatarImage src={""} alt={request.user.name || "User"} />
              <AvatarFallback>
                <FaUser className="text-gray-400" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {request.user.name || "Unnamed User"}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {request.user.email}
              </p>
            </div>
          </div>
          <div className="flex w-full space-x-2 sm:w-auto">
            <Button
              onClick={() => handleAccept(request.id)}
              className="w-full bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
            >
              Accept
            </Button>
            <Button
              onClick={() => handleDecline(request.id)}
              variant="outline"
              className="w-full border-red-500 text-red-500 hover:bg-red-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-950"
            >
              Decline
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
