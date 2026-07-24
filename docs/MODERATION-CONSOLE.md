# Consola Interna De Moderacion

Estado: aplicacion web publicada, backend MFA desplegado y primera cuenta administradora habilitada.

## Limites De Seguridad

- Vive en `moderation-console/`, separada del APK publico.
- Usa solamente URL y publishable key de Supabase.
- Nunca contiene `service_role`.
- Exige cuenta confirmada, rol privado activo, sesion vigente y MFA TOTP (`aal2`).
- Todas las acciones pasan por `moderate-community`, version esperada e idempotency key.
- La identidad del reportante no se muestra.

## Desarrollo Local

Crear `moderation-console/.env.local`:

```env
VITE_SUPABASE_URL=https://moqlovsxklxcpihvheyc.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=TU_PUBLISHABLE_KEY
```

Luego:

```powershell
cd moderation-console
npm install
npm run dev
```

Abrir `http://127.0.0.1:4174`.

## Alta Del Primer Administrador

La cuenta confirmada de Emmanuel fue habilitada como `admin` el 16 de julio de 2026. Este procedimiento queda documentado para futuras altas:

1. Crear y confirmar la cuenta desde el flujo normal de Clean4Jesus.
2. Copiar su UUID desde Supabase > Authentication > Users.
3. Ejecutar una sola vez desde SQL Editor:

```sql
insert into private.community_moderators (user_id, role)
values ('UUID_DEL_ADMIN', 'admin')
on conflict (user_id) do update
set role = excluded.role, active = true;
```

4. Entrar a la consola. En el primer acceso se muestra el QR para configurar TOTP.

## Publicacion

Autorizar Wrangler una sola vez:

```powershell
cd C:\Users\maite\OneDrive\Escritorio\BlockerXChrist\clean4jesus
npx wrangler login
```

Construir `moderation-console` con las dos variables publicas `VITE_*` y publicar `moderation-console/dist` como Worker con Static Assets:

```powershell
npm run admin:build
npx wrangler deploy --config wrangler.moderation.jsonc
```

Configurar las dos variables `VITE_*` antes del build y usar el dominio:

```text
moderation.clean4jesus.com
```

No agregar secretos administrativos a Pages.

## Operacion

- `Pendientes`: casos nuevos.
- `En revision`: casos reclamados.
- `Ocultos`: contenido retirado.
- `Sin infraccion`: casos cerrados sin retirar contenido.
- Restaurar contenido es exclusivo de administradores con MFA.

Cada nota debe explicar la evidencia y la decision sin copiar datos innecesarios.
