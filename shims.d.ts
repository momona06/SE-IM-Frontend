export {};

declare global {
    interface Window {
        loginToken?: number
        username?: string
        ws: WebSocket
    }
}