-- ============================================================================
-- J.D.S. Jewelry — Migración 2
--
-- Ejecutar en: Supabase Dashboard > SQL Editor > New query
--
-- IMPORTANTE: el código de la aplicación ya cuenta con estos cambios. Hay que
-- correr este archivo antes de desplegar, o el catálogo dará error al ordenar
-- por una columna que todavía no existe.
--
-- Se puede ejecutar más de una vez sin romper nada.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. ORDEN MANUAL DEL CATÁLOGO
--
-- Sin esto, el catálogo solo se puede ordenar por fecha de creación y no hay
-- forma de destacar una pieza. Menor `position` = aparece antes.
-- ----------------------------------------------------------------------------

alter table public.products
  add column if not exists position int not null default 0;

create index if not exists products_position_idx on public.products(position);

-- Reparte las posiciones respetando el orden que se ve hoy (más nuevo
-- primero), para que activar esta función no reordene el catálogo de golpe.
-- El `where position = 0` evita pisar un orden ya personalizado si esta
-- migración se vuelve a ejecutar.
with ordenadas as (
  select id, (row_number() over (order by created_at desc)) - 1 as nueva_posicion
  from public.products
)
update public.products p
set position = o.nueva_posicion
from ordenadas o
where p.id = o.id
  and p.position = 0;


-- ----------------------------------------------------------------------------
-- 2. LAS FOTOS DE PIEZAS DESPUBLICADAS DEJAN DE LISTARSE
--
-- La política anterior era `using (true)`: cualquiera podía pedir la lista
-- completa de imágenes por la API, incluidas las de piezas inactivas, y de ahí
-- sacar sus URLs.
--
-- OJO — esto cierra el listado, no el archivo. El bucket `jewelry-media` es
-- público, así que una URL que alguien ya tenga anotada sigue funcionando.
-- Para cerrarlo del todo habría que pasar el bucket a privado y servir las
-- fotos con URLs firmadas, que es un cambio bastante mayor.
--
-- Los administradores siguen viéndolo todo gracias a la política
-- "admins_manage_product_images", que ya existe y es `for all`.
-- ----------------------------------------------------------------------------

drop policy if exists "public_read_product_images" on public.product_images;

create policy "public_read_product_images" on public.product_images
  for select using (
    exists (
      select 1
      from public.products p
      where p.id = product_id
        and p.active = true
    )
  );
