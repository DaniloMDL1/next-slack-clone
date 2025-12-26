"use client"

import { ReactNode, useActionState, useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { createWorkspace } from "@/actions/workspaceActions"
import { toast } from "sonner"
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field"
import { Button } from "../ui/button"
import { Spinner } from "../ui/spinner"
import { Input } from "../ui/input"

type Props = {
    children: ReactNode
}

const CreateWorkspaceDialog = ({ children }: Props) => {
    const [isOpen, setIsOpen] = useState(false)

    const [state, formAction, isPending] = useActionState(createWorkspace, { success: false, error: null, fieldErrors: {} })

    useEffect(() => {
        if(state.success) {
            toast.success("Workspace created successfully")
            setIsOpen(false)
        } else {
            if(state.error) {
                toast.error(state.error)
            }
        }

    }, [state])

    const nameError = state.fieldErrors?.name?.[0]

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild onClick={() => setIsOpen(true)}>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Workspace</DialogTitle>
                    <DialogDescription>
                        Enter the details below to create a workspace
                    </DialogDescription>
                </DialogHeader>

                <form action={formAction}>
                    <FieldGroup>

                        <Field data-invalid={nameError !== undefined}>
                            <FieldLabel htmlFor={"name"}>Name</FieldLabel>
                            <Input 
                                id={"name"}
                                aria-invalid={nameError !== undefined}
                                name="name"
                                type="text"
                                placeholder="Name"
                            />
                            {nameError && <FieldError errors={[ { message: nameError } ]}/>}
                        </Field>

                        <Button type="submit" variant={"emerald"} disabled={isPending} className="w-20">
                            {isPending ? <Spinner className="size-6 text-white"/> : "Create"}
                        </Button>
                    </FieldGroup>
                </form>
            </DialogContent>
        </Dialog>
    )
}
export default CreateWorkspaceDialog