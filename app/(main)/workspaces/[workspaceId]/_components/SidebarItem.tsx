import { Button } from "@/components/ui/button"
import { LucideIcon as LucideIconType } from "lucide-react"
import { IconType } from "react-icons"

type Props = {
    Icon: LucideIconType | IconType,
    name: string
}

const SidebarItem = ({ Icon, name }: Props) => {
    return (
        <div className="flex flex-col items-center text-white">
            <Button variant={"primaryGhost"} size={"icon"} className="p-6">
                <Icon className="size-6"/>
            </Button>
            <span className="font-light text-sm">{name}</span>
        </div>
    )
}
export default SidebarItem