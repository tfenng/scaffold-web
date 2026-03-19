# scaffold-web 技术栈评估

## 1. 项目概览

`scaffold-web` 是一个基于 Next.js 14、React 18、TypeScript 5 的前端管理台工程，当前主要实现了用户列表展示与用户 CRUD 功能，后端通过 `/api/v1/users` 系列接口提供数据。

从仓库现状看，这个项目不是一个强调 SSR 或全栈同构能力的 Next.js 应用，而是一个以 App Router 为壳、以客户端交互为主、面向后台管理场景的前端工程。

## 2. 技术栈拆解

以下内容只统计“仓库中已落地使用”的技术，而不是单纯出现在依赖清单中的包。

| 类别 | 已采用技术 | 当前职责 |
| --- | --- | --- |
| 框架与运行时 | Next.js 14、React 18、TypeScript 5 | 提供应用框架、路由能力、组件模型与类型系统 |
| 路由体系 | App Router | 使用 `src/app` 目录组织页面、布局和分组路由 |
| 数据请求 | `@tanstack/react-query`、`axios` | 负责接口请求、缓存、失效刷新、异步状态管理 |
| 本地状态 | `zustand` | 用于轻量级本地共享状态管理，当前已存在用户状态 store |
| 表单与校验 | `react-hook-form`、`zod`、`@hookform/resolvers` | 负责表单状态管理、字段校验和前端输入约束 |
| UI 与样式 | Tailwind CSS、PostCSS、Autoprefixer | 负责原子化样式、构建期样式处理和兼容性补全 |
| 组件基础设施 | Radix UI primitives、`class-variance-authority`、`clsx`、`tailwind-merge` | 负责无头交互组件、样式变体管理、类名拼接与合并 |
| 体验增强 | `lucide-react`、`sonner` | 分别用于图标与消息提示 |
| 包管理 | `pnpm` | 负责依赖安装与锁定，仓库中已包含 `pnpm-lock.yaml` |
| 构建与部署 | Docker 多阶段构建、BusyBox `httpd` | 负责产物构建与静态资源托管 |

### 事实依据

- `package.json` 显示本项目核心依赖为 `next`、`react`、`react-dom`、`@tanstack/react-query`、`zustand`、`react-hook-form`、`zod`、`axios`、`tailwindcss` 等。
- `src/components/providers.tsx` 已实际创建 `QueryClient` 并挂载 `QueryClientProvider` 与 `Toaster`。
- `src/lib/api.ts` 已使用 `axios.create()` 封装 API 访问层。
- `src/stores/user-store.ts` 已使用 `zustand` 创建 store。
- `src/components/users/user-dialog.tsx` 与 `src/schemas/user-schema.ts` 已使用 `react-hook-form`、`zodResolver`、`zod` 实现表单与校验。
- `src/components/ui/button.tsx`、`src/components/ui/dialog.tsx`、`src/lib/utils.ts` 已实际使用 Radix、CVA、`clsx` 和 `tailwind-merge`。
- `tailwind.config.ts`、`postcss.config.js`、`src/app/globals.css` 已形成完整 Tailwind 样式链路。

### 当前未发现已接入的能力

基于仓库现状，当前没有明确发现以下体系已经接入，因此不应写成“已采用”：

- 单元测试框架
- 组件测试或 E2E 测试体系
- 组件文档系统
- 国际化方案
- 状态持久化方案
- CI 工作流配置

## 3. 架构特征判断

### 3.1 路由与渲染方式

当前项目使用的是 Next.js App Router，而不是传统 `pages` Router。页面和布局位于 `src/app` 目录下，包含根布局、分组布局和用户页面。

同时，核心业务页面 `src/app/(dashboard)/users/page.tsx` 明确使用了 `"use client"`，这说明用户列表页面采用客户端组件模式进行数据获取与交互处理。结合 `useQuery`、`useMutation`、弹窗表单和删除确认逻辑，可以判断当前业务主路径以客户端渲染和客户端交互为主。

### 3.2 数据流与状态分层

当前数据层采用“React Query 管服务端状态，Zustand 管轻量本地状态”的组合：

- React Query 负责列表查询、详情查询、创建、更新、删除后的缓存失效和刷新。
- Axios 负责 HTTP 客户端与错误对象解析。
- Zustand 当前只承载轻量共享状态，没有演变成大规模全局状态容器。

这是一种比较典型的后台管理台分层方式，职责边界也相对清晰。

### 3.3 表单与输入约束

表单层采用 `react-hook-form + zod` 组合，并通过 `@hookform/resolvers` 接入校验器。这个组合的优点是：

- 表单状态管理成本较低
- 校验规则集中且可复用
- 能和 TypeScript 类型推导较好衔接

对于用户创建和编辑场景，这套方案是合适且成熟的。

### 3.4 构建与部署形态

`next.config.js` 中启用了 `output: "export"`，并设置了 `trailingSlash: true`。这意味着项目构建目标是静态导出产物，而不是依赖运行中的 Next.js SSR 服务器。

这一点又被以下实现进一步印证：

- `package.json` 的 `build` 脚本在 `next build` 后执行 `scripts/postbuild-static-export.sh`
- `scripts/postbuild-static-export.sh` 会补充 `out/index.html` 用于重定向到 `/users/`
- `Dockerfile` 的最终阶段并没有运行 `next start`，而是将 `/app/out` 拷贝到 BusyBox 镜像中，并通过 `httpd` 提供静态文件服务

因此，当前项目更准确的部署定义应当是“静态导出前端 + 外部独立后端 API”，而不是“长期运行在 Node.js Next Server 上的 SSR 应用”。

## 4. 适用性评估

从当前技术组合看，这个工程比较适合以下场景：

- 中小型后台管理台
- 以后端 REST API 为中心的前后端分离项目
- BFF 或独立后端服务驱动的管理界面
- 页面数量有限、交互复杂度中等、SEO 诉求较低的内部系统

### 优点

- 技术栈主流，团队上手成本较低
- React Query、React Hook Form、Zod 的组合比较适合 CRUD 密集型后台页面
- Tailwind + Radix 风格组件适合快速搭建一致性较强的内部系统 UI
- 静态导出后部署简单，适合容器化托管和轻量运维
- 类型定义、校验规则、API 封装已经具备基础分层，不是完全耦合在页面文件中

### 边界

- 如果未来需要大量 SSR、鉴权中间件、服务端渲染首屏优化或复杂 SEO，这套当前实现并没有体现出对应能力
- 如果页面规模快速增长，当前较轻的状态组织方式可能会逐步暴露边界
- 如果团队要提高交付稳定性，仅靠现有代码结构还不够，仍需要测试与质量门禁补位

## 5. 风险与短板

### 5.1 测试体系缺失

仓库中未发现单元测试、组件测试或 E2E 测试配置。当前用户 CRUD 这种核心流程主要依赖人工验证，回归成本和线上变更风险会随功能增长而上升。

### 5.2 工程质量门禁较弱

`package.json` 目前只有 `dev`、`build`、`start`、`lint` 四个脚本，未看到独立的类型检查、测试、格式化或 CI 流程定义。对中小项目来说这不一定会立刻出问题，但随着协作人数增长，稳定性约束会显得偏弱。

### 5.3 状态管理扩展策略尚不明显

Zustand 已经接入，但当前仓库中的使用规模还很轻。短期看这没有问题，长期则需要明确边界：哪些状态继续交给 React Query，哪些状态才进入 Zustand，否则后续可能出现职责重叠。

### 5.4 部署说明口径需要统一

仓库同时保留了 `pnpm start` 的 Node 启动说明和 `output: "export"` 的静态导出配置。就当前代码和 Docker 实现而言，静态导出才是更贴近真实产物形态的主路径，因此文档层面应避免让读者误以为该项目长期依赖 `next start` 运行。

### 5.5 API 契约与错误处理还有提升空间

当前已经有基础类型定义和错误解析函数，这是好的起点。但如果接口数量继续增加，仅靠手写 envelope 类型与局部错误解析，后续维护成本会逐步提高，尤其是在错误码、字段错误和响应结构发生演进时。

## 6. 改进建议

- P1: 增加单元测试、组件测试和至少一条用户 CRUD 关键路径测试。理由是当前核心业务已经具备稳定流程，测试投入会直接提升回归效率和变更信心。
- P1: 统一部署文档口径，明确“静态导出 + 静态服务器托管”才是当前主部署形态。理由是这能避免后续部署、运维和环境变量使用上的认知偏差。
- P2: 为 API 层补充更稳定的契约约束与错误处理策略。理由是随着接口变多，统一的响应模型、错误映射和请求封装会明显降低维护成本。
- P2: 补齐工程质量门禁，包括类型检查、格式化和 CI 校验。理由是这类约束能在多人协作前期尽早拦住低级问题。
- P3: 重新评估 Zustand 的长期定位，决定是继续保留为轻量共享状态工具，还是将更多本地 UI 状态收敛在页面/组件内部。理由是尽早划清边界能减少后续状态流混乱。
- P3: 在保持 Tailwind + Radix 组合不变的前提下，逐步补充更统一的设计约束。理由是当前组件基础已经具备，继续沉淀设计规范会更容易保持后台系统的一致性。

## 总结

整体来看，`scaffold-web` 的技术栈选择是务实且匹配当前阶段的：它更像一个面向后台业务的静态导出前端工程，而不是一个强调 SSR 的复杂全栈应用。现有组合已经足以支撑中小型管理台的持续迭代，但如果要走向更稳定的多人协作和更长期的维护阶段，优先补齐测试、质量门禁和部署认知统一，会比继续堆叠新技术更有收益。
