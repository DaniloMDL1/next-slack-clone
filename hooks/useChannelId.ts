import { useParams } from "next/navigation"

export const useChannelId = () => {
    const params = useParams()

    const channelId = params.channelId as string

    return channelId
}