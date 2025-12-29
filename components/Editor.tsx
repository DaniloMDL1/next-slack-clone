"use client"

import { cn } from "@/lib/utils"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Placeholder } from "@tiptap/extensions"
import Emoji from "@tiptap/extension-emoji"
import CodeBlock from "@tiptap/extension-code-block"
import Image from "@tiptap/extension-image"
import { Toggle } from "./ui/toggle"
import { Bold, Code2, ImageIcon, Italic, List, ListOrdered, Redo, Smile, Strikethrough, Undo } from "lucide-react"
import { Button } from "./ui/button"
import { Separator } from "./ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { EmojiPicker, EmojiPickerContent, EmojiPickerFooter, EmojiPickerSearch } from "@/components/ui/emoji-picker"
import { IoMdSend } from "react-icons/io";
import { Spinner } from "./ui/spinner"
import { ChangeEvent, useRef, useState } from "react"
import { toast } from "sonner"
import { useChannelId } from "@/hooks/useChannelId"
import { createClient } from "@/lib/supabase/client"

type Props = {
    content: string,
    onChange: (content: string) => void,
    placeholder?: string,
    onSubmit: (content: string) => Promise<void>,
    isSubmitting: boolean,
    isEditing?: boolean,
    onEditClose?: () => void
}

const Editor = ({ content, onChange, placeholder, onSubmit, isSubmitting, isEditing, onEditClose }: Props) => {
    const [isUploading, setIsUploading] = useState(false)

    const fileInputRef = useRef<HTMLInputElement | null>(null)

    const channelId = useChannelId()

    const supabase = createClient()

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false
            }),
            Placeholder.configure({
                placeholder
            }),
            Emoji,
            CodeBlock.configure({
                tabSize: 4,
                enableTabIndentation: true
            }),
            Image.configure({
                resize: {
                    enabled: true,
                    alwaysPreserveAspectRatio: true
                }
            })
        ],
        editable: true,
        immediatelyRender: false,
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: cn(
                    "prose prose-sm min-h-[80px] max-w-none focus:outline-none rounded-lg p-3 leading-relaxed",
                    "[&_pre]:bg-muted/90 [&_pre]:text-foreground [&_pre]:border [&_pre]:rounded-md"
                )
            }
        }
    })

    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]

        if(!file || !editor) return

        try {
            setIsUploading(true)

            const filePath = `${channelId}/${crypto.randomUUID()}-${file.name}`

            const { error: uploadError } = await supabase.storage
            .from("message-attachments")
            .upload(filePath, file, { contentType: file.type, upsert: false })

            if(uploadError) {
                toast.error(uploadError.message)
                return
            }

            const { data } = supabase.storage
            .from("message-attachments")
            .getPublicUrl(filePath)

            editor.chain().focus().setImage({ src: data.publicUrl, alt: file.name }).run()

        } catch(error) {
            toast.error("Error uploading image")
        } finally {
            setIsUploading(false)

            if(fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        }
    }

    if(!editor) return null

    const isEmpty = editor.isEmpty

    const handleSend = async () => {
        if(isEmpty || isSubmitting) return

        const htmlContent = editor.getHTML()

        await onSubmit(htmlContent)

        editor.commands.clearContent()
    }

    return (
        <div className="border rounded-md overflow-hidden">
            <div className="border-b bg-muted/50 py-2 px-1 flex flex-wrap items-center gap-1">
                <Toggle
                    size={"sm"} 
                    pressed={editor.isActive("bold")}
                    onPressedChange={() => editor.chain().focus().toggleBold().run()}
                >
                    <Bold className="size-4"/>
                </Toggle>

                <Toggle 
                    size={"sm"} 
                    pressed={editor.isActive("italic")}
                    onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                >
                    <Italic className="size-4"/>
                </Toggle>

                <Toggle 
                    size={"sm"} 
                    pressed={editor.isActive("strike")}
                    onPressedChange={() => editor.chain().focus().toggleStrike().run()}
                >
                    <Strikethrough className="size-4"/>
                </Toggle>

                <Toggle 
                    size={"sm"} 
                    pressed={editor.isActive("codeBlock")}
                    onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
                >
                    <Code2 className="size-4"/>
                </Toggle>

                <Separator orientation="vertical"/>

                <Toggle 
                    size={"sm"} 
                    pressed={editor.isActive("bulletList")}
                    onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                >
                    <List className="size-4"/>
                </Toggle>

                <Toggle 
                    size={"sm"} 
                    pressed={editor.isActive("orderedList")}
                    onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                >
                    <ListOrdered className="size-4"/>
                </Toggle>

                <Separator orientation="vertical"/>

                <Button
                    variant={"ghost"} 
                    size={"sm"}
                    disabled={!editor.can().undo()}
                    onClick={() => editor.chain().focus().undo().run()}
                >
                    <Undo className="size-4"/>
                </Button>

                <Button
                    variant={"ghost"} 
                    size={"sm"} 
                    disabled={!editor.can().redo()}
                    onClick={() => editor.chain().focus().redo().run()}
                >
                    <Redo className="size-4"/>
                </Button>
            </div>
            <EditorContent editor={editor}/>
            <div className="py-2 px-3 flex justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={"ghost"} size={"sm"}>
                                <Smile className="size-4"/>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-fit p-0">
                            <EmojiPicker 
                                onEmojiSelect={({ emoji }) => editor.chain().focus().insertContent(emoji + " ").run()}
                                className="w-full h-87"
                            >
                                <EmojiPickerSearch />
                                <EmojiPickerContent />
                                <EmojiPickerFooter />
                            </EmojiPicker>
                        </PopoverContent>
                    </Popover>

                    <Button 
                        variant={"ghost"} 
                        size={"sm"}
                        disabled={isUploading}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {isUploading ? <Spinner className="size-4"/> : <ImageIcon className="size-4"/>}
                    </Button>

                    <input 
                        type="file"
                        className="hidden"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                    />
                </div>

                {isEditing ? (
                    <div className="flex items-center gap-2">
                        <Button onClick={onEditClose} variant={"outline"}>
                            Cancel
                        </Button>

                        <Button onClick={handleSend} variant={"emerald"} disabled={isSubmitting}>
                            {isSubmitting ? <Spinner className="size-6 text-white"/> : "Save Changes"}
                        </Button>
                    </div>
                ) : (
                    <Button onClick={handleSend} variant={isEmpty ? "ghost" : "emerald"} disabled={isEmpty || isSubmitting}>
                        {isSubmitting ? <Spinner className="size-6 text-white"/> : <IoMdSend className="size-4"/>}
                    </Button>
                )}

            </div>
        </div>
    )
}
export default Editor