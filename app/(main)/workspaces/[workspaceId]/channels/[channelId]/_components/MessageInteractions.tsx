"use client"

import { deleteMessage } from "@/actions/messageActions"
import { createReaction } from "@/actions/reactionActions"
import DeleteDialog from "@/components/dialogs/DeleteDialog"
import Hint from "@/components/Hint"
import { Button } from "@/components/ui/button"
import { EmojiPicker, EmojiPickerContent, EmojiPickerFooter, EmojiPickerSearch } from "@/components/ui/emoji-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useWorkspaceId } from "@/hooks/useWorkspaceId"
import { MessageWithUserAndReactionsType } from "@/types/types"
import { Edit, Smile, Trash } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

type Props = {
    isOwn: boolean,
    message: MessageWithUserAndReactionsType,
    handleEdit: () => void
}

const MessageInteractions = ({ isOwn, message, handleEdit }: Props) => {
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    const [isEmojiOpen, setIsEmojiOpen] = useState(false)

    const workspaceId = useWorkspaceId()

    const deleteAction = async () => {
        await deleteMessage({ messageId: message.id })
    }

    const handleReaction = async (emoji: string) => {
        const response = await createReaction({ messageId: message.id, channelId: message.channel_id, workspaceId, emoji })

        if(response.success) {
            setIsEmojiOpen(false)
        } else {
            toast.error(response.error)
        }
    }

    return (
        <div className="absolute top-1 right-2 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1">
            <Popover open={isEmojiOpen} onOpenChange={setIsEmojiOpen}>
                <PopoverTrigger asChild>
                    <Button variant={"ghost"} size={"sm"}>
                        <Smile className="size-4"/>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-fit p-0">
                    <EmojiPicker
                        className="w-full h-77"
                        onEmojiSelect={({ emoji }) => handleReaction(emoji)}
                    >
                        <EmojiPickerSearch />
                        <EmojiPickerContent />
                        <EmojiPickerFooter />
                    </EmojiPicker>
                </PopoverContent>
            </Popover>

            {isOwn && (
                <>
                    <Hint title="Delete">
                        <Button onClick={() => setIsDeleteOpen(true)} variant={"ghost"} size={"sm"}>
                            <Trash className="size-4 text-red-600"/>
                        </Button>
                    </Hint>

                    <DeleteDialog 
                        isOpen={isDeleteOpen}
                        setIsOpen={setIsDeleteOpen}
                        name="Message"
                        formAction={deleteAction}
                    />

                    <Hint title="Edit">
                        <Button onClick={handleEdit} variant={"ghost"} size={"sm"}>
                            <Edit className="size-4 text-emerald-600"/>
                        </Button>
                    </Hint>
                </>
            )}
        </div>
    )
}
export default MessageInteractions