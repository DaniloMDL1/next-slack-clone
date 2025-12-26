import { getInitials } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { UserType } from "@/types/types"

type Props = {
    userProfile: UserType | null,
    size?: string
}

const UserAvatar = ({ userProfile, size }: Props) => {
    return (
        <Avatar className={`rounded-md ${size && size}`}>
            <AvatarImage className="rounded-md" src={userProfile?.avatar_url ?? ""} />
            <AvatarFallback className="rounded-md">
                {getInitials(userProfile?.full_name ?? "")}
            </AvatarFallback>
        </Avatar>
    )
}
export default UserAvatar