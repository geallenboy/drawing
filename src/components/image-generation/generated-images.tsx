import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import img1 from "@/public/hero-images/Charismatic Young Man with a Warm Smile and Stylish Tousled Hair.jpeg";
import img2 from "@/public/hero-images/Confident Businesswoman on Turquoise Backdrop.jpeg";
import img3 from "@/public/hero-images/Confident Woman in Red Outfit.jpeg";
import img4 from "@/public/hero-images/Futuristic Woman in Armor.jpeg";
import Image from "next/image";

const images = [
  {
    src: img1,
    alt: "some alt text",
  },
  {
    src: img2,
    alt: "some alt text",
  },
  {
    src: img3,
    alt: "some alt text",
  },
  {
    src: img4,
    alt: "some alt text",
  },
];

const GeneratedImages = () => {
  if (images.length === 0) {
    return (
      <Card className="w-full max-w-2xl bg-muted">
        <CardContent className="flex relative aspect-square items-center justify-center p-6">
          <span>No images generated</span>
        </CardContent>
      </Card>
    );
  }
  return (
    <Carousel className="w-full max-w-2xl">
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={index}>
            <div className="flex relative items-center justify-center rounded-lg overflow-hidden aspect-square">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="w-full h-full object-cover"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};

export default GeneratedImages;
