"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { TicketType, Tables } from "@/types/database";
import { Icons } from "@/components/icons";

type Event = Tables<"events">;
type Profile = Tables<"profiles">;

interface RegistrationDialogProps {
  event: Event;
  tickets: TicketType[];
  isLoggedIn: boolean;
  userEmail?: string;
  userProfile?: Profile | null;
  onSuccess: () => void;
}

type Step = "ticket" | "info" | "otp" | "receipt";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export function RegistrationDialog({
  event,
  tickets,
  isLoggedIn,
  userEmail,
  userProfile,
  onSuccess,
}: RegistrationDialogProps) {
  const [open, setOpen] = useState(false);
  // Skip ticket step if no tickets or only one ticket
  const initialStep: Step = tickets.length <= 1 ? "info" : "ticket";
  const [step, setStep] = useState<Step>(initialStep);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(
    tickets.length >= 1 ? tickets[0] : null
  );
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Pre-fill form data if user is logged in
  useEffect(() => {
    if (isLoggedIn && userProfile) {
      const nameParts = userProfile.full_name?.split(" ") || [];
      setFormData({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: userProfile.email || userEmail || "",
        phone: "",
      });
    } else if (userEmail) {
      setFormData((prev) => ({ ...prev, email: userEmail }));
    }
  }, [isLoggedIn, userProfile, userEmail]);

  const formatPrice = (price: number) => {
    if (price === 0) return "رایگان";
    return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("fa-IR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state when closing
      setStep(initialStep);
      setSelectedTicket(tickets.length >= 1 ? tickets[0] : null);
      setOtp("");
      setRegistrationId(null);
    }
    setOpen(newOpen);
  };

  const handleTicketSelect = () => {
    if (!selectedTicket) return;
    setStep("info");
  };

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast.error("لطفاً همه فیلدها رو پر کن");
      return;
    }

    setIsLoading(true);

    try {
      if (isLoggedIn) {
        // User is logged in, directly register
        await completeRegistration();
      } else {
        // User is not logged in, send OTP
        const { error } = await supabase.auth.signInWithOtp({
          email: formData.email,
          options: {
            shouldCreateUser: true,
            data: {
              full_name: `${formData.firstName} ${formData.lastName}`,
            },
          },
        });

        if (error) {
          toast.error("خطا در ارسال کد تأیید", {
            description: error.message,
          });
          return;
        }

        toast.success("کد تأیید ارسال شد!", {
          description: "ایمیلت رو چک کن 📧",
        });
        setStep("otp");
      }
    } catch {
      toast.error("یه مشکلی پیش اومد");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: formData.email,
        token: otp,
        type: "email",
      });

      if (error) {
        toast.error("کد اشتباهه", {
          description: "دوباره امتحان کن",
        });
        return;
      }

      // Update profile with name if new user
      if (data.user) {
        await supabase
          .from("profiles")
          .upsert({
            id: data.user.id,
            email: formData.email,
            full_name: `${formData.firstName} ${formData.lastName}`,
          } as never);
      }

      toast.success("وارد شدی! 🎉");
      await completeRegistration();
    } catch {
      toast.error("یه مشکلی پیش اومد");
    } finally {
      setIsLoading(false);
    }
  };

  const completeRegistration = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("لطفاً دوباره وارد شو");
        return;
      }

      // Determine status based on ticket
      const status = selectedTicket?.requires_approval ? "pending" : "approved";

      const { data, error } = await supabase
        .from("registrations")
        .insert({
          event_id: event.id,
          user_id: user.id,
          ticket_id: selectedTicket?.id || null,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          status,
        } as never)
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          toast.error("قبلاً ثبت‌نام کردی!");
        } else {
          toast.error("یه مشکلی پیش اومد", {
            description: error.message,
          });
        }
        return;
      }

      toast.success("ثبت‌نام با موفقیت انجام شد! 🎉");
      onSuccess();
      
      // Redirect to ticket page
      router.push(`/${event.slug}/ticket`);
    } catch {
      toast.error("یه مشکلی پیش اومد");
    }
  };

  const renderTicketStep = () => (
    <>
      <DialogHeader>
        <DialogTitle>انتخاب بلیط</DialogTitle>
        <DialogDescription>نوع بلیطت رو انتخاب کن</DialogDescription>
      </DialogHeader>
      <div className="space-y-3 pt-4">
        {tickets.map((ticket) => (
          <button
            key={ticket.id}
            onClick={() => setSelectedTicket(ticket)}
            className={`w-full p-4 rounded-lg border text-right transition-colors ${
              selectedTicket?.id === ticket.id
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{ticket.name}</span>
                  {ticket.requires_approval && (
                    <Badge variant="outline" className="text-xs text-yellow-500 border-yellow-500/50">
                      نیاز به تأیید
                    </Badge>
                  )}
                </div>
                {ticket.description && (
                  <div className="text-sm text-muted-foreground">{ticket.description}</div>
                )}
              </div>
              <div className="font-semibold">{formatPrice(ticket.price)}</div>
            </div>
          </button>
        ))}
      </div>
      <Button
        className="w-full mt-4"
        disabled={!selectedTicket}
        onClick={handleTicketSelect}
      >
        ادامه
      </Button>
    </>
  );

  const renderInfoStep = () => (
    <>
      <DialogHeader>
        <DialogTitle>اطلاعات شرکت‌کننده</DialogTitle>
        <DialogDescription>
          اطلاعاتت رو وارد کن تا بلیطت ثبت بشه
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleInfoSubmit} className="space-y-4 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">نام *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              placeholder="نام"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">نام خانوادگی *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              placeholder="نام خانوادگی"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">ایمیل *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="email@example.com"
            required
            dir="ltr"
            className="text-left"
            disabled={isLoggedIn}
          />
          {isLoggedIn && (
            <p className="text-xs text-muted-foreground">
              با این ایمیل وارد شدی
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">شماره موبایل *</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            placeholder="۰۹۱۲۱۲۳۴۵۶۷"
            required
            dir="ltr"
            className="text-left"
          />
        </div>

        {/* Selected ticket summary */}
        {selectedTicket && (
          <div className="p-3 rounded-lg bg-secondary/50 border border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">بلیط انتخابی:</span>
              <span className="font-medium">{selectedTicket.name}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-muted-foreground">قیمت:</span>
              <span className="font-semibold">{formatPrice(selectedTicket.price)}</span>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {tickets.length > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("ticket")}
              className="flex-1"
            >
              برگشت
            </Button>
          )}
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading
              ? "صبر کن..."
              : isLoggedIn
                ? "تکمیل ثبت‌نام"
                : "ارسال کد تأیید"}
          </Button>
        </div>
      </form>
    </>
  );

  const renderOtpStep = () => (
    <>
      <DialogHeader>
        <DialogTitle>تأیید ایمیل</DialogTitle>
        <DialogDescription>
          کد ۶ رقمی که به {formData.email} ارسال شد رو وارد کن
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleOtpVerify} className="space-y-4 pt-4">
        <div className="flex justify-center" dir="ltr">
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setStep("info");
              setOtp("");
            }}
            className="flex-1"
          >
            تغییر ایمیل
          </Button>
          <Button type="submit" className="flex-1" disabled={isLoading || otp.length !== 6}>
            {isLoading ? "صبر کن..." : "تأیید و ثبت‌نام"}
          </Button>
        </div>
      </form>
    </>
  );

  const renderReceiptStep = () => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-green-500">
          <Icons.Check className="h-6 w-6" />
          ثبت‌نام با موفقیت انجام شد!
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 pt-4">
        <Card>
          <CardContent className="p-4 space-y-4">
            {/* Event Info */}
            <div className="space-y-2">
              <h3 className="font-bold text-lg">{event.title}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icons.CalendarDays className="h-4 w-4" />
                {formatDate(event.date)}
              </div>
              {event.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icons.MapPin className="h-4 w-4" />
                  {event.location}
                </div>
              )}
            </div>

            <Separator />

            {/* Attendee Info */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">شرکت‌کننده</h4>
              <div className="text-sm">
                {formData.firstName} {formData.lastName}
              </div>
              <div className="text-sm text-muted-foreground">{formData.email}</div>
              <div className="text-sm text-muted-foreground" dir="ltr">
                {formData.phone}
              </div>
            </div>

            <Separator />

            {/* Ticket Info */}
            {selectedTicket && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">نوع بلیط</span>
                  <span className="font-medium">{selectedTicket.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">قیمت</span>
                  <span className="font-semibold">{formatPrice(selectedTicket.price)}</span>
                </div>
                {selectedTicket.requires_approval && (
                  <Badge variant="outline" className="text-yellow-500 border-yellow-500/50">
                    <Icons.Clock4 className="h-3 w-3 ml-1" />
                    در انتظار تأیید برگزارکننده
                  </Badge>
                )}
              </div>
            )}

            {registrationId && (
              <>
                <Separator />
                <div className="text-xs text-muted-foreground text-center" dir="ltr">
                  کد رهگیری: {registrationId.slice(0, 8).toUpperCase()}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Button className="w-full" onClick={() => handleOpenChange(false)}>
          بستن
        </Button>
      </div>
    </>
  );

  return (
    <>
      <Button className="w-full" size="lg" onClick={() => setOpen(true)}>
        ثبت‌نام در رویداد
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          {step === "ticket" && renderTicketStep()}
          {step === "info" && renderInfoStep()}
          {step === "otp" && renderOtpStep()}
          {step === "receipt" && renderReceiptStep()}
        </DialogContent>
      </Dialog>
    </>
  );
}

