import { useRouter } from "next/router";
import PublicInfoScreen from "./index";

//用户管理界面

const PublicInfoScreenWithUsername = () => {
    const router = useRouter();

    return (
        <PublicInfoScreen Username={router.query.username as string} />
    );


};
export default PublicInfoScreenWithUsername;