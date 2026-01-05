"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { EventForm, EventFormValues } from "@/components/event-form";
import { Tables } from "@/types/database";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Icons } from "@/components/icons";

type Event = Tables<"events">;

interface EditEventPageProps {
  params: Promise<{ slug: string }>;
}

export default function EditEventPage({ params }: EditEventPageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const [initialValues, setInitialValues] = useState<EventFormValues | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: eventData, error } = await supabase
        .from("events")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error || !eventData) {
        toast.error("رویداد پیدا نشد");
        router.push("/events");
        return;
      }

      const event = eventData as Event;
      if (event.creator_id !== user.id) {
        toast.error("دسترسی نداری!");
        router.push(`/${slug}`);
        return;
      }

      setInitialValues({
        title: event.title,
        description: event.description || "",
        date: event.date,
        time: event.time,
        location_type: event.location_type,
        location: event.location || "",
        link: event.link || "",
        city: (event.city as EventFormValues["city"]) || "",
        category: (event.category as EventFormValues["category"]) || "other",
        cover_image: event.cover_image || "",
        tickets: event.tickets.length ? event.tickets : [],
      });
      setIsFetching(false);
    };

    fetchEvent();
  }, [slug, router, supabase]);

  const handleUpdate = async (values: EventFormValues) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("اول باید وارد بشی");
        router.push("/auth/login");
        return;
      }

      const updateData = {
        ...values,
        city: values.city || null,
        description: values.description || null,
        cover_image: values.cover_image || null,
        link: values.link || null,
        location: values.location || null,
      };

      const { data: updatedEvent, error } = await supabase
        .from("events")
        .update(updateData as never)
        .eq("slug", slug)
        .select("slug")
        .single();

      if (error) {
        throw error;
      }

      toast.success("رویداد بروز شد! ✨");
      router.push(`/${(updatedEvent as { slug: string }).slug}`);
    } catch (error) {
      console.error("Update error:", error);
      toast.error("یه مشکلی پیش اومد", {
        description: (error as Error).message,
      });
    }
  };

  if (isFetching || !initialValues) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-20 text-center text-muted-foreground">
            <Icons.Sparkles className="mx-auto mb-4 h-8 w-8 text-primary" />
            <CardDescription>در حال بارگذاری...</CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <EventForm
        initial={{ ...initialValues }}
        submitLabel="ذخیره تغییرات"
        onSubmit={handleUpdate}
      />
    </div>
  );
}
