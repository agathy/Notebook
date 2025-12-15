// 翻译与自动填充模块
// 依赖：window.userSettings 与全局 showMessage（由主入口提供）

// 语言代码映射到翻译API代码
const translateLangMap = {
    'zh': 'zh-CN',
    'en': 'en',
    'ko': 'ko',
    'es': 'es'
};

const getUserSettings = () => window.userSettings || { learningLanguages: [] };
const getShowMessage = () => window.showMessage || (() => {});

// 存储自动翻译的输入框（用于标记）
export const autoTranslatedInputs = new Set();

// 防抖定时器
let translateDebounceTimer = null;

// 设置自动翻译功能
export function setupAutoTranslate() {
    // 为每个语言输入框添加事件监听
    document.querySelectorAll('.language-word-input').forEach(input => {
        const langCode = input.getAttribute('data-lang');
        
        // 输入事件（防抖）
        input.addEventListener('input', function() {
            const word = this.value.trim();
            
            // 如果用户手动修改了自动翻译的内容，移除标记和按钮
            if (autoTranslatedInputs.has(this.id)) {
                const translateActions = document.getElementById(`${langCode}-translate-actions`);
                if (translateActions) {
                    translateActions.style.display = 'none';
                }
                autoTranslatedInputs.delete(this.id);
                this.classList.remove('auto-translated');
            }
            
            // 清除之前的定时器
            if (translateDebounceTimer) {
                clearTimeout(translateDebounceTimer);
            }
            
            // 如果输入框为空，清除自动翻译标记
            if (!word) {
                autoTranslatedInputs.delete(this.id);
                this.classList.remove('auto-translated');
                const translateActions = document.getElementById(`${langCode}-translate-actions`);
                if (translateActions) {
                    translateActions.style.display = 'none';
                }
                return;
            }
            
            // 如果这个输入框已经有内容且不是自动翻译的，触发翻译
            if (word && !autoTranslatedInputs.has(this.id)) {
                translateDebounceTimer = setTimeout(() => {
                    autoTranslateWord(word, langCode);
                }, 800); // 800ms 防抖
            }
        });
        
        // 当输入框失去焦点时，如果内容被修改，自动接受翻译
        input.addEventListener('blur', function() {
            if (autoTranslatedInputs.has(this.id) && this.value.trim()) {
                acceptTranslation(langCode);
            }
        });
    });
    
    // 使用事件委托处理接受/拒绝翻译按钮（按钮是动态生成的）
    setTimeout(() => {
        document.querySelectorAll('.accept-translate-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const langCode = this.getAttribute('data-lang');
                acceptTranslation(langCode);
            });
        });
        
        document.querySelectorAll('.reject-translate-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const langCode = this.getAttribute('data-lang');
                rejectTranslation(langCode);
            });
        });
    }, 150);
}

// 接受翻译
export function acceptTranslation(langCode) {
    const input = document.getElementById(`${langCode}-word`);
    const translateActions = document.getElementById(`${langCode}-translate-actions`);
    
    if (input && autoTranslatedInputs.has(input.id)) {
        input.classList.remove('auto-translated');
        input.classList.add('translation-accepted');
        autoTranslatedInputs.delete(input.id);
        
        if (translateActions) {
            translateActions.style.display = 'none';
        }
        
        // 2秒后移除接受标记
        setTimeout(() => {
            input.classList.remove('translation-accepted');
        }, 2000);
    }
}

// 拒绝翻译
export function rejectTranslation(langCode) {
    const input = document.getElementById(`${langCode}-word`);
    const translateActions = document.getElementById(`${langCode}-translate-actions`);
    
    if (input && autoTranslatedInputs.has(input.id)) {
        input.value = '';
        input.classList.remove('auto-translated');
        autoTranslatedInputs.delete(input.id);
        
        if (translateActions) {
            translateActions.style.display = 'none';
        }
    }
}

// 自动翻译单词
export async function autoTranslateWord(sourceWord, sourceLangCode) {
    if (!sourceWord || sourceWord.length === 0) return;
    
    // 获取需要翻译的目标语言
    const targetLanguages = getUserSettings().learningLanguages.filter(lang => lang !== sourceLangCode);
    if (targetLanguages.length === 0) return;
    
    // 显示翻译中提示
    getShowMessage()('正在自动翻译...', 'info');
    
    // 为每个目标语言翻译
    const translatePromises = targetLanguages.map(async (targetLangCode) => {
        try {
            const translation = await translateText(sourceWord, sourceLangCode, targetLangCode);
            if (translation) {
                const targetInput = document.getElementById(`${targetLangCode}-word`);
                const translateActions = document.getElementById(`${targetLangCode}-translate-actions`);
                
                if (targetInput && !targetInput.value.trim()) {
                    targetInput.value = translation;
                    targetInput.classList.add('auto-translated');
                    autoTranslatedInputs.add(targetInput.id);
                    
                    // 显示接受/拒绝按钮
                    if (translateActions) {
                        translateActions.style.display = 'flex';
                    }
                }
            }
        } catch (error) {
            console.error(`翻译到 ${targetLangCode} 失败:`, error);
        }
    });
    
    await Promise.all(translatePromises);
    getShowMessage()('翻译完成', 'success');
}

// 翻译文本（使用 MyMemory 免费接口）
export async function translateText(text, fromLang, toLang) {
    try {
        const fromCode = translateLangMap[fromLang] || fromLang;
        const toCode = translateLangMap[toLang] || toLang;
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromCode}|${toCode}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.responseStatus === 200 && data.responseData && data.responseData.translatedText) {
            return data.responseData.translatedText;
        } else {
            throw new Error('翻译失败');
        }
    } catch (error) {
        console.error('翻译错误:', error);
        // 备用：Google Translate 免费接口
        try {
            return await translateTextGoogle(text, fromLang, toLang);
        } catch (e) {
            console.error('备用翻译也失败:', e);
            return null;
        }
    }
}

// 备用翻译方法（Google Translate 免费接口）
export async function translateTextGoogle(text, fromLang, toLang) {
    try {
        const fromCode = translateLangMap[fromLang] || fromLang;
        const toCode = translateLangMap[toLang] || toLang;
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromCode}&tl=${toCode}&dt=t&q=${encodeURIComponent(text)}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data && data[0] && data[0][0] && data[0][0][0]) {
            return data[0][0][0];
        }
        throw new Error('翻译失败');
    } catch (error) {
        console.error('Google翻译错误:', error);
        return null;
    }
}
