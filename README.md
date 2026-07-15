# GeekRSS

一个偏极客审美的极简 RSS 阅读器：黑底、等宽字体、文本优先、链接优先、无花哨装饰。

## 特性

- 内置一组高质量技术 RSS 源，开箱即看
- 页面风格极简，保留终端感和 old-school hacker 味道
- 用户新增的 RSS 源保存在浏览器本地，不依赖服务端磁盘
- 服务端 API 负责抓取和解析 RSS，避免浏览器侧 CORS 问题
- 支持 GitHub Actions 自动部署到 Vercel

## 技术栈

- `Next.js 16`
- `React 19`
- `TypeScript 5`
- `Tailwind CSS 4`
- `rss-parser`
- `pnpm`

## 本地开发

安装依赖：

```bash
pnpm install
```

启动 Next.js 开发环境：

```bash
pnpm exec next dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看页面。

## 校验命令

类型和 lint 校验：

```bash
pnpm validate
```

运行目录相关测试：

```bash
pnpm test src/lib/feed-catalog.test.ts
```

## 数据模型

- 仓库内置默认源位于 `data/feeds.json`
- 页面初始化时从 `/api/feeds` 拉取默认源
- 用户手动新增的源会写入 `localStorage`
- 默认源始终保留，自定义源可以在当前浏览器中移除

这样处理的原因很简单：Vercel 的 Serverless 运行环境不适合拿本地文件做长期持久化，放到浏览器本地最稳。

## 自动部署到 Vercel

仓库已包含 GitHub Actions 工作流：`.github/workflows/deploy-vercel.yml`

你需要先做一次 Vercel 项目绑定，然后在 GitHub 仓库 Secrets 里配置下面 3 个值：

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

### 1. 在 Vercel 创建项目

把这个仓库推到 GitHub 后，在 Vercel 中创建一个新的项目，框架选择 `Next.js` 即可。

### 2. 获取 Vercel 所需参数

本地安装并登录 Vercel CLI 后，在项目根目录运行：

```bash
pnpm dlx vercel link
```

执行完会生成 `.vercel/project.json`，其中能看到 `projectId`；组织 ID 也可以从这里或 Vercel 后台拿到。

### 3. 配置 GitHub Secrets

进入 GitHub 仓库：

`Settings` -> `Secrets and variables` -> `Actions`

新增：

- `VERCEL_TOKEN`：Vercel 个人访问令牌
- `VERCEL_ORG_ID`：Vercel 团队或个人组织 ID
- `VERCEL_PROJECT_ID`：当前项目 ID

### 4. 推送代码触发自动部署

工作流在 `main` 分支 push 后自动执行：

1. 安装依赖
2. 运行 `pnpm validate`
3. 拉取 Vercel 环境信息
4. 构建生产产物
5. 发布到 Vercel 生产环境

## 目录说明

```text
data/                      默认 RSS 源
src/app/page.tsx           主页面
src/app/api/feeds          默认源与新增源校验接口
src/app/api/feeds/items    单个 RSS 的条目抓取接口
src/lib/feed-catalog.ts    默认源与自定义源合并逻辑
.github/workflows          自动部署工作流
```
