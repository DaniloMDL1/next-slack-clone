"use server"

import { createClient } from "@/lib/supabase/server"

type CreateMessageProps = {
    content: string,
    channelId: string
}

const createMessage = async ({ content, channelId }: CreateMessageProps) => {

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if(!user) return { success: false, error: "Not authorized" }

    if(!content || !channelId) return { success: false, error: "All fields are required" }

    try {

        const { error: supabaseError } = await supabase
        .from("messages")
        .insert({ user_id: user.id, channel_id: channelId, content })

        if(supabaseError) return { success: false, error: supabaseError.message }

        return { success: true, error: null }

    } catch(error) {
        console.log(error)
        return { success: false, error: "Something went wrong" }
    }
}

type DeleteMessageProps = {
    messageId: string,
}

const deleteMessage = async ({ messageId }: DeleteMessageProps) => {

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if(!user) return

    try {

        const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId)

        if(error) return

    } catch(error) {
        console.log(error)
        return
    }
}

type UpdateMessageProps = {
    messageId: string,
    content: string
}

const updateMessage = async ({ messageId, content }: UpdateMessageProps) => {

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if(!user) return { success: false, error: "Not authorized" }

    try {

        const { error: supabaseError } = await supabase
        .from("messages")
        .update({ content, is_edited: true, })
        .eq("id", messageId)

        if(supabaseError) return { success: true, error: supabaseError.message }

        return { success: true, error: null }

    } catch(error) {
        console.log(error)
        return { success: false, error: "Something went wrong" }
    }
}

type CreateReplyProps = {
    content: string,
    channelId: string,
    parentId: string
}

const createReply = async ({ content, channelId, parentId }: CreateReplyProps) => {

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if(!user) return { success: false, error: "Not authorized" }

    if(!content || !channelId || !parentId) return { success: false, error: "All fields are required" }

    try {

        const { error: supabaseError } = await supabase
        .from("messages")
        .insert({ user_id: user.id, content, channel_id: channelId, parent_id: parentId })

        if(supabaseError) return { success: false, error: supabaseError.message }

        return { success: true, error: null }

    } catch(error) {
        console.log(error)
        return { success: false, error: "Something went wrong" }
    }
}

export { createMessage, deleteMessage, updateMessage, createReply }