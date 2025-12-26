import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { WorkspaceType } from "@/types/types"
import { ArrowLeft, ArrowRight, CircleQuestionMark, SearchIcon } from "lucide-react"
import Link from "next/link"

type Props = {
    workspace: WorkspaceType | null
}

const TopBar = ({ workspace }: Props) => {
    return (
        <div className="h-12 bg-primary/85 flex items-center justify-between px-2">
            <div />

            <div className="max-w-lg w-full flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Button variant={"primaryGhost"} size={"icon"} asChild>
                        <Link href={"/"}>
                            <ArrowLeft className="size-6"/>
                        </Link>
                    </Button>
                    <Button variant={"primaryGhost"} disabled size={"icon"}>
                        <ArrowRight className="size-6"/>
                    </Button>
                </div>
                <InputGroup className="bg-accent/30 border-accent/30">
                    <InputGroupInput 
                        placeholder={`Search ${workspace?.name}`}
                        className="text-white placeholder:text-white" 
                    />
                    <InputGroupAddon>
                        <SearchIcon className="text-white size-4"/>
                    </InputGroupAddon>
                </InputGroup>
            </div>

            <div>
                <Button variant={"primaryGhost"} size={"icon"}>
                    <CircleQuestionMark className="size-5"/>
                </Button>
            </div>
        </div>
    )
}
export default TopBar