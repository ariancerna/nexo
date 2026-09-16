export const authRoutes = {
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  updatePassword: "/update-password",
  onboarding: "/onboarding",
  linkAccount: "/link-account",
} as const;

export const protectedRoutePrefixes = [
  "/dashboard",
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
