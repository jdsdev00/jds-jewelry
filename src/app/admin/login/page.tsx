import type { Metadata } from "next";

import { LoginForm } from "@/components/admin/login-form";
import { LockIcon } from "@/components/icons";
import { LogoMark } from "@/components/ui/logo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Panel administrador",
  robots: { index: false, follow: false },
};

export default async function LoginPage(props: PageProps<"/admin/login">) {
  const params = await props.searchParams;
  const next = typeof params.next === "string" ? params.next : "/admin";
  // Solo se aceptan rutas internas del panel: evita que un enlace preparado
  // desde fuera use el login como trampolín a otro sitio.
  const redirectTo = next.startsWith("/admin") ? next : "/admin";

  return (
    <main className="grid min-h-dvh flex-1 place-items-center bg-[radial-gradient(circle_at_50%_20%,#10301f_0%,var(--color-forest)_60%)] p-6">
      <div className="animate-scale-in w-full max-w-[360px] rounded-3xl bg-white px-8 py-10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
        <LogoMark size="lg" className="mx-auto mb-4" />
        <h1 className="font-serif text-[22px] text-forest">Panel administrador</h1>
        <p className="mt-1 mb-6 text-xs text-ink-soft">
          Acceso exclusivo para el equipo de {site.name}
        </p>

        <LoginForm redirectTo={redirectTo} />

        <p className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-ink-soft">
          <LockIcon className="size-[13px]" />
          Autenticación segura con Supabase
        </p>
      </div>
    </main>
  );
}
