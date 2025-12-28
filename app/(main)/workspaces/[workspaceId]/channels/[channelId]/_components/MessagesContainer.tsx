"use client"

import { MessageWithUserAndReactionsType, ReactionType } from "@/types/types"
import { useEffect, useRef, useState } from "react"
import MessageItem from "./MessageItem"
import { createClient } from "@/lib/supabase/client"

type Props = {
    initialMessages: MessageWithUserAndReactionsType[],
    channelId: string,
    currentUserId: string
}

const MessagesContainer = ({ initialMessages, channelId, currentUserId }: Props) => {
    const [messages, setMessages] = useState(initialMessages)

    const bottomRef = useRef<HTMLDivElement>(null)

    const supabase = createClient()

    useEffect(() => {
        setMessages(initialMessages)
    }, [initialMessages])

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

                if(payload.new.parent_id) {
                    setMessages((prev) => {
                        const updatedMessages = prev.map((msg) => {
                            if(msg.id === payload.new.parent_id) {
                                const currentCount = msg.replies?.[0]?.count ?? 0

                                return {
                                    ...msg,
                                    replies: [{ count: currentCount + 1 }]
                                }
                            }

                            return msg
                        })

                        return updatedMessages
                    })

                    return 
                }

                const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", payload.new.user_id)
                .single()

                const newMessage = {
                    ...payload.new,
                    user: profile,
                } as MessageWithUserAndReactionsType

                setMessages((prev) => {
                    if(prev.some((msg) => msg.id === newMessage.id)) {
                        return prev
                    }

                    return [...prev, { ...newMessage, reactions: [], replies: [{ count: 0 }] }]
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
        .on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "message_reactions",
                filter: `channel_id=eq.${channelId}`
            },
            (payload) => {
                const newReaction = payload.new as ReactionType

                setMessages((prev) => {
                    const updatedMessages = prev.map((msg) => msg.id === newReaction.message_id ? { ...msg, reactions: [...msg.reactions, newReaction ]} : msg)

                    return updatedMessages
                })

            }
        )
        .on(
            "postgres_changes",
            {
                event: "DELETE",
                schema: "public",
                table: "message_reactions",
                filter: `channel_id=eq.${channelId}`
            },
            (payload) => {
                setMessages((prev) => {
                    const updatedMessages = prev.map((msg) => {
                        const hasReaction = msg.reactions.some((r) => r.id === payload.old.id)

                        if(hasReaction) {
                            return {
                                ...msg,
                                reactions: msg.reactions.filter((r) => r.id !== payload.old.id)
                            }
                        }

                        return msg
                    })

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
        <div className="flex-1 p-4 max-md:p-1 overflow-y-auto">

            {messages.map((message) => (
                <MessageItem 
                    key={message.id} 
                    message={message}
                    isOwn={message.user_id === currentUserId}
                    currentUserId={currentUserId}
                />
            ))}

            <div ref={bottomRef}/>
        </div>
    )
}
export default MessagesContainer