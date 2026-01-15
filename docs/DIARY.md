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
