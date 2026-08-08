import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/logo";

export default function StoreNotFound() {
  return (
    <main className="grid min-h-dvh flex-1 place-items-center px-6 text-center">
      <div className="animate-rise">
        <LogoMark size="lg" className="mx-auto mb-5" />
        <h1 className="font-serif text-[26px] text-forest">
          No encontramos esta pieza
        </h1>
        <p className="mx-auto mt-2 max-w-xs text-[13px] text-ink-soft">
          Puede que ya no esté disponible o que el enlace esté incompleto.
        </p>
        <Button href="/" size="lg" className="mt-6">
          Volver al catálogo
        </Button>
      </div>
    </main>
  );
}
