"use server";
import { createClient } from "@/lib/supabase/server";
import { Database } from "@datatypes.types";


type addFileProps = Database["public"]["Tables"]["file"]["Insert"]
type updateFileProps = Database["public"]["Tables"]["file"]["Update"]

export const getByIdFileAction = async (id: string): Promise<ActionResponse> => {

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return {
            error: "Unauthorized",
            success: false,
            data: null
        }
    }
    const { data, error } = await supabase.from("file").select("*").eq("user_id", user.id).eq("id", id).order("created_at", { ascending: false })
    console.log("data:", data)
    if (error) {
        return {
            error: error.message || "Failed to fetch file!",
            success: false,
            data: null
        }
    }
    return {
        error: null,
        success: true,
        data: data
    }
}

export const getAllFileAction = async (limit?: number): Promise<ActionResponse> => {

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return {
            error: "Unauthorized",
            success: false,
            data: null
        }
    }
    let query = supabase.from("file").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
    if (limit) {
        query = query.limit(limit)
    }
    const { data, error } = await query;
    if (error) {
        return {
            error: error.message || "Failed to fetch file!",
            success: false,
            data: null
        }
    }
    return {
        error: null,
        success: true,
        data: data
    }
}

export const delFileAction = async (id: number): Promise<ActionResponse> => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return {
            error: "Unauthorized",
            success: false,
            data: null
        }
    }
    const { data, error } = await supabase.from("file").delete().eq("id", id).eq('user_id', user.id);
    console.log(data, error)
    if (error) {
        return {
            error: error.message,
            success: false,
            data: null
        }
    }
    return {
        error: null,
        success: true,
        data: data
    }
}

export const addFileAction = async (data: addFileProps): Promise<ActionResponse> => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return {
            error: "Unauthorized",
            success: false,
            data: null
        }
    }
    const { data: dbData, error: dbError } = await supabase.from('file').insert([{
        user_id: user.id,
        name: data.name || "file name",
        file_data: data.file_data || "",
    }]).select()
    if (dbError) {
        return {
            error: dbError.message,
            success: false,
            data: dbData
        }
    }
    return {
        error: null,
        success: true,
        data: dbData
    }
}

export const updateFileAction = async (data: updateFileProps): Promise<ActionResponse> => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return {
            error: "Unauthorized",
            success: false,
            data: null
        }
    }
    const { data: dbData, error: dbError } = await supabase.from('file').update([{
        ...data
    }]).eq("id", data.id).eq('user_id', user.id);


    if (dbError) {
        return {
            error: dbError.message,
            success: false,
            data: dbData
        }
    }
    return {
        error: null,
        success: true,
        data: dbData
    }
}