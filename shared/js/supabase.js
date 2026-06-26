// Conexión a Supabase (preparado para migración)
import { PLATFORM_CONFIG } from './config.js';

// Por ahora usa datos locales, después migrará a Supabase
export const db = {
    // Simula la API de Supabase
    async getProducts(businessId) {
        // Cuando migres a Supabase, reemplaza esto con:
        // const { data } = await supabase
        //   .from('products')
        //   .select('*, product_images(url), categories(name)')
        //   .eq('business_id', businessId)
        //   .eq('status', 'published');
        // return data;
        
        return []; // Vacío por ahora, usa datos locales
    },
    
    async getCategories(businessId) {
        return [];
    },
    
    async getProduct(id) {
        return null;
    }
};