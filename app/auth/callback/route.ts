import { NextResponse, type NextRequest } from "next/server";

import { authRoutes } from "@/lib/auth/routes";
import { getOptionalSupabasePublicEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedNext = requestUrl.searchParams.get("next") ?? "/";
  let next = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/";

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
            next = "/";
          }
        }
      }

      return NextResponse.redirect(new URL(next, requestUrl));
    }
  }

  return NextResponse.redirect(
    new URL(`${authRoutes.login}?message=${encodeURIComponent("El enlace de acceso no es válido o ya venció.")}`, requestUrl),
  );
}
