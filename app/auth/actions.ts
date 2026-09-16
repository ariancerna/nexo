"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { authRoutes } from "@/lib/auth/routes";
import {
  dashboardRoute,
  safeInternalPath,
  withConfirmedOAuthProvider,
} from "@/lib/auth/account-linking";
import { getOptionalSupabasePublicEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function authRedirect(path: string, message: string): never {
  redirect(`${path}?message=${encodeURIComponent(message)}`);
}

function accountLinkRedirect(message: string, next: string): never {
  redirect(`${authRoutes.linkAccount}?message=${encodeURIComponent(message)}&next=${encodeURIComponent(next)}`);
}

function requireBackend() {
  if (!getOptionalSupabasePublicEnv()) {
    authRedirect(authRoutes.login, "El servicio de acceso no está disponible en este momento.");
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

  redirect(dashboardRoute);
}

export async function signUpWithPassword(formData: FormData) {
  requireBackend();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const acceptedTerms = formData.get("terms") === "on";
  const siteUrl = await getSiteUrl();

  if (!email || !password) {
    authRedirect(authRoutes.register, "Escribe tu correo y una contraseña.");
  }

  if (!acceptedTerms) {
    authRedirect(authRoutes.register, "Debes aceptar los términos y la política de privacidad.");
  }

  if (fullName.length > 80) {
    authRedirect(authRoutes.register, "El nombre es demasiado largo.");
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

  authRedirect(authRoutes.login, "Cuenta creada. Revisa tu correo para confirmar el acceso.");
}

async function signInWithProvider(provider: "google" | "azure", label: "Google" | "Microsoft") {
  requireBackend();

  const siteUrl = await getSiteUrl();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${siteUrl}/auth/callback?next=/onboarding&provider=${provider}`,
      scopes: provider === "azure" ? "email" : undefined,
    },
  });

  const providerUrl = data.url;

  if (error || !providerUrl) {
    authRedirect(authRoutes.login, `No pudimos iniciar sesión con ${label}. Inténtalo nuevamente.`);
  }

  const providerReady = await providerEndpointIsReady(providerUrl);

  if (!providerReady) {
    authRedirect(authRoutes.login, `El acceso con ${label} todavía no está habilitado.`);
  }

  redirect(providerUrl);
}

export async function signInWithGoogle() {
  return signInWithProvider("google", "Google");
}

export async function signInWithMicrosoft() {
  return signInWithProvider("azure", "Microsoft");
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

export async function confirmGoogleAccountLink(formData: FormData) {
  requireBackend();

  const next = safeInternalPath(formData.get("next"));
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
  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: userData.user.id,
      preferences: withConfirmedOAuthProvider(settings?.preferences, "google"),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    accountLinkRedirect("No pudimos guardar tu elección. Inténtalo nuevamente.", next);
  }

  redirect(next);
}

export async function cancelGoogleAccountLink(formData: FormData) {
  requireBackend();

  const next = safeInternalPath(formData.get("next"));
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUserIdentities();
  const googleIdentity = data?.identities.find((identity) => identity.provider === "google");

  if (error || !googleIdentity) {
    accountLinkRedirect("No encontramos una identidad de Google para desvincular.", next);
  }

  const { error: unlinkError } = await supabase.auth.unlinkIdentity(googleIdentity);

  if (unlinkError) {
    accountLinkRedirect(
      "No pudimos desvincular Google en este momento. Google sigue vinculado; puedes conservar ese acceso o contactar a soporte.",
      next,
    );
  }

  await supabase.auth.signOut();
  authRedirect(authRoutes.login, "Google no fue vinculado. Puedes entrar con tu correo y contraseña.");
}

export type ProfileUpdateResult =
  | {
      ok: true;
      message: string;
      profile: {
        name: string;
        username: string | null;
        timezone: string;
        avatarPath: string | null;
        avatarUrl: string | null;
        usernameChangedAt: string | null;
      };
    }
  | { ok: false; message: string };

function isValidTimezone(timezone: string) {
  try {
    new Intl.DateTimeFormat("es", { timeZone: timezone }).format();
    return true;
  } catch {
    return false;
  }
}

export async function saveProfile(formData: FormData): Promise<ProfileUpdateResult> {
  if (!getOptionalSupabasePublicEnv()) {
    return { ok: false, message: "El servicio de cuenta no está disponible." };
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  const usernameValue = String(formData.get("username") ?? "").trim().toLowerCase();
  const timezone = String(formData.get("timezone") ?? "").trim();
  const avatar = formData.get("avatar");

  if (fullName.length < 2 || fullName.length > 80) {
    return { ok: false, message: "El nombre debe tener entre 2 y 80 caracteres." };
  }

  if (usernameValue && !/^[a-z0-9][a-z0-9-]{2,19}$/.test(usernameValue)) {
    return { ok: false, message: "El usuario debe tener entre 3 y 20 caracteres y usar letras, números o guiones." };
  }

  if (!isValidTimezone(timezone)) {
    return { ok: false, message: "Selecciona una zona horaria válida." };
  }

  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return { ok: false, message: "Tu sesión venció. Inicia sesión nuevamente." };
  }

  const { data: currentProfile, error: currentProfileError } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", userData.user.id)
    .single();

  if (currentProfileError) {
    return { ok: false, message: "No pudimos cargar tu perfil." };
  }

  let avatarPath = currentProfile.avatar_url;
  let uploadedAvatarPath: string | null = null;

  if (avatar instanceof File && avatar.size > 0) {
    const allowedTypes = new Map([
      ["image/jpeg", "jpg"],
      ["image/png", "png"],
      ["image/webp", "webp"],
    ]);
    const extension = allowedTypes.get(avatar.type);

    if (!extension) {
      return { ok: false, message: "La foto debe ser JPG, PNG o WebP." };
    }

    if (avatar.size > 3 * 1024 * 1024) {
      return { ok: false, message: "La foto no puede superar los 3 MB." };
    }

    uploadedAvatarPath = `${userData.user.id}/avatar-${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("nexo-avatars").upload(uploadedAvatarPath, avatar, {
      cacheControl: "3600",
      contentType: avatar.type,
      upsert: false,
    });

    if (uploadError) {
      return { ok: false, message: "No pudimos subir la foto. Inténtalo nuevamente." };
    }

    avatarPath = uploadedAvatarPath;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .update({
      avatar_url: avatarPath,
      full_name: fullName,
      timezone,
      username: usernameValue || null,
    })
    .eq("id", userData.user.id)
    .select("full_name, username, timezone, avatar_url, username_changed_at")
    .single();

  if (error) {
    if (uploadedAvatarPath) {
      await supabase.storage.from("nexo-avatars").remove([uploadedAvatarPath]);
    }

    if (error.message.includes("username_change_cooldown")) {
      return { ok: false, message: "El nombre de usuario sólo puede cambiarse una vez cada 30 días." };
    }

    if (error.code === "23505") {
      return { ok: false, message: "Ese nombre de usuario ya está en uso." };
    }

    return { ok: false, message: "No pudimos guardar el perfil. Revisa los datos e inténtalo otra vez." };
  }

  if (uploadedAvatarPath && currentProfile.avatar_url && currentProfile.avatar_url !== uploadedAvatarPath) {
    await supabase.storage.from("nexo-avatars").remove([currentProfile.avatar_url]);
  }

  const signedAvatar = profile.avatar_url
    ? await supabase.storage.from("nexo-avatars").createSignedUrl(profile.avatar_url, 60 * 60 * 24)
    : null;

  return {
    ok: true,
    message: "Perfil actualizado.",
    profile: {
      name: profile.full_name || fullName,
      username: profile.username,
      timezone: profile.timezone || timezone,
      avatarPath: profile.avatar_url,
      avatarUrl: signedAvatar?.data?.signedUrl ?? null,
      usernameChangedAt: profile.username_changed_at,
    },
  };
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

  if (username && !/^[a-z0-9][a-z0-9-]{2,19}$/i.test(username)) {
    authRedirect(authRoutes.onboarding, "El usuario debe tener entre 3 y 20 caracteres y usar sólo letras, números o guiones.");
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

  redirect(dashboardRoute);
}
