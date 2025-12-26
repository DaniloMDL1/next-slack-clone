"use client"

import { deleteWorkspace } from "@/actions/workspaceActions"
import WorkspaceAvatar from "@/components/avatars/WorkspaceAvatar"
import AddMembersDialog from "@/components/dialogs/AddMembersDialog"
import DeleteDialog from "@/components/dialogs/DeleteDialog"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useWorkspaceId } from "@/hooks/useWorkspaceId"
import { WorkspaceType } from "@/types/types"
import { ChevronDown, ListFilter, Plus, Trash } from "lucide-react"
import { useState } from "react"

type Props = {
    workspace: WorkspaceType | null,
    isOwn: boolean
}

const WorkspaceHeader = ({ workspace, isOwn }: Props) => {
    const [isOpen, setIsOpen] = useState(false)

    const workspaceId = useWorkspaceId()

    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    const formAction = deleteWorkspace.bind(null, workspaceId)

    return (
        <div className="h-12 p-2 flex justify-between items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild className="flex-1">
                    <Button variant={"lightPrimaryGhost"} className="flex items-center justify-start gap-2">
                        <span className="font-semibold text-base">{workspace?.name}</span>
                        <ChevronDown />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-60">
                    <DropdownMenuItem className="cursor-pointer">
                        <WorkspaceAvatar name={workspace?.name || ""} />
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold">{workspace?.name}</span>
                            <span className="text-sm text-muted-foreground">Active Workspace</span>
                        </div>
                    </DropdownMenuItem>
                    {isOwn && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setIsOpen(true)} className="cursor-pointer">
                                <Plus className="size-5"/>
                                <span>Add members</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setIsDeleteOpen(true)} className="cursor-pointer">
                                <Trash className="size-4 text-red-600"/>
                                <span className="text-red-600">Delete Workspace</span>
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <AddMembersDialog isOpen={isOpen} setIsOpen={setIsOpen}/>

            <DeleteDialog 
                isOpen={isDeleteOpen} 
                setIsOpen={setIsDeleteOpen} 
                name="Workspace"
                formAction={formAction}
            />
            
            <Button variant={"lightPrimaryGhost"} size={"icon"}>
                <ListFilter className="size-4 text-muted-foreground"/>
            </Button>
        </div>
    )
}
export default WorkspaceHeader