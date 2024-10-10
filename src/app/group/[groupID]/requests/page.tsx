import { createClient } from "@/lib/axios-server";
import { currentUserServer } from "@/lib/currentUserServer";
import { notFound, redirect } from "next/navigation";
import { PendingJoinRequests } from "./PendingJoinRequests";

export type JoinRequest = {
  id: string;
  groupID: string;
  userId: string;
  status: "PENDING";
  createdAt: string;
  user: {
    name: string | null;
    email: string | null;
    id: string;
  };
  group: {
    id: string;
    name: string;
    description: string;
    code: string;
    creatorId: string;
  };
}[];

export default async function GroupPage({
  params,
}: {
  params: { groupID: string };
}) {
  const { user, token } = await currentUserServer();
  if (!user || !token) {
    redirect("/login");
  }

  const client = createClient(token);
  try {
    await client.get(`/api/Group/CreatorCheck?id=${params.groupID}`);
  } catch (error) {
    return notFound();
  }

  try {
    const joinRequests = await client.get<JoinRequest>(
      `/api/Group/${params.groupID}/JoinRequests`
    );

    return (
      <div className="mx-auto flex w-full max-w-screen-xl flex-col">
        <div className="mt-10 flex w-full flex-col gap-5">
          <div className="z-10 mb-4 flex flex-col items-start justify-between gap-4 py-4 sm:flex-row sm:items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
              Group Requests
            </h1>
          </div>
          <PendingJoinRequests
            requests={joinRequests.data}
            groupID={params.groupID}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Failed to fetch join requests:", error);
    return <div>Failed to load join requests. Please try again later.</div>;
  }
}
