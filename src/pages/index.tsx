import { useRouter } from "next/router";
import { useState } from "react";
import { LOGIN_SUCCESS } from "../constants/string";
import { request } from "../utils/network";


//登录界面
const LoginScreen = () => {
    const router = useRouter();
    const [username, getUsername] = useState<string>("");
    const [password, getPassword] = useState<string>("");

    const [mouseOverLogin, setMouseOverLogin] = useState<boolean>(false);
    const [mouseOverRegister, setMouseOverRegister] = useState<boolean>(false);

    const login = () => {
        request(
            "/api/user/login",
            "POST",
            {
                username: username,
                password: password,
            },
        )
            .then(() => alert(LOGIN_SUCCESS))
            .catch((err) => alert(err));
    };

    return (
        <div style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, alignItems: "center", backgroundImage: "url(\"https://stu.cs.tsinghua.edu.cn/new/images/blur-light.jpg\")", backgroundSize: "1920px 1200px", backgroundPosition: "center", backgroundRepeat: "no-repeat"}}>
            <div style={{ display: "flex", justifyContent: "center ", alignItems: "center", position: "absolute", top: 0, bottom: 0, left: 0, right: 0, margin: "auto" }}>
                <div style={{ display: "flex", flexDirection: "column", paddingLeft: "150px", paddingRight: "150px", paddingTop: "5px", paddingBottom: "25px", border: "2px solid #00BFFF", borderRadius: "20px", alignItems: "center", backgroundColor: "rgba(255,255,255,0.7)"}}>
                    <h1>登录</h1>
                    <input style={{ width: "400px", height: "50px", margin: "5px", borderRadius: "12px", borderColor: "#00BFFF"}} type="text" placeholder="请填写用户名" value={username} onChange={(e) => getUsername(e.target.value)}/>
                    <input style={{ width: "400px", height: "50px", margin: "5px", borderRadius: "12px", borderColor: "#00BFFF"}} type="text" placeholder="请填写密码" value={password} onChange={(e) => getPassword(e.target.value)}/>
                    <div style={{ width: "400px", height: "50px", margin: "5px", display: "flex", flexDirection: "row"}}>
                        <button style={mouseOverLogin? {width: "195px", marginRight: "5px", height: "50px", borderColor: "#00BFFF", backgroundColor: "white", color: "black", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px"}: {width: "195px", marginRight: "5px", height: "50px", borderColor: "#00BFFF", backgroundColor: "#00BFFF", color: "white", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px"}} onClick={login} onMouseOver={() => setMouseOverLogin(true)} onMouseOut={() => setMouseOverLogin(false)}>
                            登录
                        </button>
                        <button style={mouseOverRegister? {width: "195px", marginLeft: "5px", height: "50px", borderColor: "#707070", backgroundColor: "#707070", color: "#FFFFFF", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px"}: {width: "195px", marginLeft: "5px", height: "50px", borderColor: "#989898", backgroundColor: "#989898", color: "#FFFFFF", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px"}} onClick={() => router.push("/register")} onMouseOver={() => setMouseOverRegister(true)} onMouseOut={() => setMouseOverRegister(false)}>
                            注册新账户
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );};
export default LoginScreen;
