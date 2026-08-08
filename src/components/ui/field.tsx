"use client";

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

import { ChevronDownIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * Campos de formulario del panel. Comparten el mismo borde, radio y estado de
 * error, y conectan label / control / mensaje con los `id` correctos para que
 * un lector de pantalla los lea juntos.
 */

const CONTROL = cn(
  "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-[13px] text-ink",
  "transition-[border-color,box-shadow] duration-200 ease-fluid",
  "placeholder:text-ink-soft/70",
  "focus:border-forest-soft focus:outline-none focus:ring-2 focus:ring-forest-soft/15",
  "disabled:cursor-not-allowed disabled:bg-surface disabled:text-ink-soft",
);

const CONTROL_ERROR = "border-danger focus:border-danger focus:ring-danger/15";

type FieldShellProps = {
  label?: string;
  hint?: string;
  error?: string;
  className?: string;
  /** Recibe los `id` que hay que pasarle al control. */
  children: (ids: { id: string; describedBy?: string }) => ReactNode;
};

/** Envoltura genérica: etiqueta arriba, mensaje de error debajo. */
export function Field({ label, hint, error, className, children }: FieldShellProps) {
  const id = useId();
  const messageId = `${id}-message`;
  const hasMessage = Boolean(error || hint);

  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <label
          htmlFor={id}
          className="block text-xs tracking-[0.01em] text-ink-soft"
        >
          {label}
        </label>
      ) : null}

      {children({ id, describedBy: hasMessage ? messageId : undefined })}

      {hasMessage ? (
        <p
          id={messageId}
          className={cn(
            "text-xs leading-snug",
            error ? "text-danger" : "text-ink-soft",
          )}
          role={error ? "alert" : undefined}
        >
          {error ?? hint}
        </p>
      ) : null}
    </div>
  );
}

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  label?: string;
  hint?: string;
  error?: string;
  /** Icono decorativo dentro del campo, alineado a la izquierda. */
  icon?: ReactNode;
  wrapperClassName?: string;
};

export const TextField = forwardRef<HTMLInputElement, InputProps>(
  function TextField(
    { label, hint, error, icon, className, wrapperClassName, ...props },
    ref,
  ) {
    return (
      <Field
        label={label}
        hint={hint}
        error={error}
        className={wrapperClassName}
      >
        {({ id, describedBy }) => (
          <div className="relative">
            {icon ? (
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-soft">
                {icon}
              </span>
            ) : null}
            <input
              ref={ref}
              id={id}
              aria-describedby={describedBy}
              aria-invalid={error ? true : undefined}
              className={cn(
                CONTROL,
                icon && "pl-10",
                error && CONTROL_ERROR,
                className,
              )}
              {...props}
            />
          </div>
        )}
      </Field>
    );
  },
);

type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> & {
  label?: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
};

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function TextAreaField(
    { label, hint, error, className, wrapperClassName, ...props },
    ref,
  ) {
    return (
      <Field
        label={label}
        hint={hint}
        error={error}
        className={wrapperClassName}
      >
        {({ id, describedBy }) => (
          <textarea
            ref={ref}
            id={id}
            aria-describedby={describedBy}
            aria-invalid={error ? true : undefined}
            className={cn(CONTROL, "resize-y", error && CONTROL_ERROR, className)}
            {...props}
          />
        )}
      </Field>
    );
  },
);

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> & {
  label?: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
};

export const SelectField = forwardRef<HTMLSelectElement, SelectProps>(
  function SelectField(
    { label, hint, error, className, wrapperClassName, children, ...props },
    ref,
  ) {
    return (
      <Field
        label={label}
        hint={hint}
        error={error}
        className={wrapperClassName}
      >
        {({ id, describedBy }) => (
          <div className="relative">
            <select
              ref={ref}
              id={id}
              aria-describedby={describedBy}
              aria-invalid={error ? true : undefined}
              className={cn(
                CONTROL,
                "appearance-none pr-9",
                error && CONTROL_ERROR,
                className,
              )}
              {...props}
            >
              {children}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-soft" />
          </div>
        )}
      </Field>
    );
  },
);
