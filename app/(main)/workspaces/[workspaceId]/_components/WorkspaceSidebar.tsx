import { WorkspaceType } from "@/types/types"
import WorkspaceHeader from "./WorkspaceHeader"
import WorkspaceItem from "./WorkspaceItem"
import { BsChatText } from "react-icons/bs";
import { AiOutlineSend } from "react-icons/ai";
import WorkspaceHeaderItem from "./WorkspaceHeaderItem";
import { createClient } from "@/lib/supabase/server";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import ChannelItem from "./ChannelItem";

type Props = {
    workspace: WorkspaceType | null,
    isOwn: boolean,
    workspaceId: string
}

const WorkspaceSidebar = async ({ workspace, isOwn, workspaceId }: Props) => {

    const supabase = await createClient()

    const { data: channels, error: channelsError } = await supabase
    .from("channels")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true })

    return (
        <div className="h-full bg-primary/30 flex flex-col gap-4 overflow-y-auto pb-2">
            <WorkspaceHeader workspace={workspace} isOwn={isOwn}/>

            <div className="px-1 flex flex-col gap-4">
                <div className="flex flex-col">
                    <WorkspaceItem Icon={BsChatText} name="Threads"/>
                    <WorkspaceItem Icon={AiOutlineSend} name="Drafts & Sent"/>
                </div>

                <div className="flex flex-col gap-2">
                    <WorkspaceHeaderItem name="Channels"/>

                    {channelsError && (
                        <Alert variant="destructive">
                            <AlertCircleIcon />
                            <AlertTitle>Failed to fetch channels</AlertTitle>
                            <AlertDescription>
                                <p>{channelsError.message || "Something went wrong"}</p>
                            </AlertDescription>
                        </Alert>
                    )}

                    {!channels || channels.length === 0 ? (
                        <p className="text-center font-medium">No channels yet</p>
                    ) : (
                        <div className="flex flex-col px-2">
                            {channels.map((channel) => (
                                <ChannelItem key={channel.id} channel={channel}/>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <WorkspaceHeaderItem name="Direct messages"/>
                </div>
            </div>
        </div>
    )
}
export default WorkspaceSidebar