# 💪 FitTracker - Aplicación de Fitness

Una aplicación web moderna y optimizada para el seguimiento de entrenamientos, creación de rutinas y visualización de estadísticas.

## 🚀 Características

### 📅 Diario de Entrenamiento
- Registra tus sesiones de entrenamiento diarias
- Añade ejercicios con series, repeticiones y peso
- Edita y elimina sesiones fácilmente
- Vista cronológica de tu historial

### 📋 Gestor de Rutinas
- Crea rutinas personalizadas con múltiples días
- Organiza ejercicios por día de entrenamiento
- **Exporta** rutinas a archivos JSON
- **Importa** rutinas desde archivos JSON
- Comparte rutinas con otros usuarios

### 📊 Estadísticas
- Visualiza tu progreso en diferentes períodos (semana, mes, año, histórico)
- Métricas clave:
  - Total de entrenamientos
  - Ejercicios más utilizados
  - Volumen total levantado
  - Duración promedio de sesiones
- Línea de tiempo de actividad reciente

## 🛠️ Tecnologías

- **HTML5** - Estructura semántica
- **CSS3** - Diseño moderno con variables CSS y animaciones
- **JavaScript (ES6+)** - Lógica de aplicación modular
- **localStorage** - Almacenamiento local de datos

## 📁 Estructura del Proyecto

```
EasyTracker/
├── index.html              # Página principal
├── styles/
│   └── main.css           # Estilos principales con design tokens
├── js/
│   ├── app.js             # Controlador principal de la aplicación
│   ├── utils/
│   │   ├── storage.js     # Capa de abstracción de datos
│   │   └── ui.js          # Utilidades de interfaz reutilizables
│   └── modules/
│       ├── diary.js       # Módulo de diario de entrenamiento
│       ├── routines.js    # Módulo de gestión de rutinas
│       └── stats.js       # Módulo de estadísticas
└── README.md              # Este archivo
```

## 🎨 Características de Diseño

- **Responsive**: Optimizado para móvil, tablet y escritorio
- **Tema Oscuro/Claro**: Cambia entre temas con un clic
- **Animaciones Suaves**: Transiciones fluidas sin afectar el rendimiento
- **Touch-Friendly**: Botones grandes y espaciado cómodo para uso móvil
- **Diseño Moderno**: Gradientes, sombras y micro-animaciones

## 🚀 Cómo Usar

1. **Abrir la aplicación**: Simplemente abre `index.html` en tu navegador
2. **Añadir una sesión**: 
   - Ve a la pestaña "Diario"
   - Haz clic en "Nueva Sesión"
   - Completa los datos y añade ejercicios
3. **Crear una rutina**:
   - Ve a la pestaña "Rutinas"
   - Haz clic en "Nueva Rutina"
   - Añade días y ejercicios
4. **Ver estadísticas**:
   - Ve a la pestaña "Stats"
   - Selecciona el período que quieres analizar

## ⌨️ Atajos de Teclado

- `1` - Ir a Diario
- `2` - Ir a Rutinas
- `3` - Ir a Estadísticas
- `Ctrl/Cmd + N` - Añadir nueva sesión/rutina (según la vista actual)

## 📦 Importar/Exportar Datos

### Exportar una Rutina
1. Ve a "Rutinas"
2. Haz clic en el icono de exportación (📥) de la rutina
3. Se descargará un archivo JSON

### Importar una Rutina
1. Ve a "Rutinas"
2. Haz clic en "Importar"
3. Selecciona el archivo JSON de la rutina

## 🔄 Migración a Backend (Supabase/Firebase)

La aplicación está diseñada con una **capa de abstracción de datos** (`storage.js`) que facilita la migración a un backend:

### Pasos para migrar:

1. **Actualizar `storage.js`**:
   - Reemplaza las implementaciones de localStorage con llamadas a la API
   - Añade `async/await` a los métodos
   - Implementa manejo de errores de red

2. **Ejemplo de migración a Supabase**:

```javascript
// Antes (localStorage)
const getSessions = () => {
    const sessions = get(KEYS.SESSIONS);
    return sessions || [];
};

// Después (Supabase)
const getSessions = async () => {
    const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
};
```

3. **Actualizar módulos**:
   - Añade `async/await` en los módulos que usan `StorageService`
   - Añade indicadores de carga durante las operaciones

4. **Autenticación** (opcional):
   - Implementa login/registro
   - Asocia datos con usuarios específicos

## 🎯 Optimizaciones

- **Código modular**: Fácil de mantener y extender
- **Eventos delegados**: Mejor rendimiento con listas dinámicas
- **Debounce/Throttle**: Optimización de eventos frecuentes
- **Animaciones CSS**: Uso de GPU para animaciones suaves
- **Lazy loading**: Carga de contenido bajo demanda

## 🔮 Futuras Mejoras

- [ ] PWA (Progressive Web App) con Service Worker
- [ ] Gráficos de progreso con Chart.js
- [ ] Temporizador de descanso entre series
- [ ] Calculadora de 1RM
- [ ] Sincronización con backend (Supabase/Firebase)
- [ ] Modo offline completo
- [ ] Compartir rutinas por URL
- [ ] Fotos de progreso
- [ ] Recordatorios de entrenamiento

## 📱 Compatibilidad

- ✅ Chrome/Edge (últimas versiones)
- ✅ Firefox (últimas versiones)
- ✅ Safari (iOS 12+)
- ✅ Chrome Mobile
- ✅ Safari Mobile

## 🐛 Solución de Problemas

### Los datos no se guardan
- Verifica que tu navegador permita localStorage
- Comprueba que no estés en modo incógnito

### La aplicación no carga
- Abre la consola del navegador (F12) y busca errores
- Verifica que todos los archivos JS y CSS estén en las rutas correctas

### Problemas de rendimiento
- Limpia datos antiguos si tienes muchas sesiones
- Actualiza tu navegador a la última versión

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👨‍💻 Desarrollo

### Estructura de Código

- **Patrón de Módulos**: Cada módulo es un IIFE que expone una API pública
- **Separación de Responsabilidades**: UI, Datos y Lógica están separados
- **Comentarios JSDoc**: Documentación inline para mejor mantenibilidad

### Añadir Nuevas Funcionalidades

1. Crea un nuevo módulo en `js/modules/` si es necesario
2. Usa `StorageService` para todas las operaciones de datos
3. Usa `UIUtils` para componentes de interfaz comunes
4. Sigue el patrón de código existente
5. Añade comentarios descriptivos

---

**¡Disfruta de tu entrenamiento! 💪**
