# Agent-Browser Pitfalls

本文件记录 agent-browser 走查过程中发现的问题和注意事项。

## 1. 点击按钮导致崩溃

### 问题
使用 `agent-browser click @e4` 或 `find role button click --name "Add User"` 点击 "Add User" 按钮时，页面抛出 JavaScript 运行时错误：

```
Unhandled Runtime Error
Array.reduce
fn.e
```

### 原因
未完全确定，可能是 Radix Dialog 的打开机制与 agent-browser 的点击模拟不完全兼容。

### 解决方案
使用 `eval` 方法执行点击：

```bash
agent-browser eval "Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Add User'))?.click()"
```

或者先关闭对话框后再用相同方式打开。

---

## 2. 编辑弹窗打开方式

### 问题
点击表格行中的编辑按钮（铅笔图标）时，遇到 confirm 对话框阻塞。

### 解决方案
使用 `eval` 方法：

```bash
agent-browser eval "document.querySelectorAll('tr')[n].querySelectorAll('button')[0]?.click()"
```

注意：表格按钮顺序通常是 [编辑, 删除]

---

## 3. 删除确认框

### 观察
前端删除使用浏览器原生 `confirm("Are you sure?")`，不是自定义 UI。

### 交互方式
- `agent-browser dialog accept` - 确认删除
- `agent-browser dialog dismiss` - 取消删除

这是 **前端** 行为，不是后端 API。

---

## 4. 按钮 ref 不稳定

### 问题
每次页面加载或操作后，按钮的 `ref=eN` 编号会变化。

### 解决方案
使用 `eval` 查询或文本匹配，不要依赖固定的 ref 编号。

---

## 5. 日期选择器

### 观察
Radix UI 的日期选择器在 accessibility tree 中显示为多个 spinbutton。

### 建议
直接使用 `fill` 填入字符串格式 `YYYY-MM-DD`。

---

## 常用命令模板

```bash
# 打开页面
agent-browser open http://localhost:3000/users && agent-browser wait --load networkidle

# 获取快照
agent-browser snapshot -i

# 打开创建弹窗（eval 方法）
agent-browser eval "Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Add User'))?.click()"

# 填写表单
agent-browser fill @e4 "uid_value"
agent-browser fill @e5 "Name"
agent-browser click @e10  # Save

# 打开编辑弹窗
agent-browser eval "document.querySelectorAll('tr')[1].querySelectorAll('button')[0]?.click()"

# 处理删除确认
agent-browser dialog accept   # 确认
agent-browser dialog dismiss  # 取消

# 截图
agent-browser screenshot /tmp/screenshot.png
```