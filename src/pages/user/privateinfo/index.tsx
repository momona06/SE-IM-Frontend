import {useRouter} from "next/router";
import {useState} from "react";
import {
    USERNAME_CHANGE_SUCCESS,
    EMAIL_CHANGE_SUCCESS,
    PASSWORD_CHANGE_SUCCESS,
    PASSWORD_INCONSISTENT
} from "../../../constants/string";
import {
    NO_REVISE,
    REVISE_USERNAME,
    REVISE_EMAIL,
    REVISE_PASSWORD,
    BIND_EMAIL,
    WRITE_OFF
} from "../../../constants/constants";
import {request} from "../../../utils/network";
import {message, Input, Button, Space} from "antd";
import {ContactsOutlined, LockOutlined, MailOutlined, UserOutlined} from "@ant-design/icons";

//用户管理界面
interface InfoScreenProps {
    Username?: string,
}

const PrivateInfoScreen = (props: InfoScreenProps) => {
    const router = useRouter();
    const [username, getUsername] = useState<string>(props.Username ?? "");
    const [newUsername, getNewUsername] = useState<string>("");
    const [email, getEmail] = useState<string>("");
    const [password, getPassword] = useState<string>("");
    const [newPassword, getNewPassword] = useState<string>("");
    const [verification, getVerification] = useState<string>("");
    const [changeUserInfo, setChangeUserInfo] = useState<number>(0);


    const bindEmail = () => {
        request(
            "/api/user/email",
            "POST",
            {
                email: email,
            },
        );
    };

    const changeUsername = () => {
        request(
            "/api/user/revise",
            "PUT",
            {
                revise_field: "username",
                revise_content: newUsername,
                username: props.Username,
                input_password: password,
                token: window.loginToken,
            },
        )
            .then(() => {
                message.success(USERNAME_CHANGE_SUCCESS, 1);
                router.push(`/userinfo/${newUsername}`);
            })
            .catch((err) => message.error(err.message, 1));
    };

    const changeEmail = () => {
        request(
            "/api/user/revise",
            "PUT",
            {
                revise_field: "email",
                revise_content: email,
                username: props.Username,
                input_password: password,
                token: window.loginToken,
            },
        )
            .then(() => message.success(EMAIL_CHANGE_SUCCESS, 1))
            .catch((err) => message.error(err.message, 1));
    };
    const verifyPassword = () => {
        if (verification === newPassword) {
            changePassword();
        } else {
            message.warning(PASSWORD_INCONSISTENT, 1);
        }
    };

    const changePassword = () => {
        request(
            "/api/user/revise",
            "PUT",
            {
                revise_field: "password",
                revise_content: newPassword,
                username: props.Username,
                input_password: password,
                token: window.loginToken,
            },
        )
            .then(() => message.success(PASSWORD_CHANGE_SUCCESS, 1))
            .catch((err) => message.error(err.message, 1));
    };

    const logout = () => {
        request(
            "/api/user/logout",
            "DELETE",
            {
                token: window.loginToken,
                username: props.Username,
            },
        )
            .then(() => router.push("/"))
            .catch((err) => message.error(err.message, 1));
    };

    const deleteUser = () => {
        request(
            "/api/user/cancel",
            "DELETE",
            {
                username: props.Username,
                input_password: password,
            },
        )
            .then(() => router.push("/"))
            .catch((err) => message.error(err.message, 1));
    };

    return (
        <div style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
            alignItems: "center",
            backgroundImage: "url(\"https://stu.cs.tsinghua.edu.cn/new/images/blur-light.jpg\")",
            backgroundSize: "1920px 1200px",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat"
        }}>
            <div style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center ",
                alignItems: "center",
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                margin: "auto"
            }}>
                <h1>
                    用户管理
                </h1>
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    paddingLeft: "150px",
                    paddingRight: "150px",
                    paddingTop: "5px",
                    paddingBottom: "25px",
                    border: "1px solid transparent",
                    borderRadius: "20px",
                    alignItems: "center",
                    backgroundColor: "rgba(255,255,255,0.7)"
                }}>
                    {props.Username ? (<h3>当前用户：{username}</h3>) : null}
                    <button
                        onClick={() => router.push("../../seacrh")}>
                        搜索用户
                    </button>
                    <div style={{width: "400px", height: "50px", margin: "5px", display: "flex", flexDirection: "row"}}>
                        <Space size={50}>
                            <Button size={"large"} type={"primary"}
                                onClick={() => ((changeUserInfo === REVISE_USERNAME) ? setChangeUserInfo(NO_REVISE) : setChangeUserInfo(REVISE_USERNAME))}>
                                修改用户名
                            </Button>
                            <Button size={"large"} type={"primary"}
                                onClick={() => ((changeUserInfo === REVISE_PASSWORD) ? setChangeUserInfo(NO_REVISE) : setChangeUserInfo(REVISE_PASSWORD))}>
                                修改密码
                            </Button>
                            <Button size={"large"} type={"primary"}
                                onClick={() => ((changeUserInfo === REVISE_EMAIL) ? setChangeUserInfo(NO_REVISE) : setChangeUserInfo(REVISE_EMAIL))}>
                                修改邮箱
                            </Button>
                        </Space>
                    </div>
                    {changeUserInfo === REVISE_USERNAME ? (
                        <div style={{margin: "5px", display: "flex", flexDirection: "column", alignItems: "center"}}>
                            <Input size={"large"} maxLength={50}
                                prefix={<UserOutlined/>}
                                type="text"
                                placeholder="请填写新用户名"
                                value={newUsername}
                                onChange={(e) => getNewUsername(e.target.value)}
                            />
                            <br/>
                            <Input.Password
                                size={"large"} maxLength={50}
                                type="text"
                                prefix={<LockOutlined/>}
                                placeholder="请填写密码"
                                value={password}
                                onChange={(e) => getPassword(e.target.value)}
                            />
                            <br/>
                            <Button size={"large"} type={"dashed"}
                                onClick={changeUsername}>
                                确认修改用户名
                            </Button>
                        </div>
                    ) : null}

                    {changeUserInfo === REVISE_PASSWORD ? (
                        <div style={{margin: "5px", display: "flex", flexDirection: "column", alignItems: "center"}}>
                            <Input
                                size={"large"} maxLength={50}
                                type="text"
                                prefix={<LockOutlined/>}
                                placeholder="请填写旧密码"
                                value={password}
                                onChange={(e) => getPassword(e.target.value)}
                            />
                            <br/>
                            <Input.Password
                                size={"large"} maxLength={50}
                                type="text"
                                prefix={<LockOutlined/>}
                                placeholder="请填写新密码"
                                value={newPassword}
                                onChange={(e) => getNewPassword(e.target.value)}
                            />
                            <br/>
                            <Input.Password
                                size={"large"} maxLength={50}
                                type="text"
                                prefix={<ContactsOutlined/>}
                                placeholder="请再次填写新密码"
                                value={verification}
                                onChange={(e) => getVerification(e.target.value)}
                            />
                            <br/>
                            <Button size={"large"} type={"dashed"}
                                onClick={verifyPassword}>
                                确认修改密码
                            </Button>
                        </div>
                    ) : null}

                    {changeUserInfo === REVISE_EMAIL ? (
                        <div style={{margin: "5px", display: "flex", flexDirection: "column", alignItems: "center"}}>
                            <Input
                                size={"large"}
                                type="text"
                                prefix={<MailOutlined />}
                                placeholder="请填写邮箱"
                                value={email}
                                onChange={(e) => getEmail(e.target.value)}
                            />
                            <br/>
                            <Button size={"large"} type={"dashed"}
                                onClick={changeEmail}>
                                确认修改邮箱
                            </Button>
                        </div>
                    ) : null}

                    {changeUserInfo === WRITE_OFF ? (
                        <div style={{margin: "5px", display: "flex", flexDirection: "column", alignItems: "center"}}>
                            <Input.Password size={"large"} maxLength={50}
                                type="text"
                                placeholder="请填写密码"
                                prefix={<LockOutlined/>}
                                value={password}
                                onChange={(e) => getPassword(e.target.value)}
                            />
                            <Button size={"large"} shape={"round"} type={"dashed"} danger={true}
                                onClick={deleteUser}>
                                确认注销
                            </Button>
                        </div>
                    ) : null}
                    <div style={{width: "400px", height: "50px", margin: "5px", display: "flex", flexDirection: "row"}}>
                        <Space size={150}>
                            <Button size={"large"} shape={"round"} type={"primary"}
                                onClick={logout}>
                                登出
                            </Button>
                            <Button size={"large"} shape={"round"} type={"primary"} danger={true}
                                onClick={() => ((changeUserInfo === WRITE_OFF) ? setChangeUserInfo(NO_REVISE) : setChangeUserInfo(WRITE_OFF))}>
                                注销账户
                            </Button>
                        </Space>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default PrivateInfoScreen;