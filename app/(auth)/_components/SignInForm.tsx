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
    email: z.email({ error: "Invalid email address" }),
    password: z.string().min(6, "Password must be at least 6 characters")
})

type FormDataType = z.infer<typeof formSchema>

const SignInForm = () => {

    const router = useRouter()

    const form = useForm<FormDataType>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    })

    const supabase = createClient()

    const onSubmit = async (formData: FormDataType) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password
        })

        if(error) {
            toast.error(error.message)

            return
        }

        if(data.user && data.session) {
            toast.success("Signed in successfully")

            router.push("/")
        }
    }

    return (
        <Card className="max-w-sm w-full">
            <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>Enter the details below to access your account</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="mb-2">
                    <FieldGroup className="gap-4">

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
                            {form.formState.isSubmitting ? <Spinner className="size-6 text-white"/> : "Sign In"}
                        </Button>

                    </FieldGroup>
                </form>

                <Link href={"/signup"} className="hover:underline hover:text-primary transition-colors">
                    Don't have an account? Sign Up
                </Link>
            </CardContent>
        </Card>
    )
}
export default SignInForm