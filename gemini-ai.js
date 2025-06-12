// Matemágica PWA - Servicio de IA con Google Gemini - VERSIÓN SUPABASE EDGE FUNCTIONS
// Este servicio ahora usa Supabase Edge Functions para proteger las API keys

class GeminiAIService {
    constructor() {
        this.configured = false;
        this.isNetlify = window.location.hostname.includes('netlify.app');
        this.apiEndpoint = this.isNetlify ? 
            '/.netlify/functions/gemini-ai' : // ✅ Netlify Function segura
            '/api/gemini-ai'; // Para otros deployments
        
        // ✅ SIN CREDENCIALES HARDCODEADAS
        console.log(`🔒 Servicio IA configurado en modo seguro: ${this.isNetlify ? 'Netlify' : 'Estándar'}`);
        this.initializeSecureConnection();
    }

    async initializeSecureConnection() {
        try {
            // ✅ Verificar conectividad con backend seguro
            const testResponse = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: "Test de conectividad - responde: OK"
                })
            });

            if (testResponse.ok) {
                const data = await testResponse.json();
                if (data.success) {
                    this.configured = true;
                    console.log('✅ IA configurada correctamente con backend seguro');
                    return;
                }
            }
            
            console.log('⚠️ Backend IA no disponible - modo offline activo');
            this.configured = false;
            
        } catch (error) {
            console.log('📱 Conexión IA no disponible - modo offline activo');
            this.configured = false;
        }
    }

    // ✅ Llamada segura al backend
    async generateContent(prompt, schema = null) {
        console.log('🤖 Generando contenido con backend seguro...');
        
        if (!this.configured) {
            console.log('📱 Modo offline activo, usando contenido local');
            return this.getFallbackContent();
        }

        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, schema })
            });

            if (!response.ok) {
                throw new Error(`Backend Error: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Error en backend');
            }

            return data.content;

        } catch (error) {
            console.error('❌ Error en backend IA:', error);
            return this.getFallbackContent();
        }
    }

    // ✅ Generación segura de ejercicios
    async generateAdditions(level, quantity = 50) {
        if (!this.configured) {
            return this.getFallbackAdditions(level, quantity);
        }

        const prompt = `Genera exactamente ${quantity} sumas de 2 dígitos nivel ${level}...`;
        const schema = {
            type: "object",
            properties: {
                exercises: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            num1: { type: "number" },
                            num2: { type: "number" },
                            operation: { type: "string" }
                        }
                    }
                }
            }
        };

        try {
            const result = await this.generateContent(prompt, schema);
            return result.exercises || this.getFallbackAdditions(level, quantity);
        } catch (error) {
            return this.getFallbackAdditions(level, quantity);
        }
    }

    // Generación directa con esquemas JSON - Restas
    async generateSubtractions(level, quantity = 50) {
        console.log(`🤖 Generando EXACTAMENTE ${quantity} restas con Supabase Edge Functions - Nivel: ${level}`);
        
        if (!this.configured) {
            console.log('⚠️ Supabase no configurado, usando fallback');
            return this.getFallbackSubtractions(level, quantity);
        }

        try {
            const levelInstructions = this.getLevelInstructions(level, 'subtraction');
            
            const prompt = `Genera exactamente ${quantity} problemas de resta de dos dígitos para un niño de 7-8 años.
            
            REGLAS ESPECÍFICAS:
            ${levelInstructions}
            
            IMPORTANTE: En las restas, el primer número SIEMPRE debe ser mayor que el segundo para evitar resultados negativos.
            
            Devuelve SOLO un objeto JSON con el formato exacto:
            {
                "exercises": [
                    {"num1": 54, "num2": 27, "operation": "subtraction"},
                    {"num1": 43, "num2": 18, "operation": "subtraction"}
                ]
            }
            
            IMPORTANTE: Debe haber EXACTAMENTE ${quantity} ejercicios, ni más ni menos.`;

            const schema = {
                type: "OBJECT",
                properties: {
                    exercises: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                num1: { type: "INTEGER" },
                                num2: { type: "INTEGER" },
                                operation: { type: "STRING" }
                            },
                            required: ["num1", "num2", "operation"]
                        }
                    }
                },
                required: ["exercises"]
            };

            console.log(`🔄 Llamando a Supabase Edge Function para ${quantity} restas...`);
            const result = await this.callSupabaseFunction(prompt, schema);
            console.log('✅ Respuesta de Gemini recibida:', result);
            
            const exercises = result.exercises || [];
            
            // Validar restas (num1 > num2) y tomar cantidad exacta
            const validExercises = exercises
                .filter(ex => ex.num1 && ex.num2 && ex.num1 > ex.num2 && ex.num1 > 0)
                .map(ex => ({ ...ex, operation: 'subtraction' }))
                .slice(0, quantity);

            // Si no tenemos suficientes, completar con fallback
            if (validExercises.length < quantity) {
                console.log(`⚠️ Solo ${validExercises.length} ejercicios válidos, completando con fallback...`);
                const fallbackExercises = this.getFallbackSubtractions(level, quantity - validExercises.length);
                return [...validExercises, ...fallbackExercises];
            }

            return validExercises;

        } catch (error) {
            console.error('❌ Error generando restas con Supabase:', error);
            return this.getFallbackSubtractions(level, quantity);
        }
    }

    // 🚀 Llamada universal usando Supabase Edge Functions
    async callSupabaseFunction(prompt, schema = null) {
        // ✅ MEJORADO: Usar configuración dinámica
        const config = this.getSupabaseConfig();
        if (!config) {
            throw new Error('Configuración de Supabase no disponible');
        }

        const response = await fetch(`${config.url}/functions/v1/gemini-ai`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.anon_key}`,
                'X-Requested-With': 'XMLHttpRequest' // ✅ Header adicional para CORS
            },
            mode: 'cors', // ✅ Especificar modo CORS explícitamente
            credentials: 'omit', // ✅ No enviar cookies para evitar problemas CORS
            body: JSON.stringify({
                prompt: prompt,
                schema: schema
            })
        });

        if (!response.ok) {
            throw new Error(`Supabase Edge Function Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Error en Edge Function');
        }

        return data.content;
    }

    // 3 niveles bien definidos con lógica de reserva
    getLevelInstructions(level, operation) {
        const baseInstructions = operation === 'addition' ? 
            "Todos los números deben ser de dos dígitos (entre 10 y 99)." :
            "Todos los números deben ser de dos dígitos (entre 10 y 99). El primer número SIEMPRE debe ser mayor que el segundo.";

        switch (level) {
            case 1:
                return operation === 'addition' ?
                    `${baseInstructions} SIN RESERVA: La suma de las unidades debe ser menor a 10. Ejemplo: 23 + 34 = 57` :
                    `${baseInstructions} SIN PRÉSTAMO: Las unidades del primer número deben ser mayores o iguales que las del segundo. Ejemplo: 47 - 23 = 24`;
            
            case 2:
                return operation === 'addition' ?
                    `${baseInstructions} CON RESERVA: La suma de las unidades debe ser 10 o mayor. Ejemplo: 28 + 35 = 63` :
                    `${baseInstructions} CON PRÉSTAMO: Las unidades del primer número deben ser menores que las del segundo. Ejemplo: 52 - 28 = 24`;
            
            case 3:
                return `${baseInstructions} MIXTO: Mezcla ejercicios con y sin ${operation === 'addition' ? 'reserva' : 'préstamo'}.`;
            
            default:
                return baseInstructions;
        }
    }

    // ✅ Generar ayuda pedagógica con terminología unificada
    async generateHelpForExercise(num1, num2, operation) {
        console.log(`🤖 Generando ayuda pedagógica para ${num1} ${operation === 'addition' ? '+' : '-'} ${num2}`);
        
        if (!this.configured) {
            return this.getFallbackHelp(num1, num2, operation);
        }

        const studentName = this.getStudentName();
        const operationText = operation === 'addition' ? 'suma' : 'resta';
        const symbol = operation === 'addition' ? '+' : '-';

        const prompt = `Genera una explicación pedagógica paso a paso para resolver este ejercicio de ${operationText}: ${num1} ${symbol} ${num2}

        CONTEXTO:
        - Estudiante: ${studentName} (7-8 años, segundo básico)
        - Ejercicio: ${num1} ${symbol} ${num2}
        - Método: Algoritmo tradicional (vertical)

        INSTRUCCIONES:
        - Usa un lenguaje simple y amigable apropiado para la edad
        - Explica paso a paso el proceso ${operation === 'addition' ? 'de suma con o sin reserva' : 'de resta con o sin préstamo'}
        - Incluye consejos visuales ("imagina que tienes...")
        - Máximo 150 palabras
        - Usa emojis apropiados para matemáticas

        FORMATO:
        Responde SOLO con la explicación, sin metadatos adicionales.`;

        try {
            const result = await this.callSupabaseFunction(prompt);
            return result || this.getFallbackHelp(num1, num2, operation);
        } catch (error) {
            console.error('❌ Error generando ayuda:', error);
            return this.getFallbackHelp(num1, num2, operation);
        }
    }

    // Ejercicios de fallback offline
    getFallbackAdditions(level, quantity = 50) {
        console.log(`📚 Usando ${quantity} ejercicios de suma de respaldo - Nivel ${level}`);
        
        const exercises = [];

        for (let i = 0; i < quantity; i++) {
            let num1, num2;
            
            switch (level) {
                case 1: // Sin reserva
                    num1 = this.randomBetween(10, 40);
                    num2 = this.randomBetween(10, 59 - num1); // Asegurar que no hay reserva
                    break;
                    
                case 2: // Con reserva
                    num1 = this.randomBetween(15, 99);
                    num2 = this.randomBetween(15, 99);
                    // Forzar reserva: sumar algo a las unidades para que superen 10
                    if ((num1 % 10) + (num2 % 10) < 10) {
                        num2 = (Math.floor(num2 / 10) * 10) + (11 - (num1 % 10));
                    }
                    break;
                    
                case 3: // Mixto
                    if (i < Math.ceil(quantity / 2)) {
                        // Sin reserva
                        num1 = this.randomBetween(10, 40);
                        num2 = this.randomBetween(10, 59 - num1);
                    } else {
                        // Con reserva
                        num1 = this.randomBetween(15, 99);
                        num2 = this.randomBetween(15, 99);
                        if ((num1 % 10) + (num2 % 10) < 10) {
                            num2 = (Math.floor(num2 / 10) * 10) + (11 - (num1 % 10));
                        }
                    }
                    break;
                    
                default:
                    num1 = this.randomBetween(10, 50);
                    num2 = this.randomBetween(10, 50);
            }

            exercises.push({
                num1: Math.min(num1, 99),
                num2: Math.min(num2, 99),
                operation: 'addition'
            });
        }

        return this.shuffleArray(exercises);
    }

    getFallbackSubtractions(level, quantity = 50) {
        console.log(`📚 Usando ${quantity} ejercicios de resta de respaldo - Nivel ${level}`);
        
        const exercises = [];

        for (let i = 0; i < quantity; i++) {
            let num1, num2;
            
            switch (level) {
                case 1: // Sin reserva
                    num1 = this.randomBetween(20, 99);
                    num2 = this.randomBetween(10, Math.min(num1 % 10, num1 - 10)); // Sin prestamo
                    break;
                    
                case 2: // Con reserva
                    num1 = this.randomBetween(30, 99);
                    num2 = this.randomBetween(15, num1 - 5);
                    // Forzar reserva: unidades de num2 > unidades de num1
                    if ((num1 % 10) >= (num2 % 10)) {
                        num2 = (Math.floor(num2 / 10) * 10) + ((num1 % 10) + this.randomBetween(1, 5));
                        if (num2 >= num1) num2 = num1 - this.randomBetween(1, 5);
                    }
                    break;
                    
                case 3: // Mixto
                    if (i < Math.ceil(quantity / 2)) {
                        // Sin reserva
                        num1 = this.randomBetween(20, 99);
                        num2 = this.randomBetween(10, Math.min(num1 % 10, num1 - 10));
                    } else {
                        // Con reserva
                        num1 = this.randomBetween(30, 99);
                        num2 = this.randomBetween(15, num1 - 5);
                        if ((num1 % 10) >= (num2 % 10)) {
                            num2 = (Math.floor(num2 / 10) * 10) + ((num1 % 10) + this.randomBetween(1, 5));
                            if (num2 >= num1) num2 = num1 - this.randomBetween(1, 5);
                        }
                    }
                    break;
                    
                default:
                    num1 = this.randomBetween(20, 80);
                    num2 = this.randomBetween(10, num1 - 5);
            }

            exercises.push({
                num1: Math.max(num1, num2 + 1),
                num2: Math.min(num2, num1 - 1),
                operation: 'subtraction'
            });
        }

        return this.shuffleArray(exercises);
    }

    // ✅ FUNCIONES DE FALLBACK PARA AYUDA PEDAGÓGICA con terminología unificada
    getFallbackHelp(num1, num2, operation) {
        const isAddition = operation === 'addition';
        const studentName = this.getStudentName();
        
        // Detectar si necesita reserva/llevada para dar ayuda específica
        const needsCarry = isAddition ? 
            ((num1 % 10) + (num2 % 10)) >= 10 : 
            (num1 % 10) < (num2 % 10);
        
        const helps = isAddition ? [
            `🍎 Para sumar ${num1} + ${num2}, ${studentName}, puedes usar el método vertical. ${needsCarry ? 'Recuerda llevar a la siguiente columna cuando las unidades sumen más de 10!' : 'Como las unidades no pasan de 10, es más fácil!'} Empieza sumando las unidades: ${num1 % 10} + ${num2 % 10}.`,
            
            `🧸 Imagina que tienes ${num1} juguetes y tu amigo te regala ${num2} más. ${needsCarry ? 'Si las unidades dan más de 10, recuerda llevar 1 a las decenas!' : 'Suma primero las unidades, luego las decenas.'} ¡Cuenta paso a paso, ${studentName}!`,
            
            `🌟 Para resolver ${num1} + ${num2}, ${studentName}, descompón los números: ${Math.floor(num1/10)} decenas y ${num1%10} unidades + ${Math.floor(num2/10)} decenas y ${num2%10} unidades. ${needsCarry ? '¡Cuidado con llevar a la siguiente columna!' : '¡Súmalos por separado!'}`,
            
            `🎈 Piensa en ${num1} globos que se unen con ${num2} globos más. ${needsCarry ? 'Si al sumar las unidades obtienes más de 9, pon 1 globo en el grupo de las decenas.' : 'Suma las unidades primero, después las decenas.'} ¡Tú puedes, ${studentName}!`,
            
            `🚀 Para esta suma vertical, ${studentName}, alinea los números uno debajo del otro. ${needsCarry ? 'Cuando sumes ${num1 % 10} + ${num2 % 10} y te dé más de 10, anota la unidad y lleva la decena a la siguiente columna.' : 'Suma columna por columna: unidades con unidades, decenas con decenas.'}`
        ] : [
            `🍓 Para restar ${num1} - ${num2}, ${studentName}, usa el método vertical. ${needsCarry ? '¡Necesitas pedir prestado! Como ${num1 % 10} es menor que ${num2 % 10}, pide 10 prestado de las decenas.' : 'Como ${num1 % 10} es mayor que ${num2 % 10}, puedes restar directamente.'} Empieza con las unidades.`,
            
            `🦋 Imagina que tienes ${num1} mariposas y ${num2} se van volando. ${needsCarry ? 'Si no puedes quitar ${num2 % 10} de ${num1 % 10}, pide ayuda a las decenas: toma 10 prestado.' : 'Quita primero las unidades, luego las decenas.'} ¡Paso a paso, ${studentName}!`,
            
            `🏰 Para resolver ${num1} - ${num2}, ${studentName}, coloca los números en vertical. ${needsCarry ? 'Como ${num1 % 10} < ${num2 % 10}, convierte 1 decena en 10 unidades. Ahora tendrás ${num1 % 10 + 10} - ${num2 % 10}.' : 'Resta columna por columna: unidades menos unidades, decenas menos decenas.'}`,
            
            `🌺 Piensa en ${num1} flores de las cuales regalas ${num2}. ${needsCarry ? 'Si no tienes suficientes unidades para regalar, pide prestadas 10 unidades de las decenas.' : 'Resta primero las unidades, después las decenas.'} ¡Confío en ti, ${studentName}!`,
            
            `🎪 Para esta resta vertical, ${studentName}, alinea bien los números. ${needsCarry ? 'Recuerda: si la unidad de arriba es menor, pide 10 prestado de la decena de arriba.' : 'Resta de derecha a izquierda: primero unidades, luego decenas.'}`
        ];

        return helps[Math.floor(Math.random() * helps.length)];
    }

    // ✅ FUNCIÓN FALLBACK PARA AYUDA PERSONALIZADA MEJORADA con terminología clara
    getFallbackCustomHelp() {
        const studentName = this.getStudentName();
        const fallbackHelps = [
            `🌈 ¡Hola ${studentName}! Para ser un maestro de las matemáticas, recuerda estas técnicas mágicas: 🔢 Siempre alinea los números en columnas (unidades con unidades, decenas con decenas). ✨ Cuando sumes y las unidades pasen de 10, lleva 1 a las decenas. 🎯 En las restas, si necesitas más unidades, pide prestado 10 de las decenas. ¡Practica y serás genial!`,
            
            `🧩 ¡Eres increíble, ${studentName}! Los números son como piezas de LEGO: 🏗️ Construye las operaciones paso a paso. 📐 Usa el método vertical para mantener todo ordenado. 🔄 Si te equivocas, no pasa nada: revisa y vuelve a intentar. 💪 Cada error te hace más fuerte en matemáticas. ¡Sigue construyendo tu conocimiento!`,
            
            `🎈 ¡${studentName}, eres un detective de números! 🔍 Para resolver cualquier operación: Primero observa bien los números, después decide si necesitas llevar números o pedir prestado. 🎯 Suma o resta las unidades primero, luego las decenas. 🌟 Siempre verifica tu respuesta preguntándote si tiene sentido. ¡Tu cerebro es súper poderoso!`,
            
            `🚀 ¡Aventurero ${studentName}! En el espacio de las matemáticas: 🌌 Cada número tiene su lugar especial (unidades, decenas). 🛸 Cuando viajas sumando, a veces necesitas combustible extra (llevar números a la siguiente columna). 🪐 Cuando viajas restando, a veces necesitas pedir ayuda a otros planetas (préstamo de las decenas). ¡Explora y diviértete calculando!`,
            
            `🎨 ¡Artista matemático ${studentName}! Crear operaciones es como pintar: 🖌️ Usa trazos ordenados (escribe bien alineado). 🎭 Cada número tiene su papel en la obra. 🌈 Los colores se mezclan como los números se combinan usando técnicas de reserva. 🖼️ Al final, tu resultado es una obra de arte matemática. ¡Sigue creando belleza con números!`
        ];

        return fallbackHelps[Math.floor(Math.random() * fallbackHelps.length)];
    }

    // Feedback de fallback
    getFallbackFeedback(isCorrect, correctAnswer) {
        const studentName = this.getStudentName();
        
        if (isCorrect) {
            const positiveMessages = [
                `🎉 ¡Excelente trabajo, ${studentName}! ¡Respuesta perfecta!`,
                `⭐ ¡Súper bien, ${studentName}! ¡Eres un genio de las matemáticas!`,
                `🏆 ¡Fantástico, ${studentName}! ¡Lo resolviste perfectamente!`,
                `✨ ¡Bravo, ${studentName}! ¡Qué inteligente eres!`,
                `🎯 ¡Correcto, ${studentName}! ¡Sigue así, lo estás haciendo genial!`
            ];
            return positiveMessages[Math.floor(Math.random() * positiveMessages.length)];
        } else {
            const encouragingMessages = [
                `💪 ¡Casi lo tienes, ${studentName}! Revisa los números y vuelve a intentar.`,
                `🌟 ¡Buen intento, ${studentName}! Verifica tu cálculo paso a paso.`,
                `🎯 ¡Estás cerca, ${studentName}! Cuenta de nuevo con cuidado.`,
                `💡 ¡Sigue intentando, ${studentName}! Puedes hacerlo, confío en ti.`,
                `🚀 ¡No te rindas, ${studentName}! Revisa la operación y inténtalo otra vez.`
            ];
            return encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
        }
    }

    // Utilidades
    getStudentName() {
        // Intentar obtener el nombre del usuario actual
        if (window.authManager?.currentUser?.user_metadata?.full_name) {
            return window.authManager.currentUser.user_metadata.full_name.split(' ')[0];
        }
        return 'campeón';
    }

    randomBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

// Inicializar servicio de IA
window.geminiAI = new GeminiAIService();