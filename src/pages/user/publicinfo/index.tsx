import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { request } from "../../../utils/network";
import { message } from "antd";
import { FRIEND_REQUEST_SEND, FRIEND_DELETED, FRIEND_GROUP_ADDED } from "../../../constants/string";

interface PublicInfoProps{
    Username?: string,
}

const PublicInfoScreen = (props: PublicInfoProps) => {
    const router = useRouter();
    const query = router.query;
    const [isFriend, setIsFriend] = useState<boolean>(false);
    const [friendGroup, setFriendGroup] = useState<string>("");
    const [info, setInfo] = useState<string>("");
    
    const [mouseOverAdd, setMouseOverAdd] = useState<boolean>(false);
    const [mouseOverGroup, setMouseOverGroup] = useState<boolean>(false);
    const [mouseOverDelete, setMouseOverDelete] = useState<boolean>(false);
    const [mouseOverSubmit, setMouseOverSubmit] = useState<boolean>(false);

    const [box, setBox] = useState<number>(0);

    useEffect(() => {
        if(!router.isReady) {
            return;
        }

        checkFriend();
    }, [router, query]);


    const addFriend = () => {
        request(
            "/api/friend/addfriend",
            "CONNECT",
            {
                username: window.username,
                token: window.loginToken,
                friend_name: props.Username,
            },
        )
            .then(() => {
                message.success(FRIEND_REQUEST_SEND, 1);
            })
            .catch((err) => alert(err));
    };

    const deleteFriend = () => {
        request(
            "/api/friend/deletefriend",
            "DELETE",
            {
                username: window.username,
                token: window.loginToken,
                friend_name: props.Username,
            },
        )
            .then(() => {
                message.success(FRIEND_DELETED, 1);
            })
            .catch((err) => alert(err));
    };

    const checkFriend = () => {
        request(
            "api/friend/checkuser",
            "POST",
            {
                my_username: window.username,
                check_name: props.Username,
            },
        )
            .then((res) => {
                setIsFriend(res.isFriend);
            })
            .catch((err) => alert(err));
    };

    const addToGroup = () => {
        request(
            "api/friend/addfgroup",
            "PUT",
            {
                username: window.username,
                info: info,
                fgroup_name: friendGroup,
                friend_name: props.Username,
            },
        )
            .then((res) => {
                message.success(FRIEND_GROUP_ADDED, 1);
            })
            .catch((err) => alert(err));
    };

    return (
        <div style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, alignItems: "center", backgroundImage: "url(\"https://stu.cs.tsinghua.edu.cn/new/images/blur-light.jpg\")", backgroundSize: "1920px 1200px", backgroundPosition: "center", backgroundRepeat: "no-repeat"}}>
            <div style={{ display: "flex", justifyContent: "center ", alignItems: "center", position: "absolute", top: 0, bottom: 0, left: 0, right: 0, margin: "auto" }}>
                <div style={{ display: "flex", flexDirection: "column", paddingLeft: "150px", paddingRight: "150px", paddingTop: "5px", paddingBottom: "25px", border: "2px solid #00BFFF", borderRadius: "20px", alignItems: "center", backgroundColor: "rgba(255,255,255,0.7)"}}>
                    <h1>{props.Username}</h1>
                    {isFriend ? (
                        <div style={{ width: "400px", height: "50px", margin: "5px", display: "flex", flexDirection: "row"}}>
                            <button 
                                style={mouseOverGroup? {width: "195px", marginRight: "5px", height: "50px", borderColor: "#00BFFF", backgroundColor: "white", color: "black", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px"}: {width: "195px", marginRight: "5px", height: "50px", borderColor: "#00BFFF", backgroundColor: "#00BFFF", color: "white", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px"}} 
                                onClick={() => ((box === 1) ? setBox(0) : setBox(1))} 
                                onMouseOver={() => setMouseOverGroup(true)} 
                                onMouseOut={() => setMouseOverGroup(false)}>
                                添加至小组
                            </button>
                            <button 
                                style={mouseOverDelete? {width: "195px", marginLeft: "5px", height: "50px", borderColor: "#00BFFF", backgroundColor: "white", color: "black", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px"}: {width: "195px", marginLeft: "5px", height: "50px", borderColor: "#00BFFF", backgroundColor: "#00BFFF", color: "white", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px"}} 
                                onClick={() => (deleteFriend)} 
                                onMouseOver={() => setMouseOverDelete(true)} 
                                onMouseOut={() => setMouseOverDelete(false)}>
                                删除好友
                            </button>
                        </div>
                    
                    ) : (
                        <div style={{ width: "200px", height: "50px", margin: "5px", display: "flex", flexDirection: "row"}}>
                            <button 
                                style={mouseOverAdd? {width: "195px", marginRight: "5px", height: "50px", borderColor: "#00BFFF", backgroundColor: "white", color: "black", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px"}: {width: "195px", marginRight: "5px", height: "50px", borderColor: "#00BFFF", backgroundColor: "#00BFFF", color: "white", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px"}} 
                                onClick={() => (addFriend)} 
                                onMouseOver={() => setMouseOverAdd(true)} 
                                onMouseOut={() => setMouseOverAdd(false)}>
                                添加好友
                            </button>
                        </div>
                    )}
                    {box === 1 ? (
                        <div style={{ margin: "5px", display: "flex", flexDirection: "column", alignItems: "center"}}>
                            <input 
                                style={{ width: "400px", height: "50px", margin: "5px", borderRadius: "12px", borderColor: "#00BFFF"}} 
                                type="text" 
                                placeholder="请填写小组名" 
                                value={friendGroup} 
                                onChange={(e) => setFriendGroup(e.target.value)}
                            />
                            <input 
                                style={{ width: "400px", height: "50px", margin: "5px", borderRadius: "12px", borderColor: "#00BFFF"}} 
                                type="text" 
                                placeholder="请填写备注" 
                                value={info} 
                                onChange={(e) => setInfo(e.target.value)}
                            />
                            <button 
                                style={ mouseOverSubmit? { width: "200px", height: "50px", borderColor: "#00BFFF", backgroundColor: "white", color: "black", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px", margin: "5px"}: { width: "200px", height: "50px", borderColor: "#00BFFF", backgroundColor: "#00BFFF", color: "white", transitionDuration: "0.4s", cursor: "pointer", borderRadius: "12px", margin: "5px"}} 
                                onClick={addToGroup} 
                                onMouseOver={() => setMouseOverSubmit(true)} 
                                onMouseOut={() => setMouseOverSubmit(false)}>
                                确认添加至小组
                            </button>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default PublicInfoScreen;