// ./js/modules/config.js

// 存储键名常量
export const STORAGE_KEYS = {
    WORDS: 'polyglotWords',
    SETTINGS: 'polyglotSettings',
    // 旧版本兼容性键名
    OLD_WORDS: ['words', 'wordList', 'vocabulary'],
    OLD_SETTINGS: ['settings', 'userSettings', 'config']
};

// 语言配置信息
export const LANGUAGE_INFO = {
    zh: { code: 'zh', name: '中文', flag: '🇨🇳', color: '#dc2626' },
    en: { code: 'en', name: '英语', flag: '🇺🇸', color: '#3b82f6' },
    ko: { code: 'ko', name: '韩语', flag: '🇰🇷', color: '#1e40af' },
    ja: { code: 'ja', name: '日语', flag: '🇯🇵', color: '#f59e0b' },
    es: { code: 'es', name: '西班牙语', flag: '🇪🇸', color: '#ef4444' },
    fr: { code: 'fr', name: '法语', flag: '🇫🇷', color: '#8b5cf6' },
    de: { code: 'de', name: '德语', flag: '🇩🇪', color: '#059669' },
    it: { code: 'it', name: '意大利语', flag: '🇮🇹', color: '#dc2626' },
    pt: { code: 'pt', name: '葡萄牙语', flag: '🇵🇹', color: '#059669' },
    ru: { code: 'ru', name: '俄语', flag: '🇷🇺', color: '#dc2626' }
};

// 应用配置
export const APP_CONFIG = {
    // 卡片堆设置
    CARD_STACK: {
        swipeThreshold: 80,
        rotationAngle: 15,
        stackOffset: 8,
        scaleStep: 0.05,
        maxVisibleCards: 4
    },
    
    // 动画设置
    ANIMATION: {
        cardSwipeDuration: 300,
        fadeInDuration: 200,
        slideInDuration: 250
    },
    
    // 文件大小限制
    FILE_LIMITS: {
        maxImageSize: 5 * 1024 * 1024, // 5MB
        maxAudioSize: 10 * 1024 * 1024, // 10MB
        maxImportFileSize: 50 * 1024 * 1024 // 50MB
    },
    
    // 存储配额
    STORAGE: {
        warningThreshold: 0.8, // 80%
        maxRetries: 3
    }
};

// 存储工具类
export const storage = {
    // 获取数据
    get(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            logger.error(`读取存储数据失败 [${key}]:`, error);
            return null;
        }
    },
    
    // 保存数据
    set(key, value) {
        try {
            const jsonString = JSON.stringify(value);
            
            // 检查存储空间
            if (this.getStorageUsage() > APP_CONFIG.STORAGE.warningThreshold) {
                logger.warn('存储空间使用率较高，建议清理数据');
            }
            
            localStorage.setItem(key, jsonString);
            return true;
        } catch (error) {
            if (error.name === 'QuotaExceededError' || error.code === 22) {
                logger.error('存储空间不足，无法保存数据');
                this.handleStorageQuotaExceeded();
            } else {
                logger.error(`保存存储数据失败 [${key}]:`, error);
            }
            return false;
        }
    },
    
    // 删除数据
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            logger.error(`删除存储数据失败 [${key}]:`, error);
            return false;
        }
    },
    
    // 清空所有数据
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            logger.error('清空存储数据失败:', error);
            return false;
        }
    },
    
    // 获取存储使用率
    getStorageUsage() {
        try {
            let totalSize = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    totalSize += localStorage[key].length;
                }
            }
            
            // 估算最大存储空间（通常为5-10MB）
            const estimatedMaxSize = 5 * 1024 * 1024; // 5MB
            return totalSize / estimatedMaxSize;
        } catch (error) {
            logger.error('计算存储使用率失败:', error);
            return 0;
        }
    },
    
    // 处理存储配额超限
    handleStorageQuotaExceeded() {
        // 可以在这里实现清理策略
        logger.warn('存储配额已满，请考虑：');
        logger.warn('1. 删除不需要的单词');
        logger.warn('2. 清理浏览器缓存');
        logger.warn('3. 导出数据后重新开始');
    }
};

// 日志工具类
export const logger = {
    // 信息日志
    info(message, ...args) {
        console.log(`[INFO] ${message}`, ...args);
    },
    
    // 警告日志
    warn(message, ...args) {
        console.warn(`[WARN] ${message}`, ...args);
    },
    
    // 错误日志
    error(message, ...args) {
        console.error(`[ERROR] ${message}`, ...args);
    },
    
    // 调试日志
    debug(message, ...args) {
        if (this.isDebugMode()) {
            console.log(`[DEBUG] ${message}`, ...args);
        }
    },
    
    // 检查是否为调试模式
    isDebugMode() {
        return localStorage.getItem('debugMode') === 'true' || 
               window.location.search.includes('debug=true');
    }
};

// 工具函数
export const utils = {
    // 生成唯一ID
    generateId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    },
    
    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    // 防抖函数
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
    },
    
    // 节流函数
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
};

// 导出默认配置对象
export default {
    STORAGE_KEYS,
    LANGUAGE_INFO,
    APP_CONFIG,
    storage,
    logger,
    utils
};