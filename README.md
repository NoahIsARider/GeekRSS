# GeekRSS

A minimalist RSS reader with a geeky aesthetic: dark background, monospace fonts, text-first and link-first design, free from flashy decorations.

<img width="1273" height="652" alt="image" src="https://github.com/user-attachments/assets/7097831b-ee5f-4fc0-817f-1d73f2a7d70b" />


## Features

- Comes pre-loaded with a curated list of high-quality tech RSS feeds, ready to read out of the box
- Minimalist interface preserving a terminal vibe and old-school hacker flavor
- User-added RSS feeds are stored locally in the browser, independent of server-side storage
- Server-side API handles feed fetching and parsing, avoiding CORS issues on the client side
- Supports automatic deployment to Vercel via GitHub Actions

## Tech Stack

- `Next.js 16`
- `React 19`
- `TypeScript 5`
- `Tailwind CSS 4`
- `rss-parser`
- `pnpm`

## Local Development

Install dependencies:

```bash
pnpm install
```

Start the Next.js development server:

```bash
pnpm exec next dev
```

Open http://localhost:3000 to view the app.

## Validation Commands

Type checking and linting:

```bash
pnpm validate
```

Run directory-specific tests:

```bash
pnpm test src/lib/feed-catalog.test.ts
```

## Data Model

- Default feeds are defined in `data/feeds.json`
- On page initialization, default feeds are fetched from `/api/feeds`
- Manually added feeds are persisted to `localStorage`
- Default feeds remain immutable; custom feeds can be removed within the current browser context

Rationale: Vercel's Serverless runtime environment is unsuitable for long-term local file persistence. Storing user data in the browser is the most reliable approach.

## Automatic Deployment to Vercel

This repository includes a GitHub Actions workflow: `.github/workflows/deploy-vercel.yml`

First, link your project to Vercel. Then configure the following three secrets in your GitHub repository settings:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

### 1. Create Project on Vercel

After pushing this repo to GitHub, create a new project on Vercel and select `Next.js` as the framework preset.

### 2. Obtain Required Vercel Parameters

Install and log in to the Vercel CLI locally, then run the following command in the project root:

```bash
pnpm dlx vercel link
```

Upon completion, `.vercel/project.json` will be generated, containing the `projectId`. The organization ID can also be retrieved from this file or the Vercel dashboard.

### 3. Configure GitHub Secrets

Navigate to your GitHub repository:

`Settings` -> `Secrets and variables` -> `Actions`

Add the following secrets:

- `VERCEL_TOKEN`: Your Vercel personal access token
- `VERCEL_ORG_ID`: Your Vercel team or personal account ID
- `VERCEL_PROJECT_ID`: The ID of your current project

### 4. Trigger Automatic Deployment via Push

The workflow runs automatically on pushes to the `main` branch:

1. Install dependencies
2. Execute `pnpm validate`
3. Pull Vercel environment information
4. Build production artifacts
5. Deploy to the Vercel production environment

## Directory Structure

```text
data/                       Default RSS feeds
src/app/page.tsx            Main application page
src/app/api/feeds           API endpoints for default feeds & validation
src/app/api/feeds/items     Endpoint for fetching individual RSS entries
src/lib/feed-catalog.ts     Logic for merging default and custom feeds
.github/workflows           Automatic deployment workflows
```

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
