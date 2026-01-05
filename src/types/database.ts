export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type RegistrationStatus = "pending" | "approved" | "rejected";

export type CityType =
  | "tehran"
  | "mashhad"
  | "isfahan"
  | "karaj"
  | "shiraz"
  | "tabriz"
  | "qom"
  | "ahvaz"
  | "kermanshah"
  | "urmia"
  | "rasht"
  | "zahedan"
  | "hamadan"
  | "kerman"
  | "yazd";

export type CategoryType =
  | "tech"
  | "business"
  | "art"
  | "music"
  | "sports"
  | "food"
  | "education"
  | "networking"
  | "startup"
  | "health"
  | "other";

export interface TicketType {
  id: string;
  name: string;
  price: number;
  description: string;
  requires_approval: boolean;
  capacity: number | null;
}

export const CITIES: Record<CityType, string> = {
  tehran: "تهران",
  mashhad: "مشهد",
  isfahan: "اصفهان",
  karaj: "کرج",
  shiraz: "شیراز",
  tabriz: "تبریز",
  qom: "قم",
  ahvaz: "اهواز",
  kermanshah: "کرمانشاه",
  urmia: "ارومیه",
  rasht: "رشت",
  zahedan: "زاهدان",
  hamadan: "همدان",
  kerman: "کرمان",
  yazd: "یزد",
};

export const CATEGORIES: Record<CategoryType, string> = {
  tech: "تکنولوژی",
  business: "کسب و کار",
  art: "هنر",
  music: "موسیقی",
  sports: "ورزش",
  food: "غذا",
  education: "آموزش",
  networking: "نتورکینگ",
  startup: "استارتاپ",
  health: "سلامت",
  other: "سایر",
};

export const CATEGORY_ICONS: Record<CategoryType, string> = {
  tech: "💻",
  business: "💼",
  art: "🎨",
  music: "🎵",
  sports: "⚽",
  food: "🍕",
  education: "📚",
  networking: "🤝",
  startup: "🚀",
  health: "💪",
  other: "✨",
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          date: string;
          time: string;
          location_type: "online" | "in_person";
          location: string | null;
          link: string | null;
          capacity: number | null;
          cover_image: string | null;
          creator_id: string;
          city: CityType | null;
          category: CategoryType;
          tickets: TicketType[];
          slug: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          date: string;
          time: string;
          location_type: "online" | "in_person";
          location?: string | null;
          link?: string | null;
          capacity?: number | null;
          cover_image?: string | null;
          creator_id: string;
          city?: CityType | null;
          category?: CategoryType;
          tickets?: TicketType[];
          slug?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          date?: string;
          time?: string;
          location_type?: "online" | "in_person";
          location?: string | null;
          link?: string | null;
          capacity?: number | null;
          cover_image?: string | null;
          creator_id?: string;
          city?: CityType | null;
          category?: CategoryType;
          tickets?: TicketType[];
          slug?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      registrations: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          ticket_id: string | null;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          status: RegistrationStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          ticket_id?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          status?: RegistrationStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          user_id?: string;
          ticket_id?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          status?: RegistrationStatus;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      location_type: "online" | "in_person";
      city_type: CityType;
      category_type: CategoryType;
      registration_status: RegistrationStatus;
    };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
