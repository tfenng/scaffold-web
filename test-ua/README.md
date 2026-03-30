# Test UA

`test-ua/` 用于沉淀 `/users` 页面相关的端到端测试文档，面向真实后端联调与后续自动化实现。

当前策略：

- 正式、可重复执行的回归测试以 Playwright 为主
- `agent-browser` 作为辅助层，用于页面探查、用例走查、失败复现和冒烟验收

本文档目录不直接存放测试代码，本轮只落测试方案与实施说明。

## 适用范围

- 页面入口：`/users`
- 后端前提：可访问的真实 `NEXT_PUBLIC_API_URL`
- 核心目标：验证用户列表管理的 CRUD 主链路，以及新版 `PATCH /api/v1/users/{id}` 更新语义

## 文档索引

- [`e2e-scope.md`](./e2e-scope.md)：测试范围与边界
- [`user-management-cases.md`](./user-management-cases.md)：详细测试用例
- [`test-data-strategy.md`](./test-data-strategy.md)：测试数据规范
- [`agent-browser-plan.md`](./agent-browser-plan.md)：`agent-browser` 使用方案与任务模板
- [`playwright-mapping.md`](./playwright-mapping.md)：用例到 Playwright 的映射
- [`runbook.md`](./runbook.md)：执行顺序与运行前检查项

## 当前接口基线

本轮文档基于以下接口行为编写：

- `GET /api/v1/users`
- `GET /api/v1/users/{id}`
- `POST /api/v1/users`
- `PATCH /api/v1/users/{id}`
- `DELETE /api/v1/users/{id}`

## 新版更新语义约定

- 编辑用户默认按 `PATCH` 语义设计验收
- 只修改单字段时，其余字段应保持原值
- 清空 `email` 或 `birth` 属于合法行为，预期结果为后端按 `null` 语义落地，前端展示为空

## UI 锚点约定

后续实现自动化脚本时，优先使用以下文本锚点：

- 页面标题：`Users`
- 主要按钮：`Add User`、`Save`、`Cancel`、`Retry`
- 对话框标题：`Create User`、`Edit User`
- 分页按钮：`Previous`、`Next`
