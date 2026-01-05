"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { TicketType, CityType, CategoryType, CITIES, CATEGORIES, CATEGORY_ICONS } from "@/types/database";
import { Icons } from "./icons";

export type EventFormValues = {
  title: string;
  description: string;
  date: string;
  time: string;
  location_type: "online" | "in_person";
  location: string;
  link: string;
  city: CityType | "";
  category: CategoryType;
  cover_image: string;
  tickets: TicketType[];
};

export interface EventFormProps {
  initial?: EventFormValues;
  submitLabel?: string;
  onSubmit: (values: EventFormValues) => Promise<void>;
}

const defaultTicket = (): TicketType => ({
  id: crypto.randomUUID(),
  name: "رایگان",
  price: 0,
  description: "",
  requires_approval: false,
  capacity: null,
});

export function EventForm({ initial, submitLabel, onSubmit }: EventFormProps) {
  const [values, setValues] = useState<EventFormValues>(
    initial ?? {
      title: "",
      description: "",
      date: "",
      time: "",
      location_type: "in_person",
      location: "",
      link: "",
      city: "",
      category: "other",
      cover_image: "",
      tickets: [defaultTicket()],
    }
  );
  const [tickets, setTickets] = useState<TicketType[]>(values.tickets);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initial) {
      setValues(initial);
      setTickets(initial.tickets.length ? initial.tickets : [defaultTicket()]);
    }
  }, [initial]);

  const handleChange = (field: keyof EventFormValues, value: string | CityType | CategoryType) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addTicket = () => {
    setTickets((prev) => [...prev, defaultTicket()]);
  };

  const removeTicket = (id: string) => {
    if (tickets.length <= 1) return;
    setTickets((prev) => prev.filter((ticket) => ticket.id !== id));
  };

  const updateTicket = (id: string, field: keyof TicketType, value: TicketType[keyof TicketType]) => {
    setTickets((prev) =>
      prev.map((ticket) => (ticket.id === id ? { ...ticket, [field]: value } : ticket))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit({ ...values, tickets });
    setIsSubmitting(false);
  };

  const buttonLabel = useMemo(() => submitLabel ?? (initial ? "ذخیره تغییرات" : "ساخت رویداد"), [
    initial,
    submitLabel,
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Icons.Sparkles className="h-6 w-6 text-primary" />
          {initial ? "ویرایش رویداد" : "ساخت رویداد جدید"}
        </CardTitle>
        <CardDescription>
          اطلاعات رویداد رو وارد کن تا لینک اختصاصی‌اش آماده بشه
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">عنوان رویداد *</Label>
              <Input
                id="title"
                placeholder="مثلاً: میتاپ برنامه‌نویس‌ها"
                value={values.title}
                onChange={(e) => handleChange("title", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">توضیحات</Label>
              <Textarea
                id="description"
                value={values.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={4}
                placeholder="درباره رویداد بنویس..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cover_image">لینک عکس کاور</Label>
              <Input
                id="cover_image"
                type="url"
                placeholder="https://..."
                value={values.cover_image}
                onChange={(e) => handleChange("cover_image", e.target.value)}
                dir="ltr"
                className="text-left"
              />
            </div>
            <div className="space-y-2">
              <Label>موضوع رویداد</Label>
              <Select
                value={values.category}
                onValueChange={(value) => handleChange("category", value as CategoryType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORIES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {CATEGORY_ICONS[key as CategoryType]} {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">تاریخ *</Label>
                <Input
                  id="date"
                  type="date"
                  value={values.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  required
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">ساعت *</Label>
                <Input
                  id="time"
                  type="time"
                  value={values.time}
                  onChange={(e) => handleChange("time", e.target.value)}
                  required
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>نوع رویداد *</Label>
              <Select
                value={values.location_type}
                onValueChange={(value) => handleChange("location_type", value as "online" | "in_person")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_person">
                    <Icons.MapPin className="h-4 w-4" />
                    حضوری
                  </SelectItem>
                  <SelectItem value="online">
                    <Icons.Globe className="h-4 w-4" />
                    آنلاین
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {values.location_type === "in_person" && (
              <>
                <div className="space-y-2">
                  <Label>شهر</Label>
                  <Select
                    value={values.city}
                    onValueChange={(value) => handleChange("city", value as CityType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="شهر برگزاری" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CITIES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">آدرس یا مکان</Label>
                  <Input
                    id="location"
                    placeholder="مثلاً: کافه لمیز"
                    value={values.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                  />
                </div>
              </>
            )}

            {values.location_type === "online" && (
              <div className="space-y-2">
                <Label htmlFor="link">لینک رویداد آنلاین</Label>
                <Input
                  id="link"
                  type="url"
                  placeholder="https://..."
                  value={values.link}
                  onChange={(e) => handleChange("link", e.target.value)}
                  dir="ltr"
                  className="text-left"
                />
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">بلیط‌ها</h3>
              <Button size="sm" variant="outline" onClick={addTicket} type="button">
                <Icons.Ticket className="h-4 w-4" />
                افزودن بلیط
              </Button>
            </div>

            <div className="space-y-4">
              {tickets.map((ticket, index) => (
                <Card key={ticket.id} className="bg-secondary/40">
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">بلیط {index + 1}</Badge>
                      {tickets.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          type="button"
                          onClick={() => removeTicket(ticket.id)}
                        >
                          حذف
                        </Button>
                      )}
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>نام بلیط *</Label>
                        <Input
                          value={ticket.name}
                          onChange={(e) => updateTicket(ticket.id, "name", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>قیمت (تومان)</Label>
                        <Input
                          type="number"
                          value={ticket.price || ""}
                          onChange={(e) => updateTicket(ticket.id, "price", parseInt(e.target.value) || 0)}
                          min={0}
                          dir="ltr"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>توضیحات</Label>
                      <Input
                        value={ticket.description}
                        onChange={(e) => updateTicket(ticket.id, "description", e.target.value)}
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>ظرفیت</Label>
                        <Input
                          type="number"
                          value={ticket.capacity || ""}
                          onChange={(e) =>
                            updateTicket(
                              ticket.id,
                              "capacity",
                              e.target.value ? parseInt(e.target.value) : null
                            )
                          }
                          dir="ltr"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>نیاز به تأیید</Label>
                        <Select
                          value={ticket.requires_approval ? "yes" : "no"}
                          onValueChange={(value) =>
                            updateTicket(ticket.id, "requires_approval", value === "yes")
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no">خیر</SelectItem>
                            <SelectItem value="yes">بله</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "در حال ارسال..." : buttonLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

