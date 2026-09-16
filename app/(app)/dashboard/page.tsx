import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import {
  accountLinkRoute,
  dashboardRoute,
  getConfirmedOAuthProviders,
  userHasLinkedProvider,
} from "@/lib/auth/account-linking";
import { authRoutes } from "@/lib/auth/routes";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    redirect(authRoutes.login);
  }

  const [{ data: profile }, { data: settings }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, username, timezone, avatar_url, username_changed_at, onboarding_completed")
      .eq("id", userData.user.id)
      .maybeSingle(),
    supabase.from("user_settings").select("preferences").eq("user_id", userData.user.id).maybeSingle(),
  ]);

  if (!profile?.onboarding_completed) {
    redirect(authRoutes.onboarding);
  }

  if (
    userHasLinkedProvider(userData.user, "google") &&
    !getConfirmedOAuthProviders(settings?.preferences).includes("google")
  ) {
    redirect(`${accountLinkRoute}?next=${encodeURIComponent(dashboardRoute)}`);
  }

  const avatarResult = profile.avatar_url
    ? await supabase.storage.from("nexo-avatars").createSignedUrl(profile.avatar_url, 60 * 60 * 24)
    : null;
  const email = userData.user.email ?? "";

  return (
    <AppShell
      user={{
        id: userData.user.id,
        email,
        name: profile.full_name || email.split("@")[0] || "Usuario Nexo",
        username: profile.username,
        timezone: profile.timezone || "America/Lima",
        avatarPath: profile.avatar_url,
        avatarUrl: avatarResult?.data?.signedUrl ?? null,
        usernameChangedAt: profile.username_changed_at,
      }}
    />
  );
}
