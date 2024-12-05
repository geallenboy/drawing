# nextjs-base

nextjs-base 是一个开发基础框架，旨在快速构建现代化的 Web 应用程序，同时具备高效开发、优异性能和可扩展性的特点。以下是技术栈的详细介绍及其选择理由

## 技术栈

- 主框架：[React18](https://react.docschina.org/)+[Nextjs15](https://nextjs.org/)+[Typescript5](https://www.typescriptlang.org/zh/)
- 样式：[Tailwindcss](https://www.tailwindcss.cn/)+[NextUI](https://nextui.org/)
- 身份验证：[Clerk](https://clerk.com/)
- 数据库：[Drizzle](https://orm.drizzle.team/)
- 存储：[firebase](https://console.firebase.google.com/?hl=zh-cn)
- 支付：[paypal](https://developer.paypal.com/home/)
- AI：
  - 内容生成：[Gemini API](https://ai.google.dev/gemini-api/docs/api-key?hl=zh-cn)
  - 图片生成：[replicate](https://replicate.com/)
- 部署：[github](https://github.com/geallenboy)+[Vercel](https://vercel.com/)
- 网站流量统计:Google Analytics

## 技术栈介绍

### 主框架：React 18 + Next.js 15 + TypeScript 5

#### 是什么

React 是一个用于构建用户界面的 JavaScript 库，主要关注视图层。
Next.js 是一个基于 React 的框架，提供服务端渲染（SSR）、静态生成（SSG）和 API 路由等功能。
TypeScript 是 JavaScript 的超集，为代码提供静态类型支持。

##### 优缺点

- React

优点：组件化开发、虚拟 DOM 提高性能、大量生态支持。
缺点：仅专注于 UI，开发完整应用时需要结合其他工具。

- Next.js

优点：支持 SSR 和 SSG 提高 SEO 和性能，API 路由和文件系统路由简化开发。
缺点：需要学习额外的约定和配置，复杂项目中可能增加部署难度。

- TypeScript

优点：静态类型检查提高代码质量和可维护性，增强 IDE 支持。
缺点：初期学习成本较高，编译过程增加一定的开发复杂度。

#### 选择理由

React 和 Next.js 的组合提供了灵活性和性能优化，同时 TypeScript 提高了代码的可读性和维护性，非常适合构建复杂的现代化 Web 应用程序。

### 样式：Tailwind CSS + NextUI

#### 是什么

Tailwind CSS 是一个实用优先的 CSS 框架，提供预定义的类来快速开发 UI。
NextUI 是一个现代化的组件库，基于 Tailwind 构建，提供了美观且易于使用的
UI 组件。

#### 优缺点

- Tailwind CSS

优点：原子化 CSS 类让样式复用性高，减少样式冲突，开发效率高。
缺点：大量的类名可能降低代码可读性，对新手不够友好。

- NextUI

优点：美观的默认主题，高度定制化，完美兼容 Tailwind。
缺点：组件库功能相对有限，需要二次开发。

#### 选择理由

Tailwind CSS 和 NextUI 的组合提供了快速构建自定义 UI 和使用现成组件的能力，适合高效开发和灵活调整样式的需求。

### 身份验证：Clerk

#### 是什么

Clerk 是一个身份验证和用户管理服务，支持多种登录方式（密码、社交账号、无密码登录等）。

#### 优缺点

优点：提供完善的认证流程，包括 MFA（多因素认证），支持快速集成，UI 易于定制。
缺点：依赖第三方服务，存在成本和潜在锁定风险。

#### 选择理由

Clerk 简化了身份验证的开发流程，同时支持多种现代化登录方式，提升用户体验。

### 数据库：Drizzle

#### 是什么

Drizzle 是一个现代化的 TypeScript 数据库 ORM，提供静态类型支持。

#### 优缺点

优点：高度类型安全，和 TypeScript 集成良好，支持复杂查询且易于扩展。
缺点：生态系统较新，社区资源相对较少。

#### 选择理由

Drizzle 提供类型安全的查询方式，减少运行时错误，同时支持复杂的业务逻辑，适合与 TypeScript 项目结合。

### 存储：Firebase

#### 是什么

Firebase 是 Google 提供的后端服务平台，支持实时数据库、文件存储等功能。

#### 优缺点

优点：易于使用的实时数据库，快速搭建云存储解决方案。
缺点：依赖 Google 云生态，费用可能随着流量增长而增加。

#### 选择理由

Firebase 的实时功能和全球可用性使其成为存储需求的理想选择，尤其适合快速上线的项目。

### 支付：PayPal

#### 是什么

PayPal 是全球最广泛使用的支付解决方案之一，支持多种货币和支付方式。

#### 优缺点

优点：全球认可度高，安全性强，集成方便。
缺点：手续费较高，部分功能需要商业账户支持。

#### 选择理由

PayPal 的全球通用性和强大的支付能力使其成为处理在线支付的首选。

### AI

#### 内容生成：Gemini API

##### 是什么

Gemini API 是 Google 推出的多模态 AI 平台，用于生成文本内容。

##### 优缺点

优点：生成质量高，支持多语言，适合多种场景。
缺点：依赖第三方 API，可能存在成本问题。

#### 图片生成：Replicate

##### 是什么

Replicate 提供 AI 驱动的图片生成服务，支持文本到图像、图像编辑等功能。

#### 优缺点

优点：模型多样化，生成速度快，支持灵活调用。
缺点：生成结果可能不稳定，成本视使用量而定。

#### 选择理由

Gemini API 和 Replicate 提供了强大的内容生成能力，提升应用的智能化体验。

### 部署：GitHub + Vercel

#### 是什么

Vercel 是一个前端部署平台，与 GitHub 集成，可快速部署和自动化构建。

#### 优缺点

优点：CI/CD 流程简单，支持全球加速，适合静态和动态网站。
缺点：依赖第三方服务，可能存在流量限制。

#### 选择理由

Vercel 的高效部署流程和出色性能非常适合 Next.js 项目。

### 网站流量统计：Google Analytics

#### 是什么

Google Analytics 是一个全面的网站流量分析工具。

#### 优缺点

优点：功能强大，支持细粒度流量和用户行为分析。
缺点：隐私问题需特别注意，可能增加合规性负担。

#### 选择理由

Google Analytics 提供了必要的流量分析功能，帮助优化网站体验和营销策略。

### 总结

#### 整体框架的优缺点

##### 优点

- 高效开发：主框架和样式工具链提升开发速度。
- 性能优化：Next.js 和 Vercel 提供优秀的性能和 SEO 能力。
- 可扩展性强：组件化设计和强大数据库支持适应多种业务场景。
- 智能化：AI 模块增强应用功能，提供创新体验。

##### 缺点

- 技术学习成本高：多个新技术的结合对团队技术要求较高。
- 依赖第三方服务：Clerk、Firebase、Gemini 等第三方服务可能存在成本和锁定风险。

#### 选择理由

整个技术栈注重性能、开发效率和可扩展性，适合快速构建功能强大的现代化 Web 应用。虽然有一定的学习成本，但其强大的功能性和良好的用户体验使其成为高效开发项目的不二选择。

## 模版特点

- Clerk 身份验证集成
支持现代化的多种身份验证方式（如社交账号登录、无密码登录、多因素认证），为用户提供便捷、安全的登录体验，同时简化开发者的认证流程。

- Drizzle 数据库配置
提供基于 TypeScript 的轻量化 ORM，具备强大的类型安全和灵活性。通过 Drizzle 快速定义表结构、管理数据库操作，提升数据交互的可靠性和开发效率。

- Firebase 文件上传与下载
集成 Firebase 存储服务，支持高效的文件上传与下载功能，适用于用户文件管理、图片存储等多种场景。操作简便且具备良好的扩展性。

- PayPal 支付集成
内置全球通用的在线支付解决方案，支持多货币交易，快速实现支付功能，确保用户支付体验流畅、安全。

- Gemini AI 内容生成
集成 Google 的 Gemini API，支持高质量的文本生成，适用于内容创作、教育或产品推荐等智能化场景，助力提升应用的智能交互能力。

- Replicate 图像生成集成
提供先进的 AI 图像生成功能，支持文本转图像、图像编辑等场景，生成创意十足且高度定制化的视觉内容。

本模板集成了主流工具与技术栈，涵盖身份验证、数据管理、文件操作、支付功能，以及 AI 驱动的内容与图像生成，全面提升开发效率与产品能力，适合构建现代化、多功能的 Web 应用。

## env 配置

创建.env 文件,添加对应的 key

```
# clerk  https://clerk.com/
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
# 自定义登录
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up\

# database url https://console.neon.tech/
NEXT_PUBLIC_DATABASE_URL=
# gemini-api https://ai.google.dev/gemini-api/docs/api-key?hl=zh-cn
NEXT_PUBLIC_GEMINI_API_KEY=

# replicate https://replicate.com/
NEXT_PUBLIC_REPLICATE_API_TOKEN=
# firebase https://console.firebase.google.com/?hl=zh-cn
NEXT_PUBLIC_FIREBASE_API_KEY=
# paypal https://developer.paypal.com/studio/checkout/fastlane
NEXT_PUBLIC_PAYPAL_CLIENT_ID=

```

## 项目运行


