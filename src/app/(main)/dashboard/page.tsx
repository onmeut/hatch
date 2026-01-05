import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tables,
  CITIES,
  CATEGORIES,
  CATEGORY_ICONS,
  CityType,
  CategoryType,
} from "@/types/database";
import { Icons } from "@/components/icons";

type Event = Tables<"events">;

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get user's created events
  const { data: myEventsData } = await supabase
    .from("events")
    .select("*")
    .eq("creator_id", user.id)
    .order("date", { ascending: true });

  const myEvents = (myEventsData || []) as Event[];

  // Get user's registered events
  const { data: registrationsData } = await supabase
    .from("registrations")
    .select("event_id")
    .eq("user_id", user.id);

  const eventIds = (registrationsData || []).map(
    (r: { event_id: string }) => r.event_id
  );

  let registeredEvents: Event[] = [];
  if (eventIds.length > 0) {
    const { data: regEventsData } = await supabase
      .from("events")
      .select("*")
      .in("id", eventIds)
      .order("date", { ascending: true });
    registeredEvents = (regEventsData || []) as Event[];
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("fa-IR", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const EventCard = ({ event, showTicketButton = false }: { event: Event; showTicketButton?: boolean }) => (
    <Card className="h-full hover:shadow-lg transition-all hover:border-primary/50 overflow-hidden">
      <Link href={`/${event.slug}`}>
        {event.cover_image && (
          <div className="aspect-video bg-muted overflow-hidden">
            <img
              src={event.cover_image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 mb-2">
            {event.city && (
              <Badge variant="secondary" className="text-xs">
                {CITIES[event.city as CityType]}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {CATEGORY_ICONS[event.category as CategoryType]}{" "}
              {CATEGORIES[event.category as CategoryType]}
            </Badge>
          </div>
          <CardTitle className="line-clamp-2 text-lg">{event.title}</CardTitle>
          <CardDescription className="flex items-center gap-2">
            <Icons.CalendarDays className="h-4 w-4" />
            <span>{formatDate(event.date)}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              {event.location_type === "online" ? (
                <>
                  <Icons.Globe className="h-4 w-4" />
                  آنلاین
                </>
              ) : (
                <>
                  <Icons.MapPin className="h-4 w-4" />
                  حضوری
                </>
              )}
            </span>
          </CardDescription>
        </CardHeader>
        {event.description && (
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {event.description}
            </p>
          </CardContent>
        )}
      </Link>
      {showTicketButton && (
        <CardContent className="pt-0">
          <Link href={`/${event.slug}/ticket`}>
            <Button variant="outline" size="sm" className="w-full">
              <Icons.Ticket className="h-4 w-4 ml-2" />
              مشاهده بلیط
            </Button>
          </Link>
        </CardContent>
      )}
    </Card>
  );

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">داشبورد 📊</h1>
          <p className="text-muted-foreground">
            رویدادهایی که ساختی یا توشون ثبت‌نام کردی
          </p>
        </div>
        <Link href="/events/new">
          <Button>ساخت رویداد جدید</Button>
        </Link>
      </div>

      <Tabs defaultValue="my-events" className="space-y-6">
        <TabsList>
          <TabsTrigger value="my-events">
            رویدادهای من ({myEvents.length})
          </TabsTrigger>
          <TabsTrigger value="registered">
            ثبت‌نام‌شده‌ها ({registeredEvents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-events">
          {myEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-lg font-semibold mb-2">
                  هنوز رویدادی نساختی
                </h3>
                <p className="text-muted-foreground mb-6">
                  اولین رویدادت رو بساز و لینکش رو با دوستات به اشتراک بذار
                </p>
                <Link href="/events/new">
                  <Button>ساخت اولین رویداد</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="registered">
          {registeredEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registeredEvents.map((event) => (
                <EventCard key={event.id} event={event} showTicketButton />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <div className="text-5xl mb-4">📭</div>
                <h3 className="text-lg font-semibold mb-2">
                  هنوز تو رویدادی ثبت‌نام نکردی
                </h3>
                <p className="text-muted-foreground mb-6">
                  برو رویدادها رو ببین و تو اونایی که دوست داری ثبت‌نام کن
                </p>
                <Link href="/events">
                  <Button>مشاهده رویدادها</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
