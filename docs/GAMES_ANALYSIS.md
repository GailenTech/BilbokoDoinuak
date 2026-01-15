# Analisis del Sistema de Juegos - Base44 vs Nuestra Implementacion

## 1. Badges (Chapas)

### Badges en Base44 Original
| ID | Emoji | Nombre ES | Nombre EU | Requisito | Logica |
|----|-------|-----------|-----------|-----------|--------|
| `novato` | 🌱 | Novato | Hasiberria | Juega tu primera partida | `gamesPlayed.length >= 1` |
| `oido_fino` | 👂 | Oido Fino | Belarri Fina | Consigue 1000 puntos en una partida | `gameScore >= 1000` |
| `racha_5` | 🔥 | Racha 5 | 5eko Raxa | Consigue una racha de 5 | `currentStreak >= 5` |
| `veterano` | 🎖️ | Veterano | Beteranoa | Juega 50 partidas | `gamesPlayed.length >= 50` |

### Badges Adicionales Propuestos (complementan los de Base44)
| ID | Emoji | Nombre ES | Nombre EU | Requisito | Logica |
|----|-------|-----------|-----------|-----------|--------|
| `first_quiz` | 🎯 | Primer Quiz | Lehen Quiz | Completa tu primer quiz | `quizGamesPlayed >= 1` |
| `first_memory` | 🧠 | Primer Memory | Lehen Memory | Completa tu primer memory | `memoryGamesPlayed >= 1` |
| `perfect_quiz` | ⭐ | Quiz Perfecto | Quiz Perfektua | 5/5 en un quiz | `quizScore === maxScore` |
| `fast_memory` | ⚡ | Memory Rapido | Memory Azkarra | Memory en 12 movimientos o menos | `memoryMoves <= 12` |
| `level_2` | 🥉 | Esploratzailea | Esploratzailea | Alcanza nivel 2 | `level >= 2` |
| `level_3` | 🥈 | Bilatzailea | Bilatzailea | Alcanza nivel 3 | `level >= 3` |
| `level_4` | 🥇 | Maisua | Maisua | Alcanza nivel 4 | `level >= 4` |
| `collector_5` | 📦 | Coleccionista | Biltzailea | Desbloquea 5 sonidos | `unlockedSounds.length >= 5` |
| `explorer` | 🗺️ | Explorador | Esploratzailea | Visita todos los puntos del mapa | `visitedPoints.length === totalPoints` |

---

## 2. Sistema de Monedas y XP

### Economia del Juego
| Accion | XP Ganado | Monedas |
|--------|-----------|---------|
| Quiz - respuesta correcta | +20 XP | - |
| Quiz - puntuacion perfecta (5/5) | +100 XP bonus | - |
| Memory - completar | +50 XP base | - |
| Memory - bonus por movimientos | +5 XP por cada movimiento < 12 | - |
| Mision diaria completada | Variable | +30-100 🪙 |
| Desbloquear sonido nuevo | +10 XP | - |
| Subir de nivel | - | +50 🪙 |

### Sistema de Niveles
| Nivel | XP Requerido | Nombre ES | Nombre EU |
|-------|--------------|-----------|-----------|
| 1 | 0-99 | Novato | Hasiberria |
| 2 | 100-299 | Explorador | Esploratzailea |
| 3 | 300-599 | Buscador | Bilatzailea |
| 4 | 600+ | Maestro | Maisua |

---

## 3. Modos de Juego

### 3.1 Quiz Sonoro (Implementado)
**Estado:** ✅ Funcional

**Mecanica:**
- Se reproduce un sonido de un punto del mapa
- El jugador elige entre 4 opciones cual es el lugar correcto
- 5 rondas por partida
- Sistema de racha (streak) para respuestas consecutivas correctas

**Persistencia necesaria:**
```typescript
interface QuizStats {
  totalGames: number;
  totalCorrect: number;
  bestStreak: number;
  currentStreak: number;
  perfectGames: number;  // 5/5
}
```

### 3.2 Memory Sonoro (Implementado)
**Estado:** ✅ Funcional

**Mecanica:**
- Grid de 12 cartas (6 pares)
- Cada par: imagen del lugar + sonido del lugar
- Objetivo: emparejar todas las cartas con minimos movimientos

**Persistencia necesaria:**
```typescript
interface MemoryStats {
  totalGames: number;
  bestMoves: number;      // Menor cantidad de movimientos
  averageMoves: number;
  fastGames: number;      // Completados en <= 12 movimientos
}
```

### 3.3 Misiones Diarias (Por implementar)
**Estado:** ⏳ Pendiente

**Mecanica:**
- 3 misiones que cambian cada dia (basado en fecha)
- Tipos de misiones:
  - "Juega X partidas de Quiz"
  - "Consigue una racha de X"
  - "Desbloquea X sonidos nuevos"
  - "Completa un Memory en menos de X movimientos"
  - "Visita X puntos en el mapa"
- Recompensa en monedas al completar

**Persistencia necesaria:**
```typescript
interface DailyMissions {
  date: string;  // ISO date "2024-01-15"
  missions: Mission[];
  completedMissions: string[];  // IDs de misiones completadas
}

interface Mission {
  id: string;
  type: 'play_quiz' | 'streak' | 'unlock_sounds' | 'fast_memory' | 'visit_points';
  target: number;
  progress: number;
  reward: number;  // Monedas
  description_es: string;
  description_eu: string;
}
```

**Generador de misiones (ejemplo):**
```typescript
function generateDailyMissions(date: string, seed: number): Mission[] {
  // Usar fecha como seed para que sean las mismas para todos
  const missions = [
    { type: 'play_quiz', target: 2, reward: 50 },
    { type: 'streak', target: 5, reward: 100 },
    { type: 'unlock_sounds', target: 1, reward: 30 },
  ];
  // Mezclar basado en seed
  return shuffleWithSeed(MISSION_TEMPLATES, seed).slice(0, 3);
}
```

### 3.4 Colecciones (Por implementar)
**Estado:** ⏳ Pendiente

**Mecanica:**
- Sonidos agrupados por categoria
- Se desbloquean al:
  - Acertar en el Quiz
  - Visitar el punto en el mapa
  - Completar pares en Memory
- Progreso visual por categoria

**Categorias (de Base44):**
| Categoria | Total | Descripcion |
|-----------|-------|-------------|
| Urban | 6 | Sonidos urbanos (fuentes, plazas) |
| Nature | 9 | Naturaleza (pajaros, agua, viento) |
| People | 3 | Personas (voces, risas) |
| Traffic | 4 | Trafico (coches, tranvia) |
| Animals | 2 | Animales (perros, pajaros) |

**Persistencia necesaria:**
```typescript
interface Collections {
  unlockedSounds: string[];  // IDs de sonidos desbloqueados
  categories: {
    [categoryId: string]: {
      total: number;
      unlocked: number;
    }
  }
}
```

### 3.5 Desafio 1vs1 (Por implementar)
**Estado:** ⏳ Pendiente (requiere compartir enlace)

**Mecanica:**
- Genera partida con 5 sonidos aleatorios predeterminados
- Crea enlace unico compartible
- Ambos jugadores juegan los mismos sonidos
- Compara puntuaciones

**Persistencia necesaria:**
```typescript
interface Challenge {
  id: string;           // UUID para el enlace
  soundIds: string[];   // 5 sonidos fijos
  createdAt: string;
  creatorScore?: number;
  challengerScore?: number;
}
```

**Nota:** Este modo puede funcionar con localStorage si ambos jugadores usan el mismo dispositivo, o almacenando el reto en la URL como query params.

### 3.6 Ranking (Por implementar)
**Estado:** ⏳ Pendiente (requiere backend para ranking global)

**Para version localStorage (ranking personal):**
```typescript
interface PersonalRanking {
  weeklyXP: number;
  weekStart: string;  // ISO date del lunes
  allTimeXP: number;
  bestWeeklyXP: number;
}
```

**Para ranking global (requiere Supabase/Firebase):**
- Tabla de usuarios con XP semanal
- Reset automatico cada lunes
- Top 10 visible

---

## 4. Estructura de Persistencia Propuesta (localStorage)

```typescript
// types.ts - Actualizado

interface GameProgress {
  // XP y nivel
  odisea2xp: number;
  level: number;
  coins: number;

  // Badges
  badges: Badge[];

  // Estadisticas de juegos
  quizStats: QuizStats;
  memoryStats: MemoryStats;

  // Historial de partidas
  gamesPlayed: GameRecord[];

  // Colecciones
  unlockedSounds: string[];

  // Misiones
  dailyMissions: DailyMissions;

  // Puntos visitados en el mapa
  visitedPoints: string[];

  // Ranking personal
  personalRanking: PersonalRanking;
}

// Claves en localStorage
const STORAGE_KEYS = {
  PROFILE: 'bilboko_doinuak_profile',
  PROGRESS: 'bilboko_doinuak_progress',
  CHALLENGES: 'bilboko_doinuak_challenges',  // Para 1vs1
};
```

---

## 5. Prioridad de Implementacion

### Fase 1 - Completar lo basico (ya hecho)
- [x] Quiz funcional con XP
- [x] Memory funcional con XP
- [x] Sistema de niveles
- [x] Badges basicos
- [x] Perfil de usuario

### Fase 2 - Mejorar engagement
- [ ] Actualizar badges con los de Base44 (novato, oido_fino, racha_5, veterano)
- [ ] Sistema de monedas
- [ ] Pagina de perfil con badges visuales
- [ ] Sistema de rachas (streak)

### Fase 3 - Colecciones y Misiones
- [ ] Sistema de colecciones por categoria
- [ ] Desbloqueo de sonidos en Quiz/Memory/Mapa
- [ ] Misiones diarias con generador deterministico

### Fase 4 - Social (requiere decision sobre backend)
- [ ] Desafio 1vs1 (puede ser solo URL)
- [ ] Ranking (requiere Supabase para global)

---

## 6. Notas Tecnicas

### Generacion deterministica de misiones diarias
Para que todos los usuarios vean las mismas misiones el mismo dia:
```typescript
function getDailySeed(date: string): number {
  // Convertir fecha a numero para seed
  return parseInt(date.replace(/-/g, ''), 10);
}
```

### Compatibilidad con Supabase futuro
El patron Adapter ya implementado permite:
1. Mantener `LocalStorageAdapter` para desarrollo/MVP
2. Crear `SupabaseAdapter` cuando sea necesario
3. Cambiar solo la instanciacion en el Provider

### Sincronizacion de rachas
La racha se resetea si:
- El usuario cierra la app (opcion conservadora)
- El usuario falla una pregunta
- Pasa un tiempo determinado (ej: 30 segundos entre respuestas)
