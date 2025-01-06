"use client";

import React from "react";
import Configurations from "@/components/image-generation/config-urations";
import GeneratedImages from "@/components/image-generation/generated-images";

const ImageGenerationPage = () => {
  return (
    <section className="container mx-auto flex-1 grid gap-4 grid-cols-3 overflow-hidden">
      <Configurations />
      <div className="col-span-2 p-4 rounded-xl flex items-center justify-center h-fit">
        <GeneratedImages />
      </div>
    </section>
  );
};

export default ImageGenerationPage;
