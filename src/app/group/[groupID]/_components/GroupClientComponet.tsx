"use client"

import PageTitle from "./PageTitle"
import {SettleUp} from "./SettleUp"
import { GroupMember } from "./GroupMember"
import Transaction from "./Transaction"
import { Card, CardContent } from "@/components/ui/card"
import AddExpense from "./AddExpense"

interface GroupClientProps {
  groupName: string
  creatorId: string
  userName: string
  userId: string
  leave: {
    status: "settled up" | "gets back" | "owes"
    amount: number
    userId: string
    groupId: string
  }
  groupMembers: { userId: string; name: string }[]
  usersYouNeedToPay: any[]
  transactionData: any[]
  balance: any[]
  token: string
}

export default function GroupClientComponent({
  groupName,
  creatorId,
  userName,
  userId,
  leave,
  groupMembers,
  usersYouNeedToPay,
  transactionData,
  balance,
  token,
}: GroupClientProps) {
  return (
    <div className="mx-auto flex w-full max-w-screen-xl flex-wrap items-center justify-between p-4">
      <div className="flex w-full flex-col gap-5 px-4">
        <PageTitle title={groupName} leave={leave} createrId={creatorId} />
        <div className="flex w-full flex-wrap items-center justify-between gap-4">
          <p>
            Welcome Back,
            <span className="text font-semibold text-orange-500 dark:text-sky-500">
              {" "}
              {userName}{" "}
            </span>
            👋
          </p>
          <div className="flex w-full gap-2 sm:ml-auto sm:w-auto">
            <AddExpense
              params={{ groupID: leave.groupId }}
              groupMemberName={groupMembers}
              user={userId}
              token={token}
            />
           <SettleUp
              params={{ groupID: leave.groupId }}
              groupMemberName={groupMembers}
              usersYouNeedToPay={usersYouNeedToPay.map((user) => ({
                ...user,
                expenses: [],
              }))}
              user={userId}
              token={token}
            />
          </div>
        </div>
        <section className="text-bl grid w-full grid-cols-1 gap-4 transition-all lg:grid-cols-3">
          <Card className="col-span-1 md:col-span-2">
            <CardContent className="p-0">
              <Transaction transactionsData={transactionData} loading={false} />
            </CardContent>
          </Card>
          <Card className="col-span-1">
            <CardContent className="p-0">
              <GroupMember loading={false} balance={balance} />
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}