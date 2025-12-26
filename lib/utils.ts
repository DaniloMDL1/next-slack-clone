import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const getInitials = (name: string) => {
    const words = name.split(" ").filter((word) => word.length > 0)
    if(words.length === 1) return words[0][0].toUpperCase()
    return words[0][0].toUpperCase() + words[words.length - 1][0].toUpperCase()
}