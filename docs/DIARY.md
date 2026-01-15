# Diario de Desarrollo - Bilboko Doinuak

## 2026-01-15 - Inicio del prototipo de migración

### Contexto
Proyecto de migración desde Base44 (plataforma no-code) a código propio para mayor flexibilidad.

### Análisis de la app original
- **URL original**: https://bilboko-doinuak-san-inazio-sounds-280751de.base44.app/
- **Funcionalidades identificadas**:
  - Mapa interactivo con 15 puntos sonoros (Leaflet + OpenStreetMap)
  - 3 rutas temáticas: Acústicamente Amable, Refugios Climáticos, Identidad Sonora
  - Sistema de gamificación: Quiz, Memory, Misiones, Colecciones, 1vs1, Ranking
  - Soporte bilingüe (Euskara/Castellano)
  - Panel de administración municipal

### Decisiones técnicas tomadas

#### Stack elegido
- **Frontend**: React + TypeScript + Vite
- **Estilos**: TailwindCSS v4 (via @tailwindcss/vite)
- **Routing**: React Router DOM v6
- **Mapa**: Leaflet + react-leaflet
- **Iconos**: Lucide React
- **Persistencia**: JSONs estáticos (sin backend para el prototipo)

#### Razones de las decisiones
1. **Vite** en lugar de CRA/Next: Más rápido, más simple para un prototipo
2. **TailwindCSS v4**: Configuración simplificada con plugin de Vite
3. **JSONs estáticos**: Elimina necesidad de backend para el MVP
4. **React-Leaflet**: Misma tecnología que usa Base44, fácil migración

### Datos extraídos
- 15 puntos sonoros con coordenadas, audios, imágenes, descripciones bilingües
- 3 rutas temáticas con metadatos
- Estructura de emociones para valoraciones (no implementado aún)

### Qué se ha implementado
- [x] Estructura del proyecto
- [x] Contexto de idioma (es/eu)
- [x] Header con navegación
- [x] Página Home con selector de idioma
- [x] Página de Mapa interactivo con filtros por ruta
- [x] Página de Rutas Temáticas
- [x] Página de Juegos (placeholder)
- [x] Página de Admin (acceso restringido)

### Verificación completada
- [x] Build de producción exitoso (416 KB JS, 35 KB CSS)
- [x] Dev server funcionando en localhost:5173
- [x] Home page con selector de idioma: OK
- [x] Mapa con 15 marcadores: OK
- [x] Panel de detalle con imagen, audio, YouTube: OK
- [x] Página de rutas temáticas: OK
- [x] Filtros por ruta funcionando: OK

### Próximos pasos
- [ ] Implementar juego Quiz básico
- [ ] Implementar juego Memory básico
- [ ] Añadir filtros de emociones en el mapa
- [ ] Considerar persistencia ligera (localStorage para progreso)
- [ ] Descargar assets localmente (imágenes, audios) para independencia total

### Notas sobre migración de Base44
- La integración GitHub de Base44 es **parcialmente bidireccional**
- Solo el frontend se sincroniza; backend/BD permanecen en Base44
- Para control total, necesario reconstruir (lo que estamos haciendo)
- ~~Los assets (imágenes, audios) siguen en servidores de Base44 por ahora~~ → Descargados localmente

---

## 2026-01-15 (continuación) - Mejoras visuales y descarga de assets

### Qué se ha hecho

#### Assets descargados localmente
- 15 imágenes de puntos sonoros (~12 MB) → `public/assets/images/soundpoints/`
- 15 archivos de audio (~26 MB) → `public/assets/audio/`
- Logos del Ayuntamiento y Bilboko Doinuak → `src/assets/images/`

#### Polyline para itinerarios
- Añadida línea discontinua (Polyline) que conecta los puntos de cada ruta
- Color de la línea coincide con el color de la ruta seleccionada
- Se muestra solo cuando hay una ruta seleccionada

#### Corrección del layout del mapa
- **Problema detectado**: El agente había inventado una barra lateral que no existía en el original
- **Solución**: Eliminada la sidebar, filtros ahora superpuestos sobre el mapa (esquina superior izquierda)
- El diseño ahora coincide con el original de Base44:
  - Header con logos y navegación
  - Mapa a ancho completo
  - Filtros de ruta como botones overlay
  - Panel de detalle como overlay a la derecha

### Verificación visual
- Screenshots comparativos guardados en `.playwright-mcp/screenshots/`
- Filtros funcionando correctamente
- Polyline visible al seleccionar ruta
- Panel de detalle con imagen, audio y enlace YouTube: OK

### Commits realizados
- `fix(map): Remove sidebar, use overlay filters matching Base44 original`

### Próximos pasos
- [x] Implementar juego Quiz básico ✓
- [x] Implementar juego Memory básico ✓
- [ ] Añadir filtros de emociones en el mapa

---

## 2026-01-15 (continuación) - Implementación de juegos Quiz y Memory

### Qué se ha hecho

#### QuizGame (`/src/pages/QuizGame.tsx`)
- Quiz de audio con 5 preguntas de opción múltiple
- Diseño fiel al original de Base44:
  - Icono de fuego con contador de racha
  - Badge de puntos en azul
  - Indicador de dificultad ("Fácil"/"Erraza")
  - Icono de altavoz grande (w-24 h-24)
  - Reproductor de audio completo con controles
  - Barra de progreso mostrando pregunta actual
  - Pantalla final con porcentaje de aciertos

#### MemoryGame (`/src/pages/MemoryGame.tsx`)
- Juego de emparejar cartas: imágenes con sus sonidos
- Diseño fiel al original de Base44:
  - Cartas de AUDIO en gradiente ROJO
  - Cartas de IMAGEN en gradiente AZUL
  - Contador "MOVIMIENTOS" / "MUGIMENDUAK"
  - Botón "Reiniciar" / "Berrabiarazi"
  - Al voltear carta de audio: icono de altavoz + "SONIDO"/"SOINUA"
  - Grid 4x3 con 6 pares (12 cartas)
  - Pantalla final con número de movimientos

#### GamesPage actualizada
- Navegación funcional a Quiz y Memory
- Estado enabled/disabled para juegos
- Badge "Próximamente"/"Laster" para juegos no implementados
- Misiones Diarias marcado como próximamente

### Correcciones durante desarrollo
- **Import faltante**: Añadido `ArrowLeft` a QuizGame.tsx
- **Variable no usada**: Prefijado `_matches` en MemoryGame.tsx para TypeScript

### Verificación
- [x] Build de producción exitoso (432 KB JS, 46 KB CSS)
- [x] Quiz funciona: reproduce audio, valida respuestas, muestra resultados
- [x] Memory funciona: voltea cartas, reproduce audio, detecta parejas
- [x] Ambos juegos tienen soporte bilingüe (ES/EU)
- [x] Screenshots comparativos muestran fidelidad al diseño original

### Commits realizados
- `feat(games): Implement Quiz and Memory games matching Base44 original`

### Próximos pasos
- [ ] Añadir filtros de emociones en el mapa
- [ ] Implementar Misiones Diarias
- [ ] Considerar persistencia ligera (localStorage para progreso de juegos)
- [ ] Implementar sistema de XP y puntuación persistente

---

## 2026-01-15 (continuación) - Mejoras en rutas y menú móvil

### Qué se ha hecho

#### Menú hamburguesa para móvil
- Añadido botón hamburguesa en Header.tsx (visible solo en pantallas < md)
- Corregido problema de z-index: el menú quedaba oculto detrás del mapa (z-[1000])
- Solución: z-[1001] para header y menú overlay

#### Rutas que siguen las calles (OSRM)
- **Problema detectado**: Las rutas eran líneas rectas entre puntos
- **Solución**: Usar OSRM (Open Source Routing Machine) para calcular rutas reales
- Creado script `claude_tools/calculateRoutes.cjs`:
  - Pre-calcula rutas usando el servidor demo de OSRM
  - Captura el orden exacto de waypoints del original de Base44
  - Guarda la geometría en routes.json (234-266 coordenadas por ruta)
- **Ventaja sobre Base44**: Rutas pre-calculadas vs llamadas API en tiempo real

#### Segmentos de aproximación (líneas grises)
- **Problema detectado**: Faltaban las líneas grises que conectan los marcadores con la ruta
- OSRM "engancha" los waypoints a la carretera más cercana (road snapping)
- Actualizado calculateRoutes.cjs para capturar los "approach segments":
  - Línea desde coordenada original del marcador hasta punto de enganche OSRM
  - Solo se guardan si la distancia es > 5 metros
- Actualizado MapPage.tsx para renderizar estos segmentos en gris discontinuo

### Detalles técnicos

```javascript
// Approach segments structure in routes.json
approachSegments: [
  {
    from: [lat, lon], // Posición original del marcador
    to: [lat, lon]    // Posición donde OSRM engancha a la carretera
  }
]
```

### Commits realizados
- `fix(header): Add mobile hamburger menu with proper z-index`
- `feat(map): Pre-calculated routes that follow streets using OSRM`
- `fix(map): Use correct waypoint order for routes matching Base44 original`
- `feat(map): Add gray approach segments connecting markers to routes`

### Verificación
- [x] Build de producción exitoso (446 KB JS, 46 KB CSS)
- [x] Menú hamburguesa funciona en móvil
- [x] Rutas siguen las calles correctamente
- [x] Segmentos grises visibles conectando marcadores a rutas
- [x] Coincide visualmente con la app original de Base44

### Próximos pasos
- [ ] Añadir filtros de emociones en el mapa
- [ ] Implementar Misiones Diarias
- [ ] Despliegue a Cloudflare Pages

---

## 2026-01-15 (continuación) - Integración de Supabase Auth

### Qué se ha hecho

#### Instalación de dependencias
- `@supabase/supabase-js` - Cliente de Supabase
- `@supabase/auth-ui-react` - Componentes de UI para autenticación (disponible para uso futuro)
- `@supabase/auth-ui-shared` - Temas compartidos para auth UI

#### Cliente Supabase (`src/lib/supabase/client.ts`)
- Configuración con variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
- Fallback si no hay credenciales (la app funciona sin Supabase)
- Export de `isSupabaseConfigured` para saber si está habilitado
- Log de estado en modo desarrollo

#### SupabaseAdapter (`src/lib/persistence/SupabaseAdapter.ts`)
- Implementa la interface `StorageAdapter` existente
- Mapeo de tipos entre aplicación y base de datos:
  - `UserProfile` <-> `profiles` table
  - `GameProgress` <-> `progress` table
- Fallback automático a `LocalStorageAdapter` cuando:
  - Supabase no está configurado
  - Usuario no está autenticado
- Método `migrateFromLocalStorage()` para migrar datos locales a la nube al autenticarse

#### AuthContext (`src/context/AuthContext.tsx`)
- Gestión de estado de autenticación (user, session, isLoading)
- Métodos: `signInWithGoogle()`, `signOut()`
- Escucha cambios de sesión con `onAuthStateChange`
- Export de `isSupabaseEnabled` para componentes

#### AuthButton (`src/components/AuthButton.tsx`)
- Variantes: `full` (con texto) y `compact` (solo iconos)
- Estado no autenticado: botón "Iniciar con Google" con logo de Google
- Estado autenticado: avatar + nombre + botón logout
- Se oculta automáticamente si Supabase no está configurado
- Soporte bilingüe (ES/EU)

#### PersistenceContext actualizado
- Detecta si hay usuario autenticado
- Usa `SupabaseAdapter` si está autenticado, `LocalStorageAdapter` si no
- Migra datos de localStorage a Supabase al autenticarse por primera vez
- Flag `hasMigrated` para evitar migraciones duplicadas

#### App.tsx actualizado
- Añadido `AuthProvider` wrapping `PersistenceProvider`
- Orden de providers: Language > Auth > Persistence > Router

### Archivos de configuración

#### `.env.example`
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

#### `docs/supabase-schema.sql`
- Tabla `profiles` con todos los campos de UserProfile
- Tabla `progress` con todos los campos de GameProgress
- Row Level Security (RLS) policies para ambas tablas
- Índices para búsquedas comunes
- Trigger para actualizar `updated_at` automáticamente
- Instrucciones para configurar Google OAuth

### Correcciones de código preexistentes
- Añadidos badges faltantes en `levelSystem.ts`: novato, oido_fino, racha_5, veterano
- Añadidas propiedades faltantes en test: coins, unlockedSounds
- Eliminada referencia a `ProfilePage` que no existía

### Verificación
- [x] Build de producción exitoso (664 KB JS)
- [x] 43 tests pasando
- [x] App funciona sin credenciales de Supabase (solo localStorage)
- [x] Tipos TypeScript correctos

### Arquitectura de autenticación

```
                    ┌──────────────────┐
                    │   AuthProvider   │
                    │  (gestiona auth) │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │PersistenceProvider│
                    │ (elige adapter)  │
                    └────────┬─────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
    ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐
    │ No Supabase │   │  Supabase   │   │  Supabase   │
    │ configurado │   │ Sin login   │   │ Con login   │
    └──────┬──────┘   └──────┬──────┘   └──────┬──────┘
           │                 │                 │
    ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐
    │ localStorage│   │ localStorage│   │  Supabase   │
    │  Adapter    │   │  Adapter    │   │  Adapter    │
    └─────────────┘   └─────────────┘   └─────────────┘
```

### Próximos pasos
- [ ] Añadir AuthButton al Header
- [ ] Probar flujo completo con proyecto Supabase real
- [ ] Implementar sincronización bidireccional (merge de datos)
- [ ] Añadir soporte para otros providers (Apple, GitHub)
