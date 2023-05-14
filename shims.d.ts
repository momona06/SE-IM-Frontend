export {};

interface messageListData {
    msg_id: number;
    msg_type: string;
    msg_body: string;
    msg_time: string;
    sender: string;
}

interface roomListData {
    roomname: string;
    roomid: number;
    is_notice: boolean;
    is_top: boolean;
    is_private: boolean;
    message_list: messageListData[];
}

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
        messageList: messageListData[]
        roomList: roomListData[]
        forwardRoomId: number
    }
}