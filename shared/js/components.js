// Componentes reutilizables
import { optimizeImage } from './config.js';

export function renderProductCard(p, index = 0, businessConfig) {
    const isOferta = p.discount !== null;
    const inWishlist = window.App?.isInWishlist?.(p.id) || false;
    const delay = (index % 4) + 1;
    
    return `
        <div class="card animate-in delay-${delay}" onclick="window.App.openProduct(${p.id})">
            <div class="card-img">
                <button class="btn-wishlist ${inWishlist ? 'active' : ''}" data-id="${p.id}" onclick="event.stopPropagation(); window.App.toggleWishlist(${p.id})" aria-label="Guardar en favoritos">
                    <i class="${inWishlist ? 'fas' : 'far'} fa-heart"></i>
                </button>
                ${isOferta ? `<span class="card-badge">-${p.discount}%</span>` : ''}
                <span class="card-sku-badge">${p.sku}</span>
                <img data-src="${optimizeImage(p.img)}" alt="${p.name}" loading="lazy" width="600">
            </div>
            <div class="card-body">
                <div class="card-title">${p.name}</div>
                <div class="card-category">${p.category}</div>
                <div class="card-prices">
                    ${isOferta && p.oldPrice ? `<span class="price-old">Bs ${p.oldPrice}</span>` : ''}
                    ${isOferta ? `<span class="price-new">Bs ${p.price}</span>` : '<span class="price-consult">Consultar</span>'}
                </div>
                <div class="card-actions">
                    <button class="btn-detalle" onclick="event.stopPropagation();window.App.openProduct(${p.id})">Detalle</button>
                    <button class="btn-wa-card" onclick="event.stopPropagation();window.App.whatsappConsult('${p.name}','${p.sku}')">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

export function renderCategoryCard(c, i) {
    return `
        <div class="cat-card animate-in delay-${(i % 4) + 1}" onclick="window.App.filter('${c.id}');window.App.go('shop');">
            <img data-src="${optimizeImage(c.img, 400)}" alt="${c.name}" width="400">
            <span>${c.name}</span>
        </div>
    `;
}