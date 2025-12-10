// ===== Main Application Controller =====
class MyronDeluxeApp {
    constructor() {
        this.currentSection = 'home';
        this.isMobile = window.innerWidth < 768;
        this.isDarkMode = false;
        this.init();
    }

    async init() {
        try {
            // Initialize components
            await this.initLoader();
            this.initNavigation();
            this.initTheme();
            this.initPathSelection();
            this.initFilters();
            this.initGallery();
            this.initForms();
            this.initScrollEffects();
            this.initModals();
            this.initParticles();
            this.initAnalytics();
            
            // Mark app as ready
            document.body.classList.add('app-ready');
            
            // Performance monitoring
            this.logPerformance();
            
            // Debug logging
            console.log('MYRON DE LUXE App initialized successfully');
            
        } catch (error) {
            console.error('App initialization failed:', error);
            this.showError('Failed to initialize application');
        }
    }

    // ===== Loader =====
    async initLoader() {
        return new Promise((resolve) => {
            const loader = document.getElementById('loader');
            const progressBar = document.querySelector('.progress-bar');
            
            if (!loader || !progressBar) {
                console.warn('Loader elements not found, skipping loader');
                resolve();
                return;
            }
            
            // Simulate loading progress
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 20;
                progressBar.style.width = `${Math.min(progress, 100)}%`;
                
                if (progress >= 100) {
                    clearInterval(interval);
                    
                    // Add fade out animation
                    loader.classList.add('loaded');
                    
                    // Remove from DOM after animation
                    setTimeout(() => {
                        loader.style.display = 'none';
                        resolve();
                    }, 500);
                }
            }, 100);
        });
    }

    // ===== Navigation =====
    initNavigation() {
        // Mobile menu toggle
        const navToggle = document.getElementById('navToggle');
        const mobileMenu = document.getElementById('mobileMenu');
        
        if (navToggle && mobileMenu) {
            navToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                navToggle.classList.toggle('active');
                mobileMenu.classList.toggle('active');
                document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
            });

            // Close mobile menu on link click
            document.querySelectorAll('.mobile-nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    navToggle.classList.remove('active');
                    mobileMenu.classList.remove('active');
                    document.body.style.overflow = '';
                });
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!mobileMenu.contains(e.target) && !navToggle.contains(e.target) && mobileMenu.classList.contains('active')) {
                    navToggle.classList.remove('active');
                    mobileMenu.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }

        // Smooth scrolling for navigation
        document.querySelectorAll('[data-scroll]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.dataset.scroll;
                this.scrollToSection(targetId);
            });
        });

        // Back to top button
        const backToTop = document.getElementById('backToTop');
        if (backToTop) {
            window.addEventListener('scroll', () => {
                backToTop.classList.toggle('visible', window.scrollY > 500);
            });

            backToTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // Navbar scroll effect
        const navbar = document.getElementById('navbar');
        if (navbar) {
            window.addEventListener('scroll', () => {
                navbar.classList.toggle('scrolled', window.scrollY > 50);
            });
        }
    }

    // ===== Theme Management =====
    initTheme() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;
        
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Load saved theme or use system preference
        const savedTheme = localStorage.getItem('theme');
        this.isDarkMode = savedTheme === 'dark' || (!savedTheme && prefersDark.matches);
        
        this.applyTheme();
        
        // Theme toggle
        themeToggle.addEventListener('click', () => {
            this.isDarkMode = !this.isDarkMode;
            this.applyTheme();
            localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
        });

        // Listen for system theme changes
        prefersDark.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.isDarkMode = e.matches;
                this.applyTheme();
            }
        });
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', 
            this.isDarkMode ? 'dark' : 'light'
        );
    }

    // ===== Path Selection =====
    initPathSelection() {
        const pathCards = document.querySelectorAll('.path-card');
        const pathButtons = document.querySelectorAll('.path-action-btn');

        pathCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.path-action-btn')) {
                    const path = card.dataset.path;
                    this.handlePathSelection(path);
                }
            });

            // Hover effects
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });

        pathButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = button.dataset.action;
                this.handlePathSelection(action);
            });
        });
    }

    handlePathSelection(path) {
        switch(path) {
            case 'fragrance':
                this.scrollToSection('fragrance');
                break;
            case 'tech':
                this.scrollToSection('tech');
                break;
        }
        
        // Track selection
        this.trackEvent('path_selection', { path });
    }

    // ===== Category Filters =====
    initFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const filterScroll = document.querySelector('.filter-scroll');
        const prevFilter = document.querySelector('.prev-filter');
        const nextFilter = document.querySelector('.next-filter');

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active state
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Filter products
                const category = btn.dataset.category;
                if (window.ProductManager) {
                    window.ProductManager.filterProducts(category);
                }
                
                // Track filter usage
                this.trackEvent('filter_products', { category });
            });
        });

        // Filter scroll controls
        if (prevFilter && nextFilter && filterScroll) {
            prevFilter.addEventListener('click', () => {
                filterScroll.scrollBy({ left: -200, behavior: 'smooth' });
            });

            nextFilter.addEventListener('click', () => {
                filterScroll.scrollBy({ left: 200, behavior: 'smooth' });
            });
        }
    }

    // ===== Gallery Management =====
    initGallery() {
        const prevBtn = document.querySelector('.prev-gallery');
        const nextBtn = document.querySelector('.next-gallery');
        const gallery = document.querySelector('.products-gallery');
        const currentSlide = document.querySelector('.current-slide');
        const totalSlides = document.querySelector('.total-slides');

        if (!gallery) return;

        let currentIndex = 0;
        const itemsPerView = this.getItemsPerView();
        const totalItems = gallery.children.length;
        const maxSlides = Math.ceil(totalItems / itemsPerView);

        // Update slide indicators
        if (totalSlides) totalSlides.textContent = maxSlides;
        this.updateSlideIndicator(currentIndex, maxSlides, currentSlide);

        // Gallery navigation
        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                currentIndex = Math.max(0, currentIndex - 1);
                this.scrollGallery(gallery, currentIndex, itemsPerView);
                this.updateSlideIndicator(currentIndex, maxSlides, currentSlide);
            });

            nextBtn.addEventListener('click', () => {
                currentIndex = Math.min(maxSlides - 1, currentIndex + 1);
                this.scrollGallery(gallery, currentIndex, itemsPerView);
                this.updateSlideIndicator(currentIndex, maxSlides, currentSlide);
            });
        }

        // Touch/swipe support for mobile
        let touchStartX = 0;
        let touchEndX = 0;

        gallery.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        gallery.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX, currentIndex, maxSlides);
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                currentIndex = Math.max(0, currentIndex - 1);
                this.scrollGallery(gallery, currentIndex, itemsPerView);
                this.updateSlideIndicator(currentIndex, maxSlides, currentSlide);
            } else if (e.key === 'ArrowRight') {
                currentIndex = Math.min(maxSlides - 1, currentIndex + 1);
                this.scrollGallery(gallery, currentIndex, itemsPerView);
                this.updateSlideIndicator(currentIndex, maxSlides, currentSlide);
            }
        });

        // Update on resize
        window.addEventListener('resize', () => {
            const newItemsPerView = this.getItemsPerView();
            if (newItemsPerView !== itemsPerView) {
                this.scrollGallery(gallery, currentIndex, newItemsPerView);
            }
        });
    }

    getItemsPerView() {
        if (window.innerWidth < 480) return 1;
        if (window.innerWidth < 768) return 2;
        if (window.innerWidth < 1024) return 3;
        return 4;
    }

    scrollGallery(gallery, index, itemsPerView) {
        if (!gallery.children.length) return;
        
        const itemWidth = gallery.children[0].offsetWidth + 32; // width + gap
        const scrollAmount = index * itemsPerView * itemWidth;
        gallery.scrollTo({ left: scrollAmount, behavior: 'smooth' });
    }

    updateSlideIndicator(current, max, element) {
        if (element) {
            element.textContent = current + 1;
        }
    }

    handleSwipe(startX, endX, currentIndex, maxSlides) {
        const threshold = 50;
        const diff = startX - endX;

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                // Swipe left
                currentIndex = Math.min(maxSlides - 1, currentIndex + 1);
            } else {
                // Swipe right
                currentIndex = Math.max(0, currentIndex - 1);
            }
            
            const gallery = document.querySelector('.products-gallery');
            const itemsPerView = this.getItemsPerView();
            this.scrollGallery(gallery, currentIndex, itemsPerView);
            
            const currentSlide = document.querySelector('.current-slide');
            this.updateSlideIndicator(currentIndex, maxSlides, currentSlide);
        }
    }

    // ===== Form Handling =====
    initForms() {
        console.log('Initializing forms...');
        
        // Main enquiry form
        const enquiryForm = document.getElementById('enquiryForm');
        if (enquiryForm) {
            console.log('Found enquiry form');
            
            // Simple direct handler
            enquiryForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Enquiry form submitted');
                this.handleEnquiryFormDirect();
            });
            
            // Also attach to submit button click
            const submitBtn = enquiryForm.querySelector('.submit-btn');
            if (submitBtn) {
                submitBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('Submit button clicked');
                    this.handleEnquiryFormDirect();
                });
            }
        } else {
            console.warn('Enquiry form not found!');
        }

        // Phone number formatting
        const phoneInput = document.getElementById('phoneNumber');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                this.formatPhoneNumber(e.target);
            });
        }
    }

    // Direct form handler - SIMPLE AND RELIABLE
    handleEnquiryFormDirect() {
        console.log('Direct form handler called');
        
        // Get form values directly
        const enquiryType = document.getElementById('enquiryType')?.value;
        const phoneNumber = document.getElementById('phoneNumber')?.value;
        const message = document.getElementById('message')?.value;
        
        console.log('Form values:', { enquiryType, phoneNumber, message });
        
        // Validate form
        if (!this.validateFormDirect(enquiryType, phoneNumber, message)) {
            return;
        }
        
        // Show loading state
        const submitBtn = document.querySelector('.submit-btn');
        if (submitBtn) {
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Opening WhatsApp...';
            submitBtn.disabled = true;
            
            // Process after a short delay
            setTimeout(() => {
                this.processEnquiry(enquiryType, phoneNumber, message);
                
                // Reset button
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }, 1500);
            }, 500);
        } else {
            this.processEnquiry(enquiryType, phoneNumber, message);
        }
    }
    
    validateFormDirect(enquiryType, phoneNumber, message) {
        const errors = [];
        
        if (!enquiryType) {
            errors.push('Please select a service type');
            this.showFormError('enquiryType', 'Please select a service type');
        }
        
        if (!phoneNumber || phoneNumber.trim() === '') {
            errors.push('Please enter your WhatsApp number');
            this.showFormError('phoneNumber', 'Please enter your WhatsApp number');
        } else if (phoneNumber.replace(/\D/g, '').length < 10) {
            errors.push('Please enter a valid phone number (at least 10 digits)');
            this.showFormError('phoneNumber', 'Please enter a valid phone number');
        }
        
        if (!message || message.trim().length < 10) {
            errors.push('Please enter a detailed message (at least 10 characters)');
            this.showFormError('message', 'Please provide more details');
        }
        
        if (errors.length > 0) {
            this.showNotification(errors[0], 'error');
            return false;
        }
        
        return true;
    }
    
    processEnquiry(enquiryType, phoneNumber, message) {
        // Determine WhatsApp number
        const whatsappNumber = enquiryType === 'fragrance' ? '0550427241' : '0208807036';
        
        // Service names mapping
        const serviceNames = {
            'fragrance': 'Fragrance Products',
            'computer': 'Computer Applications in Business',
            'web': 'Web Development',
            'hardware': 'Hardware Systems',
            'database': 'Database Management'
        };
        
        // Create WhatsApp message
        const whatsappMessage = `Hello MYRON DE LUXE,

I would like to enquire about: ${serviceNames[enquiryType] || 'General Enquiry'}

My WhatsApp number: ${phoneNumber}

Message: ${message}

Best regards.`;
        
        // Encode for URL
        const encodedMessage = encodeURIComponent(whatsappMessage);
        const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        
        console.log('Opening WhatsApp link:', whatsappLink);
        
        // Open WhatsApp in new tab
        window.open(whatsappLink, '_blank');
        
        // Track event
        this.trackEvent('enquiry_submitted', {
            service_type: enquiryType
        });
        
        // Show success message
        this.showNotification('WhatsApp opened! Please send the message to complete your enquiry.', 'success');
        
        // Clear form after successful submission
        setTimeout(() => {
            const enquiryForm = document.getElementById('enquiryForm');
            if (enquiryForm) {
                enquiryForm.reset();
            }
        }, 1000);
    }
    
    showFormError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        
        // Remove existing error
        const existingError = field.parentElement.querySelector('.form-error');
        if (existingError) existingError.remove();
        
        // Add error styling
        field.classList.add('error');
        
        // Create error message
        const errorElement = document.createElement('div');
        errorElement.className = 'form-error';
        errorElement.textContent = message;
        
        field.parentElement.appendChild(errorElement);
        
        // Remove error on input
        field.addEventListener('input', () => {
            field.classList.remove('error');
            if (errorElement.parentElement) {
                errorElement.remove();
            }
        }, { once: true });
    }

    formatPhoneNumber(input) {
        let value = input.value.replace(/\D/g, '');
        
        if (value.length > 0) {
            // Add Ghana country code if missing
            if (!value.startsWith('233') && value.length <= 9) {
                value = '233' + value;
            }
            
            // Format: +233 XX XXX XXXX
            if (value.length > 3) {
                const countryCode = value.substring(0, 3);
                const rest = value.substring(3);
                let formatted = `+${countryCode}`;
                
                if (rest.length > 0) {
                    formatted += ` ${rest.substring(0, 2)}`;
                }
                if (rest.length > 2) {
                    formatted += ` ${rest.substring(2, 5)}`;
                }
                if (rest.length > 5) {
                    formatted += ` ${rest.substring(5, 9)}`;
                }
                
                input.value = formatted;
            } else {
                input.value = `+${value}`;
            }
        }
    }

    // ===== Scroll Effects =====
    initScrollEffects() {
        // Initialize AOS (Animate On Scroll)
        this.initAOS();
        
        // Section tracking
        const sections = document.querySelectorAll('section[id]');
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -20% 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    this.currentSection = sectionId;
                    
                    // Update active nav link
                    this.updateActiveNavLink(sectionId);
                    
                    // Track section view
                    this.trackEvent('section_view', { section: sectionId });
                }
            });
        }, observerOptions);

        sections.forEach(section => observer.observe(section));
    }

    initAOS() {
        // Simple AOS implementation
        const elements = document.querySelectorAll('[data-aos]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.aosDelay || 0;
                    
                    setTimeout(() => {
                        entry.target.classList.add('aos-animate');
                    }, delay);
                    
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });

        elements.forEach(el => observer.observe(el));
    }

    updateActiveNavLink(sectionId) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.scroll === sectionId) {
                link.classList.add('active');
            }
        });
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const offset = 70; // Navbar height
            const targetPosition = section.offsetTop - offset;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    // ===== Modal Management =====
    initModals() {
        const modal = document.getElementById('productModal');
        const modalClose = document.getElementById('modalClose');
        
        if (modal && modalClose) {
            // Close modal
            modalClose.addEventListener('click', () => {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            });

            // Close on background click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });

            // Close on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.classList.contains('active')) {
                    modal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }

        // Privacy and Terms modals
        const privacyModal = document.getElementById('privacyModal');
        const termsModal = document.getElementById('termsModal');
        
        if (privacyModal) {
            privacyModal.addEventListener('click', (e) => {
                e.preventDefault();
                this.showModal('Privacy Policy', this.getPrivacyPolicyContent());
            });
        }
        
        if (termsModal) {
            termsModal.addEventListener('click', (e) => {
                e.preventDefault();
                this.showModal('Terms of Service', this.getTermsContent());
            });
        }
    }

    showModal(title, content) {
        const modal = document.getElementById('productModal');
        const modalBody = document.getElementById('modalBody');
        
        if (modal && modalBody) {
            modalBody.innerHTML = `
                <div class="modal-header">
                    <h3>${title}</h3>
                </div>
                <div class="modal-content">
                    ${content}
                </div>
            `;
            
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    getPrivacyPolicyContent() {
        return `
            <h4>Data Collection</h4>
            <p>We only collect information you provide directly through our enquiry form.</p>
            
            <h4>WhatsApp Communication</h4>
            <p>All communications are handled via WhatsApp. Your phone number is only used to contact you regarding your enquiry.</p>
            
            <h4>Data Security</h4>
            <p>We don't store personal information on our servers. All data is processed client-side.</p>
        `;
    }

    getTermsContent() {
        return `
            <h4>Service Agreement</h4>
            <p>All orders and services are handled via WhatsApp. We require confirmation before processing any orders.</p>
            
            <h4>Delivery Policy</h4>
            <p>Nationwide delivery available. Delivery times vary by location.</p>
            
            <h4>Payment Terms</h4>
            <p>Payments are arranged directly via WhatsApp. We accept mobile money and bank transfers.</p>
        `;
    }

    // ===== Particles Background =====
    initParticles() {
        const particlesContainer = document.getElementById('particles');
        if (!particlesContainer) return;

        const particleCount = 30;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random properties
            const size = Math.random() * 3 + 1;
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const duration = Math.random() * 15 + 5;
            const delay = Math.random() * 5;
            
            // Apply styles
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${x}%`;
            particle.style.top = `${y}%`;
            particle.style.background = `var(--primary)`;
            particle.style.opacity = Math.random() * 0.3 + 0.1;
            particle.style.borderRadius = '50%';
            particle.style.position = 'absolute';
            particle.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;
            
            particlesContainer.appendChild(particle);
        }
    }

    // ===== Analytics =====
    initAnalytics() {
        // Basic analytics tracking
        window.addEventListener('load', () => {
            this.trackEvent('page_view', {
                url: window.location.href,
                referrer: document.referrer,
                timestamp: new Date().toISOString()
            });
        });

        // Track outbound WhatsApp clicks
        document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const url = e.currentTarget.href;
                const type = url.includes('0550427241') ? 'fragrance' : 'tech';
                
                this.trackEvent('whatsapp_click', {
                    type: type,
                    url: url
                });
            });
        });
    }

    trackEvent(eventName, data = {}) {
        // In production, integrate with Google Analytics, Facebook Pixel, etc.
        console.log(`[Analytics] ${eventName}:`, {
            ...data,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            platform: navigator.platform
        });

        // Example: Send to backend
        // fetch('/api/analytics', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ event: eventName, data })
        // });
    }

    // ===== Performance Monitoring =====
    logPerformance() {
        if ('performance' in window) {
            const perfData = window.performance.timing;
            const loadTime = perfData.loadEventEnd - perfData.navigationStart;
            
            console.log(`Page loaded in ${loadTime}ms`);
            
            // Track performance metrics
            this.trackEvent('performance_metrics', {
                load_time: loadTime,
                dom_ready: perfData.domContentLoadedEventEnd - perfData.navigationStart,
                first_paint: performance.getEntriesByType('paint')[0]?.startTime || 0
            });
        }
    }

    // ===== Utility Methods =====
    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        if (!notification) {
            // Create notification element if it doesn't exist
            const notificationEl = document.createElement('div');
            notificationEl.id = 'notification';
            notificationEl.className = 'notification';
            document.body.appendChild(notificationEl);
        }
        
        const notificationElement = document.getElementById('notification');
        notificationElement.textContent = message;
        notificationElement.className = `notification ${type}`;
        
        // Show
        notificationElement.classList.add('show');
        
        // Auto hide
        setTimeout(() => {
            notificationElement.classList.remove('show');
        }, 3000);
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// ===== Product Manager =====
class ProductManager {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.services = [];
        this.currentCategory = 'all';
        this.init();
    }

    async init() {
        try {
            await this.loadProducts();
            await this.loadServices();
            this.renderProducts();
            this.renderServices();
            console.log('ProductManager initialized successfully');
        } catch (error) {
            console.error('ProductManager initialization failed:', error);
            this.loadSampleData();
        }
    }

    async loadProducts() {
        try {
            const response = await fetch('data/products.json');
            if (!response.ok) throw new Error('Failed to load products');
            
            const data = await response.json();
            this.products = data.products || [];
            this.filteredProducts = [...this.products];
            
            // Update product count
            this.updateProductCount();
            
        } catch (error) {
            console.error('Error loading products:', error);
            throw error;
        }
    }

    async loadServices() {
        try {
            const response = await fetch('data/services.json');
            if (!response.ok) throw new Error('Failed to load services');
            
            const data = await response.json();
            this.services = data.services || [];
            
        } catch (error) {
            console.error('Error loading services:', error);
            throw error;
        }
    }

    loadSampleData() {
        // Sample product data
        this.products = [
            {
                id: 1,
                name: "VARNESA Perfume",
                description: "A fresh floral scent with notes of jasmine and citrus",
                category: "unisex",
                image: "images/WhatsApp Image 2025-12-10 at 2.58.46 PM.jpeg",
                featured: true
            },
            {
                id: 2,
                name: "MATELOT Perfume",
                description: "Rich oriental fragrance",
                category: "unisex",
                image: "images/WhatsApp Image 2025-12-10 at 2.58.58 PM.jpeg",
                featured: true
            },
            {
                id: 3,
                name: "VEYES Diffuser",
                description: "Refresh your space with coastal air scent",
                category: "diffusers",
                image: "images/WhatsApp Image 2025-12-10 at 2.59.33 PM (1).jpeg",
                featured: false
            },
            {
                id: 4,
                name: "LORIS parfum",
                description: "Pure essential for personal fragrance",
                category: "diffusers",
                image: "images/WhatsApp Image 2025-12-10 at 2.59.33 PM.jpeg",
                featured: false
            },
            {
                id: 5,
                name: "ONIRO PERFUME",
                description: "Moisturizing cream with calming lavender scent",
                category: "unisex",
                image: "images/WhatsApp Image 2025-12-10 at 2.59.29 PM.jpeg",
                featured: false
            },
            {
                id: 6,
                name: "ENERGETIC MEN",
                description: "Long-lasting perfume",
                category: "unisex",
                image: "images/WhatsApp Image 2025-12-10 at 2.59.26 PM (1).jpeg",
                featured: true
            },
            {
                id: 7,
                name: "OPHYLIA",
                description: "Premium perfume bottle",
                category: "unisex",
                image: "images/WhatsApp Image 2025-12-10 at 2.59.28 PM.jpeg",
                featured: false
            }
        ];
        
        this.filteredProducts = [...this.products];
        
        // Sample services
        this.services = [
            {
                id: 1,
                name: "Computer Application in Business",
                description: "Microsoft Office licence and setup. Word, Excel, PowerPoint support and training.",
                icon: "fas fa-laptop-code",
                features: ["Licensing", "Setup", "Training", "Support"]
            },
            {
                id: 2,
                name: "Web Development",
                description: "Front-end and full stack projects. Custom websites and web applications.",
                icon: "fas fa-code",
                features: ["Frontend", "Backend", "Responsive", "Modern"]
            },
            {
                id: 3,
                name: "Hardware Systems",
                description: "Windows repair, installation, and software setup for all hardware.",
                icon: "fas fa-tools",
                features: ["Repair", "Installation", "Setup", "Maintenance"]
            },
            {
                id: 4,
                name: "Database Management",
                description: "SQL and PostgreSQL database design, implementation, and support.",
                icon: "fas fa-database",
                features: ["Design", "Implementation", "Support", "Optimization"]
            }
        ];
        
        this.updateProductCount();
        this.renderProducts();
        this.renderServices();
    }

    filterProducts(category) {
        this.currentCategory = category;
        
        if (category === 'all') {
            this.filteredProducts = [...this.products];
        } else {
            this.filteredProducts = this.products.filter(
                product => product.category === category
            );
        }
        
        this.renderProducts();
        this.updateProductCount();
    }

    renderProducts() {
        const gallery = document.getElementById('fragranceGallery');
        if (!gallery) {
            console.warn('Fragrance gallery not found');
            return;
        }

        gallery.innerHTML = '';
        
        if (this.filteredProducts.length === 0) {
            gallery.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-box-open"></i>
                    <p>No products found in this category</p>
                </div>
            `;
            return;
        }
        
        this.filteredProducts.forEach(product => {
            const card = this.createProductCard(product);
            gallery.appendChild(card);
        });

        // Add animation classes
        setTimeout(() => {
            gallery.querySelectorAll('.product-card').forEach((card, index) => {
                card.style.animationDelay = `${index * 0.1}s`;
                card.classList.add('card-reveal');
            });
        }, 100);
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.category = product.category;
        card.dataset.id = product.id;

        const whatsappMessage = `Hi, I want to order: ${product.name}`;
        const encodedMessage = encodeURIComponent(whatsappMessage);
        const whatsappLink = `https://wa.me/0550427241?text=${encodedMessage}`;

        card.innerHTML = `
            <div class="product-image">
                <img 
                    src="${product.image}" 
                    alt="${product.name}" 
                    loading="lazy"
                    onerror="this.src='assets/images/placeholder.jpg'"
                >
                ${product.featured ? '<span class="product-badge">Featured</span>' : ''}
            </div>
            <div class="product-info">
                <h4 class="product-name">${product.name}</h4>
                <p class="product-description">${product.description}</p>
                <div class="product-actions">
                    <a href="${whatsappLink}" 
                       target="_blank" 
                       class="whatsapp-btn"
                       onclick="window.app?.trackEvent('product_order', { product: '${product.name.replace(/'/g, "\\'")}' })">
                        <i class="fab fa-whatsapp"></i>
                        Order on WhatsApp
                    </a>
                </div>
            </div>
        `;

        // Add click for quick view
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.whatsapp-btn')) {
                this.showProductDetail(product);
            }
        });

        return card;
    }

    renderServices() {
        const grid = document.getElementById('servicesGrid');
        if (!grid) {
            console.warn('Services grid not found');
            return;
        }

        grid.innerHTML = '';
        
        this.services.forEach(service => {
            const card = this.createServiceCard(service);
            grid.appendChild(card);
        });
    }

    createServiceCard(service) {
        const card = document.createElement('div');
        card.className = 'service-card';
        card.dataset.id = service.id;

        const whatsappMessage = `Hi, I need help with: ${service.name}`;
        const encodedMessage = encodeURIComponent(whatsappMessage);
        const whatsappLink = `https://wa.me/0208807036?text=${encodedMessage}`;

        card.innerHTML = `
            <div class="service-icon">
                <i class="${service.icon}"></i>
            </div>
            <h3 class="service-title">${service.name}</h3>
            <p class="service-description">${service.description}</p>
            ${service.features ? `
                <div class="service-features">
                    ${service.features.map(feature => 
                        `<span class="feature-tag">${feature}</span>`
                    ).join('')}
                </div>
            ` : ''}
            <a href="${whatsappLink}" 
               target="_blank" 
               class="tech-whatsapp-btn"
               onclick="window.app?.trackEvent('service_enquiry', { service: '${service.name.replace(/'/g, "\\'")}' })">
                <i class="fab fa-whatsapp"></i>
                WhatsApp
            </a>
        `;

        return card;
    }

    showProductDetail(product) {
        const modal = document.getElementById('productModal');
        const modalBody = document.getElementById('modalBody');
        
        if (modal && modalBody) {
            modalBody.innerHTML = `
                <div class="product-detail">
                    <div class="detail-image">
                        <img src="${product.image}" alt="${product.name}" onerror="this.src='assets/images/placeholder.jpg'">
                    </div>
                    <div class="detail-info">
                        <h3>${product.name}</h3>
                        <p class="detail-description">${product.description}</p>
                        <div class="detail-actions">
                            <a href="https://wa.me/0550427241?text=${encodeURIComponent(`Hi, I want to order: ${product.name}`)}" 
                               target="_blank" 
                               class="whatsapp-btn large">
                                <i class="fab fa-whatsapp"></i>
                                Order on WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            `;
            
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Track product view
            window.app?.trackEvent('product_view', { product: product.name });
        }
    }

    updateProductCount() {
        const countElement = document.getElementById('productCount');
        if (countElement) {
            const total = this.products.length;
            const filtered = this.filteredProducts.length;
            
            if (this.currentCategory === 'all') {
                countElement.textContent = `${total} Products`;
            } else {
                countElement.textContent = `${filtered} Products`;
            }
        }
    }
}

// ===== Initialize Application =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    
    // Initialize app
    try {
        window.app = new MyronDeluxeApp();
        console.log('Main app initialized');
    } catch (error) {
        console.error('Failed to initialize main app:', error);
    }
    
    // Initialize product manager
    try {
        window.ProductManager = new ProductManager();
        console.log('Product manager initialized');
    } catch (error) {
        console.error('Failed to initialize product manager:', error);
    }
    
    // Add to global scope for inline handlers
    window.MyronDeluxe = {
        app: window.app,
        products: window.ProductManager
    };
    
    // Service Worker Registration (if supported)
    if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registered:', registration);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    }
    
    console.log('All initialization complete');
});

// ===== Performance Optimizations =====
// Lazy load images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.1
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Preload critical resources
const preloadResources = () => {
    const resources = [
        '/assets/images/logo.svg',
        '/css/main.css'
    ];

    resources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = resource.endsWith('.js') ? 'script' : 
                  resource.endsWith('.css') ? 'style' : 'image';
        document.head.appendChild(link);
    });
};

// Execute preload
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preloadResources);
} else {
    preloadResources();
}

// ===== Global Helper Functions =====
// Global WhatsApp enquiry handler for inline onclick
function handleWhatsAppEnquiry() {
    if (window.app && typeof window.app.handleEnquiryFormDirect === 'function') {
        window.app.handleEnquiryFormDirect();
    } else {
        console.error('App not initialized');
        // Fallback direct handler
        const enquiryType = document.getElementById('enquiryType')?.value;
        const phoneNumber = document.getElementById('phoneNumber')?.value;
        const message = document.getElementById('message')?.value;
        
        if (!enquiryType || !phoneNumber || !message) {
            alert('Please fill in all fields');
            return false;
        }
        
        const whatsappNumber = enquiryType === 'fragrance' ? '0550427241' : '0208807036';
        const serviceNames = {
            'fragrance': 'Fragrance Products',
            'computer': 'Computer Applications in Business',
            'web': 'Web Development',
            'hardware': 'Hardware Systems',
            'database': 'Database Management'
        };
        
        const whatsappMessage = `Hello MYRON DE LUXE,

I would like to enquire about: ${serviceNames[enquiryType] || 'General Enquiry'}

My WhatsApp number: ${phoneNumber}

Message: ${message}

Best regards.`;
        
        const encodedMessage = encodeURIComponent(whatsappMessage);
        window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
        
        document.getElementById('enquiryForm')?.reset();
        
        setTimeout(() => {
            alert('WhatsApp opened! Please send the message.');
        }, 500);
    }
    return false;
}

// ===== Add CSS for form errors =====
const addFormErrorStyles = () => {
    if (!document.getElementById('form-error-styles')) {
        const style = document.createElement('style');
        style.id = 'form-error-styles';
        style.textContent = `
            .form-group input.error,
            .form-group select.error,
            .form-group textarea.error {
                border-color: #DC2626 !important;
                background-color: rgba(220, 38, 38, 0.05);
            }
            
            .form-error {
                color: #DC2626;
                font-size: 0.875rem;
                margin-top: 0.25rem;
                display: flex;
                align-items: center;
                gap: 0.25rem;
            }
            
            .form-error::before {
                content: "⚠";
                font-size: 0.875rem;
            }
            
            .submit-btn:disabled {
                opacity: 0.7;
                cursor: not-allowed;
            }
            
            .fa-spinner {
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            .no-products {
                grid-column: 1 / -1;
                text-align: center;
                padding: 3rem;
                color: var(--gray);
            }
            
            .no-products i {
                font-size: 3rem;
                margin-bottom: 1rem;
                opacity: 0.5;
            }
        `;
        document.head.appendChild(style);
    }
};

// Add styles when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addFormErrorStyles);
} else {
    addFormErrorStyles();
}