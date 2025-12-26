"use client"

import { createMessage } from "@/actions/messageActions"
import Editor from "@/components/Editor"
import { useChannelId } from "@/hooks/useChannelId"
import { useState, useTransition } from "react"
import { toast } from "sonner"

const MessageInput = () => {
    const [content, setContent] = useState("")
    const [isPending, startTransition] = useTransition()

    const channelId = useChannelId()

    const handleCreateMessage = async (content: string) => {

        startTransition(async () => {
            const response = await createMessage({ content, channelId })
    
            if(response.success) {
    
            } else {
                toast.error(response.error)
            }

        })

    }

    return (
        <div className="w-full p-2">
            <Editor 
                content={content}
                onChange={setContent}
                placeholder="Message..."
                onSubmit={handleCreateMessage}
                isSubmitting={isPending}
            />
        </div>
    )
}
export default MessageInput