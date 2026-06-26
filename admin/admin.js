// Panel Admin - RUTA Platform

// Datos locales (después vendrán de Supabase)
let businesses = [
    {
        id: 1,
        name: 'RUTA Importadora',
        whatsapp: '59175179990',
        email: 'ventas@rutabolivia.com',
        domain: 'rutabolivia.com',
        colors: { primary: '#1a1a1a', accent: '#d97706' },
        status: 'active'
    }
];

let products = [
    {
        id: 1,
        business_id: 1,
        sku: 'RUT-ESC-001',
        name: 'Mochila Escolar Urban Pro',
        category: 'escolar',
        price: 180,
        discount: null,
        description: 'Mochila escolar de alta resistencia',
        images: ['https://images.unsplash.com/photo-1580087256394-dc596e1c8f4f?w=600'],
        status: 'published'
    },
    {
        id: 2,
        business_id: 1,
        sku: 'RUT-VIA-003',
        name: 'Mochila Viaje Explorer 45L',
        category: 'viaje',
        price: 380,
        discount: 20,
        description: 'Mochila de viaje de 45 litros',
        images: ['https://images.unsplash.com/photo-1622260614153-03223fb72052?w=600'],
        status: 'published'
    }
];

let categories = [
    { id: 1, business_id: 1, name: 'Escolar', slug: 'escolar' },
    { id: 2, business_id: 1, name: 'Viaje', slug: 'viaje' },
    { id: 3, business_id: 1, name: 'Deportiva', slug: 'deportiva' },
    { id: 4, business_id: 1, name: 'Ejecutiva', slug: 'ejecutiva' }
];

let orders = [];

// Estado de la aplicación
const state = {
    currentSection: 'dashboard',
    editingBusiness: null,
    editingProduct: null,
    uploadedImages: []
};

// Admin Object
export const Admin = {
    init() {
        this.checkAuth();
        this.setupNavigation();
        this.setupUpload();
        this.renderDashboard();
    },

    // Autenticación
    checkAuth() {
        const isLoggedIn = localStorage.getItem('admin_logged_in') === 'true';
        if (isLoggedIn) {
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('adminLayout').classList.add('active');
        } else {
            document.getElementById('loginScreen').style.display = 'flex';
            document.getElementById('adminLayout').classList.remove('active');
        }

        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            // Credenciales demo (reemplazar con Supabase Auth)
            if (email === 'admin@rutabolivia.com' && password === 'admin123') {
                localStorage.setItem('admin_logged_in', 'true');
                this.init();
            } else {
                alert('Credenciales incorrectas');
            }
        });
    },

    logout() {
        localStorage.removeItem('admin_logged_in');
        location.reload();
    },

    // Navegación
    setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.section;
                this.switchSection(section);
            });
        });
    },

    switchSection(section) {
        state.currentSection = section;
        
        // Actualizar nav activa
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.section === section);
        });

        // Mostrar sección correspondiente
        document.querySelectorAll('main section').forEach(sec => {
            sec.style.display = 'none';
        });
        document.getElementById(`${section}Section`).style.display = 'block';

        // Renderizar datos
        this.renderSection(section);
    },

    renderSection(section) {
        switch(section) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'businesses':
                this.renderBusinesses();
                break;
            case 'products':
                this.renderProducts();
                break;
            case 'categories':
                this.renderCategories();
                break;
            case 'orders':
                this.renderOrders();
                break;
        }
    },

    // Dashboard
    renderDashboard() {
        document.getElementById('statBusinesses').textContent = businesses.length;
        document.getElementById('statProducts').textContent = products.length;
        document.getElementById('statCategories').textContent = categories.length;
        document.getElementById('statOrders').textContent = orders.length;
    },

    // Negocios
    renderBusinesses() {
        const tbody = document.getElementById('businessesTable');
        tbody.innerHTML = businesses.map(b => `
            <tr>
                <td>${b.id}</td>
                <td><strong>${b.name}</strong></td>
                <td>${b.whatsapp}</td>
                <td>${b.domain || '-'}</td>
                <td><span class="badge badge-success">Activo</span></td>
                <td>
                    <button class="action-btn btn-edit" onclick="Admin.editBusiness(${b.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="action-btn btn-delete" onclick="Admin.deleteBusiness(${b.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </td>
            </tr>
        `).join('');
    },

    openBusinessModal(business = null) {
        state.editingBusiness = business;
        document.getElementById('businessModalTitle').textContent = business ? 'Editar Negocio' : 'Nuevo Negocio';
        
        if (business) {
            document.getElementById('businessName').value = business.name;
            document.getElementById('businessWhatsapp').value = business.whatsapp;
            document.getElementById('businessEmail').value = business.email;
            document.getElementById('businessDomain').value = business.domain || '';
            document.getElementById('businessColorPrimary').value = business.colors.primary;
            document.getElementById('businessColorAccent').value = business.colors.accent;
        } else {
            document.getElementById('businessForm').reset();
        }
        
        document.getElementById('businessModal').classList.add('active');
    },

    closeBusinessModal() {
        document.getElementById('businessModal').classList.remove('active');
        state.editingBusiness = null;
    },

    saveBusiness() {
        const businessData = {
            name: document.getElementById('businessName').value,
            whatsapp: document.getElementById('businessWhatsapp').value,
            email: document.getElementById('businessEmail').value,
            domain: document.getElementById('businessDomain').value,
            colors: {
                primary: document.getElementById('businessColorPrimary').value,
                accent: document.getElementById('businessColorAccent').value
            },
            status: 'active'
        };

        if (state.editingBusiness) {
            // Editar
            const index = businesses.findIndex(b => b.id === state.editingBusiness.id);
            businesses[index] = { ...state.editingBusiness, ...businessData };
        } else {
            // Crear
            const newId = Math.max(...businesses.map(b => b.id), 0) + 1;
            businesses.push({ id: newId, ...businessData });
        }

        this.closeBusinessModal();
        this.renderBusinesses();
        this.renderDashboard();
        alert('Negocio guardado exitosamente');
    },

    editBusiness(id) {
        const business = businesses.find(b => b.id === id);
        if (business) {
            this.openBusinessModal(business);
        }
    },

    deleteBusiness(id) {
        if (confirm('¿Estás seguro de eliminar este negocio?')) {
            businesses = businesses.filter(b => b.id !== id);
            this.renderBusinesses();
            this.renderDashboard();
        }
    },

    // Productos
    renderProducts() {
        const tbody = document.getElementById('productsTable');
        tbody.innerHTML = products.map(p => {
            const business = businesses.find(b => b.id === p.business_id);
            return `
                <tr>
                    <td><img src="${p.images[0]}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;"></td>
                    <td><strong>${p.name}</strong></td>
                    <td>${p.sku}</td>
                    <td>Bs. ${p.price}${p.discount ? ` <span class="badge badge-danger">-${p.discount}%</span>` : ''}</td>
                    <td>${business?.name || '-'}</td>
                    <td><span class="badge badge-success">Publicado</span></td>
                    <td>
                        <button class="action-btn btn-edit" onclick="Admin.editProduct(${p.id})">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="action-btn btn-delete" onclick="Admin.deleteProduct(${p.id})">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    openProductModal(product = null) {
        state.editingProduct = product;
        state.uploadedImages = product ? [...product.images] : [];
        
        document.getElementById('productModalTitle').textContent = product ? 'Editar Producto' : 'Nuevo Producto';
        
        // Llenar select de negocios
        const businessSelect = document.getElementById('productBusiness');
        businessSelect.innerHTML = '<option value="">Seleccionar negocio...</option>' +
            businesses.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
        
        // Llenar select de categorías
        const categorySelect = document.getElementById('productCategory');
        categorySelect.innerHTML = '<option value="">Seleccionar categoría...</option>' +
            categories.map(c => `<option value="${c.slug}">${c.name}</option>`).join('');
        
        if (product) {
            document.getElementById('productBusiness').value = product.business_id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productSku').value = product.sku;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productDiscount').value = product.discount || 0;
            document.getElementById('productDescription').value = product.description;
            this.renderImagePreview();
        } else {
            document.getElementById('productForm').reset();
            document.getElementById('imagePreview').innerHTML = '';
        }
        
        document.getElementById('productModal').classList.add('active');
    },

    closeProductModal() {
        document.getElementById('productModal').classList.remove('active');
        state.editingProduct = null;
        state.uploadedImages = [];
    },

    saveProduct() {
        const productData = {
            business_id: parseInt(document.getElementById('productBusiness').value),
            name: document.getElementById('productName').value,
            sku: document.getElementById('productSku').value,
            category: document.getElementById('productCategory').value,
            price: parseFloat(document.getElementById('productPrice').value),
            discount: parseInt(document.getElementById('productDiscount').value) || null,
            description: document.getElementById('productDescription').value,
            images: state.uploadedImages,
            status: 'published'
        };

        if (state.editingProduct) {
            const index = products.findIndex(p => p.id === state.editingProduct.id);
            products[index] = { ...state.editingProduct, ...productData };
        } else {
            const newId = Math.max(...products.map(p => p.id), 0) + 1;
            products.push({ id: newId, ...productData });
        }

        this.closeProductModal();
        this.renderProducts();
        this.renderDashboard();
        alert('Producto guardado exitosamente');
    },

    editProduct(id) {
        const product = products.find(p => p.id === id);
        if (product) {
            this.openProductModal(product);
        }
    },

    deleteProduct(id) {
        if (confirm('¿Estás seguro de eliminar este producto?')) {
            products = products.filter(p => p.id !== id);
            this.renderProducts();
            this.renderDashboard();
        }
    },

    // Upload de imágenes
    setupUpload() {
        const uploadZone = document.getElementById('uploadZone');
        const fileInput = document.getElementById('fileInput');
        
        uploadZone.addEventListener('click', () => fileInput.click());
        
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = '#d97706';
            uploadZone.style.background = '#fffbeb';
        });
        
        uploadZone.addEventListener('dragleave', () => {
            uploadZone.style.borderColor = '#e5e7eb';
            uploadZone.style.background = '';
        });
        
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = '#e5e7eb';
            uploadZone.style.background = '';
            this.handleFiles(e.dataTransfer.files);
        });
        
        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });
    },

    handleFiles(files) {
        Array.from(files).forEach(file => {
            if (file.size > 5 * 1024 * 1024) {
                alert(`${file.name} es muy grande (máximo 5MB)`);
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                state.uploadedImages.push(e.target.result);
                this.renderImagePreview();
            };
            reader.readAsDataURL(file);
        });
    },

    renderImagePreview() {
        const preview = document.getElementById('imagePreview');
        preview.innerHTML = state.uploadedImages.map((img, i) => `
            <div class="preview-item">
                <img src="${img}" alt="Preview">
                <button class="preview-remove" onclick="Admin.removeImage(${i})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    },

    removeImage(index) {
        state.uploadedImages.splice(index, 1);
        this.renderImagePreview();
    },

    // Categorías
    renderCategories() {
        const tbody = document.getElementById('categoriesTable');
        tbody.innerHTML = categories.map(c => {
            const business = businesses.find(b => b.id === c.business_id);
            const productCount = products.filter(p => p.category === c.slug).length;
            return `
                <tr>
                    <td>${c.id}</td>
                    <td><strong>${c.name}</strong></td>
                    <td>${business?.name || '-'}</td>
                    <td>${productCount}</td>
                    <td>
                        <button class="action-btn btn-edit" onclick="Admin.editCategory(${c.id})">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="action-btn btn-delete" onclick="Admin.deleteCategory(${c.id})">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    openCategoryModal(category = null) {
        // Similar a business modal
        alert('Modal de categoría (implementar similar a negocio)');
    },

    editCategory(id) {
        const category = categories.find(c => c.id === id);
        if (category) {
            this.openCategoryModal(category);
        }
    },

    deleteCategory(id) {
        if (confirm('¿Estás seguro de eliminar esta categoría?')) {
            categories = categories.filter(c => c.id !== id);
            this.renderCategories();
        }
    },

    // Pedidos
    renderOrders() {
        const tbody = document.getElementById('ordersTable');
        if (orders.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center;padding:40px;color:#9a9a9a;">
                        No hay pedidos registrados
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = orders.map(o => `
                <tr>
                    <td>${o.id}</td>
                    <td>${o.customer}</td>
                    <td>${o.products}</td>
                    <td>Bs. ${o.total}</td>
                    <td>${o.date}</td>
                    <td><span class="badge badge-warning">Pendiente</span></td>
                </tr>
            `).join('');
        }
    }
};

// Exponer Admin globalmente
window.Admin = Admin;

// Inicializar
document.addEventListener('DOMContentLoaded', () => Admin.init());