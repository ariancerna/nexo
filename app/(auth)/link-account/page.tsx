import { Link2, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";

import { cancelGoogleAccountLink, confirmGoogleAccountLink } from "@/app/auth/actions";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import {
  dashboardRoute,
  getConfirmedOAuthProviders,
  safeInternalPath,
  userHasLinkedProvider,
} from "@/lib/auth/account-linking";
import { authRoutes } from "@/lib/auth/routes";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function LinkAccountPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; next?: string }>;
}) {
  const { message, next: requestedNext } = await searchParams;
  const next = safeInternalPath(requestedNext, dashboardRoute);
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    redirect(authRoutes.login);
  }

  const { data: settings } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (
    !userHasLinkedProvider(userData.user, "google") ||
    getConfirmedOAuthProviders(settings?.preferences).includes("google")
  ) {
    redirect(next);
  }

  return (
    <AuthCard
      footer="Tú decides cómo iniciar sesión. Tus datos permanecen en una sola cuenta."
      message={message}
      showSocial={false}
      subtitle={`Ya existe una cuenta de Nexo con ${userData.user.email}. Google verificó el mismo correo.`}
      title="Encontramos tu cuenta"
    >
      <div className="mb-5 flex gap-3 rounded-xl bg-[var(--primary-soft)] p-4 text-sm leading-6 text-[var(--primary-strong)]">
        <Link2 aria-hidden className="mt-0.5 h-5 w-5 shrink-0" />
        <p>
          ¿Quieres vincular Google para poder entrar más rápido sin crear otra cuenta ni duplicar tus datos?
        </p>
      </div>

      <form action={confirmGoogleAccountLink}>
        <input name="next" type="hidden" value={next} />
        <Button className="w-full" type="submit" variant="primary">
          <ShieldCheck aria-hidden className="h-4 w-4" />
          Sí, usar Google con esta cuenta
        </Button>
      </form>

      <form action={cancelGoogleAccountLink} className="mt-3">
        <input name="next" type="hidden" value={next} />
        <Button className="w-full" type="submit" variant="secondary">
          No vincular Google
        </Button>
      </form>
    </AuthCard>
  );
}
