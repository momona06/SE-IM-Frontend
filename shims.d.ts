export {};

declare global {
    interface Window {
        loginToken?: number
        username?: string
        ws: WebSocket
        timeoutObj: NodeJS.Timer
        serverTimeoutObj: NodeJS.Timeout
        heartBeat: boolean
    }
}