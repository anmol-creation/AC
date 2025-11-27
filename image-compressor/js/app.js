document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const qualitySlider = document.getElementById('quality-slider');
    const qualityValue = document.getElementById('quality-value');
    const formatBtns = document.querySelectorAll('.format-btn');
    const widthInput = document.getElementById('width-input');
    const heightInput = document.getElementById('height-input');
    const aspectRatioLock = document.getElementById('aspect-ratio-lock');
    const processBtn = document.getElementById('process-btn');
    const previewContainer = document.getElementById('preview-container');
    const downloadAllBtn = document.getElementById('download-all-btn');

    // State
    let files = [];
    let processedImages = [];
    let settings = {
        quality: 0.8,
        format: 'image/jpeg',
        width: null,
        height: null,
        maintainAspectRatio: true
    };

    // --- Event Listeners ---

    // Drag & Drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // Settings
    qualitySlider.addEventListener('input', (e) => {
        const val = e.target.value;
        qualityValue.textContent = `${val}%`;
        settings.quality = val / 100;
        // Optional: Auto re-process if files exist (can be resource heavy, so maybe wait for button)
    });

    formatBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            formatBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            settings.format = btn.dataset.format;
        });
    });

    aspectRatioLock.addEventListener('change', (e) => {
        settings.maintainAspectRatio = e.target.checked;
    });

    widthInput.addEventListener('input', (e) => {
        settings.width = parseInt(e.target.value) || null;
        if (settings.maintainAspectRatio && settings.width && files.length > 0) {
            // Simplified aspect ratio calculation based on first image for UI feedback
            // Real calc happens during processing per image
        }
    });

    heightInput.addEventListener('input', (e) => {
        settings.height = parseInt(e.target.value) || null;
    });

    processBtn.addEventListener('click', () => {
        processAllImages();
    });

    downloadAllBtn.addEventListener('click', () => {
        processedImages.forEach(img => {
            const link = document.createElement('a');
            link.href = img.url;
            link.download = img.name;
            link.click();
        });
    });

    // --- Functions ---

    function handleFiles(fileList) {
        const newFiles = Array.from(fileList).filter(file => file.type.startsWith('image/'));
        if (newFiles.length === 0) return;

        files = [...files, ...newFiles];

        // Initial "Loading" UI or just show file names?
        // Let's process them immediately for preview
        processAllImages();
    }

    async function processAllImages() {
        previewContainer.innerHTML = ''; // Clear current list
        processedImages = [];

        if (files.length === 0) {
            previewContainer.innerHTML = '<div class="empty-state"><p>No image selected</p></div>';
            downloadAllBtn.classList.add('hidden');
            return;
        }

        downloadAllBtn.classList.remove('hidden');

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            await processImage(file, i);
        }
    }

    function processImage(file, index) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Calculate Dimensions
                    let width = img.width;
                    let height = img.height;

                    if (settings.width && settings.height && !settings.maintainAspectRatio) {
                        width = settings.width;
                        height = settings.height;
                    } else if (settings.width) {
                        width = settings.width;
                        if (settings.maintainAspectRatio) {
                            height = (img.height / img.width) * width;
                        }
                    } else if (settings.height) {
                        height = settings.height;
                        if (settings.maintainAspectRatio) {
                            width = (img.width / img.height) * height;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    // Draw image
                    ctx.drawImage(img, 0, 0, width, height);

                    // Compress
                    const newDataUrl = canvas.toDataURL(settings.format, settings.quality);

                    // Create Result Object
                    const originalSize = (file.size / 1024).toFixed(1); // KB

                    // Estimate new size (roughly) from base64 length
                    const head = `data:${settings.format};base64,`;
                    const sizeInBytes = Math.round((newDataUrl.length - head.length) * 3 / 4);
                    const newSize = (sizeInBytes / 1024).toFixed(1); // KB

                    const extension = settings.format.split('/')[1];
                    const newName = file.name.substring(0, file.name.lastIndexOf('.')) + `_compressed.${extension}`;

                    const processedImg = {
                        url: newDataUrl,
                        name: newName,
                        originalSize: originalSize,
                        newSize: newSize,
                        originalFile: file
                    };

                    processedImages.push(processedImg);
                    renderImageCard(processedImg, index);
                    resolve();
                };
            };
        });
    }

    function renderImageCard(imgData, index) {
        const div = document.createElement('div');
        div.className = 'image-item';

        // Use textContent for user-provided strings to prevent XSS
        const fileNameDiv = document.createElement('div');
        fileNameDiv.className = 'file-name';
        fileNameDiv.title = imgData.name;
        fileNameDiv.textContent = imgData.name;

        div.innerHTML = `
            <img src="${imgData.url}" class="img-thumb" alt="Preview">
            <div class="img-info">
                <!-- file-name injected below -->
                <div class="file-meta">
                    <span class="old-size">${imgData.originalSize} KB</span>
                    <span style="margin: 0 5px">→</span>
                    <span class="new-size">${imgData.newSize} KB</span>
                </div>
            </div>
            <div class="item-actions">
                <a href="${imgData.url}" class="download-btn">Download</a>
                <button class="remove-btn" data-index="${index}">Remove</button>
            </div>
        `;

        // Insert the safe file name element
        div.querySelector('.img-info').prepend(fileNameDiv);

        // Set safe download attribute
        div.querySelector('.download-btn').setAttribute('download', imgData.name);

        // Remove Handler
        div.querySelector('.remove-btn').addEventListener('click', (e) => {
            const idx = parseInt(e.target.dataset.index);
            // Remove from files array (need to track original file reference correctly)
            // A simple way: remove by filtering the files array based on name or just by splicing if we kept indices synced
            // Since we rebuild the list on process, let's just remove from 'files' and re-process.

            // To be accurate, we should remove the exact file object.
            const fileToRemove = imgData.originalFile;
            files = files.filter(f => f !== fileToRemove);

            processAllImages();
        });

        previewContainer.appendChild(div);
    }
});
