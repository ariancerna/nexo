import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

type LegalSection = {
  title: string;
  paragraphs: string[];
  items?: string[];
};

export function LegalPage({
  eyebrow,
  title,
  summary,
  sections,
}: {
  eyebrow: string;
  title: string;
  summary: string;
  sections: LegalSection[];
}) {
  return (
    <main className="min-h-screen bg-[#f7f8fc] text-[#171824]">
      <header className="sticky top-0 z-20 border-b border-[#e3e5ef] bg-white/95 px-4 backdrop-blur-lg sm:px-6">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4">
          <Link className="flex items-center gap-2.5" href="/" aria-label="Ir al inicio de Nexo">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#eef0ff]">
              <Image alt="" height={22} src="/icons/nexo-mark.svg" width={22} />
            </span>
            <span className="font-display text-lg font-black text-[#3327d4]">Nexo</span>
          </Link>
          <Link
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#dfe1eb] bg-white px-3 py-2 text-xs font-bold text-[#4f5062]"
            href="/"
          >
            <ArrowLeft aria-hidden className="h-4 w-4" />
            Volver a Nexo
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <section className="rounded-2xl border border-[#dedff0] bg-white p-6 shadow-[0_18px_45px_rgba(72,78,108,0.08)] sm:p-9">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#4f46e5]">
            <ShieldCheck aria-hidden className="h-4 w-4" />
            {eyebrow}
          </div>
          <h1 className="mt-4 font-display text-3xl font-black leading-tight sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[#66687b]">{summary}</p>
          <p className="mt-4 text-xs font-semibold text-[#858797]">Última actualización: 16 de septiembre de 2026</p>
        </section>

        <article className="mt-6 space-y-5">
          {sections.map((section, index) => (
            <section
              className="rounded-2xl border border-[#e3e5ee] bg-white p-6 shadow-[0_10px_28px_rgba(64,68,92,0.06)] sm:p-8"
              key={section.title}
            >
              <h2 className="font-display text-xl font-black">
                {index + 1}. {section.title}
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-[#606274] sm:text-base">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.items?.length ? (
                  <ul className="list-disc space-y-2 pl-5">
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </section>
          ))}
        </article>

        <nav className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#e2e4ec] pt-6 text-sm font-bold">
          <Link className="text-[#4f46e5]" href="/terminos">
            Términos de servicio
          </Link>
          <Link className="text-[#4f46e5]" href="/privacidad">
            Política de privacidad
          </Link>
        </nav>
      </div>
    </main>
  );
}
