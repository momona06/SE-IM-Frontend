import { useState } from "react";
import { LOGIN_SUCCESS } from "../constants/string";
import { request } from "../utils/network";
import { message, Input, Button, Space } from "antd";
import { ArrowRightOutlined, LockOutlined, LoginOutlined, UserOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";


export const isEmail = (val : string) => {
    //仅保留是否为邮件的判断，其余交给后端
    return /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/i.test(val);
};

//登录界面
const LoginScreen = () => {
    const [account, getAccount] = useState<string>("");
    const [password, getPassword] = useState<string>("");
    const router = useRouter();
    const login = () => {
        if (isEmail(account)){
            request(
                "/api/user/login",
                "POST",
                {
                    username: "",
                    password: password,
                    email: account,
                },
            )
                .then((res) => {
                    message.success(LOGIN_SUCCESS, 1);
                    window.loginToken = res.token;
                    router.push(`/userinfo/${res.username}`);
                })
                .catch((err) => {
                    message.error(err.message, 1);
                });
        }
        else{
            request(
                "/api/user/login",
                "POST",
                {
                    username: account,
                    password: password,
                    email: "",
                },
            )
                .then((res) => {
                    message.success(LOGIN_SUCCESS, 1);
                    window.loginToken = res.token;
                    router.push(`/userinfo/${res.username}`);
                })
                .catch((err) => message.error(err.message, 1));
        }
    };

    return (
        <div style={{
            width: "100%", height: "100%", position: "absolute", top: 0, left: 0, alignItems: "center",
            backgroundImage: "url(\"https://stu.cs.tsinghua.edu.cn/new/images/blur-light.jpg\")",
            backgroundSize: "1920px 1200px", backgroundPosition: "center", backgroundRepeat: "no-repeat"
        }}>
            <div style={{
                display: "flex", flexDirection: "column", justifyContent: "center ", alignItems: "center", position: "absolute",
                top: 0, bottom: 0, left: 0, right: 0, margin: "auto"
            }}>
                <h1>
                    登录
                </h1>
                <div style={{
                    display: "flex", flexDirection: "column", paddingLeft: "150px", paddingRight: "150px",
                    paddingTop: "40px", paddingBottom: "30px", border: "1px solid transparent", borderRadius: "20px",
                    alignItems: "center", backgroundColor: "rgba(255,255,255,0.7)"
                }}>
                    <Input size="large"
                        type="text"
                        placeholder="请填写用户名"
                        prefix={<UserOutlined />}
                        maxLength={50}
                        value={account}
                        onChange={(e) => getAccount(e.target.value)}
                    />
                    <br />
                    <Input.Password size="large"
                        type="text"
                        maxLength={50}
                        placeholder="请填写密码"
                        prefix={<LockOutlined />}
                        value={password}
                        onChange={(e) => getPassword(e.target.value)}
                    />
                    <br />
                    <div style={{
                        width: "400px", height: "50px", margin: "5px", display: "flex", flexDirection: "row"
                    }}>
                        <Space size={150}>
                            <Button type={"primary"} size={"large"} shape={"round"} icon={<LoginOutlined />}
                                onClick={login}>
                                登录
                            </Button>
                            <Button type={"default"} size={"large"} shape={"round"} icon={<ArrowRightOutlined />}
                                onClick={()=> router.push("/register")}>
                                注册新账户
                            </Button>
                        </Space>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default LoginScreen;
