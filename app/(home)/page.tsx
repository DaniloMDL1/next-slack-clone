import { Suspense } from "react"
import WorkspaceCard from "./_components/WorkspaceCard"
import { Spinner } from "@/components/ui/spinner"

const HomePage = () => {
    return (
        <div className="h-full flex justify-center items-center">
            <Suspense fallback={<Spinner className="size-10"/>}>
                <WorkspaceCard />
            </Suspense>
        </div>
    )
}
export default HomePage