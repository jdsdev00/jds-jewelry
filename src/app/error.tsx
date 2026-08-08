"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/logo";

/**
 * Red de seguridad para fallos inesperados (por ejemplo, Supabase caído).
 * Muestra un mensaje entendible en vez de la pantalla de error de Next.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-dvh flex-1 place-items-center px-6 text-center">
      <div className="animate-rise">
        <LogoMark size="lg" className="mx-auto mb-5" />
        <h1 className="font-serif text-[26px] text-forest">
          Algo no cargó bien
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-[13px] text-ink-soft">
          Tuvimos un problema al traer la información. Vuelve a intentarlo en un
          momento.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <Button onClick={reset}>Reintentar</Button>
          <Button href="/" variant="ghost">
            Ir al catálogo
          </Button>
        </div>
      </div>
    </main>
  );
}
