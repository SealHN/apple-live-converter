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
    const selectFilesBtn = document.getElementById('selectFiles');
    const previewGrid = document.getElementById('previewGrid');
    const clearFilesBtn = document.getElementById('clearFiles');
    const convertBtn = document.getElementById('convertBtn');
    const resultGrid = document.getElementById('resultGrid');
    const downloadAllBtn = document.getElementById('downloadAll');
    const newConversionBtn = document.getElementById('newConversion');
    const fileCountEl = document.getElementById('fileCount');

    // 事件监听
    selectFilesBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    clearFilesBtn.addEventListener('click', clearFiles);
    convertBtn.addEventListener('click', convertFiles);
    downloadAllBtn.addEventListener('click', downloadAll);
    newConversionBtn.addEventListener('click', startNewConversion);

    // 文件选择处理
    async function handleFileSelect(e) {
        const files = e.target.files;
        if (!files.length) return;
        await processFiles(files);
        fileInput.value = '';
    }

    // 拖放处理
    function handleDragOver(e) {
        e.preventDefault();
        uploadArea.style.borderColor = '#0071e3';
        uploadArea.style.background = 'rgba(0,113,227,0.05)';
    }

    function handleDragLeave(e) {
        e.preventDefault();
        uploadArea.style.borderColor = '';
        uploadArea.style.background = '';
    }

    async function handleDrop(e) {
        e.preventDefault();
        handleDragLeave(e);
        await processFiles(e.dataTransfer.files);
    }

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
    function clearFiles() {
        fileHandler.clearFiles();
        previewSection.classList.add('hidden');
        uploadArea.classList.remove('hidden');
        feedback.showSuccess('已清除所有文件');
    }

    // 转换文件
    async function convertFiles() {
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
    }

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
    function downloadAll() {
        const buttons = document.querySelectorAll('.download-btn');
        if (!buttons.length) {
            feedback.showError('没有可下载的文件');
            return;
        }
        buttons.forEach(btn => btn.click());
    }

    // 新的转换
    function startNewConversion() {
        fileHandler.clearFiles();
        resultSection.classList.add('hidden');
        uploadArea.classList.remove('hidden');
    }
});
