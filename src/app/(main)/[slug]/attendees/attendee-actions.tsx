"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { toast } from "sonner";
import { RegistrationStatus } from "@/types/database";
import { Icons } from "@/components/icons";

interface AttendeeActionsProps {
  registrationId: string;
  currentStatus: RegistrationStatus;
}

export function AttendeeActions({
  registrationId,
  currentStatus,
}: AttendeeActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const updateStatus = async (newStatus: RegistrationStatus) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("registrations")
        .update({ status: newStatus } as never)
        .eq("id", registrationId);

      if (error) {
        toast.error("یه مشکلی پیش اومد");
        return;
      }

      const statusMessages = {
        approved: "شرکت‌کننده تأیید شد ✓",
        pending: "به حالت انتظار تغییر کرد",
        rejected: "شرکت‌کننده رد شد",
      };

      toast.success(statusMessages[newStatus]);
      router.refresh();
    } catch {
      toast.error("یه مشکلی پیش اومد");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("registrations")
        .delete()
        .eq("id", registrationId);

      if (error) {
        toast.error("یه مشکلی پیش اومد");
        return;
      }

      toast.success("ثبت‌نام حذف شد");
      setShowDeleteDialog(false);
      router.refresh();
    } catch {
      toast.error("یه مشکلی پیش اومد");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu dir="rtl">
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isLoading}>
            <Icons.MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {currentStatus !== "approved" && (
            <DropdownMenuItem onClick={() => updateStatus("approved")}>
              <Icons.Check className="h-4 w-4 ml-2 text-green-500" />
              تأیید کردن
            </DropdownMenuItem>
          )}
          {currentStatus !== "pending" && (
            <DropdownMenuItem onClick={() => updateStatus("pending")}>
              <Icons.Clock4 className="h-4 w-4 ml-2 text-yellow-500" />
              در انتظار
            </DropdownMenuItem>
          )}
          {currentStatus !== "rejected" && (
            <DropdownMenuItem onClick={() => updateStatus("rejected")}>
              <Icons.X className="h-4 w-4 ml-2 text-red-500" />
              رد کردن
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Icons.Trash2 className="h-4 w-4 ml-2" />
            حذف ثبت‌نام
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف ثبت‌نام</AlertDialogTitle>
            <AlertDialogDescription>
              مطمئنی می‌خوای این ثبت‌نام رو حذف کنی؟ این عمل قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "صبر کن..." : "حذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

