import { Button } from "@/components/ui/button"
import { LucideIcon as LucideIconType } from "lucide-react"
import { IconType } from "react-icons"

type Props = {
    Icon: LucideIconType | IconType,
    name: string
}

const WorkspaceItem = ({ Icon, name }: Props) => {
    return (
        <Button variant={"workspaceGhost"} className="flex justify-start">
            <Icon className="size-4"/>
            <span className="font-normal">{name}</span>
        </Button>
    )
}
export default WorkspaceItem