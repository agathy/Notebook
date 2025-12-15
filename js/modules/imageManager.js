// ./js/modules/imageManager.js

// 图片管理模块
export let uploadedImageData = null;
let cameraStream = null;
let capturedPhoto = null;
let isDrawing = false;
let drawContext = null;

// DOM元素引用
let imageUploadInput, clearImageBtn, imagePreview, cameraBtn, drawBtn;
let cameraModal, cameraVideo, cameraCanvas, captureBtn, retakeBtn, usePhotoBtn, closeCameraModalBtn;
let drawModal, drawCanvas, drawColor, drawSize, drawSizeValue, clearCanvasBtn, useDrawingBtn, closeDrawModalBtn;
let showMessageCallback = null;

// 初始化图片管理器
export function initImageManager(options) {
    // 获取DOM元素引用
    imageUploadInput = options.imageUploadInput;
    clearImageBtn = options.clearImageBtn;
    imagePreview = options.imagePreview;
    cameraBtn = options.cameraBtn;
    drawBtn = options.drawBtn;
    cameraModal = options.cameraModal;
    cameraVideo = options.cameraVideo;
    cameraCanvas = options.cameraCanvas;
    captureBtn = options.captureBtn;
    retakeBtn = options.retakeBtn;
    usePhotoBtn = options.usePhotoBtn;
    closeCameraModalBtn = options.closeCameraModalBtn;
    drawModal = options.drawModal;
    drawCanvas = options.drawCanvas;
    drawColor = options.drawColor;
    drawSize = options.drawSize;
    drawSizeValue = options.drawSizeValue;
    clearCanvasBtn = options.clearCanvasBtn;
    useDrawingBtn = options.useDrawingBtn;
    closeDrawModalBtn = options.closeDrawModalBtn;
    
    // 设置消息回调
    if (options.showMessage) {
        showMessageCallback = options.showMessage;
    }
    
    // 初始化事件监听
    initImageEvents();
    
    // 初始化手绘画布
    initDrawCanvas();
}

// 初始化图片事件
function initImageEvents() {
    // 图片文件上传
    if (imageUploadInput) {
        imageUploadInput.addEventListener('change', handleImageUpload);
    }
    
    // 清除图片
    if (clearImageBtn) {
        clearImageBtn.addEventListener('click', clearImage);
    }
    
    // 拍照功能
    if (cameraBtn) {
        cameraBtn.addEventListener('click', openCameraModal);
    }
    
    // 关闭拍照模态框
    if (closeCameraModalBtn) {
        closeCameraModalBtn.addEventListener('click', closeCameraModal);
    }
    
    // 点击模态框背景关闭
    if (cameraModal) {
        window.addEventListener('click', (e) => {
            if (e.target === cameraModal) {
                closeCameraModal();
            }
        });
    }
    
    // 拍照
    if (captureBtn) {
        captureBtn.addEventListener('click', capturePhoto);
    }
    
    // 重拍
    if (retakeBtn) {
        retakeBtn.addEventListener('click', retakePhoto);
    }
    
    // 使用照片
    if (usePhotoBtn) {
        usePhotoBtn.addEventListener('click', usePhoto);
    }
    
    // 手绘功能
    if (drawBtn) {
        drawBtn.addEventListener('click', openDrawModal);
    }
    
    // 关闭手绘模态框
    if (closeDrawModalBtn) {
        closeDrawModalBtn.addEventListener('click', () => {
            if (drawModal) {
                drawModal.style.display = 'none';
            }
            document.body.style.overflow = 'auto';
            if (drawContext) {
                drawContext.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
            }
        });
    }
    
    // 点击模态框背景关闭
    if (drawModal) {
        window.addEventListener('click', (e) => {
            if (e.target === drawModal) {
                if (drawModal) {
                    drawModal.style.display = 'none';
                }
                document.body.style.overflow = 'auto';
                if (drawContext) {
                    drawContext.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
                }
            }
        });
    }
    
    // 画笔颜色变化
    if (drawColor) {
        drawColor.addEventListener('change', (e) => {
            if (drawContext) {
                drawContext.strokeStyle = e.target.value;
            }
        });
    }
    
    // 画笔大小变化
    if (drawSize && drawSizeValue) {
        drawSize.addEventListener('input', (e) => {
            const size = e.target.value;
            drawSizeValue.textContent = size;
            if (drawContext) {
                drawContext.lineWidth = size;
            }
        });
    }
    
    // 清空画布
    if (clearCanvasBtn) {
        clearCanvasBtn.addEventListener('click', () => {
            if (drawContext && drawCanvas) {
                drawContext.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
            }
        });
    }
    
    // 使用手绘
    if (useDrawingBtn) {
        useDrawingBtn.addEventListener('click', useDrawing);
    }
    
    // 手绘事件
    if (drawCanvas) {
        initDrawingEvents();
    }
}

// 处理图片上传
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        // 检查文件类型
        if (!file.type.startsWith('image/')) {
            showMessage('请选择图片文件', 'error');
            e.target.value = '';
            return;
        }
        
        // 检查文件大小（限制为5MB）
        if (file.size > 5 * 1024 * 1024) {
            showMessage('图片文件大小不能超过5MB', 'error');
            e.target.value = '';
            return;
        }
        
        // 读取文件并转换为base64
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedImageData = e.target.result;
            updateImagePreview();
            showMessage('图片上传成功', 'success');
        };
        reader.onerror = function() {
            showMessage('图片读取失败，请重试', 'error');
            e.target.value = '';
        };
        reader.readAsDataURL(file);
    }
}

// 清除图片
function clearImage() {
    uploadedImageData = null;
    if (imagePreview) {
        imagePreview.classList.remove('show');
    }
    clearImageBtn.style.display = 'none';
    if (imageUploadInput) {
        imageUploadInput.value = '';
    }
    showMessage('图片已清除', 'info');
}

// 更新图片预览
export function updateImagePreview() {
    if (uploadedImageData) {
        // 显示上传的图片
        imagePreview.src = uploadedImageData;
        imagePreview.classList.add('show');
        clearImageBtn.style.display = 'inline-flex';
    } else {
        imagePreview.classList.remove('show');
        clearImageBtn.style.display = 'none';
    }
}

// 设置图片数据（用于编辑模式）
export function setImageData(imageData) {
    if (imageData) {
        // 只支持base64数据（上传的图片）
        if (imageData.startsWith('data:image/')) {
            uploadedImageData = imageData;
            updateImagePreview();
        } else {
            // 不再支持URL图片，清空数据
            uploadedImageData = null;
            if (imagePreview) {
                imagePreview.classList.remove('show');
            }
            if (clearImageBtn) {
                clearImageBtn.style.display = 'none';
            }
        }
    } else {
        uploadedImageData = null;
        if (imagePreview) {
            imagePreview.classList.remove('show');
        }
        if (clearImageBtn) {
            clearImageBtn.style.display = 'none';
        }
    }
}

// 获取当前图片数据
export function getImageData() {
    return uploadedImageData || null;
}

// 重置图片数据
export function resetImageData() {
    uploadedImageData = null;
    if (imagePreview) {
        imagePreview.classList.remove('show');
    }
    if (clearImageBtn) {
        clearImageBtn.style.display = 'none';
    }
    if (imageUploadInput) {
        imageUploadInput.value = '';
    }
}

// 拍照功能
async function openCameraModal() {
    if (!cameraModal) return;
    
    cameraModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    try {
        // 请求摄像头权限
        cameraStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } // 优先使用后置摄像头
        });
        if (cameraVideo) {
            cameraVideo.srcObject = cameraStream;
        }
        if (captureBtn) {
            captureBtn.style.display = 'inline-block';
        }
        if (retakeBtn) {
            retakeBtn.style.display = 'none';
        }
        if (usePhotoBtn) {
            usePhotoBtn.style.display = 'none';
        }
    } catch (error) {
        console.error('无法访问摄像头:', error);
        showMessage('无法访问摄像头，请检查权限设置', 'error');
        cameraModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function closeCameraModal() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    if (cameraModal) {
        cameraModal.style.display = 'none';
    }
    document.body.style.overflow = 'auto';
    capturedPhoto = null;
    if (cameraVideo) {
        cameraVideo.srcObject = null;
    }
    if (cameraCanvas) {
        const ctx = cameraCanvas.getContext('2d');
        ctx.clearRect(0, 0, cameraCanvas.width, cameraCanvas.height);
    }
    if (captureBtn) {
        captureBtn.style.display = 'inline-block';
    }
    if (retakeBtn) {
        retakeBtn.style.display = 'none';
    }
    if (usePhotoBtn) {
        usePhotoBtn.style.display = 'none';
    }
}

function capturePhoto() {
    if (!cameraVideo || !cameraCanvas) return;
    
    const ctx = cameraCanvas.getContext('2d');
    cameraCanvas.width = cameraVideo.videoWidth;
    cameraCanvas.height = cameraVideo.videoHeight;
    ctx.drawImage(cameraVideo, 0, 0);
    capturedPhoto = cameraCanvas.toDataURL('image/png');
    
    // 停止视频流
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    if (cameraVideo) {
        cameraVideo.srcObject = null;
    }
    
    // 显示预览
    cameraVideo.style.display = 'none';
    cameraCanvas.style.display = 'block';
    cameraCanvas.style.width = '100%';
    cameraCanvas.style.height = 'auto';
    
    if (captureBtn) captureBtn.style.display = 'none';
    if (retakeBtn) retakeBtn.style.display = 'inline-block';
    if (usePhotoBtn) usePhotoBtn.style.display = 'inline-block';
}

async function retakePhoto() {
    capturedPhoto = null;
    if (cameraCanvas) {
        cameraCanvas.style.display = 'none';
    }
    if (cameraVideo) {
        cameraVideo.style.display = 'block';
    }
    
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' }
        });
        if (cameraVideo) {
            cameraVideo.srcObject = cameraStream;
        }
        if (captureBtn) captureBtn.style.display = 'inline-block';
        if (retakeBtn) retakeBtn.style.display = 'none';
        if (usePhotoBtn) usePhotoBtn.style.display = 'none';
    } catch (error) {
        console.error('无法访问摄像头:', error);
        showMessage('无法访问摄像头，请检查权限设置', 'error');
    }
}

function usePhoto() {
    if (capturedPhoto) {
        uploadedImageData = capturedPhoto;
        updateImagePreview();
        showMessage('照片已添加', 'success');
        closeCameraModal();
    }
}

// 手绘功能
function initDrawCanvas() {
    if (drawCanvas) {
        drawCanvas.width = 800;
        drawCanvas.height = 600;
        drawContext = drawCanvas.getContext('2d');
        drawContext.strokeStyle = '#000000';
        drawContext.lineWidth = 3;
        drawContext.lineCap = 'round';
        drawContext.lineJoin = 'round';
    }
}

function openDrawModal() {
    if (drawModal) {
        drawModal.style.display = 'block';
    }
    document.body.style.overflow = 'hidden';
    initDrawCanvas();
}

function useDrawing() {
    if (drawCanvas) {
        const drawingData = drawCanvas.toDataURL('image/png');
        uploadedImageData = drawingData;
        updateImagePreview();
        showMessage('手绘图片已添加', 'success');
        if (drawModal) {
            drawModal.style.display = 'none';
        }
        document.body.style.overflow = 'auto';
    }
}

// 初始化手绘事件
function initDrawingEvents() {
    // 开始绘制
    drawCanvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        const rect = drawCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (drawContext) {
            drawContext.beginPath();
            drawContext.moveTo(x, y);
        }
    });
    
    // 绘制中
    drawCanvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        const rect = drawCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (drawContext) {
            drawContext.lineTo(x, y);
            drawContext.stroke();
        }
    });
    
    // 结束绘制
    drawCanvas.addEventListener('mouseup', () => {
        isDrawing = false;
    });
    
    drawCanvas.addEventListener('mouseleave', () => {
        isDrawing = false;
    });
    
    // 触摸设备支持
    drawCanvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isDrawing = true;
        const rect = drawCanvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        if (drawContext) {
            drawContext.beginPath();
            drawContext.moveTo(x, y);
        }
    });
    
    drawCanvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!isDrawing) return;
        const rect = drawCanvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        if (drawContext) {
            drawContext.lineTo(x, y);
            drawContext.stroke();
        }
    });
    
    drawCanvas.addEventListener('touchend', () => {
        isDrawing = false;
    });
}

// 显示消息辅助函数
function showMessage(text, type = 'success') {
    if (showMessageCallback) {
        showMessageCallback(text, type);
    } else {
        console.log(`[${type.toUpperCase()}] ${text}`);
    }
}