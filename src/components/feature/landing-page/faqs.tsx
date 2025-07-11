import React from "react";
import AnimatedGradientText from "@/components/ui/animated-gradient-text";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";

const Question = ({ question, answer }: { question: string; answer: string }) => {
  return (
    <AccordionItem value={question}>
      <AccordionTrigger className="text-left">{question}</AccordionTrigger>
      <AccordionContent className="text-muted-foreground">{answer}</AccordionContent>
    </AccordionItem>
  );
};

const Faqs = () => {
  const faqsData = [
    {
      question: "什么是 AI TextDraw？",
      answer: "AI TextDraw 是一个结合人工智能技术的文本编辑与绘图创作工具，让您能够轻松创建和编辑各种图形内容。"
    },
    {
      question: "如何开始使用？",
      answer: "只需注册账号，登录后即可开始创建您的第一个绘图项目。我们提供了简单易用的界面和丰富的绘图工具。"
    },
    {
      question: "支持哪些文件格式？",
      answer: "我们支持多种常见的图像格式，包括 PNG、SVG 等，方便您导出和分享您的作品。"
    },
    {
      question: "是否免费使用？",
      answer: "我们提供免费的基础功能，同时也有高级功能供付费用户使用。您可以根据需要选择合适的方案。"
    }
  ];
  
  return (
    <section
      id="faqs"
      className="w-full py-32 px-6 sm:px-8 sm:mx-8 lg:max-auto flex flex-col items-center justify-center overflow-hidden"
    >
      <AnimatedGradientText className="bg-background backdrop-blur-0">
        🎉 <hr className="mx-2 h-4 w-px shrink-0 bg-gray-300" />
        <span
          className={cn(
            `inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`
          )}
        >
          常见问题
        </span>
      </AnimatedGradientText>
      <h2 className="subHeading mt-4">您想了解的问题</h2>
      <p className="subText mt-4 text-center">这里有一些用户经常询问的问题和解答</p>
      <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto mt-16">
        {faqsData.map((faq: any) => {
          return <Question key={faq.question} {...faq} />;
        })}
      </Accordion>
    </section>
  );
};

export default Faqs;
