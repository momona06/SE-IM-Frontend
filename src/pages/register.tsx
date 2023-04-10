import { useRouter } from "next/router";
import { useState } from "react";
import { request } from "../utils/network";
import { REGISTER_SUCCESS, PASSWORD_INCONSISTENT } from "../constants/string";
import { Button, Input, message } from "antd";
import { ArrowLeftOutlined, ContactsOutlined, LockOutlined, UserAddOutlined, UserOutlined } from "@ant-design/icons";

const RegisterScreen = () => {
    const router = useRouter();
    const [username, getUsername] = useState<string>("");
    const [password, getPassword] = useState<string>("");
    const [verification, getVerification] = useState<string>("");

    const register = () => {
        request(
            "/api/user/register",
            "POST",
            {
                username: username,
                password: password,
            },
        )
            .then(() => {
                message.success(REGISTER_SUCCESS, 1);
                router.push("/");
            })
            .catch((err) => message.error(err.message, 1));
    };

    const verifyPassword = () => {
        if (verification === password){
            register();
        }
        else{
            message.warning(PASSWORD_INCONSISTENT, 1);
        }
    };

    return (
        <div style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, alignItems: "center", backgroundImage: "url(\"https://stu.cs.tsinghua.edu.cn/new/images/blur-light.jpg\")", backgroundSize: "1920px 1200px", backgroundPosition: "center", backgroundRepeat: "no-repeat"}}>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center ", alignItems: "center", position: "absolute", top: 0, bottom: 0, left: 0, right: 0, margin: "auto" }}>
                <h1>
                    用户注册
                </h1>
                <div style={{ display: "flex", flexDirection: "column", paddingLeft: "150px", paddingRight: "150px", paddingTop: "40px", paddingBottom: "30px", border: "1px solid transparent", borderRadius: "20px", alignItems: "center", backgroundColor: "rgba(255,255,255,0.7)"}}>
                    <Input size={"large"}
                        type="text" 
                        placeholder="请填写用户名"
                        prefix={<UserOutlined />}
                        maxLength={50}
                        value={username} 
                        onChange={(e) => getUsername(e.target.value)}
                    />
                    <br />
                    <Input size={"large"}
                        maxLength={50}
                        type="text" 
                        placeholder="请填写密码"
                        prefix={<LockOutlined />}
                        value={password} 
                        onChange={(e) => getPassword(e.target.value)}
                    />
                    <br />
                    <Input size="large"
                        maxLength={50}
                        type="text" 
                        placeholder="请确认密码"
                        prefix={<ContactsOutlined />}
                        value={verification} 
                        onChange={(e) => getVerification(e.target.value)}
                    />
                    <br />
                    <Button type={"primary"} shape={"round"} icon={<UserAddOutlined />} size={"large"}
                        onClick={verifyPassword}>
                            注册账户
                    </Button>
                    <br />
                    <Button type={"link"} icon={<ArrowLeftOutlined />} size={"large"}
                        onClick={() => router.push("/")}>
                            返回登录
                    </Button>
                </div>
            </div>
        </div>
    );
};
export default RegisterScreen;