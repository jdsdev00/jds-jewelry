import type { NextConfig } from "next";

/**
 * Las fotos viven en Supabase Storage, así que hay que autorizar ese host
 * para `next/image`. Se deriva de la URL del proyecto en vez de escribirla a
 * mano, para que siga funcionando si se cambia de proyecto de Supabase.
 */
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
