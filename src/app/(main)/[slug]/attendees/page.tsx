import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tables, TicketType, RegistrationStatus } from "@/types/database";
import { Icons } from "@/components/icons";
import { AttendeeActions } from "./attendee-actions";

type Event = Tables<"events">;
type Registration = Tables<"registrations">;

interface AttendeesPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ status?: string }>;
}

export default async function AttendeesPage({ params, searchParams }: AttendeesPageProps) {
  const { slug } = await params;
  const { status } = await searchParams;
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get event
  const { data: eventData } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!eventData) {
    notFound();
  }

  const event = eventData as Event;

  // Check if user is the creator
  if (event.creator_id !== user.id) {
    redirect(`/${slug}`);
  }

  // Get registrations
  const { data: registrationsData } = await supabase
    .from("registrations")
    .select("*")
    .eq("event_id", event.id)
    .order("created_at", { ascending: false });

  const registrations = (registrationsData || []) as Registration[];
  const tickets = (event.tickets || []) as TicketType[];

  // Count by status
  const counts = {
    all: registrations.length,
    approved: registrations.filter((r) => r.status === "approved").length,
    pending: registrations.filter((r) => r.status === "pending").length,
    rejected: registrations.filter((r) => r.status === "rejected").length,
  };

  // Filter registrations
  const filteredRegistrations = status
    ? registrations.filter((r) => r.status === status)
    : registrations;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "رایگان";
    return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
  };

  const getTicketById = (ticketId: string | null) => {
    return tickets.find((t) => t.id === ticketId);
  };

  const getStatusBadge = (status: RegistrationStatus) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="default" className="bg-green-500/20 text-green-500 border-green-500/30">
            <Icons.Check className="h-3 w-3 ml-1" />
            تأیید شده
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-500 border-yellow-500/50">
            <Icons.Clock4 className="h-3 w-3 ml-1" />
            در انتظار
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

  const getInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return first + last || "؟";
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Link href={`/${slug}`} className="hover:text-primary">
              {event.title}
            </Link>
            <Icons.ChevronLeft className="h-4 w-4" />
            <span>شرکت‌کننده‌ها</span>
          </div>
          <h1 className="text-2xl font-bold">لیست شرکت‌کننده‌ها</h1>
        </div>
        <Link href={`/${slug}`}>
          <Button variant="outline">
            <Icons.ChevronRight className="h-4 w-4 ml-2" />
            برگشت به رویداد
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icons.Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{counts.all}</div>
                <div className="text-sm text-muted-foreground">کل</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Icons.Check className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{counts.approved}</div>
                <div className="text-sm text-muted-foreground">تأیید شده</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Icons.Clock4 className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{counts.pending}</div>
                <div className="text-sm text-muted-foreground">در انتظار</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Icons.X className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{counts.rejected}</div>
                <div className="text-sm text-muted-foreground">رد شده</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={status || "all"} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" asChild>
            <Link href={`/${slug}/attendees`}>همه ({counts.all})</Link>
          </TabsTrigger>
          <TabsTrigger value="approved" asChild>
            <Link href={`/${slug}/attendees?status=approved`}>
              تأیید شده ({counts.approved})
            </Link>
          </TabsTrigger>
          <TabsTrigger value="pending" asChild>
            <Link href={`/${slug}/attendees?status=pending`}>
              در انتظار ({counts.pending})
            </Link>
          </TabsTrigger>
          <TabsTrigger value="rejected" asChild>
            <Link href={`/${slug}/attendees?status=rejected`}>
              رد شده ({counts.rejected})
            </Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={status || "all"}>
          {filteredRegistrations.length > 0 ? (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>شرکت‌کننده</TableHead>
                    <TableHead>تلفن</TableHead>
                    <TableHead>بلیط</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead>تاریخ ثبت‌نام</TableHead>
                    <TableHead className="w-[100px]">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((registration) => {
                    const ticket = getTicketById(registration.ticket_id);
                    return (
                      <TableRow key={registration.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {getInitials(registration.first_name, registration.last_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {registration.first_name} {registration.last_name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {/* We'd need to join with profiles to get email */}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell dir="ltr" className="text-left">
                          {registration.phone || "-"}
                        </TableCell>
                        <TableCell>
                          {ticket ? (
                            <div>
                              <div className="font-medium">{ticket.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatPrice(ticket.price)}
                              </div>
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(registration.status)}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDate(registration.created_at)}
                        </TableCell>
                        <TableCell>
                          <AttendeeActions
                            registrationId={registration.id}
                            currentStatus={registration.status}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <Icons.Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <CardTitle className="mb-2">شرکت‌کننده‌ای نیست</CardTitle>
                <CardDescription>
                  {status
                    ? "با این فیلتر شرکت‌کننده‌ای پیدا نشد"
                    : "هنوز کسی تو رویدادت ثبت‌نام نکرده"}
                </CardDescription>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

