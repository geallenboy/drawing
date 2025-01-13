import React from "react";

interface searchParamsProps {
  model_id?: string;
}

const ImageGenerationPage = async ({
  searchParams,
}: {
  searchParams: Promise<searchParamsProps>;
}) => {
  return (
    <section className="container mx-auto flex-1 grid gap-4 grid-cols-1 lg:grid-cols-3 overflow-hidden">
      ImageGenerationPage
    </section>
  );
};

export default ImageGenerationPage;
