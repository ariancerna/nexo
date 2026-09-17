import { Link2, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";

import { cancelOAuthAccountLink, confirmOAuthAccountLink } from "@/app/auth/actions";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import {
  dashboardRoute,
  getConfirmedOAuthProviders,
  isOAuthProvider,
  oauthProviderLabel,
  safeInternalPath,
  userHasLinkedProvider,
} from "@/lib/auth/account-linking";
import { authRoutes } from "@/lib/auth/routes";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function LinkAccountPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; next?: string; provider?: string }>;
}) {
  const { message, next: requestedNext, provider: requestedProvider } = await searchParams;
  const next = safeInternalPath(requestedNext, dashboardRoute);
  const provider = isOAuthProvider(requestedProvider) ? requestedProvider : "google";
  const providerLabel = oauthProviderLabel(provider);
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
    !userHasLinkedProvider(userData.user, provider) ||
    getConfirmedOAuthProviders(settings?.preferences).includes(provider)
  ) {
    redirect(next);
  }

  return (
    <AuthCard
      footer="Tú decides cómo iniciar sesión. Tus datos permanecen en una sola cuenta."
      message={message}
      showSocial={false}
      subtitle={`Ya existe una cuenta de Nexo con ${userData.user.email}. ${providerLabel} verificó el mismo correo.`}
      title="Encontramos tu cuenta"
    >
      <div className="mb-5 flex gap-3 rounded-xl bg-[var(--primary-soft)] p-4 text-sm leading-6 text-[var(--primary-strong)]">
        <Link2 aria-hidden className="mt-0.5 h-5 w-5 shrink-0" />
        <p>
          ¿Quieres vincular {providerLabel} para poder entrar más rápido sin crear otra cuenta ni duplicar tus datos?
        </p>
      </div>

      <form action={confirmOAuthAccountLink}>
        <input name="next" type="hidden" value={next} />
        <input name="provider" type="hidden" value={provider} />
        <Button className="w-full" type="submit" variant="primary">
          <ShieldCheck aria-hidden className="h-4 w-4" />
          Sí, usar {providerLabel} con esta cuenta
        </Button>
      </form>

      <form action={cancelOAuthAccountLink} className="mt-3">
        <input name="next" type="hidden" value={next} />
        <input name="provider" type="hidden" value={provider} />
        <Button className="w-full" type="submit" variant="secondary">
          No vincular {providerLabel}
        </Button>
      </form>
    </AuthCard>
  );
}
