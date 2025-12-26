import WorkspaceAvatar from "@/components/avatars/WorkspaceAvatar"
import CreateWorkspaceDialog from "@/components/dialogs/CreateWorkspaceDialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { getInitials } from "@/lib/utils"
import { AlertCircleIcon, ArrowRight } from "lucide-react"
import Link from "next/link"

const WorkspaceCard = async () => {

    const supabase = await createClient()

    const { data: workspaces, error } = await supabase
    .from("workspaces")
    .select("*")
    .order("created_at", { ascending: true })

    return (
        <Card className="max-w-sm w-full">
            <CardHeader>
                <CardTitle>Your Workspaces</CardTitle>
                <CardDescription>Select a workspace or create a new one to get started</CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert variant="destructive">
                        <AlertCircleIcon />
                        <AlertTitle>Failed to fetch workspaces</AlertTitle>
                        <AlertDescription>
                            <p>{error.message || "Something went wrong"}</p>
                        </AlertDescription>
                    </Alert>
                )}

                {!workspaces || workspaces.length === 0 ? (
                    <p className="text-center font-medium">No workspaces yet</p>
                ) : (
                    <div>
                        {workspaces.map((workspace) => (
                            <Link 
                                key={workspace.id} 
                                href={`/workspaces/${workspace.id}`}
                                className="flex items-center justify-between gap-4 group hover:bg-neutral-200/30 p-3 rounded-lg transition-all"
                            >
                                <div className="flex items-center gap-2">
                                    <WorkspaceAvatar name={workspace.name} size="size-10"/>
                                    <span className="font-medium">{workspace.name}</span>
                                </div>
                                <ArrowRight className="opacity-0 group-hover:opacity-100 transition-all text-muted-foreground"/>
                            </Link>
                        ))}
                    </div>
                )}

            </CardContent>
            <CardFooter>
                <CreateWorkspaceDialog>
                    <Button>Create Workspace</Button>
                </CreateWorkspaceDialog>
            </CardFooter>
        </Card>
    )
}
export default WorkspaceCard