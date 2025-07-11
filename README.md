# AI TextDraw - 专注绘图的创作工具

![AI TextDraw Logo](./public/logo.svg)

**AI TextDraw** 是一个专注于绘图功能的创作工具，集成了强大的绘图能力和文件夹管理功能，为用户提供高效的图形创作体验。支持云端存储和本地缓存，确保您的创作永不丢失。

---

## 🎨 主要功能

### 核心绘图功能
- **直观绘图**：基于先进的绘图引擎，支持各种绘图工具和图形元素
- **实时保存**：自动保存到云端和本地，双重保障您的创作
- **云端同步**：使用 MinIO 存储，支持多设备同步访问

### 文件夹管理
- **智能分类**：支持创建文件夹对绘图进行分类管理
- **层级结构**：支持多级文件夹，灵活组织您的作品
- **快速检索**：全文搜索功能，快速找到目标绘图

### 用户体验
- **简洁界面**：专注绘图，去除干扰元素
- **响应式设计**：支持各种设备尺寸
- **安全认证**：集成 Clerk 身份验证系统

---

## 🚀 快速开始

### 环境要求
- Node.js 18+
- PostgreSQL 数据库
- MinIO 对象存储（可选）

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/your-username/ai-textdraw.git
cd ai-textdraw
```

2. **安装依赖**
```bash
pnpm install
```

3. **环境配置**
复制 `.env.example` 到 `.env.local` 并配置：
```bash
cp .env.example .env.local
```

4. **数据库迁移**
```bash
./migrate.sh
```

5. **启动开发服务器**
```bash
pnpm dev
```

访问 `http://localhost:3000` 开始使用！

---

## 🛠 技术栈

### 前端框架
- **Next.js 14**: React 应用框架
- **TypeScript**: 类型安全
- **Tailwind CSS**: 样式框架
- **Shadcn/ui**: 组件库

### 后端服务
- **Drizzle ORM**: 数据库 ORM
- **PostgreSQL**: 主数据库
- **MinIO**: 对象存储
- **Server Actions**: 服务端逻辑

### 认证与安全
- **Clerk**: 用户认证和管理
- **环境变量**: 敏感信息保护

---

## 📁 项目结构

```
src/
├── app/                    # Next.js 应用路由
│   ├── (drawing)/         # 绘图相关页面
│   └── auth/              # 认证页面
├── components/            # React 组件
│   ├── feature/drawing/   # 绘图功能组件
│   └── ui/               # 基础 UI 组件
├── actions/              # Server Actions
│   ├── drawing/          # 绘图相关操作
│   └── folder/           # 文件夹管理
├── drizzle/              # 数据库相关
│   ├── schemas/          # 数据库模式
│   └── migrations/       # 数据库迁移
└── lib/                  # 工具库
```

---

## 🔄 最新变更

### v2.0.0 (当前版本)
- ✅ 移除控制台功能，专注绘图
- ✅ 新增文件夹分类管理功能
- ✅ 集成 MinIO 文件路径存储
- ✅ 简化用户界面和导航
- ✅ 优化绘图列表和文件夹导航

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解详细信息。

### 开发流程
1. Fork 项目
2. 创建功能分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

---

## 📋 路线图

- [ ] 支持更多绘图工具和效果
- [ ] 团队协作功能
- [ ] 模板库
- [ ] 导出功能增强
- [ ] 移动端适配优化
- [ ] API 接口开放

---

## 📄 许可证

本项目基于 MIT 许可证开源。详见 [LICENSE](./LICENSE) 文件。

---

## 📞 支持与反馈

- **GitHub Issues**: [报告问题](https://github.com/your-username/ai-textdraw/issues)
- **功能建议**: [提交建议](https://github.com/your-username/ai-textdraw/discussions)
- **邮件联系**: support@ai-textdraw.com

---

*让创作更简单，让绘图更自由！* 🎨✨
- **手绘风格绘图**：集成 Excalidraw，支持直观的绘图功能。
- **无缝整合**：文本与绘图完美结合，支持拖拽布局调整。
- **导出与分享**：支持多种格式导出，方便分享与协作。
- **可定制与可扩展**：提供插件和 API，满足个性化需求。

---

## 功能特色

### 1. 富文本编辑

使用 EditorJS 的模块化块系统，轻松创建和编辑内容。支持段落、标题、列表、图片、引用等，并提供干净的 JSON 输出，便于集成。

### 2. 手绘风格绘图

使用 Excalidraw 的直观手绘风格图表，将您的想法变为现实。非常适合线框图、流程图和头脑风暴。

### 3. 无缝整合

轻松结合文本和绘图。将草图拖放到文本编辑器中，并调整布局以获得精美的专业外观。

### 4. 实时协作

与团队实时协作。编辑文档、绘制草图并留下评论——所有更改都会即时同步。

### 5. 导出与分享

将您的创作导出为 PDF、Markdown 或 JSON。生成可分享的链接，与他人协作或展示您的作品。

### 6. 可定制与可扩展

通过自定义插件、主题和工具，根据您的需求定制 DrawText。开发者友好的 API 使集成和扩展变得轻而易举。

---

## 快速开始

### 安装

1. 克隆仓库：
   ```bash
   git clone https://github.com/geallenboy/drawText.git
   ```
2. 安装依赖：
   ```bash
   cd drawText
   npm install
   ```
3. 启动开发服务器：
   ```bash
   npm run dev
   ```

### 使用

1. 打开浏览器，访问 `http://localhost:3000`。
2. 开始创作：在文本编辑器中输入内容，或使用绘图工具绘制草图。
3. 导出作品：点击“导出”按钮，选择格式并下载文件。

---

## 技术栈

- **前端**：React + Nextjs + TypeScript
- **文本编辑器**：EditorJS
- **绘图工具**：Excalidraw
- **实时协作**：WebSocket
- **数据库**：PostgreSQL

---

## 贡献指南

我们欢迎任何形式的贡献！以下是参与贡献的步骤：

1. **Fork 仓库**：点击右上角的 "Fork" 按钮，将仓库复制到你的 GitHub 账户。
2. **克隆仓库**：
   ```bash
   git clone https://github.com/你的用户名/drawText.git
   ```
3. **创建分支**：
   ```bash
   git checkout -b feature/你的功能
   ```
4. **提交更改**：
   ```bash
   git add .
   git commit -m "描述你的更改"
   git push origin feature/你的功能
   ```
5. **提交 Pull Request**：在 GitHub 上提交 PR，并描述你的更改。

### 贡献规范

- 代码风格：遵循项目的 ESLint 和 Prettier 配置。
- 提交信息：使用清晰的提交信息，描述更改的目的。
- 测试：确保你的更改通过了所有测试。

---

## 路线图

以下是 DrawText 的未来开发计划：

### 短期目标

- 支持更多绘图工具和文本编辑插件。
- 增加 AI 辅助功能，如自动生成图表或文本建议。

### 长期目标

- 开发移动端应用，提供跨平台支持。
- 支持离线模式，提升用户体验。

---

## 许可证

DrawText 采用 **MIT 许可证**。详情请参阅 [LICENSE](https://github.com/geallenboy/drawText/LICENSE) 文件。

---

## 支持与反馈

如果你有任何问题、合作的想法，或者只是想打个招呼，随时与我联系！

- **电子邮件**：[gejialun88@gmail.com](mailto:gejialun88@gmail.com)
- **Twitter**：[@gejialun88](https://x.com/gejialun88)
- **个人网站**：[我的网站](https://gegarron.com)
- **微信号**：gegarron

---

## 致谢

感谢以下开源项目对 DrawText 的支持：

- [EditorJS](https://editorjs.io/)
- [Excalidraw](https://excalidraw.com/)
- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Nextjs](https://nextjs.org/)
- [Vercel](https://vercel.com/)

---

**DrawText** - 让创意表达更加自由和直观！ 🚀

## 项目展示
