# CLAUDE.md

这个文件为 Claude Code (claude.ai/code) 在此代码库中工作提供指导。

## 开发命令

```bash
# 开发环境
npm run dev          # 启动开发服务器，访问 localhost:3000
npm run build        # 构建生产版本
npm run build:prod   # 使用 NODE_ENV=production 构建
npm run start        # 启动生产服务器
npm run lint         # 运行 ESLint 代码检查

# 构建后处理
npm run postbuild    # 生成站点地图（构建后自动运行）
```

## 架构概览

这是一个基于 Next.js 14 的全栈 AI 图像/视频生成应用，具有以下关键架构模式：

### 数据库层 (`src/backend/`)
- **模型**: 数据库实体的 TypeScript 接口 (`src/backend/models/`)
- **服务**: 处理数据库操作的业务逻辑层 (`src/backend/service/`)
- **数据库**: PostgreSQL 连接池配置 `src/backend/config/db.ts`
- **模拟模式**: 数据库未配置时自动降级为模拟数据

### API 路由 (`src/app/api/`)
- **身份验证**: NextAuth.js 处理器 `api/auth/[...nextauth]/`
- **AI 生成**: Replicate AI 集成端点 (`api/predictions/`)
- **Webhooks**: Stripe 和 Replicate 回调处理器 (`api/webhook/`)
- **用户管理**: 用户订阅和积分系统 (`api/user/`)
- **文件存储**: R2/S3 上传处理器 (`api/r2/`)

### 前端结构 (`src/app/[locale]/`)
- **国际化路由**: 所有页面都在 `[locale]` 下以支持多语言
- **路由组**: `(free)` 组用于公开页面
- **核心页面**: 仪表板、定价、文字生成图像

### 组件组织
- **落地页**: 模块化部分 (`src/components/landingpage/`)
- **AI 集成**: AI 生成组件 (`src/components/replicate/`)
- **布局组件**: 导航栏、页脚 (`src/components/layout/`)
- **定价**: 订阅层级和支付 (`src/components/price/`)

### 关键集成
- **NextAuth.js**: Google OAuth，自动创建用户和分配积分
- **Replicate API**: 文字生成图像和图像生成视频
- **Stripe**: 订阅和支付处理
- **Cloudflare R2/AWS S3**: 媒体文件存储
- **PostgreSQL**: 用户数据、订阅、积分、生成历史

### 积分系统
- 新用户自动获得 20 个免费积分
- 按用户跟踪积分使用情况和订阅层级
- 通过 Stripe 管理付款历史和订阅

### 配置文件
- **环境变量**: 使用 `.env` 配置，缺失值有降级处理
- **站点配置**: `src/config/site.ts` 应用全局设置
- **域名配置**: `src/config/domain.ts` URL 配置
- **数据库初始化**: `src/backend/sql/init.sql` 数据库架构

### 开发注意事项
- 应用优雅处理缺失环境变量，使用模拟数据
- 启用 TypeScript 严格模式
- 使用 Tailwind CSS 和 NextUI/HeroUI 组件
- 使用 Framer Motion 和 GSAP 实现动画
- 使用 Next-intl 国际化（目前仅英语）

### 测试和质量
- 提交更改前运行 `npm run lint`
- 目前未配置测试框架 - 请向用户询问测试方法
- 可用时应使用实际 PostgreSQL 连接测试数据库操作