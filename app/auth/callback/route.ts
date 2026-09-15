import { NextResponse, type NextRequest } from "next/server";

import { authRoutes } from "@/lib/auth/routes";
import { getOptionalSupabasePublicEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";

  if (!getOptionalSupabasePublicEnv()) {
    return NextResponse.redirect(new URL(`${authRoutes.login}?message=Supabase no está configurado.`, requestUrl));
  }

  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(next, requestUrl));
}
