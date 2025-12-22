# CSS 模块化结构说明

## 文件结构

```
styles/
├── main.css              # 主入口文件，导入所有模块
├── base.css              # 基础样式、CSS变量、重置样式
├── layout.css            # 布局相关样式
├── components/           # 组件样式
│   ├── buttons.css       # 按钮组件
│   ├── forms.css         # 表单组件
│   ├── modals.css        # 模态框组件
│   ├── cards.css         # 卡片组件
│   ├── tables.css        # 表格组件
│   └── tags.css          # 标签组件
├── pages/                # 页面样式
│   ├── setup.css         # 语言设置页面
│   ├── home.css          # 主页面
│   └── words.css         # 单词列表页面
└── modules/              # 功能模块样式
    ├── language.css      # 语言相关功能
    ├── audio.css         # 音频功能
    └── image.css         # 图片功能
```

## 设计原则

### 1. 关注点分离
- **base.css**: 全局样式、CSS变量、工具类
- **layout.css**: 布局系统、响应式网格
- **components/**: 可复用的UI组件
- **pages/**: 特定页面的样式
- **modules/**: 功能模块的样式

### 2. CSS变量系统
在 `base.css` 中定义了完整的设计系统变量：
- 颜色系统（主色、中性色、语言色）
- 间距系统（xs, sm, md, lg, xl, 2xl）
- 圆角系统（sm, md, lg, xl）
- 阴影系统（sm, md, lg, xl）
- 过渡时间（fast, normal）

### 3. 响应式设计
- 移动优先的响应式设计
- 统一的断点管理
- 响应式工具类

## 使用方法

### 引入样式
只需要在HTML中引入主文件：
```html
<link rel="stylesheet" href="styles/main.css">
```

### 添加新组件
1. 在 `components/` 目录下创建新的CSS文件
2. 在 `main.css` 中添加 `@import` 语句

### 使用CSS变量
```css
.my-component {
    background-color: var(--primary-color);
    padding: var(--spacing-md);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-normal);
}
```

## 优势

1. **更好的维护性**: 每个文件职责单一，易于定位和修改
2. **更好的复用性**: 组件样式可以独立复用
3. **更好的协作**: 多人开发时减少冲突
4. **更好的性能**: 可以按需加载特定模块
5. **更好的扩展性**: 新功能可以独立添加样式文件

## 迁移说明

原来的 `style.css` 文件已经被拆分为多个模块，HTML文件中的引用已更新为 `styles/main.css`。所有样式功能保持不变，只是组织结构更加清晰。