import { createClient } from "@/lib/axios-server";
import { currentUserServer } from "@/lib/currentUserServer";
import GroupClientComponent from "./_components/GroupClientComponet";
import { json } from "stream/consumers";

export default async function GroupPage(params: {
  params: { groupID: string };
}) {
  const groupId = params.params.groupID;

  const { user, token } = await currentUserServer();

  if (!user || !token) {
    Response.redirect("/login");
  }

  const client = createClient(token!);
  console.log(user);

  try {
    const response = await client.get(`/api/Group/${groupId}/PageData`);

    // console.log(JSON.stringify(response.data));

    // console.log("usersYouNeedToPay");
    // console.log(JSON.stringify(response.data.usersYouNeedToPay));

    let usersYouNeedToPayData = response.data.usersYouNeedToPay;

    usersYouNeedToPayData = usersYouNeedToPayData.flatMap(
      (user: { transactions: any[]; name: any; userId: any }) =>
        user.transactions.map((transaction) => ({
          expenseId: transaction.expenseId,
          memberName: user.name,
          memberId: user.userId,
          amount: transaction.amount,
        }))
    );

    // console.log("usersYouNeedToPayData");

    // console.log(usersYouNeedToPayData);

    // console.log("Transaction");
    // console.log(response.data.transactionData);

    const {
      groupName,
      creatorId,
      userName,
      userId,
      leave,
      groupMembers,
      usersYouNeedToPay,
      transactionData,
      balance,
    } = response.data;

    return (
      <GroupClientComponent
        groupName={groupName}
        creatorId={creatorId}
        userName={userName}
        userId={userId}
        leave={leave}
        groupMembers={groupMembers}
        usersYouNeedToPay={usersYouNeedToPayData}
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
