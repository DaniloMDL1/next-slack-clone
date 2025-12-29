"use client"

import { deleteChannel } from "@/actions/channelActions"
import DeleteDialog from "@/components/dialogs/DeleteDialog"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useWorkspaceId } from "@/hooks/useWorkspaceId"
import { ChannelType } from "@/types/types"
import { ChevronDown, Hash, Trash } from "lucide-react"
import { useState } from "react"

type Props = {
    channel: ChannelType,
    isOwner: boolean
}

const Header = ({ channel, isOwner }: Props) => {
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    const workspaceId = useWorkspaceId()

    const formAction = async () => {
        await deleteChannel(workspaceId, channel.id)
    }

    return (
        <div className="h-12 border-b px-4 flex justify-between items-center gap-4">
            {isOwner ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant={"ghost"} className="">
                            <div className="flex items-center gap-1">
                                <Hash className="size-5"/>
                                <span className="text-base font-semibold">{channel.name}</span>
                            </div>
                            <ChevronDown />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setIsDeleteOpen(true)} className="cursor-pointer">
                            <Trash className="size-4 text-red-600"/>
                            <span className="text-red-600">Delete Channel</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <Button variant={"ghost"} className="">
                    <div className="flex items-center gap-1">
                        <Hash className="size-5"/>
                        <span className="text-base font-semibold">{channel.name}</span>
                    </div>
                    <ChevronDown />
                </Button>
            )}


            <DeleteDialog 
                isOpen={isDeleteOpen}
                setIsOpen={setIsDeleteOpen}
                name="Channel"
                formAction={formAction}
            />
        </div>
    )
}
export default Header