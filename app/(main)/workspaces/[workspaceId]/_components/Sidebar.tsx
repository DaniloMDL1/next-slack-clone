"use client"

import WorkspaceAvatar from "@/components/avatars/WorkspaceAvatar"
import { UserType, WorkspaceType } from "@/types/types"
import SidebarItem from "./SidebarItem"
import { RiHome2Fill } from "react-icons/ri"
import { IoChatbubblesOutline } from "react-icons/io5";
import { Bell, Ellipsis, Hash, Plus, User2 } from "lucide-react";
import UserAvatar from "@/components/avatars/UserAvatar";
import UpdateProfileDialog from "@/components/dialogs/UpdateProfileDialog";
import { useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"
import AddMembersDialog from "@/components/dialogs/AddMembersDialog"
import CreateChannelDialog from "@/components/dialogs/CreateChannelDialog"

type Props = {
    workspace: WorkspaceType | null,
    userProfile: UserType | null
}

const Sidebar = ({ workspace, userProfile }: Props) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
    const [isChannelOpen, setIsChannelOpen] = useState(false)

    const [isPending, setIsPending] = useState(false)

    const router = useRouter()

    const supabase = createClient()

    const handleSignOut = async () => {
        setIsPending(true)
        try {
            const { error } = await supabase.auth.signOut()
    
            if(error) {
                toast.success(error.message)
                return
            }
    
            toast.success("Signed out successfully")
    
            router.push("/signin")
        } catch(error) {
            console.log(error)
            toast.error("Error signing out")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="h-full bg-primary/85 w-20 flex flex-col items-center justify-between pb-3">
            <div className="flex flex-col items-center gap-4">
                <WorkspaceAvatar name={workspace?.name || ""} size="size-12"/>

                <SidebarItem Icon={RiHome2Fill} name="Home"/>
                <SidebarItem Icon={IoChatbubblesOutline} name="DMs"/>
                <SidebarItem Icon={Bell} name="Activity"/>
                <SidebarItem Icon={Ellipsis} name="More"/>
            </div>

            <div className="flex flex-col items-center gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size={"icon-lg"} className="bg-accent/50 hover:bg-accent/60 rounded-full">
                            <Plus className="size-6"/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" sideOffset={20} alignOffset={150} className="w-90">
                        <DropdownMenuLabel>Create</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setIsChannelOpen(true)} className="cursor-pointer">
                            <div className="bg-muted-foreground/20 p-3 rounded-full">
                                <Hash />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium">Channel</span>
                                <span className="text-muted-foreground">Start a group conversation</span>
                            </div>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setIsAddMemberOpen(true)} className="cursor-pointer">
                            <div className="bg-muted-foreground/20 p-3 rounded-full">
                                <User2 />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium">Members</span>
                                <span className="text-muted-foreground">Add a member to the workspace</span>
                            </div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <CreateChannelDialog isOpen={isChannelOpen} setIsOpen={setIsChannelOpen}/>

                <AddMembersDialog isOpen={isAddMemberOpen} setIsOpen={setIsAddMemberOpen}/>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="cursor-pointer">
                            <UserAvatar userProfile={userProfile} size="size-12"/>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="end">
                        <DropdownMenuItem onClick={() => setIsOpen(true)} className="cursor-pointer">
                            <User2 />
                            <span>Update Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Button onClick={handleSignOut} disabled={isPending} className="w-full">
                                {isPending ? <Spinner className="size-6 text-white"/> : "Sign Out"}
                            </Button>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <UpdateProfileDialog userProfile={userProfile} isOpen={isOpen} setIsOpen={setIsOpen}/>
            </div>
        </div>
    )
}
export default Sidebar