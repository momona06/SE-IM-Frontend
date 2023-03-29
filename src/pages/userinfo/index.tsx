import { useRouter } from "next/router";
import { useState } from "react";
import { LOGIN_SUCCESS } from "../../constants/string";
import { request } from "../../utils/network";

//用户管理界面

interface UserScreenProps{
    Username?: string,
}

const UserManagementScreen = (props: UserScreenProps) => {
    const router = useRouter();
    const [username, getUsername] = useState<string>(props.Username ?? "");
    const [newUsername, getNewUsername] = useState<string>("");
    const [email, getEmail] = useState<string>("");
    const [newEmail, getNewEmail] = useState<string>("");
    const [password, getPassword] = useState<string>("");
    const [newPassword, getNewPassword] = useState<string>("");
    const [verification, getVerification] = useState<string>("");

    const [mouseOverChangeUsername, setMouseOverChangeUsername] = useState<boolean>(false);
    const [mouseOverChangeEmail, setMouseOverChangeEmail] = useState<boolean>(false);
    const [mouseOverChangePassword, setMouseOverChangePassword] = useState<boolean>(false);

    const [mouseOverSubmitUsername, setMouseOverSubmitUsername] = useState<boolean>(false);
    const [mouseOverSubmitEmail, setMouseOverSubmitEmail] = useState<boolean>(false);
    const [mouseOverSubmitPassword, setMouseOverSubmitPassword] = useState<boolean>(false);

    const [mouseOverLogout, setMouseOverLogout] = useState<boolean>(false);
    const [mouseOverDeleteAccount, setMouseOverDeleteAccount] = useState<boolean>(false);

    const [changeUserInfo, setChangeUserInfo] = useState<number>(0);  //0=不修改，1=修改用户名，2=修改邮箱，3=修改密码

    const someFunction = () => {}

    return (
        <div style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, alignItems: "center", backgroundImage: "url(\"https://stu.cs.tsinghua.edu.cn/new/images/blur-light.jpg\")", backgroundSize: "1920px 1200px", backgroundPosition: "center", backgroundRepeat: "no-repeat"}}>
            <div style={{ display: "flex", justifyContent: "center ", alignItems: "center", position: "absolute", top: 0, bottom: 0, left: 0, right: 0, margin: "auto" }}>
                <div style={{ display: "flex", flexDirection: "column", paddingLeft: "150px", paddingRight: "150px", paddingTop: "5px", paddingBottom: "25px", border: "2px solid #00BFFF", borderRadius: "20px", alignItems: "center", backgroundColor: "rgba(255,255,255,0.7)"}}>
                    <h1>用户管理</h1>
                    {props.Username? (<h3>当前用户：{props.Username}</h3>): null}
                    <div style={{ width: "400px", height: "50px", margin: "5px", display: "flex", flexDirection: "row"}}>
                        <button 
                            style={mouseOverChangeUsername? {width: "130px", marginRight: "5px", height: "50px", borderColor: "#00BFFF", backgroundColor: "white", color: "black", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px"}: {width: "130px", marginRight: "5px", height: "50px", borderColor: "#00BFFF", backgroundColor: "#00BFFF", color: "white", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px"}} 
                            onClick={() => ((changeUserInfo === 1) ? setChangeUserInfo(0) : setChangeUserInfo(1))} 
                            onMouseOver={() => setMouseOverChangeUsername(true)} 
                            onMouseOut={() => setMouseOverChangeUsername(false)}>
                            修改用户名
                        </button>
                        <button 
                            style={mouseOverChangeEmail? {width: "130px", height: "50px", borderColor: "#00BFFF", backgroundColor: "white", color: "black", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px"}: {width: "130px", height: "50px", borderColor: "#00BFFF", backgroundColor: "#00BFFF", color: "white", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px"}} 
                            onClick={() => ((changeUserInfo === 2) ? setChangeUserInfo(0) : setChangeUserInfo(2))} 
                            onMouseOver={() => setMouseOverChangeEmail(true)} 
                            onMouseOut={() => setMouseOverChangeEmail(false)}>
                            修改邮箱
                        </button>
                        <button 
                            style={mouseOverChangePassword? {width: "130px", marginLeft: "5px", height: "50px", borderColor: "#00BFFF", backgroundColor: "white", color: "black", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px"}: {width: "130px", marginLeft: "5px", height: "50px", borderColor: "#00BFFF", backgroundColor: "#00BFFF", color: "white", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px"}} 
                            onClick={() => ((changeUserInfo === 3) ? setChangeUserInfo(0) : setChangeUserInfo(3))} 
                            onMouseOver={() => setMouseOverChangePassword(true)} 
                            onMouseOut={() => setMouseOverChangePassword(false)}>
                            修改密码
                        </button>
                    </div>
                    {changeUserInfo === 1 ? (
                        <div style={{ margin: "5px", display: "flex", flexDirection: "column", alignItems: "center"}}>
                            <input 
                                style={{ width: "400px", height: "50px", margin: "5px", borderRadius: "12px", borderColor: "#00BFFF"}} 
                                type="text" 
                                placeholder="请填写新用户名" 
                                value={newUsername} 
                                onChange={(e) => getNewUsername(e.target.value)}
                            />
                            <button 
                                style={ mouseOverSubmitUsername? { width: "200px", height: "50px", borderColor: "#00BFFF", backgroundColor: "white", color: "black", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px", margin: "5px"}: { width: "200px", height: "50px", borderColor: "#00BFFF", backgroundColor: "#00BFFF", color: "white", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px", margin: "5px"}} 
                                onClick={someFunction/*TODO:发送修改的用户名*/} 
                                onMouseOver={() => setMouseOverSubmitUsername(true)} 
                                onMouseOut={() => setMouseOverSubmitUsername(false)}>
                                确认修改用户名
                            </button>
                        </div>
                    ) : null}
                    {changeUserInfo === 2 ? (
                        <div style={{ margin: "5px", display: "flex", flexDirection: "column", alignItems: "center"}}>
                            <input 
                                style={{ width: "400px", height: "50px", margin: "5px", borderRadius: "12px", borderColor: "#00BFFF"}} 
                                type="text" 
                                placeholder="请填写新邮箱" 
                                value={newEmail} 
                                onChange={(e) => getNewEmail(e.target.value)}
                            />
                            <button 
                                style={ mouseOverSubmitEmail? { width: "200px", height: "50px", borderColor: "#00BFFF", backgroundColor: "white", color: "black", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px", margin: "5px"}: { width: "200px", height: "50px", borderColor: "#00BFFF", backgroundColor: "#00BFFF", color: "white", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px", margin: "5px"}} 
                                onClick={someFunction/*TODO:发送修改的邮箱*/} 
                                onMouseOver={() => setMouseOverSubmitEmail(true)} 
                                onMouseOut={() => setMouseOverSubmitEmail(false)}>
                                确认修改邮箱
                            </button>
                        </div>
                    ) : null}
                    {changeUserInfo === 3 ? (
                        <div style={{ margin: "5px", display: "flex", flexDirection: "column", alignItems: "center"}}>
                            <input 
                                style={{ width: "400px", height: "50px", margin: "5px", borderRadius: "12px", borderColor: "#00BFFF"}} 
                                type="text" 
                                placeholder="请填写旧密码" 
                                value={password} 
                                onChange={(e) => getPassword(e.target.value)}
                            />
                            <input 
                                style={{ width: "400px", height: "50px", margin: "5px", borderRadius: "12px", borderColor: "#00BFFF"}} 
                                type="text" 
                                placeholder="请填写新密码" 
                                value={newPassword} 
                                onChange={(e) => getNewPassword(e.target.value)}
                            />
                            <input 
                                style={{ width: "400px", height: "50px", margin: "5px", borderRadius: "12px", borderColor: "#00BFFF"}} 
                                type="text" 
                                placeholder="请再次填写新密码" 
                                value={verification} 
                                onChange={(e) => getVerification(e.target.value)}
                            />
                            <button 
                                style={ mouseOverSubmitPassword? { width: "200px", height: "50px", borderColor: "#00BFFF", backgroundColor: "white", color: "black", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px", margin: "5px"}: { width: "200px", height: "50px", borderColor: "#00BFFF", backgroundColor: "#00BFFF", color: "white", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px", margin: "5px"}} 
                                onClick={someFunction/*TODO:检测密码并发送*/} 
                                onMouseOver={() => setMouseOverSubmitPassword(true)} 
                                onMouseOut={() => setMouseOverSubmitPassword(false)}>
                                确认修改密码
                            </button>
                        </div>
                    ) : null}

                    <div style={{ width: "400px", height: "50px", margin: "5px", display: "flex", flexDirection: "row"}}>
                        <button 
                            style={mouseOverLogout? {width: "195px", marginRight: "5px", height: "50px", borderColor: "#00BFFF", backgroundColor: "white", color: "black", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px"}: {width: "195px", marginRight: "5px", height: "50px", borderColor: "#00BFFF", backgroundColor: "#00BFFF", color: "white", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px"}} 
                            onClick={someFunction/*TODO:登出*/} 
                            onMouseOver={() => setMouseOverLogout(true)} 
                            onMouseOut={() => setMouseOverLogout(false)}>
                            登出
                        </button>
                        <button 
                            style={mouseOverDeleteAccount? {width: "195px", marginLeft: "5px", height: "50px", borderColor: "#707070", backgroundColor: "#707070", color: "#FFFFFF", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px"}: {width: "195px", marginLeft: "5px", height: "50px", borderColor: "#989898", backgroundColor: "#989898", color: "#FFFFFF", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px"}} 
                            onClick={someFunction/*TODO:注销*/} 
                            onMouseOver={() => setMouseOverDeleteAccount(true)} 
                            onMouseOut={() => setMouseOverDeleteAccount(false)}>
                            注销账户
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );


};
export default UserManagementScreen;