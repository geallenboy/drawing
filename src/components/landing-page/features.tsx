import React from "react";
import AnimatedGradientText from "@/components/ui/animated-gradient-text";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ImageIcon, Package2, Palette } from "lucide-react";
import dashboardImg from "@/public/dashboard-img.png";

const featureList = [
  {
    title: "AI-Powered Photos",
    description:
      " Instantly transform your photos into high-quality, lifelike images with the power of AI. Whether you need fresh content for social media, professional shots for LinkedIn, or a fun set of images for personal project.",
    icon: <ImageIcon className="w-6 h-6" strokeWidth={1.5} />,
  },
  {
    title: "Diverse Photo Packs at Your Fingertips",
    description:
      "Instantly transform your photos into high-quality, lifelike images with the power of AI. Whether you need fresh content for social media, professional shots for LinkedIn, or a fun set of images for personal project. ",
    icon: <Package2 className="w-6 h-6" strokeWidth={1.5} />,
  },
  {
    title: "Customizable Photo Generation",
    description:
      "Instantly transform your photos into high-quality, lifelike images with the power of AI. Whether you need fresh content for social media, professional shots for LinkedIn, or a fun set of images for personal project.",
    icon: <Palette className="w-6 h-6" strokeWidth={1.5} />,
  },
];

const Features = () => {
  return (
    <section
      id="features"
      className="w-full bg-muted py-32 flex flex-col items-center justify-center"
    >
      <div className="container px-6 xs:px-8 sm:px-0 sm:mx-8 lg:mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 relative bg-muted">
        <div className="col-span-full space-y-4">
          <AnimatedGradientText className="ml-0 bg-background backdrop-blur-0">
            🎉 <hr className="mx-2 h-4 w-px shrink-0 bg-gray-300" />
            <span
              className={cn(
                `inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`
              )}
            >
              Features
            </span>
          </AnimatedGradientText>
          <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold">
            Unlock Unlimited Possibilities with Pictoria AI
          </h2>
          <p className="text-base text-muted-foreground lg:max-w-[75%]">
            Our platform offers a wide range of features designed to enhance
            your image creation experience. From easy-to-use editing tools to
            powerful AI-powered image generation, we have everything you need to
            bring your ideas to life.
          </p>
        </div>
        <div className="flex flex-col justify-start items-start order-2 lg:order-1">
          {featureList.map((featrue) => {
            return (
              <div
                key={featrue.title}
                className="flex items-start gap-2 sm:gap-4 rounded-lg py-8 lg:p-12"
              >
                <span className="p-0 sm:p-2 rounded-md text-foreground sm:text-background bg-background sm:bg-foreground">
                  {featrue.icon}
                </span>
                <div>
                  <h3 className="text-xl sm:text-2xl font-medium">
                    {featrue.title}
                  </h3>
                  <p className="text-sm xs:text-base text-muted-foreground pt-2">
                    {featrue.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div
          className={cn(
            "h-fit lg:sticky top-32 pl-16 pt-16 rounded-lg border border-r-gray-300 border-b-gray-300 animate-gradient bg-gradient-to-r from-[#627FAB] via-[#B95480] to-[#627FAB] bg-[length:var(--bg-size)_100%] [--bg-size:400%] order-1 lg:order-2"
          )}
        >
          <Image
            src={dashboardImg}
            alt="features Image"
            className="w-full h-auto rounded-tl-lg"
          />
        </div>
      </div>
    </section>
  );
};

export default Features;
