// shared/js/supabase.js
import { createClient } from '@supabase/supabase-js'
import { PLATFORM_CONFIG } from './config.js'

let supabaseClient = null

// ===== INICIALIZACIÓN =====

/**
 * Inicializa el cliente de Supabase
 * Se llama UNA SOLA VEZ al inicio de la aplicación
 */
export function initSupabase() {
    // Buscar credenciales en ambos formatos (para compatibilidad)
    const config = PLATFORM_CONFIG.supabase || PLATFORM_CONFIG;
    
    const url = config.url || PLATFORM_CONFIG.supabaseUrl;
    const anonKey = config.anonKey || PLATFORM_CONFIG.supabaseAnonKey;
    
    // Verificar que las credenciales estén configuradas
    if (!url || !anonKey) {
        console.warn('⚠️ Supabase no configurado - usando modo local (localStorage)')
        return null
    }
    
    // Crear el cliente de Supabase
    supabaseClient = createClient(url, anonKey)
    console.log('✅ Supabase conectado correctamente')
    console.log('📍 URL:', url)
    
    return supabaseClient
}

/**
 * Obtiene el cliente de Supabase
 * @returns {Object|null} Cliente de Supabase o null si no está inicializado
 */
export function getSupabase() {
    return supabaseClient
}

// ===== FUNCIONES CRUD PARA PRODUCTOS =====

/**
 * Obtiene todos los productos de un negocio
 * @param {number} businessId - ID del negocio
 * @returns {Promise<Array>} Lista de productos
 */
export async function fetchProducts(businessId) {
    const supabase = getSupabase()
    if (!supabase) return null
    
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('business_id', businessId)
            .order('id', { ascending: false })
        
        if (error) {
            console.error('Error al obtener productos:', error)
            throw error
        }
        
        return data
    } catch (error) {
        console.error('Error en fetchProducts:', error)
        return null
    }
}

/**
 * Guarda un producto (crear nuevo o actualizar existente)
 * @param {Object} product - Datos del producto
 * @returns {Promise<Object>} Producto guardado
 */
export async function saveProductToDB(product) {
    const supabase = getSupabase()
    if (!supabase) return null
    
    try {
        if (product.id) {
            // ACTUALIZAR producto existente
            const { data, error } = await supabase
                .from('products')
                .update({
                    name: product.name,
                    sku: product.sku,
                    category: product.category,
                    price: product.price,
                    discount: product.discount,
                    status: product.status,
                    scheduled_date: product.scheduled_date,
                    description: product.description,
                    details: product.details,
                    shipping: product.shipping,
                    images: product.images,
                    updated_at: new Date().toISOString()
                })
                .eq('id', product.id)
                .select()
            
            if (error) throw error
            return data[0]
        } else {
            // CREAR nuevo producto
            const { data, error } = await supabase
                .from('products')
                .insert({
                    business_id: product.business_id,
                    name: product.name,
                    sku: product.sku,
                    category: product.category,
                    price: product.price,
                    discount: product.discount,
                    status: product.status,
                    scheduled_date: product.scheduled_date,
                    description: product.description,
                    details: product.details,
                    shipping: product.shipping,
                    images: product.images
                })
                .select()
            
            if (error) throw error
            return data[0]
        }
    } catch (error) {
        console.error('Error en saveProductToDB:', error)
        return null
    }
}

/**
 * Elimina un producto
 * @param {number} id - ID del producto a eliminar
 * @returns {Promise<boolean>} true si se eliminó correctamente
 */
export async function deleteProductFromDB(id) {
    const supabase = getSupabase()
    if (!supabase) return null
    
    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id)
        
        if (error) throw error
        return true
    } catch (error) {
        console.error('Error en deleteProductFromDB:', error)
        return false
    }
}

// ===== FUNCIONES CRUD PARA CATEGORÍAS =====

export async function fetchCategories(businessId) {
    const supabase = getSupabase()
    if (!supabase) return null
    
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('business_id', businessId)
            .order('id')
        
        if (error) throw error
        return data
    } catch (error) {
        console.error('Error en fetchCategories:', error)
        return null
    }
}

export async function saveCategoryToDB(category) {
    const supabase = getSupabase()
    if (!supabase) return null
    
    try {
        const { data, error } = await supabase
            .from('categories')
            .insert({
                business_id: category.business_id,
                name: category.name
            })
            .select()
        
        if (error) throw error
        return data[0]
    } catch (error) {
        console.error('Error en saveCategoryToDB:', error)
        return null
    }
}

export async function deleteCategoryFromDB(id) {
    const supabase = getSupabase()
    if (!supabase) return null
    
    try {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id)
        
        if (error) throw error
        return true
    } catch (error) {
        console.error('Error en deleteCategoryFromDB:', error)
        return false
    }
}

// ===== FUNCIONES CRUD PARA TIENDAS =====

export async function fetchStores(businessId) {
    const supabase = getSupabase()
    if (!supabase) return null
    
    try {
        const { data, error } = await supabase
            .from('stores')
            .select('*')
            .eq('business_id', businessId)
            .order('id')
        
        if (error) throw error
        return data
    } catch (error) {
        console.error('Error en fetchStores:', error)
        return null
    }
}

export async function saveStoreToDB(store) {
    const supabase = getSupabase()
    if (!supabase) return null
    
    try {
        if (store.id) {
            // Actualizar
            const { data, error } = await supabase
                .from('stores')
                .update(store)
                .eq('id', store.id)
                .select()
            
            if (error) throw error
            return data[0]
        } else {
            // Crear
            const { data, error } = await supabase
                .from('stores')
                .insert(store)
                .select()
            
            if (error) throw error
            return data[0]
        }
    } catch (error) {
        console.error('Error en saveStoreToDB:', error)
        return null
    }
}

export async function deleteStoreFromDB(id) {
    const supabase = getSupabase()
    if (!supabase) return null
    
    try {
        const { error } = await supabase
            .from('stores')
            .delete()
            .eq('id', id)
        
        if (error) throw error
        return true
    } catch (error) {
        console.error('Error en deleteStoreFromDB:', error)
        return false
    }
}

// ===== FUNCIÓN PARA GUARDAR "ABOUT" =====

export async function saveAboutToDB(businessId, about) {
    const supabase = getSupabase()
    if (!supabase) return null
    
    try {
        const { data, error } = await supabase
            .from('businesses')
            .update({
                about_history: about.about_history,
                about_mission: about.about_mission,
                about_vision: about.about_vision
            })
            .eq('id', businessId)
            .select()
        
        if (error) throw error
        return data[0]
    } catch (error) {
        console.error('Error en saveAboutToDB:', error)
        return null
    }
}

// ===== FUNCIÓN DE LOGIN =====

export async function loginBusiness(email, password) {
    const supabase = getSupabase()
    if (!supabase) return null
    
    try {
        const { data, error } = await supabase
            .from('businesses')
            .select('*')
            .eq('owner_email', email)
            .eq('owner_password', password)
            .single()
        
        if (error || !data) {
            return null
        }
        
        return data
    } catch (error) {
        console.error('Error en loginBusiness:', error)
        return null
    }
}