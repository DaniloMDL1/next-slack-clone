"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

type CreateReactionProps = {
    messageId: string,
    channelId: string,
    workspaceId: string,
    emoji: string
}

const createReaction = async ({ messageId, channelId, workspaceId, emoji }: CreateReactionProps) => {

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if(!user) return { success: false, error: "Not authorized" }

    try {

        const { error: supabaseError } = await supabase
        .from("message_reactions")
        .insert({ user_id: user.id, message_id: messageId, channel_id: channelId, emoji })

        if(supabaseError) return { success: false, error: supabaseError.message }

        revalidatePath(`/workspaces/${workspaceId}/channels/${channelId}`)

        return { success: true, error: null }

    } catch(error) {
        console.log(error)
        return { success: false, error: "Something went wrong" }
    }
}

type ToggleReactionProps = {
    messageId: string,
    channelId: string,
    workspaceId: string,
    emoji: string
}

const toggleReaction = async ({ messageId, channelId, workspaceId, emoji }: ToggleReactionProps) => {

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if(!user) return { success: false, error: "Not authorized" }

    const { data: existing } = await supabase
    .from("message_reactions")
    .select("id")
    .match({ user_id: user.id, message_id: messageId, emoji })
    .maybeSingle()

    if(existing) {
        const { error: deleteError } = await supabase
        .from("message_reactions")
        .delete()
        .eq("id", existing.id)

        if(deleteError) return { success: false, error: deleteError.message }
    } else {

        const { error: insertError } = await supabase
        .from("message_reactions")
        .insert({ message_id: messageId, channel_id: channelId, emoji, user_id: user.id })

        if(insertError) return { success: false, error: insertError.message }
    }

    revalidatePath(`/workspaces/${workspaceId}/channels/${channelId}`)

    return { success: true, error: null }
}

export { createReaction, toggleReaction }