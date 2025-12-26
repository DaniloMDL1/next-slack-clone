import { Tables } from "@/database.types";

export type WorkspaceType = Tables<"workspaces">

export type UserType = Tables<"profiles">

export type ChannelType = Tables<"channels">

export type MessageType = Tables<"messages">

export type MessageWithUserType = MessageType & {
    user: UserType
}