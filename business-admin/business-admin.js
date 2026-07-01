// Business Admin - Versión HÍBRIDA (Supabase + localStorage)
import { PLATFORM_CONFIG } from '../shared/js/config.js'
import { initR2Client, uploadMultipleOptimizedImages } from '../shared/js/utils.js'

// ===== NUEVO: IMPORTAR FUNCIONES DE SUPABASE =====
import { 
    initSupabase, 
    fetchProducts, 
    saveProductToDB, 
    deleteProductFromDB, 
    fetchCategories, 
    saveCategoryToDB, 
    deleteCategoryFromDB, 
    fetchStores, 
    saveStoreToDB, 
    deleteStoreFromDB, 
    saveAboutToDB, 
    loginBusiness 
} from '../shared/js/supabase.js'

let currentBusiness = null
let currentProduct = null
let uploadedImages = []

// ===== FUNCIONES DE PERSISTENCIA =====
function loadData(key, defaultData) {
    try {
        const stored = localStorage.getItem(key)
        if (stored) return JSON.parse(stored)
    } catch (e) { console.warn(`Error loading ${key}:`, e) }
    return defaultData
}

function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data))
    } catch (e) { console.warn(`Error saving ${key}:`, e) }
}

// ===== DATOS INICIALES =====
const DEFAULT_PRODUCTS = [
    {
        id: 1, business_id: 1, name: 'Mochila Escolar Urban Pro', sku: 'RUT-ESC-001', category: 'Escolar',
        price: 180, discount: null, status: 'published', scheduled_date: null,
        description: 'Mochila escolar de alta resistencia con tela Oxford 600D impermeabilizada. Diseño ergonómico con correas acolchadas ajustables y espalda ventilada. 3 compartimentos principales, bolsillo frontal con organizador, 2 bolsillos laterales para botella y porta laptop hasta 15.6".',
        details: 'Material: Oxford 600D impermeable\nCapacidad: 30 litros\nCompartimentos: 3 principales + 1 frontal\nLaptop: Hasta 15.6"\nPeso: 650 g\nOrigen: Importación directa',
        shipping: 'Envíos a todo Bolivia. Pedidos procesados en 24-48 h.\n\n• Gratis en compras desde 350 Bs.\n• Seguimiento por WhatsApp\n• Garantía de 30 días por defectos de fábrica',
        images: ['https://images.unsplash.com/photo-1580087256394-dc596e1c8f4f?w=600']
    },
    {
        id: 2, business_id: 1, name: 'Mochila Viaje Explorer 45L', sku: 'RUT-VIA-003', category: 'Viaje',
        price: 380, discount: 20, status: 'published', scheduled_date: null,
        description: 'Mochila de viaje de 45 litros con apertura tipo maleta. Perfecta para viajes de aventura. Tela ripstop resistente al desgarro con tratamiento impermeable. Incluye funda para lluvia.',
        details: 'Material: Ripstop nylon impermeable\nCapacidad: 45 litros\nApertura: Tipo maleta 180°\nExtras: Funda de lluvia incluida\nCinturón: Lumbar acolchado\nOrigen: Importación directa',
        shipping: 'Envíos a todo Bolivia. Pedidos procesados en 24-48 h.\n\n• Gratis en compras desde 350 Bs.\n• Seguimiento por WhatsApp\n• Garantía de 30 días',
        images: ['https://images.unsplash.com/photo-1622260614153-03223fb72052?w=600']
    }
]

const DEFAULT_CATEGORIES = [
    { id: 1, business_id: 1, name: 'Escolar' },
    { id: 2, business_id: 1, name: 'Viaje' },
    { id: 3, business_id: 1, name: 'Deportiva' },
    { id: 4, business_id: 1, name: 'Ejecutiva' }
]

const DEFAULT_STORES = [
    {
        id: 1, business_id: 1,
        name: 'Mochilería Central',
        city: 'Santa Cruz',
        address: 'Av. Monseñor Rivero #500, Centro',
        phone: '+591 3 1234567',
        whatsapp: '59170000001',
        instagram: 'https://instagram.com/mochileriacentral',
        facebook: 'https://facebook.com/mochileriacentral',
        tiktok: 'https://tiktok.com/@mochileriacentral',
        hours: 'Lun-Sáb: 9:00-20:00',
        logo: ''
    },
    {
        id: 2, business_id: 1,
        name: 'Deportes Plus',
        city: 'Cochabamba',
        address: 'Calle España #1200',
        phone: '+591 4 9876543',
        whatsapp: '59170000002',
        instagram: 'https://instagram.com/deportesplus',
        facebook: 'https://facebook.com/deportesplus',
        tiktok: '',
        hours: 'Lun-Vie: 9:00-19:00, Sáb: 9:00-14:00',
        logo: ''
    },
    {
        id: 3, business_id: 1,
        name: 'Outdoor La Paz',
        city: 'La Paz',
        address: 'Av. 16 de Julio #800, El Prado',
        phone: '+591 2 5555555',
        whatsapp: '59170000003',
        instagram: 'https://instagram.com/outdoorlapaz',
        facebook: 'https://facebook.com/outdoorlapaz',
        tiktok: 'https://tiktok.com/@outdoorlapaz',
        hours: 'Lun-Sáb: 9:30-20:00',
        logo: ''
    }
]

const businesses = [
    {
        id: 1,
        name: '¡Hola! Mauricio',
        owner_email: 'Villca16snma@gmail.com',
        owner_password: '123456',
        about_history: 'Somos una importadora directa de mochilas con base en Santa Cruz de la Sierra.',
        about_mission: 'Ser la importadora de mochilas líder en Bolivia.',
        about_vision: 'Para 2027, ser reconocidos como la tienda de referencia.'
    }
]

// Inicializar datos con persistencia - usar datos guardados o defaults
let products = []
let categories = []
let stores = []
let changeLog = JSON.parse(localStorage.getItem('business_change_log') || '[]')
let useSupabase = false

// Historial de navegación para el botón "atrás"
const navigationHistory = ['dashboard']
let currentSection = 'dashboard'

export const BusinessAdmin = {
    stores: stores,
    currentStore: null,
    storeLogo: '',

    init() {
        // Inicializar Supabase
        const supabaseClient = initSupabase()
        useSupabase = supabaseClient !== null

        this.checkAuth()
        this.setupNavigation()
        this.setupUpload()
        this.setupHistoryHandling()

        if (PLATFORM_CONFIG.r2 && PLATFORM_CONFIG.r2.accountId) {
            initR2Client(PLATFORM_CONFIG.r2)
            console.log('✅ Cliente R2 inicializado')
        } else {
            console.log('⚠️ R2 no configurado - usando modo local')
        }
    },

    // ===== MANEJO DEL HISTORIAL DEL NAVEGADOR =====
    setupHistoryHandling() {
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.section) {
                this.switchSection(e.state.section, false)
            } else {
                this.switchSection('dashboard', false)
            }
        })
    },

    pushHistory(section) {
        if (navigationHistory[navigationHistory.length - 1] !== section) {
            navigationHistory.push(section)
            history.pushState({ section }, '', `#${section}`)
        }
    },

    checkAuth() {
        const isLoggedIn = localStorage.getItem('business_logged') === 'true'
        if (isLoggedIn) {
            document.getElementById('loginScreen').style.display = 'none'
            document.getElementById('adminLayout').classList.add('active')
            
            const hashSection = window.location.hash.replace('#', '')
            const validSections = ['dashboard', 'products', 'categories', 'stores', 'about']
            
            if (hashSection && validSections.includes(hashSection)) {
                currentSection = hashSection
                navigationHistory.push(hashSection)
            }
            
            this.loadBusinessData()
            
            setTimeout(() => {
                this.switchSection(currentSection, false)
            }, 50)
        } else {
            document.getElementById('loginScreen').style.display = 'flex'
            document.getElementById('adminLayout').classList.remove('active')
        }

        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault()
            const email = document.getElementById('loginEmail').value
            const password = document.getElementById('loginPassword').value
            
            // ===== NUEVO: INTENTAR LOGIN CON SUPABASE =====
            let business = null
            try {
                business = await loginBusiness(email, password)
            } catch (error) {
                console.warn('⚠️ Supabase no disponible para login:', error)
            }
            
            // FALLBACK: Si Supabase falla, usar array local
            if (!business) {
                business = businesses.find(b => b.owner_email === email && b.owner_password === password)
            }
            
            if (business) {
                currentBusiness = business
                localStorage.setItem('business_logged', 'true')
                localStorage.setItem('current_business_id', business.id)
                document.getElementById('loginScreen').style.display = 'none'
                document.getElementById('adminLayout').classList.add('active')
                this.loadBusinessData()
                history.replaceState({ section: 'dashboard' }, '', '#dashboard')
            } else {
                alert('Credenciales incorrectas\n\nUsa:\nEmail: cliente@ruta.com\nPassword: 123456')
            }
        })
    },

        async loadBusinessData() {
        const businessId = parseInt(localStorage.getItem('current_business_id'))
        currentBusiness = businesses.find(b => b.id === businessId)
        
        console.log('📂 Datos actuales en localStorage:')
        console.log('   Productos:', products.length)
        console.log('   Categorías:', categories.length)
        console.log('   Tiendas:', stores.length)
        
        // ===== ESTRATEGIA: localStorage es PRIMARIO, Supabase es secundario =====
        try {
            console.log('🔄 Intentando cargar desde Supabase...')
            const [dbProducts, dbCategories, dbStores] = await Promise.all([
                fetchProducts(businessId),
                fetchCategories(businessId),
                fetchStores(businessId)
            ])
            
            console.log('📦 Datos de Supabase:')
            console.log('   Productos:', dbProducts?.length || 0, dbProducts ? '(array)' : '(null)')
            console.log('   Categorías:', dbCategories?.length || 0)
            console.log('   Tiendas:', dbStores?.length || 0)
            
            // SOLO reemplazar localStorage si Supabase tiene datos
            // y localStorage está vacío (primera carga)
            const localProducts = loadData('business_products', [])
            const localCategories = loadData('business_categories', [])
            const localStores = loadData('business_stores', [])
            
            // Si Supabase tiene datos y localStorage NO, cargar desde Supabase
            if (dbProducts && dbProducts.length > 0 && localProducts.length === 0) {
                products = dbProducts
                saveData('business_products', products)
                console.log('✅ Productos cargados desde Supabase (' + dbProducts.length + ')')
            } else if (dbProducts && dbProducts.length > 0 && localProducts.length > 0) {
                console.log('ℹ️ Ambos tienen datos. Usando localStorage (más reciente)')
            } else {
                console.log('ℹ️ Usando productos de localStorage')
            }
            
            if (dbCategories && dbCategories.length > 0 && localCategories.length === 0) {
                categories = dbCategories
                saveData('business_categories', categories)
                console.log('✅ Categorías cargadas desde Supabase (' + dbCategories.length + ')')
            }
            
            if (dbStores && dbStores.length > 0 && localStores.length === 0) {
                this.stores = dbStores
                stores = dbStores
                saveData('business_stores', this.stores)
                console.log('✅ Tiendas cargadas desde Supabase (' + dbStores.length + ')')
            }
        } catch (error) {
            console.warn('⚠️ Error cargando desde Supabase, usando localStorage:', error)
        }
        
        console.log('✅ Datos finales:')
        console.log('   Productos:', products.length)
        console.log('   Categorías:', categories.length)
        console.log('   Tiendas:', stores.length)
        
        if (currentBusiness) {
            const savedAbout = loadData('business_about', null)
            if (savedAbout) {
                currentBusiness.about_history = savedAbout.about_history || currentBusiness.about_history
                currentBusiness.about_mission = savedAbout.about_mission || currentBusiness.about_mission
                currentBusiness.about_vision = savedAbout.about_vision || currentBusiness.about_vision
            }
            
            document.getElementById('businessNameDisplay').textContent = currentBusiness.name
            document.getElementById('aboutHistory').value = currentBusiness.about_history || ''
            document.getElementById('aboutMission').value = currentBusiness.about_mission || ''
            document.getElementById('aboutVision').value = currentBusiness.about_vision || ''
            this.renderDashboard()
        }
    },

    logout() {
        localStorage.removeItem('business_logged')
        localStorage.removeItem('current_business_id')
        history.replaceState(null, '', window.location.pathname)
        navigationHistory.length = 0
        navigationHistory.push('dashboard')
        location.reload()
    },

    setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.section
                this.switchSection(section, true)
                if (window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('open')
            })
        })
    },

    switchSection(section, pushHistory = true) {
        currentSection = section
        
        document.querySelectorAll('.nav-item').forEach(item => 
            item.classList.toggle('active', item.dataset.section === section))
        document.querySelectorAll('.section').forEach(sec => 
            sec.classList.remove('active'))
        
        const targetSection = document.getElementById(section + 'Section')
        if (targetSection) {
            targetSection.classList.add('active')
        }
        
        if (pushHistory) {
            this.pushHistory(section)
        }
        
        if (section === 'products') this.renderProducts()
        else if (section === 'categories') this.renderCategories()
        else if (section === 'dashboard') this.renderDashboard()
        else if (section === 'stores') this.renderStores()
    },

    renderDashboard() {
        const businessProducts = products.filter(p => p.business_id === currentBusiness.id)
        const businessCategories = categories.filter(c => c.business_id === currentBusiness.id)
        const businessStores = this.stores.filter(s => s.business_id === currentBusiness.id)
        document.getElementById('statProducts').textContent = businessProducts.length
        document.getElementById('statCategories').textContent = businessCategories.length
        document.getElementById('statStores').textContent = businessStores.length
    },

    renderProducts() {
        const businessProducts = products.filter(p => p.business_id === currentBusiness.id)
        this.loadFilterCategories()
        this.filterProducts()
    },

    loadFilterCategories() {
        const businessCategories = categories.filter(c => c.business_id === currentBusiness.id)
        const select = document.getElementById('filterCategory')
        const currentValue = select.value
        select.innerHTML = '<option value="">Todas las categorías</option>' +
            businessCategories.map(c => `<option value="${c.name}">${c.name}</option>`).join('')
        select.value = currentValue
    },

    filterProducts() {
        const searchTerm = document.getElementById('productSearch').value.toLowerCase()
        const categoryFilter = document.getElementById('filterCategory').value
        const statusFilter = document.getElementById('filterStatus').value

        let filtered = products.filter(p => p.business_id === currentBusiness.id)

        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchTerm) ||
                p.sku.toLowerCase().includes(searchTerm)
            )
        }

        if (categoryFilter) {
            filtered = filtered.filter(p => p.category === categoryFilter)
        }

        if (statusFilter) {
            filtered = filtered.filter(p => {
                const status = this.getProductStatus(p)
                return status === statusFilter
            })
        }

        document.getElementById('productsTable').innerHTML = filtered.map(p => {
            const status = this.getProductStatus(p)
            const statusBadge = this.getStatusBadge(status)
            const scheduledDate = p.scheduled_date ? new Date(p.scheduled_date).toLocaleString('es-ES') : '-'

            return `
            <tr>
                <td><img src="${p.images[0]}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;"></td>
                <td><strong>${p.name}</strong></td>
                <td>${p.sku}</td>
                <td>Bs. ${p.price}${p.discount ? ` <span class="badge badge-warning">-${p.discount}%</span>` : ''}</td>
                <td>${p.category}</td>
                <td>${statusBadge}</td>
                <td style="font-size:0.85rem;color:#6b6b6b;">${scheduledDate}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="BusinessAdmin.editProduct(${p.id})"><i class="fas fa-edit"></i> Editar</button>
                    <button class="btn btn-secondary btn-sm" onclick="BusinessAdmin.viewChangeLog(${p.id})" title="Historial"><i class="fas fa-history"></i></button>
                    <button class="btn btn-danger btn-sm" onclick="BusinessAdmin.deleteProduct(${p.id})"><i class="fas fa-trash"></i> Eliminar</button>
                </td>
            </tr>
        `}).join('')

        if (filtered.length === 0) {
            document.getElementById('productsTable').innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center;padding:40px;color:#9a9a9a;">
                        <i class="fas fa-search" style="font-size:2rem;margin-bottom:12px;opacity:0.3;"></i>
                        <p>No se encontraron productos</p>
                    </td>
                </tr>
            `
        }
    },

    getProductStatus(product) {
        if (product.status === 'scheduled' && product.scheduled_date) {
            const scheduledDate = new Date(product.scheduled_date)
            if (scheduledDate <= new Date()) {
                return 'published'
            }
            return 'scheduled'
        }
        return product.status || 'published'
    },

    getStatusBadge(status) {
        const badges = {
            published: '<span class="badge badge-success">Publicado</span>',
            draft: '<span class="badge badge-warning">Borrador</span>',
            scheduled: '<span class="badge badge-warning">Programado</span>'
        }
        return badges[status] || badges.published
    },

    openProductModal(product = null) {
        currentProduct = product
        uploadedImages = product?.images || []
        document.getElementById('productModalTitle').textContent = product ? 'Editar Producto' : 'Nuevo Producto'
        document.getElementById('productForm').reset()
        this.loadCategoriesSelect()

        if (product) {
            document.getElementById('productName').value = product.name
            document.getElementById('productSku').value = product.sku
            document.getElementById('productCategory').value = product.category
            document.getElementById('productPrice').value = product.price
            document.getElementById('productDiscount').value = product.discount || 0
            document.getElementById('productStatus').value = product.status || 'published'
            document.getElementById('productScheduledDate').value = product.scheduled_date || ''
            document.getElementById('scheduledDateGroup').style.display = product.status === 'scheduled' ? 'block' : 'none'
            document.getElementById('productDescription').value = product.description || ''
            document.getElementById('productDetails').value = product.details || ''
            document.getElementById('productShipping').value = product.shipping || ''
            this.renderImagePreview()
        } else {
            document.getElementById('imagePreview').innerHTML = ''
            document.getElementById('productStatus').value = 'published'
            document.getElementById('scheduledDateGroup').style.display = 'none'
        }
        document.getElementById('productModal').classList.add('active')
    },

    closeProductModal() {
        document.getElementById('productModal').classList.remove('active')
        currentProduct = null
        uploadedImages = []
    },

    loadCategoriesSelect() {
        const businessCategories = categories.filter(c => c.business_id === currentBusiness.id)
        document.getElementById('productCategory').innerHTML = '<option value="">Seleccionar...</option>' +
            businessCategories.map(c => `<option value="${c.name}">${c.name}</option>`).join('')
    },

                // ===== saveProduct PROFESIONAL: Supabase + localStorage con validación =====
    async saveProduct() {
        const status = document.getElementById('productStatus').value
        const scheduledDate = document.getElementById('productScheduledDate').value

        // Validar campos obligatorios
        const name = document.getElementById('productName').value.trim()
        const sku = document.getElementById('productSku').value.trim()
        const category = document.getElementById('productCategory').value
        const price = parseFloat(document.getElementById('productPrice').value)

        if (!name || !sku || !category || !price) {
            alert('❌ Completa todos los campos obligatorios: Nombre, SKU, Categoría y Precio')
            return
        }

        const productData = {
            business_id: currentBusiness.id,
            name: name,
            sku: sku,
            category: category,
            price: price,
            discount: parseInt(document.getElementById('productDiscount').value) || null,
            status: status,
            scheduled_date: status === 'scheduled' ? scheduledDate : null,
            description: document.getElementById('productDescription').value,
            details: document.getElementById('productDetails').value,
            shipping: document.getElementById('productShipping').value,
            images: uploadedImages.length > 0 ? uploadedImages : ['https://via.placeholder.com/600']
        }

        // ===== ESTRATEGIA HÍBRIDA: Supabase + localStorage =====
        let supabaseId = null
        let supabaseSuccess = false

        try {
            const result = await saveProductToDB(productData)
            if (result && result.id) {
                supabaseId = result.id
                supabaseSuccess = true
                console.log('✅ Producto guardado en Supabase (ID:', supabaseId, ')')
            }
        } catch (error) {
            console.warn('⚠️ Supabase no disponible para guardar:', error.message)
        }

        // ===== ACTUALIZAR ARRAY LOCAL (SIEMPRE) =====
        if (currentProduct) {
            // EDITAR producto existente
            const index = products.findIndex(p => p.id === currentProduct.id)
            if (index === -1) {
                alert('❌ Error: Producto no encontrado en la lista local')
                return
            }
            const oldProduct = { ...products[index] }
            const finalProduct = { ...currentProduct, ...productData }
            if (supabaseId) finalProduct.id = supabaseId
            
            products[index] = finalProduct
            this.logChange(currentProduct.id, 'update', oldProduct, finalProduct)
        } else {
            // CREAR nuevo producto
            let newId = supabaseId || (Math.max(...products.map(p => p.id), 0) + 1)
            
            // Evitar IDs duplicados
            while (products.some(p => p.id === newId)) {
                newId++
            }
            
            products.push({ id: newId, ...productData })
            this.logChange(newId, 'create', null, products[products.length - 1])
        }

        // Persistir en localStorage
        saveData('business_products', products)

        // Mensaje de éxito informativo
        if (supabaseSuccess) {
            alert('✅ Producto guardado en la nube (Supabase) con respaldo local')
        } else {
            alert('✅ Producto guardado en localStorage (Supabase no disponible)')
        }

        this.closeProductModal()
        this.renderProducts()
        this.renderDashboard()
    },

    editProduct(id) {
        const product = products.find(p => p.id === id)
        if (product) this.openProductModal(product)
    },

    // ===== MODIFICADO: deleteProduct AHORA USA SUPABASE =====
    async deleteProduct(id) {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return
        const product = products.find(p => p.id === id)
        this.logChange(id, 'delete', product, null)
        
        // ===== NUEVO: ELIMINAR EN SUPABASE =====
        try {
            await deleteProductFromDB(id)
            console.log('✅ Producto eliminado de Supabase')
        } catch (error) {
            console.warn('⚠️ Error eliminando en Supabase:', error)
        }
        
        products = products.filter(p => p.id !== id)
        saveData('business_products', products)
        
        alert('Producto eliminado')
        this.renderProducts()
        this.renderDashboard()
    },

    renderCategories() {
        const businessCategories = categories.filter(c => c.business_id === currentBusiness.id)
        const productCountByCategory = {}
        products.filter(p => p.business_id === currentBusiness.id).forEach(p => {
            productCountByCategory[p.category] = (productCountByCategory[p.category] || 0) + 1
        })
        document.getElementById('categoriesTable').innerHTML = businessCategories.map(c => `
            <tr>
                <td><strong>${c.name}</strong></td>
                <td>${productCountByCategory[c.name] || 0} productos</td>
                <td><button class="btn btn-danger btn-sm" onclick="BusinessAdmin.deleteCategory(${c.id})"><i class="fas fa-trash"></i> Eliminar</button></td>
            </tr>
        `).join('')
    },

    openCategoryModal() {
        document.getElementById('categoryModalTitle').textContent = 'Nueva Categoría'
        document.getElementById('categoryName').value = ''
        document.getElementById('categoryModal').classList.add('active')
    },

    closeCategoryModal() {
        document.getElementById('categoryModal').classList.remove('active')
    },

    // ===== MODIFICADO: saveCategory AHORA USA SUPABASE =====
    async saveCategory() {
        const name = document.getElementById('categoryName').value.trim()
        if (!name) { alert('Ingresa un nombre para la categoría'); return }
        
        const categoryData = { id: null, business_id: currentBusiness.id, name: name }
        
        // ===== NUEVO: GUARDAR EN SUPABASE =====
        try {
            const result = await saveCategoryToDB(categoryData)
            if (result) {
                categoryData.id = result.id
                console.log('✅ Categoría guardada en Supabase')
            }
        } catch (error) {
            console.warn('⚠️ Error guardando categoría en Supabase:', error)
        }
        
        const newId = Math.max(...categories.map(c => c.id), 0) + 1
        categories.push({ id: newId, ...categoryData })
        saveData('business_categories', categories)
        
        alert('Categoría creada exitosamente')
        this.closeCategoryModal()
        this.renderCategories()
        this.renderDashboard()
    },

    // ===== MODIFICADO: deleteCategory AHORA USA SUPABASE =====
    async deleteCategory(id) {
        if (!confirm('¿Estás seguro de eliminar esta categoría?')) return
        
        // ===== NUEVO: ELIMINAR EN SUPABASE =====
        try {
            await deleteCategoryFromDB(id)
            console.log('✅ Categoría eliminada de Supabase')
        } catch (error) {
            console.warn('⚠️ Error eliminando categoría en Supabase:', error)
        }
        
        categories = categories.filter(c => c.id !== id)
        saveData('business_categories', categories)
        alert('Categoría eliminada')
        this.renderCategories()
    },

    // ===== RESTO DEL CÓDIGO SIN CAMBIOS =====
    renderStores() {
        const businessStores = this.stores.filter(s => s.business_id === currentBusiness.id)
        const container = document.getElementById('storesList')
        
        if (businessStores.length === 0) {
            container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted);background:#fff;border-radius:10px;"><i class="fas fa-store" style="font-size:2rem;margin-bottom:12px;opacity:0.3;"></i><p>Aún no has agregado tiendas autorizadas</p></div>`
            return
        }
        
        container.innerHTML = businessStores.map(store => `
            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:20px;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
                    <div>
                        <h4 style="font-size:1rem;margin:0 0 4px 0;">${store.name}</h4>
                        <p style="font-size:0.8rem;color:#6b6b6b;margin:0;"><i class="fas fa-map-marker-alt"></i> ${store.city}</p>
                    </div>
                    <div style="display:flex;gap:6px;">
                        <button class="btn btn-primary btn-sm" onclick="BusinessAdmin.editStore(${store.id})"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-danger btn-sm" onclick="BusinessAdmin.deleteStore(${store.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
                <div style="font-size:0.85rem;color:#6b6b6b;display:flex;flex-direction:column;gap:4px;">
                    ${store.address ? `<div><i class="fas fa-location-dot"></i> ${store.address}</div>` : ''}
                    ${store.phone ? `<div><i class="fas fa-phone"></i> ${store.phone}</div>` : ''}
                    ${store.whatsapp ? `<div><i class="fab fa-whatsapp"></i> +${store.whatsapp}</div>` : ''}
                    ${store.hours ? `<div><i class="fas fa-clock"></i> ${store.hours}</div>` : ''}
                </div>
                <div style="display:flex;gap:6px;margin-top:12px;padding-top:12px;border-top:1px solid #e5e7eb;">
                    ${store.instagram ? `<a href="${store.instagram}" target="_blank" style="color:#6b6b6b;"><i class="fab fa-instagram"></i></a>` : ''}
                    ${store.facebook ? `<a href="${store.facebook}" target="_blank" style="color:#6b6b6b;"><i class="fab fa-facebook"></i></a>` : ''}
                    ${store.tiktok ? `<a href="${store.tiktok}" target="_blank" style="color:#6b6b6b;"><i class="fab fa-tiktok"></i></a>` : ''}
                </div>
            </div>
        `).join('')
    },

    openStoreModal(store = null) {
        this.currentStore = store
        this.storeLogo = store?.logo || ''
        document.getElementById('storeModalTitle').textContent = store ? 'Editar Tienda' : 'Nueva Tienda'
        document.getElementById('storeForm').reset()
        
        if (store) {
            document.getElementById('storeName').value = store.name || ''
            document.getElementById('storeCity').value = store.city || ''
            document.getElementById('storeAddress').value = store.address || ''
            document.getElementById('storePhone').value = store.phone || ''
            document.getElementById('storeWhatsapp').value = store.whatsapp || ''
            document.getElementById('storeHours').value = store.hours || ''
            document.getElementById('storeInstagram').value = store.instagram || ''
            document.getElementById('storeFacebook').value = store.facebook || ''
            document.getElementById('storeTiktok').value = store.tiktok || ''
            this.renderStoreLogoPreview()
        } else {
            document.getElementById('storeLogoPreview').innerHTML = ''
        }
        this.setupStoreUpload()
        document.getElementById('storeModal').classList.add('active')
    },

    closeStoreModal() {
        document.getElementById('storeModal').classList.remove('active')
        this.currentStore = null
        this.storeLogo = ''
    },

    // ===== MODIFICADO: saveStore AHORA USA SUPABASE =====
    async saveStore() {
        const storeData = {
            business_id: currentBusiness.id,
            name: document.getElementById('storeName').value.trim(),
            city: document.getElementById('storeCity').value.trim(),
            address: document.getElementById('storeAddress').value.trim(),
            phone: document.getElementById('storePhone').value.trim(),
            whatsapp: document.getElementById('storeWhatsapp').value.trim(),
            hours: document.getElementById('storeHours').value.trim(),
            instagram: document.getElementById('storeInstagram').value.trim(),
            facebook: document.getElementById('storeFacebook').value.trim(),
            tiktok: document.getElementById('storeTiktok').value.trim(),
            logo: this.storeLogo
        }
        
        if (!storeData.name || !storeData.city) { alert('El nombre y la ciudad son obligatorios'); return }
        
        // ===== NUEVO: GUARDAR EN SUPABASE =====
        try {
            const result = await saveStoreToDB(storeData)
            if (result) {
                storeData.id = result.id
                console.log('✅ Tienda guardada en Supabase')
            }
        } catch (error) {
            console.warn('⚠️ Error guardando tienda en Supabase:', error)
        }
        
        if (this.currentStore) {
            const index = this.stores.findIndex(s => s.id === this.currentStore.id)
            this.stores[index] = { ...this.currentStore, ...storeData }
        } else {
            const newId = Math.max(...this.stores.map(s => s.id), 0) + 1
            this.stores.push({ id: newId, ...storeData })
        }
        
        stores = this.stores
        saveData('business_stores', this.stores)
        
        alert('Tienda guardada exitosamente')
        this.closeStoreModal()
        this.renderStores()
        this.renderDashboard()
    },

    editStore(id) {
        const store = this.stores.find(s => s.id === id)
        if (store) this.openStoreModal(store)
    },

    // ===== MODIFICADO: deleteStore AHORA USA SUPABASE =====
    async deleteStore(id) {
        if (!confirm('¿Estás seguro de eliminar esta tienda?')) return
        
        // ===== NUEVO: ELIMINAR EN SUPABASE =====
        try {
            await deleteStoreFromDB(id)
            console.log('✅ Tienda eliminada de Supabase')
        } catch (error) {
            console.warn('⚠️ Error eliminando tienda en Supabase:', error)
        }
        
        this.stores = this.stores.filter(s => s.id !== id)
        stores = this.stores
        saveData('business_stores', this.stores)
        alert('Tienda eliminada')
        this.renderStores()
        this.renderDashboard()
    },

    setupStoreUpload() {
        const uploadZone = document.getElementById('storeUploadZone')
        const fileInput = document.getElementById('storeFileInput')
        if (!uploadZone || !fileInput) return
        
        uploadZone.onclick = () => fileInput.click()
        fileInput.onchange = (e) => {
            const file = e.target.files[0]
            if (!file) return
            if (file.size > 2 * 1024 * 1024) { alert('El logo no debe superar 2MB'); return }
            const reader = new FileReader()
            reader.onload = (ev) => { this.storeLogo = ev.target.result; this.renderStoreLogoPreview() }
            reader.readAsDataURL(file)
        }
    },

    renderStoreLogoPreview() {
        const preview = document.getElementById('storeLogoPreview')
        if (!preview) return
        if (this.storeLogo) {
            preview.innerHTML = `<div style="position:relative;display:inline-block;"><img src="${this.storeLogo}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;border:1px solid #e5e7eb;"><button onclick="BusinessAdmin.removeStoreLogo()" style="position:absolute;top:-8px;right:-8px;width:24px;height:24px;background:#dc2626;color:#fff;border:none;border-radius:50%;cursor:pointer;font-size:0.75rem;"><i class="fas fa-times"></i></button></div>`
        } else {
            preview.innerHTML = ''
        }
    },

    removeStoreLogo() {
        this.storeLogo = ''
        this.renderStoreLogoPreview()
    },

    // ===== MODIFICADO: saveAbout AHORA USA SUPABASE =====
    async saveAbout() {
        currentBusiness.about_history = document.getElementById('aboutHistory').value
        currentBusiness.about_mission = document.getElementById('aboutMission').value
        currentBusiness.about_vision = document.getElementById('aboutVision').value
        
        const aboutData = {
            about_history: currentBusiness.about_history,
            about_mission: currentBusiness.about_mission,
            about_vision: currentBusiness.about_vision
        }
        
        // ===== NUEVO: GUARDAR EN SUPABASE =====
        try {
            await saveAboutToDB(currentBusiness.id, aboutData)
            console.log('✅ About guardado en Supabase')
        } catch (error) {
            console.warn('⚠️ Error guardando about en Supabase:', error)
        }
        
        saveData('business_about', aboutData)
        
        alert('¡Información guardada exitosamente!')
    },

    setupUpload() {
        const uploadZone = document.getElementById('uploadZone')
        const fileInput = document.getElementById('fileInput')
        if (!uploadZone || !fileInput) return
        
        uploadZone.addEventListener('click', () => fileInput.click())
        uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.style.borderColor = '#d97706'; uploadZone.style.background = '#fffbeb'; })
        uploadZone.addEventListener('dragleave', () => { uploadZone.style.borderColor = '#e5e7eb'; uploadZone.style.background = ''; })
        uploadZone.addEventListener('drop', (e) => { e.preventDefault(); uploadZone.style.borderColor = '#e5e7eb'; uploadZone.style.background = ''; this.handleFiles(e.dataTransfer.files); })
        fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files))
    },

    async handleFiles(files) {
        const fileArray = Array.from(files)
        
        for (const file of fileArray) {
            if (file.size > 10 * 1024 * 1024) {
                alert(`${file.name} es muy grande (máximo 10MB)`)
                return
            }
        }
        
        const r2Configured = PLATFORM_CONFIG.r2 && PLATFORM_CONFIG.r2.accountId
        
        if (r2Configured) {
            try {
                const uploadZone = document.getElementById('uploadZone')
                uploadZone.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subiendo y optimizando...'
                uploadZone.style.pointerEvents = 'none'
                
                const prefix = currentProduct ? `prod_${currentProduct.id}` : `new_${Date.now()}`
                const urls = await uploadMultipleOptimizedImages(fileArray, prefix)
                
                uploadedImages.push(...urls)
                this.renderImagePreview()
                
                uploadZone.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Arrastra imágenes o haz clic'
                uploadZone.style.pointerEvents = 'auto'
                
                alert(`${urls.length} imagen(es) subida(s) y optimizada(s)`)
            } catch (error) {
                console.error('Error al subir a R2:', error)
                alert('Error al subir imágenes. Usando modo local como fallback.')
                this.handleFilesLocal(fileArray)
            }
        } else {
            this.handleFilesLocal(fileArray)
        }
    },

    handleFilesLocal(files) {
        Array.from(files).forEach(file => {
            const reader = new FileReader()
            reader.onload = (e) => { uploadedImages.push(e.target.result); this.renderImagePreview() }
            reader.readAsDataURL(file)
        })
    },

    renderImagePreview() {
        const preview = document.getElementById('imagePreview')
        if (!preview) return
        preview.innerHTML = uploadedImages.map((img, i) => `
            <div class="preview-item"><img src="${img}" alt="Preview"><button class="preview-remove" onclick="BusinessAdmin.removeImage(${i})"><i class="fas fa-times"></i></button></div>
        `).join('')
    },

    removeImage(index) {
        uploadedImages.splice(index, 1)
        this.renderImagePreview()
    },

    exportProducts() {
        const businessProducts = products.filter(p => p.business_id === currentBusiness.id)
        
        if (businessProducts.length === 0) {
            alert('No hay productos para exportar')
            return
        }

        const headers = ['ID', 'Nombre', 'SKU', 'Categoría', 'Precio', 'Descuento', 'Estado', 'Fecha Programada', 'Descripción']
        const csvContent = [
            headers.join(','),
            ...businessProducts.map(p => [
                p.id,
                `"${p.name.replace(/"/g, '""')}"`,
                `"${p.sku}"`,
                `"${p.category}"`,
                p.price,
                p.discount || 0,
                p.status || 'published',
                p.scheduled_date || '',
                `"${(p.description || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
            ].join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `productos_${currentBusiness.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
        link.click()
        URL.revokeObjectURL(link.href)
    },

    importProducts(event) {
        const file = event.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const text = e.target.result
                const lines = text.split('\n').filter(line => line.trim())
                
                if (lines.length < 2) {
                    alert('El archivo CSV no tiene datos válidos')
                    return
                }

                const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
                let imported = 0
                let errors = 0

                for (let i = 1; i < lines.length; i++) {
                    try {
                        const values = this.parseCSVLine(lines[i])
                        const product = {
                            business_id: currentBusiness.id,
                            name: values[headers.indexOf('nombre')] || values[headers.indexOf('name')] || '',
                            sku: values[headers.indexOf('sku')] || '',
                            category: values[headers.indexOf('categoría')] || values[headers.indexOf('category')] || '',
                            price: parseFloat(values[headers.indexOf('precio')] || values[headers.indexOf('price')] || 0),
                            discount: parseInt(values[headers.indexOf('descuento')] || values[headers.indexOf('discount')] || 0) || null,
                            status: values[headers.indexOf('estado')] || values[headers.indexOf('status')] || 'published',
                            scheduled_date: values[headers.indexOf('fecha programada')] || values[headers.indexOf('scheduled_date')] || null,
                            description: values[headers.indexOf('descripción')] || values[headers.indexOf('description')] || '',
                            details: '',
                            shipping: '',
                            images: ['https://via.placeholder.com/600']
                        }

                        if (product.name && product.sku && product.price > 0) {
                            const newId = Math.max(...products.map(p => p.id), 0) + 1
                            products.push({ id: newId, ...product })
                            this.logChange(newId, 'import', null, products[products.length - 1])
                            imported++
                        } else {
                            errors++
                        }
                    } catch (err) {
                        errors++
                    }
                }

                saveData('business_products', products)
                
                alert(`Importación completada:\n✓ ${imported} productos importados\n✗ ${errors} errores`)
                this.renderProducts()
                this.renderDashboard()
                event.target.value = ''
            } catch (err) {
                alert('Error al leer el archivo CSV. Asegúrate de que el formato sea correcto.')
            }
        }
        reader.readAsText(file)
    },

    parseCSVLine(line) {
        const result = []
        let current = ''
        let inQuotes = false

        for (let i = 0; i < line.length; i++) {
            const char = line[i]
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"'
                    i++
                } else {
                    inQuotes = !inQuotes
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim())
                current = ''
            } else {
                current += char
            }
        }
        result.push(current.trim())
        return result
    },

    logChange(productId, action, oldValue, newValue) {
        const product = newValue || oldValue
        const logEntry = {
            id: Date.now(),
            product_id: productId,
            product_name: product?.name || 'Producto eliminado',
            product_sku: product?.sku || '',
            action: action,
            timestamp: new Date().toISOString(),
            user: currentBusiness?.owner_email || 'unknown',
            changes: this.detectChanges(oldValue, newValue)
        }

        changeLog.push(logEntry)
        if (changeLog.length > 500) changeLog.shift()
        localStorage.setItem('business_change_log', JSON.stringify(changeLog))
    },

    detectChanges(oldValue, newValue) {
        if (!oldValue) return ['Producto creado']
        if (!newValue) return ['Producto eliminado']

        const changes = []
        const fields = ['name', 'sku', 'category', 'price', 'discount', 'status', 'scheduled_date']

        fields.forEach(field => {
            if (oldValue[field] !== newValue[field]) {
                const fieldNames = {
                    name: 'Nombre',
                    sku: 'SKU',
                    category: 'Categoría',
                    price: 'Precio',
                    discount: 'Descuento',
                    status: 'Estado',
                    scheduled_date: 'Fecha programada'
                }
                changes.push(`${fieldNames[field]}: "${oldValue[field]}" → "${newValue[field]}"`)
            }
        })

        return changes.length > 0 ? changes : ['Actualización sin cambios detectados']
    },

    viewChangeLog(productId) {
        const product = products.find(p => p.id === productId)
        const productLogs = changeLog.filter(log => log.product_id === productId).reverse()

        if (productLogs.length === 0) {
            alert('No hay historial de cambios para este producto')
            return
        }

        let logText = `📋 HISTORIAL DE CAMBIOS\n${product?.name || 'Producto'} (SKU: ${product?.sku || 'N/A'})\n${'='.repeat(50)}\n\n`

        productLogs.forEach(log => {
            const date = new Date(log.timestamp).toLocaleString('es-ES')
            const actionIcons = { create: '➕', update: '✏️', delete: '🗑️', import: '📥' }
            logText += `${actionIcons[log.action] || '📝'} ${log.action.toUpperCase()}\n`
            logText += `📅 ${date}\n`
            logText += `👤 ${log.user}\n`
            logText += `Cambios:\n${log.changes.map(c => `  • ${c}`).join('\n')}\n${'-'.repeat(30)}\n\n`
        })

        const logWindow = window.open('', '_blank', 'width=600,height=700')
        logWindow.document.write(`
            <html>
            <head><title>Historial de Cambios</title>
            <style>
                body { font-family: monospace; padding: 20px; background: #f5f5f5; }
                pre { white-space: pre-wrap; word-wrap: break-word; }
            </style>
            </head>
            <body><pre>${logText}</pre></body>
            </html>
        `)
    }
}

window.BusinessAdmin = BusinessAdmin
document.addEventListener('DOMContentLoaded', () => BusinessAdmin.init())
