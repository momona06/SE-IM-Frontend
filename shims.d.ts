import {roomListData, messageListData} from "./src/components/chat";

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

        playVideoUrl: string

        currentRoom: roomListData
        tempRoom: roomListData

        memList: string[]
        messageList: messageListData[]
        roomList: roomListData[]
        forwardRoomId: number
    }
}