import { updatePassword } from "@/app/auth/actions";
import { AuthCard } from "@/components/auth/auth-card";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
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
      showSocial={false}
      subtitle="Crea una nueva contraseña para recuperar el acceso a tu espacio."
      title="Nueva contraseña"
    >
      <form action={updatePassword} className="space-y-4">
        <PasswordField autoComplete="new-password" label="Nueva contraseña" />
        <PasswordField
          autoComplete="new-password"
          label="Confirmar contraseña"
          name="passwordConfirmation"
        />
        <Button className="w-full rounded-xl" type="submit" variant="primary">
          Guardar contraseña
        </Button>
      </form>
    </AuthCard>
  );
}
