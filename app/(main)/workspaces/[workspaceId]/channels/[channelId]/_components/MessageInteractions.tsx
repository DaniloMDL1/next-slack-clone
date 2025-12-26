"use client"

import { deleteMessage } from "@/actions/messageActions"
import DeleteDialog from "@/components/dialogs/DeleteDialog"
import Hint from "@/components/Hint"
import { Button } from "@/components/ui/button"
import { EmojiPicker, EmojiPickerContent, EmojiPickerFooter, EmojiPickerSearch } from "@/components/ui/emoji-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { MessageWithUserType } from "@/types/types"
import { Edit, Smile, Trash } from "lucide-react"
import { useState } from "react"

type Props = {
    isOwn: boolean,
    message: MessageWithUserType,
    handleEdit: () => void
}

const MessageInteractions = ({ isOwn, message, handleEdit }: Props) => {
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    const deleteAction = async () => {
        await deleteMessage({ messageId: message.id })
    }

    return (
        <div className="absolute top-1 right-2 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant={"ghost"} size={"sm"}>
                        <Smile className="size-4"/>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-fit p-0">
                    <EmojiPicker
                        className="w-full h-77"
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