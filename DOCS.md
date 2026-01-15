# Documentación - Bilboko Doinuak

## Índice de documentos

- [Diario de desarrollo](./docs/DIARY.md) - Registro diario de decisiones y progreso
- [Esquema Supabase](./docs/supabase-schema.sql) - SQL para configurar las tablas en Supabase

## Descripción del proyecto

Mapa sonoro interactivo del barrio de San Ignacio (Bilbao). Permite explorar puntos de interés sonoro, seguir rutas temáticas y participar en juegos de memoria sonora.

## Ejecución local

```bash
npm install
npm run dev
```

## Estructura del proyecto

```
src/
├── components/     # Componentes reutilizables
├── context/        # Contextos de React (idioma)
├── data/           # JSONs estáticos con datos
├── hooks/          # Custom hooks
├── pages/          # Páginas de la aplicación
└── assets/         # Imágenes y recursos estáticos
```

## Stack tecnológico

- React 19 + TypeScript
- Vite
- TailwindCSS v4
- React Router DOM v7
- Leaflet + react-leaflet
- Lucide React (iconos)
- Supabase (autenticacion y base de datos en la nube - opcional)

## Configuracion de Supabase (opcional)

La aplicacion funciona sin Supabase, usando localStorage para persistir datos.
Para habilitar autenticacion con Google y sincronizacion en la nube:

1. Crear proyecto en [Supabase](https://supabase.com)
2. Copiar `.env.example` a `.env` y rellenar las credenciales
3. Ejecutar el SQL de `docs/supabase-schema.sql` en el SQL Editor de Supabase
4. Configurar Google OAuth en el dashboard de Supabase (Authentication > Providers)
