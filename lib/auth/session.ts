import { redirect } from "next/navigation";

import { authRoutes } from "@/lib/auth/routes";
import { dashboardRoute } from "@/lib/auth/account-linking";
import { getOptionalSupabasePublicEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  if (!getOptionalSupabasePublicEnv()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return data.user;
}

export async function requireUser() {
  if (!getOptionalSupabasePublicEnv()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    redirect(authRoutes.login);
  }

  return data.claims;
}

export async function redirectAuthenticatedUser() {
  const user = await getCurrentUser();

  if (user) {
    redirect(dashboardRoute);
  }
}
