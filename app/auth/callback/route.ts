import { NextResponse, type NextRequest } from "next/server";

import { authRoutes } from "@/lib/auth/routes";
import {
  accountLinkRoute,
  dashboardRoute,
  getConfirmedOAuthProviders,
  isOAuthProvider,
  oauthProviderLabel,
  safeInternalPath,
  userHasLinkedProvider,
} from "@/lib/auth/account-linking";
import { getOptionalSupabasePublicEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const provider = requestUrl.searchParams.get("provider");
  let next = safeInternalPath(requestUrl.searchParams.get("next"));

  if (!getOptionalSupabasePublicEnv()) {
    return NextResponse.redirect(
      new URL(`${authRoutes.login}?message=${encodeURIComponent("El servicio de acceso no está disponible.")}`, requestUrl),
    );
  }

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (next === authRoutes.onboarding) {
        const { data: userData } = await supabase.auth.getUser();

        if (userData.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("onboarding_completed")
            .eq("id", userData.user.id)
            .maybeSingle();

          if (profile?.onboarding_completed) {
            next = dashboardRoute;
          }
        }
      }

      if (isOAuthProvider(provider)) {
        const { data: userData } = await supabase.auth.getUser();

        if (userData.user && userHasLinkedProvider(userData.user, provider)) {
          const { data: settings } = await supabase
            .from("user_settings")
            .select("preferences")
            .eq("user_id", userData.user.id)
            .maybeSingle();

          if (!getConfirmedOAuthProviders(settings?.preferences).includes(provider)) {
            return NextResponse.redirect(
              new URL(
                `${accountLinkRoute}?next=${encodeURIComponent(next)}&provider=${encodeURIComponent(provider)}`,
                requestUrl,
              ),
            );
          }
        }
      }

      return NextResponse.redirect(new URL(next, requestUrl));
    }
  }

  const providerMessage = isOAuthProvider(provider)
    ? `No pudimos completar el acceso con ${oauthProviderLabel(provider)}. Verifica que el proveedor esté habilitado e inténtalo nuevamente.`
    : "El enlace de acceso no es válido o ya venció.";

  return NextResponse.redirect(
    new URL(`${authRoutes.login}?message=${encodeURIComponent(providerMessage)}`, requestUrl),
  );
}
