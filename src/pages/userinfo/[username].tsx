import { useRouter } from "next/router";
import { useState } from "react";
import UserManagementScreen from ".";
import { LOGIN_SUCCESS } from "../../constants/string";
import { request } from "../../utils/network";

//用户管理界面

const UserManagementScreenWithUsername = () => {
    const router = useRouter();

    return (
        <UserManagementScreen Username={router.query.username as string} />
    );


};
export default UserManagementScreenWithUsername;