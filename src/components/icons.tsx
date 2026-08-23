import type { SVGProps } from "react";
import { SiInstagram, SiWhatsapp } from "react-icons/si";

import { cn } from "@/lib/utils";

/**
 * Set de iconos del proyecto, copiado tal cual del diseño base.
 *
 * Todos comparten trazo de 1.6, sin relleno y puntas redondeadas. El color
 * sale de `currentColor`, así que se controla con la clase `text-*` del padre.
 */

export type IconProps = SVGProps<SVGSVGElement>;

function Icon({ className, children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("block size-5 shrink-0", className)}
      {...props}
    >
      {children}
    </svg>
  );
}

export const SearchIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </Icon>
);

export const ZoomInIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
    <path d="M11 8v6M8 11h6" />
  </Icon>
);

export const CloseIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
);

export const ChevronLeftIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M15 18l-6-6 6-6" />
  </Icon>
);

export const ChevronRightIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M9 18l6-6-6-6" />
  </Icon>
);

export const ShareIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="18" cy="5" r="2.6" />
    <circle cx="6" cy="12" r="2.6" />
    <circle cx="18" cy="19" r="2.6" />
    <path d="M8.3 10.7l7.4-4.4M8.3 13.3l7.4 4.4" />
  </Icon>
);

export const ChevronDownIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M6 9l6 6 6-6" />
  </Icon>
);

export const ArrowUpIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 20V4" />
    <path d="M5 11l7-7 7 7" />
  </Icon>
);

export const ArrowDownIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 4v16" />
    <path d="M5 13l7 7 7-7" />
  </Icon>
);

export const PlusIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

export const CheckIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 12.5l5 5L20 6.5" />
  </Icon>
);

export const SparkleIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4-3.9-3.8 5.4-.8z" />
  </Icon>
);

export const GemIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M6 3h12l3 6-9 12L3 9z" />
    <path d="M3 9h18M9 3l-2 6 5 12 5-12-2-6" />
  </Icon>
);

export const GridIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
  </Icon>
);

export const TagIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M20.6 13.4L12.6 21.4a2 2 0 01-2.8 0L3 14.6V4a1 1 0 011-1h10.6a2 2 0 011.4.6l4.6 4.6a2 2 0 010 2.8z" />
    <circle cx="8.5" cy="7.5" r="1.2" />
  </Icon>
);

export const DiscountIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="6.5" cy="6.5" r="2" />
    <circle cx="17.5" cy="17.5" r="2" />
    <path d="M19 5L5 19" />
  </Icon>
);

export const EditIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" />
  </Icon>
);

export const TrashIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M6 6l1 14h10l1-14" />
  </Icon>
);

export const ImageIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </Icon>
);

export const MailIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </Icon>
);

export const LockIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V7a4 4 0 018 0v4" />
  </Icon>
);

export const LogoutIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
    <path d="M10 17l5-5-5-5" />
    <path d="M15 12H3" />
  </Icon>
);

export const EyeIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);

export const EyeOffIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M10.6 6.2A9.9 9.9 0 0112 6c6.4 0 10 7 10 7a17.6 17.6 0 01-3.2 4.1" />
    <path d="M6.6 6.7A17.4 17.4 0 002 13s3.6 7 10 7a9.7 9.7 0 005.4-1.6" />
    <path d="M9.9 9.9a3 3 0 004.2 4.2" />
    <path d="M3 3l18 18" />
  </Icon>
);

export const StoreIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 9h16v11a1 1 0 01-1 1H5a1 1 0 01-1-1z" />
    <path d="M3 9l1.6-5h14.8L21 9" />
    <path d="M9 21v-6h6v6" />
  </Icon>
);

/* --------------------------------------------------------------------------
 * Marcas de terceros
 *
 * Estas dos no se dibujan a mano: son logos con forma registrada y una
 * aproximación a trazo se nota enseguida. Vienen de Simple Icons (a través de
 * `react-icons`), que publica los marcas oficiales. Son sólidas, no de trazo
 * como el resto del set, que es justo como deben verse.
 * ------------------------------------------------------------------------ */

type BrandIconProps = {
  className?: string;
};

export const WhatsappIcon = ({ className }: BrandIconProps) => (
  <SiWhatsapp aria-hidden="true" className={cn("block size-5 shrink-0", className)} />
);

export const InstagramIcon = ({ className }: BrandIconProps) => (
  <SiInstagram aria-hidden="true" className={cn("block size-5 shrink-0", className)} />
);

export const SpinnerIcon = ({ className, ...props }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className={cn("block size-5 shrink-0 animate-spin", className)}
    {...props}
  >
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={2} opacity={0.25} />
    <path
      d="M21 12a9 9 0 00-9-9"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    />
  </svg>
);
