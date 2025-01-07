'use server';
import { ImageGenerationFormSchema } from "@/components/image-generation/config-urations";
import { z } from "zod"
import Replicate from "replicate";
import { createClient } from "@/utils/supabase/server";
import { Database } from "@datatypes.types";
import { imageMeta } from "image-meta"
import { randomUUID } from "crypto"
import { error } from "console";

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
    useFileOutput: false
});

interface ImageResponse {
    error: string | null;
    success: boolean;
    data: any | null;
}

export const generateImageAction = async (input: (z.infer<typeof ImageGenerationFormSchema>)): Promise<ImageResponse> => {
    const userInput = {
        prompt: input.prompt,
        go_fast: true,
        guidance: input.guidance,
        megapixels: "1",
        num_outputs: input.num_outputs,
        aspect_ratio: input.aspect_ratio,
        output_format: input.output_format,
        output_quality: input.output_quality,
        prompt_strength: 0.8,
        num_inference_steps: input.num_inference_steps
    };

    try {
        const output = await replicate.run(input.model as `${string}/${string}`, { input: userInput });
        console.log(output);
        return {
            error: null,
            success: true,
            data: output
        }
    } catch (error: any) {
        return {
            error: error.message || '',
            success: false,
            data: null
        }
    }

}

type storeImageinput = {
    url: string
} & Database["public"]["Tables"]["generated_images"]["Insert"]

export const imgUrlToBlob = async (url: string) => {
    const resposne = fetch(url);
    const blob = (await resposne).blob();
    return (await blob).arrayBuffer();
}

export const storeImagesAction = async (data: storeImageinput[]) => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return {
            error: "Unauthorized",
            success: false,
            data: null
        }
    }
    const uploadResults = [];

    for (const img of data) {
        const arrayBuffer = await imgUrlToBlob(img.url);
        const { width, height, type } = imageMeta(new Uint8Array(arrayBuffer))
        const fileName = `image_${randomUUID()}.${type}`
        const filePath = `${user.id}/${fileName}`
        const { error: storageError } = await supabase.storage.from('generated_images').upload(filePath, arrayBuffer, {
            contentType: `image/${type}`,
            cacheControl: '3600',
            upsert: false
        })
        if (storageError) {
            uploadResults.push({
                fileName,
                error: storageError.message,
                success: false,
                data: null
            })
            continue;
        }

        const { data: dbData, error: dbError } = await supabase.from('generated_images').insert([{
            user_id: user.id,
            model: img.model,
            prompt: img.prompt,
            aspect_ratio: img.aspect_ratio,
            guidance: img.guidance,
            num_inference_steps: img.num_inference_steps,
            output_format: img.output_format,
            image_name: fileName,
            width,
            height
        }]).select()
        console.log("dbData:", dbData, "dbError:", dbError)
        if (dbError) {
            uploadResults.push({
                fileName,
                error: dbError.message,
                success: !dbData,
                data: dbData || null
            })
        }
    }
    console.log("uploadResults:", uploadResults)
    return {
        error: null,
        success: true,
        data: {
            results: uploadResults
        }
    }
} 