# Playwright Mapping

本文件用于把测试用例映射成后续 Playwright 的 spec 结构与断言策略。

## 推荐 spec 拆分

- `users.list.spec`
- `users.create.spec`
- `users.edit.spec`
- `users.delete.spec`
- `users.error.spec`

## 场景映射

### `users.list.spec`

覆盖场景：

- 列表加载成功
- 空列表与非空列表展示
- 分页行为

推荐断言：

- 标题 `Users`
- 表头文本
- 数据行是否存在
- `No users found`
- `Page X of Y`
- `Previous` / `Next` 按钮状态

### `users.create.spec`

覆盖场景：

- 创建用户成功
- 创建表单校验失败

推荐断言：

- `Create User` 对话框标题
- 必填字段错误
- 非法邮箱错误
- 成功 toast
- 新增用户出现在列表

### `users.edit.spec`

覆盖场景：

- 单字段编辑成功
- 清空 `email`
- 清空 `birth`
- 编辑未修改时不可保存

推荐断言：

- `Edit User` 标题
- `Save` 按钮禁用与启用状态
- 目标字段值更新
- 未修改字段保持原值
- 清空后的空展示

### `users.delete.spec`

覆盖场景：

- 确认删除
- 取消删除

推荐断言：

- 浏览器 `confirm` 分支
- 删除成功 toast
- 目标行是否消失
- 取消删除后目标行仍存在

### `users.error.spec`

覆盖场景：

- 列表失败后重试
- 创建或编辑时的后端错误反馈

推荐断言：

- 错误文案
- `Retry` 按钮
- 字段级错误
- 弹窗保持打开

## 断言优先级

优先使用以下稳定信号：

- 可见文本
- 对话框标题
- 按钮可用状态
- toast 文案
- 页码文案
- 表格单元格文本

不推荐优先依赖：

- Radix 内部结构
- 图标 SVG 路径
- 脆弱的层级 CSS 选择器

## 数据与脚本组织建议

- 每个会变更数据的场景都独立准备测试用户
- 将通用造数、清理、页面进入逻辑抽成 helpers
- 删除场景使用专门创建的数据，避免误删复用对象
- `PATCH` 语义场景必须记录编辑前后值，便于断言“仅目标字段变化”
