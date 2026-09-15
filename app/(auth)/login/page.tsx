import Link from "next/link";

import { signInWithPassword } from "@/app/auth/actions";
import { AuthCard, EmailField } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { redirectAuthenticatedUser } from "@/lib/auth/session";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  await redirectAuthenticatedUser();
  const { message } = await searchParams;

  return (
    <AuthCard
      footer={
        <>
          ¿No tienes cuenta?{" "}
          <Link className="font-bold text-[var(--primary)]" href="/register">
            Crear cuenta
          </Link>
        </>
      }
      message={message}
      subtitle="Tu espacio, todo en un solo lugar."
      title="Bienvenido a Nexo"
    >
      <form action={signInWithPassword} className="space-y-4">
        <EmailField />
        <label className="block space-y-2">
          <span className="text-sm font-bold">Contraseña</span>
          <Input autoComplete="current-password" name="password" required type="password" />
        </label>
        <div className="flex items-center justify-between text-sm">
          <Link className="font-semibold text-[var(--primary)]" href="/forgot-password">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <Button className="w-full" type="submit" variant="primary">
          Iniciar sesión
        </Button>
      </form>
    </AuthCard>
  );
}
