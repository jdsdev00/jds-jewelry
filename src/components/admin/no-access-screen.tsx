import { LockIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/logo";
import { signOutAction } from "@/app/admin/actions";

type NoAccessScreenProps = {
  email: string;
};

/**
 * Se muestra cuando alguien inicia sesión con una cuenta válida de Supabase
 * que todavía no está en `admin_users`.
 */
export function NoAccessScreen({ email }: NoAccessScreenProps) {
  return (
    <div className="grid min-h-full flex-1 place-items-center bg-[radial-gradient(circle_at_50%_20%,#10301f_0%,var(--color-forest)_60%)] p-6">
      <div className="w-full max-w-[380px] rounded-3xl bg-white px-8 py-10 text-center shadow-2xl">
        <LogoMark className="mx-auto mb-4" size="lg" />
        <div className="mx-auto mb-4 grid size-11 place-items-center rounded-full bg-surface text-ink-soft">
          <LockIcon />
        </div>
        <h1 className="font-serif text-[22px] text-forest">Sin acceso al panel</h1>
        <p className="mt-2 text-[13px] text-ink-soft">
          La cuenta <span className="text-ink">{email}</span> existe, pero
          todavía no tiene permisos de administradora.
        </p>
        <p className="mt-3 rounded-xl bg-surface px-4 py-3 text-left text-xs leading-relaxed text-ink-soft">
          Para habilitarla, agrégala a la tabla{" "}
          <code className="text-ink">admin_users</code> desde el panel de
          Supabase.
        </p>
        <form action={signOutAction} className="mt-5">
          <Button type="submit" variant="ghost" fullWidth>
            Cerrar sesión
          </Button>
        </form>
      </div>
    </div>
  );
}
