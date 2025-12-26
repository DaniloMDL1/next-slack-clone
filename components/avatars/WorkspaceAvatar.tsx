import { getInitials } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

type Props = {
    name: string,
    size?: string
}

const WorkspaceAvatar = ({ name, size }: Props) => {
    return (
        <Avatar className={`rounded-md ${size && size}`}>
            <AvatarImage className="rounded-md" src="" />
            <AvatarFallback className="rounded-md">
                {getInitials(name)}
            </AvatarFallback>
        </Avatar>
    )
}
export default WorkspaceAvatar