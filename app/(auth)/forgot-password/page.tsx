import Link from "next/link";

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
      showGoogle={false}
      subtitle="Te enviaremos un enlace para volver a entrar a tu cuenta."
      title="Recuperar contraseña"
    >
      <form action={sendPasswordReset} className="space-y-4">
        <EmailField />
        <Button className="w-full" type="submit" variant="primary">
          Enviar instrucciones
        </Button>
      </form>
    </AuthCard>
  );
}
