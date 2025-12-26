"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { createClient } from "@/lib/supabase/client"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

const formSchema = z.object({
    fullName: z.string().min(1, "Full Name is required"),
    username: z.string().min(1, "Username is required"),
    email: z.email({ error: "Invalid email address" }),
    password: z.string().min(6, "Password must be at least 6 characters")
})

type FormDataType = z.infer<typeof formSchema>

const SignUpForm = () => {

    const router = useRouter()

    const form = useForm<FormDataType>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            username: "",
            email: "",
            password: ""
        }
    })

    const supabase = createClient()

    const onSubmit = async (formData: FormDataType) => {
        const { data, error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                data: {
                    full_name: formData.fullName,
                    username: formData.username
                }
            }
        })

        if(error) {
            toast.error(error.message)
            return
        }

        if(data.user && data.session) {
            toast.success("Signed up successfully")

            router.push("/")
        }
    }

    return (
        <Card className="max-w-sm w-full">
            <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>Enter the details below to sign up</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="mb-2">
                    <FieldGroup className="gap-4">
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

                        <Controller 
                            name="email"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>Email Address</FieldLabel>
                                    <Input 
                                        id={field.name}
                                        {...field}
                                        aria-invalid={fieldState.invalid}
                                        type="text"
                                        placeholder="Email Address"
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                                </Field>
                            )}
                        />

                        <Controller 
                            name="password"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                                    <Input 
                                        id={field.name}
                                        {...field}
                                        aria-invalid={fieldState.invalid}
                                        type="password"
                                        placeholder="Password"
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                                </Field>
                            )}
                        />

                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? <Spinner className="size-6 text-white"/> : "Sign Up"}
                        </Button>
                    </FieldGroup>
                </form>

                <Link href={"/signin"} className="hover:underline hover:text-primary transition-colors">
                    Already have an account? Sign In
                </Link>
            </CardContent>
        </Card>
    )
}
export default SignUpForm