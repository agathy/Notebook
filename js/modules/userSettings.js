// ./js/modules/userSettings.js

// 用户设置管理模块
export let userSettings = {
    nativeLanguage: null,
    learningLanguages: []
};

// 语言配置
export const availableLanguages = [
    { code: 'zh', name: '中文', flag: '🇨🇳', color: '#dc2626' },
    { code: 'en', name: '英语', flag: '🇺🇸', color: '#3b82f6' },
    { code: 'ko', name: '韩语', flag: '🇰🇷', color: '#1e40af' },
    { code: 'es', name: '西班牙语', flag: '🇪🇸', color: '#ef4444' }
];

// 全局引用
let showMessageCallback = null;

// 初始化用户设置管理器
export function initUserSettings(options) {
    // 设置回调函数
    if (options.showMessage) showMessageCallback = options.showMessage;
    
    // 从本地存储加载设置
    loadSettingsFromStorage();
    
    // 设置全局引用
    window.userSettings = userSettings;
    window.availableLanguages = availableLanguages;
}

// 从存储加载设置
function loadSettingsFromStorage() {
    try {
        const savedSettings = localStorage.getItem('polyglotSettings');
        if (savedSettings) {
            const parsedSettings = JSON.parse(savedSettings);
            userSettings.nativeLanguage = parsedSettings.nativeLanguage || null;
            userSettings.learningLanguages = parsedSettings.learningLanguages || [];
        }
    } catch (e) {
        console.error('解析用户设置失败:', e);
        // 使用默认设置
        userSettings.nativeLanguage = null;
        userSettings.learningLanguages = [];
    }
}

// 保存设置到本地存储
export function saveSettingsToStorage() {
    try {
        localStorage.setItem('polyglotSettings', JSON.stringify(userSettings));
        return true;
    } catch (error) {
        console.error('保存设置失败:', error);
        if (showMessageCallback) {
            showMessageCallback('保存设置失败，请重试', 'error');
        }
        return false;
    }
}

// 选择母语
export function selectNativeLanguage(languageCode) {
    userSettings.nativeLanguage = languageCode;
}

// 切换学习语言
export function toggleLearningLanguage(languageCode) {
    const langIndex = userSettings.learningLanguages.indexOf(languageCode);
    
    if (langIndex === -1) {
        // 添加语言
        userSettings.learningLanguages.push(languageCode);
    } else {
        // 移除语言
        userSettings.learningLanguages.splice(langIndex, 1);
    }
}

// 获取学习语言
export function getLearningLanguages() {
    return [...userSettings.learningLanguages]; // 返回副本
}

// 获取母语
export function getNativeLanguage() {
    return userSettings.nativeLanguage;
}

// 检查设置是否完成
export function isSettingsComplete() {
    return userSettings.nativeLanguage && userSettings.learningLanguages.length > 0;
}

// 重置设置
export function resetSettings() {
    userSettings.nativeLanguage = null;
    userSettings.learningLanguages = [];
}

// 获取语言信息
export function getLanguageInfo(langCode) {
    return availableLanguages.find(lang => lang.code === langCode);
}

// 获取所有可用语言
export function getAllAvailableLanguages() {
    return [...availableLanguages];
}

// 获取用户设置（只读副本）
export function getUserSettings() {
    return {
        nativeLanguage: userSettings.nativeLanguage,
        learningLanguages: [...userSettings.learningLanguages]
    };
}

// 显示消息辅助函数
function showMessage(text, type = 'success') {
    if (showMessageCallback) {
        showMessageCallback(text, type);
    } else {
        console.log(`[${type.toUpperCase()}] ${text}`);
    }
}