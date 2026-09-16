import { completeOnboarding } from "@/app/auth/actions";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const claims = await requireUser();

  if (claims?.sub) {
    const supabase = await createSupabaseServerClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", claims.sub)
      .maybeSingle();

    if (profile?.onboarding_completed) {
      redirect("/");
    }
  }
  const { message } = await searchParams;

  return (
    <AuthCard
      footer="Podrás cambiar estos datos más adelante en Perfil."
      message={message}
      showSocial={false}
      subtitle="Ajusta tu perfil inicial para personalizar Nexo."
      title="Configura tu perfil"
    >
      <form action={completeOnboarding} className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-bold">Nombre completo</span>
          <Input autoComplete="name" name="fullName" placeholder="Nombre y apellido" />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-bold">Usuario</span>
          <Input
            autoComplete="username"
            maxLength={20}
            minLength={3}
            name="username"
            pattern="[A-Za-z0-9][A-Za-z0-9-]{2,19}"
            placeholder="tu-usuario"
          />
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
