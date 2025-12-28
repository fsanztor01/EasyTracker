# Funcionalidades de EasyTracker

## 1. Diario de Entrenamiento (Core)
*   **Navegación Semanal**: Vista por semanas con desplazamiento infinito (semana anterior/siguiente) y botón para volver a la "Semana actual".
*   **Gestión de Sesiones**:
    *   Crear nueva sesión (Nombre, Fecha).
    *   Editar sesión existente.
    *   Clonar/Copiar sesiones.
    *   Eliminar sesiones.
    *   "Limpiar semana" (borrar todas las sesiones de la semana visible).
*   **Gestión de Ejercicios**:
    *   Añadir ejercicios a una sesión.
    *   Reordenar ejercicios dentro de una sesión.
    *   Notas específicas por ejercicio.
*   **Registro de Series (Sets)**:
    *   Campos: Kg, Reps, RIR (Recámaras en Reserva).
    *   Validación de datos.
    *   Detección automática de **PR** (Récord Personal) en Peso, Volumen y Repeticiones.
    *   Cálculo automático de **1RM** (Repetición Máxima) usando fórmulas (Epley, Brzycki, Wendler) y visualización si es PR.
    *   **Datos de la semana anterior**: Posibilidad de ver lo que se hizo la semana pasada para ese mismo ejercicio y set (botón "ojo").
    *   Visualización diferida (Lazy Loading) para ejercicios con muchas series (optimización de rendimiento).

## 2. Herramientas de Entrenamiento
*   **Temporizador de Descanso**:
    *   Configurable (ej. 1:30, 2:00, 3:00 min).
    *   Visualización flotante/modal.
    *   Notificación al terminar.
*   **Calculadora 1RM**: Integrada en la visualización de las series.

## 3. Estadísticas y Progreso
*   **KPIs Semanales**:
    *   Total Sesiones.
    *   Ejercicio con más progreso (Top).
    *   Volumen total (kg).
    *   RIR Promedio.
*   **Gráficos Interactivos**:
    *   Filtros: Métrica (Volumen, RIR, Peso Máximo), Ejercicio (Buscador con autocompletado), Periodo (4, 8, 12 semanas).
    *   Gráfico circular agregado (distribución por ejercicio).
    *   Gráfico de líneas para progreso de ejercicios específicos.
*   **Gestión de Ciclos**:
    *   Archivar ciclo actual (guardar estado y empezar de cero estadísticas).
    *   Historial de ciclos archivados.

## 4. Rutinas
*   **Constructor de Rutinas**:
    *   Interfaz para crear rutinas multidia.
    *   Añadir días, ejercicios y configuración de series (series planas, piramidales, dropsets).
    *   Guardar como plantilla.
*   **Biblioteca de Rutinas**:
    *   Rutinas creadas por el usuario.
    *   Rutinas por defecto/ejemplo.
*   **Importar/Exportar**:
    *   Sistema para compartir rutinas mediante archivos JSON.

## 5. BodyTrack (Seguimiento Corporal)
*   **Perfil Físico**:
    *   Altura, Peso, % Grasa Corporal.
    *   Historial de Peso y % Grasa.
*   **Medidas Corporales**:
    *   Registro de medidas: Brazos, Pecho, Cintura, Caderas, Piernas, Gemelos.
    *   Historial de medidas.
*   **Calculadora TMB/TDEE**:
    *   Cálculo de Tasa Metabólica Basal y Gasto Energético Total.
    *   Ajuste por nivel de actividad y objetivo (Perder, Mantener, Ganar).

## 6. Perfil y Gamificación
*   **Perfil de Usuario**:
    *   Avatar personalizable (Integración con DiceBear: múltiples estilos como 'avataaars', 'bottts', etc.) o subida de foto propia.
    *   Nombre y Apellidos.
    *   Visualización de Nivel.
*   **Gamificación**:
    *   Sistema de Niveles (basado en XP o constancia).
    *   Rachas (Streaks) de entrenamiento.
    *   Logros y Objetivos (Goals).
    *   Notas rápidas personales.

## 7. Ajustes y Sistema
*   **Tema y Apariencia**:
    *   Modo Oscuro / Modo Claro.
    *   Personalización de color de acento (paleta de colores).
    *   Aplicación en tiempo real (variables CSS).
*   **Gestión de Datos**:
    *   Persistencia local (LocalStorage).
    *   Importar/Exportar Copia de Seguridad completa (Backup JSON).
    *   Importar/Exportar Sesiones específicas.
    *   Manual de usuario y créditos.

---

# Prompt para Generación (Reescritura)

Aquí tienes el prompt optimizado para solicitar a una IA la reconstrucción de esta aplicación mejorando su calidad, fluidez y código:

***

**Prompt:**

"Actúa como un Arquitecto de Software Senior y Desarrollador Frontend experto en UX/UI. Quiero que reconstruyas desde cero la aplicación web 'EasyTracker', manteniendo estrictamente su estética visual actual (diseño premium, glassmorphism, modo oscuro/claro, paletas de colores refinadas) pero reescribiendo todo el código base para lograr una fluidez máxima, un rendimiento impecable y cero bugs.

**Objetivo:** Crear una Single Page Application (SPA) moderna, robusta y altamente optimizada.

**Stack Tecnológico Recomendado:**
*   **Framework:** React 18+ (o Preact para menor peso) con Vite.
*   **Lenguaje:** TypeScript (para robustez y evitar errores de tipo).
*   **Estilos:** TailwindCSS (para consistencia y performance) + Framer Motion (para micro-interacciones sedosas y transiciones fluidas entre pestañas/modales).
*   **Estado:** Zustand o TanStack Query (para un manejo de estado global atómico y performante, evitando el 'prop drilling' y re-renderizados innecesarios).
*   **Persistencia:** IDB-Keyval o adaptadores robustos para LocalStorage.
*   **Gráficos:** Recharts o Chart.js wrapper optimizado.

**Requisitos Funcionales (Deben replicarse fielmente):**
1.  **Diario Semanal (Core):** Scroll infinito real o virtualizado para semanas. CRUD de sesiones instantáneo. Edición 'inline' de sets sin lag. Detección automática y notificación de PRs y cálculos de 1RM al vuelo.
2.  **Rutinas:** Constructor 'Drag & Drop' para ejercicios y días. Importación/Exportación de rutinas via JSON.
3.  **BodyTrack & Stats:** Gráficos interactivos con transiciones suaves. Calculadoras de TMB integradas. Historial de medidas corporales.
4.  **Gamificación & Perfil:** Sistema de niveles, avatar generativo (DiceBear API) y rachas.
5.  **UX/UI Premium:**
    *   **Feedback Inmediato:** Cada acción (guardar, borrar, completar) debe tener un feedback visual (toast, animación de tick, confetti en logros).
    *   **Transiciones:** Navegación entre pestañas (Diario -> Stats -> Rutinas) con animaciones 'slide' o 'fade' suaves.
    *   **Carga Diferida:** Implementar 'Lazy Loading' en listas largas (ej. historial de sesiones) para que la app nunca se congele.

**Instrucciones de Código:**
*   **Modularidad:** Divide la aplicación en componentes pequeños y reutilizables (ej: `SessionCard`, `SetRow`, `WeekNavigation`, `StatsChart`).
*   **Clean Code:** Usa principios SOLID. Separa la lógica de negocio (hooks personalizados) de la UI.
*   **Optimización:** Minimiza los re-renderizados. Usa `useMemo` y `useCallback` donde sea crítico. Asegura 60fps constantes en animaciones.
*   **Eliminación de Deuda Técnica:** No copies el código monolítico antiguo (jQuery-style o vanilla spaghetti). Escribe lógica declarativa moderna.

Por favor, comienza estructurando el proyecto, definiendo los tipos de datos principales (Interfaces para Session, Exercise, Set, UserProfile) y configurando el Store global."
