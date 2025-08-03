import FileHandler from './file-handler.js';
import FeedbackSystem from './feedback.js';

document.addEventListener('DOMContentLoaded', () => {
    const fileHandler = new FileHandler();
    const feedback = new FeedbackSystem();
    
    // DOM元素
    const uploadArea = document.getElementById('uploadArea');
    const previewSection = document.getElementById('previewSection');
    const resultSection = document.getElementById('resultSection');
    const fileInput = document.getElementById('fileInput');
    const previewGrid = document.getElementById('previewGrid');
    const clearFilesBtn = document.getElementById('clearFiles');
    const convertBtn = document.getElementById('convertBtn');
    const resultGrid = document.getElementById('resultGrid');
    const downloadAllBtn = document.getElementById('downloadAll');
    const newConversionBtn = document.getElementById('newConversion');
    const fileCountEl = document.getElementById('fileCount');

    // 文件选择处理
    fileInput.addEventListener('change', async function(e) {
        if (this.files && this.files.length > 0) {
            try {
                await processFiles(this.files);
                this.value = ''; // 重置以便重复选择相同文件
            } catch (error) {
                console.error('文件处理错误:', error);
                feedback.showError('文件处理失败');
            }
        }
    });

    // 拖放处理
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = '#0071e3';
        this.style.background = 'rgba(0,113,227,0.05)';
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.style.borderColor = '';
        this.style.background = '';
    });

    uploadArea.addEventListener('drop', async function(e) {
        e.preventDefault();
        this.style.borderColor = '';
        this.style.background = '';
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            await processFiles(e.dataTransfer.files);
        }
    });

    // 处理文件
    async function processFiles(files) {
        const { valid, invalid } = fileHandler.addFiles(files);
        
        invalid.forEach(({ error }) => feedback.showError(error));
        
        if (valid.length) {
            feedback.showSuccess(`添加了 ${valid.length} 个文件`);
            await updatePreviews();
            uploadArea.classList.add('hidden');
            previewSection.classList.remove('hidden');
            updateFileCount();
        }
    }

    // 更新预览
    async function updatePreviews() {
        previewGrid.innerHTML = '';
        const files = fileHandler.getFiles();
        
        for (let i = 0; i < files.length; i++) {
            const preview = await fileHandler.getPreview(files[i]);
            const item = document.createElement('div');
            item.className = 'preview-item';
            item.innerHTML = `
                <div style="height:100px;display:flex;align-items:center;justify-content:center;">
                    <img src="${preview.preview}" alt="${preview.name}" style="max-height:100%;max-width:100%;">
                </div>
                <div class="preview-name">${preview.name}</div>
                <div class="preview-meta">
                    <span>${preview.size}</span>
                    <button class="remove-btn" data-index="${i}">🗑️ 移除</button>
                </div>
            `;
            previewGrid.appendChild(item);
            
            item.querySelector('.remove-btn').addEventListener('click', (e) => {
                fileHandler.removeFile(parseInt(e.target.dataset.index));
                updatePreviews();
                updateFileCount();
                if (!fileHandler.getFiles().length) {
                    previewSection.classList.add('hidden');
                    uploadArea.classList.remove('hidden');
                }
            });
        }
    }

    // 更新文件计数
    function updateFileCount() {
        fileCountEl.textContent = fileHandler.getFiles().length;
    }

    // 清除文件
    clearFilesBtn.addEventListener('click', function() {
        fileHandler.clearFiles();
        previewSection.classList.add('hidden');
        uploadArea.classList.remove('hidden');
        feedback.showSuccess('已清除所有文件');
    });

    // 转换文件
    convertBtn.addEventListener('click', async function() {
        const files = fileHandler.getFiles();
        if (!files.length) {
            feedback.showError('请先添加文件');
            return;
        }
        
        feedback.showLoading('正在转换...');
        
        // 模拟转换过程
        for (let i = 0; i <= 100; i += 5) {
            feedback.updateProgress(i);
            await new Promise(r => setTimeout(r, 100));
        }
        
        // 显示结果
        showResults();
        feedback.showSuccess('转换完成!');
        previewSection.classList.add('hidden');
        resultSection.classList.remove('hidden');
        feedback.hideLoading();
    });

    // 显示结果
    function showResults() {
        resultGrid.innerHTML = '';
        fileHandler.getFiles().forEach((file, i) => {
            const item = document.createElement('div');
            item.className = 'result-item';
            item.innerHTML = `
                <div style="font-weight:500;">${file.name}</div>
                <div style="font-size:0.8rem;color:var(--secondary);margin:0.5rem 0;">
                    ${fileHandler.formatSize(file.size)} • 转换成功
                </div>
                <button class="download-btn" data-index="${i}">⬇️ 下载</button>
            `;
            resultGrid.appendChild(item);
            
            item.querySelector('.download-btn').addEventListener('click', () => {
                const url = URL.createObjectURL(file);
                const a = document.createElement('a');
                a.href = url;
                a.download = file.name.replace(/\.[^/.]+$/, '') + 
                             (document.getElementById('format').value === 'heic' ? '.heic' : '.jpg');
                a.click();
                feedback.showSuccess('下载开始');
            });
        });
    }

    // 下载全部
    downloadAllBtn.addEventListener('click', function() {
        const buttons = document.querySelectorAll('.download-btn');
        if (!buttons.length) {
            feedback.showError('没有可下载的文件');
            return;
        }
        buttons.forEach(btn => btn.click());
    });

    // 新的转换
    newConversionBtn.addEventListener('click', function() {
        fileHandler.clearFiles();
        resultSection.classList.add('hidden');
        uploadArea.classList.remove('hidden');
    });
});
