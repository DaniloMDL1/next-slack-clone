"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

type UpdateProfileProps = {
    fullName: string,
    username: string,
    avatarUrl: string,
    workspaceId: string
}

const updateProfile = async ({ fullName, username, avatarUrl, workspaceId }: UpdateProfileProps) => {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if(!user) return { success: false, error: "Not authorized" }

    let updatedData: any = {}

    if(fullName) updatedData.full_name = fullName
    if(username) updatedData.username = username
    if(avatarUrl) updatedData.avatar_url = avatarUrl

    try {

        const { error: supabaseError } = await supabase
        .from("profiles")
        .update(updatedData)
        .eq("id", user.id)

        if(supabaseError) return { success: false, error: supabaseError.message }

        revalidatePath(`/workspaces/${workspaceId}`)

        return { success: true, error: null }

    } catch(error) {
        console.log(error)
        return { success: false, error: "Something went wrong" }
    }
}

export { updateProfile }