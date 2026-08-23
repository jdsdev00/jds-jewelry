import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoMarkProps = {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const SIZES = {
  sm: "h-10 w-10",
  md: "h-12 w-12",
  lg: "h-16 w-16",
  xl: "h-40 w-40",
} as const;

export function LogoMark({ size = "md", className }: LogoMarkProps) {
  return (
    <div className={cn("relative shrink-0", SIZES[size], className)}>
      <Image
        src="/logo.png"
        alt="JS Jewelry"
        fill
        sizes="500px"
        className="object-contain"
      />
    </div>
  );
}

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("relative h-12 w-[260px] md:h-16 md:w-[320px]", className)}>
      <Image
        src="/logo-horizontal.png"
        alt="JS Jewelry"
        fill
        priority
        unoptimized
        className="object-contain object-left"
      />
    </div>
  );
}