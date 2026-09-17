import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  Cloud,
  Download,
  FileText,
  FolderOpen,
  LayoutDashboard,
  LockKeyhole,
  Monitor,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Timer,
  WifiOff,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    eyebrow: "Captura sin interrupciones",
    title: "Notas y editor práctico",
    description: "Ideas, documentación y decisiones conectadas con el espacio donde realmente pertenecen.",
    footer: "Guardado local y en la nube",
  },
  {
    icon: FolderOpen,
    eyebrow: "Archivos privados",
    title: "Drive organizado",
    description: "Sube, consulta y elimina documentos con acceso privado y contexto por proyecto.",
    footer: "Acceso cifrado y temporal",
  },
  {
    icon: CheckCircle2,
    eyebrow: "Claridad operativa",
    title: "Tareas con prioridad",
    description: "Fechas, estados y prioridades visibles para saber qué sigue sin reconstruir tu día.",
    footer: "Filtros por espacio",
  },
  {
    icon: Timer,
    eyebrow: "Atención profunda",
    title: "Focus y espacios",
    description: "Sesiones de concentración, agenda y recursos reunidos bajo cada área de tu vida.",
    footer: "Contexto sincronizado",
  },
];

export default function HomePage() {
  return <LandingPage />;
}

function LandingPage() {
  return (
    <main className="landing-page min-h-screen bg-[#f7f8fc] text-[#151624]">
      <header className="sticky top-0 z-50 border-b border-[#e5e7f0] bg-white/94 px-4 backdrop-blur-lg sm:px-6 lg:px-8">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4">
          <Link className="flex items-center gap-2.5" href="/">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#eef0ff]">
              <Image alt="" height={22} src="/icons/nexo-mark.svg" width={22} />
            </span>
            <span>
              <span className="block font-display text-lg font-black leading-none text-[#3327d4]">Nexo</span>
              <span className="mt-1 block text-[0.55rem] font-bold uppercase tracking-[0.14em] text-[#77798c]">Personal hub</span>
            </span>
          </Link>

          <nav aria-label="Secciones" className="hidden items-center gap-6 text-xs font-bold text-[#66687b] md:flex">
            <a href="#producto">Producto</a>
            <a href="#modulos">Módulos</a>
            <a href="#pwa">PWA</a>
            <a href="#seguridad">Seguridad</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link className="hidden rounded-lg px-3 py-2 text-xs font-bold text-[#4f5062] hover:bg-[#f0f1f7] sm:inline-flex" href="/login">
              Iniciar sesión
            </Link>
            <Link className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#4f46e5] px-4 py-2 text-xs font-bold text-white shadow-[0_8px_18px_rgba(79,70,229,0.24)]" href="/register">
              Registrarme gratis
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <section
        className="relative overflow-hidden px-4 pb-16 pt-16 sm:px-6 sm:pt-20 lg:px-8"
        data-testid="landing-hero"
        id="producto"
      >
        <Image
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
          data-testid="landing-hero-image"
          fill
          priority
          sizes="100vw"
          src="/images/nexo-hero-light.png"
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-white/64" />
        <div className="relative mx-auto max-w-7xl" data-testid="landing-hero-content">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#dedff0] bg-white px-3 py-1.5 text-[0.68rem] font-bold text-[#55576a] shadow-sm">
              <Sparkles aria-hidden className="h-3.5 w-3.5 text-[#4f46e5]" />
              Tu espacio personal para web y PWA
            </div>
            <h1 className="mt-6 font-display text-4xl font-black leading-[1.08] text-[#11121d] sm:text-6xl">
              Nexo para organizar tu vida digital con calma y estructura.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#66687b]">
              Reúne notas, tareas, archivos, calendario y sesiones Focus en un solo lugar, con espacios que mantienen
              cada proyecto en contexto.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#4f46e5] px-5 py-2.5 text-sm font-bold text-white shadow-[0_9px_22px_rgba(79,70,229,0.25)]" href="/register">
                Comenzar gratis
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
              <a className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#dfe1eb] bg-white px-5 py-2.5 text-sm font-bold text-[#3f4050]" href="#modulos">
                Ver cómo funciona
              </a>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-semibold text-[#77798c]">
              <span className="flex items-center gap-1.5"><LockKeyhole className="h-3.5 w-3.5 text-[#4f46e5]" />Datos privados</span>
              <span className="flex items-center gap-1.5"><WifiOff className="h-3.5 w-3.5 text-[#4f46e5]" />Funciona offline</span>
              <span className="flex items-center gap-1.5"><Cloud className="h-3.5 w-3.5 text-[#4f46e5]" />Sincronización segura</span>
            </div>
          </div>

          <ProductPreview />
        </div>
      </section>

      <section className="border-y border-[#e9eaf1] bg-white px-4 py-20 sm:px-6 lg:px-8" id="modulos">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#4f46e5]">Un sistema conectado</p>
            <h2 className="mt-3 font-display text-3xl font-black sm:text-4xl">Diseñado para cada dimensión de tu día.</h2>
            <p className="mt-4 leading-7 text-[#696b7d]">Cada módulo comparte los mismos espacios, búsqueda y preferencias. Nada queda aislado.</p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article className="rounded-lg border border-[#e3e5ee] bg-[#fafbfe] p-6 shadow-[0_12px_28px_rgba(64,68,92,0.08)]" key={feature.title}>
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#ecebff] text-[#4f46e5]"><Icon aria-hidden className="h-5 w-5" /></span>
                  <p className="mt-5 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#8a8b9b]">{feature.eyebrow}</p>
                  <h3 className="mt-2 font-display text-xl font-bold">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#686a7b]">{feature.description}</p>
                  <p className="mt-6 border-t border-[#e5e7ef] pt-4 text-xs font-bold text-[#595b70]">{feature.footer}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8" id="pwa">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#dedff0] bg-white px-3 py-1.5 text-xs font-bold text-[#5f6175]"><Smartphone className="h-4 w-4 text-[#4f46e5]" />Progressive Web App</p>
            <h2 className="mt-5 max-w-xl font-display text-4xl font-black leading-tight">Instálalo en segundos. Úsalo donde estés.</h2>
            <p className="mt-5 max-w-xl leading-7 text-[#696b7d]">Nexo se instala como una aplicación, conserva una copia local y vuelve a sincronizar cuando recuperas conexión.</p>
            <div className="mt-7 space-y-4">
              <Benefit icon={WifiOff} title="Trabajo sin conexión" description="Tus cambios quedan disponibles incluso sin internet." />
              <Benefit icon={Monitor} title="Una experiencia en cada pantalla" description="Escritorio, tablet y móvil comparten el mismo workspace." />
              <Benefit icon={ShieldCheck} title="Privacidad por cuenta" description="Cada usuario sólo puede consultar sus propios datos." />
            </div>
          </div>
          <InstallPreview />
        </div>
      </section>

      <section className="border-y border-[#e5e7ef] bg-white px-4 py-20 sm:px-6 lg:px-8" id="seguridad">
        <div className="mx-auto max-w-5xl text-center">
          <span className="mx-auto grid h-11 w-11 place-items-center rounded-lg bg-[#ecebff] text-[#4f46e5]"><ShieldCheck className="h-5 w-5" /></span>
          <h2 className="mt-5 font-display text-3xl font-black sm:text-4xl">Empieza a organizar tu día hoy mismo.</h2>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-[#696b7d]">Crea tu espacio, define tus áreas y reúne el trabajo que hoy vive disperso.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#4f46e5] px-5 py-2.5 text-sm font-bold text-white" href="/register">Crear cuenta gratis<ArrowRight className="h-4 w-4" /></Link>
            <Link className="inline-flex min-h-11 items-center rounded-lg border border-[#dfe1eb] px-5 py-2.5 text-sm font-bold text-[#454657]" href="/login">Iniciar sesión</Link>
          </div>
        </div>
      </section>

      <footer className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 border-t border-[#e2e4ec] pt-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 font-display text-lg font-black text-[#3327d4]"><Image alt="" height={20} src="/icons/nexo-mark.svg" width={20} />Nexo</div>
            <p className="mt-3 max-w-sm text-sm leading-6 text-[#77798c]">Un hub personal para organizar ideas, responsabilidades y archivos con claridad.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#8b8c9b]">
            <Link className="font-bold hover:text-[#4f46e5]" href="/terminos">Términos</Link>
            <Link className="font-bold hover:text-[#4f46e5]" href="/privacidad">Privacidad</Link>
            <span>© 2026 Nexo. Privacidad y foco por diseño.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

function ProductPreview() {
  const tasks = ["Revisar notas de arquitectura", "Subir reporte de avance", "Completar dos bloques de Focus"];
  return (
    <div className="mx-auto mt-14 max-w-5xl rounded-lg border border-[#dfe2ec] bg-[#eef0f7] p-3 shadow-[0_24px_55px_rgba(76,81,112,0.18)] sm:p-5">
      <div className="overflow-hidden rounded-lg border border-[#e1e3ec] bg-white">
        <div className="flex h-9 items-center justify-between border-b border-[#e8e9f0] px-4 text-[0.62rem] text-[#858797]">
          <span>nexo.app/dashboard</span><span className="flex items-center gap-1.5 font-bold text-[#168768]"><span className="h-1.5 w-1.5 rounded-full bg-[#22c58b]" />Espacio personal activo</span>
        </div>
        <div className="grid min-h-[310px] grid-cols-1 sm:grid-cols-[180px_1fr]">
          <aside className="hidden border-r border-[#e8e9f0] bg-[#f8f9fc] p-4 sm:block">
            <div className="mb-5 flex items-center gap-2 font-display text-sm font-black text-[#4f46e5]"><Image alt="" height={18} src="/icons/nexo-mark.svg" width={18} />Nexo</div>
            {[LayoutDashboard, FileText, CheckCircle2, FolderOpen, Timer].map((Icon, index) => (
              <div className={index === 0 ? "mb-1 flex items-center gap-2 rounded-md bg-[#eae9ff] px-2 py-2 text-[0.68rem] font-bold text-[#4036cf]" : "mb-1 flex items-center gap-2 px-2 py-2 text-[0.68rem] font-semibold text-[#717385]"} key={index}>
                <Icon className="h-3.5 w-3.5" />{["Inicio", "Notas", "Tareas", "Drive", "Focus"][index]}
              </div>
            ))}
          </aside>
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div><p className="font-display text-base font-black">Buenos días</p><p className="text-[0.68rem] text-[#858797]">Esto es lo importante para hoy.</p></div>
              <span className="relative grid h-8 w-8 place-items-center rounded-md border border-[#e2e4ec]"><Bell className="h-4 w-4 text-[#626477]" /><span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#ef4444]" /></span>
            </div>
            <div className="mt-5 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-lg border border-[#e5e6ee] bg-[#fafbfe] p-4">
                <div className="flex items-center justify-between"><p className="text-xs font-black">Tareas prioritarias</p><span className="rounded-full bg-[#ecebff] px-2 py-1 text-[0.6rem] font-bold text-[#4f46e5]">3 pendientes</span></div>
                <div className="mt-3 space-y-2">{tasks.map((task, index) => <div className="flex items-center gap-2 rounded-md bg-white p-2 text-[0.66rem] font-semibold text-[#55576a]" key={task}><span className={index === 0 ? "grid h-4 w-4 place-items-center rounded bg-[#4f46e5] text-white" : "h-4 w-4 rounded border border-[#d5d7e1]"}>{index === 0 ? <Check className="h-3 w-3" /> : null}</span>{task}</div>)}</div>
              </div>
              <div className="rounded-lg border border-[#e5e6ee] bg-[#fafbfe] p-4 text-center">
                <p className="text-xs font-black">Focus</p><p className="mt-7 font-display text-3xl font-black text-[#4f46e5]">25:00</p><p className="mt-1 text-[0.58rem] uppercase tracking-[0.12em] text-[#858797]">Enfoque puro</p><button className="mt-5 rounded-md bg-[#4f46e5] px-5 py-2 text-[0.65rem] font-bold text-white">Iniciar</button>
              </div>
            </div>
            <div className="mt-3 rounded-lg border border-[#e5e6ee] bg-[#fafbfe] p-4">
              <p className="text-xs font-black">Archivos recientes</p><div className="mt-3 grid grid-cols-3 gap-2">{["Estrategia.pdf", "Finanzas.xlsx", "Ideas.md"].map((file) => <div className="flex min-w-0 items-center gap-2 rounded-md bg-white p-2 text-[0.62rem] font-semibold text-[#626477]" key={file}><FileText className="h-3.5 w-3.5 shrink-0 text-[#4f46e5]" /><span className="truncate">{file}</span></div>)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Benefit({ icon: Icon, title, description }: { icon: typeof ShieldCheck; title: string; description: string }) {
  return <div className="flex gap-3"><span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#ecebff] text-[#4f46e5]"><Icon className="h-4 w-4" /></span><div><p className="text-sm font-bold">{title}</p><p className="mt-1 text-sm text-[#77798c]">{description}</p></div></div>;
}

function InstallPreview() {
  return (
    <div className="rounded-lg border border-[#e0e2eb] bg-white p-5 shadow-[0_20px_45px_rgba(66,70,96,0.14)]">
      <div className="flex items-center gap-3 border-b border-[#e7e8ef] pb-4"><span className="grid h-10 w-10 place-items-center rounded-lg bg-[#4f46e5]"><Image alt="" height={23} src="/icons/nexo-mark.svg" width={23} /></span><div><p className="text-sm font-black">Instalar Nexo</p><p className="text-xs text-[#858797]">PWA · menos de 3 MB</p></div></div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">{[[Monitor, "macOS"], [Monitor, "Windows"], [Smartphone, "iOS / Android"]].map(([Icon, label]) => { const DeviceIcon = Icon as typeof Monitor; return <div className="rounded-lg bg-[#f3f4f9] p-3" key={label as string}><DeviceIcon className="mx-auto h-4 w-4 text-[#56586b]" /><p className="mt-2 text-[0.62rem] font-bold">{label as string}</p></div>; })}</div>
      <div className="mt-4 space-y-2 rounded-lg bg-[#f5f6fa] p-4 text-xs font-semibold text-[#626477]"><p className="flex gap-2"><Check className="h-4 w-4 text-[#4f46e5]" />Acceso desde el escritorio</p><p className="flex gap-2"><Check className="h-4 w-4 text-[#4f46e5]" />Actualizaciones automáticas</p><p className="flex gap-2"><Check className="h-4 w-4 text-[#4f46e5]" />Disponible sin conexión</p></div>
      <Link className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#4f46e5] text-sm font-bold text-white" href="/register"><Download className="h-4 w-4" />Probar Nexo</Link>
    </div>
  );
}
