"use client"

import { Dispatch, SetStateAction } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { useFormStatus } from "react-dom"
import { Spinner } from "../ui/spinner"

type Props = {
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>,
    name: string,
    formAction: () => Promise<void>
}

const ConfirmButton = () => {
    const { pending: isPending } = useFormStatus()
    
    return (
        <Button variant={"destructive"} disabled={isPending} className="w-20">
            {isPending ? <Spinner className="size-6 text-white"/> : "Confirm"}
        </Button>
    )

}

const DeleteDialog = ({ isOpen, setIsOpen, name, formAction }: Props) => {

    const deleteAction = async () => {
        await formAction()
        setIsOpen(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete {name}</DialogTitle>
                    <DialogDescription>You won't be able to recover this once it's gone</DialogDescription>
                </DialogHeader>

                <form action={deleteAction} className="flex justify-end">
                    <ConfirmButton />
                </form>
            </DialogContent>
        </Dialog>
    )
}
export default DeleteDialog