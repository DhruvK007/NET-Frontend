import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
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
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const formSchema = z.object({
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a valid number greater than 0",
  }),
  paidTo: z.string().min(1, "Paid to is required"),
})

type FormSchema = z.infer<typeof formSchema>

interface SettleUpProps {
  groupId: string;
  members: { userId: string; name: string }[];
  currentUserId: string;
}

export function SettleUp({ groupId, members, currentUserId }: SettleUpProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      paidTo: "",
    },
  })

  const onSubmit = async (data: FormSchema) => {
    const loading = toast.loading("Settling up...")
    setOpen(false)

    try {
      const response = await fetch(`/api/Group/${groupId}/SettleUp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId: groupId,
          paidById: currentUserId,
          paidToId: data.paidTo,
          amount: parseFloat(data.amount),
        }),
      })

      if (response.ok) {
        toast.success("Settled up successfully", {
          closeButton: true,
          icon: "🤝",
          duration: 4500,
          id: loading,
        })

        form.reset()
        router.refresh()
      } else {
        const errorData = await response.json()
        console.error("Failed to Settle Up:", errorData)

        toast.error(errorData.message || "Error Settling Up", {
          closeButton: true,
          icon: "❌",
          duration: 4500,
        })
      }
    } catch (error) {
      console.error("Error settling up:", error)
      toast.error("An unexpected error occurred", {
        closeButton: true,
        icon: "❌",
        duration: 4500,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="w-full border-green-500 text-green-500 hover:bg-green-700 hover:text-white sm:w-[150px]"
          variant="outline"
          onClick={() => setOpen(true)}
        >
          Settle Up 🤝
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settle Up</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paidTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paid To</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select member" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {members.filter(m => m.userId !== currentUserId).map((member) => (
                        <SelectItem key={member.userId} value={member.userId}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">Settle Up</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}