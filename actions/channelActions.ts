"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

type CreateChannelStateType = {
    success: boolean,
    error: string | null,
    fieldErrors: {
        name?: string[],
        workspaceId?: string[]
    }
}

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    workspaceId: z.string({ error: "WorkspaceId is required" })
})

const createChannel = async (prevState: CreateChannelStateType, formData: FormData) => {

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if(!user) return { success: false, error: "Not authorized", fieldErrors: {} }

    const formDataName = formData.get("name") as string
    const formDataWorkspaceId = formData.get("workspaceId") as string

    console.log(formDataName)
    console.log(formDataWorkspaceId)

    const validatedFields = formSchema.safeParse({
        name: formDataName,
        workspaceId: formDataWorkspaceId
    })

    if(!validatedFields.success) {
        const tree = z.treeifyError(validatedFields.error)

        return {
            success: false,
            error: null,
            fieldErrors: {
                name: tree.properties?.name?.errors,
                workspaceId: tree.properties?.workspaceId?.errors
            }
        }
    }

    const { name, workspaceId } = validatedFields.data

    try {

        const { error: supabaseError } = await supabase
        .from("channels")
        .insert({ user_id: user.id, name, workspace_id: workspaceId })
        
        if(supabaseError) return { success: false, error: supabaseError.message, fieldErrors: {} }

        revalidatePath(`/workspaces/${workspaceId}`)

        return { success: true, error: null, fieldErrors: {} }

    } catch(error) {
        console.log(error)
        return { success: false, error: "Something went wrong", fieldErrors: {} }
    }
}

const deleteChannel = async (workspaceId: string, channelId: string) => {

    const supabase = await createClient()

    try {

        const { error } = await supabase
        .from("channels")
        .delete()
        .eq("id", channelId)

        if(error) return

    } catch(error) {
        console.log(error)
        return
    }

    revalidatePath(`/workspaces/${workspaceId}`)
    redirect(`/workspaces/${workspaceId}`)
}

export { createChannel, deleteChannel }