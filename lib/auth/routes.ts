export const authRoutes = {
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  updatePassword: "/update-password",
  onboarding: "/onboarding",
} as const;

export const protectedRoutePrefixes = [
  "/notes",
  "/drive",
  "/tasks",
  "/calendar",
  "/spaces",
  "/saved",
  "/lists",
  "/focus",
  "/profile",
  "/settings",
] as const;
