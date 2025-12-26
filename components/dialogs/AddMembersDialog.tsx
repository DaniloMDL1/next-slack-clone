"use client"

import { Dispatch, SetStateAction } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import { z } from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Button } from "../ui/button"
import { Spinner } from "../ui/spinner"
import { useWorkspaceId } from "@/hooks/useWorkspaceId"
import { addMemberToWorkspace } from "@/actions/workspaceActions"
import { toast } from "sonner"

type Props = {
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>
}

const formSchema = z.object({
    username: z.string().min(1, "Username is required"),
    memberRole: z.enum(["member", "admin"])
})

type FormDataType = z.infer<typeof formSchema>

const AddMembersDialog = ({ isOpen, setIsOpen }: Props) => {

    const workspaceId = useWorkspaceId()

    const form = useForm<FormDataType>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            memberRole: "member"
        }
    })

    const onSubmit = async (formData: FormDataType) => {
        const response = await addMemberToWorkspace({ workspaceId, username: formData.username, memberRole: formData.memberRole })

        if(response.success) {
            toast.success("Member added successfully")

            setIsOpen(false)
        } else {
            toast.error(response.error)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Members</DialogTitle>
                    <DialogDescription>
                        Enter the details below to add a member to this workspace
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="">
                    <FieldGroup className="gap-4">

                        <Controller 
                            name="username"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                                    <Input 
                                        id={field.name}
                                        {...field}
                                        aria-invalid={fieldState.invalid}
                                        type="text"
                                        placeholder="Username"
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                                </Field>
                            )}
                        />

                        <Controller 
                            name="memberRole"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={"select-member-role"}>Member Role</FieldLabel>
                                    <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger id="select-member-role" aria-invalid={fieldState.invalid} className="w-30">
                                            <SelectValue placeholder="Select a member role"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {["member", "admin"].map((role) => (
                                                <SelectItem key={role} value={role}>
                                                    {role[0].toUpperCase() + role.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                                </Field>
                            )}
                        />

                        <Button type="submit" variant={"emerald"} disabled={form.formState.isSubmitting} className="w-16">
                            {form.formState.isSubmitting ? <Spinner className="size-6 text-white"/> : "Add"}
                        </Button>

                    </FieldGroup>
                </form>
            </DialogContent>
        </Dialog>
    )
}
export default AddMembersDialog