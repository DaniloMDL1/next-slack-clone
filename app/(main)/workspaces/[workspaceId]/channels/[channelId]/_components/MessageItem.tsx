"use client"

import UserAvatar from "@/components/avatars/UserAvatar"
import ReadOnlyEditor from "@/components/ReadOnlyEditor"
import { MessageWithUserAndReactionsType } from "@/types/types"
import { format } from "date-fns"
import MessageInteractions from "./MessageInteractions"
import { useEffect, useState, useTransition } from "react"
import Editor from "@/components/Editor"
import { updateMessage } from "@/actions/messageActions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { toggleReaction } from "@/actions/reactionActions"
import { useThreadStore } from "@/hooks/useThreadStore"
import { Separator } from "@/components/ui/separator"

type Props = {
    message: MessageWithUserAndReactionsType,
    isOwn: boolean,
    currentUserId: string,
    isMainMessage?: boolean,
    isSheet?: boolean
}

const MessageItem = ({ message, isOwn, currentUserId, isMainMessage, isSheet }: Props) => {
    const [isEditing, setIsEditing] = useState(false)
    const [editedContent, setEditedContent] = useState(message.content)
    const [isPending, startTransition] = useTransition()

    const { onOpenThread } = useThreadStore()

    useEffect(() => {
        setEditedContent(message.content)
    }, [message.content])

    const handleUpdateMessage = async (content: string) => {

        startTransition(async () => {
            const response = await updateMessage({ messageId: message.id, content })

            if(response.success) {
                toast.success("Message updated successfully")

                setIsEditing(false)
            } else {
                toast.error(response.error)
            }
        })
    }

    const handleToggleReaction = async (emoji: string) => {
        const response = await toggleReaction({ messageId: message.id, channelId: message.channel_id, emoji })

        if(response.success) {

        } else {
            toast.error(response.error)
        }
    }

    const replyCount = "replies" in message ? message.replies?.[0]?.count : 0

    return (
        <div className={cn("flex gap-2 p-2 transition-all rounded-md group relative", !isEditing && "hover:bg-muted/40")}>
            {!isEditing && (
                <MessageInteractions 
                    isOwn={isOwn} 
                    message={message} 
                    handleEdit={() => setIsEditing(true)}
                    isSheet={isSheet}
                />
            )}

            <UserAvatar userProfile={message.user} size="size-10"/>

            <div className="flex-1">
                {!isEditing && (
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">{message.user.full_name}</span>
                        <span className="text-sm text-muted-foreground/80">
                            {format(new Date(message.is_edited ? message.updated_at : message.created_at), "p")}
                        </span>
                    </div>
                )}

                {isEditing ? (
                    <Editor 
                        content={editedContent}
                        onChange={setEditedContent}
                        onSubmit={handleUpdateMessage}
                        isSubmitting={isPending}
                        isEditing={isEditing}
                        onEditClose={() => setIsEditing(false)}
                    />
                ) : (
                    <ReadOnlyEditor content={message.content}/>
                )}

                {!isEditing && (
                    <>
                        {message.is_edited && (
                            <p className="text-muted-foreground">(edited)</p>
                        )}
                    </>
                )}

                {!isEditing && message.reactions.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                        {Object.entries(
                            message.reactions.reduce((acc, reaction) => {
                                const emoji = reaction.emoji

                                if(!acc[emoji]) {
                                    acc[emoji] = { count: 0, hasMe: false }
                                }

                                acc[emoji].count += 1

                                if(reaction.user_id === currentUserId) {
                                    acc[emoji].hasMe = true
                                }

                                return acc

                            }, {} as Record<string, { count: number, hasMe: boolean }>)
                        ).map(([emoji, { count, hasMe }]) => (
                            <div 
                                key={emoji}
                                onClick={() => handleToggleReaction(emoji)}
                                className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded-full hover:scale-105 transition-all cursor-pointer", hasMe ? "bg-accent text-primary" : "bg-muted")}
                            >
                                <span className="">{emoji}</span>
                                <span className="font-semibold">{count}</span>
                            </div>
                        ))}
                    </div>
                )}

                {replyCount > 0 && !message.parent_id && (
                    <div onClick={() => onOpenThread(message.id)} role="button" className={cn("flex items-center group cursor-pointer w-full mt-1", isSheet ? "gap-2" : "gap-1")}>
                        <span className={cn("font-semibold", isSheet ? "text-muted-foreground/70 text-sm" : "text-sky-700 group-hover:text-sky-700/90")}>{replyCount} {replyCount === 1 ? "reply" : "replies"}</span>
                        {isSheet && isMainMessage && <Separator className="flex-1"/>}
                    </div>
                )}


            </div>
        </div>
    )
}
export default MessageItem