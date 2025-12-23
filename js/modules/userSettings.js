// ./js/modules/userSettings.js

import { STORAGE_KEYS, LANGUAGE_INFO, storage, logger } from './config.js';

// 用户设置管理模块
export let userSettings = {
    nativeLanguage: null,
    learningLanguages: []
};

// 语言配置（从config.js导入并转换为数组格式）
export const availableLanguages = Object.values(LANGUAGE_INFO);

// 全局引用
let showMessageCallback = null;

// DOM元素引用
let nativeLanguageOptionsEl = null;
let learningLanguageOptionsEl = null;
let selectedLanguagesEl = null;
let startAppBtn = null;
let languageSetupEl = null;
let mainAppEl = null;

// 初始化用户设置管理器
export function initUserSettings(options) {
    // 设置回调函数
    if (options.showMessage) showMessageCallback = options.showMessage;
    
    // 设置DOM元素引用
    nativeLanguageOptionsEl = options.nativeLanguageOptionsEl;
    learningLanguageOptionsEl = options.learningLanguageOptionsEl;
    selectedLanguagesEl = options.selectedLanguagesEl;
    startAppBtn = options.startAppBtn;
    languageSetupEl = options.languageSetupEl;
    mainAppEl = options.mainAppEl;
    
    // 从本地存储加载设置
    loadSettingsFromStorage();
    
    // 设置全局引用
    window.userSettings = userSettings;
    window.availableLanguages = availableLanguages;
    
    // 初始化语言选择界面
    initLanguageSelection();
}

// 从存储加载设置
function loadSettingsFromStorage() {
    try {
        const savedSettings = storage.get(STORAGE_KEYS.SETTINGS);
        if (savedSettings) {
            userSettings.nativeLanguage = savedSettings.nativeLanguage || null;
            userSettings.learningLanguages = savedSettings.learningLanguages || [];
        }
    } catch (e) {
        logger.error('解析用户设置失败:', e);
        // 使用默认设置
        userSettings.nativeLanguage = null;
        userSettings.learningLanguages = [];
    }
}

// 保存设置到本地存储
export function saveSettingsToStorage() {
    try {
        const success = storage.set(STORAGE_KEYS.SETTINGS, userSettings);
        if (!success) {
            throw new Error('存储失败');
        }
        return true;
    } catch (error) {
        logger.error('保存设置失败:', error);
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
    // 检查基本设置是否存在
    if (!userSettings.nativeLanguage || userSettings.learningLanguages.length === 0) {
        return false;
    }
    
    // 检查母语是否在学习语言中（不允许相同）
    if (userSettings.learningLanguages.includes(userSettings.nativeLanguage)) {
        return false;
    }
    
    return true;
}

// 检查并修复设置冲突
export function validateAndFixSettings() {
    let hasChanges = false;
    
    // 如果母语在学习语言中，从学习语言中移除
    if (userSettings.nativeLanguage && userSettings.learningLanguages.includes(userSettings.nativeLanguage)) {
        userSettings.learningLanguages = userSettings.learningLanguages.filter(lang => lang !== userSettings.nativeLanguage);
        hasChanges = true;
        logger.warn('检测到母语和学习语言冲突，已自动修复');
    }
    
    // 如果学习语言为空，重置所有设置
    if (userSettings.learningLanguages.length === 0 && userSettings.nativeLanguage) {
        userSettings.nativeLanguage = null;
        hasChanges = true;
        logger.warn('学习语言为空，已重置所有语言设置');
    }
    
    return hasChanges;
}

// 迁移单词数据：处理母语切换时的数据转换
// 1. 将新母语的翻译内容设置为母语注释
// 2. 将原母语注释转换为翻译（如果它应该成为学习语言）
export function migrateLanguageData(previousNativeLanguage = null) {
    // 动态导入wordManager来避免循环依赖
    return import('./wordManager.js').then(wordManager => {
        const words = wordManager.words;
        let migratedCount = 0;
        
        if (!userSettings.nativeLanguage || words.length === 0) {
            return { migratedCount: 0, message: '无需迁移数据' };
        }
        
        words.forEach(word => {
            if (!word.translations) word.translations = [];
            
            let hasChanges = false;
            
            // 保存原来的母语注释，用于后续转换
            const originalNativeNote = word.nativeNote;
            
            // 步骤1: 查找与新母语相同的翻译
            const nativeTranslation = word.translations.find(t => t.language === userSettings.nativeLanguage);
            
            // 如果找到了与新母语相同的翻译，先设置为新的母语注释
            if (nativeTranslation && nativeTranslation.text) {
                // 将该翻译的内容设置为新的母语注释
                word.nativeNote = nativeTranslation.text;
                
                // 从翻译列表中移除该语言
                word.translations = word.translations.filter(t => t.language !== userSettings.nativeLanguage);
                hasChanges = true;
                
                logger.info(`已将 "${nativeTranslation.text}" 设置为母语注释`);
            }
            
            // 步骤2: 将原来的母语注释转换为翻译（如果原母语现在是学习语言）
            if (previousNativeLanguage && 
                originalNativeNote && 
                userSettings.learningLanguages.includes(previousNativeLanguage)) {
                
                // 检查是否已经存在该语言的翻译
                const existingTranslation = word.translations.find(t => t.language === previousNativeLanguage);
                
                if (!existingTranslation) {
                    // 将原母语注释转换为翻译
                    word.translations.push({
                        language: previousNativeLanguage,
                        text: originalNativeNote,
                        phonetic: '',
                        example: '',
                        audio: null
                    });
                    hasChanges = true;
                    logger.info(`已将原母语注释 "${originalNativeNote}" 转换为 ${getLanguageInfo(previousNativeLanguage)?.name || previousNativeLanguage} 翻译`);
                } else if (!existingTranslation.text) {
                    // 如果翻译存在但没有文本，用原母语注释填充
                    existingTranslation.text = originalNativeNote;
                    hasChanges = true;
                    logger.info(`已用原母语注释 "${originalNativeNote}" 填充 ${getLanguageInfo(previousNativeLanguage)?.name || previousNativeLanguage} 翻译`);
                }
            }
            
            // 步骤3: 如果没有找到新母语的翻译，但有原母语注释，需要处理
            if (!nativeTranslation && !word.nativeNote && originalNativeNote) {
                // 如果新母语没有翻译，保持原来的母语注释
                word.nativeNote = originalNativeNote;
                logger.info(`保持原母语注释 "${originalNativeNote}"，因为新母语 ${getLanguageInfo(userSettings.nativeLanguage)?.name || userSettings.nativeLanguage} 没有翻译`);
            } else if (!nativeTranslation && previousNativeLanguage !== userSettings.nativeLanguage) {
                // 如果没有找到新母语的翻译，且没有母语注释，标记为需要用户填写
                logger.info(`单词缺少 ${getLanguageInfo(userSettings.nativeLanguage)?.name || userSettings.nativeLanguage} 翻译，需要用户手动添加`);
            }
            
            if (hasChanges) {
                migratedCount++;
            }
        });
        
        if (migratedCount > 0) {
            // 保存更新后的单词数据
            if (wordManager.saveWordsToStorage) {
                wordManager.saveWordsToStorage();
            } else {
                // 备用保存方法
                try {
                    localStorage.setItem('polyglotWords', JSON.stringify(words));
                } catch (error) {
                    logger.error('保存单词数据失败:', error);
                }
            }
            const newLanguageName = getLanguageInfo(userSettings.nativeLanguage)?.name || '母语';
            const previousLanguageName = previousNativeLanguage ? 
                (getLanguageInfo(previousNativeLanguage)?.name || previousNativeLanguage) : '原母语';
            
            return { 
                migratedCount, 
                message: `已成功处理 ${migratedCount} 个单词的语言切换：${previousLanguageName} → ${newLanguageName}` 
            };
        }
        
        return { migratedCount: 0, message: '无需迁移数据' };
    }).catch(error => {
        logger.error('数据迁移失败:', error);
        return { migratedCount: 0, message: '数据迁移失败' };
    });
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

// 初始化语言选择界面
function initLanguageSelection() {
    // 检查是否在单词列表页面
    const isWordsListPage = window.location.pathname.includes('words_list.html');
    
    if (isWordsListPage) {
        // 检查是否有已保存的设置
        const savedSettings = storage.get(STORAGE_KEYS.SETTINGS);
        if (savedSettings) {
            userSettings.nativeLanguage = savedSettings.nativeLanguage;
            userSettings.learningLanguages = savedSettings.learningLanguages || [];
            
            // 验证并修复设置冲突
            const hasChanges = validateAndFixSettings();
            if (hasChanges) {
                // 如果有修复，保存修复后的设置
                saveSettingsToStorage();
            }
            
            if (isSettingsComplete()) {
                // 设置已完成且有效，显示主应用
                if (languageSetupEl) languageSetupEl.style.display = 'none';
                if (mainAppEl) mainAppEl.style.display = 'block';
                updateUserLanguagesDisplay();
                return;
            }
        }
        
        // 如果没有有效设置，跳转到首页
        window.location.href = 'index.html';
        return;
    }
    
    // 检查是否有已保存的设置
    const savedSettings = storage.get(STORAGE_KEYS.SETTINGS);
    
    if (savedSettings) {
        userSettings.nativeLanguage = savedSettings.nativeLanguage;
        userSettings.learningLanguages = savedSettings.learningLanguages || [];
        
        // 验证并修复设置冲突
        const hasChanges = validateAndFixSettings();
        if (hasChanges) {
            // 如果有修复，保存修复后的设置并显示提示
            saveSettingsToStorage();
            
            // 执行数据迁移
            migrateLanguageData().then(result => {
                if (result.migratedCount > 0) {
                    showMessage(`${result.message}，请重新确认您的语言选择`, 'warning');
                } else {
                    showMessage('检测到语言设置冲突，已自动修复，请重新确认您的语言选择', 'warning');
                }
            });
        }
    }
    
    // 始终生成语言选项（无论设置是否完整）
    generateLanguageOptions();
    
    // 检查设置是否完整，决定显示哪个页面
    const settingsComplete = isSettingsComplete();
    
    if (settingsComplete) {
        // 设置完整：隐藏语言选择页面，显示主应用
        if (languageSetupEl) {
            languageSetupEl.style.display = 'none';
        }
        if (mainAppEl) {
            mainAppEl.style.display = 'block';
            updateUserLanguagesDisplay();
            
            // 生成语言输入框
            const languageInputsContainerEl = document.getElementById('language-inputs-container');
            if (languageInputsContainerEl) {
                generateLanguageInputs(languageInputsContainerEl);
            }
        }
    } else {
        // 设置不完整：显示语言选择页面，隐藏主应用
        if (languageSetupEl) {
            languageSetupEl.style.display = 'block';
        }
        if (mainAppEl) {
            mainAppEl.style.display = 'none';
        }
    }
    
    // 绑定开始按钮事件（避免重复绑定）
    if (startAppBtn && !startAppBtn.hasAttribute('data-event-bound')) {
        startAppBtn.setAttribute('data-event-bound', 'true');
        startAppBtn.addEventListener('click', () => {
            if (isSettingsComplete()) {
                // 保存设置到本地存储
                saveSettingsToStorage();
                
                // 隐藏语言选择页面，显示主应用
                if (languageSetupEl) {
                    languageSetupEl.style.display = 'none';
                }
                if (mainAppEl) {
                    mainAppEl.style.display = 'block';
                }
                
                updateUserLanguagesDisplay();
                
                // 生成语言输入框
                const languageInputsContainerEl = document.getElementById('language-inputs-container');
                if (languageInputsContainerEl) {
                    generateLanguageInputs(languageInputsContainerEl);
                }
                
                showMessage('语言设置已保存！', 'success');
            } else {
                if (!userSettings.nativeLanguage) {
                    showMessage('请选择您的母语', 'error');
                } else if (userSettings.learningLanguages.length === 0) {
                    showMessage('请至少选择一种学习语言', 'error');
                } else {
                    showMessage('请确保母语和学习语言不相同', 'error');
                }
            }
        });
    }
}

// 生成语言选项（独立函数）
function generateLanguageOptions() {
    // 生成语言选项
    if (nativeLanguageOptionsEl && learningLanguageOptionsEl) {
        // 清空现有选项
        nativeLanguageOptionsEl.innerHTML = '';
        learningLanguageOptionsEl.innerHTML = '';
        
        // 生成母语选项
        availableLanguages.forEach((language) => {
            const langEl = createLanguageOption(language, 'native');
            nativeLanguageOptionsEl.appendChild(langEl);
        });
        
        // 生成学习语言选项
        availableLanguages.forEach((language) => {
            const langEl = createLanguageOption(language, 'learning');
            learningLanguageOptionsEl.appendChild(langEl);
        });
        
        // 恢复已选择的语言状态
        if (userSettings.nativeLanguage) {
            const nativeOption = nativeLanguageOptionsEl.querySelector(`[data-code="${userSettings.nativeLanguage}"]`);
            if (nativeOption) {
                nativeOption.classList.add('selected');
            }
        }
        
        userSettings.learningLanguages.forEach(langCode => {
            const learningOption = learningLanguageOptionsEl.querySelector(`[data-code="${langCode}"]`);
            if (learningOption) {
                learningOption.classList.add('selected');
            }
        });
        
        // 更新已选语言显示
        updateSelectedLanguagesDisplay();
    }
}

// 创建语言选项元素
function createLanguageOption(language, type) {
    const div = document.createElement('div');
    div.className = 'language-option';
    div.dataset.code = language.code;
    div.innerHTML = `
        <div class="language-flag">${language.flag}</div>
        <div class="language-name">${language.name}</div>
        <div class="language-code">${language.code.toUpperCase()}</div>
    `;
    
    div.addEventListener('click', () => {
        if (type === 'native') {
            selectNativeLanguageUI(language.code);
        } else {
            toggleLearningLanguageUI(language.code);
        }
    });
    
    return div;
}

// 选择母语（UI版本）- 这里是关键的修复
function selectNativeLanguageUI(languageCode) {
    // 记录之前的母语
    const previousNativeLanguage = userSettings.nativeLanguage;
    
    userSettings.nativeLanguage = languageCode;
    
    // 如果新选择的母语在学习语言中，从学习语言中移除
    if (userSettings.learningLanguages.includes(languageCode)) {
        userSettings.learningLanguages = userSettings.learningLanguages.filter(lang => lang !== languageCode);
        
        // 更新学习语言选项的UI状态
        if (learningLanguageOptionsEl) {
            const learningOption = learningLanguageOptionsEl.querySelector(`[data-code="${languageCode}"]`);
            if (learningOption) {
                learningOption.classList.remove('selected');
            }
        }
        
        showMessage('已从学习语言中移除与母语相同的语言', 'info');
    }
    
    // 移除所有已选中的母语
    if (nativeLanguageOptionsEl) {
        nativeLanguageOptionsEl.querySelectorAll('.language-option').forEach(el => {
            el.classList.remove('selected');
        });
        
        // 标记当前选中的母语
        const selectedEl = nativeLanguageOptionsEl.querySelector(`[data-code="${languageCode}"]`);
        if (selectedEl) {
            selectedEl.classList.add('selected');
        }
    }
    
    // 如果母语发生了变化，执行数据迁移
    if (previousNativeLanguage && previousNativeLanguage !== languageCode) {
        // 延迟执行数据迁移，确保UI更新完成
        setTimeout(() => {
            migrateLanguageData(previousNativeLanguage).then(result => {
                if (result.migratedCount > 0) {
                    showMessage(result.message, 'success');
                }
            });
        }, 100);
    }
    
    updateSelectedLanguagesDisplay();
}

// 切换学习语言（UI版本）
function toggleLearningLanguageUI(languageCode) {
    // 防止选择与母语相同的学习语言
    if (languageCode === userSettings.nativeLanguage) {
        showMessage('学习语言不能与母语相同', 'error');
        return;
    }
    
    const langIndex = userSettings.learningLanguages.indexOf(languageCode);
    const langEl = learningLanguageOptionsEl?.querySelector(`[data-code="${languageCode}"]`);
    
    if (langIndex === -1) {
        // 添加语言
        userSettings.learningLanguages.push(languageCode);
        if (langEl) langEl.classList.add('selected');
    } else {
        // 移除语言
        userSettings.learningLanguages.splice(langIndex, 1);
        if (langEl) langEl.classList.remove('selected');
    }
    
    updateSelectedLanguagesDisplay();
}

// 更新已选语言显示
export function updateSelectedLanguagesDisplay() {
    if (!selectedLanguagesEl) return;
    
    selectedLanguagesEl.innerHTML = '';
    
    if (userSettings.nativeLanguage || userSettings.learningLanguages.length > 0) {
        // 添加母语
        if (userSettings.nativeLanguage) {
            const nativeLang = availableLanguages.find(l => l.code === userSettings.nativeLanguage);
            if (nativeLang) {
                const tag = document.createElement('div');
                tag.className = 'selected-language native-language';
                tag.innerHTML = `${nativeLang.flag} ${nativeLang.name} (母语)`;
                selectedLanguagesEl.appendChild(tag);
            }
        }
        
        // 添加学习语言
        userSettings.learningLanguages.forEach(langCode => {
            const language = availableLanguages.find(l => l.code === langCode);
            if (language) {
                const tag = document.createElement('div');
                tag.className = 'selected-language learning-language';
                tag.innerHTML = `${language.flag} ${language.name}`;
                selectedLanguagesEl.appendChild(tag);
            }
        });
    } else {
        selectedLanguagesEl.innerHTML = `
            <div style="color: #94a3b8; padding: 10px; border: 1px dashed #cbd5e1; border-radius: 8px; text-align: center;">
                请从上方选择语言
            </div>
        `;
    }
}

// 更新用户语言显示（顶部栏）
export function updateUserLanguagesDisplay() {
    const userLanguagesDisplayEl = document.getElementById('user-languages-display');
    if (!userLanguagesDisplayEl) return;
    
    userLanguagesDisplayEl.innerHTML = '';
    
    // 添加母语
    const nativeLang = availableLanguages.find(l => l.code === userSettings.nativeLanguage);
    if (nativeLang) {
        const tag = document.createElement('div');
        tag.className = 'user-language native';
        tag.innerHTML = `
            <span class="language-flag-small">${nativeLang.flag}</span>
            <span class="language-text">${nativeLang.name}</span>
        `;
        userLanguagesDisplayEl.appendChild(tag);
    }
    
    // 添加学习语言
    userSettings.learningLanguages.forEach(langCode => {
        const language = availableLanguages.find(l => l.code === langCode);
        if (language) {
            const tag = document.createElement('div');
            tag.className = 'user-language learning';
            tag.innerHTML = `
                <span class="language-flag-small">${language.flag}</span>
                <span class="language-text">${language.name}</span>
            `;
            userLanguagesDisplayEl.appendChild(tag);
        }
    });
}

// 重新初始化语言选择界面（公开函数，供设置按钮调用）
export function reinitLanguageSelection() {
    // 显示语言选择页面
    if (languageSetupEl) {
        languageSetupEl.style.display = 'block';
    }
    if (mainAppEl) {
        mainAppEl.style.display = 'none';
    }
    
    // 重新生成语言选项
    generateLanguageOptions();
}

// 生成语言输入框
export function generateLanguageInputs(containerEl) {
    if (!containerEl) return;
    
    containerEl.innerHTML = '';
    
    // 为每个学习语言生成输入框
    userSettings.learningLanguages.forEach((langCode) => {
        const language = availableLanguages.find(l => l.code === langCode);
        
        if (language) {
            const inputGroup = document.createElement('div');
            inputGroup.className = 'language-input-group';
            inputGroup.innerHTML = `
                <div class="language-label">
                    <span class="language-flag">${language.flag}</span>
                    <span class="language-name">${language.name}</span>
                </div>
                <div class="language-input-container">
                    <input type="text" 
                           class="form-control language-input language-word-input" 
                           id="${langCode}-word"
                           data-lang="${langCode}"
                           placeholder="输入${language.name}单词">
                    <div class="language-input-actions">
                        <button type="button" class="translate-btn" data-lang="${langCode}" title="自动翻译">
                            <i class="fas fa-language"></i>
                        </button>
                        <button type="button" class="play-audio-btn" id="${langCode}-play-audio" data-lang="${langCode}" title="播放发音" style="display: none;">
                            <i class="fas fa-volume-up"></i>
                        </button>
                        <button type="button" class="record-audio-btn" id="${langCode}-record-audio" data-lang="${langCode}" title="录制发音">
                            <i class="fas fa-microphone"></i>
                        </button>
                        <span class="audio-badge" id="${langCode}-audio-badge" style="display: none;">🎤</span>
                    </div>
                </div>
                <div class="language-extra-fields" id="${langCode}-extra-fields" style="display: none;">
                    <input type="text" 
                           class="form-control phonetic-input" 
                           id="${langCode}-phonetic"
                           data-lang="${langCode}"
                           placeholder="音标（可选）">
                    <textarea class="form-control example-input" 
                              id="${langCode}-example"
                              data-lang="${langCode}"
                              placeholder="例句（可选）"
                              rows="2"></textarea>
                </div>
                <button type="button" class="language-expand-btn" data-lang="${langCode}">
                    <span>更多选项</span>
                    <i class="fas fa-chevron-down"></i>
                </button>
            `;
            containerEl.appendChild(inputGroup);
            
            // 添加展开按钮事件
            const expandBtn = inputGroup.querySelector('.language-expand-btn');
            const extraFields = inputGroup.querySelector(`#${langCode}-extra-fields`);
            if (expandBtn && extraFields) {
                expandBtn.addEventListener('click', () => {
                    const isExpanded = extraFields.style.display !== 'none';
                    extraFields.style.display = isExpanded ? 'none' : 'block';
                    const icon = expandBtn.querySelector('i');
                    if (icon) {
                        if (isExpanded) {
                            icon.classList.remove('fa-chevron-up');
                            icon.classList.add('fa-chevron-down');
                        } else {
                            icon.classList.remove('fa-chevron-down');
                            icon.classList.add('fa-chevron-up');
                        }
                    }
                });
            }
        }
    });
}