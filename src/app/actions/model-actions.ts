'use server';
import { supabaseAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"


export const getPresignedstorageUrlAction = async (filePath: string) => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: urlData, error } = await supabaseAdmin.storage.from("training_data").createSignedUploadUrl(`${user?.id}/${new Date().getTime()}_${filePath}`)
    return {
        signedUrl: urlData?.signedUrl || "",
        error: error?.message || ""
    }
}