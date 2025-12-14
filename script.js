// 语言配置
const availableLanguages = [
    { code: 'zh', name: '中文', flag: '🇨🇳', color: '#dc2626' },
    { code: 'en', name: '英语', flag: '🇺🇸', color: '#3b82f6' },
    { code: 'ko', name: '韩语', flag: '🇰🇷', color: '#1e40af' },
    { code: 'es', name: '西班牙语', flag: '🇪🇸', color: '#ef4444' }
];

// 用户设置
let userSettings = {
    nativeLanguage: null,
    learningLanguages: []
};

// 单词数据
let words = [];

// 当前编辑的单词ID
let editingWordId = null;

// 当前显示的单词ID
let displayedWordId = null;

// 是否显示母语列
let showNativeColumn = true;

// 当前选中的标签筛选
let selectedTagFilter = '';

// 当前排序方式
let currentSortOption = 'newest';

// 所有标签集合
let allTags = new Set();

// 检测当前页面
const isWordsListPage = window.location.pathname.includes('WordsList.html');

// DOM元素（可能为null，取决于当前页面）
const messageEl = document.getElementById('message');
const languageSetupEl = document.getElementById('language-setup');
const mainAppEl = document.getElementById('main-app');
const nativeLanguageOptionsEl = document.getElementById('native-language-options');
const learningLanguageOptionsEl = document.getElementById('learning-language-options');
const selectedLanguagesEl = document.getElementById('selected-languages');
const startAppBtn = document.getElementById('start-app');
const userLanguagesDisplayEl = document.getElementById('user-languages-display');
const settingsBtn = document.getElementById('settings-btn');
const bigAddBtn = document.getElementById('big-add-btn');
const addWordModalEl = document.getElementById('add-word-modal');
const closeModalBtn = document.getElementById('close-modal');
const addWordFormEl = document.getElementById('add-word-form');
const wordsTableEl = document.getElementById('words-table');
const wordsTableBodyEl = document.getElementById('words-table-body');
const emptyTableEl = document.getElementById('empty-table');
const wordCountEl = document.getElementById('word-count');
const toggleNativeBtn = document.getElementById('toggle-native-btn');
const languageInputsContainerEl = document.getElementById('language-inputs-container');
const resetFormBtn = document.getElementById('reset-form');
const deleteWordBtn = document.getElementById('delete-word-btn');
const modalTitleEl = document.getElementById('modal-title');
const modalDescriptionEl = document.getElementById('modal-description');
const saveWordBtn = document.getElementById('save-word-btn');
const imageUrlInput = document.getElementById('image-url');
const imagePreview = document.getElementById('image-preview');
const imageUploadInput = document.getElementById('image-upload');
const clearImageBtn = document.getElementById('clear-image-btn');
const deleteModalEl = document.getElementById('delete-modal');
const closeDeleteModalBtn = document.getElementById('close-delete-modal');
const cancelDeleteBtn = document.getElementById('cancel-delete');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const deleteConfirmTextEl = document.getElementById('delete-confirm-text');
const wordCardOverlayEl = document.getElementById('word-card-overlay');
const wordCardEl = document.getElementById('word-card');
const tagFilterSelect = document.getElementById('tag-filter');
const sortOptionSelect = document.getElementById('sort-option');
const tagsInputContainer = document.getElementById('tags-input-container');
const tagInput = document.getElementById('tag-input');
const tagsSuggestionsEl = document.getElementById('tags-suggestions');
const exportBtn = document.getElementById('export-btn');
const importFileInput = document.getElementById('import-file');
const homeWordCountEl = document.getElementById('home-word-count');
const cameraBtn = document.getElementById('camera-btn');
const drawBtn = document.getElementById('draw-btn');
const cameraModal = document.getElementById('camera-modal');
const cameraVideo = document.getElementById('camera-video');
const cameraCanvas = document.getElementById('camera-canvas');
const captureBtn = document.getElementById('capture-btn');
const retakeBtn = document.getElementById('retake-btn');
const usePhotoBtn = document.getElementById('use-photo-btn');
const closeCameraModalBtn = document.getElementById('close-camera-modal');
const drawModal = document.getElementById('draw-modal');
const drawCanvas = document.getElementById('draw-canvas');
const drawColor = document.getElementById('draw-color');
const drawSize = document.getElementById('draw-size');
const drawSizeValue = document.getElementById('draw-size-value');
const clearCanvasBtn = document.getElementById('clear-canvas-btn');
const useDrawingBtn = document.getElementById('use-drawing-btn');
const closeDrawModalBtn = document.getElementById('close-draw-modal');

// 显示消息
function showMessage(text, type = 'success') {
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';
    
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 3000);
}

// 初始化语言选择
function initLanguageSelection() {
    // 如果是单词列表页面，不需要显示语言选择页面
    if (isWordsListPage) {
        // 检查是否有已保存的设置
        const savedSettings = localStorage.getItem('polyglotSettings');
        if (savedSettings) {
            try {
                const parsedSettings = JSON.parse(savedSettings);
                userSettings = parsedSettings;
                showMainApp();
            } catch (e) {
                console.error('解析设置失败:', e);
            }
        }
        return;
    }
    
    // 首页：初始化语言选择
    if (nativeLanguageOptionsEl && learningLanguageOptionsEl) {
        // 清空语言选项
        nativeLanguageOptionsEl.innerHTML = '';
        learningLanguageOptionsEl.innerHTML = '';
        
        // 生成母语选项
        availableLanguages.forEach(language => {
            const langEl = createLanguageOption(language, 'native');
            nativeLanguageOptionsEl.appendChild(langEl);
        });
        
        // 生成学习语言选项
        availableLanguages.forEach(language => {
            const langEl = createLanguageOption(language, 'learning');
            learningLanguageOptionsEl.appendChild(langEl);
        });
    }
    
    // 检查是否有已保存的设置
    const savedSettings = localStorage.getItem('polyglotSettings');
    if (savedSettings) {
        try {
            const parsedSettings = JSON.parse(savedSettings);
            userSettings = parsedSettings;
            
            // 如果有设置，直接进入主应用
            showMainApp();
        } catch (e) {
            console.error('解析设置失败:', e);
        }
    }
}

// 创建语言选项
function createLanguageOption(language, type) {
    const div = document.createElement('div');
    div.className = `language-option language-${language.code}`;
    div.dataset.code = language.code;
    
    div.innerHTML = `
        <div class="language-icon">${language.flag}</div>
        <div class="language-name">${language.name}</div>
        <div class="language-code">${language.code.toUpperCase()}</div>
    `;
    
    // 添加点击事件
    div.addEventListener('click', () => {
        if (type === 'native') {
            selectNativeLanguage(language.code);
        } else {
            toggleLearningLanguage(language.code);
        }
    });
    
    return div;
}

// 选择母语
function selectNativeLanguage(languageCode) {
    // 移除所有已选中的母语
    document.querySelectorAll('#native-language-options .language-option').forEach(el => {
        el.classList.remove('selected');
    });
    
    // 选中当前点击的语言
    const selectedEl = document.querySelector(`#native-language-options .language-option[data-code="${languageCode}"]`);
    if (selectedEl) {
        selectedEl.classList.add('selected');
        userSettings.nativeLanguage = languageCode;
    }
}

// 切换学习语言
function toggleLearningLanguage(languageCode) {
    const langIndex = userSettings.learningLanguages.indexOf(languageCode);
    const langEl = document.querySelector(`#learning-language-options .language-option[data-code="${languageCode}"]`);
    
    if (langIndex === -1) {
        // 添加语言
        userSettings.learningLanguages.push(languageCode);
        if (langEl) {
            langEl.classList.add('selected');
        }
    } else {
        // 移除语言
        userSettings.learningLanguages.splice(langIndex, 1);
        if (langEl) {
            langEl.classList.remove('selected');
        }
    }
    
    // 更新已选语言显示
    updateSelectedLanguagesDisplay();
}

// 更新已选语言显示
function updateSelectedLanguagesDisplay() {
    selectedLanguagesEl.innerHTML = '';
    
    if (userSettings.learningLanguages.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.innerHTML = `
            <div style="color: #94a3b8; padding: 10px; border: 1px dashed #cbd5e1; border-radius: 8px; text-align: center;">
                请从上方选择语言
            </div>
        `;
        selectedLanguagesEl.appendChild(emptyDiv);
        return;
    }
    
    userSettings.learningLanguages.forEach(langCode => {
        const language = availableLanguages.find(l => l.code === langCode);
        if (language) {
            const tag = document.createElement('div');
            tag.className = 'selected-language-tag';
            tag.innerHTML = `
                ${language.flag} ${language.name}
            `;
            
            selectedLanguagesEl.appendChild(tag);
        }
    });
}

// 显示主应用
function showMainApp() {
    // 隐藏语言设置页面（如果存在）
    if (languageSetupEl) {
        languageSetupEl.style.display = 'none';
    }
    
    // 显示主应用
    if (mainAppEl) {
        mainAppEl.style.display = 'block';
    }
    
    // 更新用户语言显示
    updateUserLanguagesDisplay();
    
    // 更新首页单词数量
    updateHomeWordCount();
    
    // 如果当前页面是单词列表页面，加载单词列表
    if (isWordsListPage) {
        loadWords();
    }
    
    // 生成添加单词表单的语言输入框
    generateLanguageInputs();
}

// 更新首页单词数量
function updateHomeWordCount() {
    if (homeWordCountEl) {
        const wordCount = words.length;
        if (wordCount === 0) {
            homeWordCountEl.textContent = '查看和管理所有单词';
        } else {
            homeWordCountEl.textContent = `共 ${wordCount} 个单词`;
        }
    }
}

// 更新用户语言显示
function updateUserLanguagesDisplay() {
    if (!userLanguagesDisplayEl) return;
    
    userLanguagesDisplayEl.innerHTML = '';
    
    // 添加母语
    const nativeLang = availableLanguages.find(l => l.code === userSettings.nativeLanguage);
    if (nativeLang) {
        const tag = document.createElement('div');
        tag.className = 'user-lang-tag native-tag';
        tag.innerHTML = `${nativeLang.flag} ${nativeLang.name} (母语)`;
        userLanguagesDisplayEl.appendChild(tag);
    }
    
    // 添加学习语言
    userSettings.learningLanguages.forEach(langCode => {
        const language = availableLanguages.find(l => l.code === langCode);
        if (language) {
            const tag = document.createElement('div');
            tag.className = 'user-lang-tag';
            tag.innerHTML = `${language.flag} ${language.name}`;
            userLanguagesDisplayEl.appendChild(tag);
        }
    });
}

// 生成语言输入框
function generateLanguageInputs() {
    languageInputsContainerEl.innerHTML = '';
    
    // 为每个学习语言生成输入框
    userSettings.learningLanguages.forEach(langCode => {
        const language = availableLanguages.find(l => l.code === langCode);
        if (language) {
            const inputGroup = document.createElement('div');
            inputGroup.className = 'language-input-group';
            
            inputGroup.innerHTML = `
                <div class="language-input-label">
                    <span class="language-input-flag" style="background-color: ${language.color}">${language.code.toUpperCase()}</span>
                    <span>${language.name}</span>
                </div>
                <input type="text" class="form-control language-word-input" 
                       id="${langCode}-word" 
                       data-lang="${langCode}"
                       placeholder="输入${language.name}单词（可选）">
                <input type="text" class="form-control language-phonetic-input" 
                       id="${langCode}-phonetic" 
                       data-lang="${langCode}"
                       placeholder="音标（可选）">
                <textarea class="form-control language-example-input" 
                       id="${langCode}-example" 
                       data-lang="${langCode}"
                       placeholder="例句（可选）"></textarea>
            `;
            
            languageInputsContainerEl.appendChild(inputGroup);
        }
    });
}

// 加载单词
function loadWords() {
    words = JSON.parse(localStorage.getItem('polyglotWords')) || [];
    
    // 更新首页单词数量
    updateHomeWordCount();
    
    // 如果当前页面是单词列表页面，更新单词列表
    if (isWordsListPage && wordsTableEl && wordsTableBodyEl) {
        // 更新单词计数
        if (wordCountEl) {
            wordCountEl.textContent = `${words.length}个单词`;
        }
        
        // 更新标签集合
        updateAllTags();
        
        // 更新标签筛选下拉框
        if (tagFilterSelect) {
            updateTagFilterSelect();
        }
        
        // 更新表格
        updateWordsTable();
    }
}

// 更新所有标签集合
function updateAllTags() {
    allTags.clear();
    words.forEach(word => {
        if (word.tags && word.tags.length > 0) {
            word.tags.forEach(tag => {
                if (tag.trim()) {
                    allTags.add(tag.trim());
                }
            });
        }
    });
}

// 更新标签筛选下拉框
function updateTagFilterSelect() {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/0488fa9d-f3b6-4aaf-ba09-7fe6201289b7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'script.js:381',message:'updateTagFilterSelect called',data:{tagFilterSelectExists:!!tagFilterSelect,isWordsListPage:isWordsListPage},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    // 如果元素不存在（如在首页），直接返回
    if (!tagFilterSelect) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/0488fa9d-f3b6-4aaf-ba09-7fe6201289b7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'script.js:384',message:'tagFilterSelect is null, returning early',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        return;
    }
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/0488fa9d-f3b6-4aaf-ba09-7fe6201289b7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'script.js:390',message:'Before accessing tagFilterSelect.value',data:{tagFilterSelectType:typeof tagFilterSelect},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    // 保存当前选中的值
    const currentValue = tagFilterSelect.value;
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/0488fa9d-f3b6-4aaf-ba09-7fe6201289b7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'script.js:395',message:'After accessing tagFilterSelect.value',data:{currentValue:currentValue},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    // 清空下拉框
    tagFilterSelect.innerHTML = '<option value="">所有单词</option>';
    
    // 按字母顺序排序标签
    const sortedTags = Array.from(allTags).sort();
    
    // 添加标签选项
    sortedTags.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag;
        tagFilterSelect.appendChild(option);
    });
    
    // 恢复选中的值
    if (sortedTags.includes(currentValue)) {
        tagFilterSelect.value = currentValue;
    } else {
        tagFilterSelect.value = '';
        selectedTagFilter = '';
    }
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/0488fa9d-f3b6-4aaf-ba09-7fe6201289b7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'script.js:420',message:'updateTagFilterSelect completed',data:{sortedTagsCount:sortedTags.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
}

// 根据筛选和排序条件获取显示的单词
function getFilteredAndSortedWords() {
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

// 更新单词表格
function updateWordsTable() {
    // 清空表格
    wordsTableBodyEl.innerHTML = '';
    
    const sortedWords = getFilteredAndSortedWords();
    
    // 如果没有单词，显示空状态
    if (sortedWords.length === 0) {
        emptyTableEl.style.display = 'block';
        wordsTableEl.style.display = 'none';
        return;
    }
    
    // 显示表格，隐藏空状态
    emptyTableEl.style.display = 'none';
    wordsTableEl.style.display = 'table';
    
    // 生成表头
    const thead = wordsTableEl.querySelector('thead');
    thead.innerHTML = '';
    
    const headerRow = document.createElement('tr');
    
    // 添加序列号列
    const seqHeader = document.createElement('th');
    seqHeader.textContent = '#';
    seqHeader.style.width = '50px';
    headerRow.appendChild(seqHeader);
    
    // 添加学习语言列
    userSettings.learningLanguages.forEach(langCode => {
        const language = availableLanguages.find(l => l.code === langCode);
        if (language) {
            const th = document.createElement('th');
            const headerDiv = document.createElement('div');
            headerDiv.className = 'language-header';
            headerDiv.innerHTML = `
                <span class="language-flag flag-${langCode}">${language.code.toUpperCase()}</span>
                <span>${language.name}</span>
            `;
            th.appendChild(headerDiv);
            headerRow.appendChild(th);
        }
    });
    
    // 添加母语列 - 修复隐藏功能
    const nativeLang = availableLanguages.find(l => l.code === userSettings.nativeLanguage);
    if (nativeLang) {
        const th = document.createElement('th');
        th.id = 'native-column-header';
        th.className = 'native-header';
        if (!showNativeColumn) {
            th.classList.add('hidden');
        }
        const headerDiv = document.createElement('div');
        headerDiv.className = 'language-header';
        headerDiv.innerHTML = `
            <span class="language-flag">${nativeLang.code.toUpperCase()}</span>
            <span>${nativeLang.name} (母语)</span>
        `;
        th.appendChild(headerDiv);
        headerRow.appendChild(th);
    }
    
    // 添加标签列
    const tagsHeader = document.createElement('th');
    tagsHeader.textContent = '标签';
    tagsHeader.style.width = '200px';
    headerRow.appendChild(tagsHeader);
    
    thead.appendChild(headerRow);
    
    // 生成表格行
    sortedWords.forEach((word, index) => {
        const row = document.createElement('tr');
        row.dataset.id = word.id;
        
        // 序列号
        const seqCell = document.createElement('td');
        seqCell.textContent = index + 1;
        seqCell.style.textAlign = 'center';
        seqCell.style.color = '#64748b';
        row.appendChild(seqCell);
        
        // 学习语言列
        userSettings.learningLanguages.forEach(langCode => {
            const cell = document.createElement('td');
            cell.className = 'word-cell';
            cell.dataset.lang = langCode;
            
            // 查找该语言的翻译
            const translation = word.translations.find(t => t.language === langCode);
            if (translation) {
                // 如果有翻译，显示单词或占位符
                if (translation.text) {
                    cell.textContent = translation.text;
                    cell.dataset.value = translation.text;
                } else {
                    cell.textContent = '(无单词)';
                    cell.style.color = '#94a3b8';
                    cell.style.fontStyle = 'italic';
                }
                
                // 添加点击事件
                cell.addEventListener('click', () => {
                    showWordCard(word.id);
                });
            } else {
                cell.textContent = '-';
                cell.style.color = '#94a3b8';
                cell.style.fontStyle = 'italic';
            }
            
            row.appendChild(cell);
        });
        
        // 母语列 - 修复隐藏功能
        const nativeCell = document.createElement('td');
        nativeCell.className = 'native-cell';
        if (!showNativeColumn) {
            nativeCell.classList.add('hidden');
        }
        nativeCell.textContent = word.nativeNote || '-';
        nativeCell.addEventListener('click', () => {
            showWordCard(word.id);
        });
        row.appendChild(nativeCell);
        
        // 标签列
        const tagsCell = document.createElement('td');
        tagsCell.className = 'table-tag-cell';
        if (word.tags && word.tags.length > 0) {
            const tagsContainer = document.createElement('div');
            tagsContainer.className = 'table-tags';
            
            word.tags.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.className = 'table-tag';
                tagElement.textContent = tag;
                tagElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    // 点击标签时筛选该标签
                    if (tagFilterSelect) {
                        tagFilterSelect.value = tag;
                    }
                    selectedTagFilter = tag;
                    updateWordsTable();
                });
                tagsContainer.appendChild(tagElement);
            });
            
            tagsCell.appendChild(tagsContainer);
        } else {
            tagsCell.textContent = '-';
            tagsCell.style.color = '#94a3b8';
            tagsCell.style.fontStyle = 'italic';
        }
        row.appendChild(tagsCell);
        
        wordsTableBodyEl.appendChild(row);
    });
}

// 显示单词卡片
function showWordCard(wordId) {
    const word = words.find(w => w.id === wordId);
    if (!word) return;
    
    displayedWordId = wordId;
    
    // 获取母语信息
    const nativeLang = availableLanguages.find(l => l.code === userSettings.nativeLanguage);
    
    // 获取图片HTML
    let imageHtml = '';
    if (word.image) {
        imageHtml = `
            <div class="card-image-container">
                <img src="${word.image}" alt="${word.nativeNote || '单词图片'}" class="card-image">
            </div>
        `;
    } else {
        imageHtml = `
            <div class="card-image-container">
                <div class="card-placeholder-image">
                    <i class="fas fa-image" style="font-size: 3rem; margin-bottom: 10px;"></i>
                    <span>暂无图片</span>
                </div>
            </div>
        `;
    }
    
    // 获取标签HTML
    let tagsHtml = '';
    if (word.tags && word.tags.length > 0) {
        const tagItems = word.tags.map(tag => `
            <span class="card-tag" data-tag="${tag}">${tag.trim()}</span>
        `).join('');
        tagsHtml = `
            <div class="card-tags">
                ${tagItems}
            </div>
        `;
    }
    
    // 获取翻译HTML
    let translationsHtml = '';
    if (word.translations && word.translations.length > 0) {
        translationsHtml = `
            <div class="card-translations">
                ${word.translations.map(trans => {
                    const lang = availableLanguages.find(l => l.code === trans.language);
                    if (!lang) return '';
                    
                    // 如果单词为空，显示占位符
                    const wordText = trans.text ? trans.text : '(无单词)';
                    
                    let phoneticHtml = '';
                    if (trans.phonetic) {
                        phoneticHtml = `<div class="card-translation-phonetic">${trans.phonetic}</div>`;
                    }
                    
                    let exampleHtml = '';
                    if (trans.example) {
                        exampleHtml = `<div class="card-translation-example">${trans.example}</div>`;
                    }
                    
                    return `
                        <div class="card-translation-item">
                            <div class="card-translation-header">
                                <span class="language-flag" style="background-color: ${lang.color}">${lang.code.toUpperCase()}</span>
                                <span class="card-translation-language">${lang.name}</span>
                            </div>
                            <div class="card-translation-text" style="${!trans.text ? 'color: #94a3b8; font-style: italic;' : ''}">
                                ${wordText}
                            </div>
                            ${phoneticHtml}
                            ${exampleHtml}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    // 获取备注HTML
    let notesHtml = '';
    if (word.notes) {
        notesHtml = `
            <div class="card-notes">
                <div class="card-notes-title">备注</div>
                <div class="card-notes-content">${word.notes}</div>
            </div>
        `;
    }
    
    // 母语注释
    let nativeNoteHtml = '';
    if (word.nativeNote) {
        nativeNoteHtml = `
            <div class="card-native-note">
                <div class="card-native-note-title">母语注释 (${nativeLang ? nativeLang.name : '母语'})</div>
                <div class="card-native-note-content">${word.nativeNote}</div>
            </div>
        `;
    }
    
    wordCardEl.innerHTML = `
        <div class="card-header">
            <div class="card-title">单词详情</div>
            <button class="card-close" id="close-word-card">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="card-content">
            ${nativeNoteHtml}
            
            ${imageHtml}
            
            ${tagsHtml}
            
            ${translationsHtml}
            
            ${notesHtml}
            
            <div class="card-actions">
                <button class="card-action-btn card-edit-btn" id="edit-word-from-card">
                    <i class="fas fa-edit"></i> 编辑
                </button>
                <button class="card-action-btn card-delete-btn" id="delete-word-from-card">
                    <i class="fas fa-trash"></i> 删除
                </button>
            </div>
        </div>
    `;
    
    // 显示卡片
    wordCardOverlayEl.style.display = 'flex';
    
    // 添加关闭按钮事件
    const closeBtn = document.getElementById('close-word-card');
    closeBtn.addEventListener('click', closeWordCard);
    
    // 添加编辑按钮事件
    const editBtn = document.getElementById('edit-word-from-card');
    editBtn.addEventListener('click', () => {
        editWord(wordId);
        closeWordCard();
    });
    
    // 添加删除按钮事件
    const deleteBtn = document.getElementById('delete-word-from-card');
    deleteBtn.addEventListener('click', () => {
        showDeleteConfirm(wordId);
        closeWordCard();
    });
    
    // 添加标签点击事件（筛选功能）
    document.querySelectorAll('.card-tag').forEach(tagElement => {
        tagElement.addEventListener('click', (e) => {
            e.stopPropagation();
            const tag = tagElement.getAttribute('data-tag');
            if (tagFilterSelect) {
                tagFilterSelect.value = tag;
            }
            selectedTagFilter = tag;
            closeWordCard();
            updateWordsTable();
        });
    });
}

// 关闭单词卡片
function closeWordCard() {
    wordCardOverlayEl.style.display = 'none';
    displayedWordId = null;
}

// 点击卡片外部关闭
if (wordCardOverlayEl) {
    wordCardOverlayEl.addEventListener('click', (e) => {
        if (e.target === wordCardOverlayEl) {
            closeWordCard();
        }
    });
}

// 初始化标签输入
function initTagsInput() {
    // 当前表单中的标签
    let currentTags = [];
    
    // 渲染标签输入
    function renderTagsInput() {
        tagsInputContainer.innerHTML = '';
        
        // 添加现有标签
        currentTags.forEach((tag, index) => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag-input-item';
            tagElement.innerHTML = `
                ${tag}
                <span class="remove-tag" data-index="${index}">&times;</span>
            `;
            tagsInputContainer.appendChild(tagElement);
        });
        
        // 添加输入框
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'tag-input';
        input.id = 'tag-input';
        input.placeholder = currentTags.length === 0 ? '输入标签，按回车添加' : '';
        tagsInputContainer.appendChild(input);
        
        // 聚焦到输入框
        input.focus();
        
        // 添加输入事件
        input.addEventListener('input', handleTagInput);
        input.addEventListener('keydown', handleTagKeydown);
        input.addEventListener('blur', handleTagBlur);
        
        // 添加删除标签事件
        document.querySelectorAll('.remove-tag').forEach(removeBtn => {
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(removeBtn.getAttribute('data-index'));
                currentTags.splice(index, 1);
                renderTagsInput();
            });
        });
        
        // 更新标签建议
        updateTagSuggestions(input.value);
    }
    
    // 处理标签输入
    function handleTagInput(e) {
        updateTagSuggestions(e.target.value);
    }
    
    // 处理标签按键
    function handleTagKeydown(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag(e.target.value);
        } else if (e.key === 'Backspace' && e.target.value === '' && currentTags.length > 0) {
            // 如果输入框为空且按了退格键，删除最后一个标签
            currentTags.pop();
            renderTagsInput();
        } else if (e.key === 'Escape') {
            tagsSuggestionsEl.classList.remove('show');
        }
    }
    
    // 处理标签输入框失去焦点
    function handleTagBlur(e) {
        setTimeout(() => {
            if (e.target.value.trim()) {
                addTag(e.target.value);
            }
            tagsSuggestionsEl.classList.remove('show');
        }, 200);
    }
    
    // 添加标签
    function addTag(tagText) {
        const trimmedTag = tagText.trim();
        if (trimmedTag && !currentTags.includes(trimmedTag)) {
            currentTags.push(trimmedTag);
            renderTagsInput();
        } else if (trimmedTag && currentTags.includes(trimmedTag)) {
            showMessage(`标签"${trimmedTag}"已存在`, 'info');
            renderTagsInput();
        }
    }
    
    // 更新标签建议
    function updateTagSuggestions(inputText) {
        const trimmedInput = inputText.trim().toLowerCase();
        tagsSuggestionsEl.innerHTML = '';
        
        if (!trimmedInput) {
            tagsSuggestionsEl.classList.remove('show');
            return;
        }
        
        // 过滤标签建议
        const suggestions = Array.from(allTags)
            .filter(tag => 
                tag.toLowerCase().includes(trimmedInput) && 
                !currentTags.includes(tag)
            )
            .sort();
        
        if (suggestions.length === 0) {
            tagsSuggestionsEl.classList.remove('show');
            return;
        }
        
        // 添加建议
        suggestions.forEach(tag => {
            const suggestion = document.createElement('div');
            suggestion.className = 'tag-suggestion';
            suggestion.textContent = tag;
            suggestion.addEventListener('click', () => {
                addTag(tag);
                tagsSuggestionsEl.classList.remove('show');
            });
            tagsSuggestionsEl.appendChild(suggestion);
        });
        
        tagsSuggestionsEl.classList.add('show');
    }
    
    // 初始化渲染
    renderTagsInput();
    
    // 返回获取当前标签的方法
    return {
        getTags: () => [...currentTags],
        setTags: (tags) => {
            currentTags = tags ? [...tags] : [];
            renderTagsInput();
        }
    };
}

// 开始应用按钮点击事件
if (startAppBtn) {
    startAppBtn.addEventListener('click', () => {
        // 验证设置
        if (!userSettings.nativeLanguage) {
            showMessage('请选择您的母语', 'error');
            return;
        }
        
        if (userSettings.learningLanguages.length === 0) {
            showMessage('请至少选择一种学习语言', 'error');
            return;
        }
        
        // 保存设置到本地存储
        localStorage.setItem('polyglotSettings', JSON.stringify(userSettings));
        
        // 显示主应用
        showMainApp();
    });
}

// 设置按钮点击事件
if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
        // 如果是单词列表页面，跳转到首页
        if (isWordsListPage) {
            window.location.href = 'Remember.html';
            return;
        }
        
        // 首页：切换到语言设置页面
        if (mainAppEl) {
            mainAppEl.style.display = 'none';
        }
        if (languageSetupEl) {
            languageSetupEl.style.display = 'block';
        }
        
        // 预选已保存的语言
        if (userSettings.nativeLanguage && nativeLanguageOptionsEl) {
            const nativeOption = nativeLanguageOptionsEl.querySelector(`.language-option[data-code="${userSettings.nativeLanguage}"]`);
            if (nativeOption) {
                nativeOption.classList.add('selected');
            }
        }
        
        if (learningLanguageOptionsEl) {
            userSettings.learningLanguages.forEach(langCode => {
                const learningOption = learningLanguageOptionsEl.querySelector(`.language-option[data-code="${langCode}"]`);
                if (learningOption) {
                    learningOption.classList.add('selected');
                }
            });
        }
        
        // 更新已选语言显示
        updateSelectedLanguagesDisplay();
        
        // 关闭单词卡片
        closeWordCard();
    });
}

// 大添加按钮点击事件
if (bigAddBtn) {
    bigAddBtn.addEventListener('click', () => {
        // 重置表单状态为添加模式
        editingWordId = null;
        modalTitleEl.textContent = '添加新单词';
        modalDescriptionEl.textContent = '为每个语言输入单词，可以添加母语注释、图片和标签';
        saveWordBtn.textContent = '保存单词';
        deleteWordBtn.style.display = 'none';
        
        // 清空表单
        addWordFormEl.reset();
        uploadedImageData = null;
        imagePreview.classList.remove('show');
        clearImageBtn.style.display = 'none';
        imageUploadInput.value = '';
        
        // 初始化标签输入
        tagsManager = initTagsInput();
        
        // 显示模态框
        addWordModalEl.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // 关闭单词卡片
        closeWordCard();
    });
}

// 当前上传的图片数据（base64）
let uploadedImageData = null;

// 更新图片预览
function updateImagePreview() {
    if (uploadedImageData) {
        // 优先显示上传的图片
        imagePreview.src = uploadedImageData;
        imagePreview.classList.add('show');
        clearImageBtn.style.display = 'inline-flex';
    } else {
        // 如果没有上传的图片，显示URL图片
        const url = imageUrlInput.value.trim();
        if (url) {
            imagePreview.src = url;
            imagePreview.classList.add('show');
            clearImageBtn.style.display = 'inline-flex';
        } else {
            imagePreview.classList.remove('show');
            clearImageBtn.style.display = 'none';
        }
    }
}

// 图片URL预览
if (imageUrlInput) {
    imageUrlInput.addEventListener('input', function() {
        // 如果已经有上传的图片，URL输入不会覆盖
        if (!uploadedImageData) {
            updateImagePreview();
        }
    });
}

// 图片文件上传
if (imageUploadInput) {
    imageUploadInput.addEventListener('change', function(e) {
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
            // 清空URL输入框，因为上传的图片优先
            imageUrlInput.value = '';
            showMessage('图片上传成功', 'success');
        };
        reader.onerror = function() {
            showMessage('图片读取失败，请重试', 'error');
            e.target.value = '';
        };
        reader.readAsDataURL(file);
    }
    });
}

// 清除图片
if (clearImageBtn) {
    clearImageBtn.addEventListener('click', function() {
        uploadedImageData = null;
        if (imageUrlInput) {
            imageUrlInput.value = '';
        }
        if (imagePreview) {
            imagePreview.classList.remove('show');
        }
        clearImageBtn.style.display = 'none';
        if (imageUploadInput) {
            imageUploadInput.value = '';
        }
        showMessage('图片已清除', 'info');
    });
}

// 标签筛选变化事件
if (tagFilterSelect) {
    tagFilterSelect.addEventListener('change', function() {
        selectedTagFilter = this.value;
        updateWordsTable();
    });
}

// 排序选项变化事件
if (sortOptionSelect) {
    sortOptionSelect.addEventListener('change', function() {
        currentSortOption = this.value;
        updateWordsTable();
    });
}

// 关闭模态框
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        if (addWordModalEl) {
            addWordModalEl.style.display = 'none';
        }
        document.body.style.overflow = 'auto';
    });
}

// 点击模态框背景关闭
window.addEventListener('click', (e) => {
    if (e.target === addWordModalEl) {
        addWordModalEl.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    if (e.target === deleteModalEl) {
        deleteModalEl.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// 编辑单词
function editWord(wordId) {
    const word = words.find(w => w.id === wordId);
    if (!word) return;
    
    editingWordId = wordId;
    
    // 更新模态框标题
    modalTitleEl.textContent = '编辑单词';
    modalDescriptionEl.textContent = '修改单词内容';
    saveWordBtn.textContent = '更新单词';
    deleteWordBtn.style.display = 'inline-block';
    
    // 填充表单数据
    document.getElementById('native-note').value = word.nativeNote || '';
    document.getElementById('notes').value = word.notes || '';
    
    // 重置上传的图片数据
    uploadedImageData = null;
    imageUploadInput.value = '';
    
    // 显示图片预览
    if (word.image) {
        // 判断是base64数据还是URL
        if (word.image.startsWith('data:image/')) {
            // 是上传的base64图片
            uploadedImageData = word.image;
            document.getElementById('image-url').value = '';
        } else {
            // 是URL图片
            document.getElementById('image-url').value = word.image;
        }
        updateImagePreview();
    } else {
        document.getElementById('image-url').value = '';
        imagePreview.classList.remove('show');
        clearImageBtn.style.display = 'none';
    }
    
    // 初始化标签输入并设置现有标签
    tagsManager = initTagsInput();
    tagsManager.setTags(word.tags || []);
    
    // 填充各语言单词
    userSettings.learningLanguages.forEach(langCode => {
        const wordInput = document.getElementById(`${langCode}-word`);
        const phoneticInput = document.getElementById(`${langCode}-phonetic`);
        const exampleInput = document.getElementById(`${langCode}-example`);
        
        if (wordInput) {
            const translation = word.translations.find(t => t.language === langCode);
            if (translation) {
                wordInput.value = translation.text || '';
                phoneticInput.value = translation.phonetic || '';
                exampleInput.value = translation.example || '';
            } else {
                wordInput.value = '';
                phoneticInput.value = '';
                exampleInput.value = '';
            }
        }
    });
    
    // 显示模态框
    addWordModalEl.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// 显示删除确认
function showDeleteConfirm(wordId) {
    const word = words.find(w => w.id === wordId);
    if (!word) return;
    
    editingWordId = wordId;
    deleteConfirmTextEl.textContent = `您确定要删除 "${word.nativeNote || '这个单词'}" 吗？`;
    deleteModalEl.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// 切换母语列显示
if (toggleNativeBtn) {
    toggleNativeBtn.addEventListener('click', () => {
        showNativeColumn = !showNativeColumn;
        
        // 更新按钮状态
        if (showNativeColumn) {
            toggleNativeBtn.innerHTML = '<i class="fas fa-eye-slash"></i><span>隐藏母语注释</span>';
            toggleNativeBtn.classList.add('active');
        } else {
            toggleNativeBtn.innerHTML = '<i class="fas fa-eye"></i><span>显示母语注释</span>';
            toggleNativeBtn.classList.remove('active');
        }
        
        // 更新表格
        updateWordsTable();
    });
}

// 处理表单提交
let tagsManager;

if (addWordFormEl) {
    addWordFormEl.addEventListener('submit', function(e) {
        e.preventDefault();
    
    // 获取表单数据
    const nativeNote = document.getElementById('native-note').value.trim();
    // 优先使用上传的图片，如果没有则使用URL
    const image = uploadedImageData || document.getElementById('image-url').value.trim() || null;
    const notes = document.getElementById('notes').value.trim();
    const tags = tagsManager ? tagsManager.getTags() : [];
    
    // 收集翻译
    const translations = [];
    
    // 获取所有学习语言的输入值
    userSettings.learningLanguages.forEach(langCode => {
        const wordInput = document.getElementById(`${langCode}-word`);
        const phoneticInput = document.getElementById(`${langCode}-phonetic`);
        const exampleInput = document.getElementById(`${langCode}-example`);
        
        // 修改：只要有文本（单词、音标或例句）就添加到翻译中
        const wordText = wordInput ? wordInput.value.trim() : '';
        const phoneticText = phoneticInput ? phoneticInput.value.trim() : '';
        const exampleText = exampleInput ? exampleInput.value.trim() : '';
        
        // 如果单词、音标或例句中至少有一个有内容，就添加翻译
        if (wordText || phoneticText || exampleText) {
            translations.push({
                language: langCode,
                text: wordText,
                phonetic: phoneticText,
                example: exampleText
            });
        }
    });
    
    // 修改验证逻辑：允许只有母语注释或标签，不需要必须填写单词
    if (translations.length === 0 && !nativeNote && tags.length === 0 && !notes) {
        showMessage('请至少填写一个单词、母语注释、标签或备注', 'error');
        return;
    }
    
    if (editingWordId) {
        // 编辑模式：更新现有单词
        const wordIndex = words.findIndex(w => w.id === editingWordId);
        if (wordIndex !== -1) {
            words[wordIndex] = {
                ...words[wordIndex],
                translations,
                nativeNote: nativeNote || null,
                image: image || null,
                tags: tags.length > 0 ? tags : null,
                notes: notes || null,
                updatedAt: new Date().toISOString()
            };
            
            // 保存到本地存储
            localStorage.setItem('polyglotWords', JSON.stringify(words));
            
            // 更新标签集合
            updateAllTags();
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/0488fa9d-f3b6-4aaf-ba09-7fe6201289b7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'script.js:1310',message:'Calling updateTagFilterSelect from edit word',data:{isWordsListPage:isWordsListPage},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            updateTagFilterSelect();
            
            // 显示成功消息
            showMessage(`"${translations[0]?.text || nativeNote || '单词'}" 已更新`);
        }
    } else {
        // 添加模式：创建新单词
        const newWord = {
            id: Date.now().toString(),
            translations,
            nativeNote: nativeNote || null,
            image: image || null,
            tags: tags.length > 0 ? tags : null,
            notes: notes || null,
            createdAt: new Date().toISOString()
        };
        
        // 添加到本地存储
        words.push(newWord);
        localStorage.setItem('polyglotWords', JSON.stringify(words));
        
        // 更新标签集合
        updateAllTags();
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/0488fa9d-f3b6-4aaf-ba09-7fe6201289b7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'script.js:1333',message:'Calling updateTagFilterSelect from add word',data:{isWordsListPage:isWordsListPage},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        updateTagFilterSelect();
        
        // 显示成功消息
        const firstWord = translations[0]?.text || nativeNote || '单词';
        showMessage(`"${firstWord}" 已添加到单词本`);
    }
    
    // 重置表单
    addWordFormEl.reset();
    uploadedImageData = null;
    imagePreview.classList.remove('show');
    clearImageBtn.style.display = 'none';
    imageUploadInput.value = '';
    
    // 关闭模态框
    addWordModalEl.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // 重新加载单词列表
    loadWords();
    });
}

// 重置表单
if (resetFormBtn) {
    resetFormBtn.addEventListener('click', function() {
    if (confirm('确定要清空表单吗？')) {
        addWordFormEl.reset();
        uploadedImageData = null;
        imagePreview.classList.remove('show');
        clearImageBtn.style.display = 'none';
        imageUploadInput.value = '';
        if (tagsManager) {
            tagsManager.setTags([]);
        }
        showMessage('表单已重置');
    }
    });
}

// 删除单词按钮
if (deleteWordBtn) {
    deleteWordBtn.addEventListener('click', function() {
    if (editingWordId) {
        showDeleteConfirm(editingWordId);
    }
    });
}

// 关闭删除确认模态框
if (closeDeleteModalBtn) {
    closeDeleteModalBtn.addEventListener('click', () => {
        if (deleteModalEl) {
            deleteModalEl.style.display = 'none';
        }
        document.body.style.overflow = 'auto';
    });
}

// 取消删除
if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', () => {
        if (deleteModalEl) {
            deleteModalEl.style.display = 'none';
        }
        document.body.style.overflow = 'auto';
    });
}

// 确认删除
if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', () => {
    if (editingWordId) {
        const wordIndex = words.findIndex(w => w.id === editingWordId);
        if (wordIndex !== -1) {
            const deletedWord = words[wordIndex];
            words.splice(wordIndex, 1);
            
            // 保存到本地存储
            localStorage.setItem('polyglotWords', JSON.stringify(words));
            
            // 更新标签集合
            updateAllTags();
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/0488fa9d-f3b6-4aaf-ba09-7fe6201289b7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'script.js:1402',message:'Calling updateTagFilterSelect from delete word',data:{isWordsListPage:isWordsListPage},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            updateTagFilterSelect();
            
            // 显示成功消息
            showMessage(`"${deletedWord.nativeNote || '单词'}" 已删除`);
            
            // 重新加载单词列表
            loadWords();
            
            // 关闭删除确认模态框
            deleteModalEl.style.display = 'none';
            document.body.style.overflow = 'auto';
            
            // 关闭编辑模态框
            addWordModalEl.style.display = 'none';
            document.body.style.overflow = 'auto';
            
            // 重置编辑单词ID
            editingWordId = null;
        }
    }
    });
}

// 导出单词本
function exportWords() {
    if (words.length === 0) {
        showMessage('单词本为空，没有可导出的内容', 'info');
        return;
    }
    
    try {
        // 创建导出数据，包含单词列表和用户设置
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            settings: userSettings,
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
    } catch (error) {
        console.error('导出失败:', error);
        showMessage('导出失败，请重试', 'error');
    }
}

// 导入单词本
function importWords(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const importData = JSON.parse(e.target.result);
            
            // 验证数据格式
            if (!importData.words || !Array.isArray(importData.words)) {
                showMessage('文件格式不正确，请选择有效的单词本文件', 'error');
                return;
            }
            
            // 询问用户导入方式
            const importMode = confirm(
                `检测到 ${importData.words.length} 个单词\n\n` +
                `点击"确定"合并导入（保留现有单词）\n` +
                `点击"取消"替换导入（清空现有单词）`
            );
            
            if (importMode) {
                // 合并模式：添加新单词，避免重复ID
                const existingIds = new Set(words.map(w => w.id));
                let addedCount = 0;
                let skippedCount = 0;
                
                importData.words.forEach(word => {
                    if (!existingIds.has(word.id)) {
                        words.push(word);
                        existingIds.add(word.id);
                        addedCount++;
                    } else {
                        skippedCount++;
                    }
                });
                
                // 保存到本地存储
                localStorage.setItem('polyglotWords', JSON.stringify(words));
                
                // 更新标签集合
                updateAllTags();
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/0488fa9d-f3b6-4aaf-ba09-7fe6201289b7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'script.js:1505',message:'Calling updateTagFilterSelect from import merge',data:{isWordsListPage:isWordsListPage},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                // #endregion
                updateTagFilterSelect();
                
                // 重新加载单词列表
                loadWords();
                
                let message = `成功导入 ${addedCount} 个单词`;
                if (skippedCount > 0) {
                    message += `，跳过 ${skippedCount} 个重复单词`;
                }
                showMessage(message, 'success');
            } else {
                // 替换模式：清空现有单词，导入新单词
                words = importData.words;
                
                // 保存到本地存储
                localStorage.setItem('polyglotWords', JSON.stringify(words));
                
                // 更新标签集合
                updateAllTags();
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/0488fa9d-f3b6-4aaf-ba09-7fe6201289b7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'script.js:1524',message:'Calling updateTagFilterSelect from import replace',data:{isWordsListPage:isWordsListPage},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                // #endregion
                updateTagFilterSelect();
                
                // 重新加载单词列表
                loadWords();
                
                showMessage(`成功导入 ${words.length} 个单词（已替换现有单词）`, 'success');
            }
            
            // 如果导入数据包含设置，询问是否更新设置
            if (importData.settings) {
                const updateSettings = confirm(
                    '检测到语言设置，是否更新当前设置？\n\n' +
                    '点击"确定"更新设置\n' +
                    '点击"取消"保持当前设置'
                );
                
                if (updateSettings) {
                    userSettings = importData.settings;
                    localStorage.setItem('polyglotSettings', JSON.stringify(userSettings));
                    
                    // 重新生成语言输入框
                    generateLanguageInputs();
                    
                    // 更新用户语言显示
                    updateUserLanguagesDisplay();
                    
                    showMessage('设置已更新，请刷新页面以应用新设置', 'info');
                }
            }
            
        } catch (error) {
            console.error('导入失败:', error);
            showMessage('导入失败：文件格式不正确或文件已损坏', 'error');
        }
    };
    
    reader.onerror = function() {
        showMessage('读取文件失败，请重试', 'error');
    };
    
    reader.readAsText(file);
}

// 导出按钮点击事件
if (exportBtn) {
    exportBtn.addEventListener('click', exportWords);
}

// 导入文件选择事件
if (importFileInput) {
    importFileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            importWords(file);
            // 清空文件选择，以便可以重复选择同一文件
            e.target.value = '';
        }
    });
}

// 拍照功能
let cameraStream = null;
let capturedPhoto = null;

// 打开拍照模态框
if (cameraBtn) {
    cameraBtn.addEventListener('click', async () => {
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
            captureBtn.style.display = 'inline-block';
            retakeBtn.style.display = 'none';
            usePhotoBtn.style.display = 'none';
        } catch (error) {
            console.error('无法访问摄像头:', error);
            showMessage('无法访问摄像头，请检查权限设置', 'error');
            cameraModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}

// 关闭拍照模态框
if (closeCameraModalBtn) {
    closeCameraModalBtn.addEventListener('click', () => {
        closeCameraModal();
    });
}

// 关闭拍照模态框的函数
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
    captureBtn.addEventListener('click', () => {
        if (cameraVideo && cameraCanvas) {
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
            
            captureBtn.style.display = 'none';
            retakeBtn.style.display = 'inline-block';
            usePhotoBtn.style.display = 'inline-block';
        }
    });
}

// 重拍
if (retakeBtn) {
    retakeBtn.addEventListener('click', async () => {
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
            captureBtn.style.display = 'inline-block';
            retakeBtn.style.display = 'none';
            usePhotoBtn.style.display = 'none';
        } catch (error) {
            console.error('无法访问摄像头:', error);
            showMessage('无法访问摄像头，请检查权限设置', 'error');
        }
    });
}

// 使用照片
if (usePhotoBtn) {
    usePhotoBtn.addEventListener('click', () => {
        if (capturedPhoto) {
            uploadedImageData = capturedPhoto;
            updateImagePreview();
            if (imageUrlInput) {
                imageUrlInput.value = '';
            }
            showMessage('照片已添加', 'success');
            closeCameraModal();
        }
    });
}

// 手绘功能
let isDrawing = false;
let drawContext = null;

// 初始化手绘画布
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

// 打开手绘模态框
if (drawBtn) {
    drawBtn.addEventListener('click', () => {
        if (drawModal) {
            drawModal.style.display = 'block';
        }
        document.body.style.overflow = 'hidden';
        initDrawCanvas();
    });
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

// 手绘事件
if (drawCanvas) {
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

// 使用手绘
if (useDrawingBtn) {
    useDrawingBtn.addEventListener('click', () => {
        if (drawCanvas) {
            const drawingData = drawCanvas.toDataURL('image/png');
            uploadedImageData = drawingData;
            updateImagePreview();
            if (imageUrlInput) {
                imageUrlInput.value = '';
            }
            showMessage('手绘图片已添加', 'success');
            if (drawModal) {
                drawModal.style.display = 'none';
            }
            document.body.style.overflow = 'auto';
        }
    });
}

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    initLanguageSelection();
});