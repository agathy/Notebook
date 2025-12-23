# 母语切换逻辑修复 - 最终版本

## 问题描述

当用户切换母语时，单词中该语言的内容应该变成母语注释，而不是直接使用原来的母语注释。

**原来的错误行为：**
- 用户从中文切换到英语
- 系统将英语翻译内容合并到现有的中文母语注释中
- 结果：母语注释变成 "苹果; apple"（错误）

**正确的行为应该是：**
- 用户从中文切换到英语  
- 系统将原来的中文母语注释转换为中文翻译
- 系统将英语翻译内容设置为新的母语注释
- 结果：母语注释变成 "apple"，中文翻译变成 "苹果"（正确）

## 修复内容

### 1. 重构 userSettings.js 模块

**新增核心函数：**
```javascript
export function migrateLanguageData(previousNativeLanguage = null) {
    // 步骤1: 将原母语注释转换为翻译（如果原母语现在是学习语言）
    if (previousNativeLanguage && 
        word.nativeNote && 
        userSettings.learningLanguages.includes(previousNativeLanguage)) {
        word.translations.push({
            language: previousNativeLanguage,
            text: word.nativeNote,
            phonetic: '',
            example: '',
            audio: null
        });
    }
    
    // 步骤2: 将新母语的翻译内容设置为母语注释（直接替换）
    const nativeTranslation = word.translations.find(t => t.language === userSettings.nativeLanguage);
    if (nativeTranslation && nativeTranslation.text) {
        word.nativeNote = nativeTranslation.text;
        word.translations = word.translations.filter(t => t.language !== userSettings.nativeLanguage);
    }
}
```

**修改 selectNativeLanguageUI 函数：**
```javascript
function selectNativeLanguageUI(languageCode) {
    const previousNativeLanguage = userSettings.nativeLanguage; // 记录之前的母语
    userSettings.nativeLanguage = languageCode;
    
    // 如果母语发生了变化，执行数据迁移
    if (previousNativeLanguage && previousNativeLanguage !== languageCode) {
        migrateLanguageData(previousNativeLanguage).then(result => {
            if (result.migratedCount > 0) {
                showMessage(result.message, 'success');
            }
        });
    }
}
```

### 2. 清理 script.js 中的重复代码

**删除的重复函数：**
- `selectNativeLanguage()` - 本地版本
- `toggleLearningLanguage()` - 本地版本  
- `updateSelectedLanguagesDisplay()` - 本地版本
- `updateUserLanguagesDisplay()` - 本地版本
- `generateLanguageInputs()` - 本地版本
- `initLanguageSelection()` - 本地版本
- `createLanguageOption()` - 本地版本

**修改初始化代码：**
```javascript
// 使用模块化的 initUserSettings 替代本地的 initLanguageSelection
initUserSettings({
    showMessage: showMessage,
    nativeLanguageOptionsEl: nativeLanguageOptionsEl,
    learningLanguageOptionsEl: learningLanguageOptionsEl,
    selectedLanguagesEl: selectedLanguagesEl,
    startAppBtn: startAppBtn,
    languageSetupEl: languageSetupEl,
    mainAppEl: mainAppEl
});
```

### 3. 更新导入语句

**script.js 新增导入：**
```javascript
import {
    initUserSettings,
    userSettings,
    availableLanguages,
    updateUserLanguagesDisplay,
    updateSelectedLanguagesDisplay,
    generateLanguageInputs,
    saveSettingsToStorage,
    selectNativeLanguage,
    toggleLearningLanguage,
    getUserSettings,
    getLanguageInfo,
    reinitLanguageSelection,
    migrateLanguageData
} from './js/modules/userSettings.js';
```

### 4. 修复的文件列表

1. **js/modules/userSettings.js** - 完全重写，添加正确的迁移逻辑
2. **script.js** - 删除重复代码，使用模块化函数
3. **debug/debug_language.html** - 更新函数引用
4. **test/test_migration.html** - 更新函数引用

### 5. 新增测试文件

1. **test/language_switch_debug.html** - 专门的母语切换测试页面
2. **LANGUAGE_SWITCH_FIX.md** - 详细的修复说明
3. **UPDATES_LANGUAGE_SWITCH.md** - 更新日志

## 测试方法

### 使用测试页面
1. 打开 `test/language_switch_debug.html`
2. 点击"创建测试单词"
3. 观察当前单词的母语注释
4. 点击不同的语言切换按钮
5. 验证母语注释是否正确变化

### 预期结果
- 切换到中文：母语注释显示中文内容（如"苹果"）
- 切换到英语：母语注释显示英语内容（如"apple"）
- 切换到韩语：母语注释显示韩语内容（如"사과"）
- 原来的母语注释应该转换为相应语言的翻译

## 技术细节

### 数据迁移逻辑
1. **双向转换**：不仅将新母语的翻译设为母语注释，还将原母语注释转为翻译
2. **避免数据丢失**：确保语言切换时不会丢失任何翻译内容
3. **冲突处理**：如果目标语言已有翻译，优先保留现有翻译
4. **自动保存**：迁移完成后自动保存到本地存储

### 模块化改进
1. **避免代码重复**：将语言管理逻辑集中到 userSettings.js 模块
2. **统一接口**：所有语言相关操作通过统一的模块接口
3. **依赖注入**：通过参数传递DOM元素和回调函数
4. **错误处理**：完善的错误处理和日志记录

## 注意事项

1. **不可逆操作**：语言切换后的数据迁移是不可逆的
2. **备份建议**：重要数据建议在切换前备份
3. **浏览器兼容性**：使用现代JavaScript特性，需要较新的浏览器
4. **性能考虑**：大量单词时迁移可能需要一些时间

## 验证清单

- [x] 母语切换时正确迁移数据
- [x] 原母语注释转换为翻译
- [x] 新母语翻译设为母语注释
- [x] 删除重复代码
- [x] 模块化重构完成
- [x] 测试页面可用
- [x] 错误处理完善
- [x] 文档更新完整