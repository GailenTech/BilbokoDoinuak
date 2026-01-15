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

### Próximos pasos
- [ ] Probar que todo compila y funciona
- [ ] Implementar juego Quiz básico
- [ ] Implementar juego Memory básico
- [ ] Añadir filtros de emociones en el mapa
- [ ] Considerar persistencia ligera (localStorage para progreso)

### Notas sobre migración de Base44
- La integración GitHub de Base44 es **parcialmente bidireccional**
- Solo el frontend se sincroniza; backend/BD permanecen en Base44
- Para control total, necesario reconstruir (lo que estamos haciendo)
- Los assets (imágenes, audios) siguen en servidores de Base44 por ahora
