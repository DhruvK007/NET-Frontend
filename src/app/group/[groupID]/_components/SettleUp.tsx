'use client'

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
// import { settleUp } from "../group"
import { UserAvatar } from "./UserAvatar"
import { createClient } from "@/lib/axios-server"

interface GroupMember {
  userId: string
  name: string
  avatar: string
}

const formSchema = z.object({
  fromUser: z.string().min(1, "Please select a valid payer."),
  toUser: z.string().min(1, "Please select a valid recipient."),
  selectedExpenses: z
    .array(z.string())
    .min(1, "Please select at least one expense to settle up."),
  transactionDate: z.date().refine((date) => date <= new Date(), {
    message: "Transaction date cannot be in the future",
  }),
})

type FormSchema = z.infer<typeof formSchema>

interface Expense {
  expenseId: string
  memberName: string
  memberId: string
  amount: number
}

interface SettleUpProps {
  groupMemberName: GroupMember[]
  usersYouNeedToPay: Expense[]
  user: string
  params: { groupID: string },
  token: string
}

export const UserSelectionModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  onSelect: (user: GroupMember) => void
  availableUsers: GroupMember[]
}> = ({ isOpen, onClose, onSelect, availableUsers }) => {
  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[425px] rounded-lg">
        <DialogHeader>
          <DialogTitle>Select Member</DialogTitle>
        </DialogHeader>
        <div className="max-h-[50vh] overflow-y-auto pb-5">
          {availableUsers.length === 0 ? (
            <div className="flex items-center justify-center py-4">
              <span className="text-sm text-gray-500">No users available</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {availableUsers.map((user) => (
                <Button
                  key={user.userId}
                  variant="outline"
                  className="flex h-full items-center justify-start space-x-2 p-2"
                  onClick={() => {
                    onSelect(user)
                    onClose()
                  }}
                >
                  <UserAvatar user={user} size={40} />
                  <span className="truncate text-sm">{user.name}</span>
                </Button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}


const ExpenseCard = ({ expense, selectedExpenses, onExpenseChange } : { expense: Expense, selectedExpenses: string[], onExpenseChange: (key: string, value: string | string[]) => void }) => {
  const isChecked = selectedExpenses?.includes(expense.expenseId)

  const handleCheckboxChange = (checked: boolean) => {
    const updatedExpenses = checked
      ? [...selectedExpenses, expense.expenseId]
      : selectedExpenses.filter((id) => id !== expense.expenseId)
    onExpenseChange("selectedExpenses", updatedExpenses)
  }

  return (
    <div className="flex min-h-[9vh] cursor-pointer items-center justify-between rounded-lg border p-2 shadow-sm transition-shadow hover:shadow-md sm:p-4">
      <div className="flex-grow pr-2">
        <p className="truncate text-sm font-semibold sm:text-base">
          {/* Expense ID: {expense.expenseId} */}
        </p>
        <p className="text-xs text-gray-600 sm:text-sm">
          Amount to Pay: ₹{expense.amount.toFixed(2)}
        </p>
      </div>
      <div>
        <Checkbox
          checked={isChecked}
          onCheckedChange={handleCheckboxChange}
          className="text-blue-500"
        />
      </div>
    </div>
  )
}

export function SettleUp({
  groupMemberName,
  usersYouNeedToPay,
  user,
  params: { groupID },
  token
}: SettleUpProps) {
  const [open, setOpen] = useState(false)
  const [userSelectionOpen, setUserSelectionOpen] = useState(false)
  const [selectingFor, setSelectingFor] = useState<"fromUser" | "toUser" | null>(null)
  const router = useRouter()
  const safeUsersYouNeedToPay = useMemo(() => usersYouNeedToPay || [], [usersYouNeedToPay])

  const client = createClient(token);

  const availableRecipients = useMemo(
    () =>
      groupMemberName.filter((member) =>
        safeUsersYouNeedToPay.some((user) => user.memberId === member.userId)
      ),
    [groupMemberName, safeUsersYouNeedToPay]
  )

  const defaultToUser = useMemo(() => {
    return safeUsersYouNeedToPay.length > 0
      ? safeUsersYouNeedToPay[0].memberId
      : ""
  }, [safeUsersYouNeedToPay])

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fromUser: user,
      toUser: defaultToUser,
      selectedExpenses: [],
      transactionDate: new Date(),
    },
  })

  useEffect(() => {
    if (defaultToUser) {
      form.setValue("toUser", defaultToUser)
    }
  }, [defaultToUser, form])

  const handleUserSelect = (selectedUser: GroupMember) => {
    if (selectingFor === "toUser") {
      form.setValue("toUser", selectedUser.userId)
      form.setValue("selectedExpenses", [])
    }
    setUserSelectionOpen(false)
  }


  // Form submission
  const handleSubmit = async (data: FormSchema) => {
    const { fromUser, toUser, selectedExpenses, transactionDate } = data

    const selectedUser = usersYouNeedToPay.find(
      (user) => user.memberId === toUser
    ) 
    if (!selectedUser) {
      toast.error("Selected user not found.", {
        closeButton: true,
        icon: "❌",
        duration: 4500,
      })
      return
    }

    const expenseDetails = usersYouNeedToPay
      .filter((expense) => selectedExpenses.includes(expense.expenseId))
      .map((expense) => ({
        expenseId: expense.expenseId,
        amount: expense.amount,
        groupexpenceId: expense.expenseId,
      }))

    const loading = toast.loading("Settling up...")
    setOpen(false)

    console.log("settleup handle submit");
    


    console.log("expenseDetails", expenseDetails);
    console.log("fromUser", fromUser);
    console.log("toUser", toUser);
    console.log("selectedExpenses", selectedExpenses);
    console.log("transactionDate", transactionDate);
    
    
    console.log("Inside settleup handle submit");
    
    
    

    try {

      const response = await client.post("/api/GroupExpense/SettleUp", {
        groupID: groupID,
        payerId: fromUser,
        recipientId: toUser,
        expenseIds: expenseDetails.map(expense => ({
            expenseId: expense.expenseId,
            amount: expense.amount,
            groupExpenseId: expense.groupexpenceId // Ensure this key is correct
        })),
        transactionDate: transactionDate.toISOString() // Ensure date is in ISO format
    });
    

          toast.dismiss(loading);

          console.log("response", response);
          


        if (response.status === 200) {
          toast.success("Successfully settled up!", {
            closeButton: true,
            icon: "🤝",
            duration: 4500,
          });
  
          form.reset();
          router.refresh();
        } else {
          console.error("Failed to Add Expense");
          console.log(response);
  
          toast.error("Error setting up......", {
            closeButton: true,
            icon: "❌",
            duration: 4500,
          });
        }
      

     

      form.reset()
    } catch (error) {
      console.error(error)
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred"
      toast.error(errorMessage, {
        closeButton: true,
        icon: "❌",
        duration: 4500,
      })
    } finally {
      toast.dismiss(loading);
    }
  }

  const toUser = form.watch("toUser")

  const selectedUserExpenses = useMemo(() => {
    return safeUsersYouNeedToPay.filter((expense) => expense.memberId === toUser)
  }, [safeUsersYouNeedToPay, toUser])

  const totalAmount = useMemo(() => {
    return selectedUserExpenses
      .filter((expense) => form.watch("selectedExpenses").includes(expense.expenseId))
      .reduce((sum, expense) => sum + expense.amount, 0)
  }, [selectedUserExpenses, form.watch("selectedExpenses")])

  if (safeUsersYouNeedToPay.length === 0) {
    return (
      <Button
        className="w-full border-green-500 text-green-500 hover:bg-green-700 hover:text-white sm:w-[150px]"
        variant="outline"
        disabled
      >
        No users to pay
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="w-full rounded-lg border-green-500 text-green-500 hover:bg-green-700 hover:text-white sm:w-[150px]"
          variant="outline"
          onClick={() => setOpen(true)}
        >
          Settle up 🤝
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] w-[95vw] overflow-y-auto rounded-lg sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center sm:text-left">
            <span className="text-green-500">Settle up</span> 🤝
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <UserAvatar
                user={
                  groupMemberName.find((u) => u.userId === user) ||
                  groupMemberName[0]
                }
                size={85}
              />
              <div className="rotate-90 transform text-2xl sm:rotate-0">→</div>
              <FormField
                control={form.control}
                name="toUser"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-24 w-24 rounded-full border-none p-0"
                        onClick={() => {
                          setSelectingFor("toUser")
                          setUserSelectionOpen(true)
                        }}
                      >
                        <UserAvatar
                          user={
                            groupMemberName.find(
                              (u) => u.userId === field.value
                            ) || { userId: "", name: "Select", avatar: "" }
                          }
                          size={85}
                        />
                      </Button>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="text-center">
              <span className="text-green-500">
                {groupMemberName.find((u) => u.userId === user)?.name}
              </span>{" "}
              paid{" "}
              <span className="text-blue-500">
                {groupMemberName.find((u) => u.userId === form.watch("toUser"))
                  ?.name || "Select recipient"}
              </span>
            </div>
            <FormField
              control={form.control}
              name="selectedExpenses"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">
                      Select expenses to settle:
                    </FormLabel>
                  </div>
                  <div
                    className={`grid grid-cols-1 content-start gap-4 ${selectedUserExpenses.length < 3 ? "" : "max-h-[30vh] sm:max-h-[40vh]"} overflow-y-auto`}
                  >
                    {selectedUserExpenses.map((expense) => (
                      <ExpenseCard
                        key={expense.expenseId}
                        expense={expense}
                        selectedExpenses={form.watch("selectedExpenses")}
                        onExpenseChange={form.setValue}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="transactionDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Transaction Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? format(field.value, "PPP")
                            : "Pick a date"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-x-2 sm:space-y-0">
              <div className="w-full text-center text-lg font-semibold sm:w-auto sm:text-left">
                Total: ₹{totalAmount.toFixed(2)}
              </div>
              <div className="flex w-full  flex-col justify-center space-y-2 sm:w-auto sm:flex-row sm:justify-end sm:space-x-2 sm:space-y-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="w-full rounded-lg sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full rounded-lg border-green-500 text-green-500 hover:bg-green-600 sm:w-auto"
                >
                  Settle up
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>

      <UserSelectionModal
        isOpen={userSelectionOpen}
        onClose={() => setUserSelectionOpen(false)}
        onSelect={handleUserSelect}
        availableUsers={availableRecipients}
      />
    </Dialog>
  )
}

export default SettleUp