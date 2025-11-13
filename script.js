const fileInput = document.getElementById('fileInput');
const collage = document.getElementById('collage');
const photoCount = document.getElementById('photoCount');
const columnsInput = document.getElementById('columns');
const photoSizeInput = document.getElementById('photoSize');
const gapInput = document.getElementById('gap');
const sizeValue = document.getElementById('sizeValue');
const gapValue = document.getElementById('gapValue');
const clearBtn = document.getElementById('clearBtn');
const downloadBtn = document.getElementById('downloadBtn');
const printBtn = document.getElementById('printBtn');

let photos = [];

// Handle file selection
fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                photos.push(event.target.result);
                updateCollage();
            };
            reader.readAsDataURL(file);
        }
    });
});

// Update collage display
function updateCollage() {
    collage.innerHTML = '';
    photoCount.textContent = `${photos.length} photos selected`;
    
    photos.forEach((photo, index) => {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        
        const img = document.createElement('img');
        img.src = photo;
        img.alt = `Photo ${index + 1}`;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '×';
        removeBtn.onclick = () => removePhoto(index);
        
        photoItem.appendChild(img);
        photoItem.appendChild(removeBtn);
        collage.appendChild(photoItem);
    });
    
    updateCollageStyle();
}

// Remove photo
function removePhoto(index) {
    photos.splice(index, 1);
    updateCollage();
}

// Update collage style
function updateCollageStyle() {
    const columns = columnsInput.value;
    const size = photoSizeInput.value;
    const gap = gapInput.value;
    
    collage.style.gridTemplateColumns = `repeat(${columns}, ${size}px)`;
    collage.style.gap = `${gap}px`;
    
    const photoItems = collage.querySelectorAll('.photo-item');
    photoItems.forEach(item => {
        item.style.width = `${size}px`;
        item.style.height = `${size}px`;
    });
}

// Update size display
photoSizeInput.addEventListener('input', (e) => {
    sizeValue.textContent = `${e.target.value}px`;
    updateCollageStyle();
});

gapInput.addEventListener('input', (e) => {
    gapValue.textContent = `${e.target.value}px`;
    updateCollageStyle();
});

columnsInput.addEventListener('input', updateCollageStyle);

// Clear all photos
clearBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all photos?')) {
        photos = [];
        updateCollage();
        fileInput.value = '';
    }
});

// Print collage
printBtn.addEventListener('click', () => {
    if (photos.length === 0) {
        alert('Please add photos first!');
        return;
    }
    window.print();
});

// Download collage
downloadBtn.addEventListener('click', async () => {
    if (photos.length === 0) {
        alert('Please add photos first!');
        return;
    }
    
    const columns = parseInt(columnsInput.value);
    const size = parseInt(photoSizeInput.value);
    const gap = parseInt(gapInput.value);
    
    const rows = Math.ceil(photos.length / columns);
    const canvasWidth = columns * size + (columns - 1) * gap;
    const canvasHeight = rows * size + (rows - 1) * gap;
    
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');
    
    // White background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw photos
    const promises = photos.map((photo, index) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const col = index % columns;
                const row = Math.floor(index / columns);
                const x = col * (size + gap);
                const y = row * (size + gap);
                
                ctx.drawImage(img, x, y, size, size);
                resolve();
            };
            img.src = photo;
        });
    });
    
    await Promise.all(promises);
    
    // Download
    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `collage-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
    });
});
