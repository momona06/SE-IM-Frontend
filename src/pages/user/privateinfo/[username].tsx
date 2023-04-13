import { useRouter } from "next/router";
import PrivateInfoScreen from "./index";

//用户信息界面
const PrivateInfoScreenWithUsername = () => {
    const router = useRouter();

    return (
        <PrivateInfoScreen Username={router.query.username as string} />
    );
};
export default PrivateInfoScreenWithUsername;