# J.D.S. Jewelry

Catálogo de joyería con panel de administración.
Next.js 16 · Tailwind CSS v4 · Supabase.

```bash
npm install
npm run dev
```

## Variables de entorno

En `.env.local`, junto a `package.json`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Contacto. Si falta alguno, su botón no se muestra en la tienda.
NEXT_PUBLIC_WHATSAPP_NUMBER=      # con código de país, ej. 1809XXXXXXX
NEXT_PUBLIC_INSTAGRAM_USER=       # solo el usuario, sin @

# Moneda: DOP (por defecto) o USD. Solo cambia cómo se muestran
# los precios; no los convierte.
NEXT_PUBLIC_CURRENCY=DOP

# Dirección pública, para el sitemap y las tarjetas de compartir.
# En Vercel se deduce sola; solo hace falta con dominio propio.
NEXT_PUBLIC_SITE_URL=
```

En Vercel, las `NEXT_PUBLIC_*` se incrustan al compilar: hay que configurarlas
antes de desplegar, y si se cambian, volver a desplegar.

## Base de datos

Ejecutar en el editor SQL de Supabase, en orden:

1. `supabase-schema.sql` — tablas, políticas RLS y el bucket `jewelry-media`.
2. `supabase-migracion-2.sql` — orden manual del catálogo y las fotos de piezas
   despublicadas dejan de listarse.

Mientras falte la migración 2, la tienda funciona igual pero el catálogo se
ordena solo por fecha y el panel esconde las flechas de reordenar.

## Rutas

| Ruta                | |
| ------------------- | --- |
| `/`                 | Catálogo |
| `/producto/[slug]`  | Detalle de la pieza |
| `/admin`            | Panel (resumen, productos, categorías, banners) |

## Dar acceso al panel

La usuaria se crea en **Authentication → Users** de Supabase y luego se agrega
a `admin_users`:

```sql
insert into public.admin_users (id, full_name)
select id, 'Nombre' from auth.users where email = 'correo@ejemplo.com';
```

Sin esa fila puede iniciar sesión, pero ve una pantalla de "sin acceso".

## Notas para quien toque el código

- **El precio vigente se calcula en `lib/products.ts`**, no en la base: la
  columna generada `final_price` ignora `discount_start` / `discount_end`.
- **Hay dos clientes de Supabase en el servidor.** `lib/supabase/public.ts` es
  anónimo y sin cookies, para que las páginas de la tienda se puedan cachear;
  `lib/supabase/server.ts` lleva la sesión y solo lo usa el panel.
- **Los esquemas de `lib/validations.ts` tienen que aceptar su propia salida.**
  react-hook-form le pasa al `onSubmit` lo que devolvió Zod, no lo que hay
  escrito en los campos, y eso es lo que viaja al Server Action.
- **Las fotos se reducen en el navegador antes de subirlas** (`lib/image.ts`), y
  al quitarlas se borran del bucket si no las usa nadie más
  (`deleteUnreferencedMedia` en `app/admin/actions.ts`).
