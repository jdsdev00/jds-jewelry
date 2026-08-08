"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

import {
  DiscountIcon,
  GemIcon,
  GridIcon,
  LogoutIcon,
  StoreIcon,
  TagIcon,
} from "@/components/icons";
import { Logo } from "@/components/ui/logo";
import { signOutAction } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

const EASE = [0.22, 0.61, 0.36, 1] as const;

const NAV_ITEMS = [
  { href: "/admin", label: "Resumen", icon: GridIcon },
  { href: "/admin/productos", label: "Productos", icon: GemIcon },
  { href: "/admin/categorias", label: "Categorías", icon: TagIcon },
  { href: "/admin/banners", label: "Ofertas y banners", icon: DiscountIcon },
] as const;

/** Permite que el encabezado de cada página abra el menú lateral. */
const ShellContext = createContext<{ openSidebar: () => void }>({
  openSidebar: () => {},
});

export function useAdminShell() {
  return useContext(ShellContext);
}

type AdminShellProps = {
  adminName: string;
  children: ReactNode;
};

/**
 * Estructura del panel: menú lateral fijo en escritorio, cajón deslizante en
 * móvil, y el contenido de cada página a la derecha.
 */
export function AdminShell({ adminName, children }: AdminShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const nav = (
    <nav className="flex flex-1 flex-col gap-0.5">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            // El cajón de móvil se cierra al navegar desde él.
            onClick={closeSidebar}
            className={cn(
              "flex items-center gap-3 rounded-[9px] px-2.5 py-2.5 text-[13px]",
              "transition-colors duration-200 ease-fluid",
              isActive
                ? "bg-white/12 text-white"
                : "text-white/70 hover:bg-white/6 hover:text-white",
            )}
          >
            <Icon className="size-[18px]" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const foot = (
    <div className="space-y-0.5 border-t border-white/12 pt-3.5">
      <Link
        href="/"
        onClick={closeSidebar}
        className="flex items-center gap-3 rounded-[9px] px-2.5 py-2.5 text-[13px] text-white/70 transition-colors duration-200 ease-fluid hover:bg-white/6 hover:text-white"
      >
        <StoreIcon className="size-[18px]" />
        Ver la tienda
      </Link>
      <form action={signOutAction}>
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-[9px] px-2.5 py-2.5 text-left text-[13px] text-white/70 transition-colors duration-200 ease-fluid hover:bg-white/6 hover:text-white"
        >
          <LogoutIcon className="size-[18px]" />
          Cerrar sesión
        </button>
      </form>
    </div>
  );

  const sidebarContent = (
    <>
      <div className="px-2 pb-6">
        <Logo tone="light" />
        <p className="mt-3 truncate pl-0.5 text-[11px] text-white/45">{adminName}</p>
      </div>
      {nav}
      {foot}
    </>
  );

  return (
    <ShellContext.Provider value={{ openSidebar }}>
      <div className="flex min-h-full flex-1 bg-surface">
        {/* Escritorio: columna fija */}
        <aside className="hidden w-[230px] shrink-0 flex-col bg-forest px-4 py-5.5 lg:flex">
          {sidebarContent}
        </aside>

        {/* Móvil: cajón deslizante */}
        <AnimatePresence>
          {sidebarOpen ? (
            <div className="fixed inset-0 z-50 lg:hidden">
              <motion.button
                type="button"
                aria-label="Cerrar menú"
                onClick={() => setSidebarOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: EASE }}
                className="absolute inset-0 bg-forest/40 backdrop-blur-[2px]"
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.32, ease: EASE }}
                className="absolute inset-y-0 left-0 flex w-[250px] flex-col bg-forest px-4 py-5.5 shadow-2xl"
              >
                {sidebarContent}
              </motion.aside>
            </div>
          ) : null}
        </AnimatePresence>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </ShellContext.Provider>
  );
}

type AdminPageHeaderProps = {
  title: string;
  action?: ReactNode;
};

/** Barra superior de cada página del panel. */
export function AdminPageHeader({ title, action }: AdminPageHeaderProps) {
  const { openSidebar } = useAdminShell();

  return (
    <div className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-white/90 px-4 py-3.5 backdrop-blur-lg md:px-6">
      <div className="flex min-w-0 items-center gap-3.5">
        <button
          type="button"
          onClick={openSidebar}
          aria-label="Abrir menú"
          className="flex w-5 shrink-0 flex-col gap-1 lg:hidden"
        >
          <span className="block h-0.5 bg-forest" />
          <span className="block h-0.5 bg-forest" />
          <span className="block h-0.5 bg-forest" />
        </button>
        <h1 className="truncate font-serif text-xl text-forest">{title}</h1>
      </div>
      {action}
    </div>
  );
}
