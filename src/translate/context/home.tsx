import { PenIcon, TextIcon, LayoutIcon, ShareIcon, CodeIcon, UsersIcon } from "lucide-react"; // 假设使用 Lucide React 图标
export const faqsList: any = {
  en: [
    {
      question: "What is Excalidraw and what can it be used for?",
      answer:
        "Excalidraw is an open-source, web-based drawing tool that allows users to create hand-drawn style diagrams, sketches, and wireframes. It is commonly used for brainstorming, prototyping, and collaborative design due to its simplicity and ease of use."
    },
    {
      question: "How can I integrate Excalidraw into my project?",
      answer:
        "Excalidraw provides an embeddable component that can be integrated into any web application. You can use its API or npm package to include it in your project, allowing users to create and edit diagrams directly within your application."
    },
    {
      question: "Is Excalidraw suitable for professional design work?",
      answer:
        "While Excalidraw is great for quick sketches and collaborative brainstorming, it may not be suitable for highly detailed or professional design work. It is best used for informal diagrams, wireframes, and early-stage design concepts."
    },
    {
      question: "What is EditorJS and how does it differ from other text editors?",
      answer:
        "EditorJS is an open-source block-style text editor that allows users to create rich text content using modular blocks. Unlike traditional WYSIWYG editors, EditorJS provides a clean JSON output, making it ideal for structured content management and modern web applications."
    },
    {
      question: "Can EditorJS be customized to fit specific needs?",
      answer:
        "Yes, EditorJS is highly customizable. You can create custom blocks, plugins, and tools to extend its functionality. Its modular architecture makes it easy to tailor the editor to your specific requirements."
    },
    {
      question: "Is EditorJS suitable for collaborative editing?",
      answer:
        "EditorJS itself does not natively support real-time collaboration, but it can be integrated with third-party services or libraries (like Firebase or WebSocket) to enable collaborative editing features."
    }
  ],
  zh: [
    {
      question: "Excalidraw 是什么？它有哪些用途？",
      answer:
        "Excalidraw 是一个开源的、基于网页的绘图工具，允许用户创建手绘风格的图表、草图和线框图。由于其简单易用，它通常用于头脑风暴、原型设计和协作设计。"
    },
    {
      question: "如何将 Excalidraw 集成到我的项目中？",
      answer:
        "Excalidraw 提供了一个可嵌入的组件，可以集成到任何网页应用中。你可以使用它的 API 或 npm 包将其包含在你的项目中，从而允许用户直接在应用中创建和编辑图表。"
    },
    {
      question: "Excalidraw 适合专业设计工作吗？",
      answer:
        "虽然 Excalidraw 非常适合快速草图和协作头脑风暴，但它可能不适合高度详细或专业的设计工作。它最适合用于非正式的图表、线框图和早期设计概念。"
    },
    {
      question: "EditorJS 是什么？它与其他文本编辑器有何不同？",
      answer:
        "EditorJS 是一个开源的块式文本编辑器，允许用户使用模块化块创建富文本内容。与传统的所见即所得编辑器不同，EditorJS 提供干净的 JSON 输出，非常适合结构化内容管理和现代网页应用。"
    },
    {
      question: "EditorJS 可以定制以满足特定需求吗？",
      answer:
        "是的，EditorJS 高度可定制。你可以创建自定义块、插件和工具来扩展其功能。其模块化架构使其易于根据你的特定需求进行定制。"
    },
    {
      question: "EditorJS 适合协作编辑吗？",
      answer:
        "EditorJS 本身不支持实时协作，但可以与第三方服务或库（如 Firebase 或 WebSocket）集成，以实现协作编辑功能。"
    }
  ]
};

export const avatars = [
  {
    src: "/avatars/AutumnTechFocus.jpeg",
    fallback: "CN"
  },
  {
    src: "/avatars/Casual Creative Professional.jpeg",
    fallback: "AB"
  },
  {
    src: "/avatars/Golden Hour Contemplation.jpeg",
    fallback: "FG"
  },
  {
    src: "/avatars/Portrait of a Woman in Rust-Colored Top.jpeg",
    fallback: "PW"
  },
  {
    src: "/avatars/Radiant Comfort.jpeg",
    fallback: "RC"
  },
  {
    src: "/avatars/Relaxed Bearded Man with Tattoo at Cozy Cafe.jpeg",
    fallback: "RB"
  }
];

export const featureList = {
  en: [
    {
      title: "Rich Text Editing",
      description:
        "Create and edit content with ease using EditorJS's modular block system. Supports paragraphs, headings, lists, images, quotes, and more, all with clean JSON output for easy integration.",
      icon: <TextIcon className="w-6 h-6" strokeWidth={1.5} />
    },
    {
      title: "Hand-Drawn Sketching",
      description:
        "Bring your ideas to life with Excalidraw's intuitive hand-drawn style diagrams. Perfect for wireframes, flowcharts, and brainstorming sessions.",
      icon: <PenIcon className="w-6 h-6" strokeWidth={1.5} />
    },
    {
      title: "Seamless Integration",
      description:
        "Combine text and drawings effortlessly. Drag and drop sketches into your text editor, and adjust layouts for a polished, professional look.",
      icon: <LayoutIcon className="w-6 h-6" strokeWidth={1.5} />
    },
    {
      title: "Real-Time Collaboration",
      description:
        "Work together with your team in real-time. Edit documents, sketch ideas, and leave comments—all synchronized instantly.",
      icon: <UsersIcon className="w-6 h-6" strokeWidth={1.5} />
    },
    {
      title: "Export & Share",
      description:
        "Export your creations as PDF, Markdown, or JSON. Generate shareable links to collaborate or showcase your work with others.",
      icon: <ShareIcon className="w-6 h-6" strokeWidth={1.5} />
    },
    {
      title: "Customizable & Extendable",
      description:
        "Tailor DrawText Studio to your needs with custom plugins, themes, and tools. Developer-friendly APIs make integration and extension a breeze.",
      icon: <CodeIcon className="w-6 h-6" strokeWidth={1.5} />
    }
  ],
  zh: [
    {
      title: "富文本编辑",
      description:
        "使用 EditorJS 的模块化块系统轻松创建和编辑内容。支持段落、标题、列表、图片、引用等，并提供干净的 JSON 输出，便于集成。",
      icon: <TextIcon className="w-6 h-6" strokeWidth={1.5} />
    },
    {
      title: "手绘风格绘图",
      description:
        "使用 Excalidraw 的直观手绘风格图表，将您的想法变为现实。非常适合线框图、流程图和头脑风暴会议。",
      icon: <PenIcon className="w-6 h-6" strokeWidth={1.5} />
    },
    {
      title: "无缝整合",
      description: "轻松结合文本和绘图。将草图拖放到文本编辑器中，并调整布局以获得精美的专业外观。",
      icon: <LayoutIcon className="w-6 h-6" strokeWidth={1.5} />
    },
    {
      title: "实时协作",
      description: "与团队实时协作。编辑文档、绘制草图并留下评论——所有更改都会即时同步。",
      icon: <UsersIcon className="w-6 h-6" strokeWidth={1.5} />
    },
    {
      title: "导出与分享",
      description:
        "将您的创作导出为 PDF、Markdown 或 JSON。生成可分享的链接，与他人协作或展示您的作品。",
      icon: <ShareIcon className="w-6 h-6" strokeWidth={1.5} />
    },
    {
      title: "可定制与可扩展",
      description:
        "通过自定义插件、主题和工具，根据您的需求定制 DrawText Studio。开发者友好的 API 使集成和扩展变得轻而易举。",
      icon: <CodeIcon className="w-6 h-6" strokeWidth={1.5} />
    }
  ]
};
