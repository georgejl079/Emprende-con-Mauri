// Lógica principal de la aplicación
import { PLATFORM_CONFIG, optimizeImage } from './config.js'
import { LazyLoader, Animations, BackToTop, registerServiceWorker } from './utils.js'
import { renderProductCard, renderCategoryCard } from './components.js'

// Datos locales (después vendrán de Supabase)
const products = [
    {
        id: 1, sku: 'RUT-ESC-001', name: 'Mochila Escolar Urban Pro', category: 'Escolar',
        price: 180, oldPrice: null, discount: null, cat: 'escolar',
        img: 'https://images.unsplash.com/photo-1580087256394-dc596e1c8f4f?w=600',
        colors: [{ hex: '#1a1a1a', name: 'Negro' }, { hex: '#1e3a5f', name: 'Azul Marino' }, { hex: '#8b0000', name: 'Rojo' }],
        description: 'Mochila escolar de alta resistencia con tela Oxford 600D impermeabilizada. Diseño ergonómico con correas acolchadas ajustables y espalda ventilada. 3 compartimentos principales, bolsillo frontal con organizador, 2 bolsillos laterales para botella y porta laptop hasta 15.6".',
        details: 'Material: Oxford 600D impermeable\nCapacidad: 30 litros\nCompartimentos: 3 principales + 1 frontal\nLaptop: Hasta 15.6"\nPeso: 650 g\nOrigen: Importación directa',
        shipping: 'Envíos a todo Bolivia. Pedidos procesados en 24-48 h.\n\n• Gratis en compras desde 2500 Bs.\n• Seguimiento por WhatsApp\n• Garantía de 30 días por defectos de fábrica'
    },
    {
        id: 2, sku: 'RUT-VIA-003', name: 'Mochila Viaje Explorer 45L', category: 'Viaje',
        price: 380, oldPrice: 475, discount: 20, cat: 'viaje',
        img: 'https://images.unsplash.com/photo-1622260614153-03223fb72052?w=600',
        colors: [{ hex: '#2d5016', name: 'Verde Militar' }, { hex: '#1a1a1a', name: 'Negro' }, { hex: '#1e3a5f', name: 'Azul' }],
        description: 'Mochila de viaje de 45 litros con apertura tipo maleta. Perfecta para viajes de aventura. Tela ripstop resistente al desgarro con tratamiento impermeable. Incluye funda para lluvia.',
        details: 'Material: Ripstop nylon impermeable\nCapacidad: 45 litros\nApertura: Tipo maleta 180°\nExtras: Funda de lluvia incluida\nCinturón: Lumbar acolchado\nOrigen: Importación directa',
        shipping: 'Envíos a todo Bolivia. Pedidos procesados en 24-48 h.\n\n• Gratis en compras desde 2500 Bs.\n• Seguimiento por WhatsApp\n• Garantía de 30 días'
    },
    {
        id: 3, sku: 'RUT-DEP-005', name: 'Mochila Deportiva Gym Fit', category: 'Deportiva',
        price: 150, oldPrice: null, discount: null, cat: 'deportiva',
        img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',
        colors: [{ hex: '#1a1a1a', name: 'Negro' }, { hex: '#ff6600', name: 'Naranja' }, { hex: '#1e3a5f', name: 'Azul' }],
        description: 'Mochila deportiva con compartimento separado para zapatos. Diseño compacto pero espacioso. Tela resistente al agua con costuras selladas.',
        details: 'Material: Nylon resistente al agua\nCapacidad: 25 litros\nCompartimento: Zapatos/ropa mojada\nBolsillo: Húmedo separado\nPeso: 480 g\nOrigen: Importación directa',
        shipping: 'Envíos a todo Bolivia. Pedidos procesados en 24-48 h.\n\n• Gratis desde 2500 Bs.\n• Seguimiento por WhatsApp\n• Garantía 30 días'
    },
    {
        id: 4, sku: 'RUT-INF-006', name: 'Mochila Infantil Kids Fun', category: 'Infantil',
        price: 120, oldPrice: 160, discount: 25, cat: 'infantil',
        img: 'https://images.unsplash.com/photo-1594226801341-41427b4e5c22?w=600',
        colors: [{ hex: '#ff69b4', name: 'Rosa' }, { hex: '#4169e1', name: 'Azul Rey' }, { hex: '#32cd32', name: 'Verde' }],
        description: 'Mochila infantil con diseño ergonómico especial para niños de 3 a 8 años. Espalda acolchada transpirable. Diseños coloridos.',
        details: 'Material: Poliéster impermeable\nCapacidad: 12 litros\nEdad: 3 a 8 años\nEspalda: Acolchada transpirable\nPeso: 320 g\nOrigen: Importación directa',
        shipping: 'Envíos a todo Bolivia. Pedidos procesados en 24-48 h.\n\n• Gratis desde 2500 Bs.\n• Seguimiento por WhatsApp\n• Garantía 30 días'
    },
    {
        id: 5, sku: 'RUT-EJE-007', name: 'Mochila Ejecutiva Business', category: 'Ejecutiva',
        price: 290, oldPrice: null, discount: null, cat: 'ejecutiva',
        img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',
        colors: [{ hex: '#1a1a1a', name: 'Negro' }, { hex: '#4a4a4a', name: 'Gris Oscuro' }],
        description: 'Mochila ejecutiva premium con puerto USB de carga externo. Compartimento acolchado para laptop hasta 15.6", bolsillo anti-robo en la espalda.',
        details: 'Material: Cuero sintético premium\nCapacidad: 22 litros\nLaptop: Hasta 15.6"\nExtra: Puerto USB integrado\nBolsillo: Anti-robo trasero\nOrigen: Importación directa',
        shipping: 'Envíos a todo Bolivia. Pedidos procesados en 24-48 h.\n\n• Gratis desde 2500 Bs.\n• Seguimiento por WhatsApp\n• Garantía 30 días'
    },
    {
        id: 6, sku: 'RUT-OUT-008', name: 'Mochila Outdoor Trekking 50L', category: 'Outdoor',
        price: 450, oldPrice: 550, discount: 18, cat: 'outdoor',
        img: 'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=600',
        colors: [{ hex: '#2d5016', name: 'Verde Bosque' }, { hex: '#8b4513', name: 'Marrón' }, { hex: '#1a1a1a', name: 'Negro' }],
        description: 'Mochila de trekking profesional con sistema de ventilación dorsal. Estructura interna de aluminio liviana. Ideal para rutas de varios días.',
        details: 'Material: Nylon 420D ripstop\nCapacidad: 50 litros\nSistema: Ventilación dorsal\nEstructura: Aluminio liviano\nHidratación: Compatible (no incluida)\nOrigen: Importación directa',
        shipping: 'Envíos a todo Bolivia. Pedidos procesados en 24-48 h.\n\n• Gratis desde 2500 Bs.\n• Seguimiento por WhatsApp\n• Garantía 30 días'
    }
]

const categories = [
    { id: 'escolar', name: 'Escolar', img: 'https://images.unsplash.com/photo-1580087256394-dc596e1c8f4f?w=400' },
    { id: 'viaje', name: 'Viaje', img: 'https://images.unsplash.com/photo-1622260614153-03223fb72052?w=400' },
    { id: 'deportiva', name: 'Deportiva', img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400' },
    { id: 'ejecutiva', name: 'Ejecutiva', img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400' }
]

export const App = {
    cart: JSON.parse(localStorage.getItem('ruta_cart') || '[]'),
    wishlist: JSON.parse(localStorage.getItem('ruta_wishlist') || '[]'),
    product: null,
    selColor: null,
    filter: 'all',
    searchTimeout: null,
    businessConfig: null,

    init(businessConfig) {
        this.businessConfig = businessConfig
        this.setupSearch()
        this.renderHome()
        this.renderShop()
        this.renderOfertas()
        this.updateCartBadge()
        this.updateFooterYear()
        this.updateWishlistBadges()
        
        LazyLoader.init()
        Animations.init()
        BackToTop.init()
        registerServiceWorker()
        
        // Renderizar tiendas autorizadas
        this.renderAuthorizedStores()
        
        setTimeout(() => {
            LazyLoader.observeNew(document.body)
        }, 100)
    },

    updateFooterYear() {
        const year = new Date().getFullYear()
        const yearEl = document.getElementById('footer-year')
        if (yearEl) yearEl.textContent = year
        const yearMobile = document.getElementById('footer-year-mobile')
        if (yearMobile) yearMobile.textContent = year
    },

    setupSearch() {
        const searchMobile = document.getElementById('search-mobile')
        const searchDesktop = document.getElementById('search-desktop')
        
        const handleSearch = (value) => {
            clearTimeout(this.searchTimeout)
            this.searchTimeout = setTimeout(() => this.search(value), 300)
        }

        if (searchMobile) {
            searchMobile.addEventListener('input', (e) => handleSearch(e.target.value))
            searchMobile.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') { e.preventDefault(); this.search(e.target.value); }
            })
        }
        if (searchDesktop) {
            searchDesktop.addEventListener('input', (e) => handleSearch(e.target.value))
            searchDesktop.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') { e.preventDefault(); this.search(e.target.value); }
            })
        }
    },

    search(query) {
        const searchTerm = query ? query.toLowerCase().trim() : ''
        if (!searchTerm) {
            this.renderGrid('shop-grid', products)
            const shopCount = document.getElementById('shop-count')
            if (shopCount) shopCount.textContent = `(${products.length} productos)`
            return
        }
        const results = products.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            p.sku.toLowerCase().includes(searchTerm) ||
            p.category.toLowerCase().includes(searchTerm) ||
            p.description.toLowerCase().includes(searchTerm)
        )
        if (this.view !== 'shop') this.go('shop')
        this.renderGrid('shop-grid', results)
        const shopCount = document.getElementById('shop-count')
        if (shopCount) shopCount.textContent = `(${results.length} resultado${results.length !== 1 ? 's' : ''})`
        if (results.length === 0) {
            document.getElementById('shop-grid').innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--muted);">
                    <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.3;"></i>
                    <p style="font-size: 1.1rem; margin-bottom: 8px;">No encontramos productos</p>
                    <p style="font-size: 0.9rem;">Intenta con otros términos de búsqueda</p>
                </div>
            `
        }
    },

    go(view) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'))
        document.getElementById('view-' + view).classList.add('active')
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'))
        document.querySelectorAll('.desktop-nav button').forEach(b => b.classList.remove('active'))
        if (view !== 'ofertas' && view !== 'privacy') {
            const activeTab = document.querySelector(`.tab[onclick*="'${view}'"]`)
            if (activeTab) activeTab.classList.add('active')
        }
        const activeNav = document.querySelector(`.desktop-nav button[data-nav="${view}"]`)
        if (activeNav) activeNav.classList.add('active')
        window.scrollTo({ top: 0, behavior: 'smooth' })
        
        setTimeout(() => Animations.init(), 50)
    },

    toggleMenu() {
        document.getElementById('sideMenu').classList.toggle('open')
        document.getElementById('overlayDark').classList.toggle('show')
        document.getElementById('menuToggle').classList.toggle('active')
    },

    closeMenu() {
        document.getElementById('sideMenu').classList.remove('open')
        document.getElementById('overlayDark').classList.remove('show')
        document.getElementById('menuToggle').classList.remove('active')
    },

    isOferta(p) { return p.discount !== null; },

    isInWishlist(id) { return this.wishlist.includes(id); },

    toggleWishlist(id) {
        const idx = this.wishlist.indexOf(id)
        if (idx > -1) {
            this.wishlist.splice(idx, 1)
            this.toast('Eliminado de favoritos')
        } else {
            this.wishlist.push(id)
            this.toast('✓ Guardado en favoritos')
        }
        localStorage.setItem('ruta_wishlist', JSON.stringify(this.wishlist))
        this.updateWishlistBadges()
    },

    toggleWishlistCurrent() {
        if (!this.product) return
        this.toggleWishlist(this.product.id)
        this.updateWishlistButton()
    },

    updateWishlistButton() {
        const btn = document.getElementById('btn-wishlist-pd')
        const text = document.getElementById('wishlist-text')
        if (!btn || !this.product) return
        
        const inList = this.isInWishlist(this.product.id)
        btn.classList.toggle('active', inList)
        btn.querySelector('i').className = inList ? 'fas fa-heart' : 'far fa-heart'
        text.textContent = inList ? 'Guardado' : 'Guardar'
    },

    updateWishlistBadges() {
        document.querySelectorAll('.btn-wishlist').forEach(btn => {
            const id = parseInt(btn.dataset.id)
            const inList = this.isInWishlist(id)
            btn.classList.toggle('active', inList)
            btn.querySelector('i').className = inList ? 'fas fa-heart' : 'far fa-heart'
        })
        if (this.product) this.updateWishlistButton()
    },

    async shareProduct() {
        if (!this.product) return
        const p = this.product
        const shareData = {
            title: p.name,
            text: `${p.name} - ${this.isOferta(p) ? 'Bs. ' + p.price : 'Consultar precio'} | ${this.businessConfig?.name || '*MAURI*'}`,
            url: `${window.location.origin}${window.location.pathname}#product-${p.id}`
        }

        try {
            if (navigator.share) {
                await navigator.share(shareData)
                this.toast('Compartido exitosamente')
            } else {
                await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`)
                this.toast('✓ Enlace copiado al portapapeles')
            }
        } catch (err) {
            // Usuario canceló
        }
    },

    renderHome() {
        const ofertas = products.filter(p => this.isOferta(p))
        document.getElementById('home-ofertas').innerHTML = ofertas.map((p, i) => renderProductCard(p, i, this.businessConfig)).join('')
        document.getElementById('home-cats').innerHTML = categories.map((c, i) => renderCategoryCard(c, i)).join('')
        document.getElementById('home-featured').innerHTML = products.slice(0, 4).map((p, i) => renderProductCard(p, i, this.businessConfig)).join('')
        setTimeout(() => { LazyLoader.observeNew(document.body); Animations.init(); }, 50)
    },

    renderShop() {
        const cats = ['all', ...categories.map(c => c.id)]
        document.getElementById('shop-filters').innerHTML = cats.map(c => `
            <button class="filter-chip${c==='all'?' active':''}" data-cat="${c}" onclick="App.filter('${c}')">
                ${c==='all'?'Todos':categories.find(x=>x.id===c)?.name||c}
            </button>
        `).join('')
        this.renderGrid('shop-grid', products)
    },

    renderOfertas() {
        const ofertas = products.filter(p => this.isOferta(p))
        document.getElementById('ofertas-grid').innerHTML = ofertas.map((p, i) => renderProductCard(p, i, this.businessConfig)).join('')
    },

    renderGrid(id, data) {
        document.getElementById(id).innerHTML = data.map((p, i) => renderProductCard(p, i, this.businessConfig)).join('')
        setTimeout(() => { LazyLoader.observeNew(document.getElementById(id)); Animations.init(); }, 50)
    },

    filter(cat) {
        this.filter = cat
        document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'))
        const btn = document.querySelector(`.filter-chip[data-cat="${cat}"]`)
        if (btn) btn.classList.add('active')
        const data = cat === 'all' ? products : products.filter(p => p.cat === cat)
        this.renderGrid('shop-grid', data)
    },

    openProduct(id) {
        const p = products.find(x => x.id === id)
        if (!p) return
        this.product = p
        this.selColor = p.colors[0]
        const isOferta = this.isOferta(p)
        
        document.body.classList.add('product-open')
        
        history.replaceState(null, '', `${window.location.origin}${window.location.pathname}#product-${p.id}`)
        
        this.updateMetaTags(p)
        
        document.getElementById('pd-main-img').src = optimizeImage(p.img, 900)
        document.getElementById('pd-thumbs').innerHTML = [p.img, p.img, p.img].map((src, i) => 
            `<button class="pd-thumb${i===0?' active':''}" onclick="App.setImage(this,'${optimizeImage(src, 900)}')"><img src="${optimizeImage(src, 150)}" alt=""></button>`
        ).join('')
        
        document.getElementById('pd-cat').textContent = p.category.toUpperCase()
        document.getElementById('pd-name').textContent = p.name
        document.getElementById('pd-sku').textContent = p.sku
        
        const priceEl = document.getElementById('pd-price')
        const stockEl = document.getElementById('pd-stock')
        const btnAdd = document.getElementById('pd-btn-add')
        
        if (isOferta) {
            priceEl.textContent = 'Bs. ' + p.price
            priceEl.style.display = ''
            stockEl.className = 'pd-stock in-stock'
            stockEl.innerHTML = '<i class="fas fa-check-circle"></i> En stock — Envío 2-5 días'
            btnAdd.innerHTML = `<i class="fas fa-shopping-bag"></i> AÑADIR A LA BOLSA — BS. ${p.price}`
            btnAdd.style.display = ''
        } else {
            priceEl.style.display = 'none'
            stockEl.className = 'pd-stock consult'
            stockEl.innerHTML = '<i class="fas fa-info-circle"></i> Precio a consultar — Stock disponible'
            btnAdd.innerHTML = '<i class="fas fa-shopping-bag"></i> AÑADIR A LA BOLSA (precio a confirmar)'
            btnAdd.style.display = ''
        }
        
        // Descripción
        document.getElementById('panel-desc').innerHTML = `<p>${p.description}</p>`
        
        // Detalles técnicos (formateados con saltos de línea)
        document.getElementById('panel-details').innerHTML = p.details 
            ? `<p>${p.details.replace(/\n/g, '<br>')}</p>` 
            : '<p><strong>Material:</strong> Nylon resistente de alta calidad<br><strong>Capacidad:</strong> Ver descripción del producto<br><strong>Garantía:</strong> 30 días por defectos de fábrica<br><strong>Origen:</strong> Importación directa</p>'
        
        // Envío (formateado con saltos de línea)
        document.getElementById('panel-ship').innerHTML = p.shipping 
            ? `<p>${p.shipping.replace(/\n/g, '<br>')}</p>`
            : '<p>Envíos a todo Bolivia. Pedidos procesados en 24-48 h.</p><ul style="margin-top:10px;padding-left:18px;"><li>Gratis desde 2500 Bs.</li><li>Seguimiento por WhatsApp</li><li>Garantía 30 días</li></ul>'
        
        document.getElementById('pd-colors').innerHTML = p.colors.map((c, i) => 
            `<button class="color-btn${i===0?' active':''}" style="background:${c.hex}" title="${c.name}" onclick="App.pickColor(${i}, this)"></button>`
        ).join('')

        this.renderRelatedProducts(p)
        this.updateWishlistButton()
        this.switchTab('desc', document.querySelector('.pd-tab'))
        this.go('product')
    },

    updateMetaTags(p) {
        const isOferta = this.isOferta(p)
        document.title = `${p.name} | ${this.businessConfig?.name || '*MAURI*'}`
        
        let metaDesc = document.querySelector('meta[name="description"]')
        if (metaDesc) {
            metaDesc.content = `${p.name} - ${p.category}. ${p.description.substring(0, 150)}... ${isOferta ? 'Precio: Bs. ' + p.price : 'Consultar precio.'}`
        }
        
        let ogTitle = document.querySelector('meta[property="og:title"]')
        if (ogTitle) ogTitle.content = `${p.name} | ${this.businessConfig?.name || '*MAURI'}`
        
        let ogDesc = document.querySelector('meta[property="og:description"]')
        if (ogDesc) ogDesc.content = p.description.substring(0, 150)
        
        let ogImage = document.querySelector('meta[property="og:image"]')
        if (ogImage) ogImage.content = p.img
    },

    renderRelatedProducts(currentProduct) {
        const related = products.filter(p => p.id !== currentProduct.id && p.cat === currentProduct.cat).slice(0, 4)
        const fallback = products.filter(p => p.id !== currentProduct.id).slice(0, 4)
        const toShow = related.length >= 2 ? related : fallback
        document.getElementById('related-products').innerHTML = toShow.map((p, i) => renderProductCard(p, i, this.businessConfig)).join('')
        setTimeout(() => { LazyLoader.observeNew(document.getElementById('related-products')); }, 50)
    },

    closeProduct() {
        document.body.classList.remove('product-open')
        history.replaceState(null, '', `${window.location.origin}${window.location.pathname}`)
        this.go('shop')
    },

    setImage(btn, src) {
        document.querySelectorAll('.pd-thumb').forEach(t => t.classList.remove('active'))
        btn.classList.add('active')
        document.getElementById('pd-main-img').src = src
    },

    pickColor(idx, btn) {
        this.selColor = this.product.colors[idx]
        document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'))
        btn.classList.add('active')
    },

    switchTab(tab, btn) {
        document.querySelectorAll('.pd-tab').forEach(t => t.classList.remove('active'))
        document.querySelectorAll('.pd-panel').forEach(p => p.classList.remove('active'))
        if (btn) btn.classList.add('active')
        document.getElementById('panel-' + tab).classList.add('active')
    },

    addToCart() {
        if (!this.product) return
        const existing = this.cart.find(item => item.id === this.product.id && item.color === this.selColor.name)
        if (existing) {
            existing.qty++
        } else {
            this.cart.push({
                id: this.product.id,
                sku: this.product.sku,
                name: this.product.name,
                category: this.product.category,
                price: this.product.price,
                isOferta: this.isOferta(this.product),
                img: this.product.img,
                color: this.selColor.name,
                colorHex: this.selColor.hex,
                qty: 1
            })
        }
        this.saveCart()
        this.updateCartBadge()
        this.toast('✓ Añadido a la bolsa')
    },

    whatsappProduct() {
        if (!this.product) return
        const p = this.product
        const color = this.selColor ? this.selColor.name : 'Por definir'
        const priceText = this.isOferta(p) ? `Bs. ${p.price}` : 'A consultar'
        const msg = `Hola ${this.businessConfig?.name || '*MAURI*'} 👋\n\nMe interesa este producto:\n\n🎒 *${p.name}*\n SKU: ${p.sku}\n️ Categoría: ${p.category}\n🎨 Color: ${color}\n💰 Precio: ${priceText}\n\n¿Me pueden dar más información sobre disponibilidad?`
        window.open(`https://wa.me/${this.businessConfig?.whatsapp || PLATFORM_CONFIG.mainWhatsapp}?text=${encodeURIComponent(msg)}`, '_blank')
    },

    whatsappConsult(name, sku) {
        const msg = `Hola ${this.businessConfig?.name || '*MAURI*'} 👋\n\nMe interesa: *${name}* (SKU: ${sku})\n\n¿Me pueden dar más información sobre disponibilidad y precio?`
        window.open(`https://wa.me/${this.businessConfig?.whatsapp || PLATFORM_CONFIG.mainWhatsapp}?text=${encodeURIComponent(msg)}`, '_blank')
    },

    whatsapp() {
        const msg = `Hola ${this.businessConfig?.name || '*MAURI*'}\n\nMe gustaría más información sobre sus productos.`
        window.open(`https://wa.me/${this.businessConfig?.whatsapp || PLATFORM_CONFIG.mainWhatsapp}?text=${encodeURIComponent(msg)}`, '_blank')
    },

    openCart() {
        this.renderCart()
        document.getElementById('cartPanel').classList.add('open')
        document.getElementById('cartOverlay').classList.add('show')
    },

    closeCart() {
        document.getElementById('cartPanel').classList.remove('open')
        document.getElementById('cartOverlay').classList.remove('show')
    },

    renderCart() {
        const itemsEl = document.getElementById('cartItems')
        const footerEl = document.getElementById('cartFooter')
        
        if (this.cart.length === 0) {
            itemsEl.innerHTML = `<div class="cart-empty"><i class="fas fa-shopping-bag"></i><p>Tu bolsa está vacía</p><span>Agrega productos para comenzar</span></div>`
            footerEl.innerHTML = `<button class="btn-continue" onclick="App.closeCart(); App.go('shop');"><i class="fas fa-store"></i> Ver tienda</button>`
            return
        }

        let subtotalOfertas = 0
        let itemsConsultar = 0
        let totalItems = 0

        itemsEl.innerHTML = this.cart.map((item, i) => {
            totalItems += item.qty
            const itemSubtotal = item.isOferta ? item.price * item.qty : 0
            if (item.isOferta) subtotalOfertas += itemSubtotal
            if (!item.isOferta) itemsConsultar += item.qty

            return `
                <div class="cart-item">
                    <div class="cart-item-img"><img src="${item.img}" alt="${item.name}"></div>
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-sku">SKU: ${item.sku} · ${item.category}</div>
                        <div class="cart-item-opts">🎨 <strong>${item.color}</strong></div>
                        <div class="cart-item-bottom">
                            <div class="qty-control">
                                <button class="qty-btn" onclick="App.changeQty(${i}, -1)">−</button>
                                <span class="qty-value">${item.qty}</span>
                                <button class="qty-btn" onclick="App.changeQty(${i}, 1)">+</button>
                            </div>
                            ${item.isOferta 
                                ? `<span class="cart-item-price">Bs. ${itemSubtotal}</span>`
                                : `<span class="cart-item-price consult">A consultar</span>`
                            }
                            <button class="cart-item-remove" onclick="App.removeItem(${i})" title="Eliminar"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </div>
                </div>
            `
        }).join('')

        const hasConsultar = itemsConsultar > 0
        const shipping = subtotalOfertas >= 2500 ? 0 : (subtotalOfertas > 0 ? 25 : 0)
        const total = subtotalOfertas + shipping

        footerEl.innerHTML = `
            <div class="cart-summary">
                <div class="cart-summary-row">
                    <span class="label">Productos (${totalItems})</span>
                    <span class="value">${hasConsultar ? 'Ver detalle' : 'Bs. ' + subtotalOfertas}</span>
                </div>
                ${subtotalOfertas > 0 ? `<div class="cart-summary-row"><span class="label">Subtotal ofertas</span><span class="value">Bs. ${subtotalOfertas}</span></div>` : ''}
                ${subtotalOfertas > 0 ? `<div class="cart-summary-row"><span class="label">Envío</span><span class="value" style="color:${shipping === 0 ? '#059669' : 'var(--text)'}">${shipping === 0 ? '✓ GRATIS' : 'Bs. ' + shipping}</span></div>` : ''}
                ${hasConsultar ? `<div class="cart-summary-row"><span class="label" style="color:var(--accent);"><i class="fas fa-info-circle"></i> ${itemsConsultar} producto(s) a consultar precio</span><span class="value" style="color:var(--accent);">—</span></div>` : ''}
                ${subtotalOfertas > 0 ? `<div class="cart-summary-row total"><span class="label">Total confirmado</span><span class="value">Bs. ${total}</span></div>` : ''}
            </div>
            ${hasConsultar ? `<div class="cart-note"><i class="fas fa-info-circle"></i> Algunos productos requieren confirmación de precio.</div>` : ''}
            <button class="btn-checkout" onclick="App.checkout()"><i class="fab fa-whatsapp"></i> Enviar pedido por WhatsApp</button>
            <button class="btn-continue" onclick="App.closeCart()">Seguir comprando</button>
        `
    },

    changeQty(index, delta) {
        this.cart[index].qty += delta
        if (this.cart[index].qty <= 0) this.cart.splice(index, 1)
        this.saveCart()
        this.updateCartBadge()
        this.renderCart()
    },

    removeItem(index) {
        this.cart.splice(index, 1)
        this.saveCart()
        this.updateCartBadge()
        this.renderCart()
        this.toast('Producto eliminado')
    },

    checkout() {
        if (this.cart.length === 0) return
        let msg = `🎒 *NUEVO PEDIDO - ${this.businessConfig?.name || '*MAURI*'}*\n━━━━━━━━━━━━━━━━━━━━\n\n📦 *DETALLE DEL PEDIDO:*\n\n`
        let totalConfirmado = 0
        let itemsConsultar = []

        this.cart.forEach((item, i) => {
            const num = String(i + 1).padStart(2, '0')
            msg += `*${num}. ${item.name}*\n`
            msg += `   📦 SKU: ${item.sku}\n    Categoría: ${item.category}\n   🎨 Color: ${item.color}\n    Cantidad: ${item.qty}\n`
            if (item.isOferta) {
                const subtotal = item.price * item.qty
                totalConfirmado += subtotal
                msg += `   💰 Precio unit.: Bs. ${item.price}\n   💵 Subtotal: *Bs. ${subtotal}*\n`
            } else {
                msg += `   ⚠️ Precio: *A CONSULTAR*\n`
                itemsConsultar.push(item.name)
            }
            msg += `\n`
        })

        msg += `━━━━━━━━━━━━━━━━━━━━\n📊 *RESUMEN:*\n`
        msg += `• Productos: ${this.cart.length} modelo(s)\n`
        msg += `• Unidades totales: ${this.cart.reduce((sum, item) => sum + item.qty, 0)}\n`
        
        if (totalConfirmado > 0) {
            const shipping = totalConfirmado >= 2500 ? 0 : 25
            const total = totalConfirmado + shipping
            msg += `• Subtotal confirmado: Bs. ${totalConfirmado}\n`
            msg += `• Envío: ${shipping === 0 ? 'GRATIS ✓' : 'Bs. ' + shipping}\n`
            msg += `• *TOTAL CONFIRMADO: Bs. ${total}*\n`
        }
        
        if (itemsConsultar.length > 0) {
            msg += `\n️ *PRODUCTOS A CONSULTAR PRECIO:*\n`
            itemsConsultar.forEach(name => { msg += `• ${name}\n` })
            msg += `\nPor favor confirmen disponibilidad y precios actualizados.\n`
        }

        msg += `\n━━━━━━━━━━━━━━━━━━━━\nQuedo atento/a a su respuesta. ¡Gracias! 🙏`
        window.open(`https://wa.me/${this.businessConfig?.whatsapp || PLATFORM_CONFIG.mainWhatsapp}?text=${encodeURIComponent(msg)}`, '_blank')
    },

    saveCart() { localStorage.setItem('ruta_cart', JSON.stringify(this.cart)) },

    updateCartBadge() {
        const total = this.cart.reduce((sum, item) => sum + item.qty, 0)
        document.getElementById('cart-badge').textContent = total
        const desk = document.getElementById('cart-badge-desk')
        if (desk) desk.textContent = total
        const pd = document.getElementById('cart-badge-pd')
        if (pd) pd.textContent = total
    },

    // ===== NUEVA FUNCIÓN: TIENDAS AUTORIZADAS =====
    renderAuthorizedStores() {
        const storesContainer = document.getElementById('authorizedStores')
        if (!storesContainer) return
        
        const stores = this.businessConfig?.stores || []
        
        if (stores.length === 0) {
            storesContainer.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted);background:var(--surface);border-radius:10px;">
                    <i class="fas fa-store" style="font-size:2rem;margin-bottom:12px;opacity:0.3;"></i>
                    <p>Próximamente agregaremos nuestras tiendas autorizadas</p>
                </div>
            `
            return
        }
        
        storesContainer.innerHTML = stores.map(store => {
            const socialLinks = []
            
            if (store.whatsapp) {
                socialLinks.push(`<a href="https://wa.me/${store.whatsapp.replace(/\D/g,'')}" target="_blank" class="whatsapp" title="WhatsApp"><i class="fab fa-whatsapp"></i></a>`)
            }
            if (store.instagram) {
                socialLinks.push(`<a href="${store.instagram}" target="_blank" class="instagram" title="Instagram"><i class="fab fa-instagram"></i></a>`)
            }
            if (store.facebook) {
                socialLinks.push(`<a href="${store.facebook}" target="_blank" class="facebook" title="Facebook"><i class="fab fa-facebook-f"></i></a>`)
            }
            if (store.tiktok) {
                socialLinks.push(`<a href="${store.tiktok}" target="_blank" class="tiktok" title="TikTok"><i class="fab fa-tiktok"></i></a>`)
            }
            
            return `
                <div class="store-card">
                    <div class="store-card-header">
                        <div class="store-card-logo">
                            ${store.logo ? `<img src="${store.logo}" alt="${store.name}">` : '<i class="fas fa-store"></i>'}
                        </div>
                        <div>
                            <h4 class="store-card-name">${store.name}</h4>
                            <div class="store-card-city">
                                <i class="fas fa-map-marker-alt"></i> ${store.city}
                            </div>
                        </div>
                    </div>
                    <div class="store-card-info">
                        ${store.address ? `<div class="store-card-info-item"><i class="fas fa-location-dot"></i><span>${store.address}</span></div>` : ''}
                        ${store.phone ? `<div class="store-card-info-item"><i class="fas fa-phone"></i><span>${store.phone}</span></div>` : ''}
                        ${store.hours ? `<div class="store-card-info-item"><i class="fas fa-clock"></i><span>${store.hours}</span></div>` : ''}
                    </div>
                    ${socialLinks.length > 0 ? `<div class="store-card-social">${socialLinks.join('')}</div>` : ''}
                </div>
            `
        }).join('')
    },

    toast(msg) {
        const t = document.getElementById('toast')
        t.textContent = msg
        t.classList.add('show')
        setTimeout(() => t.classList.remove('show'), 2500)
    }
}

// Exponer App globalmente para los onclick del HTML
window.App = App