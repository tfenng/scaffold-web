# scaffold-web

基于 Next.js 14、React 18、TypeScript、Tailwind CSS 和 React Query 的前端管理台，目前已实现用户列表与用户 CRUD 页面。

前端默认请求后端根地址 `http://localhost:8080`，并访问 `/api/v1/users` 系列接口。对应 Swagger 文档入口见 [api.md](./api.md)。

## 环境要求

- Node.js 18.17+ 或 20+
- pnpm 8+
- 可访问的后端服务

推荐优先使用 `pnpm`，因为仓库中包含 `pnpm-lock.yaml`。

## 环境变量

前端通过 `NEXT_PUBLIC_API_URL` 指定后端服务根地址。

开发环境可新建 `.env.local`：

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

生产环境可通过 `.env.production` 或进程环境变量注入：

```bash
NEXT_PUBLIC_API_URL=https://your-api.example.com
```

注意：

- 这里填写的是后端根地址，不要额外拼接 `/api/v1`
- 当前前端代码会自动请求 `${NEXT_PUBLIC_API_URL}/api/v1/users`

## 本地开发与调试

1. 安装依赖

```bash
pnpm install
```

2. 配置后端地址

创建 `.env.local`，写入：

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

3. 启动开发服务器

```bash
pnpm dev
```

默认访问地址：

- 首页: `http://localhost:3000`
- 用户页: `http://localhost:3000/users`

4. 开发时建议执行的检查

```bash
pnpm lint
pnpm build
```

### 调试要点

- 前端请求失败时，优先检查浏览器 Network 面板中 `/api/v1/users` 系列请求
- 如果页面出现空白或接口错误，先确认 `NEXT_PUBLIC_API_URL` 是否指向正确的后端根地址
- 如果需要对照接口契约，查看 `http://localhost:8080/swagger/swagger.json` 或后端 Swagger UI

## 生产构建与启动

1. 安装依赖

```bash
pnpm install --frozen-lockfile
```

2. 设置生产环境变量

```bash
export NODE_ENV=production
export NEXT_PUBLIC_API_URL=https://your-api.example.com
```

3. 构建生产包

```bash
pnpm build
```

4. 启动生产服务

```bash
PORT=3000 HOSTNAME=0.0.0.0 pnpm start
```

启动后默认由 Next.js Node 进程提供服务，适合部署到：

- Linux 云主机
- 容器中的 Node 运行时
- 反向代理后的内部应用服务

## Docker 部署

仓库已提供多阶段构建 `Dockerfile`，会在构建镜像时自动读取项目根目录下的 `.env.production` 并执行 `pnpm build`。

1. 确认生产环境变量

```bash
cat .env.production
```

示例：

```bash
NEXT_PUBLIC_API_URL=https://your-api.example.com
```

2. 构建镜像

```bash
docker build -t scaffold-web .
```

3. 启动容器

```bash
docker run -d \
  --name scaffold-web \
  -p 3000:3000 \
  scaffold-web
```

4. 访问服务

```text
http://localhost:3000
```

说明：

- 容器内默认监听 `0.0.0.0:3000`
- 如果修改了 `.env.production` 中的 `NEXT_PUBLIC_API_URL`，需要重新执行 `docker build`
- `NEXT_PUBLIC_*` 变量会参与前端构建，因此不建议只在 `docker run` 阶段临时覆盖它来替代重新构建

## 生产部署建议

### 方案一：直接以 Node 进程运行

适合单机或简单部署。

示例流程：

```bash
pnpm install --frozen-lockfile
pnpm build
PORT=3000 HOSTNAME=0.0.0.0 NEXT_PUBLIC_API_URL=https://your-api.example.com pnpm start
```

建议再由 Nginx、Caddy 或云负载均衡转发到该进程。

### 方案二：使用进程管理器托管

适合需要自动拉起和日志管理的服务器。

示例 `systemd` 启动命令：

```bash
/usr/bin/env PORT=3000 HOSTNAME=0.0.0.0 NEXT_PUBLIC_API_URL=https://your-api.example.com pnpm start
```

需要确保服务启动前已经执行过 `pnpm install --frozen-lockfile` 和 `pnpm build`。

## 发布前检查清单

- `pnpm lint` 通过
- `pnpm build` 通过
- `NEXT_PUBLIC_API_URL` 已指向正确后端
- 后端已开放 `/api/v1/users` 接口
- 浏览器中可正常打开 `/users` 页面并完成增删改查

## 常见问题

### 1. 页面能打开，但用户列表加载失败

通常是以下原因：

- 后端没启动
- `NEXT_PUBLIC_API_URL` 配错
- 后端不是以 `/api/v1/users` 暴露接口
- 跨域配置未放行当前前端域名

### 2. 本地能跑，生产环境接口 404

先检查：

- 生产环境变量是否仍然指向了 `localhost`
- 反向代理是否正确转发到前端 Node 进程
- 后端线上地址是否可访问 `/api/v1/users`

### 3. 修改环境变量后不生效

`NEXT_PUBLIC_*` 变量会参与前端构建。修改后需要重新执行：

```bash
pnpm build
pnpm start
```
