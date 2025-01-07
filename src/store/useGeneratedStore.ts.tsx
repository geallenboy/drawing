import { create } from "zustand";
import { ImageGenerationFormSchema } from "@/components/image-generation/config-urations";
import { z } from "zod";
import {
  generateImageAction,
  storeImagesAction,
} from "@/app/actions/image-action";

interface GeneratedState {
  loading: boolean;
  images: Array<{ url: string }>;
  error: string | null;
  generateImage: (
    values: z.infer<typeof ImageGenerationFormSchema>
  ) => Promise<void>;
}

const useGeneratedStore = create<GeneratedState>((set) => ({
  loading: false,
  images: [],
  error: null,
  generateImage: async (values: z.infer<typeof ImageGenerationFormSchema>) => {
    set({ loading: true, error: null });
    try {
      const { error, success, data } = await generateImageAction(values);
      if (!success) {
        set({ error: error, loading: false });
        return;
      }
      const dataUrl = data.map((url: string) => {
        return { url, ...values };
      });
      await storeImagesAction(dataUrl);
      set({ images: dataUrl, loading: false });
    } catch (error: any) {
      set({
        error: "Failed to generate image. Please try again",
        loading: false,
      });
    }
  },
}));

export default useGeneratedStore;
