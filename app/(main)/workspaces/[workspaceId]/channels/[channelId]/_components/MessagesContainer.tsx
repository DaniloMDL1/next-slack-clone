"use client"

import { MessageWithUserType } from "@/types/types"
import { useEffect, useRef, useState } from "react"
import MessageItem from "./MessageItem"
import { createClient } from "@/lib/supabase/client"

type Props = {
    initialMessages: MessageWithUserType[],
    channelId: string,
    currentUserId: string
}

const MessagesContainer = ({ initialMessages, channelId, currentUserId }: Props) => {
    const [messages, setMessages] = useState(initialMessages)

    const bottomRef = useRef<HTMLDivElement>(null)

    const supabase = createClient()

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    useEffect(() => {
        const timer = setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" })
        }, 1000)

        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {

        const channel = supabase
        .channel(`channel-${channelId}`)
        .on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "messages",
                filter: `channel_id=eq.${channelId}`
            },
            async (payload) => {
                const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", payload.new.user_id)
                .single()

                const newMessage = {
                    ...payload.new,
                    user: profile
                } as MessageWithUserType

                setMessages((prev) => {
                    if(prev.some((msg) => msg.id === newMessage.id)) {
                        return prev
                    }

                    return [...prev, newMessage]
                })
            }
        )
        .on(
            "postgres_changes",
            {
                event: "DELETE",
                schema: "public",
                table: "messages",
                filter: `channel_id=eq.${channelId}`
            },
            (payload) => {
                setMessages((prev) => {
                    const updatedMessages = prev.filter((msg) => msg.id !== payload.old.id)

                    return updatedMessages
                })
            }
        )
        .on(
            "postgres_changes",
            {
                event: "UPDATE",
                schema: "public",
                table: "messages",
                filter: `channel_id=eq.${channelId}`
            },
            (payload) => {
                setMessages((prev) => {
                    const updatedMessages = prev.map((msg) => msg.id === payload.new.id ? { ...msg, ...payload.new } : msg)
                    
                    return updatedMessages
                })
            }
        )
        .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }

    }, [channelId, supabase])

    return (
        <div className="flex-1 p-4 overflow-y-auto">

            {messages.map((message) => (
                <MessageItem 
                    key={message.id} 
                    message={message}
                    isOwn={message.user_id === currentUserId}
                />
            ))}

            <div ref={bottomRef}/>
        </div>
    )
}
export default MessagesContainer