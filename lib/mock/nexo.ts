import {
  CalendarDays,
  CheckCircle2,
  FileText,
  FolderOpen,
  Home,
  ListChecks,
  Settings,
  Sparkles,
  Timer,
} from "lucide-react";

export const navigationItems = [
  { label: "Inicio", href: "/", icon: Home, enabled: true },
  { label: "Notas", href: "/notes", icon: FileText, enabled: true },
  { label: "Drive", href: "/drive", icon: FolderOpen, enabled: true },
  { label: "Tareas", href: "/tasks", icon: CheckCircle2, enabled: true },
  { label: "Calendario", href: "/calendar", icon: CalendarDays, enabled: true },
  { label: "Listas", href: "/lists", icon: ListChecks, enabled: true },
  { label: "Focus", href: "/focus", icon: Timer, enabled: true },
  { label: "Ajustes", href: "/settings", icon: Settings, enabled: true },
] as const;

export const mobileNavigationItems = [
  navigationItems[0],
  navigationItems[1],
  { label: "Crear", href: "/create", icon: Sparkles, enabled: true },
  navigationItems[3],
  { label: "Perfil", href: "/profile", icon: Settings, enabled: true },
] as const;

export const spaces = [
  { name: "Universidad", count: 6, color: "#4f46e5" },
  { name: "Programación", count: 12, color: "#059669" },
  { name: "Personal", count: 4, color: "#d97706" },
] as const;

export const dashboardTasks = [
  {
    title: "Revisar paper sobre arquitecturas neumórficas",
    space: "Universidad",
    due: "Hoy, 19:00",
    priority: "Alta",
  },
  {
    title: "Refactorizar componente TopNavBar",
    space: "Programación",
    due: "Mañana",
    priority: "Media",
  },
  {
    title: "Subir entrega de prototipos Sprint #4",
    space: "Personal",
    due: "Completada",
    priority: "Lista",
  },
] as const;

export const recentNotes = [
  {
    title: "Arquitectura del Proyecto Nexo",
    space: "Programación",
    excerpt: "Estructura de componentes modulares, estado compartido y preparación para Supabase.",
    editedAt: "Editado hace 2h",
  },
  {
    title: "Seminario de Sistemas Distribuidos",
    space: "Universidad",
    excerpt: "Apuntes sobre consenso, replicación y puntos clave para la exposición final.",
    editedAt: "Ayer, 18:40",
  },
] as const;
