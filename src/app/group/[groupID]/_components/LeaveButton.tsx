"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle, LogOut, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { createClient } from "@/lib/axios-server";
import { useAuth } from "@/context/auth-context";

interface LeaveButtonProps {
  status: "settled up" | "gets back" | "owes";
  amount: number;
  userId: string;
  groupId: string;
  creatorId: string;
}

export default function LeaveButton({
  status,
  amount,
  userId,
  groupId,
  creatorId,
}: LeaveButtonProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const isCreator = userId === creatorId;
  const isSettledUp = status === "owes" && amount === 0;

  const handleAction = async () => {
    if (isSettledUp || (isCreator && amount === 0)) {
      setIsLoading(true);
      const loading = toast.loading(
        isCreator ? "Deleting group..." : "Leaving group...",
        {
          description: "Please wait while we process your request.",
        }
      );

      try {
        const client = createClient(user?.token);
        let response;

        if (isCreator) {
          response = await client.delete(`/api/Group/${groupId}`);
        } else {
          response = await client.post("/api/Group/Leave", { groupId });
        }

        if (response.status === 200) {
          toast.success(
            isCreator ? "Group deleted successfully" : "Left group successfully"
          );
          router.push("/group");
        } else {
          throw new Error("Failed to process request");
        }
      } catch (error) {
        toast.error("An error occurred. Please try again.");
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
        toast.dismiss(loading);
      }
    }
  };

  const getAlertContent = () => {
    if (isCreator) {
      if (amount !== 0) {
        return {
          title: "Unable to delete",
          description: `You owe ${amount}. You need to settle up before deleting the group.`,
          action: "OK",
          icon: <AlertTriangle className="h-6 w-6 text-warning" />,
        };
      }
      return {
        title: "Delete this group?",
        description:
          "This action cannot be undone. All group information and activities will be permanently deleted.",
        action: "Delete group",
        icon: <Trash2 className="h-6 w-6 text-red-500" />,
      };
    }

    if (!isSettledUp) {
      return {
        title: "Unable to leave",
        description: `You ${
          status === "gets back" ? "are owed" : "owe"
        } ${amount}. You need to settle up before leaving the group.`,
        action: "OK",
        icon: <AlertTriangle className="h-6 w-6 text-warning" />,
      };
    }

    return {
      title: "Leave group?",
      description:
        "This action cannot be undone. You will lose access to all group information and activities.",
      action: "Leave group",
      icon: <LogOut className="h-6 w-6 text-warning" />,
    };
  };

  const alertContent = getAlertContent();

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "mt-0 w-auto transition-colors duration-300",
                isCreator
                  ? "border-red-500 text-red-500 hover:bg-destructive hover:text-red-500-foreground"
                  : isSettledUp
                  ? "border-warning text-warning hover:bg-warning hover:text-warning-foreground"
                  : "border-gray-600 text-muted-foreground hover:bg-gray-300 hover:text-muted-foreground"
              )}
              onClick={() => setIsAlertOpen(true)}
            >
              {isCreator ? (
                <Trash2 className="mr-2 h-4 w-4" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              {isCreator ? "Delete Group" : "Leave Group"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {isCreator
                ? "Delete this group"
                : isSettledUp
                ? "Leave this group"
                : "Settle up before leaving"}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-lg sm:text-xl">
              {alertContent.icon}
              <span className="ml-2">{alertContent.title}</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              {alertContent.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              className={cn(
                "transition-colors duration-300",
                isCreator
                  ? "bg-red-500 text-red-500-foreground hover:bg-red-500/90"
                  : isSettledUp
                  ? "bg-warning text-warning-foreground hover:bg-warning/90"
                  : "cursor-not-allowed bg-muted text-muted-foreground"
              )}
              disabled={
                (!isSettledUp && !isCreator) ||
                (isCreator && amount !== 0) ||
                isLoading
              }
            >
              {isLoading ? (
                <>
                  <svg
                    className="-ml-1 mr-3 h-5 w-5 animate-spin text-background"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                alertContent.action
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
