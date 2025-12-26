import { ReactNode } from "react"
import TopBar from "./_components/TopBar"
import { createClient } from "@/lib/supabase/server"
import Sidebar from "./_components/Sidebar"
import { redirect } from "next/navigation"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import WorkspaceSidebar from "./_components/WorkspaceSidebar"

type Props = {
    children: ReactNode,
    params: Promise<{ workspaceId: string }>
}

const WorkspaceLayout = async ({ children, params }: Props) => {
    const { workspaceId } = await params

    const supabase = await createClient()

    const { data: workspace } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", workspaceId)
    .single()

    const { data: { user } } = await supabase.auth.getUser()

    if(!user) {
        redirect("/signin")
    }

    const { data: userProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

    const isOwn = workspace?.user_id === user.id

    return (
        <div className="h-full">
            <TopBar workspace={workspace}/>
            <div className="flex h-[calc(100vh-48px)]">
                <Sidebar workspace={workspace} userProfile={userProfile}/>
                <ResizablePanelGroup orientation="horizontal">
                    <ResizablePanel defaultSize={300}>
                        <WorkspaceSidebar workspace={workspace} isOwn={isOwn} workspaceId={workspaceId}/>
                    </ResizablePanel>
                    <ResizableHandle withHandle/>
                    <ResizablePanel>
                        {children}
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    )
}
export default WorkspaceLayout