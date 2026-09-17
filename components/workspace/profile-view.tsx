"use client";

import { useEffect, useState } from "react";
import { Camera, KeyRound, Save, ShieldCheck, UserRound } from "lucide-react";

import { saveProfile } from "@/app/auth/actions";
import type { WorkspaceUser } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusMessage } from "@/components/ui/status-message";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const timezoneOptions = [
  "America/Lima",
  "America/Bogota",
  "America/Mexico_City",
  "America/New_York",
  "America/Los_Angeles",
  "America/Santiago",
  "America/Argentina/Buenos_Aires",
  "Europe/Madrid",
  "Europe/London",
  "UTC",
];

export function ProfileView({
  user,
  onUserUpdate,
}: {
  user: WorkspaceUser;
  onUserUpdate: (user: WorkspaceUser) => void;
}) {
  const [profileMessage, setProfileMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const usernameAvailableAt = user.usernameChangedAt
    ? new Date(new Date(user.usernameChangedAt).getTime() + 30 * 24 * 60 * 60 * 1000)
    : null;
  const usernameLocked = Boolean(usernameAvailableAt && usernameAvailableAt.getTime() > Date.now());
  const timezones = timezoneOptions.includes(user.timezone) ? timezoneOptions : [user.timezone, ...timezoneOptions];

  const submitProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingProfile(true);
    setProfileMessage(null);

    const result = await saveProfile(new FormData(event.currentTarget));

    if (!result.ok) {
      setProfileMessage({ tone: "error", text: result.message });
      setSavingProfile(false);
      return;
    }

    onUserUpdate({ ...user, ...result.profile });
    setAvatarPreview(null);
    setProfileMessage({ tone: "success", text: result.message });
    setSavingProfile(false);
  };

  const submitPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const currentPassword = String(formData.get("currentPassword") ?? "");
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmation = String(formData.get("passwordConfirmation") ?? "");

    if (newPassword.length < 8) {
      setPasswordMessage({ tone: "error", text: "La nueva contraseña debe tener al menos 8 caracteres." });
      return;
    }

    if (newPassword !== confirmation) {
      setPasswordMessage({ tone: "error", text: "Las contraseñas nuevas no coinciden." });
      return;
    }

    setSavingPassword(true);
    setPasswordMessage(null);
    const supabase = createSupabaseBrowserClient();
    const signInResult = await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword });

    if (signInResult.error) {
      setPasswordMessage({ tone: "error", text: "La contraseña actual no es correcta." });
      setSavingPassword(false);
      return;
    }

    const updateResult = await supabase.auth.updateUser({ password: newPassword });

    if (updateResult.error) {
      setPasswordMessage({ tone: "error", text: "No pudimos actualizar la contraseña." });
      setSavingPassword(false);
      return;
    }

    form.reset();
    setPasswordMessage({ tone: "success", text: "Contraseña actualizada correctamente." });
    setSavingPassword(false);
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 border-b border-[var(--border)] pb-6 sm:flex-row sm:items-center">
        <Avatar name={user.name} url={avatarPreview ?? user.avatarUrl} />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Cuenta personal</p>
          <h2 className="mt-2 font-display text-3xl font-bold">{user.name}</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">{user.email}</p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-5 sm:p-6">
          <CardHeader>
            <div>
              <CardTitle>Editar perfil</CardTitle>
              <CardDescription>Actualiza tu identidad, zona horaria y foto privada.</CardDescription>
            </div>
            <UserRound aria-hidden className="h-5 w-5 text-[var(--primary)]" />
          </CardHeader>

          <form className="mt-6 space-y-5" onSubmit={submitProfile}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-bold">
                <span>Nombre completo</span>
                <Input defaultValue={user.name} maxLength={80} name="fullName" required />
              </label>
              <label className="space-y-2 text-sm font-bold">
                <span>Nombre de usuario</span>
                <Input
                  defaultValue={user.username ?? ""}
                  maxLength={20}
                  name="username"
                  pattern="[a-z0-9][a-z0-9-]{2,19}"
                  placeholder="tu-usuario"
                  readOnly={usernameLocked}
                />
              </label>
            </div>

            {usernameLocked && usernameAvailableAt ? (
              <p className="text-xs text-[var(--muted)]">
                Podrás cambiar tu usuario nuevamente el {usernameAvailableAt.toLocaleDateString("es", { dateStyle: "long" })}.
              </p>
            ) : (
              <p className="text-xs text-[var(--muted)]">El usuario puede cambiarse una vez cada 30 días.</p>
            )}

            <label className="block space-y-2 text-sm font-bold">
              <span>Zona horaria</span>
              <select
                className="nexo-inset h-11 w-full rounded-2xl px-3 text-sm font-medium outline-none"
                defaultValue={user.timezone}
                name="timezone"
              >
                {timezones.map((timezone) => (
                  <option key={timezone} value={timezone}>
                    {timezone.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>

            <label className="nexo-inset flex cursor-pointer items-center gap-3 rounded-2xl p-4 text-sm font-bold">
              <Camera aria-hidden className="h-5 w-5 text-[var(--primary)]" />
              <span className="min-w-0 flex-1">
                <span className="block">Cambiar foto</span>
                <span className="mt-1 block text-xs font-normal text-[var(--muted)]">JPG, PNG o WebP. Máximo 3 MB.</span>
              </span>
              <input
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                name="avatar"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  if (avatarPreview) URL.revokeObjectURL(avatarPreview);
                  setAvatarPreview(URL.createObjectURL(file));
                }}
                type="file"
              />
            </label>

            {profileMessage ? <StatusMessage {...profileMessage} /> : null}

            <Button disabled={savingProfile} type="submit" variant="primary">
              <Save aria-hidden className="h-4 w-4" />
              {savingProfile ? "Guardando..." : "Guardar cambios"}
            </Button>
          </form>
        </Card>

        <Card className="p-5 sm:p-6">
          <CardHeader>
            <div>
              <CardTitle>Seguridad</CardTitle>
              <CardDescription>Confirma tu contraseña actual antes de reemplazarla.</CardDescription>
            </div>
            <ShieldCheck aria-hidden className="h-5 w-5 text-[var(--primary)]" />
          </CardHeader>

          <form className="mt-6 space-y-4" onSubmit={submitPassword}>
            <label className="space-y-2 text-sm font-bold">
              <span>Contraseña actual</span>
              <Input autoComplete="current-password" name="currentPassword" required type="password" />
            </label>
            <label className="space-y-2 text-sm font-bold">
              <span>Nueva contraseña</span>
              <Input autoComplete="new-password" minLength={8} name="newPassword" required type="password" />
            </label>
            <label className="space-y-2 text-sm font-bold">
              <span>Confirmar contraseña</span>
              <Input autoComplete="new-password" minLength={8} name="passwordConfirmation" required type="password" />
            </label>

            {passwordMessage ? <StatusMessage {...passwordMessage} /> : null}

            <Button disabled={savingPassword} type="submit">
              <KeyRound aria-hidden className="h-4 w-4" />
              {savingPassword ? "Actualizando..." : "Cambiar contraseña"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

function Avatar({ name, url }: { name: string; url: string | null }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div
      aria-label={`Foto de ${name}`}
      className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-[var(--surface)] bg-[var(--primary-soft)] bg-cover bg-center font-display text-2xl font-bold text-[var(--primary-strong)] shadow-[0_12px_30px_var(--shadow-dark-soft)]"
      role="img"
      style={url ? { backgroundImage: `url("${url.replaceAll('"', "%22")}")` } : undefined}
    >
      {url ? <span className="sr-only">{name}</span> : initials || "NX"}
    </div>
  );
}
