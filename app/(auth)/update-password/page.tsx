import { updatePassword } from "@/app/auth/actions";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireUser } from "@/lib/auth/session";

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  await requireUser();
  const { message } = await searchParams;

  return (
    <AuthCard
      footer="Usa una contraseña única que no utilices en otros servicios."
      message={message}
      showGoogle={false}
      subtitle="Crea una nueva contraseña para recuperar el acceso a tu espacio."
      title="Nueva contraseña"
    >
      <form action={updatePassword} className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-bold">Nueva contraseña</span>
          <Input autoComplete="new-password" className="auth-input" minLength={8} name="password" required type="password" />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-bold">Confirmar contraseña</span>
          <Input
            autoComplete="new-password"
            className="auth-input"
            minLength={8}
            name="passwordConfirmation"
            required
            type="password"
          />
        </label>
        <Button className="w-full" type="submit" variant="primary">
          Guardar contraseña
        </Button>
      </form>
    </AuthCard>
  );
}
