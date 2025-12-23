# Debug 文件夹

这个文件夹包含了项目的调试和测试文件。

## 📁 文件说明

### 🔧 调试工具
- **debug_storage.html** - 本地存储调试工具
  - 查看和管理localStorage数据
  - 测试数据存储和读取功能
  - 调试用户设置和单词数据

### 🎮 交互测试
- **button_test.html** - 按钮交互测试
  - 测试按钮点击事件
  - 验证UI响应性能
  - 调试用户界面交互

- **mobile_test.html** - 移动端触摸测试
  - 测试触摸滑动功能
  - 验证移动端手势识别
  - 调试触摸事件处理

### 🃏 卡片功能测试
- **card_debug.html** - 卡片调试工具
  - 测试卡片显示逻辑
  - 调试卡片切换动画
  - 验证卡片数据绑定

- **simple_card_test.html** - 简化卡片测试
  - 基础卡片功能测试
  - 简化的测试环境
  - 快速功能验证

## 🚀 使用方法

### 本地服务器访问
确保本地服务器运行在端口8000：
```bash
python3 -m http.server 8000
```

### 访问调试工具
- 存储调试：http://localhost:8000/debug/debug_storage.html
- 按钮测试：http://localhost:8000/debug/button_test.html
- 移动端测试：http://localhost:8000/debug/mobile_test.html
- 卡片调试：http://localhost:8000/debug/card_debug.html
- 简单卡片测试：http://localhost:8000/debug/simple_card_test.html

## 📝 注意事项

- 这些文件仅用于开发和调试
- 不应在生产环境中使用
- 部分文件可能包含测试数据
- 建议在隔离环境中运行测试

## 🔗 相关文件夹

- **test/** - 单元测试和功能测试
- **js/modules/** - 主要功能模块
- **styles/** - 样式文件

---

*最后更新：2024年12月23日*