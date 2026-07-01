// Configuración general de la plataforma
export const PLATFORM_CONFIG = {
    // Supabase - formato unificado
    supabase: {
                url: import.meta.env.VITE_SUPABASE_URL || 'https://pcqydmnaaihfgiuwrysv.supabase.co',
        anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjcXlkbW5hYWloZmdpdXdyeXN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4MzczODYsImV4cCI6MjA5ODQxMzM4Nn0.Mt3aEAme0wZDTEPTFIKyf6Y524V8TElsU06ZjIWdMZM'
    },
    
    // Mantener compatibilidad con formato antiguo (por si otro archivo lo usa)
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://pcqydmnaaihfgiuwrysv.supabase.co',
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjcXlkbW5hYWloZmdpdXdyeXN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4MzczODYsImV4cCI6MjA5ODQxMzM4Nn0.Mt3aEAme0wZDTEPTFIKyf6Y524V8TElsU06ZjIWdMZM',

    // WhatsApp principal
    mainWhatsapp: '59175167835835',

    // CDN para im
    // ágenes
    cdnBase: 'https://images.unsplash.com',

    // Cloudflare R2 (Storage de imágenes)
    r2: {
        accountId: import.meta.env.VITE_R2_ACCOUNT_ID || '',
        accessKeyId: import.meta.env.VITE_R2_ACCESS_KEY_ID || '',
        secretAccessKey: import.meta.env.VITE_R2_SECRET_ACCESS_KEY || '',
        bucket: 'mochilas-images',
        cdnDomain: 'https://pub-f817993412754044ab36875e113cc3ae.r2.dev'
    },

    // URLs de redes sociales
    social: {
        facebook: '#',
        instagram: '#',
        whatsapp: 'https://wa.me/59175167835835'
    }
};

// Función para optimizar imágenes
export function optimizeImage(url, width = 600) {
    if (url.includes('unsplash.com')) {
        return url.replace(/w=\d+/, `w=${width}`);
    }
    if (url.includes('res.cloudinary.com')) {
        return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
    }
    return url;
}