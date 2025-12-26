"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChannelType } from "@/types/types"
import { Hash } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

type Props = {
    channel: ChannelType
}

const ChannelItem = ({ channel }: Props) => {
    const pathname = usePathname()

    const isSelected = pathname === `/workspaces/${channel.workspace_id}/channels/${channel.id}`

    return (
        <Button variant={"workspaceGhost"} className={cn("flex justify-start", isSelected && "bg-primary text-white")} asChild>
            <Link href={`/workspaces/${channel.workspace_id}/channels/${channel.id}`}>
                <Hash className="size-4"/>
                <span className="font-normal">{channel.name}</span>
            </Link>
        </Button>
    )
}
export default ChannelItem