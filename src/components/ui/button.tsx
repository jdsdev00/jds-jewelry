import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { SpinnerIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * Botón único del proyecto. Cubre también los enlaces con aspecto de botón:
 * si recibe `href` renderiza un `<Link>`, si no un `<button>`.
 */

export type ButtonVariant =
  | "primary"
  | "ghost"
  | "danger"
  | "gold"
  | "outlineLight"
  | "subtle";

export type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-forest text-white hover:bg-forest-soft",
  ghost: "border border-line bg-white text-ink hover:border-ink-soft",
  danger: "bg-danger-soft text-danger hover:bg-danger hover:text-white",
  gold: "bg-gold text-white hover:bg-gold-dark",
  outlineLight: "border border-white/40 text-white hover:bg-white/10",
  subtle: "text-ink-soft hover:bg-surface hover:text-ink",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "gap-1.5 rounded-lg px-3 py-2 text-xs",
  md: "gap-2 rounded-lg px-4 py-2.5 text-[13px]",
  lg: "gap-2 rounded-xl px-5 py-3.5 text-[13px] tracking-[0.02em]",
};

const BASE = cn(
  "inline-flex items-center justify-center font-medium",
  "transition-[background-color,border-color,color,transform,opacity] duration-200 ease-fluid",
  "active:scale-[0.97]",
  "disabled:pointer-events-none disabled:opacity-50",
  // Área táctil cómoda en móvil sin agrandar el botón visualmente
  "touch-manipulation select-none",
);

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps & {
  href: string;
  target?: string;
  rel?: string;
  prefetch?: boolean;
  onClick?: () => void;
};

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    fullWidth,
    className,
    children,
  } = props;

  const classes = cn(
    BASE,
    VARIANTS[variant],
    SIZES[size],
    fullWidth && "w-full",
    className,
  );

  if (props.href !== undefined) {
    const { href, target, rel, prefetch, onClick } = props;
    return (
      <Link
        href={href}
        target={target}
        rel={rel}
        prefetch={prefetch}
        onClick={onClick}
        className={classes}
      >
        {children}
      </Link>
    );
  }

  const {
    loading = false,
    disabled,
    type = "button",
    variant: _variant,
    size: _size,
    fullWidth: _fullWidth,
    className: _className,
    children: _children,
    ...rest
  } = props;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={classes}
      {...rest}
    >
      {loading ? <SpinnerIcon className="size-4" /> : null}
      {children}
    </button>
  );
}
