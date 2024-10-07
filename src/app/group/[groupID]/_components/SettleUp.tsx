"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { CalendarIcon } from "lucide-react"

const formSchema = z.object({
  toUser: z.string().min(1, "Please select a valid recipient."),
  selectedExpenses: z.array(z.string()).min(1, "Please select at least one expense to settle up."),
  transactionDate: z.date().refine((date) => date <= new Date(), {
    message: "Transaction date cannot be in the future",
  }),
})

type FormSchema = z.infer<typeof formSchema>

interface GroupMember {
  userId: string
  name: string
}

interface Expense {
  id: string
  memberId: string
  description: string
  amountToPay: number
}

interface SettleUpProps {
  groupMemberName: GroupMember[]
  usersYouNeedToPay: Expense[]
  user: string
  groupID: string
}

export function SettleUp({ groupMemberName, usersYouNeedToPay, user, groupID }: SettleUpProps) {
  const [open, setOpen] = useState<boolean>(false)
  const router = useRouter()

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      toUser: "",
      selectedExpenses: [],
      transactionDate: new Date(),
    },
  })

  const handleSubmit = async (data: FormSchema) => {
    const selectedUser = usersYouNeedToPay.find((u) => u.memberId === data.toUser)
    if (!selectedUser) {
      toast.error("Selected user not found.")
      return
    }

    const expenseDetails = usersYouNeedToPay
      .filter((expense) => data.selectedExpenses.includes(expense.id))
      .map((expense) => ({
        ExpenseId: expense.id,
        Amount: expense.amountToPay,
        GroupExpenseId: expense.id,
      }))

    try {
      const response = await fetch('/api/GroupExpense/SettleUp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          GroupID: groupID,
          PayerId: user,
          RecipientId: selectedUser.memberId,
          ExpenseIds: expenseDetails,
          TransactionDate: data.transactionDate.toISOString(),
        }),
      })

      if (!response.ok) throw new Error('Failed to settle up')

      const result = await response.json()
      toast.success(result.Message)
      router.refresh()
      form.reset()
      setOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unknown error occurred")
    }
  }

  const selectedUserExpenses = usersYouNeedToPay.filter((u) => u.memberId === form.watch("toUser"))
  const totalAmount = selectedUserExpenses
    .filter((expense) => form.watch("selectedExpenses").includes(expense.id))
    .reduce((sum, expense) => sum + expense.amountToPay, 0)

  return (
    <>
      <Button
        className="w-full border-green-500 text-green-500 hover:bg-green-700 hover:text-white"
        variant="outline"
        onClick={() => setOpen(true)}
      >
        Settle Up
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Settle Up</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="toUser"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a user" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {groupMemberName.map((member) => (
                          <SelectItem key={member.userId} value={member.userId}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="selectedExpenses"
                render={() => (
                  <FormItem>
                    <FormLabel>Select Expenses</FormLabel>
                    <div className="space-y-2">
                      {selectedUserExpenses.map((expense) => (
                        <div key={expense.id} className="flex items-center space-x-2">
                          <Controller
                            name="selectedExpenses"
                            control={form.control}
                            render={({ field }) => (
                              <Checkbox
                                checked={field.value.includes(expense.id)}
                                onCheckedChange={(checked) => {
                                  const updatedValue = checked
                                    ? [...field.value, expense.id]
                                    : field.value.filter((id) => id !== expense.id)
                                  field.onChange(updatedValue)
                                }}
                              />
                            )}
                          />
                          <label className="text-sm">
                            {expense.description} - ₹{expense.amountToPay.toFixed(2)}
                          </label>
                        </div>
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
                  <FormItem>
                    <FormLabel>Transaction Date</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Input
                          type="date"
                          value={field.value.toISOString().split('T')[0]}
                          onChange={(e) => {
                            const date = new Date(e.target.value)
                            if (!isNaN(date.getTime())) {
                              field.onChange(date)
                            }
                          }}
                          max={new Date().toISOString().split('T')[0]}
                        />
                        <CalendarIcon className="ml-2 h-4 w-4" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between items-center">
                <span className="font-semibold">Total: ₹{totalAmount.toFixed(2)}</span>
                <Button type="submit">Settle Up</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}