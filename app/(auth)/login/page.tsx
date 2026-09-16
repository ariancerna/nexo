import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { signInWithPassword } from "@/app/auth/actions";
import { AuthCard, EmailField } from "@/components/auth/auth-card";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
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
      title="Nexo"
    >
      <form action={signInWithPassword} className="space-y-4">
        <EmailField />
        <PasswordField showForgot />
        <Button className="w-full rounded-xl" type="submit" variant="primary">
          Iniciar sesión
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Button>
      </form>
    </AuthCard>
  );
}
