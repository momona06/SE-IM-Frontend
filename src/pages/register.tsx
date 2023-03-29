import { useRouter } from "next/router";
import { REGISTER_SUCCESS, PASSWORD_INCONSISTANT } from "../constants/string";
import { useState } from "react";
import { request } from "../utils/network";

const RegisterScreen = () => {
    const router = useRouter();
    const [username, getUsername] = useState<string>("");
    const [email, getEmail] = useState<string>("");
    const [password, getPassword] = useState<string>("");
    const [verification, getVerification] = useState<string>("");

    const [mouseOverRegister, setMouseOverRegister] = useState<boolean>(false);
    const [mouseOverReturn, setMouseOverReturn] = useState<boolean>(false);


    const register = () => {
        request(
            "/api/user/register",
            "POST",
            {
                username: username,
                password: password,
            },
        )
            .then(() => alert(REGISTER_SUCCESS))
            .catch((err) => alert(err));
    };

    const verifyPassword = () => {
        if (verification === password){
            register();
        }
        else{
            alert(PASSWORD_INCONSISTANT);
        } 
    };

    return (
        <div style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, alignItems: "center", backgroundImage: "url(\"https://stu.cs.tsinghua.edu.cn/new/images/blur-light.jpg\")", backgroundSize: "1920px 1200px", backgroundPosition: "center", backgroundRepeat: "no-repeat"}}>
            <div style={{ display: "flex", justifyContent: "center ", alignItems: "center", position: "absolute", top: 0, bottom: 0, left: 0, right: 0, margin: "auto" }}>
                <div style={{ display: "flex", flexDirection: "column", paddingLeft: "150px", paddingRight: "150px", paddingTop: "5px", paddingBottom: "25px", border: "2px solid #00BFFF", borderRadius: "20px", alignItems: "center", backgroundColor: "rgba(255,255,255,0.7)"}}>
                    <h1>用户注册</h1>
                    <input 
                        style={{ width: "400px", height: "50px", margin: "5px", borderRadius: "12px", borderColor: "#00BFFF"}} 
                        type="text" 
                        placeholder="请填写用户名" 
                        value={username} 
                        onChange={(e) => getUsername(e.target.value)}/>
                    <input 
                        style={{ width: "400px", height: "50px", margin: "5px", borderRadius: "12px", borderColor: "#00BFFF"}} 
                        type="text" 
                        placeholder="请填写邮箱" 
                        value={email} 
                        onChange={(e) => getEmail(e.target.value)}/>
                    <input 
                        style={{ width: "400px", height: "50px", margin: "5px", borderRadius: "12px", borderColor: "#00BFFF"}} 
                        type="text" 
                        placeholder="请填写密码" 
                        value={password} 
                        onChange={(e) => getPassword(e.target.value)}/>
                    <input 
                        style={{ width: "400px", height: "50px", margin: "5px", borderRadius: "12px", borderColor: "#00BFFF"}} 
                        type="text" 
                        placeholder="请确认密码" 
                        value={verification} 
                        onChange={(e) => getVerification(e.target.value)}/>
                    <button 
                        style={ mouseOverRegister? { width: "200px", height: "50px", borderColor: "#00BFFF", backgroundColor: "white", color: "black", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px", margin: "5px"}: { width: "200px", height: "50px", borderColor: "#00BFFF", backgroundColor: "#00BFFF", color: "white", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px", margin: "5px"}} 
                        onClick={verifyPassword} 
                        onMouseOver={() => setMouseOverRegister(true)} 
                        onMouseOut={() => setMouseOverRegister(false)}>
                        注册账户
                    </button>
                    <button 
                        style={ mouseOverReturn? { width: "66px", height: "20px", border: "none", margin: "5px", backgroundColor: "transparent", textDecoration: "underline", cursor: "pointer"}: { width: "66px", height: "20px", border: "none", margin: "5px", backgroundColor: "transparent", textDecoration: "none", cursor: "pointer"}} 
                        onClick={() => router.push("/")} 
                        onMouseOver={() => setMouseOverReturn(true)} 
                        onMouseOut={() => setMouseOverReturn(false)}>
                        返回登陆
                    </button>
                </div>
            </div>
        </div>
    );
};
export default RegisterScreen;