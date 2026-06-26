// Business Admin - Versión LOCAL (sin Supabase)

let currentBusiness = null
let currentProduct = null
let uploadedImages = []

const businesses = [
    {
        id: 1,
        name: 'RUTA Importadora',
        owner_email: 'cliente@ruta.com',
        owner_password: '123456',
        about_history: 'Somos una importadora directa de mochilas con base en Santa Cruz de la Sierra.',
        about_mission: 'Ser la importadora de mochilas líder en Bolivia.',
        about_vision: 'Para 2027, ser reconocidos como la tienda de referencia.'
    }
]

let products = [
    {
        id: 1, business_id: 1, name: 'Mochila Escolar Urban Pro', sku: 'RUT-ESC-001', category: 'Escolar',
        price: 180, discount: null,
        description: 'Mochila escolar de alta resistencia con tela Oxford 600D impermeabilizada. Diseño ergonómico con correas acolchadas ajustables y espalda ventilada. 3 compartimentos principales, bolsillo frontal con organizador, 2 bolsillos laterales para botella y porta laptop hasta 15.6".',
        details: 'Material: Oxford 600D impermeable\nCapacidad: 30 litros\nCompartimentos: 3 principales + 1 frontal\nLaptop: Hasta 15.6"\nPeso: 650 g\nOrigen: Importación directa',
        shipping: 'Envíos a todo Bolivia. Pedidos procesados en 24-48 h.\n\n• Gratis en compras desde 350 Bs.\n• Seguimiento por WhatsApp\n• Garantía de 30 días por defectos de fábrica',
        images: ['https://images.unsplash.com/photo-1580087256394-dc596e1c8f4f?w=600']
    },
    {
        id: 2, business_id: 1, name: 'Mochila Viaje Explorer 45L', sku: 'RUT-VIA-003', category: 'Viaje',
        price: 380, discount: 20,
        description: 'Mochila de viaje de 45 litros con apertura tipo maleta. Perfecta para viajes de aventura. Tela ripstop resistente al desgarro con tratamiento impermeable. Incluye funda para lluvia.',
        details: 'Material: Ripstop nylon impermeable\nCapacidad: 45 litros\nApertura: Tipo maleta 180°\nExtras: Funda de lluvia incluida\nCinturón: Lumbar acolchado\nOrigen: Importación directa',
        shipping: 'Envíos a todo Bolivia. Pedidos procesados en 24-48 h.\n\n• Gratis en compras desde 350 Bs.\n• Seguimiento por WhatsApp\n• Garantía de 30 días',
        images: ['https://images.unsplash.com/photo-1622260614153-03223fb72052?w=600']
    }
]

let categories = [
    { id: 1, business_id: 1, name: 'Escolar' },
    { id: 2, business_id: 1, name: 'Viaje' },
    { id: 3, business_id: 1, name: 'Deportiva' },
    { id: 4, business_id: 1, name: 'Ejecutiva' }
]

let stores = [
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

export const BusinessAdmin = {
    stores: stores,
    currentStore: null,
    storeLogo: '',

    init() {
        this.checkAuth()
        this.setupNavigation()
        this.setupUpload()
    },

    checkAuth() {
        const isLoggedIn = localStorage.getItem('business_logged') === 'true'
        if (isLoggedIn) {
            document.getElementById('loginScreen').style.display = 'none'
            document.getElementById('adminLayout').classList.add('active')
            this.loadBusinessData()
        } else {
            document.getElementById('loginScreen').style.display = 'flex'
            document.getElementById('adminLayout').classList.remove('active')
        }

        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault()
            const email = document.getElementById('loginEmail').value
            const password = document.getElementById('loginPassword').value
            const business = businesses.find(b => b.owner_email === email && b.owner_password === password)
            
            if (business) {
                currentBusiness = business
                localStorage.setItem('business_logged', 'true')
                localStorage.setItem('current_business_id', business.id)
                document.getElementById('loginScreen').style.display = 'none'
                document.getElementById('adminLayout').classList.add('active')
                this.loadBusinessData()
            } else {
                alert('Credenciales incorrectas\n\nUsa:\nEmail: cliente@ruta.com\nPassword: 123456')
            }
        })
    },

    loadBusinessData() {
        const businessId = parseInt(localStorage.getItem('current_business_id'))
        currentBusiness = businesses.find(b => b.id === businessId)
        if (currentBusiness) {
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
        location.reload()
    },

    setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.section
                this.switchSection(section)
                if (window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('open')
            })
        })
    },

    switchSection(section) {
        document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.section === section))
        document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'))
        document.getElementById(section + 'Section').classList.add('active')
        
        if (section === 'products') this.renderProducts()
        if (section === 'categories') this.renderCategories()
        if (section === 'dashboard') this.renderDashboard()
        if (section === 'stores') this.renderStores()
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
        document.getElementById('productsTable').innerHTML = businessProducts.map(p => `
            <tr>
                <td><img src="${p.images[0]}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;"></td>
                <td><strong>${p.name}</strong></td>
                <td>${p.sku}</td>
                <td>Bs. ${p.price}${p.discount ? ` <span class="badge badge-warning">-${p.discount}%</span>` : ''}</td>
                <td>${p.category}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="BusinessAdmin.editProduct(${p.id})"><i class="fas fa-edit"></i> Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="BusinessAdmin.deleteProduct(${p.id})"><i class="fas fa-trash"></i> Eliminar</button>
                </td>
            </tr>
        `).join('')
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
            document.getElementById('productDescription').value = product.description || ''
            document.getElementById('productDetails').value = product.details || ''
            document.getElementById('productShipping').value = product.shipping || ''
            this.renderImagePreview()
        } else {
            document.getElementById('imagePreview').innerHTML = ''
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

    saveProduct() {
        const productData = {
            business_id: currentBusiness.id,
            name: document.getElementById('productName').value,
            sku: document.getElementById('productSku').value,
            category: document.getElementById('productCategory').value,
            price: parseFloat(document.getElementById('productPrice').value),
            discount: parseInt(document.getElementById('productDiscount').value) || null,
            description: document.getElementById('productDescription').value,
            details: document.getElementById('productDetails').value,
            shipping: document.getElementById('productShipping').value,
            images: uploadedImages
        }
        
        if (currentProduct) {
            const index = products.findIndex(p => p.id === currentProduct.id)
            products[index] = { ...currentProduct, ...productData }
        } else {
            const newId = Math.max(...products.map(p => p.id), 0) + 1
            products.push({ id: newId, ...productData })
        }
        
        alert('Producto guardado exitosamente')
        this.closeProductModal()
        this.renderProducts()
        this.renderDashboard()
    },

    editProduct(id) {
        const product = products.find(p => p.id === id)
        if (product) this.openProductModal(product)
    },

    deleteProduct(id) {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return
        products = products.filter(p => p.id !== id)
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

    saveCategory() {
        const name = document.getElementById('categoryName').value.trim()
        if (!name) { alert('Ingresa un nombre para la categoría'); return }
        const newId = Math.max(...categories.map(c => c.id), 0) + 1
        categories.push({ id: newId, business_id: currentBusiness.id, name: name })
        alert('Categoría creada exitosamente')
        this.closeCategoryModal()
        this.renderCategories()
        this.renderDashboard()
    },

    deleteCategory(id) {
        if (!confirm('¿Estás seguro de eliminar esta categoría?')) return
        categories = categories.filter(c => c.id !== id)
        alert('Categoría eliminada')
        this.renderCategories()
    },

    // ===== TIENDAS AUTORIZADAS =====
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

    saveStore() {
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
        
        if (this.currentStore) {
            const index = this.stores.findIndex(s => s.id === this.currentStore.id)
            this.stores[index] = { ...this.currentStore, ...storeData }
        } else {
            const newId = Math.max(...this.stores.map(s => s.id), 0) + 1
            this.stores.push({ id: newId, ...storeData })
        }
        
        alert('Tienda guardada exitosamente')
        this.closeStoreModal()
        this.renderStores()
        this.renderDashboard()
    },

    editStore(id) {
        const store = this.stores.find(s => s.id === id)
        if (store) this.openStoreModal(store)
    },

    deleteStore(id) {
        if (!confirm('¿Estás seguro de eliminar esta tienda?')) return
        this.stores = this.stores.filter(s => s.id !== id)
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

    saveAbout() {
        currentBusiness.about_history = document.getElementById('aboutHistory').value
        currentBusiness.about_mission = document.getElementById('aboutMission').value
        currentBusiness.about_vision = document.getElementById('aboutVision').value
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

    handleFiles(files) {
        Array.from(files).forEach(file => {
            if (file.size > 5 * 1024 * 1024) { alert(`${file.name} es muy grande (máximo 5MB)`); return }
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
    }
}

window.BusinessAdmin = BusinessAdmin
document.addEventListener('DOMContentLoaded', () => BusinessAdmin.init())