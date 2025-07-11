# Drawing - 专注画图的创作工具

![Drawing Logo](./public/logo.svg)

**Drawing** 是一个专注于画图功能的创作工具，集成了强大的画图能力和文件夹管理功能，为用户提供高效的图形创作体验。支持云端存储和本地缓存，确保您的创作永不丢失。

---

## 🎨 主要功能

### 核心画图功能
- **直观画图**：基于先进的画图引擎，支持各种画图工具和图形元素
- **实时保存**：自动保存到云端和本地，双重保障您的创作
- **云端同步**：使用 MinIO 存储，支持多设备同步访问

### 文件夹管理
- **智能分类**：支持创建文件夹对画图进行分类管理
- **层级结构**：支持多级文件夹，灵活组织您的作品
- **快速检索**：全文搜索功能，快速找到目标画图

### 用户体验
- **简洁界面**：专注画图，去除干扰元素
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
git clone https://github.com/geallenboy/drawing
cd drawing
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
│   ├── (drawing)/         # 画图相关页面
│   └── auth/              # 认证页面
├── components/            # React 组件
│   ├── feature/drawing/   # 画图功能组件
│   └── ui/               # 基础 UI 组件
├── actions/              # Server Actions
│   ├── drawing/          # 画图相关操作
│   └── folder/           # 文件夹管理
├── drizzle/              # 数据库相关
│   ├── schemas/          # 数据库模式
│   └── migrations/       # 数据库迁移
└── lib/                  # 工具库
```


## 🤝 贡献指南

我们欢迎所有形式的贡献！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解详细信息。

### 开发流程
1. Fork 项目
2. 创建功能分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

---


## 📄 许可证

本项目基于 MIT 许可证开源。详见 [LICENSE](./LICENSE) 文件。


---

*让创作更简单，让画图更自由！* 🎨✨
- **手绘风格画图**：集成 Excalidraw，支持直观的画图功能。
- **无缝整合**：文本与画图完美结合，支持拖拽布局调整。
- **导出与分享**：支持多种格式导出，方便分享与协作。
- **可定制与可扩展**：提供插件和 API，满足个性化需求。

