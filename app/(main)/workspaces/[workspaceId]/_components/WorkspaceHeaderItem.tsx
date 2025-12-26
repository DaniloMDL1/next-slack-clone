import { Button } from "@/components/ui/button"

type Props = {
    name: string
}

const WorkspaceHeaderItem = ({ name }: Props) => {
    return (
        <h3 className="w-full text-sm px-2 font-normal">
            {name}
        </h3>
    )
}
export default WorkspaceHeaderItem