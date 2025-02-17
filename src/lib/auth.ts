
"use client"
import { redirect } from "next/navigation"
import { createClient } from "./supabase/client"


const signInWith = (provider: any) => async () => {
    console.log(provider, 1111)
    const supabase = await createClient()
    const auth_callback_url = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: auth_callback_url,
        },
    })
    console.log(data)

    if (error) {
        console.log(error)
    }
    redirect(data.url || "")
}

export const signinWithGoogle = signInWith('google')
export const signinWithGithub = signInWith('github')