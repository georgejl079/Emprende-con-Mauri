// Configuración general de la plataforma
export const PLATFORM_CONFIG = {
    // Supabase (completar cuando crees el proyecto)
    supabaseUrl: '', // Ejemplo: 'https://xyz.supabase.co'
    supabaseAnonKey: '', // Tu anon key
    
    // WhatsApp principal
    mainWhatsapp: '59175179990',
    
    // CDN para imágenes
    cdnBase: 'https://images.unsplash.com',
    
    // URLs de redes sociales
    social: {
        facebook: '#',
        instagram: '#',
        whatsapp: 'https://wa.me/59175179990'
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