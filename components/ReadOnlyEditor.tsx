"use client"

import { cn } from "@/lib/utils"
import { useEditor, EditorContent, JSONContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import { useEffect } from "react"

type Props = {
    content: string | JSONContent
}

const ReadOnlyEditor = ({ content }: Props) => {

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({
                HTMLAttributes: {
                    class: "rounded-lg"
                }
            })
        ],
        editable: false,
        immediatelyRender: false,
        content,    
        editorProps: {
            attributes: {
                class: cn(
                    "prose prose-sm max-w-none",
                    "[&_pre]:bg-muted/90 [&_pre]:text-foreground [&_pre]:border [&_pre]:rounded-md"
                )
            }
        }
    })

    useEffect(() => {
        if(editor && content) {
            editor.commands.setContent(content)
        }

    }, [editor, content])

    if(!editor) return null

    return (
        <EditorContent editor={editor}/>
    )
}
export default ReadOnlyEditor