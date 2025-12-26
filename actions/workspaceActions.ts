"use server"

import { createClient } from "@/lib/supabase/server"
import { z } from "zod"
import slugify from "slugify"
import { randomBytes } from "crypto"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

type StateType = {
    success: boolean,
    error: string | null,
    fieldErrors: {
        name?: string[]
    }
}

const createWorkspaceFormSchema = z.object({
    name: z.string().min(1, "Name is required")
})

const createWorkspace = async (prevState: StateType, formData: FormData) => {

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if(!user) return { success: false, error: "Not authorized", fieldErrors: {} }

    const validatedFields = createWorkspaceFormSchema.safeParse({
        name: formData.get("name") as string
    })

    if(!validatedFields.success) {
        const tree = z.treeifyError(validatedFields.error)

        return {
            success: false,
            error: null,
            fieldErrors: {
                name: tree.properties?.name?.errors
            }
        }
    }

    const { name } = validatedFields.data

    try {

        const randomSuffix = randomBytes(4).toString("hex")

        const slug = slugify(`${name}-${randomSuffix}`, { lower: true, strict: true })

        const { error: supabaseError } = await supabase
        .from("workspaces")
        .insert({ user_id: user.id, name, slug })

        if(supabaseError) return { success: false, error: supabaseError.message, fieldErrors: {} }

        revalidatePath("/")

        return { success: true, error: null, fieldErrors: {} }

    } catch(error) {
        console.log(error)
        return { success: false, error: "Something went wrong", fieldErrors: {} }
    }
}

type AddMemberToWorkspaceProps = {
    workspaceId: string,
    username: string,
    memberRole: string
}

const addMemberToWorkspace = async ({ workspaceId, username, memberRole }: AddMemberToWorkspaceProps) => {

    const supabase = await createClient()

    const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .single()

    if(!profile || profileError) return { success: false, error: "User not found" }

    try {

        const { error: supabaseError } = await supabase
        .from("workspace_members")
        .insert({ user_id: profile.id, workspace_id: workspaceId, member_role: memberRole })

        if(supabaseError) return { success: false, error: supabaseError.message }

        revalidatePath(`/workspaces/${workspaceId}`)

        return { success: true, error: null }

    } catch(error) {
        console.log(error)
        return { success: false, error: "Something went wrong" }
    }
}

const deleteWorkspace = async (workspaceId: string) => {

    const supabase = await createClient()

    try {

        const { error: supabaseError } = await supabase
        .from("workspaces")
        .delete()
        .eq("id", workspaceId)

        if(supabaseError) return
        
    } catch(error) {
        console.log(error)
        return
    }

    revalidatePath("/")
    redirect("/")
}

export { createWorkspace, addMemberToWorkspace, deleteWorkspace }