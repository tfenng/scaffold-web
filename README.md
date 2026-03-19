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

生产环境可通过 `.env.production` 或构建命令执行前的进程环境变量注入：

```bash
NEXT_PUBLIC_API_URL=https://your-api.example.com
```

注意：

- 这里填写的是后端根地址，不要额外拼接 `/api/v1`
- 当前前端代码会自动请求 `${NEXT_PUBLIC_API_URL}/api/v1/users`
- `NEXT_PUBLIC_*` 变量会参与静态构建，修改后需要重新执行 `pnpm build` 或重新构建 Docker 镜像
- 当前仓库的生产主形态是“静态导出 + 静态服务器托管”，不是长期依赖 `next start` 的 SSR/Node 服务

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

## 生产构建与静态发布

1. 安装依赖

```bash
pnpm install --frozen-lockfile
```

2. 设置生产环境变量

```bash
export NODE_ENV=production
export NEXT_PUBLIC_API_URL=https://your-api.example.com
```

也可以将同样的值写入 `.env.production` 后再执行构建。

3. 构建静态产物

```bash
pnpm build
```

4. 确认导出产物

```bash
ls out
```

构建完成后，部署所需的前端静态资源位于 `out/` 目录。

说明：

- `next.config.js` 已启用 `output: "export"`，因此生产产物以静态文件为主
- `scripts/postbuild-static-export.sh` 会额外生成 `out/index.html`，用于将根路径重定向到 `/users/`
- 生产发布时应托管 `out/` 目录，而不是默认将 `pnpm start` 作为主运行方式
- 如果修改了 `NEXT_PUBLIC_API_URL`，需要重新构建 `out/`

## Docker 部署

Docker 是当前仓库最贴近实际生产形态的部署方式。现有 `Dockerfile` 会执行静态构建，并在最终阶段使用 BusyBox `httpd` 托管 `out/` 目录。

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
- 镜像内托管的是静态导出产物，而不是运行中的 Next.js Node 服务
- 如果修改了 `.env.production` 中的 `NEXT_PUBLIC_API_URL`，需要重新执行 `docker build`
- `NEXT_PUBLIC_*` 变量会参与前端构建，因此不建议只在 `docker run` 阶段临时覆盖它来替代重新构建

## 生产部署建议

### 方案一：容器化静态托管

适合已有容器平台、云主机或内部发布平台，推荐优先采用。

示例流程：

```bash
docker build -t scaffold-web .
docker run -d --name scaffold-web -p 3000:3000 scaffold-web
```

如果前面还有网关、Nginx、Caddy 或云负载均衡，可继续转发到该静态容器。

### 方案二：服务器静态目录托管

适合已有 Nginx、Caddy、对象存储或 CDN 的环境。

示例流程：

```bash
pnpm install --frozen-lockfile
pnpm build
rsync -av out/ /var/www/scaffold-web/
```

之后再由静态服务器指向该目录提供访问。

补充说明：

- 当前仓库虽然保留了 `pnpm start` 脚本，但它不是本项目文档推荐的默认生产发布路径
- 本项目更适合被视为“静态前端 + 外部后端 API”的部署模型

## 发布前检查清单

- `pnpm lint` 通过
- `pnpm build` 通过
- `out/` 目录已生成
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
- 静态站点发布时是否使用了最新构建出的 `out/` 目录
- 静态服务器是否正确托管了 `/users/` 路径
- 后端线上地址是否可访问 `/api/v1/users`

### 3. 修改环境变量后不生效

`NEXT_PUBLIC_*` 变量会参与前端构建。修改后需要重新执行：

```bash
pnpm build
```

如果你使用 Docker 发布，则需要重新执行：

```bash
docker build -t scaffold-web .
```
