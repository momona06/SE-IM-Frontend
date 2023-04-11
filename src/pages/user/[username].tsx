import { useRouter } from "next/router";
import ChatScreen from ".";
import UserManagementScreen from "../userinfo";

//用户信息界面
const Users = () => {
    const router = useRouter();

    return (
        <ChatScreen Username={router.query.username as string} />
    );
};
export default Users;