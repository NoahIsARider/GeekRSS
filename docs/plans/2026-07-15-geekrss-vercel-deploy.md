# GeekRSS Vercel Deploy Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the GeekRSS project deploy reliably from GitHub to Vercel while preserving the existing minimalist reader style and shipping a richer default feed set.

**Architecture:** Replace server-side filesystem persistence with a hybrid model: curated default feeds live in the repo, and user-added feeds persist in browser localStorage. Keep server routes for RSS parsing so the deployed site can fetch remote feeds without browser CORS issues, and add GitHub Actions plus Vercel config/docs for automatic deployment.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, rss-parser, GitHub Actions, Vercel CLI

---

### Task 1: Feed catalog and client persistence

**Files:**
- Create: `src/lib/feed-catalog.ts`
- Modify: `data/feeds.json`
- Test: `src/lib/feed-catalog.test.ts`

**Step 1: Write the failing test**

Add tests that describe feed normalization and deduplication for default and custom sources.

**Step 2: Run test to verify it fails**

Run: `pnpm test src/lib/feed-catalog.test.ts`
Expected: FAIL because the helper module and test script do not exist yet.

**Step 3: Write minimal implementation**

Implement typed feed helpers that load default feeds from `data/feeds.json`, merge them with custom feeds, and keep URL-based deduplication stable.

**Step 4: Run test to verify it passes**

Run: `pnpm test src/lib/feed-catalog.test.ts`
Expected: PASS

### Task 2: Home page refactor

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/api/feeds/route.ts`
- Modify: `src/app/api/feeds/items/route.ts`

**Step 1: Write the failing test**

Extend helper tests to cover the page's expected feed merge behavior and custom feed serialization.

**Step 2: Run test to verify it fails**

Run: `pnpm test src/lib/feed-catalog.test.ts`
Expected: FAIL with missing or incorrect behavior.

**Step 3: Write minimal implementation**

Refactor the page so default feeds come from the repo, custom feeds are stored locally in the browser, and add/remove no longer depends on server filesystem writes.

**Step 4: Run test to verify it passes**

Run: `pnpm test src/lib/feed-catalog.test.ts`
Expected: PASS

### Task 3: Deployment automation and docs

**Files:**
- Create: `.github/workflows/deploy-vercel.yml`
- Create: `vercel.json`
- Modify: `package.json`
- Modify: `README.md`

**Step 1: Write the failing test**

Validate the repository with build/lint/type-check commands after deployment files are added.

**Step 2: Run validation to verify it fails if config is incomplete**

Run: `pnpm validate`
Expected: FAIL until config and scripts align with the refactor.

**Step 3: Write minimal implementation**

Add a production-friendly deploy workflow, Vercel settings, and setup instructions for required GitHub secrets.

**Step 4: Run validation to verify it passes**

Run: `pnpm validate`
Expected: PASS
