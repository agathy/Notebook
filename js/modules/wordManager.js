// ./js/modules/wordManager.js

// 单词数据管理模块
export let words = [];
export let editingWordId = null;
export let displayedWordId = null;
export let showNativeColumn = true;
export let selectedTagFilter = '';
export let currentSortOption = 'newest';
export let allTags = new Set();

// 设置编辑状态的函数
export function setEditingWordId(wordId) {
    editingWordId = wordId;
}

export function setDisplayedWordId(wordId) {
    displayedWordId = wordId;
}

// 全局引用
let showMessageCallback = null;
let updateAllTagsCallback = null;
let updateTagFilterSelectCallback = null;
let updateHomeWordCountCallback = null;
let updateWordsTableCallback = null;
let loadWordsCallback = null;

// 初始化单词管理器
export function initWordManager(options) {
    // 设置回调函数
    if (options.showMessage) showMessageCallback = options.showMessage;
    if (options.updateAllTags) updateAllTagsCallback = options.updateAllTags;
    if (options.updateTagFilterSelect) updateTagFilterSelectCallback = options.updateTagFilterSelect;
    if (options.updateHomeWordCount) updateHomeWordCountCallback = options.updateHomeWordCount;
    if (options.updateWordsTable) updateWordsTableCallback = options.updateWordsTable;
    if (options.loadWords) loadWordsCallback = options.loadWords;
    
    // 加载单词数据
    loadWordsFromStorage();
}

// 安全保存到 localStorage，处理配额超限错误
function saveWordsToStorage() {
    try {
        const wordsJson = JSON.stringify(words);
        localStorage.setItem('polyglotWords', wordsJson);
        return true;
    } catch (error) {
        if (error.name === 'QuotaExceededError' || error.code === 22) {
            // 计算当前数据大小
            const wordsJson = JSON.stringify(words);
            const sizeInMB = (new Blob([wordsJson]).size / 1024 / 1024).toFixed(2);
            
            // 尝试压缩图片数据
            let compressedCount = 0;
            words.forEach(word => {
                if (word.image && word.image.startsWith('data:image/')) {
                    // 检查图片大小，如果超过500KB则提示用户
                    const imageSize = word.image.length * 0.75 / 1024; // 大约的KB数
                    if (imageSize > 500) {
                        // 移除大图片，提示用户
                        word.image = null;
                        compressedCount++;
                    }
                }
            });
            
            if (compressedCount > 0) {
                // 再次尝试保存
                try {
                    const compressedJson = JSON.stringify(words);
                    localStorage.setItem('polyglotWords', compressedJson);
                    showMessage(`存储空间不足，已移除 ${compressedCount} 个大图片。建议导出数据并清理。`, 'error');
                    return true;
                } catch (e) {
                    showMessage(`存储空间已满（${sizeInMB}MB）。请导出数据并删除部分单词，或清理浏览器缓存。`, 'error');
                    return false;
                }
            } else {
                showMessage(`存储空间已满（${sizeInMB}MB）。请导出数据并删除部分单词，或清理浏览器缓存。`, 'error');
                return false;
            }
        } else {
            console.error('保存失败:', error);
            showMessage('保存失败，请重试', 'error');
            return false;
        }
    }
}

// 从存储加载单词
function loadWordsFromStorage() {
    try {
        words = JSON.parse(localStorage.getItem('polyglotWords')) || [];
    } catch (e) {
        console.error('解析单词数据失败:', e);
        words = [];
    }
    
    // 更新标签集合
    updateAllTags();
    
    // 回调通知
    if (loadWordsCallback) loadWordsCallback();
}

// 验证单词数据结构和完整性
function validateWordData(data) {
    // 检查数据是否为数组
    if (!Array.isArray(data)) {
        console.warn('Word data is not an array, initializing empty collection');
        return false;
    }
    
    // 检查每个单词对象的基本结构
    for (let i = 0; i < data.length; i++) {
        const word = data[i];
        
        // 检查必需的字段
        if (!word || typeof word !== 'object') {
            console.warn(`Invalid word object at index ${i}, skipping validation`);
            continue;
        }
        
        // 检查ID字段
        if (!word.id || typeof word.id !== 'string') {
            console.warn(`Word at index ${i} missing or invalid ID`);
            return false;
        }
        
        // 检查translations字段
        if (word.translations && !Array.isArray(word.translations)) {
            console.warn(`Word at index ${i} has invalid translations structure`);
            return false;
        }
        
        // 验证translations数组中的对象
        if (word.translations) {
            for (let j = 0; j < word.translations.length; j++) {
                const translation = word.translations[j];
                if (!translation || typeof translation !== 'object') {
                    console.warn(`Invalid translation at word ${i}, translation ${j}`);
                    return false;
                }
                
                // 检查language字段
                if (!translation.language || typeof translation.language !== 'string') {
                    console.warn(`Translation at word ${i}, translation ${j} missing language`);
                    return false;
                }
            }
        }
        
        // 检查tags字段（如果存在）
        if (word.tags && !Array.isArray(word.tags)) {
            console.warn(`Word at index ${i} has invalid tags structure`);
            return false;
        }
        
        // 检查创建时间字段
        if (word.createdAt && typeof word.createdAt !== 'string') {
            console.warn(`Word at index ${i} has invalid createdAt field`);
            return false;
        }
    }
    
    console.log(`Validated ${data.length} words successfully`);
    return true;
}

// 根据筛选和排序条件获取显示的单词
export function getFilteredAndSortedWords() {
    // 筛选单词
    let filteredWords = words;
    if (selectedTagFilter) {
        filteredWords = words.filter(word => 
            word.tags && word.tags.includes(selectedTagFilter)
        );
    }
    
    // 排序单词
    let sortedWords = [...filteredWords];
    
    switch(currentSortOption) {
        case 'newest':
            sortedWords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'oldest':
            sortedWords.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
        case 'az':
            sortedWords.sort((a, b) => {
                // 按第一个学习语言的单词排序，如果没有则按母语注释排序
                const aText = getWordSortText(a);
                const bText = getWordSortText(b);
                return aText.localeCompare(bText);
            });
            break;
        case 'za':
            sortedWords.sort((a, b) => {
                // 按第一个学习语言的单词排序，如果没有则按母语注释排序
                const aText = getWordSortText(a);
                const bText = getWordSortText(b);
                return bText.localeCompare(aText);
            });
            break;
    }
    
    return sortedWords;
}

// 获取单词的排序文本
function getWordSortText(word) {
    // 如果有第一个学习语言的翻译且单词不为空，使用它
    if (word.translations && word.translations.length > 0 && word.translations[0].text) {
        return word.translations[0].text.toLowerCase();
    }
    
    // 否则使用母语注释
    if (word.nativeNote) {
        return word.nativeNote.toLowerCase();
    }
    
    // 最后使用ID
    return word.id;
}

// 添加新单词
export function addWord(wordData) {
    const newWord = {
        id: Date.now().toString(),
        translations: wordData.translations,
        nativeNote: wordData.nativeNote || null,
        image: wordData.image || null,
        tags: wordData.tags && wordData.tags.length > 0 ? wordData.tags : null,
        createdAt: new Date().toISOString()
    };
    
    // 添加到数组
    words.push(newWord);
    
    // 保存到本地存储
    if (!saveWordsToStorage()) {
        words.pop(); // 保存失败，移除刚添加的单词
        return false;
    }
    
    // 更新标签集合
    updateAllTags();
    if (updateTagFilterSelectCallback) updateTagFilterSelectCallback();
    
    // 更新首页单词计数
    if (updateHomeWordCountCallback) updateHomeWordCountCallback();
    
    // 更新表格（如果需要）
    if (updateWordsTableCallback) updateWordsTableCallback();
    
    return true;
}

// 更新单词
export function updateWord(wordId, wordData) {
    const wordIndex = words.findIndex(w => w.id === wordId);
    if (wordIndex === -1) return false;
    
    words[wordIndex] = {
        ...words[wordIndex],
        translations: wordData.translations,
        nativeNote: wordData.nativeNote || null,
        image: wordData.image || null,
        tags: wordData.tags && wordData.tags.length > 0 ? wordData.tags : null,
        updatedAt: new Date().toISOString()
    };
    
    // 保存到本地存储
    if (!saveWordsToStorage()) {
        return false;
    }
    
    // 更新标签集合
    updateAllTags();
    if (updateTagFilterSelectCallback) updateTagFilterSelectCallback();
    
    // 更新表格（如果需要）
    if (updateWordsTableCallback) updateWordsTableCallback();
    
    return true;
}

// 删除单词
export function deleteWord(wordId) {
    const wordIndex = words.findIndex(w => w.id === wordId);
    if (wordIndex === -1) return false;
    
    const deletedWord = words[wordIndex];
    words.splice(wordIndex, 1);
    
    // 保存到本地存储
    if (!saveWordsToStorage()) {
        return false;
    }
    
    // 更新标签集合
    updateAllTags();
    if (updateTagFilterSelectCallback) updateTagFilterSelectCallback();
    
    // 更新首页单词计数
    if (updateHomeWordCountCallback) updateHomeWordCountCallback();
    
    // 更新表格（如果需要）
    if (updateWordsTableCallback) updateWordsTableCallback();
    
    return deletedWord;
}

// 根据ID获取单词
export function getWordById(wordId) {
    return words.find(w => w.id === wordId);
}

// 获取所有单词数量
export function getWordCount() {
    return words.length;
}

// 导出单词本
export function exportWords() {
    if (words.length === 0) {
        showMessage('单词本为空，没有可导出的内容', 'info');
        return false;
    }
    
    try {
        // 创建导出数据
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            words: words
        };
        
        // 转换为JSON字符串
        const jsonString = JSON.stringify(exportData, null, 2);
        
        // 创建Blob对象
        const blob = new Blob([jsonString], { type: 'application/json' });
        
        // 创建下载链接
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `单词本_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showMessage(`成功导出 ${words.length} 个单词`, 'success');
        return true;
    } catch (error) {
        console.error('导出失败:', error);
        showMessage('导出失败，请重试', 'error');
        return false;
    }
}

// 导入单词本
export function importWords(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const importData = JSON.parse(e.target.result);
                
                // 验证数据格式
                if (!importData.words || !Array.isArray(importData.words)) {
                    showMessage('文件格式不正确，请选择有效的单词本文件', 'error');
                    reject(new Error('Invalid file format'));
                    return;
                }
                
                // 询问用户导入方式
                const importMode = confirm(
                    `检测到 ${importData.words.length} 个单词\n\n` +
                    `点击"确定"合并导入（保留现有单词）\n` +
                    `点击"取消"替换导入（清空现有单词）`
                );
                
                let result;
                if (importMode) {
                    // 合并模式：添加新单词，避免重复ID
                    result = mergeImport(importData.words);
                } else {
                    // 替换模式：清空现有单词，导入新单词
                    result = replaceImport(importData.words);
                }
                
                resolve(result);
            } catch (error) {
                console.error('导入失败:', error);
                showMessage('导入失败：文件格式不正确或文件已损坏', 'error');
                reject(error);
            }
        };
        
        reader.onerror = function() {
            showMessage('读取文件失败，请重试', 'error');
            reject(new Error('File read error'));
        };
        
        reader.readAsText(file);
    });
}

// 合并导入
function mergeImport(importedWords) {
    const existingIds = new Set(words.map(w => w.id));
    let addedCount = 0;
    let skippedCount = 0;
    
    importedWords.forEach(word => {
        if (!existingIds.has(word.id)) {
            words.push(word);
            existingIds.add(word.id);
            addedCount++;
        } else {
            skippedCount++;
        }
    });
    
    // 保存到本地存储
    if (!saveWordsToStorage()) {
        return { success: false };
    }
    
    // 更新标签集合
    updateAllTags();
    if (updateTagFilterSelectCallback) updateTagFilterSelectCallback();
    
    // 更新首页单词计数
    if (updateHomeWordCountCallback) updateHomeWordCountCallback();
    
    // 更新表格（如果需要）
    if (updateWordsTableCallback) updateWordsTableCallback();
    
    return {
        success: true,
        addedCount,
        skippedCount,
        message: `成功导入 ${addedCount} 个单词${skippedCount > 0 ? `，跳过 ${skippedCount} 个重复单词` : ''}`
    };
}

// 替换导入
function replaceImport(importedWords) {
    words = importedWords;
    
    // 保存到本地存储
    if (!saveWordsToStorage()) {
        words = []; // 保存失败，恢复为空数组
        return { success: false };
    }
    
    // 更新标签集合
    updateAllTags();
    if (updateTagFilterSelectCallback) updateTagFilterSelectCallback();
    
    // 更新首页单词计数
    if (updateHomeWordCountCallback) updateHomeWordCountCallback();
    
    // 更新表格（如果需要）
    if (updateWordsTableCallback) updateWordsTableCallback();
    
    return {
        success: true,
        addedCount: words.length,
        message: `成功导入 ${words.length} 个单词（已替换现有单词）`
    };
}

// 重置编辑状态
export function resetEditingState() {
    setEditingWordId(null);
    setDisplayedWordId(null);
}

// 设置选中的标签筛选
export function setSelectedTagFilter(value) {
    selectedTagFilter = value;
}

// 设置排序选项
export function setSortOption(option) {
    currentSortOption = option;
}

// 设置是否显示母语列
export function setShowNativeColumn(value) {
    showNativeColumn = value;
}

// 获取是否显示母语列
export function getShowNativeColumn() {
    return showNativeColumn;
}

// 获取排序选项
export function getSortOption() {
    return currentSortOption;
}

// 更新标签集合
function updateAllTags() {
    allTags.clear();
    words.forEach(word => {
        if (word.tags && Array.isArray(word.tags)) {
            word.tags.forEach(tag => {
                if (tag && tag.trim()) {
                    allTags.add(tag.trim());
                }
            });
        }
    });
    
    if (updateAllTagsCallback) updateAllTagsCallback();
}

// 显示消息辅助函数
function showMessage(text, type = 'success') {
    if (showMessageCallback) {
        showMessageCallback(text, type);
    } else {
        console.log(`[${type.toUpperCase()}] ${text}`);
    }
}