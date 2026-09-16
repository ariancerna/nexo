import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";

import { sendPasswordReset } from "@/app/auth/actions";
import { AuthCard, EmailField } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;

  return (
    <AuthCard
      footer={
        <Link className="font-bold text-[var(--primary)]" href="/login">
          Volver a iniciar sesión
        </Link>
      }
      message={message}
      showSocial={false}
      subtitle="Ingresa el correo asociado a tu cuenta y te enviaremos un enlace seguro para restablecerla."
      title="¿Olvidaste tu contraseña?"
    >
      <form action={sendPasswordReset} className="space-y-4">
        <EmailField label="Correo electrónico registrado" />
        <Button className="w-full rounded-xl" type="submit" variant="primary">
          Enviar enlace de recuperación
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Button>
        <div className="flex gap-3 rounded-xl bg-[var(--surface-container-low)] p-4 text-xs leading-5 text-[var(--muted)]">
          <Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
          Si creaste tu cuenta con Google o Microsoft, puedes iniciar sesión directamente con ese proveedor.
        </div>
      </form>
    </AuthCard>
  );
}
