import { useRouter } from "next/router";
import ChatScreen from "./chat";

//聊天主页面
const Chat = ()=>{
    const router = useRouter();
    return (<ChatScreen Username={router.query.username as string} />);
};
export default Chat;