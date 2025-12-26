"use client"

import { Dispatch, SetStateAction, useActionState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import { useWorkspaceId } from "@/hooks/useWorkspaceId"
import { createChannel } from "@/actions/channelActions"
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field"
import { Input } from "../ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group"
import { Hash } from "lucide-react"
import { Button } from "../ui/button"
import { Spinner } from "../ui/spinner"
import { toast } from "sonner"

type Props = {
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>
}

const CreateChannelDialog = ({ isOpen, setIsOpen }: Props) => {
    const workspaceId = useWorkspaceId()

    const [state, formAction, isPending] = useActionState(createChannel, { success: false, error: null, fieldErrors: {} })

    const nameError = state.fieldErrors?.name?.[0]

    useEffect(() => {
        if(state.success) {
            toast.success("Channel created successfully")
            setIsOpen(false)
        } else {
            if(state.error) {
                toast.error(state.error)
            }
        }

    }, [state])

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Channel</DialogTitle>
                    <DialogDescription>Enter the details below to create a channel</DialogDescription>
                </DialogHeader>

                <form action={formAction} className="">
                    <FieldGroup>
                        <Field data-invalid={nameError !== undefined}>
                            <FieldLabel htmlFor="name">Name</FieldLabel>
                            <InputGroup>
                                <InputGroupInput 
                                    id="name"
                                    name="name"
                                    type="text"
                                    aria-invalid={nameError !== undefined}
                                    placeholder="Name"
                                />
                                <InputGroupAddon>
                                    <Hash />
                                </InputGroupAddon>
                            </InputGroup>
                            {nameError && <FieldError errors={[ { message: nameError } ]}/>}
                        </Field>

                        <input type="hidden" name="workspaceId" value={workspaceId}/>

                        <Button type="submit" variant={"emerald"} disabled={isPending} className="w-20">
                            {isPending ? <Spinner className="size-6 text-white"/> : "Create"}
                        </Button>

                    </FieldGroup>
                </form>
            </DialogContent>
        </Dialog>
    )
}
export default CreateChannelDialog