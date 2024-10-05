import { createClient } from "@/lib/axios-server";
import { currentUserServer } from "@/lib/currentUserServer";
import { redirect } from "next/navigation";
import GroupContent from "./_components/GroupContent";

interface CreatedGroup {
  id: string;
  name: string;
  description: string | null;
  code: string;
  membersCount: number;
  pendingRequestsCount: number;
}

interface Group {
  id: string;
  name: string;
  description: string | null;
  code: string;
  creatorId: string;
}

interface PendingRequest {
  id: string;
  groupId: string;
  userId: string;
  status: "PENDING";
  createdAt: string;
  group: Group;
}

interface DashboardData {
  createdGroups: CreatedGroup[];
  memberGroups: Group[];
  pendingRequests: PendingRequest[];
}

async function fetchDashboardData(token: string): Promise<DashboardData> {
  const client = createClient(token);

  try {
    const response = await client.get<DashboardData>("/api/Group/Dashboard");
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
}

export default async function GroupManagement() {
  const { user, token } = await currentUserServer();

  if (!user || !token) {
    redirect("/login");
  }

  try {
    const dashboardData = await fetchDashboardData(token);

    return (
      <GroupContent
        createdGroupsData={dashboardData.createdGroups}
        memberGroups={dashboardData.memberGroups}
        pendingRequests={dashboardData.pendingRequests}
        token={token}
      />
    );
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
}
