import Link from "next/link";

import { signUpWithPassword } from "@/app/auth/actions";
import { AuthCard, EmailField } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      subtitle="Crea tu espacio personal y empieza a organizar tus áreas."
      title="Crear cuenta"
    >
      <form action={signUpWithPassword} className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-bold">Nombre</span>
          <Input autoComplete="name" className="auth-input" name="fullName" placeholder="Arian Cerna" />
        </label>
        <EmailField />
        <label className="block space-y-2">
          <span className="text-sm font-bold">Contraseña</span>
          <Input autoComplete="new-password" className="auth-input" minLength={8} name="password" required type="password" />
        </label>
        <Button className="w-full" type="submit" variant="primary">
          Crear cuenta
        </Button>
      </form>
    </AuthCard>
  );
}
