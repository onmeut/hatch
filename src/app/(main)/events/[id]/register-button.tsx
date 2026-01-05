"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { TicketType, Tables, RegistrationStatus } from "@/types/database";
import { RegistrationDialog } from "./registration-dialog";
import { Icons } from "@/components/icons";

type Event = Tables<"events">;
type Profile = Tables<"profiles">;

interface RegisterButtonProps {
  event: Event;
  isRegistered: boolean;
  isFull: boolean;
  isLoggedIn: boolean;
  userEmail?: string;
  userProfile?: Profile | null;
  tickets: TicketType[];
  userTicketId: string | null;
  registrationStatus?: RegistrationStatus | null;
}

export function RegisterButton({
  event,
  isRegistered,
  isFull,
  isLoggedIn,
  userEmail,
  userProfile,
  tickets,
  userTicketId,
  registrationStatus,
}: RegisterButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [registered, setRegistered] = useState(isRegistered);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const formatPrice = (price: number) => {
    if (price === 0) return "رایگان";
    return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
  };

  const handleCancelRegistration = async () => {
    setIsLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("لطفاً دوباره وارد شو");
        return;
      }

      const { error } = await supabase
        .from("registrations")
        .delete()
        .eq("event_id", event.id)
        .eq("user_id", user.id);

      if (error) {
        toast.error("یه مشکلی پیش اومد");
        return;
      }

      toast.success("ثبت‌نامت لغو شد");
      setRegistered(false);
      setShowCancelDialog(false);
      router.refresh();
    } catch {
      toast.error("یه مشکلی پیش اومد");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistrationSuccess = () => {
    setRegistered(true);
  };

  if (isFull && !registered) {
    return (
      <Button className="w-full" size="lg" disabled>
        ظرفیت تکمیل شده
      </Button>
    );
  }

  // If already registered, show status and cancel option
  if (registered) {
    const userTicket = tickets.find((t) => t.id === userTicketId);

    return (
      <>
        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
            <div className="flex items-center gap-2 text-green-500 font-medium mb-2">
              <Icons.Check className="h-5 w-5" />
              ثبت‌نام شدی!
            </div>
            {userTicket && (
              <div className="text-sm text-muted-foreground">
                بلیط: {userTicket.name} - {formatPrice(userTicket.price)}
              </div>
            )}
            {registrationStatus === "pending" && (
              <Badge variant="outline" className="mt-2 text-yellow-500 border-yellow-500/50">
                <Icons.Clock4 className="h-3 w-3 ml-1" />
                در انتظار تأیید
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowCancelDialog(true)}
          >
            لغو ثبت‌نام
          </Button>
        </div>

        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>لغو ثبت‌نام</DialogTitle>
              <DialogDescription>
                مطمئنی می‌خوای ثبت‌نامت رو لغو کنی؟
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(false)}
              >
                نه، بیخیال
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelRegistration}
                disabled={isLoading}
              >
                {isLoading ? "صبر کن..." : "بله، لغو کن"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Show registration dialog for new registrations
  return (
    <RegistrationDialog
      event={event}
      tickets={tickets}
      isLoggedIn={isLoggedIn}
      userEmail={userEmail}
      userProfile={userProfile}
      onSuccess={handleRegistrationSuccess}
    />
  );
}
