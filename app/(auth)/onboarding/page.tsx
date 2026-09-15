import { completeOnboarding } from "@/app/auth/actions";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireUser } from "@/lib/auth/session";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  await requireUser();
  const { message } = await searchParams;

  return (
    <AuthCard
      footer="Podrás cambiar estos datos más adelante en Perfil."
      message={message}
      showGoogle={false}
      subtitle="Ajusta tu perfil inicial para personalizar Nexo."
      title="Configura tu perfil"
    >
      <form action={completeOnboarding} className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-bold">Nombre completo</span>
          <Input autoComplete="name" name="fullName" placeholder="Arian Cerna" />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-bold">Usuario</span>
          <Input autoComplete="username" name="username" placeholder="arian" />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-bold">Zona horaria</span>
          <Input name="timezone" placeholder="America/Lima" />
        </label>
        <Button className="w-full" type="submit" variant="primary">
          Entrar a Nexo
        </Button>
      </form>
    </AuthCard>
  );
}
