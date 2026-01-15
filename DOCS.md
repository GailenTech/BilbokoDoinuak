# Documentación - Bilboko Doinuak

## Índice de documentos

- [Diario de desarrollo](./docs/DIARY.md) - Registro diario de decisiones y progreso

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

- React 18 + TypeScript
- Vite
- TailwindCSS v4
- React Router DOM v6
- Leaflet + react-leaflet
- Lucide React (iconos)
