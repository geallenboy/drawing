import { getImagesAction } from "@/app/actions/image-action";
import GalleryComponent from "@/components/gallery/gallery-component";
import React from "react";

const GallerryPage = async () => {
  const { data: images } = await getImagesAction(10);

  return (
    <section className=" container mx-auto">
      <h1 className="text-3xl font-semibold mb-2">My Images</h1>
      <p className="text-muted-foreground mb-6">
        Here you can see all the images you have generated .Click on an image to
        view details
      </p>
      <GalleryComponent images={images as any} />
    </section>
  );
};

export default GallerryPage;
