import { useRouter } from "next/router";
import { useState } from "react";
import PublicInfoScreen from "./index";
import { LOGIN_SUCCESS } from "../../../constants/string";
import { request } from "../../../utils/network";

//用户管理界面

const PublicInfoScreenWithUsername = () => {
    const router = useRouter();

    return (
        <PublicInfoScreen Username={router.query.username as string} />
    );


};
export default PublicInfoScreenWithUsername;