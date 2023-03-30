import { useRouter } from "next/router";
import { useState } from "react";
import { USERNAME_CHANGE_SUCCESS, EMAIL_CHANGE_SUCCESS, PASSWORD_CHANGE_SUCCESS, ISEMPTY, PASSWORD_INCONSISTANT, ILLEGAL } from "../../constants/string";
import { VALID, VALID_EMAIL, EMPTY, INVALID, LENGTH } from "../../constants/constants";
import { request } from "../../utils/network";
import { message } from "antd";
import { isValid } from "..";

//用户管理界面

interface UserScreenProps{
    Username?: string,
}

const UserManagementScreen = (props: UserScreenProps) => {
    const router = useRouter();
    const [username, getUsername] = useState<string>(props.Username ?? "");
    const [newUsername, getNewUsername] = useState<string>("");
    //const [email, getEmail] = useState<string>("");
    //const [newEmail, getNewEmail] = useState<string>("");
    const [password, getPassword] = useState<string>("");
    const [newPassword, getNewPassword] = useState<string>("");
    const [verification, getVerification] = useState<string>("");

    //const [mouseOverEmail, setMouseOverEmail] = useState<boolean>(false);
    //const [mouseOverNewEmail, setMouseOverNewEmail] = useState<boolean>(false);

    const [mouseOverChangeUsername, setMouseOverChangeUsername] = useState<boolean>(false);
    //const [mouseOverChangeEmail, setMouseOverChangeEmail] = useState<boolean>(false);
    const [mouseOverChangePassword, setMouseOverChangePassword] = useState<boolean>(false);

    const [mouseOverSubmitUsername, setMouseOverSubmitUsername] = useState<boolean>(false);
    //const [mouseOverSubmitEmail, setMouseOverSubmitEmail] = useState<boolean>(false);
    const [mouseOverSubmitPassword, setMouseOverSubmitPassword] = useState<boolean>(false);

    const [mouseOverLogout, setMouseOverLogout] = useState<boolean>(false);
    const [mouseOverDeleteAccount, setMouseOverDeleteAccount] = useState<boolean>(false);

    const [mouseOverConfirmDelete, setMouseOverConfirmDelete] = useState<boolean>(false);

    const [changeUserInfo, setChangeUserInfo] = useState<number>(0);  //0=不修改，1=修改用户名，2=修改邮箱，3=修改密码，4=绑定邮箱，6=注销

    //const someFunction = () => {};

    /*const bindEmail = () => {
        request(
            "/api/email",
            "POST",
            {
                email: email,
            },
        )
    };*/

    const changeUsername = () => {
        request(
            "/api/revise",
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
            .catch((err) => alert(err));
    };
    /*const changeEmail = () => {
        request(
            "/api/revise",
            "PUT",
            {
                revise_field: "email",
                revise_content: newEmail,
                username: props.Username,
                input_password: password,
                token: window.loginToken,
            },
        )
            .then(() => message.success(EMAIL_CHANGE_SUCCESS, 1))
            .catch((err) => alert(err));
    };*/
    const verifyPassword = () => {
        if (isValid(verification) === VALID){
            if (verification === newPassword){
                changePassword();
            }
            else{
                message.warning(PASSWORD_INCONSISTANT, 1);
            } 
        }
        else if(isValid(verification) === EMPTY){
            message.warning(ISEMPTY, 1);
        }
        else{
            message.error(ILLEGAL, 1);
        }
    };
    const changePassword = () => {
        request(
            "/api/revise",
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
            .catch((err) => alert(err));
    };

    const logout = () => {
        request(
            "/api/logout",
            "DELETE",
            {
                token: window.loginToken,
                username: props.Username,
            },
        )
            .then(() => router.push("/"))
            .catch((err) => alert(err));
    };

    const deleteUser = () => {
        request(
            "/api/cancel",
            "DELETE",
            {
                username: props.Username,
                input_password: password,
            },
        )
            .then(() => router.push("/"))
            .catch((err) => alert(err));
    };

    return (
        <div style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, alignItems: "center", backgroundImage: "url(\"https://stu.cs.tsinghua.edu.cn/new/images/blur-light.jpg\")", backgroundSize: "1920px 1200px", backgroundPosition: "center", backgroundRepeat: "no-repeat"}}>
            <div style={{ display: "flex", justifyContent: "center ", alignItems: "center", position: "absolute", top: 0, bottom: 0, left: 0, right: 0, margin: "auto" }}>
                <div style={{ display: "flex", flexDirection: "column", paddingLeft: "150px", paddingRight: "150px", paddingTop: "5px", paddingBottom: "25px", border: "2px solid #00BFFF", borderRadius: "20px", alignItems: "center", backgroundColor: "rgba(255,255,255,0.7)"}}>
                    <h1>用户管理</h1>
                    {props.Username? (<h3>当前用户：{username}</h3>): null}
                    <div style={{ width: "400px", height: "50px", margin: "5px", display: "flex", flexDirection: "row"}}>
                        <button 
                            style={mouseOverChangeUsername? {width: "195px", marginRight: "5px", height: "50px", borderColor: "#00BFFF", backgroundColor: "white", color: "black", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px"}: {width: "195px", marginRight: "5px", height: "50px", borderColor: "#00BFFF", backgroundColor: "#00BFFF", color: "white", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px"}} 
                            onClick={() => ((changeUserInfo === 1) ? setChangeUserInfo(0) : setChangeUserInfo(1))} 
                            onMouseOver={() => setMouseOverChangeUsername(true)} 
                            onMouseOut={() => setMouseOverChangeUsername(false)}>
                            修改用户名
                        </button>
                        <button 
                            style={mouseOverChangePassword? {width: "195px", marginLeft: "5px", height: "50px", borderColor: "#00BFFF", backgroundColor: "white", color: "black", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px"}: {width: "195px", marginLeft: "5px", height: "50px", borderColor: "#00BFFF", backgroundColor: "#00BFFF", color: "white", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px"}} 
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
                            <input 
                                style={{ width: "400px", height: "50px", margin: "5px", borderRadius: "12px", borderColor: "#00BFFF"}} 
                                type="text" 
                                placeholder="请填写密码" 
                                value={password} 
                                onChange={(e) => getPassword(e.target.value)}
                            />
                            <button 
                                style={ mouseOverSubmitUsername? { width: "200px", height: "50px", borderColor: "#00BFFF", backgroundColor: "white", color: "black", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px", margin: "5px"}: { width: "200px", height: "50px", borderColor: "#00BFFF", backgroundColor: "#00BFFF", color: "white", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px", margin: "5px"}} 
                                onClick={changeUsername} 
                                onMouseOver={() => setMouseOverSubmitUsername(true)} 
                                onMouseOut={() => setMouseOverSubmitUsername(false)}>
                                确认修改用户名
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
                                onClick={verifyPassword} 
                                onMouseOver={() => setMouseOverSubmitPassword(true)} 
                                onMouseOut={() => setMouseOverSubmitPassword(false)}>
                                确认修改密码
                            </button>
                        </div>
                    ) : null}
                    {changeUserInfo === 6 ? (
                        <div style={{ margin: "5px", display: "flex", flexDirection: "column", alignItems: "center"}}>
                            <input 
                                style={{ width: "400px", height: "50px", margin: "5px", borderRadius: "12px", borderColor: "#00BFFF"}} 
                                type="text" 
                                placeholder="请填写密码" 
                                value={password} 
                                onChange={(e) => getPassword(e.target.value)}
                            />
                            <button 
                                style={ mouseOverConfirmDelete? { width: "200px", height: "50px", borderColor: "#00BFFF", backgroundColor: "white", color: "black", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px", margin: "5px"}: { width: "200px", height: "50px", borderColor: "#00BFFF", backgroundColor: "#00BFFF", color: "white", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px", margin: "5px"}} 
                                onClick={deleteUser} 
                                onMouseOver={() => setMouseOverConfirmDelete(true)} 
                                onMouseOut={() => setMouseOverConfirmDelete(false)}>
                                确认注销
                            </button>
                        </div>
                    ) : null}
                    <div style={{ width: "400px", height: "50px", margin: "5px", display: "flex", flexDirection: "row"}}>
                        <button 
                            style={mouseOverLogout? {width: "195px", marginRight: "5px", height: "50px", borderColor: "#00BFFF", backgroundColor: "white", color: "black", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px"}: {width: "195px", marginRight: "5px", height: "50px", borderColor: "#00BFFF", backgroundColor: "#00BFFF", color: "white", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px"}} 
                            onClick={logout} 
                            onMouseOver={() => setMouseOverLogout(true)} 
                            onMouseOut={() => setMouseOverLogout(false)}>
                            登出
                        </button>
                        <button 
                            style={mouseOverDeleteAccount? {width: "195px", marginLeft: "5px", height: "50px", borderColor: "#707070", backgroundColor: "#707070", color: "#FFFFFF", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px"}: {width: "195px", marginLeft: "5px", height: "50px", borderColor: "#989898", backgroundColor: "#989898", color: "#FFFFFF", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px"}} 
                            onClick={() => ((changeUserInfo === 6) ? setChangeUserInfo(0) : setChangeUserInfo(6))} 
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