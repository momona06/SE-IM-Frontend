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

        currentRoomID: number
        currentRoomName: string
        memList: string[]
        messageList: messageListData[]
        roomList: roomListData[]
        forwardRoomId: number

        temproomid: number
        temproomname: string
        temproomnotice: boolean
        temproomtop: boolean
        temproomspecific: boolean
        temproomlist: messageListData[]
    }
}