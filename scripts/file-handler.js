class FileHandler {
    constructor() {
        this.files = [];
        this.maxSize = 50 * 1024 * 1024; // 50MB
        this.imageTypes = ['image/jpeg', 'image/png', 'image/heic'];
        this.videoTypes = ['video/mp4', 'video/quicktime'];
    }

    validateFile(file) {
        const isImage = this.imageTypes.includes(file.type);
        const isVideo = this.videoTypes.includes(file.type);
        
        if (!isImage && !isVideo) {
            return { valid: false, error: `不支持的文件类型: ${file.type || '未知'}` };
        }
        
        if (file.size > this.maxSize) {
            return { valid: false, error: `文件太大 (${this.formatSize(file.size)} > 50MB)` };
        }
        
        return { valid: true };
    }

    addFiles(newFiles) {
        const results = { valid: [], invalid: [] };
        
        Array.from(newFiles).forEach(file => {
            const validation = this.validateFile(file);
            if (validation.valid) {
                if (!this.files.some(f => f.name === file.name && f.size === file.size)) {
                    this.files.push(file);
                    results.valid.push(file);
                } else {
                    results.invalid.push({ file, error: '文件已存在' });
                }
            } else {
                results.invalid.push({ file, error: validation.error });
            }
        });
        
        return results;
    }

    removeFile(index) {
        if (index >= 0 && index < this.files.length) {
            this.files.splice(index, 1);
            return true;
        }
        return false;
    }

    clearFiles() {
        this.files = [];
    }

    getFiles() {
        return this.files;
    }

    async getPreview(file) {
        return new Promise((resolve) => {
            if (file.type.startsWith('image')) {
                const reader = new FileReader();
                reader.onload = (e) => resolve({
                    type: 'image',
                    preview: e.target.result,
                    name: file.name,
                    size: this.formatSize(file.size)
                });
                reader.readAsDataURL(file);
            } else {
                // 视频预览使用通用图标
                resolve({
                    type: 'video',
                    preview: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%230071e3"><path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>',
                    name: file.name,
                    size: this.formatSize(file.size)
                });
            }
        });
    }

    formatSize(bytes) {
        if (bytes < 1024) return bytes + 'B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
        return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
    }
}

export default FileHandler;
