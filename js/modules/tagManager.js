// 标签管理模块（兼容当前全局变量方式）
// 依赖全局：words, allTags(Set), selectedTagFilter, tagFilterSelect，以及 UI 中的标签输入容器
// 若存在 showMessage 全局则用于提示。

// 更新所有标签集合
export function updateAllTags() {
    const tagsSet = getAllTagsSet();
    const wordList = getWords();
    if (!tagsSet || !wordList) return;

    tagsSet.clear();
    wordList.forEach(word => {
        if (word.tags && word.tags.length > 0) {
            word.tags.forEach(tag => {
                if (tag && tag.trim()) {
                    tagsSet.add(tag.trim());
                }
            });
        }
    });
}

// 更新标签筛选下拉框
export function updateTagFilterSelect() {
    const selectEl = document.getElementById('tag-filter');
    const tagsSet = getAllTagsSet();
    if (!selectEl || !tagsSet) return;

    const currentValue = selectEl.value;
    selectEl.innerHTML = '<option value="">所有单词</option>';

    const sortedTags = Array.from(tagsSet).sort();
    sortedTags.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag;
        selectEl.appendChild(option);
    });

    if (sortedTags.includes(currentValue)) {
        selectEl.value = currentValue;
    } else {
        selectEl.value = '';
        setSelectedTagFilter('');
    }
}

// 初始化标签输入（用于添加/编辑模态框）
export function initTagsInput() {
    const container = document.getElementById('tags-input-container');
    const suggestionsEl = document.getElementById('tags-suggestions');
    if (!container || !suggestionsEl) {
        return {
            getTags: () => [],
            setTags: () => {}
        };
    }

    let currentTags = [];

    function render() {
        container.innerHTML = '';

        // 现有标签 chips
        currentTags.forEach((tag, index) => {
            const tagEl = document.createElement('span');
            tagEl.className = 'tag-input-item';
            tagEl.innerHTML = `
                ${tag}
                <span class="remove-tag" data-index="${index}">&times;</span>
            `;
            container.appendChild(tagEl);
        });

        // 输入框
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'tag-input';
        input.id = 'tag-input';
        input.placeholder = currentTags.length === 0 ? '输入标签，按回车添加' : '';
        container.appendChild(input);
        input.focus();

        input.addEventListener('input', handleInput);
        input.addEventListener('keydown', handleKeydown);
        input.addEventListener('blur', handleBlur);

        container.querySelectorAll('.remove-tag').forEach(removeBtn => {
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(removeBtn.getAttribute('data-index'));
                currentTags.splice(idx, 1);
                render();
            });
        });

        updateSuggestions(input.value);
    }

    function handleInput(e) {
        updateSuggestions(e.target.value);
    }

    function handleKeydown(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag(e.target.value);
        } else if (e.key === 'Backspace' && e.target.value === '' && currentTags.length > 0) {
            currentTags.pop();
            render();
        } else if (e.key === 'Escape') {
            suggestionsEl.classList.remove('show');
        }
    }

    function handleBlur(e) {
        setTimeout(() => {
            if (e.target.value.trim()) {
                addTag(e.target.value);
            }
            suggestionsEl.classList.remove('show');
        }, 200);
    }

    function addTag(text) {
        const t = text.trim();
        if (!t) return;
        if (!currentTags.includes(t)) {
            currentTags.push(t);
            render();
        } else {
            if (window.showMessage) {
                window.showMessage(`标签"${t}"已存在`, 'info');
            }
            render();
        }
    }

    function updateSuggestions(inputText) {
        const trimmed = (inputText || '').trim().toLowerCase();
        suggestionsEl.innerHTML = '';
        if (!trimmed) {
            suggestionsEl.classList.remove('show');
            return;
        }
        const tagsSet = getAllTagsSet();
        if (!tagsSet) return;

        const suggestions = Array.from(tagsSet)
            .filter(tag => tag.toLowerCase().includes(trimmed) && !currentTags.includes(tag))
            .sort();

        if (suggestions.length === 0) {
            suggestionsEl.classList.remove('show');
            return;
        }

        suggestions.forEach(tag => {
            const s = document.createElement('div');
            s.className = 'tag-suggestion';
            s.textContent = tag;
            s.addEventListener('click', () => {
                addTag(tag);
                suggestionsEl.classList.remove('show');
            });
            suggestionsEl.appendChild(s);
        });
        suggestionsEl.classList.add('show');
    }

    render();

    return {
        getTags: () => [...currentTags],
        setTags: (tags) => {
            currentTags = tags ? [...tags] : [];
            render();
        }
    };
}

// Helpers
function getWords() {
    return window.words || window.WORDS || null;
}

function getAllTagsSet() {
    return window.allTags || window.ALL_TAGS || null;
}

function setSelectedTagFilter(val) {
    if (typeof window.selectedTagFilter !== 'undefined') {
        window.selectedTagFilter = val;
    }
}
