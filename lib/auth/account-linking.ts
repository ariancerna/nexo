import type { User } from "@supabase/supabase-js";

import type { Json } from "@/types/database";

export const accountLinkRoute = "/link-account";
export const dashboardRoute = "/dashboard";
export const oauthProviders = ["google"] as const;
export type OAuthProvider = (typeof oauthProviders)[number];

export function isOAuthProvider(value: string | null | undefined): value is OAuthProvider {
  return oauthProviders.includes(value as OAuthProvider);
}

export function oauthProviderLabel(provider: OAuthProvider) {
  const labels: Record<OAuthProvider, string> = { google: "Google" };
  return labels[provider];
}

export function safeInternalPath(value: FormDataEntryValue | string | null | undefined, fallback = dashboardRoute) {
  const path = typeof value === "string" ? value : "";
  return path.startsWith("/") && !path.startsWith("//") && !path.includes("\\") ? path : fallback;
}

export function userHasLinkedProvider(user: User, provider: string) {
  const providers = new Set((user.identities ?? []).map((identity) => identity.provider));
  return providers.has("email") && providers.has(provider);
}

export function getConfirmedOAuthProviders(preferences: Json | null | undefined) {
  if (!preferences || typeof preferences !== "object" || Array.isArray(preferences)) return [];

  const value = preferences.confirmed_oauth_providers;
  return Array.isArray(value) ? value.filter((provider): provider is string => typeof provider === "string") : [];
}

export function withConfirmedOAuthProvider(preferences: Json | null | undefined, provider: string): Json {
  const current = preferences && typeof preferences === "object" && !Array.isArray(preferences) ? preferences : {};
  return {
    ...current,
    confirmed_oauth_providers: Array.from(new Set([...getConfirmedOAuthProviders(preferences), provider])),
  };
}
