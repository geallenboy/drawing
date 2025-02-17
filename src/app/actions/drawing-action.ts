"use server";
import { createServer } from "@/lib/supabase/server";
import { Database } from "@datatypes.types";


type addDrawingProps = Database["public"]["Tables"]["drawing"]["Insert"]
type updateDrawingProps = Database["public"]["Tables"]["drawing"]["Update"]

export const getByIdDrawingAction = async (id: string): Promise<ActionResponse> => {

    const supabase = await createServer()
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return {
            error: "Unauthorized",
            success: false,
            data: null
        }
    }
    const { data, error } = await supabase.from("drawing").select("*").eq("user_id", user.id).eq("id", id).order("created_at", { ascending: false })
    console.log(data, error)
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

export const getAllDrawingAction = async (limit?: number): Promise<ActionResponse> => {

    const supabase = await createServer()
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return {
            error: "Unauthorized",
            success: false,
            data: null
        }
    }
    let query = supabase.from("drawing").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
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

export const delDrawingAction = async (id: number): Promise<ActionResponse> => {
    const supabase = await createServer()
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return {
            error: "Unauthorized",
            success: false,
            data: null
        }
    }
    const { data, error } = await supabase.from("drawing").delete().eq("id", id).eq('user_id', user.id);

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

export const addDrawingAction = async (data: addDrawingProps): Promise<ActionResponse> => {
    const supabase = await createServer()
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return {
            error: "Unauthorized",
            success: false,
            data: null
        }
    }
    const { data: dbData, error: dbError } = await supabase.from('drawing').insert([{
        user_id: user.id,
        name: data.name || "drawing name",
        drawing_data: data.drawing_data || "",
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

export const updateDrawingAction = async (data: updateDrawingProps): Promise<ActionResponse> => {
    const supabase = await createServer()
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return {
            error: "Unauthorized",
            success: false,
            data: null
        }
    }

    const { data: dbData, error: dbError } = await supabase.from('drawing').update([{
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