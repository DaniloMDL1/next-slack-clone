"use client"

import { createReply } from "@/actions/messageActions"
import Editor from "@/components/Editor"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useChannelId } from "@/hooks/useChannelId"
import { useThreadStore } from "@/hooks/useThreadStore"
import { createClient } from "@/lib/supabase/client"
import { ReactionType, MessageWithUserAndReactionsType } from "@/types/types"
import { useEffect, useState, useTransition } from "react"
import { toast } from "sonner"
import MessageItem from "./MessageItem"
import { Spinner } from "@/components/ui/spinner"

type Props = {
    currentUserId: string
}

const ThreadSheet = ({ currentUserId }: Props) => {
    const { isOpen, onCloseThread, parentId } = useThreadStore()

    const [messages, setMessages] = useState<MessageWithUserAndReactionsType[]>([])
    const [isRepliesPending, setIsRepliesPending] = useState(false)

    const [content, setContent] = useState("")
    const [isPending, startTransition] = useTransition()

    const channelId = useChannelId()

    const supabase = createClient()

    const handleCreateReply = async (content: string) => {
        if(!parentId) return

        startTransition(async () => {
            const response = await createReply({ channelId, parentId, content })

            if(response.success) {
                toast.success("Reply created successfully")

            } else {
                toast.error(response.error)
            }
        })
    }

    useEffect(() => {
        if(!parentId) return

        const fetchReplies = async () => {
            setIsRepliesPending(true)

            const { data, error } = await supabase
            .from("messages")
            .select(`
                *,
                user:user_id (*),
                reactions:message_reactions (*),
                replies:messages(count)
            `)
            .or(`id.eq.${parentId},parent_id.eq.${parentId}`)

            if(!error && data) {
                setMessages(data)
            }

            setIsRepliesPending(false)
        }

        fetchReplies()

        const channel = supabase
        .channel(`thread-${parentId}`)
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
                } as MessageWithUserAndReactionsType

                setMessages((prev) => {
                    if(prev.find((msg) => msg.id === newMessage.id)) {
                        return prev
                    }

                    return [...prev, { ...newMessage, reactions: [] }]
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
                    const updatedMessages = prev.map((msg) => {
                        if(msg.id === newReaction.message_id) {
                            return {
                                ...msg,
                                reactions: [...msg.reactions, newReaction]
                            }
                        }

                        return msg
                    })

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
    }, [parentId, channelId])

    return (
        <Sheet open={isOpen} onOpenChange={onCloseThread}>
            <SheetContent side="right" className="min-w-110">
                <SheetHeader>
                    <SheetTitle>Channel Thread</SheetTitle>
                    <SheetDescription>
                        Viewing all replies for this message
                    </SheetDescription>
                </SheetHeader>

                <div className="overflow-y-auto p-2">

                    {isRepliesPending && (
                        <div className="flex justify-center py-2">
                            <Spinner className="size-6"/>
                        </div>
                    )}

                    {!isRepliesPending && messages.map((message, index) => (
                        <MessageItem 
                            key={message.id}
                            message={message}
                            isOwn={message.user_id === currentUserId}
                            currentUserId={currentUserId}
                            isMainMessage={index === 0}
                            isSheet={true}
                        />
                    ))}

                    <div className="w-full mt-4">
                        <Editor 
                            content={content}
                            onChange={setContent}
                            placeholder="Message..."
                            onSubmit={handleCreateReply}
                            isSubmitting={isPending}
                        />
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
export default ThreadSheet