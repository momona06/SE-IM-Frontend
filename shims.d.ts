export {};

interface messageListData {
    msg_id: number;
    msg_type: string;
    msg_body: string;
    reply_id?: number;
    combine_list?: number[];
    msg_time: string;
    sender: string;
    read_list: boolean[];
    avatar: string;
    is_delete: boolean;
}

interface roomListData {
    roomname: string;
    roomid: number;
    is_notice: boolean;
    is_top: boolean;
    is_private: boolean;
    message_list: messageListData[];
    index: number;
    is_specific: boolean;
}

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
        playVideoUrl: string
        otherUsername: string
        currentRoomID: number
        currentRoomName: string
        messageList: messageListData[]
        roomList: roomListData[]
        forwardRoomId: number
        memList: string[]
        temproomid: number
        temproomname: string
        temproomnotice: boolean
        temproomtop: boolean
        temproomspecific: boolean
        temproomlist: messageListData[]
    }
}