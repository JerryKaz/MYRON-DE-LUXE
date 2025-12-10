// ===== Admin Panel =====
class AdminPanel {
    constructor() {
        this.products = [];
        this.services = [];
        this.currentEditId = null;
        this.init();
    }

    async init() {
        if (!this.isAdminPage()) return;
        
        await this.loadData();
        this.initUI();
        this.setupEventListeners();
    }

    isAdminPage() {
        return window.location.pathname.includes('admin');
    }

    async loadData() {
        try {
            // Load products
            const productsResponse = await fetch('../data/products.json');
            this.products = (await productsResponse.json()).products;
            
            // Load services
            const servicesResponse = await fetch('../data/services.json');
            this.services = (await servicesResponse.json()).services;
            
        } catch (error) {
            console.error('Error loading admin data:', error);
        }
    }

    initUI() {
        this.renderProductTable();
        this.renderServiceTable();
        this.updateStats();
    }

    renderProductTable() {
        const table = document.getElementById('productsTable');
        if (!table) return;

        table.innerHTML = this.products.map(product => `
            <tr data-id="${product.id}">
                <td>
                    <img src="${product.image}" 
                         alt="${product.name}" 
                         class="admin-thumbnail"
                         onerror="this.src='../assets/images/placeholder.jpg'">
                </td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${product.featured ? 'Yes' : 'No'}</td>
                <td class="actions">
                    <button class="btn-edit" onclick="admin.editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="admin.deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    renderServiceTable() {
        const table = document.getElementById('servicesTable');
        if (!table) return;

        table.innerHTML = this.services.map(service => `
            <tr data-id="${service.id}">
                <td>
                    <i class="${service.icon} admin-icon"></i>
                </td>
                <td>${service.name}</td>
                <td>${service.description.substring(0, 50)}...</td>
                <td class="actions">
                    <button class="btn-edit" onclick="admin.editService(${service.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    updateStats() {
        const stats = {
            totalProducts: this.products.length,
            featuredProducts: this.products.filter(p => p.featured).length,
            totalServices: this.services.length,
            categories: [...new Set(this.products.map(p => p.category))]
        };

        // Update DOM elements
        document.getElementById('totalProducts').textContent = stats.totalProducts;
        document.getElementById('featuredProducts').textContent = stats.featuredProducts;
        document.getElementById('totalServices').textContent = stats.totalServices;
    }

    setupEventListeners() {
        // Product form
        const productForm = document.getElementById('productForm');
        if (productForm) {
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleProductForm();
            });
        }

        // Image upload
        const imageUpload = document.getElementById('productImage');
        if (imageUpload) {
            imageUpload.addEventListener('change', (e) => {
                this.handleImageUpload(e.target.files[0]);
            });
        }

        // Export buttons
        document.getElementById('exportProducts')?.addEventListener('click', () => {
            this.exportData('products');
        });

        document.getElementById('exportServices')?.addEventListener('click', () => {
            this.exportData('services');
        });

        // Import buttons
        document.getElementById('importProducts')?.addEventListener('change', (e) => {
            this.importData(e.target.files[0], 'products');
        });

        document.getElementById('importServices')?.addEventListener('change', (e) => {
            this.importData(e.target.files[0], 'services');
        });
    }

    handleProductForm() {
        const formData = new FormData(document.getElementById('productForm'));
        const data = Object.fromEntries(formData);
        
        // Process data
        const product = {
            id: this.currentEditId || this.getNextId(),
            name: data.name,
            description: data.description,
            category: data.category,
            featured: data.featured === 'on',
            image: data.imageUrl || '../assets/images/placeholder.jpg'
        };

        if (this.currentEditId) {
            // Update existing product
            const index = this.products.findIndex(p => p.id === this.currentEditId);
            if (index !== -1) {
                this.products[index] = product;
            }
        } else {
            // Add new product
            this.products.push(product);
        }

        // Save and update
        this.saveProducts();
        this.renderProductTable();
        this.updateStats();
        this.resetForm();

        // Show notification
        this.showNotification(
            `Product ${this.currentEditId ? 'updated' : 'added'} successfully!`,
            'success'
        );
    }

    editProduct(id) {
        const product = this.products.find(p => p.id === id);
        if (!product) return;

        this.currentEditId = id;
        
        // Fill form
        const form = document.getElementById('productForm');
        form.name.value = product.name;
        form.description.value = product.description;
        form.category.value = product.category;
        form.featured.checked = product.featured;
        form.imageUrl.value = product.image;

        // Scroll to form
        form.scrollIntoView({ behavior: 'smooth' });
    }

    deleteProduct(id) {
        if (!confirm('Are you sure you want to delete this product?')) return;

        this.products = this.products.filter(p => p.id !== id);
        this.saveProducts();
        this.renderProductTable();
        this.updateStats();

        this.showNotification('Product deleted successfully!', 'success');
    }

    editService(id) {
        const service = this.services.find(s => s.id === id);
        if (!service) return;

        // For services, we'll show a simple edit modal
        const newName = prompt('Enter new service name:', service.name);
        if (newName) {
            service.name = newName;
            this.saveServices();
            this.renderServiceTable();
            this.showNotification('Service updated!', 'success');
        }
    }

    async handleImageUpload(file) {
        if (!file) return;

        // In a real app, you would upload to a server
        // For demo, we'll create a local URL
        const reader = new FileReader();
        
        reader.onload = (e) => {
            document.getElementById('imagePreview').innerHTML = `
                <img src="${e.target.result}" alt="Preview">
            `;
            document.getElementById('productImageUrl').value = e.target.result;
        };

        reader.readAsDataURL(file);
    }

    saveProducts() {
        const data = {
            products: this.products
        };

        // In production, this would be a fetch to your API
        localStorage.setItem('myron_products_backup', JSON.stringify(data));
        
        // For demo, just log
        console.log('Products saved:', data);
    }

    saveServices() {
        const data = {
            services: this.services
        };

        localStorage.setItem('myron_services_backup', JSON.stringify(data));
        console.log('Services saved:', data);
    }

    exportData(type) {
        const data = type === 'products' ? 
            { products: this.products } : 
            { services: this.services };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `myron-${type}-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    async importData(file, type) {
        if (!file) return;

        const reader = new FileReader();
        
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (type === 'products' && data.products) {
                    this.products = [...this.products, ...data.products];
                    this.saveProducts();
                    this.renderProductTable();
                } else if (type === 'services' && data.services) {
                    this.services = [...this.services, ...data.services];
                    this.saveServices();
                    this.renderServiceTable();
                }
                
                this.updateStats();
                this.showNotification(`${type} imported successfully!`, 'success');
                
            } catch (error) {
                this.showNotification('Invalid file format', 'error');
            }
        };

        reader.readAsText(file);
    }

    resetForm() {
        this.currentEditId = null;
        const form = document.getElementById('productForm');
        if (form) form.reset();
        document.getElementById('imagePreview').innerHTML = '';
    }

    getNextId() {
        const maxId = Math.max(...this.products.map(p => p.id), 0);
        return maxId + 1;
    }

    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `admin-notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove after delay
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// ===== Initialize Admin Panel =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.admin = new AdminPanel();
    });
} else {
    window.admin = new AdminPanel();
}