"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { authRoutes } from "@/lib/auth/routes";
import { getOptionalSupabasePublicEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function authRedirect(path: string, message: string): never {
  redirect(`${path}?message=${encodeURIComponent(message)}`);
}

function requireBackend() {
  if (!getOptionalSupabasePublicEnv()) {
    authRedirect(authRoutes.login, "Configura Supabase en .env.local antes de iniciar sesión.");
  }
}

async function getSiteUrl() {
  const headersList = await headers();
  return process.env.NEXT_PUBLIC_SITE_URL ?? headersList.get("origin") ?? "http://localhost:3000";
}

async function providerEndpointIsReady(providerUrl: string) {
  try {
    const response = await fetch(providerUrl, {
      cache: "no-store",
      redirect: "manual",
    });

    return response.status < 400;
  } catch {
    return true;
  }
}

export async function signInWithPassword(formData: FormData) {
  requireBackend();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    authRedirect(authRoutes.login, "Escribe tu correo y contraseña.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    authRedirect(authRoutes.login, "No pudimos iniciar sesión. Revisa tus datos e inténtalo nuevamente.");
  }

  redirect("/");
}

export async function signUpWithPassword(formData: FormData) {
  requireBackend();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const siteUrl = await getSiteUrl();

  if (!email || !password) {
    authRedirect(authRoutes.register, "Escribe tu correo y una contraseña.");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${siteUrl}/auth/callback?next=/onboarding`,
    },
  });

  if (error) {
    authRedirect(authRoutes.register, "No pudimos crear la cuenta. Inténtalo nuevamente.");
  }

  if (data.session) {
    redirect(authRoutes.onboarding);
  }

  authRedirect(authRoutes.login, "Cuenta creada. Revisa tu correo si Supabase requiere confirmación.");
}

export async function signInWithGoogle() {
  requireBackend();

  const siteUrl = await getSiteUrl();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl}/auth/callback?next=/onboarding`,
    },
  });

  const providerUrl = data.url;

  if (error || !providerUrl) {
    authRedirect(authRoutes.login, "No pudimos abrir Google OAuth. Revisa la configuración en Supabase.");
  }

  const providerReady = await providerEndpointIsReady(providerUrl);

  if (!providerReady) {
    authRedirect(
      authRoutes.login,
      "Google OAuth aún no está activo en Supabase. Activa el provider Google con Client ID y Secret.",
    );
  }

  redirect(providerUrl);
}

export async function sendPasswordReset(formData: FormData) {
  requireBackend();

  const email = String(formData.get("email") ?? "").trim();
  const siteUrl = await getSiteUrl();

  if (!email) {
    authRedirect(authRoutes.forgotPassword, "Escribe tu correo electrónico.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=${authRoutes.updatePassword}`,
  });

  if (error) {
    authRedirect(authRoutes.forgotPassword, "No pudimos enviar el correo. Inténtalo nuevamente.");
  }

  authRedirect(authRoutes.login, "Te enviamos instrucciones para recuperar tu contraseña.");
}

export async function updatePassword(formData: FormData) {
  requireBackend();

  const password = String(formData.get("password") ?? "");
  const passwordConfirmation = String(formData.get("passwordConfirmation") ?? "");

  if (password.length < 8) {
    authRedirect(authRoutes.updatePassword, "La contraseña debe tener al menos 8 caracteres.");
  }

  if (password !== passwordConfirmation) {
    authRedirect(authRoutes.updatePassword, "Las contraseñas no coinciden.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    authRedirect(authRoutes.updatePassword, "El enlace venció o no pudimos actualizar la contraseña.");
  }

  await supabase.auth.signOut();
  authRedirect(authRoutes.login, "Contraseña actualizada. Ya puedes iniciar sesión.");
}

export async function signOut() {
  requireBackend();

  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect(authRoutes.login);
}

export async function completeOnboarding(formData: FormData) {
  requireBackend();

  const fullName = String(formData.get("fullName") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const timezone = String(formData.get("timezone") ?? "").trim();
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    redirect(authRoutes.login);
  }

  const { error } = await supabase.from("profiles").upsert({
    id: userData.user.id,
    full_name: fullName || userData.user.user_metadata.full_name || null,
    username: username || null,
    timezone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    onboarding_completed: true,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    authRedirect(authRoutes.onboarding, "No pudimos guardar tu perfil. Inténtalo nuevamente.");
  }

  redirect("/");
}
