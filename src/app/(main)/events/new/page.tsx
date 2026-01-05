"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { EventForm, EventFormValues } from "@/components/event-form";

export default function NewEventPage() {
  const router = useRouter();
  const supabase = createClient();

  const handleCreate = async (values: EventFormValues) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("اول باید وارد بشی");
        router.push("/auth/login");
        return;
      }

      const insertData = {
        ...values,
        city: values.city || null,
        description: values.description || null,
        cover_image: values.cover_image || null,
        link: values.link || null,
        location: values.location || null,
        creator_id: user.id,
        capacity: null,
      };

      const { data, error } = await supabase
        .from("events")
        .insert(insertData as never)
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success("رویدادت ساخته شد! 🎉");
      router.push(`/${(data as { slug: string }).slug}`);
    } catch (error) {
      console.error("Create event error:", error);
      toast.error("یه مشکلی پیش اومد", {
        description: (error as Error).message,
      });
    }
  };

  return (
    <div className="container py-8">
      <EventForm onSubmit={handleCreate} submitLabel="ساخت رویداد" />
    </div>
  );
}
