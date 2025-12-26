"use client"

import { ChangeEvent, Dispatch, SetStateAction, useEffect, useRef, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { UserType } from "@/types/types"
import { z } from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Spinner } from "../ui/spinner"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { getInitials } from "@/lib/utils"
import { updateProfile } from "@/actions/profileActions"
import { useWorkspaceId } from "@/hooks/useWorkspaceId"

type Props = {
    userProfile: UserType | null,
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>
}

const formSchema = z.object({
    fullName: z.string().min(1, "Full Name is required"),
    username: z.string().min(1, "Username is required"),
    avatarUrl: z.string().optional()
})

type FormDataType = z.infer<typeof formSchema>

const UpdateProfileDialog = ({ userProfile, isOpen, setIsOpen }: Props) => {
    const [isUploading, setIsUploading] = useState(false)

    const fileInputRef = useRef<HTMLInputElement | null>(null)

    const workspaceId = useWorkspaceId()

    const supabase = createClient()

    const form = useForm<FormDataType>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            username: "",
            avatarUrl: ""
        }
    })

    useEffect(() => {
        if(userProfile) {
            form.reset({
                fullName: userProfile.full_name,
                username: userProfile.username,
                avatarUrl: userProfile.avatar_url || ""
            })
        }

    }, [userProfile])

    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]

        if(!file || !userProfile) return

        try {
            setIsUploading(true)

            const filePath = `${userProfile.id}/avatar`

            const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(filePath, file, { upsert: true, contentType: file.type })

            if(uploadError) {
                toast.error(uploadError.message)
                return
            }

            const { data } = supabase.storage
            .from("avatars")
            .getPublicUrl(filePath)

            form.setValue("avatarUrl", `${data.publicUrl}?t=${Date.now()}`)

        } catch(error) {
            console.log(error)
            toast.error("Error uploading image")
        } finally {
            setIsUploading(false)

            if(fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        }
    }

    const avatarUrl = form.watch("avatarUrl")

    const onSubmit = async (formData: FormDataType) => {
        const response = await updateProfile({ workspaceId, fullName: formData.fullName, username: formData.username, avatarUrl: formData.avatarUrl || "" })

        if(response.success) {
            toast.success("Profile updated successfully")
            setIsOpen(false)
        } else {
            toast.error(response.error)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Profile</DialogTitle>
                    <DialogDescription>
                        Enter details below to update your profile
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup className="gap-4">

                        <div className="flex items-center gap-4">
                            <Avatar className="size-16 rounded-md">
                                <AvatarImage className="rounded-md" src={avatarUrl || userProfile?.avatar_url || ""}/>
                                <AvatarFallback className="rounded-md">
                                    {getInitials(userProfile?.full_name || "")}
                                </AvatarFallback>
                            </Avatar>

                            <Input 
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                                ref={fileInputRef}
                            />
                            <Button 
                                onClick={() => fileInputRef.current?.click()} 
                                disabled={isUploading} 
                                type="button"
                                variant={"outline"}
                                className="w-30"
                            >
                                {isUploading ? <Spinner className="size-6"/> : "Upload Avatar"}
                            </Button>
                        </div>


                        <Controller 
                            name="fullName"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
                                    <Input 
                                        id={field.name}
                                        {...field}
                                        aria-invalid={fieldState.invalid}
                                        type="text"
                                        placeholder="Full Name"
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                                </Field>
                            )}
                        />

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

                        <Button type="submit" disabled={form.formState.isSubmitting} className="w-30">
                            {form.formState.isSubmitting ? <Spinner className="size-6 text-white"/> : "Update Profile"}
                        </Button>

                    </FieldGroup>
                </form>
            </DialogContent>
        </Dialog>
    )
}
export default UpdateProfileDialog