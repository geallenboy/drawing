
"use client"
import { createClient } from "./supabase/client"

const signInWith = (provider: any) => async () => {

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

    window.location.href = data.url as string

}

export const signinWithGoogle = signInWith('google')
export const signinWithGithub = signInWith('github')