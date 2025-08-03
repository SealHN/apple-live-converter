class FeedbackSystem {
    constructor() {
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.loadingText = document.getElementById('loadingText');
        this.progressBar = document.getElementById('progressBar');
    }

    showLoading(message) {
        this.loadingText.textContent = message;
        this.progressBar.style.width = '0%';
        this.loadingOverlay.classList.remove('hidden');
    }

    updateProgress(percent) {
        this.progressBar.style.width = `${percent}%`;
    }

    hideLoading() {
        this.loadingOverlay.classList.add('hidden');
    }

    showAlert(message, type = 'info') {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        alert.style.position = 'fixed';
        alert.style.bottom = '20px';
        alert.style.right = '20px';
        alert.style.padding = '12px 20px';
        alert.style.background = type === 'error' ? '#ff3b30' : 
                               type === 'success' ? '#34c759' : '#0071e3';
        alert.style.color = 'white';
        alert.style.borderRadius = '8px';
        alert.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        alert.style.zIndex = '1000';
        alert.style.animation = 'fadeIn 0.3s ease-out';
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => alert.remove(), 300);
        }, 3000);
    }

    showError(message) {
        this.showAlert(message, 'error');
    }

    showSuccess(message) {
        this.showAlert(message, 'success');
    }
}

export default FeedbackSystem;
