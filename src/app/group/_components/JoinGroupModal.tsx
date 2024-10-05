"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  groupCode: z
    .string()
    .min(1, "Group code is required")
    .length(6, "Invalid Group Code!")
    .regex(/[A-Za-z0-9]{6}/, "Invalid Group Code!"),
});

type JoinGroupFormData = z.infer<typeof formSchema>;

export function JoinGroupModal({
  memberGroups,
  onJoinRequest,
}: {
  memberGroups: any[];
  onJoinRequest: (newRequest: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<JoinGroupFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      groupCode: "",
    },
  });

  const handleSubmit = async (data: JoinGroupFormData) => {
    const loadingToast = toast.loading("Sending join request...");

    if (memberGroups.find((group) => group.code === data.groupCode)) {
      toast.error("You are already a member of this group", {
        id: loadingToast,
      });
      return;
    }

    try {
      const response = await fetch("/api/Group/JoinRequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupCode: data.groupCode }),
      });

      if (!response.ok) {
        throw new Error("Failed to send join request");
      }

      const result = await response.json();
      toast.success("Join request sent successfully", {
        closeButton: true,
        duration: 4500,
        id: loadingToast,
      });

      // Assuming the API returns the necessary data to create a PendingRequest object
      const newRequest = {
        id: result.joinRequestId,
        groupId: result.groupId,
        userId: result.userId,
        status: "PENDING",
        createdAt: new Date(),
        group: {
          id: result.groupId,
          name: result.groupName,
          description: result.groupDescription,
          code: result.groupCode,
          creatorId: result.groupCreatorId,
        },
      };
      onJoinRequest(newRequest);
      handleClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to join group",
        { id: loadingToast }
      );
    }
  };

  const handleClose = () => {
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex flex-1 items-center justify-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 sm:flex-none"
        >
          <UserPlus size={20} />
          <span>Join Group</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[425px] p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-center sm:text-left">
            Join a group
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="mt-4 space-y-4"
          >
            <FormField
              control={form.control}
              name="groupCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter group code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6 sm:mt-8">
              <Button
                type="submit"
                className="w-full bg-primary text-white hover:bg-primary/90 sm:w-auto"
              >
                Join Group
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
