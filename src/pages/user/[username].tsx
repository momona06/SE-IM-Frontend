import { useRouter } from "next/router";
import ChatScreen from ".";

//用户信息界面
const Users = () => {
    const router = useRouter();

    return (
        <ChatScreen Username={router.query.username as string} />
    );
};
export default Users;