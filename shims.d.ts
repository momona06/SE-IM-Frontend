export {};

declare global {
    interface Window {
        ws: WebSocket
        timeoutObj: NodeJS.Timer
        serverTimeoutObj: NodeJS.Timeout
        heartBeat: boolean
        loginToken?: number
        username: string
        otherUsername: string
        currentRoomID: number
        currentRoomName: string
    }
}