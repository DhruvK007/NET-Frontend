import { createClient } from "@/lib/axios-server";
import { currentUserServer } from "@/lib/currentUserServer";
import GroupClientComponent from "./_components/GroupClientComponet";


export default async function GroupPage(params: { params: { groupID: string } }) {
  const groupId = params.params.groupID;

  const { user, token } = await currentUserServer();

  if (!user || !token) {
    return Response.redirect("/login");
  }

  const client = createClient(token);
  console.log(user);

  try {
    const response = await client.get(`/api/Group/${groupId}/PageData`);

    console.log(JSON.stringify(response.data, null, 2));
    

    console.log("usersYouNeedToPay");
    console.log(response.data.usersYouNeedToPay);

    console.log("Transaction");
    console.log(response.data.transactionData);
    
    const {
      groupName,
      creatorId,
      userName,
      userId,
      leave,
      groupMembers,
      usersYouNeedToPay,
      transactionData,
      balance
    } = response.data;

    return (
      <GroupClientComponent
        groupName={groupName}
        creatorId={creatorId}
        userName={userName}
        userId={userId}
        leave={leave}
        groupMembers={groupMembers}
        usersYouNeedToPay={usersYouNeedToPay}
        transactionData={transactionData}
        balance={balance}
        token={token}
      />
    );
  } catch (error) {
    console.error("Error fetching group data:", error);
    throw error;
  }
}