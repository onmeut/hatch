import {
  CalendarDays,
  MapPin,
  Sparkles,
  Users,
  Ticket,
  Link2,
  Globe,
  Rocket,
  Clock4,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Edit,
  Trash2,
  Settings,
  MoreVertical,
  PlusCircle,
  LayoutDashboard,
  User,
  LogOut,
  Zap,
  Award,
  Building2,
  Info,
  Phone,
  Mail,
  Laptop,
  Briefcase,
  Brain,
  Palette,
  Leaf,
  Dumbbell,
  Heart,
  Coins,
  GraduationCap,
  Music,
  UtensilsCrossed,
  Landmark,
  Mountain,
  Waves,
} from "lucide-react";
import { CategoryType, CityType } from "@/types/database";

export const Icons = {
  CalendarDays,
  MapPin,
  Sparkles,
  Users,
  Ticket,
  Link2,
  Globe,
  Rocket,
  Clock4,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Edit,
  Trash2,
  Settings,
  MoreVertical,
  PlusCircle,
  LayoutDashboard,
  User,
  LogOut,
  Zap,
  Award,
  Building2,
  Info,
  Phone,
  Mail,
  Laptop,
  Briefcase,
  Brain,
  Palette,
  Leaf,
  Dumbbell,
  Heart,
  Coins,
  GraduationCap,
  Music,
  UtensilsCrossed,
  Landmark,
  Mountain,
  Waves,
};

// Category icon components with colors
export const CategoryIcon = ({ category, className }: { category: CategoryType; className?: string }) => {
  const iconConfig: Record<CategoryType, { Icon: any; color: string }> = {
    tech: { Icon: Laptop, color: "text-yellow-500" },
    business: { Icon: Briefcase, color: "text-blue-500" },
    art: { Icon: Palette, color: "text-green-500" },
    music: { Icon: Music, color: "text-pink-500" },
    sports: { Icon: Dumbbell, color: "text-orange-500" },
    food: { Icon: UtensilsCrossed, color: "text-orange-500" },
    education: { Icon: GraduationCap, color: "text-purple-500" },
    networking: { Icon: Users, color: "text-indigo-500" },
    startup: { Icon: Rocket, color: "text-cyan-500" },
    health: { Icon: Heart, color: "text-red-500" },
    other: { Icon: Sparkles, color: "text-gray-400" },
  };

  const { Icon, color } = iconConfig[category];
  return <Icon className={`${color} ${className || "h-6 w-6"}`} />;
};

// City icon components with colored circular backgrounds
export const CityIcon = ({ city, className }: { city: CityType; className?: string }) => {
  const iconConfig: Record<CityType, { Icon: any; bgColor: string; iconColor: string }> = {
    tehran: { Icon: Building2, bgColor: "bg-red-500", iconColor: "text-white" },
    mashhad: { Icon: Landmark, bgColor: "bg-blue-500", iconColor: "text-white" },
    isfahan: { Icon: Landmark, bgColor: "bg-cyan-500", iconColor: "text-white" },
    karaj: { Icon: Building2, bgColor: "bg-indigo-500", iconColor: "text-white" },
    shiraz: { Icon: Landmark, bgColor: "bg-orange-500", iconColor: "text-white" },
    tabriz: { Icon: Mountain, bgColor: "bg-green-500", iconColor: "text-white" },
    qom: { Icon: Landmark, bgColor: "bg-purple-500", iconColor: "text-white" },
    ahvaz: { Icon: Waves, bgColor: "bg-yellow-500", iconColor: "text-white" },
    kermanshah: { Icon: Mountain, bgColor: "bg-amber-600", iconColor: "text-white" },
    urmia: { Icon: Waves, bgColor: "bg-teal-500", iconColor: "text-white" },
    rasht: { Icon: Waves, bgColor: "bg-emerald-500", iconColor: "text-white" },
    zahedan: { Icon: Mountain, bgColor: "bg-rose-500", iconColor: "text-white" },
    hamadan: { Icon: Mountain, bgColor: "bg-violet-500", iconColor: "text-white" },
    kerman: { Icon: Mountain, bgColor: "bg-slate-500", iconColor: "text-white" },
    yazd: { Icon: Landmark, bgColor: "bg-amber-500", iconColor: "text-white" },
  };

  const { Icon, bgColor, iconColor } = iconConfig[city];
  return (
    <div className={`${bgColor} rounded-full p-3 flex items-center justify-center ${className || ""}`}>
      <Icon className={`${iconColor} h-6 w-6`} />
    </div>
  );
};
