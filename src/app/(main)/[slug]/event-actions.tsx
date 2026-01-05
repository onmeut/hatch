"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Icons } from "@/components/icons";

interface EventActionsProps {
  eventSlug: string;
}

export function EventActions({ eventSlug }: EventActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("slug", eventSlug);

      if (error) {
        toast.error("یه مشکلی پیش اومد");
        return;
      }

      toast.success("رویداد حذف شد");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("یه مشکلی پیش اومد");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Link href={`/${eventSlug}/attendees`}>
          <Button variant="outline" size="sm">
            <Icons.Users className="h-4 w-4 ml-2" />
            شرکت‌کننده‌ها
          </Button>
        </Link>
        <DropdownMenu dir="rtl">
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Icons.Settings className="h-4 w-4 ml-2" />
              مدیریت
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/${eventSlug}/edit`)}>
              <Icons.Edit className="h-4 w-4 ml-2" />
              ویرایش رویداد
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/${eventSlug}/attendees`}>
                <Icons.Users className="h-4 w-4 ml-2" />
                لیست شرکت‌کننده‌ها
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive focus:text-destructive"
            >
              <Icons.Trash2 className="h-4 w-4 ml-2" />
              حذف رویداد
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف رویداد</DialogTitle>
            <DialogDescription>
              مطمئنی می‌خوای این رویداد رو حذف کنی؟ این کار قابل برگشت نیست و همه
              ثبت‌نام‌ها هم پاک میشن.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              انصراف
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "صبر کن..." : "حذف رویداد"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

