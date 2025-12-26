"use client"

import UserAvatar from "@/components/avatars/UserAvatar"
import ReadOnlyEditor from "@/components/ReadOnlyEditor"
import { MessageWithUserType } from "@/types/types"
import { format } from "date-fns"
import MessageInteractions from "./MessageInteractions"
import { useEffect, useState, useTransition } from "react"
import Editor from "@/components/Editor"
import { updateMessage } from "@/actions/messageActions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Props = {
    message: MessageWithUserType,
    isOwn: boolean
}

const MessageItem = ({ message, isOwn }: Props) => {
    const [isEditing, setIsEditing] = useState(false)
    const [editedContent, setEditedContent] = useState(message.content)
    const [isPending, startTransition] = useTransition()

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

    return (
        <div className={cn("flex gap-2 p-2 transition-all rounded-md group relative", !isEditing && "hover:bg-muted")}>
            {!isEditing && (
                <MessageInteractions 
                    isOwn={isOwn} 
                    message={message} 
                    handleEdit={() => setIsEditing(true)}
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
                        handleEdit={() => setIsEditing(false)}
                    />
                ) : (
                    <ReadOnlyEditor content={message.content}/>
                )}

                {message.is_edited && (
                    <p className="text-muted-foreground">(edited)</p>
                )}

            </div>
        </div>
    )
}
export default MessageItem