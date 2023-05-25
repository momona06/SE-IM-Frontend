import {roomListData, messageListData, userData} from "./src/components/chat";

declare global {
    interface Window {
        ws: WebSocket
        timeoutObj: NodeJS.Timer
        serverTimeoutObj: NodeJS.Timeout
        heartBeat: boolean
        loginToken?: number

        username: string
        password: string
        userAvatar: string

        otherUsername: string
        otherAvatar: string

        playVideoUrl: string

        currentRoom: roomListData
        tempRoom: roomListData

        memList: string[]
        messageList: messageListData[]
        father_id: number
        roomList: roomListData[]
        forwardRoomId: number
    }
}