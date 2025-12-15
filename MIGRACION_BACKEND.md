# 🔄 Guía de Migración a Supabase/Firebase

Esta guía te muestra exactamente cómo migrar FitTracker de localStorage a Supabase o Firebase.

---

## 📋 Opción 1: Migración a Supabase

### Paso 1: Configurar Supabase

#### 1.1 Crear Proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta y un nuevo proyecto
3. Guarda tu `URL` y `anon key`

#### 1.2 Crear Tablas

Ejecuta este SQL en el editor de Supabase:

```sql
-- Tabla de sesiones
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  duration INTEGER,
  notes TEXT,
  exercises JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de rutinas
CREATE TABLE routines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  days JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de configuración de usuario
CREATE TABLE user_settings (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  theme TEXT DEFAULT 'light',
  notifications BOOLEAN DEFAULT true,
  language TEXT DEFAULT 'es',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX sessions_user_id_idx ON sessions(user_id);
CREATE INDEX sessions_date_idx ON sessions(date DESC);
CREATE INDEX routines_user_id_idx ON routines(user_id);

-- Row Level Security (RLS)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para sessions
CREATE POLICY "Users can view own sessions"
  ON sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas de seguridad para routines
CREATE POLICY "Users can view own routines"
  ON routines FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own routines"
  ON routines FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own routines"
  ON routines FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own routines"
  ON routines FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas de seguridad para user_settings
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);
```

### Paso 2: Instalar Cliente de Supabase

Añade esto al `<head>` de tu `index.html`:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### Paso 3: Actualizar storage.js

Reemplaza el contenido de `js/utils/storage.js`:

```javascript
/**
 * Storage Service - Supabase Implementation
 */

const StorageService = (() => {
    // Configuración de Supabase
    const SUPABASE_URL = 'TU_SUPABASE_URL';
    const SUPABASE_ANON_KEY = 'TU_SUPABASE_ANON_KEY';
    
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // ===== AUTHENTICATION =====

    /**
     * Sign up new user
     */
    const signUp = async (email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });
        if (error) throw error;
        return data;
    };

    /**
     * Sign in user
     */
    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        return data;
    };

    /**
     * Sign out user
     */
    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    /**
     * Get current user
     */
    const getCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    };

    // ===== SESSIONS =====

    /**
     * Get all sessions for current user
     */
    const getSessions = async () => {
        const { data, error } = await supabase
            .from('sessions')
            .select('*')
            .order('date', { ascending: false });
        
        if (error) throw error;
        return data || [];
    };

    /**
     * Get single session by ID
     */
    const getSession = async (id) => {
        const { data, error } = await supabase
            .from('sessions')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return data;
    };

    /**
     * Save new session
     */
    const saveSession = async (session) => {
        const user = await getCurrentUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('sessions')
            .insert([{
                ...session,
                user_id: user.id
            }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    };

    /**
     * Update existing session
     */
    const updateSession = async (id, updates) => {
        const { data, error } = await supabase
            .from('sessions')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    };

    /**
     * Delete session
     */
    const deleteSession = async (id) => {
        const { error } = await supabase
            .from('sessions')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return true;
    };

    /**
     * Get sessions by date range
     */
    const getSessionsByDateRange = async (startDate, endDate) => {
        const { data, error } = await supabase
            .from('sessions')
            .select('*')
            .gte('date', startDate.toISOString().split('T')[0])
            .lte('date', endDate.toISOString().split('T')[0])
            .order('date', { ascending: false });
        
        if (error) throw error;
        return data || [];
    };

    // ===== ROUTINES =====

    /**
     * Get all routines for current user
     */
    const getRoutines = async () => {
        const { data, error } = await supabase
            .from('routines')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
    };

    /**
     * Get single routine by ID
     */
    const getRoutine = async (id) => {
        const { data, error } = await supabase
            .from('routines')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return data;
    };

    /**
     * Save new routine
     */
    const saveRoutine = async (routine) => {
        const user = await getCurrentUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('routines')
            .insert([{
                ...routine,
                user_id: user.id
            }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    };

    /**
     * Update existing routine
     */
    const updateRoutine = async (id, updates) => {
        const { data, error } = await supabase
            .from('routines')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    };

    /**
     * Delete routine
     */
    const deleteRoutine = async (id) => {
        const { error } = await supabase
            .from('routines')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return true;
    };

    /**
     * Export routine (same as before, just gets from Supabase)
     */
    const exportRoutine = async (id) => {
        const routine = await getRoutine(id);
        if (!routine) return null;
        
        const exportData = {
            name: routine.name,
            description: routine.description,
            days: routine.days,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
        
        return JSON.stringify(exportData, null, 2);
    };

    /**
     * Import routine (saves to Supabase)
     */
    const importRoutine = async (jsonString) => {
        try {
            const data = JSON.parse(jsonString);
            
            if (!data.name || !data.days) {
                throw new Error('Invalid routine format');
            }
            
            const routine = {
                name: data.name,
                description: data.description || '',
                days: data.days
            };
            
            return await saveRoutine(routine);
        } catch (error) {
            console.error('Error importing routine:', error);
            return null;
        }
    };

    // ===== SETTINGS =====

    /**
     * Get user settings
     */
    const getSettings = async () => {
        const user = await getCurrentUser();
        if (!user) return { theme: 'light', notifications: true, language: 'es' };

        const { data, error } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', user.id)
            .single();
        
        if (error) {
            // If no settings exist, create default
            return { theme: 'light', notifications: true, language: 'es' };
        }
        
        return data;
    };

    /**
     * Update settings
     */
    const updateSettings = async (updates) => {
        const user = await getCurrentUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('user_settings')
            .upsert({
                user_id: user.id,
                ...updates,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    };

    /**
     * Get theme (from settings)
     */
    const getTheme = async () => {
        const settings = await getSettings();
        return settings.theme || 'light';
    };

    /**
     * Set theme
     */
    const setTheme = async (theme) => {
        await updateSettings({ theme });
        return true;
    };

    // Public API
    return {
        // Auth
        signUp,
        signIn,
        signOut,
        getCurrentUser,
        
        // Sessions
        getSessions,
        getSession,
        saveSession,
        updateSession,
        deleteSession,
        getSessionsByDateRange,
        
        // Routines
        getRoutines,
        getRoutine,
        saveRoutine,
        updateRoutine,
        deleteRoutine,
        exportRoutine,
        importRoutine,
        
        // Settings
        getSettings,
        updateSettings,
        getTheme,
        setTheme
    };
})();

window.StorageService = StorageService;
```

### Paso 4: Actualizar Módulos para Async/Await

Ejemplo en `diary.js`:

```javascript
// Antes (síncrono)
const renderSessions = () => {
    const sessions = StorageService.getSessions();
    // ... render
};

// Después (asíncrono)
const renderSessions = async () => {
    try {
        UIUtils.showLoading(container, 'Cargando sesiones...');
        const sessions = await StorageService.getSessions();
        // ... render
    } catch (error) {
        console.error('Error loading sessions:', error);
        UIUtils.showToast({ 
            message: 'Error al cargar las sesiones', 
            type: 'error' 
        });
    }
};
```

### Paso 5: Añadir Pantalla de Login

Crea `login.html`:

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FitTracker - Login</title>
    <link rel="stylesheet" href="styles/main.css">
</head>
<body>
    <div class="login-container">
        <h1>💪 FitTracker</h1>
        <form id="loginForm">
            <input type="email" id="email" placeholder="Email" required>
            <input type="password" id="password" placeholder="Contraseña" required>
            <button type="submit" class="btn btn-primary">Entrar</button>
        </form>
        <p>¿No tienes cuenta? <a href="#" id="signupLink">Regístrate</a></p>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="js/utils/storage.js"></script>
    <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                await StorageService.signIn(email, password);
                window.location.href = 'index.html';
            } catch (error) {
                alert('Error al iniciar sesión: ' + error.message);
            }
        });
    </script>
</body>
</html>
```

---

## 📋 Opción 2: Migración a Firebase

### Paso 1: Configurar Firebase

1. Ve a [console.firebase.google.com](https://console.firebase.google.com)
2. Crea un nuevo proyecto
3. Habilita Authentication (Email/Password)
4. Habilita Firestore Database

### Paso 2: Añadir Firebase SDK

En `index.html`:

```html
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>

<script>
  const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "TU_AUTH_DOMAIN",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_STORAGE_BUCKET",
    messagingSenderId: "TU_MESSAGING_SENDER_ID",
    appId: "TU_APP_ID"
  };
  
  firebase.initializeApp(firebaseConfig);
</script>
```

### Paso 3: Actualizar storage.js para Firebase

```javascript
const StorageService = (() => {
    const auth = firebase.auth();
    const db = firebase.firestore();

    // ===== SESSIONS =====

    const getSessions = async () => {
        const user = auth.currentUser;
        if (!user) throw new Error('Not authenticated');

        const snapshot = await db.collection('sessions')
            .where('userId', '==', user.uid)
            .orderBy('date', 'desc')
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    };

    const saveSession = async (session) => {
        const user = auth.currentUser;
        if (!user) throw new Error('Not authenticated');

        const docRef = await db.collection('sessions').add({
            ...session,
            userId: user.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        return { id: docRef.id, ...session };
    };

    const updateSession = async (id, updates) => {
        await db.collection('sessions').doc(id).update({
            ...updates,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        const doc = await db.collection('sessions').doc(id).get();
        return { id: doc.id, ...doc.data() };
    };

    const deleteSession = async (id) => {
        await db.collection('sessions').doc(id).delete();
        return true;
    };

    // Similar para routines...

    return {
        getSessions,
        saveSession,
        updateSession,
        deleteSession,
        // ... más métodos
    };
})();
```

---

## 🔐 Reglas de Seguridad

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sessions/{sessionId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
    
    match /routines/{routineId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## 📝 Checklist de Migración

- [ ] Configurar proyecto en Supabase/Firebase
- [ ] Crear tablas/colecciones
- [ ] Configurar reglas de seguridad
- [ ] Añadir SDK al proyecto
- [ ] Actualizar `storage.js` con implementación async
- [ ] Actualizar todos los módulos con async/await
- [ ] Añadir indicadores de carga
- [ ] Implementar pantalla de login
- [ ] Implementar manejo de errores de red
- [ ] Probar todas las funcionalidades
- [ ] Migrar datos existentes (si hay)

---

## 🎯 Ventajas de la Migración

### Con Supabase/Firebase obtendrás:
- ✅ Sincronización multi-dispositivo
- ✅ Backup automático en la nube
- ✅ Autenticación de usuarios
- ✅ Datos seguros y privados
- ✅ Escalabilidad automática
- ✅ Modo offline (con configuración adicional)

---

## 💡 Consejos

1. **Empieza con Supabase** - Es más simple y tiene mejor DX
2. **Prueba en local primero** - Usa datos de prueba
3. **Implementa loading states** - Mejora la UX durante peticiones
4. **Maneja errores de red** - Muestra mensajes claros al usuario
5. **Considera offline-first** - Guarda en localStorage como cache

---

¡Buena suerte con la migración! 🚀
