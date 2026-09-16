import Link from "next/link";
import { ArrowRight, UserRound } from "lucide-react";

import { signUpWithPassword } from "@/app/auth/actions";
import { AuthCard, EmailField } from "@/components/auth/auth-card";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { redirectAuthenticatedUser } from "@/lib/auth/session";

export default async function RegisterPage({
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
          ¿Ya tienes cuenta?{" "}
          <Link className="font-bold text-[var(--primary)]" href="/login">
            Iniciar sesión
          </Link>
        </>
      }
      message={message}
      socialLayout="split"
      subtitle="Empieza a organizar tus notas, tareas, archivos y espacios con calma."
      title="Crea tu cuenta en Nexo"
    >
      <form action={signUpWithPassword} className="space-y-4">
        <label className="block space-y-2">
          <span className="text-xs font-bold">Nombre completo</span>
          <span className="auth-input-wrap">
            <UserRound aria-hidden className="auth-input-icon" />
            <input autoComplete="name" className="auth-native-input" maxLength={80} name="fullName" placeholder="Nombre y apellido" />
          </span>
        </label>
        <EmailField />
        <PasswordField autoComplete="new-password" />
        <label className="flex items-start gap-2 text-xs leading-5 text-[var(--muted)]" htmlFor="terms">
          <input className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--primary)]" id="terms" name="terms" required type="checkbox" />
          <span>Acepto los términos de servicio y la política de privacidad de Nexo.</span>
        </label>
        <Button className="w-full rounded-xl" type="submit" variant="primary">
          Crear cuenta gratis
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Button>
      </form>
    </AuthCard>
  );
}
