"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginInput } from "@/lib/validations";

/** Traduce los mensajes de Supabase Auth, que vienen en inglés. */
function translateAuthError(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) {
    return "Correo o contraseña incorrectos.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Falta confirmar el correo de esta cuenta.";
  }
  if (normalized.includes("too many requests") || normalized.includes("rate limit")) {
    return "Demasiados intentos. Espera un momento y vuelve a probar.";
  }
  if (normalized.includes("failed to fetch") || normalized.includes("network")) {
    return "No hay conexión con el servidor. Revisa tu internet.";
  }
  return "No se pudo iniciar sesión. Inténtalo de nuevo.";
}

type LoginFormProps = {
  /** Ruta a la que volver después de entrar. */
  redirectTo: string;
};

export function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setFormError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email.trim(),
      password: values.password,
    });

    if (error) {
      setFormError(translateAuthError(error.message));
      return;
    }

    // `refresh()` obliga al servidor a re-renderizar con la sesión ya puesta.
    router.replace(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="text-left">
      {formError ? (
        <p
          role="alert"
          className="mb-3.5 rounded-lg bg-danger-soft px-3.5 py-2.5 text-xs text-danger"
        >
          {formError}
        </p>
      ) : null}

      <TextField
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="admin@jdsjewelry.com"
        icon={<MailIcon className="size-[18px]" />}
        error={errors.email?.message}
        wrapperClassName="mb-4"
        {...register("email")}
      />

      <div className="relative mb-4">
        <TextField
          label="Contraseña"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="••••••••"
          icon={<LockIcon className="size-[18px]" />}
          error={errors.password?.message}
          className="pr-11"
          {...register("password")}
        />
        <button
          type="button"
          onClick={() => setShowPassword((visible) => !visible)}
          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="absolute top-[30px] right-3 text-ink-soft transition-colors duration-200 ease-fluid hover:text-ink"
        >
          {showPassword ? (
            <EyeOffIcon className="size-[18px]" />
          ) : (
            <EyeIcon className="size-[18px]" />
          )}
        </button>
      </div>

      <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
        {isSubmitting ? "Entrando..." : "Iniciar sesión"}
      </Button>
    </form>
  );
}
