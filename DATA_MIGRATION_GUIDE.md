# 数据迁移指南

## 问题描述

如果你发现之前保存的单词无法在单词列表页面显示，这可能是因为：

1. **文件名变更**：单词列表页面的文件名从 `words-list.html` 改为 `words_list.html`
2. **存储键名**：可能使用了不同的localStorage键名存储数据

## 解决方案

### 🚀 自动解决（推荐）

1. 打开应用，系统会自动检测并迁移旧数据
2. 如果自动迁移成功，你的单词会立即显示

### 🔧 手动解决

如果自动迁移失败，可以使用调试工具：

1. 访问 `debug_storage.html` 页面
2. 点击"检查当前数据"查看现状
3. 点击"扫描所有可能的旧数据"查找旧数据
4. 使用"执行自动数据迁移"或"手动迁移"功能

### 🛠️ 开发者工具方法

如果你熟悉浏览器开发者工具：

1. 按 F12 打开开发者工具
2. 切换到 Console 标签
3. 输入以下命令查看所有存储数据：
   ```javascript
   // 查看所有localStorage键
   Object.keys(localStorage)
   
   // 查找可能的旧数据
   dataMigration.listPossibleOldData()
   
   // 手动迁移（替换为实际的键名）
   dataMigration.manualMigrate('旧单词键名', '旧设置键名')
   ```

## 支持的旧键名

系统会自动检测以下可能的旧存储键名：

### 单词数据：
- `words`
- `wordsList`
- `multilingualWords`
- `languageWords`
- `vocabularyWords`
- `polyglot_words`
- `notebook_words`
- `language_notebook_words`

### 设置数据：
- `settings`
- `userSettings`
- `languageSettings`
- `polyglot_settings`
- `notebook_settings`

## 当前使用的键名

- **单词数据**：`polyglotWords`
- **设置数据**：`polyglotSettings`

## 文件整合说明

已将以下重复文件整合到 `words_list.html`：
- ✅ `words_list.html` - 主文件（包含完整功能）
- ❌ `words-list.html` - 已删除
- ❌ `WordsList.html` - 已删除

## 注意事项

1. **数据安全**：迁移过程不会删除原始数据，确保安全
2. **备份建议**：建议使用导出功能备份你的单词数据
3. **浏览器兼容**：支持所有现代浏览器的localStorage功能

## 如果仍有问题

1. 尝试清除浏览器缓存后重新访问
2. 检查浏览器是否启用了localStorage
3. 使用调试工具页面进行详细诊断

---

**快速访问链接：**
- [调试工具页面](debug_storage.html)
- [返回首页](index.html)
- [单词列表](words_list.html)