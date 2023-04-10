import { useRouter } from "next/router";
import UserManagementScreen from ".";

//用户信息界面
const UserManagementScreenWithUsername = () => {
    const router = useRouter();

    return (
        <UserManagementScreen Username={router.query.username as string} />
    );
};
export default UserManagementScreenWithUsername;