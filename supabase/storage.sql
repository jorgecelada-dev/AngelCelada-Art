-- ============================================================
-- Configuración del bucket de Storage para las imágenes de las obras
-- Ejecuta esto DESPUÉS de crear el bucket "obras" desde
-- Supabase Dashboard > Storage > New bucket > nombre: "obras" > Public bucket: SÍ
-- Luego pega esto en SQL Editor para las políticas de acceso.
-- ============================================================

-- Lectura pública de las imágenes (para que se vean en la web)
create policy "obras_storage_lectura_publica"
on storage.objects for select
using ( bucket_id = 'obras' );

-- Solo usuarios autenticados (el artista) pueden subir/borrar imágenes
create policy "obras_storage_escritura_autenticados"
on storage.objects for insert
with check ( bucket_id = 'obras' and auth.role() = 'authenticated' );

create policy "obras_storage_borrado_autenticados"
on storage.objects for delete
using ( bucket_id = 'obras' and auth.role() = 'authenticated' );
