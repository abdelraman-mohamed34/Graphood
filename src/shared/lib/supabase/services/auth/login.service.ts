'use server'

import { cookies } from "next/headers"
import { createSupabaseServerClient } from "../../server"

export async function loginService(formData: FormData) {
    const cookieStore = await cookies()

    const supabase = await createSupabaseServerClient()

    const email = String(formData.get('email'))
    const password = String(formData.get('password'))

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { success: false, error: error.message }
    }

    return {
        success: true,
        user: data.user,
        session: data.session,
    }
}