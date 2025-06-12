# 🧮 Matemágica PWA - Sistema Educativo con Roles

> **Una Progressive Web App educativa para generar ejercicios de matemáticas con IA, diseñada para profesores y apoderados.**

## 🎯 Características Principales

✅ **Sistema de Roles**: Profesores crean estudiantes, apoderados acceden a sus hijos  
✅ **Autenticación**: Google OAuth + Supabase + modo offline  
✅ **Ejercicios IA**: Google Gemini genera 50 sumas + 50 restas por nivel  
✅ **3 Niveles**: Fácil (sin reserva), Medio (con reserva), Difícil (mixto)  
✅ **Cuentos Matemáticos**: IA crea problemas narrativos personalizados  
✅ **PWA Completa**: Instalable, funciona offline, datos sincronizados  
✅ **Seguimiento**: Progreso detallado por estudiante en la nube  

## 🚀 Setup Rápido (5 minutos)

### Paso 1: Configurar Supabase
```bash
1. Crear proyecto en https://supabase.com
2. Ir a SQL Editor
3. Ejecutar database-schema.sql (crear tablas)
4. Ejecutar test-data.sql (datos de prueba)
5. Copiar URL y API Key desde Settings > API
```

### Paso 2: Configurar Google OAuth
```bash
1. Ir a Google Cloud Console
2. Crear proyecto > APIs y servicios > Credenciales
3. Crear "ID de cliente OAuth 2.0" para aplicación web
4. Agregar dominio autorizado (localhost:3000 para desarrollo)
5. Copiar Client ID
```

### Paso 3: Configurar Variables
```javascript
// En supabase-config.js
const SUPABASE_URL = 'TU_URL_AQUI'
const SUPABASE_ANON_KEY = 'TU_KEY_AQUI'

// En index.html (línea ~40)
const GOOGLE_CLIENT_ID = 'TU_CLIENT_ID_AQUI'

// En app.js (línea ~380)
const API_KEY = "TU_GEMINI_API_KEY_AQUI"
```

### Paso 4: Ejecutar
```bash
# Opción A: Servidor simple
python3 -m http.server 3000
# o
npx serve -p 3000

# Opción B: Live Server (VS Code)
# Instalar extensión "Live Server" > Click derecho en index.html
```

### Paso 5: Probar
```
http://localhost:3000
```

## 👥 Cuentas de Prueba Disponibles

### 👩‍🏫 Profesor
- **Email**: `profesora.maria@colegio.cl`
- **Estudiantes**: Pedro, Ana, Carlos, Sofía
- **Puede**: Crear estudiantes, ver todo el progreso

### 👨‍👩‍👧‍👦 Apoderados
- **Carmen Vargas** → Pedro Sánchez (2° Básico)
- **Roberto López** → Ana López (1° Básico)  
- **Lucía Ruiz** → Carlos Ruiz (2° Básico)

### 🎮 Modo Demo (Sin autenticación)
- Click "Continuar sin cuenta" en cualquier pantalla
- Funcionalidad completa offline
- Datos se guardan localmente

## 🎯 Flujo de Usuario

### Para Profesores:
1. **Bienvenida** → Seleccionar "Soy Profesor/a"
2. **Autenticación** → Google Sign-In
3. **Dashboard** → Ver todos los estudiantes, crear nuevos
4. **Ejercicios** → Generar para cualquier estudiante
5. **Seguimiento** → Ver progreso y estadísticas

### Para Apoderados:
1. **Bienvenida** → Seleccionar "Soy Apoderado/a"
2. **Estudiante** → Ingresar nombre y curso del hijo/a
3. **Autenticación** → Google Sign-In  
4. **Ejercicios** → Solo para su estudiante
5. **Progreso** → Ver avance de su hijo/a

## 🛠️ Estructura del Proyecto

```
Matemágica/
├── index.html              # Página principal con pantallas de auth
├── app.js                  # Lógica principal de la aplicación  
├── auth-manager.js         # Sistema de autenticación y roles
├── supabase-config.js      # Configuración de base de datos
├── database-schema.sql     # Esquema de BD (ejecutar en Supabase)
├── test-data.sql          # Datos de prueba (ejecutar después)
├── manifest.json          # Configuración PWA
├── sw.js                  # Service Worker para offline
└── public/
    └── styles.css         # Estilos compilados de Tailwind
```

## 🗄️ Base de Datos (Supabase)

### Tablas Principales:
- `math_users` - Usuarios con roles (profesor/apoderado)
- `math_students` - Estudiantes creados por profesores  
- `math_parent_student_relations` - Relaciones familiares
- `math_exercise_sessions` - Sesiones de ejercicios
- `math_story_attempts` - Intentos en cuentos matemáticos
- `math_user_progress` - Progreso y estadísticas

### Características:
- **RLS (Row Level Security)**: Cada usuario solo ve sus datos
- **Triggers**: Sincronización automática entre tablas
- **JSONB**: Almacenamiento flexible de ejercicios y progreso

## 🤖 APIs Utilizadas

### Google Gemini (Generación de contenido)
```javascript
- Ejercicios matemáticos estructurados
- Cuentos personalizados por estudiante
- Feedback educativo inteligente
- Fallback offline con plantillas
```

### Google OAuth (Autenticación)
```javascript
- Sign-In seguro
- Información de perfil
- Integración con Supabase
- Modo offline disponible
```

## 📱 PWA Features

### Instalación:
- Prompt automático en navegadores compatibles
- Funciona como app nativa una vez instalada
- Icono en escritorio/home screen

### Offline:
- Service Worker cachea recursos estáticos
- localStorage para ejercicios y progreso
- Sincronización automática al reconectar

### Responsive:
- Optimizado para móviles (target principal)
- Interfaz táctil amigable para niños
- Funciona en tablets y desktop

## 🔧 Personalización

### Niveles de Dificultad:
```javascript
// En app.js, función generateAndRenderExercises()
Nivel 1: Números 10-50, sin reserva
Nivel 2: Números 10-99, con reserva ocasional  
Nivel 3: Números 10-99, 50% con reserva, 50% sin reserva
```

### Plantillas de Cuentos:
```javascript
// En app.js, función getRandomStoryTemplate()
- Contextos: Animales, juguetes, deportes, comida
- Personajes con nombres latinos
- Situaciones familiares para niños chilenos
```

### Estilos:
```css
/* En public/styles.css */
- Colores child-friendly
- Animaciones suaves
- Feedback visual inmediato
- Tipografía legible para niños
```

## 🐛 Troubleshooting

### "Error de autenticación"
```bash
1. Verificar Google Client ID en index.html
2. Verificar URL autorizada en Google Cloud Console
3. Verificar configuración de Supabase en supabase-config.js
```

### "No se cargan ejercicios"
```bash
1. Verificar Google Gemini API Key en app.js
2. Verificar conexión a internet
3. Revisar console del navegador para errores específicos
```

### "Error de base de datos"
```bash
1. Verificar que database-schema.sql se ejecutó correctamente
2. Verificar RLS policies en Supabase
3. Verificar que el usuario tiene permisos
```

### "PWA no se instala"
```bash
1. Debe servirse via HTTPS (excepto localhost)
2. Verificar manifest.json
3. Verificar Service Worker en DevTools
```

## 📊 Métricas y Analytics

### Datos que se rastrean:
- Ejercicios completados por estudiante
- Tiempo dedicado por sesión
- Accuracy rate por nivel de dificultad  
- Progreso histórico y rachas
- Preferencias de operación (+/-)

### Reportes disponibles:
- Dashboard de profesor con vista grupal
- Vista individual de estudiante para apoderados
- Progreso histórico con gráficos
- Identificación de áreas de mejora

## 🛡️ Seguridad y Privacidad

### Medidas implementadas:
- Autenticación OAuth segura
- Row Level Security en base de datos
- Datos de menores protegidos (solo acceso familiar)
- Cifrado en tránsito y reposo
- Sin tracking de terceros

### Cumplimiento:
- COPPA compliant (menores de 13 años)
- GDPR considerations para datos personales
- Datos almacenados en servidores seguros (Supabase)

## 🚀 Próximas Funcionalidades

### En desarrollo:
- [ ] Dashboard avanzado para profesores
- [ ] Reportes PDF automatizados  
- [ ] Integración con calendarios escolares
- [ ] Multiplayer math games
- [ ] Reconocimiento de voz para respuestas
- [ ] AR/VR math experiences

### Sugerencias bienvenidas:
Crear issue en el repositorio o contactar al equipo de desarrollo.

---

## 📞 Soporte

**Desarrollado para educación chilena** 🇨🇱  
**Contacto**: Crear issue en GitHub  
**Licencia**: MIT - Uso libre para instituciones educativas

**¡Matemágica hace que aprender matemáticas sea divertido!** ✨🧮✨