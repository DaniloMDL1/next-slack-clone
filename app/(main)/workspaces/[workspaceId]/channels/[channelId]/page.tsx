import { createClient } from "@/lib/supabase/server"
import Header from "./_components/Header"
import { notFound, redirect } from "next/navigation"
import MessageInput from "./_components/MessageInput"
import MessagesContainer from "./_components/MessagesContainer"
import ThreadSheet from "./_components/ThreadSheet"

type Props = {
    params: Promise<{ channelId: string }>
}

const ChannelPage = async ({ params }: Props) => {
    const { channelId } = await params

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if(!user) {
        redirect("/signin")
    }

    const { data: channel, error: channelError } = await supabase
    .from("channels")
    .select("*")
    .eq("id", channelId)
    .single()

    if(!channel || channelError) {
        notFound()
    }

    const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select(`
        *,
        user:user_id (*),
        reactions:message_reactions (*),
        replies:messages(count)
    `)
    .eq("channel_id", channelId)
    .is("parent_id", null)

    return (
        <div className="h-full flex flex-col">
            <Header channel={channel}/>
            <MessagesContainer initialMessages={messages ?? []} channelId={channelId} currentUserId={user.id}/>
            <MessageInput />
            <ThreadSheet currentUserId={user.id}/>
        </div>
    )
}
export default ChannelPage