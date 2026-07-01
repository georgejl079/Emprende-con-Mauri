// Utilidades reutilizables
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

// Lazy Loading con IntersectionObserver
export const LazyLoader = {
    init() {
        if (!('IntersectionObserver' in window)) {
            document.querySelectorAll('img[data-src]').forEach(img => {
                img.src = img.dataset.src;
            });
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '200px 0px',
            threshold: 0.01
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            observer.observe(img);
        });
    },

    observeNew(container) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        }, { rootMargin: '200px 0px' });

        container.querySelectorAll('img[data-src]').forEach(img => {
            observer.observe(img);
        });
    }
};

// Animaciones de entrada
export const Animations = {
    init() {
        if (!('IntersectionObserver' in window)) {
            document.querySelectorAll('.animate-in').forEach(el => el.classList.add('visible'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        document.querySelectorAll('.animate-in').forEach(el => {
            observer.observe(el);
        });
    }
};

// Botón volver arriba
export const BackToTop = {
    init() {
        const btn = document.getElementById('backToTop');
        if (!btn) return;
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        });
    }
};

// Service Worker (PWA)
export function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        // Solo registrar en producción con HTTPS o localhost
        if (window.location.protocol === 'https:' || window.location.hostname === 'localhost') {
            window.addEventListener('load', () => {
                // Registrar desde la raíz, no como blob
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('✅ SW registered:', registration.scope)
                    })
                    .catch(error => {
                        console.log('❌ SW registration failed:', error)
                        // No hacer nada - el error es normal en algunos navegadores
                    })
            })
        }
    }
}

// ===== COMPRESIÓN DE IMÁGENES =====
async function compressImage(file, options = {}) {
    const {
        maxWidth = 1200,
        maxHeight = 1200,
        quality = 0.8,
        format = 'webp'
    } = options

    return new Promise((resolve, reject) => {
        const img = new Image()
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        img.onload = () => {
            try {
                // Calcular dimensiones manteniendo aspect ratio
                let { width, height } = img
                const ratio = Math.min(
                    maxWidth / width,
                    maxHeight / height
                )

                if (ratio < 1) {
                    width *= ratio
                    height *= ratio
                }

                canvas.width = width
                canvas.height = height

                // Dibujar imagen comprimida
                ctx.drawImage(img, 0, 0, width, height)

                // Convertir a formato especificado
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob)
                        } else {
                            reject(new Error('Error al comprimir imagen'))
                        }
                    },
                    `image/${format}`,
                    quality
                )
            } catch (error) {
                reject(error)
            }
        }

        img.onerror = () => reject(new Error('Error al cargar imagen'))
        img.src = URL.createObjectURL(file)
    })
}

// ===== CLIENTE R2 (Cloudflare) =====
let r2Client = null

export function initR2Client(config) {
    if (!config || !config.accountId || !config.accessKeyId || !config.secretAccessKey) {
        console.warn('⚠️ Credenciales R2 no configuradas')
        return null
    }

    r2Client = new S3Client({
        region: 'auto',
        endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey
        }
    })

    return r2Client
}

// ===== SUBIR IMAGEN OPTIMIZADA A R2 =====
export async function uploadOptimizedImage(file, filename, options = {}) {
    if (!r2Client) {
        throw new Error('Cliente R2 no inicializado. Configura credenciales primero.')
    }

    const {
        maxWidth = 1200,
        maxHeight = 1200,
        quality = 0.8,
        format = 'webp',
        bucket = 'mochilas-images'
    } = options

    try {
        // 1. Comprimir imagen
        console.log(`📦 Comprimiendo ${filename}...`)
        const compressed = await compressImage(file, {
            maxWidth,
            maxHeight,
            quality,
            format
        })

        const originalSize = file.size
        const compressedSize = compressed.size
        const savings = ((1 - compressedSize / originalSize) * 100).toFixed(1)

        console.log(`✅ Compresión: ${(originalSize / 1024).toFixed(1)}KB → ${(compressedSize / 1024).toFixed(1)}KB (${savings}% ahorro)`)

        // 2. Generar nombre de archivo con extensión correcta
        const baseName = filename.replace(/\.[^/.]+$/, '')
        const finalFilename = `${baseName}.${format}`

        // 3. Subir a R2
        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: finalFilename,
            Body: compressed,
            ContentType: `image/${format}`,
            CacheControl: 'public, max-age=31536000' // 1 año cache
        })

        await r2Client.send(command)
        console.log(`☁️ Subido a R2: ${finalFilename}`)

        // 4. Retornar URL pública (configurar tu dominio CDN)
        return `https://cdn.tuweb.com/${finalFilename}`
    } catch (error) {
        console.error('❌ Error al subir imagen:', error)
        throw error
    }
}

// ===== SUBIR MÚLTIPLES IMÁGENES OPTIMIZADAS =====
export async function uploadMultipleOptimizedImages(files, prefix = '') {
    const uploadedUrls = []

    for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const timestamp = Date.now()
        const filename = prefix ? `${prefix}_${timestamp}_${i}_${file.name}` : `${timestamp}_${i}_${file.name}`

        try {
            const url = await uploadOptimizedImage(file, filename)
            uploadedUrls.push(url)
        } catch (error) {
            console.error(`Error al subir ${file.name}:`, error)
            // Continuar con las demás imágenes
        }
    }

    return uploadedUrls
}