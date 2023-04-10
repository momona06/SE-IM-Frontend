import { useRouter } from "next/router";
import { useState } from "react";

interface ChatScreenProps{
    Username?: string,
}

const ChatScreen = (props: ChatScreenProps) =>{
    const router = useRouter();

    return (
        <div>
            这是聊天界面
        </div>
    );
};
export default ChatScreen;