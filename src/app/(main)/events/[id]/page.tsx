import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RegisterButton } from "./register-button";
import { EventActions } from "./event-actions";
import {
  Tables,
  CITIES,
  CATEGORIES,
  CATEGORY_ICONS,
  CityType,
  CategoryType,
  TicketType,
  RegistrationStatus,
} from "@/types/database";
import { Icons } from "@/components/icons";

type Event = Tables<"events">;
type Profile = Tables<"profiles">;

interface EventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: eventData } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (!eventData) {
    notFound();
  }

  const event = eventData as Event;

  // Get creator profile
  const { data: creatorData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", event.creator_id)
    .single();

  const creator = creatorData as Profile | null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get registration count
  const { count: registrationCount } = await supabase
    .from("registrations")
    .select("*", { count: "exact", head: true })
    .eq("event_id", id);

  // Check if current user is registered
  let isRegistered = false;
  let userTicketId: string | null = null;
  let registrationStatus: RegistrationStatus | null = null;
  
  // Get user profile if logged in
  let userProfile: Tables<"profiles"> | null = null;
  if (user) {
    const { data: registration } = await supabase
      .from("registrations")
      .select("id, ticket_id, status")
      .eq("event_id", id)
      .eq("user_id", user.id)
      .single();
    isRegistered = !!registration;
    userTicketId = (registration as { ticket_id: string | null } | null)?.ticket_id || null;
    registrationStatus = (registration as { status: RegistrationStatus } | null)?.status || null;

    // Get user profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    userProfile = profileData as Tables<"profiles"> | null;
  }

  const isCreator = user?.id === event.creator_id;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("fa-IR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = new Intl.DateTimeFormat("fa-IR", { month: "short" }).format(date);
    const day = new Intl.DateTimeFormat("fa-IR", { day: "numeric" }).format(date);
    return { month, day };
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":");
    return `${hours}:${minutes}`;
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "رایگان";
    return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) return name.slice(0, 2);
    return email.slice(0, 2).toUpperCase();
  };

  const tickets = (event.tickets || []) as TicketType[];
  const { month, day } = formatShortDate(event.date);

  return (
    <div className="min-h-screen">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Cover Image */}
        {event.cover_image && (
          <div className="aspect-[4/3] bg-muted overflow-hidden">
            <img
              src={event.cover_image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-4 space-y-6">
          {/* City Badge */}
          {event.city && (
            <Link href={`/events?city=${event.city}`}>
              <Badge variant="secondary" className="gap-2">
                <Icons.MapPin className="h-4 w-4" />
                {CITIES[event.city as CityType]}
              </Badge>
            </Link>
          )}

          {/* Title */}
          <h1 className="text-2xl font-bold">{event.title}</h1>

          {/* Host */}
          {creator && (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-secondary">
                  {getInitials(creator.full_name, creator.email)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                {creator.full_name || creator.email}
              </span>
            </div>
          )}

          {/* Date & Location */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center justify-center w-12 h-12 bg-secondary rounded-lg text-xs">
                <span className="text-muted-foreground">{month}</span>
                <span className="font-bold text-lg">{day}</span>
              </div>
              <div>
                <div className="font-medium">{formatDate(event.date)}</div>
                <div className="text-sm text-muted-foreground" dir="ltr">
                  {formatTime(event.time)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-secondary rounded-lg">
                {event.location_type === "online" ? (
                  <Icons.Globe className="h-6 w-6" />
                ) : (
                  <Icons.MapPin className="h-6 w-6" />
                )}
              </div>
              <div>
                <div className="font-medium">
                  {event.location_type === "online"
                    ? "رویداد آنلاین"
                    : event.location || "مکان اعلام می‌شه"}
                </div>
                {event.city && (
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Icons.MapPin className="h-4 w-4" />
                    {CITIES[event.city as CityType]}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tickets Card */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold">دریافت بلیط</h3>

              {tickets.length > 0 ? (
                <div className="space-y-3">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border"
                    >
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
                          <p className="text-xs text-muted-foreground">
                            {ticket.description}
                          </p>
                        )}
                      </div>
                      <div className="text-left font-medium">
                        {formatPrice(ticket.price)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">بلیطی تعریف نشده</p>
              )}

              {!isCreator && (
                <RegisterButton
                  event={event}
                  isRegistered={isRegistered}
                  isFull={false}
                  isLoggedIn={!!user}
                  userEmail={user?.email}
                  userProfile={userProfile}
                  tickets={tickets}
                  userTicketId={userTicketId}
                  registrationStatus={registrationStatus}
                />
              )}
            </CardContent>
          </Card>

          {/* About */}
          {event.description && (
            <div className="space-y-3">
              <h3 className="font-semibold">درباره رویداد</h3>
              <p className="text-muted-foreground whitespace-pre-wrap text-sm">
                {event.description}
              </p>
            </div>
          )}

          {/* Category & Stats */}
          <div className="flex items-center gap-4 text-sm">
            <Link href={`/events?category=${event.category}`}>
              <Badge variant="outline">
                {CATEGORY_ICONS[event.category as CategoryType]}{" "}
                {CATEGORIES[event.category as CategoryType]}
              </Badge>
            </Link>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Icons.Users className="h-4 w-4" />
              {registrationCount || 0} نفر شرکت می‌کنن
            </div>
          </div>

          {/* Host Section */}
          {creator && (
            <div className="space-y-3">
              <Separator />
              <h3 className="text-sm text-muted-foreground">برگزارکننده</h3>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">
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

          {isCreator && (
            <div className="pt-4">
              <EventActions eventId={event.id} />
            </div>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block container py-8">
        <div className="grid grid-cols-5 gap-8">
          {/* Left Column - Image & Host */}
          <div className="col-span-2 space-y-6">
            {event.cover_image && (
              <div className="aspect-[4/3] bg-muted rounded-xl overflow-hidden">
                <img
                  src={event.cover_image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Host Info */}
            {creator && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">برگزارکننده</span>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(creator.full_name, creator.email)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">
                    {creator.full_name || creator.email}
                  </span>
                </div>

                {event.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {event.description}
                  </p>
                )}
              </div>
            )}

            <Separator />

            {/* Going Count */}
            <div>
              <div className="text-sm text-muted-foreground mb-2">
                {registrationCount || 0} نفر شرکت می‌کنن
              </div>
            </div>

            {/* Category */}
            <Link href={`/events?category=${event.category}`}>
              <Badge variant="outline" className="text-sm">
                {CATEGORY_ICONS[event.category as CategoryType]}{" "}
                {CATEGORIES[event.category as CategoryType]}
              </Badge>
            </Link>

            {isCreator && (
              <div className="pt-4">
                <EventActions eventId={event.id} />
              </div>
            )}
          </div>

          {/* Right Column - Event Details */}
          <div className="col-span-3 space-y-6">
            {/* City Badge */}
            {event.city && (
              <Link href={`/events?city=${event.city}`}>
                <Badge variant="secondary" className="gap-2">
                  <Icons.MapPin className="h-4 w-4" />
                  {CITIES[event.city as CityType]}
                </Badge>
              </Link>
            )}

            {/* Title */}
            <h1 className="text-4xl font-bold">{event.title}</h1>

            {/* Date & Location */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center justify-center w-14 h-14 bg-secondary rounded-lg">
                  <span className="text-xs text-muted-foreground">{month}</span>
                  <span className="font-bold text-xl">{day}</span>
                </div>
                <div>
                  <div className="font-medium">{formatDate(event.date)}</div>
                  <div className="text-sm text-muted-foreground" dir="ltr">
                    {formatTime(event.time)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-14 h-14 bg-secondary rounded-lg">
                {event.location_type === "online" ? (
                  <Icons.Globe className="h-6 w-6" />
                ) : (
                  <Icons.MapPin className="h-6 w-6" />
                )}
              </div>
              <div>
                <div className="font-medium">
                  {event.location_type === "online"
                    ? "رویداد آنلاین"
                    : event.location || "آدرس بعد از ثبت‌نام"}
                </div>
                {event.city && (
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Icons.MapPin className="h-4 w-4" />
                    {CITIES[event.city as CityType]}
                  </div>
                )}
              </div>
            </div>

            {/* Tickets Card */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">دریافت بلیط</h3>

                {tickets.length > 0 ? (
                  <div className="space-y-3">
                    {tickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/50 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{ticket.name}</span>
                            {ticket.requires_approval && (
                              <Badge variant="outline" className="text-xs text-yellow-500 border-yellow-500/50">
                                نیاز به تأیید
                              </Badge>
                            )}
                            {ticket.capacity && (
                              <Badge variant="outline" className="text-xs">
                                {ticket.capacity} نفر ظرفیت
                              </Badge>
                            )}
                          </div>
                          {ticket.description && (
                            <p className="text-sm text-muted-foreground">
                              {ticket.description}
                            </p>
                          )}
                        </div>
                        <div className="text-left font-semibold text-lg">
                          {formatPrice(ticket.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">بلیطی تعریف نشده</p>
                )}

                {!isCreator && (
                  <RegisterButton
                    event={event}
                    isRegistered={isRegistered}
                    isFull={false}
                    isLoggedIn={!!user}
                    userEmail={user?.email}
                    userProfile={userProfile}
                    tickets={tickets}
                    userTicketId={userTicketId}
                    registrationStatus={registrationStatus}
                  />
                )}
              </CardContent>
            </Card>

            {/* About Event */}
            {event.description && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">درباره رویداد</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            )}

            {/* Online Link */}
            {event.location_type === "online" && event.link && isRegistered && (
            <div className="p-4 bg-secondary/50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                <Icons.Link2 className="h-4 w-4" />
                لینک رویداد
              </div>
                <a
                  href={event.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  {event.link}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
