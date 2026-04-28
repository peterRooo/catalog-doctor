# Shopify App 长期备忘

这份文档只记录本次真正花时间解决的问题和下次必须知道的信息。

## 项目信息

- 项目：Catalog Doctor
- GitHub：`https://github.com/peterRooo/catalog-doctor`
- Vercel：`https://catalog-doctor.vercel.app`
- Vercel team：`ropers-projects`
- Shopify app ID：`353906524161`
- Shopify client ID：`34df8619b2978ecc0a1e7f392b62fe67`
- 测试店：`catalog-doctor-test.myshopify.com`
- 支持邮箱：`858338966@qq.com`
- 隐私政策：`https://peterrooo.github.io/catalog-doctor/privacy.html`
- GitHub token：`~/.env_local` 里的 `GITHUB_TOKEN_FOR_peterRoo`

## 下次优先走的路线

- 第一版先做无支付、少权限、能跑通发布流程的 app。
- Shopify Remix app 仍然需要 Node 服务和 session 数据库，哪怕业务功能看起来像纯客户端插件。
- 生产部署优先用 Vercel + Neon Postgres。
- 先部署 Vercel，再去 Shopify Dev Dashboard 创建并发布新版本。
- 发布后必须从 Shopify Admin 里打开 app 验证，不能只靠 `curl`。

## 这次踩坑

### 1. Vercel GitHub 导入卡在账号/命名空间

Vercel UI 里一直只显示 `roperluo32`，看不到 `peterRooo/catalog-doctor`。GitHub App 授权后仍然不好用。

解决：不要继续耗在 UI 导入，直接用 Vercel CLI 部署。

```bash
npm exec --yes vercel -- link --yes --scope ropers-projects --project <project>
npm exec --yes vercel -- deploy --prod --yes --scope ropers-projects
```

### 2. Vercel 构建时 Prisma 报 DATABASE_URL 协议错误

原因：本地 `.env` 被上传到了 Vercel，远端构建读到了本地开发数据库配置，覆盖了 Vercel 环境变量。

解决：必须加 `.vercelignore`，至少排除：

```gitignore
.env
.env.*
.vercel
node_modules
*.sqlite
*.sqlite-journal
```

### 3. Neon/Vercel Storage 给出的不是单个数据库 URL

Vercel/Neon 导出的内容可能是一整段 env 模板，不是单个 URL。直接塞进 `DATABASE_URL` 会失败。

解决：从模板里提取真正的 `postgresql://...`，优先用 `POSTGRES_PRISMA_URL`，再写入 Vercel 的 `DATABASE_URL`。

### 4. `read_inventory` 会触发 Shopify 额外权限问题

`read_inventory` 在 Dashboard 发布版本时提示需要先获得 Shopify 权限，影响快速发布。

解决：第一版只用 `read_products`。图片、SEO、描述、价格、集合检查都还能做。库存检查以后再申请权限后补。

### 5. `/privacy` 线上 500

原因：公开 Remix route 里用了 Polaris 组件，但没有包 `AppProvider`。

解决：公开 Polaris 页面也要包：

```tsx
<AppProvider i18n={{}}>
  ...
</AppProvider>
```

更稳的方案：同时放一个静态 `public/privacy.html`，给 Shopify 审核/隐私政策 URL 用。

### 6. 直接访问 `/auth?shop=...` 返回 410

这不一定代表线上坏了。Shopify embedded app 的认证依赖 Shopify Admin iframe、签名参数和 session，上下文不完整时 `curl` 容易误判。

解决：最终验证要从 Shopify Admin 或 Dev Dashboard 的安装入口打开 app。生产版最终在测试店里成功加载并扫描。

### 7. Shopify CLI 登录会卡 Google 账号选择

CLI 需要重新登录时会跳 Google 账号选择，不适合自动化继续。

解决：如果浏览器里 Dev Dashboard 已登录，直接在 Dashboard 的 `versions/new` 页面手动/自动填 URL、scope，然后发布新版本。

## 必须保留的生产配置结论

- 生产 URL：`https://catalog-doctor.vercel.app`
- Shopify redirect URLs 必须包含：
  - `/auth/callback`
  - `/auth/shopify/callback`
  - `/api/auth/callback`
- Vercel 生产 env 必须有：
  - `SHOPIFY_API_KEY`
  - `SHOPIFY_API_SECRET`
  - `SHOPIFY_APP_URL`
  - `SCOPES`
  - `DATABASE_URL`
- Prisma 生产用 Postgres，不要用 SQLite。
- Vercel build command 用：

```bash
prisma generate && prisma migrate deploy && remix vite:build
```

## 安全提醒

- 不要提交 `.env`、`.vercel`、SQLite DB、Shopify secret、GitHub token、Neon URL。
- 展示 `git remote -v` 时注意 remote 里可能带 token。
- 发布 Shopify app version 会修改线上 app 配置，执行前要让用户确认。
