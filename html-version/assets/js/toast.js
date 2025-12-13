// Toast Notification System
// Sistema de notificações elegante para feedback ao usuário

class Toast {
    static show(message, type = 'success', duration = 3000) {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.toast-notification');
        existingToasts.forEach(toast => toast.remove());
        
        // Create toast container if it doesn't exist
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
            `;
            document.body.appendChild(container);
        }
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        
        // Set colors based on type
        const colors = {
            success: {
                bg: '#d4edda',
                border: '#c3e6cb',
                text: '#155724',
                icon: 'bi-check-circle-fill'
            },
            error: {
                bg: '#f8d7da',
                border: '#f5c6cb',
                text: '#721c24',
                icon: 'bi-x-circle-fill'
            },
            info: {
                bg: '#d1ecf1',
                border: '#bee5eb',
                text: '#0c5460',
                icon: 'bi-info-circle-fill'
            },
            warning: {
                bg: '#fff3cd',
                border: '#ffeaa7',
                text: '#856404',
                icon: 'bi-exclamation-triangle-fill'
            }
        };
        
        const color = colors[type] || colors.success;
        
        toast.style.cssText = `
            background-color: ${color.bg};
            border: 1px solid ${color.border};
            color: ${color.text};
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 300px;
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
            font-size: 14px;
        `;
        
        toast.innerHTML = `
            <i class="bi ${color.icon}" style="font-size: 20px;"></i>
            <span style="flex: 1;">${message}</span>
            <button onclick="this.parentElement.remove()" style="background: none; border: none; color: ${color.text}; cursor: pointer; padding: 0; margin-left: 8px;">
                <i class="bi bi-x-lg"></i>
            </button>
        `;
        
        container.appendChild(toast);
        
        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                toast.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => toast.remove(), 300);
            }, duration);
        }
        
        return toast;
    }
    
    static success(message, duration = 3000) {
        return this.show(message, 'success', duration);
    }
    
    static error(message, duration = 4000) {
        return this.show(message, 'error', duration);
    }
    
    static info(message, duration = 3000) {
        return this.show(message, 'info', duration);
    }
    
    static warning(message, duration = 4000) {
        return this.show(message, 'warning', duration);
    }
}

// Add CSS animations
if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}



