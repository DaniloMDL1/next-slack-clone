import { create } from "zustand"

type ThreadStateType = {
    parentId: string | null,
    isOpen: boolean, 
    onOpenThread: (messageId: string) => void,
    onCloseThread: () => void
}

export const useThreadStore = create<ThreadStateType>()((set) => ({
    parentId: null,
    isOpen: false,
    onOpenThread: (messageId) => set({ parentId: messageId, isOpen: true }),
    onCloseThread: () => set({ parentId: null, isOpen: false })
}))