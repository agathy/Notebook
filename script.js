// script.js (修复重复声明的版本)

// 模块化导入
import {
    setupAutoTranslate,
    autoTranslatedInputs,
    acceptTranslation,
    rejectTranslation,
    autoTranslateWord
} from './js/modules/translateManager.js';
import {
    setupAudioFeatures,
    playWordAudio,
    startRecording,
    stopRecording,
    saveRecording,
    recordedAudios,
    resetRecordedAudios
} from './js/modules/audioManager.js';
import {
    updateAllTags,
    updateTagFilterSelect,  // 从模块导入
    initTagsInput
} from './js/modules/tagManager.js';
import {
    initImageManager,
    setImageData,
    getImageData,
    resetImageData
} from './js/modules/imageManager.js';
import {
    initWordManager,
    words,
    editingWordId,
    displayedWordId,
    showNativeColumn,
    selectedTagFilter,
    currentSortOption,
    allTags,
    getFilteredAndSortedWords,
    addWord,
    updateWord,
    deleteWord,
    getWordById,
    getWordCount,
    exportWords,
    importWords,
    resetEditingState,
    setSelectedTagFilter,
    setSortOption,
    setShowNativeColumn,
    getShowNativeColumn,
    getSortOption
} from './js/modules/wordManager.js';

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
window.userSettings = userSettings;

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
const batchAddBtn = document.getElementById('batch-add-btn');
// 视图切换功能
const listViewBtn = document.getElementById('list-view-btn');
const cardViewBtn = document.getElementById('card-view-btn');
const listView = document.getElementById('list-view');
const cardView = document.getElementById('card-view');
const cardsStack = document.getElementById('cards-stack');
const emptyCards = document.getElementById('empty-cards');
const prevCardBtn = document.getElementById('prev-card-btn');
const nextCardBtn = document.getElementById('next-card-btn');
const currentCardIndexSpan = document.getElementById('current-card-index');
const totalCardsSpan = document.getElementById('total-cards');

let currentView = 'list';
let currentCardIndex = 0;
let filteredWords = [];

// 初始化视图切换
function initViewToggle() {
    // 从localStorage加载用户偏好
    const savedView = localStorage.getItem('wordbook-view');
    if (savedView === 'cards') {
        switchToCardView();
    } else {
        switchToListView();
    }
    
    // 绑定按钮事件
    listViewBtn.addEventListener('click', switchToListView);
    cardViewBtn.addEventListener('click', switchToCardView);
    prevCardBtn.addEventListener('click', showPrevCard);
    nextCardBtn.addEventListener('click', showNextCard);
}

// 切换到列表视图
function switchToListView() {
    currentView = 'list';
    listView.style.display = 'block';
    cardView.style.display = 'none';
    listViewBtn.classList.add('active');
    cardViewBtn.classList.remove('active');
    localStorage.setItem('wordbook-view', 'list');
}

// 切换到卡片堆视图
function switchToCardView() {
    currentView = 'cards';
    listView.style.display = 'none';
    cardView.style.display = 'flex';
    listViewBtn.classList.remove('active');
    cardViewBtn.classList.add('active');
    localStorage.setItem('wordbook-view', 'cards');
    renderCards();
}

// 渲染卡片堆
function renderCards() {
    if (!cardsStack) return;
    
    cardsStack.innerHTML = '';
    
    if (filteredWords.length === 0) {
        emptyCards.style.display = 'flex';
        cardsStack.style.display = 'none';
        prevCardBtn.disabled = true;
        nextCardBtn.disabled = true;
        return;
    }
    
    emptyCards.style.display = 'none';
    cardsStack.style.display = 'flex';
    
    // 创建卡片
    filteredWords.forEach((word, index) => {
        const card = createCardElement(word, index);
        cardsStack.appendChild(card);
    });
    
    // 更新卡片计数器
    updateCardCounter();
    
    // 显示当前卡片
    showCard(currentCardIndex);
}

// 创建卡片元素
function createCardElement(word, index) {
    const card = document.createElement('div');
    card.className = 'word-card-item';
    card.style.display = index === currentCardIndex ? 'block' : 'none';
    
    const date = new Date(word.dateAdded);
    const dateStr = date.toLocaleDateString('zh-CN');
    
    card.innerHTML = `
        <div class="card-header">
            <div class="card-tags-mini">
                ${word.tags && word.tags.length > 0 ? 
                    word.tags.slice(0, 2).map(tag => `<span class="card-tag-mini">${tag}</span>`).join('') : 
                    '<span class="card-tag-mini">无标签</span>'}
            </div>
            <div class="card-date">${dateStr}</div>
        </div>
        <div class="card-content">
            ${word.image ? `
                <div class="card-image-container">
                    <img src="${word.image}" alt="${word.nativeNote || '单词图片'}" class="card-image" loading="lazy">
                </div>
            ` : ''}
            
            <div class="card-translations">
                ${word.translations.map(trans => `
                    <div class="card-translation">
                        <div class="card-lang">${trans.language}</div>
                        <div class="card-word">${trans.word}</div>
                    </div>
                `).join('')}
            </div>
            
            ${word.nativeNote ? `
                <div class="card-native-note">
                    <div class="card-native-label">母语注释:</div>
                    <div class="card-native-text">${word.nativeNote}</div>
                </div>
            ` : ''}
            
            ${word.tags && word.tags.length > 0 ? `
                <div class="card-tags">
                    ${word.tags.map(tag => `<span class="card-tag">${tag}</span>`).join('')}
                </div>
            ` : ''}
        </div>
        <div class="card-actions">
            <button class="card-action-btn edit" onclick="editWord('${word.id}')">
                <i class="fas fa-edit"></i> 编辑
            </button>
            <button class="card-action-btn delete" onclick="confirmDelete('${word.id}')">
                <i class="fas fa-trash"></i> 删除
            </button>
        </div>
    `;
    
    return card;
}

// 显示指定卡片
function showCard(index) {
    const cards = document.querySelectorAll('.word-card-item');
    cards.forEach((card, i) => {
        card.style.display = i === index ? 'block' : 'none';
    });
    currentCardIndex = index;
    updateCardCounter();
    updateCardNavigation();
}

// 显示上一张卡片
function showPrevCard() {
    if (currentCardIndex > 0) {
        showCard(currentCardIndex - 1);
    }
}

// 显示下一张卡片
function showNextCard() {
    if (currentCardIndex < filteredWords.length - 1) {
        showCard(currentCardIndex + 1);
    }
}

// 更新卡片计数器
function updateCardCounter() {
    if (currentCardIndexSpan && totalCardsSpan) {
        currentCardIndexSpan.textContent = currentCardIndex + 1;
        totalCardsSpan.textContent = filteredWords.length;
    }
}

// 更新卡片导航按钮状态
function updateCardNavigation() {
    if (prevCardBtn) prevCardBtn.disabled = currentCardIndex === 0;
    if (nextCardBtn) nextCardBtn.disabled = currentCardIndex === filteredWords.length - 1;
}

// 在你的renderWordsTable函数中，更新filteredWords变量
function renderWordsTable(words) {
    filteredWords = words; // 保存当前显示的单词
    // ... 原有的表格渲染逻辑 ...
    
    // 如果当前是卡片视图，也需要更新卡片
    if (currentView === 'cards') {
        renderCards();
    }
}


// 显示消息
function showMessage(text, type = 'success') {
    if (!messageEl) return;
    
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';
    
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 3000);
}
window.showMessage = showMessage;

// ========== 注释掉或删除重复的函数定义 ==========
// 删除以下重复的函数定义，因为已经从模块中导入了
// function updateTagFilterSelect() { ... }
// ==============================================

// 更新首页单词数量
function updateHomeWordCount() {
    if (homeWordCountEl) {
        const wordCount = getWordCount();
        if (wordCount === 0) {
            homeWordCountEl.textContent = '查看和管理所有单词';
        } else {
            homeWordCountEl.textContent = `共 ${wordCount} 个单词`;
        }
    }
}

// 加载单词回调函数（用于wordManager）
function loadWordsCallback() {
    // 更新首页单词数量
    updateHomeWordCount();
    
    // 如果当前页面是单词列表页面，更新单词列表
    if (isWordsListPage && wordsTableEl && wordsTableBodyEl) {
        // 更新单词计数
        if (wordCountEl) {
            wordCountEl.textContent = `${getWordCount()}个单词`;
        }
        
        // 使用从模块导入的 updateTagFilterSelect 函数
        if (tagFilterSelect) {
            updateTagFilterSelect();
        }
        
        // 更新表格
        updateWordsTable();
    }
}

// 更新单词表格
function updateWordsTable() {
    if (!wordsTableBodyEl || !wordsTableEl || !emptyTableEl) return;
    
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
                    setSelectedTagFilter(tag);
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
                window.userSettings = userSettings;
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
            window.userSettings = userSettings;
            
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
    if (!selectedLanguagesEl) return;
    
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
    
    // 生成添加单词表单的语言输入框
    generateLanguageInputs();
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
    if (!languageInputsContainerEl) return;
    
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
                    <button type="button" class="language-expand-btn" data-lang="${langCode}">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
                <div class="language-word-input-wrapper">
                    <input type="text" class="form-control language-word-input" 
                           id="${langCode}-word" 
                           data-lang="${langCode}"
                           placeholder="输入${language.name}单词（可选）">
                    <div class="word-input-actions">
                        <button type="button" class="play-audio-input-btn" id="${langCode}-play-audio" data-lang="${langCode}" title="播放发音" style="display: none;">
                            <i class="fas fa-volume-up"></i>
                        </button>
                        <button type="button" class="record-audio-btn" id="${langCode}-record-audio" data-lang="${langCode}" title="录音">
                            <i class="fas fa-microphone"></i>
                        </button>
                        <span class="user-audio-badge-input" id="${langCode}-audio-badge" style="display: none;" title="已录音">🎤</span>
                    </div>
                    <div class="auto-translate-actions" id="${langCode}-translate-actions" style="display: none;">
                        <button type="button" class="accept-translate-btn" data-lang="${langCode}" title="接受翻译">
                            <i class="fas fa-check"></i>
                        </button>
                        <button type="button" class="reject-translate-btn" data-lang="${langCode}" title="拒绝翻译">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="language-extra-fields" id="${langCode}-extra-fields" style="display: none;">
                    <input type="text" class="form-control language-phonetic-input" 
                           id="${langCode}-phonetic" 
                           data-lang="${langCode}"
                           placeholder="音标（可选）">
                    <textarea class="form-control language-example-input" 
                           id="${langCode}-example" 
                           data-lang="${langCode}"
                           placeholder="例句（可选）"></textarea>
                </div>
            `;
            
            languageInputsContainerEl.appendChild(inputGroup);
        }
    });
    
    // 添加展开/折叠按钮事件
    setTimeout(() => {
        document.querySelectorAll('.language-expand-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const langCode = this.getAttribute('data-lang');
                const extraFields = document.getElementById(`${langCode}-extra-fields`);
                const icon = this.querySelector('i');
                
                if (extraFields) {
                    if (extraFields.style.display === 'none') {
                        extraFields.style.display = 'block';
                        icon.classList.remove('fa-chevron-down');
                        icon.classList.add('fa-chevron-up');
                    } else {
                        extraFields.style.display = 'none';
                        icon.classList.remove('fa-chevron-up');
                        icon.classList.add('fa-chevron-down');
                    }
                }
            });
        });
        
        // 添加自动翻译功能
        setupAutoTranslate();
        
        // 添加发音和录音功能
        setupAudioFeatures();
    }, 100);
}

// 显示单词卡片
function showWordCard(wordId) {
    if (!wordCardEl || !wordCardOverlayEl) return;
    
    const word = getWordById(wordId);
    if (!word) return;
    
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
                    
                    // 发音按钮HTML
                    let audioHtml = '';
                    if (trans.text) {
                        const hasUserAudio = trans.audio ? 'has-user-audio' : '';
                        audioHtml = `
                            <div class="card-translation-audio">
                                <button type="button" class="play-audio-btn" data-word-id="${word.id}" data-lang="${trans.language}" data-text="${trans.text}" title="播放发音">
                                    <i class="fas fa-volume-up"></i>
                                </button>
                                ${trans.audio ? '<span class="user-audio-badge" title="使用用户录音">🎤</span>' : ''}
                            </div>
                        `;
                    }
                    
                    return `
                        <div class="card-translation-item">
                            <div class="card-translation-header">
                                <span class="language-flag" style="background-color: ${lang.color}">${lang.code.toUpperCase()}</span>
                                <span class="card-translation-language">${lang.name}</span>
                            </div>
                            <div class="card-translation-text-wrapper">
                                <div class="card-translation-text" style="${!trans.text ? 'color: #94a3b8; font-style: italic;' : ''}">
                                    ${wordText}
                                </div>
                                ${audioHtml}
                            </div>
                            ${phoneticHtml}
                            ${exampleHtml}
                        </div>
                    `;
                }).join('')}
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
            ${imageHtml}
            
            ${tagsHtml}
            
            ${translationsHtml}
            
            ${nativeNoteHtml}
            
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
    if (closeBtn) {
        closeBtn.addEventListener('click', closeWordCard);
    }
    
    // 添加编辑按钮事件
    const editBtn = document.getElementById('edit-word-from-card');
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            editWord(wordId);
            closeWordCard();
        });
    }
    
    // 添加删除按钮事件
    const deleteBtn = document.getElementById('delete-word-from-card');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            showDeleteConfirm(wordId);
            closeWordCard();
        });
    }
    
    // 添加标签点击事件（筛选功能）
    document.querySelectorAll('.card-tag').forEach(tagElement => {
        tagElement.addEventListener('click', (e) => {
            e.stopPropagation();
            const tag = tagElement.getAttribute('data-tag');
            if (tagFilterSelect) {
                tagFilterSelect.value = tag;
            }
            setSelectedTagFilter(tag);
            closeWordCard();
            updateWordsTable();
        });
    });
    
    // 添加发音按钮事件
    document.querySelectorAll('.play-audio-btn').forEach(btn => {
        btn.addEventListener('click', async function(e) {
            e.stopPropagation();
            const wordId = this.getAttribute('data-word-id');
            const langCode = this.getAttribute('data-lang');
            const text = this.getAttribute('data-text');
            const word = getWordById(wordId);
            
            if (word && word.translations) {
                const translation = word.translations.find(t => t.language === langCode);
                if (translation) {
                    await playWordAudio(text, langCode, translation.audio);
                }
            }
        });
    });
}

// 关闭单词卡片
function closeWordCard() {
    if (wordCardOverlayEl) {
        wordCardOverlayEl.style.display = 'none';
    }
}

// 点击卡片外部关闭
if (wordCardOverlayEl) {
    wordCardOverlayEl.addEventListener('click', (e) => {
        if (e.target === wordCardOverlayEl) {
            closeWordCard();
        }
    });
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
            window.location.href = 'index.html';
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
        resetEditingState();
        modalTitleEl.textContent = '添加新单词';
        modalDescriptionEl.textContent = '为每个语言输入单词，可以添加母语注释、图片和标签';
        saveWordBtn.textContent = '保存单词';
        if (deleteWordBtn) deleteWordBtn.style.display = 'none';
        
        // 清空表单
        addWordFormEl.reset();
        // 使用 imageManager 的 resetImageData 函数
        resetImageData();
        
        // 初始化标签输入
        tagsManager = initTagsInput();
        
        // 显示模态框
        addWordModalEl.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // 关闭单词卡片
        closeWordCard();
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
    const word = getWordById(wordId);
    if (!word) return;
    
    editingWordId = wordId;
    
    // 更新模态框标题
    modalTitleEl.textContent = '编辑单词';
    modalDescriptionEl.textContent = '修改单词内容';
    saveWordBtn.textContent = '更新单词';
    if (deleteWordBtn) deleteWordBtn.style.display = 'inline-block';
    
    // 填充表单数据
    document.getElementById('native-note').value = word.nativeNote || '';
    
    // 显示图片预览 - 使用 imageManager 的 setImageData 函数
    setImageData(word.image);
    
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
                
                // 加载录音数据
                if (translation.audio) {
                    recordedAudios[langCode] = translation.audio;
                    const audioBadge = document.getElementById(`${langCode}-audio-badge`);
                    if (audioBadge) {
                        audioBadge.style.display = 'inline-block';
                    }
                }
                
                // 显示播放按钮（如果有单词）
                if (translation.text) {
                    const playBtn = document.getElementById(`${langCode}-play-audio`);
                    if (playBtn) {
                        playBtn.style.display = 'inline-flex';
                    }
                }
                
                // 如果有音标或例句，自动展开该语言的额外字段
                if (translation.phonetic || translation.example) {
                    const extraFields = document.getElementById(`${langCode}-extra-fields`);
                    const expandBtn = document.querySelector(`.language-expand-btn[data-lang="${langCode}"]`);
                    if (extraFields && expandBtn) {
                        extraFields.style.display = 'block';
                        const icon = expandBtn.querySelector('i');
                        if (icon) {
                            icon.classList.remove('fa-chevron-down');
                            icon.classList.add('fa-chevron-up');
                        }
                    }
                }
            } else {
                wordInput.value = '';
                phoneticInput.value = '';
                exampleInput.value = '';
            }
        }
    });
    
    // 清除自动翻译标记（编辑模式下不自动翻译）
    autoTranslatedInputs.clear();
    document.querySelectorAll('.language-word-input').forEach(input => {
        input.classList.remove('auto-translated');
    });
    
    // 显示模态框
    addWordModalEl.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// 显示删除确认
function showDeleteConfirm(wordId) {
    if (!deleteModalEl || !deleteConfirmTextEl) return;
    
    const word = getWordById(wordId);
    if (!word) return;
    
    editingWordId = wordId;
    deleteConfirmTextEl.textContent = `您确定要删除 "${word.nativeNote || '这个单词'}" 吗？`;
    deleteModalEl.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// 切换母语列显示
if (toggleNativeBtn) {
    toggleNativeBtn.addEventListener('click', () => {
        const newValue = !getShowNativeColumn();
        setShowNativeColumn(newValue);
        
        // 更新按钮状态
        if (newValue) {
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

// 标签筛选变化事件
if (tagFilterSelect) {
    tagFilterSelect.addEventListener('change', function() {
        setSelectedTagFilter(this.value);
        updateWordsTable();
    });
}

// 排序选项变化事件
if (sortOptionSelect) {
    sortOptionSelect.addEventListener('change', function() {
        setSortOption(this.value);
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
    // 使用 imageManager 的 getImageData 函数
    const image = getImageData();
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
            // 获取录音数据（优先使用当前表单中的录音，否则使用编辑时的录音）
            const audioData = recordedAudios[langCode] || null;
            
            translations.push({
                language: langCode,
                text: wordText,
                phonetic: phoneticText,
                example: exampleText,
                audio: audioData || null
            });
        }
    });
    
    // 修改验证逻辑：允许只有母语注释或标签，不需要必须填写单词
    if (translations.length === 0 && !nativeNote && tags.length === 0) {
        showMessage('请至少填写一个单词、母语注释或标签', 'error');
        return;
    }
    
    const wordData = {
        translations,
        nativeNote: nativeNote || null,
        image: image || null,
        tags: tags.length > 0 ? tags : null
    };
    
    if (editingWordId) {
        // 编辑模式：更新现有单词
        const success = updateWord(editingWordId, wordData);
        if (success) {
            const firstWord = translations[0]?.text || nativeNote || '单词';
            showMessage(`"${firstWord}" 已更新`);
        }
    } else {
        // 添加模式：创建新单词
        const success = addWord(wordData);
        if (success) {
            const firstWord = translations[0]?.text || nativeNote || '单词';
            showMessage(`"${firstWord}" 已添加到单词本`);
        }
    }
    
    // 重置表单
    addWordFormEl.reset();
    // 使用 imageManager 的 resetImageData 函数
    resetImageData();
    
    // 清除自动翻译标记
    autoTranslatedInputs.clear();
    document.querySelectorAll('.language-word-input').forEach(input => {
        input.classList.remove('auto-translated');
    });
    
    // 清空录音数据
    resetRecordedAudios();
    userSettings.learningLanguages.forEach(langCode => {
        const audioBadge = document.getElementById(`${langCode}-audio-badge`);
        if (audioBadge) {
            audioBadge.style.display = 'none';
        }
        const playBtn = document.getElementById(`${langCode}-play-audio`);
        if (playBtn) {
            playBtn.style.display = 'none';
        }
    });
    
    // 关闭模态框
    addWordModalEl.style.display = 'none';
    document.body.style.overflow = 'auto';
    });
}

// 重置表单
if (resetFormBtn) {
    resetFormBtn.addEventListener('click', function() {
    if (confirm('确定要清空表单吗？')) {
        addWordFormEl.reset();
        // 使用 imageManager 的 resetImageData 函数
        resetImageData();
        
        // 清除自动翻译标记
        autoTranslatedInputs.clear();
        document.querySelectorAll('.language-word-input').forEach(input => {
            input.classList.remove('auto-translated');
        });
        
        if (tagsManager) {
            tagsManager.setTags([]);
        }
        showMessage('表单已重置');
    }
    });
}

// 当前视图模式
let currentViewMode = 'table'; // 'table' 或 'card'


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
        const deletedWord = deleteWord(editingWordId);
        if (deletedWord) {
            showMessage(`"${deletedWord.nativeNote || '单词'}" 已删除`);
            
            // 关闭删除确认模态框
            deleteModalEl.style.display = 'none';
            document.body.style.overflow = 'auto';
            
            // 关闭编辑模态框
            addWordModalEl.style.display = 'none';
            document.body.style.overflow = 'auto';
            
            // 重置编辑单词ID
            resetEditingState();
        }
    }
    });
}

// 导出按钮点击事件
if (exportBtn) {
    exportBtn.addEventListener('click', () => {
        exportWords();
    });
}

// 导入文件选择事件
if (importFileInput) {
    importFileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            importWords(file).then(result => {
                if (result && result.message) {
                    showMessage(result.message, 'success');
                }
            }).catch(error => {
                console.error('导入失败:', error);
            });
            // 清空文件选择，以便可以重复选择同一文件
            e.target.value = '';
        }
    });
}

// 批量添加功能
if (batchAddBtn) {
    batchAddBtn.addEventListener('click', () => {
        // 获取当前表单数据
        const nativeNote = document.getElementById('native-note').value.trim();
        // 使用 imageManager 的 getImageData 函数
        const image = getImageData();
        const tags = tagsManager ? tagsManager.getTags() : [];
        
        // 收集翻译
        const translations = [];
        userSettings.learningLanguages.forEach(langCode => {
            const wordInput = document.getElementById(`${langCode}-word`);
            const phoneticInput = document.getElementById(`${langCode}-phonetic`);
            const exampleInput = document.getElementById(`${langCode}-example`);
            
            const wordText = wordInput ? wordInput.value.trim() : '';
            const phoneticText = phoneticInput ? phoneticInput.value.trim() : '';
            const exampleText = exampleInput ? exampleInput.value.trim() : '';
            
            if (wordText || phoneticText || exampleText) {
                translations.push({
                    language: langCode,
                    text: wordText,
                    phonetic: phoneticText,
                    example: exampleText
                });
            }
        });
        
        // 验证至少有一个单词
        if (translations.length === 0 && !nativeNote && tags.length === 0) {
            showMessage('请至少填写一个单词、母语注释或标签', 'error');
            return;
        }
        
        // 保存当前单词
        const wordData = {
            translations,
            nativeNote: nativeNote || null,
            image: image || null,
            tags: tags.length > 0 ? tags : null
        };
        
        const success = addWord(wordData);
        if (!success) {
            return; // 保存失败，不继续执行
        }
        
        // 清空表单（保留标签，清除图片）
        document.getElementById('native-note').value = '';
        // 使用 imageManager 的 resetImageData 函数
        resetImageData();
        
        // 清除自动翻译标记
        autoTranslatedInputs.clear();
        
        userSettings.learningLanguages.forEach(langCode => {
            const wordInput = document.getElementById(`${langCode}-word`);
            const phoneticInput = document.getElementById(`${langCode}-phonetic`);
            const exampleInput = document.getElementById(`${langCode}-example`);
            if (wordInput) {
                wordInput.value = '';
                wordInput.classList.remove('auto-translated');
            }
            if (phoneticInput) phoneticInput.value = '';
            if (exampleInput) exampleInput.value = '';
        });
        
        showMessage('单词已添加，可以继续添加下一个', 'success');
        
        // 聚焦到第一个单词输入框
        const firstLangCode = userSettings.learningLanguages[0];
        if (firstLangCode) {
            const firstInput = document.getElementById(`${firstLangCode}-word`);
            if (firstInput) {
                firstInput.focus();
            }
        }
    });
}

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    initViewToggle();
    // 初始化单词管理器
    initWordManager({
        showMessage: showMessage,
        updateAllTags: updateAllTags,
        updateTagFilterSelect: updateTagFilterSelect,
        updateHomeWordCount: updateHomeWordCount,
        updateWordsTable: updateWordsTable,
        loadWords: loadWordsCallback
    });
    
    // 初始化语言选择
    initLanguageSelection();
    
    // 初始化图片管理器
    initImageManager({
        // DOM元素
        imageUrlInput: document.getElementById('image-url'),
        imageUploadInput: document.getElementById('image-upload'),
        clearImageBtn: document.getElementById('clear-image-btn'),
        imagePreview: document.getElementById('image-preview'),
        cameraBtn: document.getElementById('camera-btn'),
        drawBtn: document.getElementById('draw-btn'),
        cameraModal: document.getElementById('camera-modal'),
        cameraVideo: document.getElementById('camera-video'),
        cameraCanvas: document.getElementById('camera-canvas'),
        captureBtn: document.getElementById('capture-btn'),
        retakeBtn: document.getElementById('retake-btn'),
        usePhotoBtn: document.getElementById('use-photo-btn'),
        closeCameraModalBtn: document.getElementById('close-camera-modal'),
        drawModal: document.getElementById('draw-modal'),
        drawCanvas: document.getElementById('draw-canvas'),
        drawColor: document.getElementById('draw-color'),
        drawSize: document.getElementById('draw-size'),
        drawSizeValue: document.getElementById('draw-size-value'),
        clearCanvasBtn: document.getElementById('clear-canvas-btn'),
        useDrawingBtn: document.getElementById('use-drawing-btn'),
        closeDrawModalBtn: document.getElementById('close-draw-modal'),
        
        // 回调函数
        showMessage: showMessage
    });
});

// 确保在页面重新获得焦点时重新加载数据
window.addEventListener('focus', function() {
    console.log('Page gained focus, reloading word data');
    // 单词管理器会在初始化时加载数据，这里可以触发更新
    if (loadWordsCallback) loadWordsCallback();
});

// 确保在页面可见性变化时重新加载数据
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        console.log('Page became visible, reloading word data');
        if (loadWordsCallback) loadWordsCallback();
    }
});

// 确保在页面显示时重新加载数据（处理浏览器前进/后退）
window.addEventListener('pageshow', function(event) {
    console.log('Page shown, reloading word data');
    if (loadWordsCallback) loadWordsCallback();
});