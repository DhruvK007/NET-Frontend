"use client";
import React, { useState } from "react";
import { Users } from "lucide-react";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CreatedGroupsList from "./CreatedGroupList";
import MemberGroupsList from "./MemberGroupsList";
import PendingRequestsList from "./PendingRequestsList";
import { AddGroupModal } from "./AddGroupModal";
import { JoinGroupModal } from "./JoinGroupModal";
import { useAuth } from "@/context/auth-context";

export type CreatedGroup = {
  id: string;
  name: string;
  description: string | null;
  code: string;
  membersCount: number;
  pendingRequestsCount: number;
};

export type MemberGroup = {
  id: string;
  name: string;
  description: string | null;
  code: string;
  creatorId: string;
};

export type PendingRequest = {
  id: string;
  groupId: string;
  userId: string;
  status: "PENDING";
  createdAt: string;
  group: MemberGroup;
};

export default function GroupContent({
  createdGroupsData: initialCreatedGroupsData,
  memberGroups: initialMemberGroups,
  pendingRequests: initialPendingRequests,
  token,
}: {
  createdGroupsData: CreatedGroup[];
  memberGroups: MemberGroup[];
  pendingRequests: PendingRequest[];
  token: string;
}) {
  const [createdGroupsData, setCreatedGroupsData] = useState(
    initialCreatedGroupsData
  );
  const [memberGroups, setMemberGroups] = useState(initialMemberGroups);
  const [pendingRequests, setPendingRequests] = useState(
    initialPendingRequests
  );

  const handleJoinRequest = (newRequest: PendingRequest) => {
    setPendingRequests((prevRequests) => [...prevRequests, newRequest]);
  };

  const handleRequestCancel = (id: string) => {
    setPendingRequests((prevRequests) =>
      prevRequests.filter((req) => req.id !== id)
    );
  };

  const { user } = useAuth();
  console.log(user);

  return (
    <div className="mx-auto flex w-full max-w-screen-xl flex-wrap items-center justify-between p-4">
      <div className="flex w-full flex-col gap-5 px-4">
        <div className="mb-4 flex flex-col items-start justify-between gap-4 py-4 sm:flex-row sm:items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Groups
          </h1>
          <div className="mt-3 flex w-full flex-row gap-2 sm:mt-0 sm:w-auto">
            <AddGroupModal token={token} />
            <JoinGroupModal
              memberGroups={memberGroups}
              onJoinRequest={handleJoinRequest}
            />
          </div>
        </div>

        <Suspense fallback={"Loading..."}>
          {createdGroupsData.length > 0 && (
            <CreatedGroupsList groups={createdGroupsData} />
          )}

          {memberGroups.length > 0 && (
            <MemberGroupsList groups={memberGroups} />
          )}

          <PendingRequestsList
            requests={pendingRequests}
            onRequestCancel={handleRequestCancel}
          />

          {createdGroupsData.length === 0 &&
            memberGroups.length === 0 &&
            pendingRequests.length === 0 && (
              <Card className="bg-white dark:bg-zinc-900 dark:border-neutral-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <Users size={24} />
                    No Groups Yet
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    You haven't joined any groups yet. Create a new group or
                    join an existing one to get started!
                  </p>
                </CardContent>
              </Card>
            )}
        </Suspense>
      </div>
    </div>
  );
}
