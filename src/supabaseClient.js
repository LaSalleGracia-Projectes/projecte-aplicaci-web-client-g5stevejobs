import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las variables de entorno de Supabase. Por favor, verifica tu archivo .env.local');
}

// Crear cliente de Supabase con configuración mejorada
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'supabase.auth.token',
    flowType: 'implicit'
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js'
    }
  },
  // Configura los reintentos y timeouts para mejor manejo de errores
  realtime: {
    timeout: 10000, // 10 segundos de timeout
    retryNetworkErrors: true,
    retryMaxCount: 3, 
    retryInterval: 1000 // 1 segundo entre reintentos
  }
});

// Función para verificar la conexión a Supabase
export const checkSupabaseConnection = async () => {
  try {
    // Intenta hacer una consulta simple para verificar la conexión
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout verificando conexión con Supabase')), 5000)
    );
    
    const healthCheck = supabase.from('_health_check').select('*').limit(1);
    
    await Promise.race([healthCheck, timeout]);
    
    console.log('Conexión con Supabase establecida correctamente');
    return true;
  } catch (error) {
    console.error('Error de conexión con Supabase:', error);
    return false;
  }
};

// Si estamos en el cliente, verificar la conexión
if (typeof window !== 'undefined') {
  checkSupabaseConnection().then(isConnected => {
    if (!isConnected) {
      console.error('No se pudo establecer conexión con Supabase. Algunas funcionalidades pueden no estar disponibles.');
    }
  });
}