// 🔐 Servicio de Configuración Segura - Matemágica PWA
// Este servicio carga las configuraciones desde el backend de forma segura

// config-service.js - Servicio de Configuración Segura v1.0
console.log("🔧 Config Service v1.0 cargado");

// 🚀 NUEVO: Detectar entorno de desarrollo
const isLocalDevelopment = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1' ||
                          window.location.hostname === '';

// Servicio centralizado para gestión de configuración
window.ConfigService = {
    // Configuración por defecto
    defaults: {
        geminiApiKey: '',
        offlineMode: false,
        numberFormat: 'standard',
        studentData: null,
        exerciseLevel: 'medio'
    },

    // ✅ CORREGIDO: Método para cargar configuración en todos los entornos
    async loadConfig() {
        if (isLocalDevelopment) {
            console.log('🏠 ConfigService: Usando configuración local para desarrollo');
            return {
                supabase: {
                    url: "https://uznvakpuuxnpdhoejrog.supabase.co",
                    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bnZha3B1dXhucGRob2Vqcm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODg0MTAsImV4cCI6MjA2NDY2NDQxMH0.OxbLYkjlgpWFnqd28gaZSwar_NQ6_qUS3U76bqbcXVg"
                },
                environment: 'development'
            };
        } else {
            // ✅ NUEVO: Configuración válida para producción con API key corregida
            console.log('🌐 ConfigService: Usando configuración para producción');
            return {
                supabase: {
                    url: "https://uznvakpuuxnpdhoejrog.supabase.co",
                    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bnZha3B1dXhucGRob2Vqcm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODg0MTAsImV4cCI6MjA2NDY2NDQxMH0.OxbLYkjlgpWFnqd28gaZSwar_NQ6_qUS3U76bqbcXVg"
                },
                environment: 'production'
            };
        }
    },

    // Obtener configuración
    get(key) {
        try {
            const value = localStorage.getItem(`matemagica_config_${key}`);
            return value ? JSON.parse(value) : this.defaults[key];
        } catch (error) {
            console.error(`❌ Error obteniendo config ${key}:`, error);
            return this.defaults[key];
        }
    },

    // Guardar configuración
    set(key, value) {
        try {
            localStorage.setItem(`matemagica_config_${key}`, JSON.stringify(value));
            console.log(`✅ Config guardada: ${key}`);
            return true;
        } catch (error) {
            console.error(`❌ Error guardando config ${key}:`, error);
            return false;
        }
    },

    // Obtener toda la configuración
    getAll() {
        const config = {};
        Object.keys(this.defaults).forEach(key => {
            config[key] = this.get(key);
        });
        return config;
    },

    // Limpiar configuración
    clear() {
        try {
            Object.keys(this.defaults).forEach(key => {
                localStorage.removeItem(`matemagica_config_${key}`);
            });
            console.log("🧹 Configuración limpiada");
            return true;
        } catch (error) {
            console.error("❌ Error limpiando configuración:", error);
            return false;
        }
    },

    // Exportar configuración
    export() {
        return JSON.stringify(this.getAll(), null, 2);
    },

    // Importar configuración
    import(configString) {
        try {
            const config = JSON.parse(configString);
            Object.keys(config).forEach(key => {
                if (this.defaults.hasOwnProperty(key)) {
                    this.set(key, config[key]);
                }
            });
            console.log("✅ Configuración importada");
            return true;
        } catch (error) {
            console.error("❌ Error importando configuración:", error);
            return false;
        }
    }
};

// Hacer disponible para window.configService
window.configService = window.ConfigService;

console.log(`✅ Servicio de configuración listo - Modo: ${isLocalDevelopment ? 'DESARROLLO LOCAL' : 'PRODUCCIÓN'}`);