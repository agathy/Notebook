// dataMigration.js - 数据迁移模块

// 可能的旧存储键名列表
const POSSIBLE_OLD_KEYS = [
    'words',
    'wordsList', 
    'multilingualWords',
    'languageWords',
    'vocabularyWords',
    'polyglot_words',
    'notebook_words',
    'language_notebook_words'
];

const POSSIBLE_OLD_SETTINGS_KEYS = [
    'settings',
    'userSettings',
    'languageSettings',
    'polyglot_settings',
    'notebook_settings'
];

// 当前使用的键名
const CURRENT_WORDS_KEY = 'polyglotWords';
const CURRENT_SETTINGS_KEY = 'polyglotSettings';

/**
 * 迁移旧的单词数据到新的存储键
 */
export function migrateWordsData() {
    // 检查当前键是否已有数据
    const currentData = localStorage.getItem(CURRENT_WORDS_KEY);
    if (currentData && currentData !== '[]' && currentData !== 'null') {
        console.log('当前存储键已有数据，跳过迁移');
        return false;
    }

    // 查找旧数据
    for (const oldKey of POSSIBLE_OLD_KEYS) {
        const oldData = localStorage.getItem(oldKey);
        if (oldData && oldData !== '[]' && oldData !== 'null') {
            try {
                // 验证数据格式
                const parsedData = JSON.parse(oldData);
                if (Array.isArray(parsedData) && parsedData.length > 0) {
                    // 迁移数据
                    localStorage.setItem(CURRENT_WORDS_KEY, oldData);
                    console.log(`成功迁移单词数据从 ${oldKey} 到 ${CURRENT_WORDS_KEY}`);
                    console.log(`迁移了 ${parsedData.length} 个单词`);
                    
                    // 可选：删除旧数据（注释掉以保持安全）
                    // localStorage.removeItem(oldKey);
                    
                    return true;
                }
            } catch (error) {
                console.warn(`解析旧数据失败 (${oldKey}):`, error);
            }
        }
    }

    console.log('未找到可迁移的单词数据');
    return false;
}

/**
 * 迁移旧的设置数据到新的存储键
 */
export function migrateSettingsData() {
    // 检查当前键是否已有数据
    const currentSettings = localStorage.getItem(CURRENT_SETTINGS_KEY);
    if (currentSettings && currentSettings !== '{}' && currentSettings !== 'null') {
        console.log('当前设置键已有数据，跳过迁移');
        return false;
    }

    // 查找旧设置数据
    for (const oldKey of POSSIBLE_OLD_SETTINGS_KEYS) {
        const oldSettings = localStorage.getItem(oldKey);
        if (oldSettings && oldSettings !== '{}' && oldSettings !== 'null') {
            try {
                // 验证数据格式
                const parsedSettings = JSON.parse(oldSettings);
                if (parsedSettings && typeof parsedSettings === 'object') {
                    // 迁移设置
                    localStorage.setItem(CURRENT_SETTINGS_KEY, oldSettings);
                    console.log(`成功迁移设置数据从 ${oldKey} 到 ${CURRENT_SETTINGS_KEY}`);
                    
                    // 可选：删除旧数据（注释掉以保持安全）
                    // localStorage.removeItem(oldKey);
                    
                    return true;
                }
            } catch (error) {
                console.warn(`解析旧设置失败 (${oldKey}):`, error);
            }
        }
    }

    console.log('未找到可迁移的设置数据');
    return false;
}

/**
 * 执行完整的数据迁移
 */
export function performDataMigration() {
    console.log('开始数据迁移检查...');
    
    const wordsMigrated = migrateWordsData();
    const settingsMigrated = migrateSettingsData();
    
    if (wordsMigrated || settingsMigrated) {
        console.log('数据迁移完成');
        return true;
    } else {
        console.log('无需迁移数据');
        return false;
    }
}

/**
 * 列出所有可能的旧数据（用于调试）
 */
export function listPossibleOldData() {
    console.log('检查所有可能的旧存储数据:');
    
    const allKeys = [...POSSIBLE_OLD_KEYS, ...POSSIBLE_OLD_SETTINGS_KEYS];
    const foundData = [];
    
    for (const key of allKeys) {
        const data = localStorage.getItem(key);
        if (data && data !== 'null' && data !== '[]' && data !== '{}') {
            try {
                const parsed = JSON.parse(data);
                foundData.push({
                    key,
                    dataType: Array.isArray(parsed) ? 'array' : typeof parsed,
                    length: Array.isArray(parsed) ? parsed.length : Object.keys(parsed || {}).length,
                    preview: JSON.stringify(parsed).substring(0, 100) + '...'
                });
            } catch (error) {
                foundData.push({
                    key,
                    dataType: 'invalid',
                    error: error.message
                });
            }
        }
    }
    
    if (foundData.length > 0) {
        console.table(foundData);
    } else {
        console.log('未找到任何旧数据');
    }
    
    return foundData;
}

/**
 * 手动迁移指定键的数据
 */
export function manualMigrate(oldWordsKey, oldSettingsKey) {
    let migrated = false;
    
    if (oldWordsKey) {
        const oldWords = localStorage.getItem(oldWordsKey);
        if (oldWords) {
            try {
                const parsed = JSON.parse(oldWords);
                if (Array.isArray(parsed)) {
                    localStorage.setItem(CURRENT_WORDS_KEY, oldWords);
                    console.log(`手动迁移单词数据: ${oldWordsKey} -> ${CURRENT_WORDS_KEY}`);
                    migrated = true;
                }
            } catch (error) {
                console.error('手动迁移单词数据失败:', error);
            }
        }
    }
    
    if (oldSettingsKey) {
        const oldSettings = localStorage.getItem(oldSettingsKey);
        if (oldSettings) {
            try {
                const parsed = JSON.parse(oldSettings);
                if (parsed && typeof parsed === 'object') {
                    localStorage.setItem(CURRENT_SETTINGS_KEY, oldSettings);
                    console.log(`手动迁移设置数据: ${oldSettingsKey} -> ${CURRENT_SETTINGS_KEY}`);
                    migrated = true;
                }
            } catch (error) {
                console.error('手动迁移设置数据失败:', error);
            }
        }
    }
    
    return migrated;
}

// 暴露到全局作用域以便在控制台中使用
if (typeof window !== 'undefined') {
    window.dataMigration = {
        performDataMigration,
        listPossibleOldData,
        manualMigrate,
        migrateWordsData,
        migrateSettingsData
    };
}