import { NextResponse, type NextRequest } from "next/server";

import { authRoutes } from "@/lib/auth/routes";
import { getOptionalSupabasePublicEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedNext = requestUrl.searchParams.get("next") ?? "/";
  const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/";

  if (!getOptionalSupabasePublicEnv()) {
    return NextResponse.redirect(new URL(`${authRoutes.login}?message=Supabase no está configurado.`, requestUrl));
  }

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, requestUrl));
    }
  }

  return NextResponse.redirect(
    new URL(`${authRoutes.login}?message=${encodeURIComponent("El enlace de acceso no es válido o ya venció.")}`, requestUrl),
  );
}
