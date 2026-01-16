# Supabase Email Templates - Bilboko Doinuak

Plantillas de email bilingues (Euskera/Castellano) para la autenticacion de usuarios.

## Plantillas Disponibles

| Archivo | Uso en Supabase | Descripcion |
|---------|-----------------|-------------|
| `confirm-signup.html` | Confirm signup | Email de confirmacion tras el registro |
| `magic-link.html` | Magic Link | Email para login sin contrasena |
| `reset-password.html` | Reset Password | Email para restablecer contrasena |
| `change-email.html` | Change Email Address | Email para confirmar cambio de direccion |

## Configuracion en Supabase

1. Acceder a [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleccionar el proyecto `bwuvrnocbxgzedjxnkou`
3. Ir a **Authentication** > **Email Templates**
4. Para cada tipo de email:
   - Copiar el contenido HTML completo del archivo correspondiente
   - Pegar en el campo "Body" del template
   - Configurar el Subject (ver abajo)
   - Guardar

## Subjects de los Emails

| Template | Subject |
|----------|---------|
| Confirm signup | Confirma tu cuenta - Baieztatu zure kontua - Bilboko Doinuak |
| Magic Link | Tu enlace de acceso - Zure sarbide esteka - Bilboko Doinuak |
| Reset Password | Restablecer contrasena - Pasahitza berrezarri - Bilboko Doinuak |
| Change Email | Confirmar nuevo email - Email berria baieztatu - Bilboko Doinuak |

## Variables de Supabase

Las plantillas usan estas variables que Supabase reemplaza automaticamente:

- `{{ .ConfirmationURL }}` - URL de confirmacion/accion
- `{{ .SiteURL }}` - URL del sitio configurado
- `{{ .Token }}` - Token de verificacion
- `{{ .Email }}` - Email del usuario

## Estilo

Las plantillas siguen la estetica de Bilboko Doinuak:
- **Header**: Gradiente purpura (#7c3aed a #a855f7)
- **Castellano**: Acento rojo (#dc2626) con badge "ES"
- **Euskera**: Acento azul (#2563eb) con badge "EU"
- **Botones**: Gradiente purpura con sombra

## Actualizaciones

Cuando se modifiquen las plantillas:
1. Editar el archivo HTML correspondiente
2. Copiar y pegar en Supabase Dashboard
3. Probar enviando un email de prueba
