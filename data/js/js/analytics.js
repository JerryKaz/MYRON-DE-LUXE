// ===== Analytics Module =====
class AnalyticsModule {
    constructor() {
        this.events = [];
        this.sessionId = this.generateSessionId();
        this.init();
    }

    init() {
        this.trackSessionStart();
        this.setupEventTracking();
        this.setupPerformanceTracking();
        this.setupErrorTracking();
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    trackSessionStart() {
        const sessionData = {
            session_id: this.sessionId,
            start_time: new Date().toISOString(),
            user_agent: navigator.userAgent,
            screen_resolution: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language,
            referrer: document.referrer
        };

        this.logEvent('session_start', sessionData);
    }

    setupEventTracking() {
        // Track clicks on important elements
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            // Track WhatsApp clicks
            if (target.closest('a[href*="wa.me"]')) {
                this.trackWhatsAppClick(target.closest('a'));
            }
            
            // Track product clicks
            if (target.closest('.product-card')) {
                const productCard = target.closest('.product-card');
                const productName = productCard.querySelector('.product-name')?.textContent;
                if (productName) {
                    this.logEvent('product_click', { product_name: productName });
                }
            }
            
            // Track service clicks
            if (target.closest('.service-card')) {
                const serviceCard = target.closest('.service-card');
                const serviceName = serviceCard.querySelector('.service-title')?.textContent;
                if (serviceName) {
                    this.logEvent('service_click', { service_name: serviceName });
                }
            }
            
            // Track form interactions
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
                this.logEvent('form_interaction', { field: target.name || target.id });
            }
        });

        // Track form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'enquiryForm') {
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData);
                
                // Remove sensitive data
                delete data.phoneNumber;
                delete data.message;
                
                this.logEvent('form_submit', {
                    form_id: e.target.id,
                    ...data
                });
            }
        });

        // Track scroll depth
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
            
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                
                // Log at intervals
                if (scrollPercent % 25 < 1) {
                    this.logEvent('scroll_depth', { depth: Math.floor(scrollPercent / 25) * 25 });
                }
            }
        });

        // Track time on page
        setInterval(() => {
            const timeOnPage = Math.floor((Date.now() - this.sessionStart) / 1000);
            if (timeOnPage % 30 === 0) {
                this.logEvent('time_on_page', { seconds: timeOnPage });
            }
        }, 30000);
    }

    setupPerformanceTracking() {
        // Track page load performance
        window.addEventListener('load', () => {
            if ('performance' in window) {
                const perfData = window.performance.timing;
                
                const metrics = {
                    dns_lookup: perfData.domainLookupEnd - perfData.domainLookupStart,
                    tcp_connect: perfData.connectEnd - perfData.connectStart,
                    ttfb: perfData.responseStart - perfData.requestStart,
                    dom_load: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                    page_load: perfData.loadEventEnd - perfData.navigationStart
                };

                this.logEvent('performance_metrics', metrics);
            }
        });

        // Track Core Web Vitals (simplified)
        if ('PerformanceObserver' in window) {
            try {
                // Track Largest Contentful Paint
                const lcpObserver = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    
                    this.logEvent('web_vital_lcp', {
                        value: lastEntry.startTime,
                        element: lastEntry.element?.tagName || 'unknown'
                    });
                });

                lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

                // Track First Input Delay
                const fidObserver = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    entries.forEach(entry => {
                        this.logEvent('web_vital_fid', {
                            value: entry.processingStart - entry.startTime,
                            name: entry.name
                        });
                    });
                });

                fidObserver.observe({ type: 'first-input', buffered: true });

            } catch (e) {
                console.warn('PerformanceObserver not supported:', e);
            }
        }
    }

    setupErrorTracking() {
        // Track JavaScript errors
        window.addEventListener('error', (e) => {
            this.logEvent('javascript_error', {
                message: e.message,
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno
            });
        });

        // Track unhandled promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            this.logEvent('promise_rejection', {
                reason: e.reason?.message || 'Unknown error'
            });
        });

        // Track resource loading errors
        document.addEventListener('error', (e) => {
            if (e.target.tagName === 'IMG') {
                this.logEvent('resource_error', {
                    type: 'image',
                    src: e.target.src
                });
            }
        }, true);
    }

    trackWhatsAppClick(link) {
        const url = link.href;
        const type = url.includes('0550427241') ? 'fragrance' : 'tech';
        const context = link.closest('.product-card') ? 'product' : 
                       link.closest('.service-card') ? 'service' : 
                       'general';

        this.logEvent('whatsapp_click', {
            type: type,
            context: context,
            url: url,
            text: link.textContent.trim()
        });
    }

    logEvent(eventName, data = {}) {
        const event = {
            event: eventName,
            data: data,
            timestamp: new Date().toISOString(),
            session_id: this.sessionId,
            page_url: window.location.href,
            user_id: this.getUserId()
        };

        // Add to local buffer
        this.events.push(event);

        // Send to analytics endpoint (simulated)
        this.sendToAnalytics(event);

        // Keep only last 100 events in memory
        if (this.events.length > 100) {
            this.events.shift();
        }

        // Log to console in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('[Analytics]', event);
        }
    }

    getUserId() {
        // Generate a persistent user ID
        let userId = localStorage.getItem('myron_user_id');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('myron_user_id', userId);
        }
        return userId;
    }

    async sendToAnalytics(event) {
        try {
            // In production, send to your analytics endpoint
            // Example using fetch:
            /*
            await fetch('/api/analytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(event)
            });
            */

            // For now, simulate network request
            setTimeout(() => {
                console.log('[Analytics Sent]', event.event);
            }, 100);

        } catch (error) {
            console.warn('Failed to send analytics:', error);
            
            // Store failed events for retry
            this.storeFailedEvent(event);
        }
    }

    storeFailedEvent(event) {
        const failedEvents = JSON.parse(localStorage.getItem('myron_failed_events') || '[]');
        failedEvents.push(event);
        localStorage.setItem('myron_failed_events', JSON.stringify(failedEvents.slice(-50)));
    }

    retryFailedEvents() {
        const failedEvents = JSON.parse(localStorage.getItem('myron_failed_events') || '[]');
        
        failedEvents.forEach(event => {
            this.sendToAnalytics(event);
        });
        
        localStorage.removeItem('myron_failed_events');
    }

    // Public API for manual event tracking
    track(eventName, data) {
        this.logEvent(eventName, data);
    }

    // Get analytics summary
    getSummary() {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        
        const todayEvents = this.events.filter(e => 
            e.timestamp.startsWith(today)
        );

        const summary = {
            total_events: this.events.length,
            today_events: todayEvents.length,
            session_id: this.sessionId,
            user_id: this.getUserId(),
            whatsapp_clicks: todayEvents.filter(e => e.event === 'whatsapp_click').length,
            product_clicks: todayEvents.filter(e => e.event === 'product_click').length,
            form_submissions: todayEvents.filter(e => e.event === 'form_submit').length
        };

        return summary;
    }
}

// ===== Initialize Analytics =====
document.addEventListener('DOMContentLoaded', () => {
    window.analytics = new AnalyticsModule();
    
    // Expose public methods
    window.trackEvent = (eventName, data) => {
        window.analytics?.track(eventName, data);
    };
});

// ===== Performance Monitoring =====
// Monitor memory usage
if ('memory' in performance) {
    setInterval(() => {
        const mem = performance.memory;
        console.log(`Memory: Used=${Math.round(mem.usedJSHeapSize / 1024 / 1024)}MB, Total=${Math.round(mem.totalJSHeapSize / 1024 / 1024)}MB`);
    }, 30000);
}

// Monitor network connectivity
window.addEventListener('online', () => {
    window.analytics?.logEvent('network_online');
    window.analytics?.retryFailedEvents();
});

window.addEventListener('offline', () => {
    window.analytics?.logEvent('network_offline');
});

// Monitor visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        window.analytics?.logEvent('page_hidden');
    } else {
        window.analytics?.logEvent('page_visible');
    }
});

// ===== Real-time Analytics Dashboard =====
// This would be a separate admin page that shows live analytics
class AnalyticsDashboard {
    constructor() {
        this.charts = {};
        this.init();
    }

    init() {
        if (!document.getElementById('analyticsDashboard')) return;
        
        this.loadData();
        this.initCharts();
        this.setupRealtimeUpdates();
    }

    async loadData() {
        // Load analytics data from server
        try {
            const response = await fetch('/api/analytics/summary');
            this.data = await response.json();
            this.updateDashboard();
        } catch (error) {
            console.error('Failed to load analytics data:', error);
        }
    }

    initCharts() {
        // Initialize charts using Chart.js or similar
        this.initTrafficChart();
        this.initConversionChart();
        this.initDeviceChart();
    }

    initTrafficChart() {
        // Traffic over time chart
        const ctx = document.getElementById('trafficChart')?.getContext('2d');
        if (!ctx) return;

        this.charts.traffic = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.getLast7Days(),
                datasets: [{
                    label: 'Visitors',
                    data: this.getTrafficData(),
                    borderColor: 'var(--primary)',
                    backgroundColor: 'rgba(var(--primary-rgb), 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    initConversionChart() {
        // Conversion funnel chart
        const ctx = document.getElementById('conversionChart')?.getContext('2d');
        if (!ctx) return;

        this.charts.conversion = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Visitors', 'Product Views', 'WhatsApp Clicks', 'Conversions'],
                datasets: [{
                    label: 'Conversion Funnel',
                    data: this.getFunnelData(),
                    backgroundColor: [
                        'rgba(var(--primary-rgb), 0.6)',
                        'rgba(var(--primary-rgb), 0.7)',
                        'rgba(var(--primary-rgb), 0.8)',
                        'rgba(var(--primary-rgb), 0.9)'
                    ]
                }]
            },
            options: {
                responsive: true,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    initDeviceChart() {
        // Device breakdown chart
        const ctx = document.getElementById('deviceChart')?.getContext('2d');
        if (!ctx) return;

        this.charts.device = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Desktop', 'Mobile', 'Tablet'],
                datasets: [{
                    data: this.getDeviceData(),
                    backgroundColor: [
                        'var(--primary)',
                        'var(--secondary)',
                        'var(--success)'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    getLast7Days() {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        }
        return days;
    }

    getTrafficData() {
        // Mock data - replace with real data
        return [65, 59, 80, 81, 56, 55, 40];
    }

    getFunnelData() {
        // Mock data
        return [1000, 600, 200, 50];
    }

    getDeviceData() {
        // Mock data
        return [45, 50, 5];
    }

    updateDashboard() {
        // Update all dashboard elements
        this.updateStats();
        this.updateCharts();
        this.updateRecentActivity();
    }

    updateStats() {
        const stats = this.data?.stats || {};
        
        document.getElementById('totalVisitors')?.textContent = stats.totalVisitors || '0';
        document.getElementById('whatsappClicks')?.textContent = stats.whatsappClicks || '0';
        document.getElementById('conversionRate')?.textContent = stats.conversionRate || '0%';
        document.getElementById('avgSession')?.textContent = stats.avgSession || '0m';
    }

    updateCharts() {
        Object.values(this.charts).forEach(chart => {
            chart.update();
        });
    }

    updateRecentActivity() {
        const container = document.getElementById('recentActivity');
        if (!container || !this.data?.recent) return;

        const activities = this.data.recent.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-${this.getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-text">${activity.text}</div>
                    <div class="activity-time">${this.formatTime(activity.timestamp)}</div>
                </div>
            </div>
        `).join('');

        container.innerHTML = activities;
    }

    getActivityIcon(type) {
        const icons = {
            'whatsapp_click': 'whatsapp',
            'product_click': 'shopping-bag',
            'form_submit': 'envelope',
            'session_start': 'user'
        };
        return icons[type] || 'bell';
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    }

    setupRealtimeUpdates() {
        // WebSocket connection for real-time updates
        if (window.WebSocket) {
            this.setupWebSocket();
        } else {
            // Fallback to polling
            this.setupPolling();
        }
    }

    setupWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/analytics`;
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleRealtimeData(data);
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.setupPolling();
        };
    }

    setupPolling() {
        setInterval(() => {
            this.loadData();
        }, 30000); // Poll every 30 seconds
    }

    handleRealtimeData(data) {
        // Update charts and stats in real-time
        if (data.type === 'new_event') {
            this.updateCharts();
            this.updateRecentActivity();
        }
    }
}

// Initialize dashboard if on analytics page
if (document.getElementById('analyticsDashboard')) {
    window.analyticsDashboard = new AnalyticsDashboard();
}