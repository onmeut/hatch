import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tables,
  CITIES,
  CityType,
  TicketType,
  RegistrationStatus,
} from "@/types/database";
import { Icons } from "@/components/icons";
import { TicketDownloadButton } from "./ticket-download";

type Event = Tables<"events">;
type Registration = Tables<"registrations">;
type Profile = Tables<"profiles">;

interface TicketPageProps {
  params: Promise<{ id: string }>;
}

export default async function TicketPage({ params }: TicketPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?redirect=/events/${id}/ticket`);
  }

  // Get event
  const { data: eventData } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (!eventData) {
    notFound();
  }

  const event = eventData as Event;

  // Get user's registration for this event
  const { data: registrationData } = await supabase
    .from("registrations")
    .select("*")
    .eq("event_id", id)
    .eq("user_id", user.id)
    .single();

  if (!registrationData) {
    // User is not registered for this event
    redirect(`/events/${id}`);
  }

  const registration = registrationData as Registration;

  // Get event creator profile
  const { data: creatorData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", event.creator_id)
    .single();

  const creator = creatorData as Profile | null;

  const tickets = (event.tickets || []) as TicketType[];
  const userTicket = tickets.find((t) => t.id === registration.ticket_id);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("fa-IR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":");
    return `${hours}:${minutes}`;
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "رایگان";
    return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
  };

  const formatRegistrationDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getInitials = (name: string | null, fallback: string) => {
    if (name) return name.slice(0, 2);
    return fallback.slice(0, 2).toUpperCase();
  };

  const getStatusBadge = (status: RegistrationStatus) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
            <Icons.Check className="h-3 w-3 ml-1" />
            تأیید شده
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-500 border-yellow-500/50">
            <Icons.Clock4 className="h-3 w-3 ml-1" />
            در انتظار تأیید
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <Icons.X className="h-3 w-3 ml-1" />
            رد شده
          </Badge>
        );
    }
  };

  // Generate a short ticket code from registration id
  const ticketCode = registration.id.slice(0, 8).toUpperCase();

  return (
    <div className="container py-8 max-w-2xl">
      {/* Back Link */}
      <div className="mb-6">
        <Link
          href={`/events/${id}`}
          className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
        >
          <Icons.ChevronRight className="h-4 w-4" />
          برگشت به رویداد
        </Link>
      </div>

      {/* Ticket Card */}
      <div id="ticket-content">
        <Card className="overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-l from-primary/20 to-primary/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Icons.Ticket className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">بلیط رویداد</span>
              </div>
              {getStatusBadge(registration.status)}
            </div>
            <h1 className="text-2xl font-bold">{event.title}</h1>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Event Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Icons.CalendarDays className="h-4 w-4" />
                  تاریخ
                </div>
                <div className="font-medium">{formatDate(event.date)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Icons.Clock4 className="h-4 w-4" />
                  ساعت
                </div>
                <div className="font-medium" dir="ltr">
                  {formatTime(event.time)}
                </div>
              </div>
              <div className="space-y-1 col-span-2">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  {event.location_type === "online" ? (
                    <Icons.Globe className="h-4 w-4" />
                  ) : (
                    <Icons.MapPin className="h-4 w-4" />
                  )}
                  مکان
                </div>
                <div className="font-medium">
                  {event.location_type === "online"
                    ? "رویداد آنلاین"
                    : event.location || "اعلام می‌شود"}
                  {event.city && ` - ${CITIES[event.city as CityType]}`}
                </div>
              </div>
            </div>

            <Separator />

            {/* Attendee Info */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground">
                اطلاعات شرکت‌کننده
              </h3>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(
                      registration.first_name,
                      user.email || "?"
                    )}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {registration.first_name} {registration.last_name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {user.email}
                  </div>
                  {registration.phone && (
                    <div className="text-sm text-muted-foreground" dir="ltr">
                      {registration.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Ticket Info */}
            {userTicket && (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">
                  اطلاعات بلیط
                </h3>
                <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{userTicket.name}</span>
                    <span className="font-bold text-lg">
                      {formatPrice(userTicket.price)}
                    </span>
                  </div>
                  {userTicket.description && (
                    <p className="text-sm text-muted-foreground">
                      {userTicket.description}
                    </p>
                  )}
                </div>
              </div>
            )}

            <Separator />

            {/* Host Info */}
            {creator && (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">
                  برگزارکننده
                </h3>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {getInitials(creator.full_name, creator.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {creator.full_name || "کاربر هچ"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {creator.email}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Ticket Code & Meta */}
            <div className="flex items-center justify-between text-sm">
              <div className="space-y-1">
                <div className="text-muted-foreground">کد بلیط</div>
                <div className="font-mono font-bold text-lg tracking-wider">
                  {ticketCode}
                </div>
              </div>
              <div className="text-left space-y-1">
                <div className="text-muted-foreground">تاریخ ثبت‌نام</div>
                <div className="text-sm">
                  {formatRegistrationDate(registration.created_at)}
                </div>
              </div>
            </div>

            {/* Online Event Link (if approved and registered) */}
            {event.location_type === "online" &&
              event.link &&
              registration.status === "approved" && (
                <>
                  <Separator />
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                    <div className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                      <Icons.Link2 className="h-4 w-4" />
                      لینک شرکت در رویداد
                    </div>
                    <a
                      href={event.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline break-all font-medium"
                    >
                      {event.link}
                    </a>
                  </div>
                </>
              )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        <TicketDownloadButton
          eventTitle={event.title}
          ticketCode={ticketCode}
        />
        <Link href={`/events/${id}`} className="flex-1">
          <Button variant="outline" className="w-full">
            مشاهده رویداد
          </Button>
        </Link>
      </div>

      {/* Pending Notice */}
      {registration.status === "pending" && (
        <div className="mt-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-center">
          <Icons.Clock4 className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            بلیط شما در انتظار تأیید برگزارکننده است. بعد از تأیید می‌تونید از
            بلیطتون استفاده کنید.
          </p>
        </div>
      )}

      {/* Rejected Notice */}
      {registration.status === "rejected" && (
        <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-center">
          <Icons.X className="h-6 w-6 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            متأسفانه درخواست ثبت‌نام شما رد شده است.
          </p>
        </div>
      )}
    </div>
  );
}

