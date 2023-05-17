import React, {useEffect, useRef, useState } from "react";
import * as STRINGS from "../constants/string";
import { request } from "../utils/network";
import { message, Input, Button, Space, Layout, List, Menu, Spin, Badge, Avatar, Popover, Card, Divider, Row, Col, Modal, TreeSelect, Image} from "antd";
import { ArrowRightOutlined, LockOutlined, LoginOutlined, UserOutlined, ContactsOutlined, UserAddOutlined, ArrowLeftOutlined, MessageOutlined, SettingOutlined, UsergroupAddOutlined, MailOutlined, SearchOutlined, CommentOutlined, EllipsisOutlined, SmileOutlined } from "@ant-design/icons";
import * as CONS from "../constants/constants";
import moment from "moment";
import TextArea from "antd/lib/input/TextArea";
import { Player, ControlBar, ReplayControl, ForwardControl, CurrentTimeDisplay, TimeDivider, PlaybackRateMenuButton, VolumeMenuButton } from "video-react";
import emojiList from "../components/emojiList";
import axios, { AxiosError, AxiosResponse } from "axios";
import $ from "jquery";
import "video-react/dist/video-react.css";

interface friendListData {
    groupname: string;
    username: string[];
}

interface userData {
    username: string;
}

interface receiveData {
    username: string;
    is_confirmed: boolean;
    make_sure: boolean;
}

interface roomListData {
    roomname: string;
    roomid: number;
    is_notice: boolean;
    is_top: boolean;
    is_private: boolean;
    message_list: messageListData[];
}

// 本地存储消息列表
interface messageListData {
    msg_id: number;
    msg_type: string;
    msg_body: string;
    msg_time: string;
    sender: string;
    avatar: string;
}

interface roomInfoData {
    mem_list: string[];
    manager_list: string[];
    master: string;
    mem_count: number;
}

const { SHOW_PARENT } = TreeSelect;

export const isEmail = (val : string) => {
    //仅保留是否为邮件的判断，其余交给后端
    return /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/i.test(val);
};


//登录界面
const Screen = () => {
    const [account, getAccount] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [password, getPassword] = useState<string>("");
    const [verification,getVerification] = useState<string>("");

    const [email, setEmail] = useState<string>("");
    const [sms, setSms] = useState<string>("");

    const [currentPage, setCurrentPage] = useState<number>(CONS.LOGIN);
    const [menuItem, setMenuItem] = useState<number>(CONS.EMPTY);
    const [addressItem, setAddressItem] = useState<number>(CONS.EMPTY);

    const [token, setToken] = useState<number>(0);

    const {Content, Sider } = Layout;
    const [collapsed, setCollapsed] = useState(false);

    const [newUsername, getNewUsername] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [changeUserInfo, setChangeUserInfo] = useState<number>(0);

    const [searchRefreshing, setSearchRefreshing] = useState<boolean>(false);
    const [searchList, setSearchList] = useState<userData[]>([]);
    const [searchName, setSearchName] = useState<string>("");

    const [receiveList, setReceiveList] = useState<receiveData[]>([]);
    const [receiveRefreshing, setReceiveRefreshing] = useState<boolean>(false);

    const [applyList, setApplyList] = useState<receiveData[]>([]);
    const [applyRefreshing, setApplyRefreshing] = useState<boolean>(false);

    const [friendListRefreshing, setFriendListRefreshing] = useState<boolean>(true);
    const [friendList, setFriendList] = useState<friendListData[]>([]);

    const [roomList, setRoomList] = useState<roomListData[]>([]);
    const [roomListRefreshing, setRoomListRefreshing] = useState<boolean>(true);

    const [messageList, setMessageList] = useState<messageListData[]>([]);
    const [messageBody, setMessageBody] = useState<string>("");

    const [roomInfo, setRoomInfo] = useState<roomInfoData>({mem_list: [], master: "", manager_list: [], mem_count: 0});
    const [roomTop, setRoomTop] = useState<boolean>(false);
    const [roomNotice, setRoomNotice] = useState<boolean>(true);
    const [roomPrivate, setRoomPrivate] = useState<boolean>(true);

    const [isFriend, setIsFriend] = useState<boolean>(false);
    const [friendGroup, setFriendGroup] = useState<string>("");
    const [box, setBox] = useState<number>(0);

    const [newGroupModal, setNewGroupModal] = useState<boolean>(false);
    const [newGroupName, setNewGroupName] = useState<string>("");
    const [newGroupMemberList, setNewGroupMemberList] = useState<string[]>([]);

    const [replyMessageID, setReplyMessageID] = useState<number>(-1);
    const [replyMessageBody, setReplyMessageBody] = useState<string>("");
    const [replying, setReplying] = useState<boolean>(false);

    const [translateModal, setTranslateModal] = useState<boolean>(false);
    const [translateResult, setTranslateResult] = useState<string>("");

    const [forwardModal, setForwardModal] = useState<boolean>(false);

    const [avatarModal, setAvatarModal] = useState<boolean>(false);
    const [imageModal, setImageModal] = useState<boolean>(false);
    const [videoModal, setVideoModal] = useState<boolean>(false);
    const [fileModal, setFileModal] = useState<boolean>(false);


    const avatarF = useRef<HTMLFormElement>(null);
    const imageF = useRef<HTMLFormElement>(null);
    const videoF = useRef<HTMLFormElement>(null);
    const fileF = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if(currentPage === CONS.MAIN)
        {
            if(menuItem === CONS.ADDRESSBOOK) {
                fetchFriendList();
            }
            if(menuItem === CONS.CHATFRAME) {
                fetchRoomList();
            }
        }
    }, [currentPage, menuItem]);

    const WSConnect = () => {
        let DEBUG = false;
        window.ws = new WebSocket(DEBUG ? "ws://localhost:8000/wsconnect" : "wss://se-im-backend-overflowlab.app.secoder.net/wsconnect");
        window.ws.onopen = function () {
            setMenuItem(CONS.CHATFRAME);
            let data = {
                "function": "add_channel",
                "username": window.username
            };
            window.ws.send(JSON.stringify(data));
            WSHeartBeat();
        };
        window.ws.onclose = function () {
            WSOnclose();
        };
        window.ws.onerror = function () {
            WSOnerror();
        };
        window.ws.onmessage = async function (event) {
            const data = JSON.parse(event.data);
            console.log(JSON.stringify(data));
            if (data.function === "heartbeatconfirm") {
                WSHeartBeat();
            }
            else if (data.function === "receivelist") {
                setReceiveList(data.receivelist.map((val: any) =>({...val})));
                setReceiveRefreshing(false);
            }
            else if (data.function === "applylist") {
                setApplyList(data.applylist.map((val: any) => ({...val})));
                setApplyRefreshing(false);
            }
            else if (data.function === "friendlist") {
                setFriendList(data.friendlist.map((val: any) => ({...val})));
                setFriendListRefreshing(false);
            }
            else if (data.function === "fetchroom") {
                setRoomList(((data.roomlist.filter((val: any) => val.is_top)).concat(data.roomlist.filter((val: any) => !val.is_top)).map((val: any) => ({...val}))));
                setRoomListRefreshing(false);
                console.log(roomList);
            }
            // 会话具体信息， 包括成员列表，管理员等
            else if (data.function === "fetchroominfo"){
                let info = {
                    mem_list: data.mem_list,
                    manager_list: data.manager_list,
                    master: data.master,
                    mem_count: data.mem_count
                };
                setRoomInfo(info);
            }
            else if (data.function === "Ack2"){
                // 将消息id置为已发送
                let last = messageList.pop();
                if (last) {
                    last.msg_id = data.msg_id;
                    messageList.push(last);
                }
            }
            else if (data.function === "Msg"){
                let newMessage = {
                    msg_id: data.msg_id,
                    msg_type: data.msg_type,
                    msg_body: data.msg_body,
                    msg_time: data.msg_time,
                    sender: data.sender,
                    avatar: data.avatar
                };
                console.log("msg_data:", data);
                if (data.room_id === window.currentRoomID){
                    if (data.sender != window.username) {
                        setMessageList(messageList => messageList.concat(newMessage));
                        console.log("message:", messageList);
                    }
                }
                else{
                    for (let room of roomList){
                        if (room.roomid === data.room_id){
                            console.log("修改前：", room.message_list);
                            room.message_list.push(newMessage);
                            console.log("修改后：", room.message_list);
                        }
                    }
                }
                let ACK = {
                    "function": "acknowledge_message",
                    "is_back": false,
                    "room_id": data.room_id,
                    "count": 1
                };
                window.ws.send(JSON.stringify(ACK));
            }
            else if (data.function === "withdraw") {
                data.msg_id;
                var temp = messageList;
                temp.forEach((val) => {
                    if(val.msg_id === data.msg_id){
                        val.msg_body = "该消息已被撤回";
                    }
                });
                setMessageList(temp);
                //todo something
            }
            else {
                return;
            }
        };
    };

    const WSOnerror = () => {
        console.log("Websocket断开");
        console.log("error重接");
        WSConnect();
    };

    const WSOnclose = () => {
        console.log("Websocket断开连接");
        if (window.heartBeat) {
            console.log("close重接");
            WSConnect();
        }
    };

    const WSHeartBeat = () => {
        clearInterval(window.timeoutObj);
        clearTimeout(window.serverTimeoutObj);
        window.timeoutObj = setInterval(() => {
            const data = {
                "function": "heartbeat",
            };
            window.ws.send(JSON.stringify(data));
            window.serverTimeoutObj = setTimeout(() => {
                window.heartBeat = true;
                console.log("服务器宕机中");
                window.ws.close();
            }, 2000);
        }, 10000);
    };

    const WSClose = () => {
        window.heartBeat = false;
        console.log("关闭");
        if (window.ws) {
            window.ws.close();
        }
        clearInterval(window.timeoutObj);
        clearTimeout(window.serverTimeoutObj);
    };

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
                    message.success(STRINGS.LOGIN_SUCCESS, 1);
                    window.username = res.username;
                    window.userAvatar = res.avatar;
                    setUsername(res.username);
                    setToken(res.token);
                    setCurrentPage(CONS.MAIN);
                    WSConnect();
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
                    message.success(STRINGS.LOGIN_SUCCESS, 1);
                    setToken(res.token);
                    window.username = res.username;
                    window.userAvatar = res.avatar;
                    setUsername(res.username);
                    setCurrentPage(CONS.MAIN);
                    WSConnect();
                })
                .catch((err) => {
                    message.error(err.message, 1);
                });
        }
    };

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
                message.success(STRINGS.REGISTER_SUCCESS, 1);
                setCurrentPage(CONS.LOGIN);
                getPassword("");
            })
            .catch((err) => message.error(err.message, 1));
    };

    const verifyPassword = () => {
        if (verification === password){
            if (currentPage === CONS.REGISTER) {
                register();
            }
            if (currentPage === CONS.MAIN && menuItem === CONS.SETTINGS) {
                changePassword();
            }
        }
        else{
            message.warning(STRINGS.PASSWORD_INCONSISTENT, 1);
        }
    };

    const deleteGroup = (group:string) => {
        request(
            "/api/friend/deletefgroup",
            "DELETE",
            {
                token: token,
                fgroup_name: group,
                username: username,
            }
        )
            .then(() => fetchFriendList())
            .catch((err) => message.error(err.message, 1));
    };

    const changeUsername = () => {
        request(
            "/api/user/revise",
            "PUT",
            {
                revise_field: "username",
                revise_content: newUsername,
                username: username,
                input_password: password,
                token: token,
            },
        )
            .then(() => {
                message.success(STRINGS.USERNAME_CHANGE_SUCCESS, 1);
                window.username = newUsername;
            })
            .catch((err) => message.error(err.message, 1));
    };

    const sendEmail = () => {
        request(
            "/api/user/send_email",
            "POST",
            {
                email: email,
            },
        )
            .then(() => message.success("发送成功", 1))
            .catch((err) => message.error(err.message, 1));
    };

    const verifySms = ()=>{
        request(
            "/api/user/email",
            "POST",
            {
                code: sms,
                email: email,
                username: username,
            },
        )
            .then(() => message.success("验证通过", 1))
            .catch(() => message.error("验证失败", 1));
    };

    const changePassword = () => {
        request(
            "/api/user/revise",
            "PUT",
            {
                revise_field: "password",
                revise_content: newPassword,
                username: username,
                input_password: password,
                token: token,
            },
        )
            .then(() => message.success(STRINGS.PASSWORD_CHANGE_SUCCESS, 1))
            .catch((err) => message.error(err.message, 1));
    };

    const logout = () => {
        request(
            "/api/user/logout",
            "DELETE",
            {
                token: token,
                username: username,
            },
        )
            .then(() => {
                setCurrentPage(CONS.LOGIN);
                WSClose();
            })
            .catch((err) => message.error(err.message, 1));
    };

    const deleteUser = () => {
        request(
            "/api/user/cancel",
            "DELETE",
            {
                username: username,
                input_password: password,
            },
        )
            .then(() => {setCurrentPage(CONS.LOGIN); WSClose();})
            .catch((err) => message.error(err.message, 1));
    };

    const search = () => {
        if(searchName === "") {
            message.error("搜索的用户名不能为空", 1);
        }
        else {
            setSearchRefreshing(true);
            request(
                "/api/friend/searchuser",
                "POST",
                {
                    my_username: username,
                    search_username: searchName,
                }
            )
                .then((res) => {
                    setSearchList(res.search_user_list.map((val: any) =>({username: val})));
                    setSearchRefreshing(false);
                })
                .catch((err) => {
                    message.error(err.message, 1);
                    setSearchRefreshing(false);
                });
        }
    };

    const accept = (other: string) => {
        const data = {
            "function": "confirm",
            "from": other,
            "to": username,
            "username": username,
        };
        window.ws.send(JSON.stringify(data));
        message.success("已同意申请", 1);
    };

    const decline = (other: string) => {
        const data = {
            "function": "decline",
            "from": other,
            "to": username,
            "username": username,
        };
        window.ws.send(JSON.stringify(data));
    };

    const addFriend = () => {
        const data = {
            "function": "apply",
            "from": username,
            "to": window.otherUsername,
            "username": username
        };
        window.ws.send(JSON.stringify(data));
        message.success("申请已发送", 1);
    };

    const deleteFriend = () => {
        request(
            "/api/friend/deletefriend",
            "DELETE",
            {
                username: username,
                token: token,
                friend_name: window.otherUsername,
            },
        )
            .then(() => {
                message.success(STRINGS.FRIEND_DELETED, 1);
                fetchFriendList();
                setAddressItem(CONS.EMPTY);
            })
            .catch((err) => message.error(err.message, 1));
    };

    const checkFriend = () => {
        console.log("checking" + window.otherUsername);
        request(
            "api/friend/checkuser",
            "POST",
            {
                my_username: username,
                check_name: window.otherUsername,
                token: token
            },
        )
            .then((res) => {
                setIsFriend(res.is_friend);
                setAddressItem(CONS.PUBLICINFO);
            })
            .catch((err) => console.log(err));
    };

    const addToGroup = () => {
        let flag = 0;
        friendList.forEach((arr) => {
            if (arr.groupname === friendGroup){
                flag = 1;
                return;
            }
        });
        // 若不存在则创建
        if (flag === 0){
            request(
                "api/friend/createfgroup",
                "POST",
                {
                    username: username,
                    token: token,
                    fgroup_name: friendGroup,
                },
            )
                .then(() => message.success("成功新建分组", 1))
                .catch((err) => message.error(err.message, 1));
        }
        request(
            "api/friend/addfgroup",
            "PUT",
            {
                token: token,
                username: username,
                fgroup_name: friendGroup,
                friend_name: window.otherUsername,
            },
        )
            .then(() => message.success(STRINGS.FRIEND_GROUP_ADDED, 1))
            .catch((err) => message.error(err.message, 1));
    };

    const fetchFriendList = () => {
        setFriendListRefreshing(true);
        const data = {
            "function": "fetchfriendlist",
            "username": window.username
        };
        console.log(data);
        window.ws.send(JSON.stringify(data));
    };

    const fetchReceiveList = () => {
        setReceiveRefreshing(true);
        const data = {
            "function": "fetchreceivelist",
            "username": window.username
        };
        window.ws.send(JSON.stringify(data));
    };

    const fetchApplyList = () => {
        setApplyRefreshing(true);
        const data = {
            "function": "fetchapplylist",
            "username": window.username
        };
        window.ws.send(JSON.stringify(data));
    };

    const fetchRoomList = () => {
        console.log("发送fetchroom请求");
        setRoomListRefreshing(true);
        const data = {
            "function": "fetch_room",
            "username": window.username,
        };
        window.ws.send(JSON.stringify(data));
    };
    const addRoom = (ID: number, Name: string) => {
        let data = {
            "function": "add_chat",
            "room_name": Name,
            "room_id": ID
        };
        window.ws.send(JSON.stringify(data));
    };
    const sendMessage = () => {
        if (messageBody != ""){
            const data = {
                "function": "send_message",
                "msg_type": "text",
                "msg_body": messageBody
            };
            window.ws.send(JSON.stringify(data));

            const date = new Date();
            const newMessage = {
                // 在收到ACK前暂置为-1， 判断对方是否收到可用-1判断
                "msg_id": -1,
                "msg_type": "text",
                "msg_body": messageBody,
                "msg_time": moment(date).format("YYYY-MM-DD HH:mm:ss"),
                "sender": window.username,
                "avatar": window.userAvatar,
            };
            setMessageList(messageList => messageList.concat(newMessage));
            console.log(messageList);
        }
        else {
            message.error("消息不能为空", 1);
        }
    };

    const sendFile = (type: string, url: string) => {
        if (url != ""){
            const data = {
                "function": "send_message",
                "msg_type": type,
                "msg_body": url
            };
            window.ws.send(JSON.stringify(data));

            const date = new Date();
            const newMessage = {
                // 在收到ACK前暂置为-1， 判断对方是否收到可用-1判断
                "msg_id": -1,
                "msg_type": type,
                "msg_body": url,
                "msg_time": moment(date).format("YYYY-MM-DD HH:mm:ss"),
                "sender": window.username,
                "avatar": window.userAvatar,
            };
            setMessageList(messageList => messageList.concat(newMessage));
            console.log(messageList);
        }
        else {
            message.error("发送错误", 1);
        }
    };

    const fetchRoomInfo = (ID: number) => {
        let data = {
            "function": "fetch_roominfo",
            "roomid": ID,
        };
        window.ws.send(JSON.stringify(data));
    };

    const setTop = (set: boolean) => {
        console.log("将置顶状态设置为" + set);
        const data = {
            "function": "revise_is_top",
            "chatroom_id": window.currentRoomID,
            "is_top": set,
        };
        window.ws.send(JSON.stringify(data));
    };

    const setNotice = (set: boolean) => {
        console.log("将免打扰设置为" + !set);
        const data = {
            "function": "revise_is_notice",
            "chatroom_id": window.currentRoomID,
            "is_notice": set,
        };
        window.ws.send(JSON.stringify(data));
    };

    const memberChange = (newValue: string[]) => {
        console.log("member change", newGroupMemberList);
        setNewGroupMemberList(newValue);
    };


    const appendEmoji = (item: string) => {
        console.log(item);
        setMessageBody(messageBody + item);
    };

    const newGroup = () => {
        var temp = newGroupMemberList;
        console.log(temp);
        temp.push(window.username);
        console.log(temp);
        setNewGroupMemberList((newGroupMemberList) => temp);
        console.log(newGroupMemberList);
        const data = {
            "function": "create_group",
            "member_list": newGroupMemberList,
            "room_name": newGroupName,
        };
        window.ws.send(JSON.stringify(data));
        setNewGroupModal(false);
    };

    const leaveChatGroup = () => {
        const data = {
            "function": "leave_chatgroup",
            "chatroom_id": window.currentRoomID,
        };
        window.ws.send(JSON.stringify(data));
    };

    const deleteChatGroup = () => {
        const data = {
            "function": "delete_chatgroup",
            "chatroom_id": window.currentRoomID,
        };
        window.ws.send(JSON.stringify(data));
    };

    const recall = (id: number) => {
        console.log("撤回id:" + id);
        const data = {
            "function": "withdraw_message",
            "msg_id": id,
        };
        console.log(JSON.stringify(data));
        window.ws.send(JSON.stringify(data));
    };

    const reply = (id: number) => {
        const data = {
            "function": "something",
            //按照发信息，
        };
    };

    const translateconfig = {
        headers:{
            "Access-Control-Allow-Origin": "*"
        }
    };

    const avatarconfig = {
        headers:{
            "Content-Type": "multipart/form-data"
        }
    };

    const translate = (message: string) =>{
        axios.post(`/translate/${"translate?&doctype=json&type=AUTO&i="+message}`,{}, translateconfig)
            .then((res) => {
                console.log(res);
                setTranslateResult(res.data.translateResult[0][0].tgt);
                setTranslateModal(true);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const forward = () => {
        //单条直接重新发
        /*{
            "function": "send_message"
            "msg_type": "combine"
            "combine_list": id列表
            "transroom_list": id列表
        } */
    };


    //会话具体信息
    //todo
    const roomInfoPage = (
        <div style={{padding: "12px", flexDirection: "column"}}>
            <Space>
                <Space.Compact style={{ width: "80%" }}>
                    <Input
                        type="text"
                        placeholder="请填写用户名"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                    />
                    <Button type="primary" onClick={search} icon={<SearchOutlined />}/>
                </Space.Compact>
                <List
                    grid={{gutter: 16} }
                    dataSource={roomInfo.mem_list}
                    renderItem={(item) => (
                        <List.Item>
                            <Popover placement={"rightBottom"} content={"这里是点击成员后的弹出卡片，应当显示publicInfo"}>
                                <Card cover={"头像"}>
                                    {"用户名"}
                                </Card>
                            </Popover>
                        </List.Item>
                    )}
                />
                <Divider/>
                <Card title={"群聊名称"}>
                    { "" }
                    {roomNotice ? (
                        <Button type="primary" onClick={() => setNotice(false)}> 设置免打扰 </Button>
                    ) : (
                        <Button type="primary" onClick={() => setNotice(true)}> 取消免打扰 </Button>
                    )}
                    {roomTop ? (
                        <Button type="primary" onClick={() => setTop(false)}> 取消置顶 </Button>
                    ) : (
                        <Button type="primary" onClick={() => setTop(true)}> 设置置顶 </Button>
                    )}
                    <Button type="primary" onClick={() => leaveChatGroup()}> 离开群聊 </Button>
                    <Button type="primary" onClick={() => deleteChatGroup()}> 解散群 </Button>
                </Card>
            </Space>
        </div>
    );

    const logReturn = () => {
        $("#loader").load(function() {
            var text = $("#loader").contents().find("body").text();
            var j = $.JSON.parse(text);
            console.log(j);
        });
    };

    return (
        <div style={{
            width: "100%", height: "100%", position: "absolute", top: 0, left: 0, alignItems: "center",
            backgroundImage: "url(\"https://stu.cs.tsinghua.edu.cn/new/images/blur-light.jpg\")",
            backgroundSize: "1920px 1200px", backgroundPosition: "center", backgroundRepeat: "no-repeat"
        }}>
            <div>
                {currentPage === CONS.LOGIN ? (
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
                            <br/>
                            <Input.Password size="large"
                                type="text"
                                maxLength={50}
                                placeholder="请填写密码"
                                prefix={<LockOutlined />}
                                value={password}
                                onChange={(e) => getPassword(e.target.value)}
                            />
                            <br/>
                            <div style={{
                                width: "400px", height: "50px", margin: "5px", display: "flex", flexDirection: "row"
                            }}>
                                <Space size={150}>
                                    <Button type={"primary"} size={"large"} shape={"round"} icon={<LoginOutlined />}
                                        onClick={() => login()}>
                                        登录
                                    </Button>
                                    <Button type={"default"} size={"large"} shape={"round"} icon={<ArrowRightOutlined />}
                                        onClick={() => setCurrentPage(CONS.REGISTER)}>
                                        注册新账户
                                    </Button>
                                </Space>
                            </div>
                        </div>
                    </div>
                ) : null}


                {currentPage === CONS.REGISTER ? (
                    <div style={{
                        display: "flex", flexDirection: "column", justifyContent: "center ", alignItems: "center", position: "absolute",
                        top: 0, bottom: 0, left: 0, right: 0, margin: "auto"
                    }}>
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
                                onChange={(e) => setUsername(e.target.value)}
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
                            <Input.Password size="large"
                                maxLength={50}
                                type="text" 
                                placeholder="请确认密码"
                                prefix={<ContactsOutlined />}
                                value={verification}
                                onChange={(e) => getVerification(e.target.value)}
                            />
                            <br />
                            <Button type={"primary"} shape={"round"} icon={<UserAddOutlined />} size={"large"}
                                onClick={()=>{verifyPassword(); }}>
                                    注册账户
                            </Button>
                            <br />
                            <Button type={"link"} icon={<ArrowLeftOutlined/>} size={"large"}
                                onClick={() => setCurrentPage(CONS.LOGIN)}>
                                    返回登录
                            </Button>
                        </div>
                    </div>
                ) : null}


                {currentPage === CONS.MAIN ? (
                    <div>
                        <Layout style={{ minHeight: "100vh" }}>
                            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                                <Menu theme={"dark"} defaultSelectedKeys={["1"]} mode="inline">
                                    <Menu.Item title={"聊天"} icon={<MessageOutlined/>} key={"1"} onClick={()=> setMenuItem(CONS.CHATFRAME)}> 聊天 </Menu.Item>

                                    <Menu.Item title={"通讯录"} icon={<UsergroupAddOutlined />} key={"2"} onClick={()=> setMenuItem(CONS.ADDRESSBOOK)}> 通讯录 </Menu.Item>

                                    <Menu.Item title={"设置"} icon={<SettingOutlined />} key={"3"} onClick={()=> setMenuItem(CONS.SETTINGS)}> 设置 </Menu.Item>
                                </Menu>
                            </Sider>

                            <Content className="site-layout">
                                { /*聊天组件*/}
                                {menuItem === CONS.CHATFRAME ? (
                                    <div style={{ display: "flex", flexDirection: "row" }}>
                                        <div style={{ padding: "0 24px", backgroundColor:"#FAF0E6",  width:"20%", minHeight:"100vh" }}>
                                            <h3> 会话列表 </h3>
                                            {roomListRefreshing ? (
                                                <Spin />
                                            ) : (
                                                <div>
                                                    {roomList.length === 0 ? (
                                                        <p>暂无会话</p>
                                                    ) : (
                                                        <List
                                                            dataSource={ roomList }
                                                            renderItem={(item) => (
                                                                <List.Item key={item.roomid}>
                                                                    <List.Item.Meta
                                                                        title={
                                                                            <Button
                                                                                block
                                                                                type={"text"}
                                                                                onClick={()=>{
                                                                                    window.currentRoomID = item.roomid;
                                                                                    window.currentRoomName = item.roomname;
                                                                                    setRoomNotice(item.is_notice);
                                                                                    setRoomTop(item.is_top);
                                                                                    setRoomPrivate(item.is_private);
                                                                                    setMessageList(messageList => item.message_list);
                                                                                    addRoom(item.roomid, item.roomname);
                                                                                }}>
                                                                                <Space>
                                                                                    <Badge count={114514}>
                                                                                        {/* TODO: 添加会话的图标 */}
                                                                                        <Avatar icon={ <CommentOutlined/> }/>
                                                                                    </Badge>
                                                                                    { item.roomname }
                                                                                </Space>
                                                                            </Button>}
                                                                    />
                                                                </List.Item>
                                                            )}
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* 消息页面 */}
                                        {window.currentRoomID === 0 ? null : (
                                            <div style={{ padding: "0 24px", backgroundColor:"#FFF5EE",  width:"80%", minHeight:"100vh" }}>
                                                <div style={{height: "10vh", margin: "5px, 10px", flexDirection: "row"}}>
                                                    <Space>
                                                        <h1> { window.currentRoomName } </h1>
                                                        <Popover placement={"bottomRight"} content={ roomInfoPage } trigger={"click"}>
                                                            <Button type={"primary"} size={"middle"} icon={ <EllipsisOutlined/> } ghost={true} shape={"round"} onClick={() => fetchRoomInfo(window.currentRoomID)}/>
                                                        </Popover>
                                                    </Space>
                                                </div>
                                                <div style={{padding: "24px", position: "relative", height: "74vh", left: 0, right: 0, overflow: "auto"}}>
                                                    <List
                                                        dataSource={ messageList }
                                                        renderItem={(item) => (
                                                            <List.Item key={ item.msg_id }>
                                                                {item.msg_body != "该消息已被撤回" ? (
                                                                    <Popover content={
                                                                        <div style={{ display: "flex", flexDirection: "row"}}>
                                                                            <Button type="default" onClick={() => recall(item.msg_id)}> 撤回 </Button>
                                                                            <Button type="default" onClick={() => reply(item.msg_id)}> 回复 </Button>
                                                                            {item.msg_type === "text" ? (
                                                                                <Button type="default" onClick={() => translate(item.msg_body)}> 翻译 </Button>
                                                                            ): null}
                                                                            <Button type="default" onClick={() => forward()}> 转发 </Button>
                                                                        </div>
                                                                    }>
                                                                        {item.sender === window.username ? (
                                                                            <div style={{ display: "flex", flexDirection: "row-reverse", justifyContent: "flex-start", marginLeft: "auto"}}>
                                                                                <div style={{display: "flex", flexDirection: "column"}}>
                                                                                    <List.Item.Meta avatar={<Avatar  src={("/api"+item.avatar)}/>}/>
                                                                                    <h6>{item.sender}</h6>
                                                                                </div>
                                                                                <div style={{ borderRadius: "24px", padding: "12px", display: "flex", flexDirection: "column", backgroundColor: "#66B7FF"}}>
                                                                                    {item.msg_type === "text" ? (
                                                                                        <p>{item.msg_body}</p>
                                                                                    ): null}
                                                                                    {item.msg_type === "image" ? (
                                                                                        <Image width={"30vh"} src={("/api"+item.msg_body)}/>
                                                                                    ): null}
                                                                                    {item.msg_type === "video" ? (
                                                                                        <div style={{width: "50vh"}}>
                                                                                            <Player fluid={false}>
                                                                                                <source src={("/api"+item.msg_body)}/>
                                                                                                <ControlBar>
                                                                                                    <ReplayControl seconds={10} order={1.1} />
                                                                                                    <ForwardControl seconds={30} order={1.2} />
                                                                                                    <CurrentTimeDisplay order={4.1} />
                                                                                                    <TimeDivider order={4.2} />
                                                                                                    <PlaybackRateMenuButton rates={[5, 2, 1, 0.5, 0.1]} order={7.1} />
                                                                                                    <VolumeMenuButton disabled />
                                                                                                </ControlBar>
                                                                                            </Player>
                                                                                        </div>
                                                                                    ): null}
                                                                                    {item.msg_type === "file" ? (
                                                                                        <div>
                                                                                            <h1> 文件消息 </h1>
                                                                                            <Button onClick={() => {
                                                                                                window.open("/api" + item.msg_body);
                                                                                            }} type="default">
                                                                                                下载
                                                                                            </Button>
                                                                                        </div>
                                                                                    ): null}                                                                                    
                                                                                    <span>{item.msg_time}</span>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div style={{ display: "flex", flexDirection: "row"}}>
                                                                                <div style={{display: "flex", flexDirection: "column"}}>
                                                                                    <List.Item.Meta avatar={<Avatar  src={("/api"+item.avatar)}/>}/>
                                                                                    <h6>{item.sender}</h6>
                                                                                </div>
                                                                                <div style={{ borderRadius: "24px", padding: "12px", display: "flex", flexDirection: "column", backgroundColor: "#FFFFFF"}}>
                                                                                    {item.msg_type === "text" ? (
                                                                                        <p>{item.msg_body}</p>
                                                                                    ): null}
                                                                                    {item.msg_type === "image" ? (
                                                                                        <Image width={"30vh"} src={("/api"+item.msg_body)}/>
                                                                                    ): null}
                                                                                    {item.msg_type === "video" ? (
                                                                                        <div style={{width: "50vh"}}>
                                                                                            <Player fliud={false}>
                                                                                                <source src={("/api"+item.msg_body)}/>
                                                                                                <ControlBar>
                                                                                                    <ReplayControl seconds={10} order={1.1} />
                                                                                                    <ForwardControl seconds={30} order={1.2} />
                                                                                                    <CurrentTimeDisplay order={4.1} />
                                                                                                    <TimeDivider order={4.2} />
                                                                                                    <PlaybackRateMenuButton rates={[5, 2, 1, 0.5, 0.1]} order={7.1} />
                                                                                                    <VolumeMenuButton disabled />
                                                                                                </ControlBar>
                                                                                            </Player>
                                                                                        </div>
                                                                                    ): null}
                                                                                    {item.msg_type === "file" ? (
                                                                                        <div>
                                                                                            <h1> 文件消息 </h1>
                                                                                            <Button onClick={() => {
                                                                                                window.open("/api" + item.msg_body);
                                                                                            }} type="default">
                                                                                                下载
                                                                                            </Button>
                                                                                        </div>
                                                                                    ): null}
                                                                                    <span>{ item.msg_time }</span>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </Popover>                                                                    
                                                                ) : ( null)}
                                                            </List.Item>
                                                        )}
                                                    />
                                                </div>
                                                {/* 底部发送框 */}
                                                <div style={{ padding: "24px", position: "relative", display: "flex", flexDirection: "column", bottom: 0, left: 0, right: 0, height: "16vh" }}>
                                                    <div style={{flexDirection: "row"}}>
                                                        <Space>
                                                            <Popover content={<Row gutter={0}>
                                                                {emojiList.map((item) => {
                                                                    return (
                                                                        <Col span={1} onClick={() => { appendEmoji(item.emoji);}} key={item.id}>
                                                                            <div>{ item.emoji }</div>
                                                                        </Col>
                                                                    );
                                                                })}
                                                            </Row>} title="Title" trigger="click">
                                                                <Button><SmileOutlined />表情</Button>
                                                            </Popover>
                                                        </Space>
                                                    </div>
                                                    <TextArea
                                                        allowClear
                                                        style={{left: 0, right: 0}}
                                                        value={messageBody}
                                                        onChange={(e) => setMessageBody(e.target.value)}
                                                    />
                                                    <div style={{flexDirection: "row-reverse", display:"flex"}}>
                                                        <Button
                                                            type="primary"
                                                            onClick={() => sendMessage()}>
                                                            发送
                                                        </Button>
                                                        <Button
                                                            type="primary"
                                                            onClick={() => setImageModal(true)}>
                                                            上传图片
                                                        </Button>
                                                        <Button
                                                            type="primary"
                                                            onClick={() => setVideoModal(true)}>
                                                            上传视频
                                                        </Button>
                                                        <Button
                                                            type="primary"
                                                            onClick={() => setFileModal(true)}>
                                                            上传文件
                                                        </Button>
                                                        
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : null}

                                { /*通讯录组件*/}
                                {menuItem === CONS.ADDRESSBOOK ? (
                                    <div style={{ display: "flex", flexDirection: "row" }}>
                                        <div style={{ padding: "0 24px", backgroundColor:"#FAF0E6",  width:"20%", minHeight:"100vh" }}>
                                            <Button type="default" shape={"round"} onClick={()=>setAddressItem(CONS.SEARCH)} icon={<SearchOutlined/>} block> 搜索 </Button>
                                            <Button type="default" shape={"round"} onClick={() => {setAddressItem(CONS.NEWFRIEND); fetchReceiveList(); fetchApplyList();}} block icon={<UserAddOutlined />}> 新的朋友 </Button>
                                            <Button type="default" shape={"round"} onClick={() => setNewGroupModal(true)} block> 创建新群聊 </Button>
                                            <h3> 好友列表 </h3>
                                            {friendListRefreshing ? (
                                                <Spin />
                                            ) : (
                                                <div style={{ padding: 12}}>
                                                    {friendList.length === 0 ? (
                                                        <p> 无好友分组 </p>
                                                    ) : (
                                                        <List
                                                            dataSource={friendList}
                                                            renderItem={(item) => (
                                                                <List.Item
                                                                    actions={[
                                                                        <Button
                                                                            key={item.groupname}
                                                                            size={"large"}
                                                                            type="default"
                                                                            onClick={() => {deleteGroup(item.groupname); fetchFriendList();}}>
                                                                            删除分组
                                                                        </Button>
                                                                    ]}
                                                                >
                                                                    {item.groupname}
                                                                    {item.username.length === 0 ? (
                                                                        <p> 该分组为空 </p>
                                                                    ) : (
                                                                        <List
                                                                            dataSource={item.username}
                                                                            renderItem={(subItem) => (
                                                                                <List.Item>
                                                                                    <List.Item.Meta
                                                                                        title={<Button
                                                                                            key={ subItem }
                                                                                            block
                                                                                            type="text"
                                                                                            onClick={() => {
                                                                                                window.otherUsername = subItem;
                                                                                                checkFriend();
                                                                                            }}>
                                                                                            { subItem }
                                                                                        </Button>}
                                                                                        avatar={ <Avatar icon={<UserOutlined />}/> }
                                                                                    />
                                                                                </List.Item>
                                                                            )}
                                                                        />
                                                                    )}
                                                                </List.Item>
                                                            )}
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ padding: "24px", backgroundColor:"#FFF5EE",  width:"80%", minHeight:"100vh" }}>
                                            {addressItem === CONS.NEWFRIEND ? (
                                                <div>
                                                    {receiveRefreshing ? (
                                                        <Spin />
                                                    ) : (
                                                        <div style={{ padding: 12}}>
                                                            {receiveList.length === 0 ? (
                                                                <p> 无好友申请 </p>
                                                            ) : (
                                                                <List
                                                                    dataSource={receiveList}
                                                                    renderItem={(item) => (
                                                                        <List.Item
                                                                            actions={[
                                                                                <Button
                                                                                    disabled={item.make_sure}
                                                                                    key = {item.username + "1"}
                                                                                    type="primary"
                                                                                    onClick={() => {accept(item.username); fetchReceiveList();}}
                                                                                >
                                                                                    接受申请
                                                                                </Button>,
                                                                                <Button
                                                                                    disabled={item.make_sure}
                                                                                    key={item.username + "2"}
                                                                                    type="primary"
                                                                                    onClick={() => {decline(item.username); fetchReceiveList();}}
                                                                                >
                                                                                    拒绝申请
                                                                                </Button>
                                                                            ]}
                                                                        >
                                                                            {item.username} {(item.make_sure && item.is_confirmed) ? ("已接受") : null}{(item.make_sure && !item.is_confirmed) ? ("已拒绝") : null}
                                                                        </List.Item>
                                                                    )}
                                                                />
                                                            )}
                                                        </div>
                                                    )}

                                                    {applyRefreshing ? (
                                                        <Spin />
                                                    ) : (
                                                        <div style={{ padding: 12}}>
                                                            {applyList.length === 0 ? (
                                                                <p> 无发送的好友申请 </p>
                                                            ) : (
                                                                <List
                                                                    bordered
                                                                    dataSource={applyList}
                                                                    renderItem={(item) => (
                                                                        <List.Item key={item.username}>
                                                                            {item.username} {(item.make_sure && item.is_confirmed) ? ("对方已接受") : null}
                                                                            {(item.make_sure && !item.is_confirmed) ? ("对方已拒绝") : null}
                                                                            {(!item.make_sure) ? ("对方未回复") : null}
                                                                        </List.Item>
                                                                    )}
                                                                />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : null}

                                            {addressItem === CONS.SEARCH ? (
                                                <div style={{
                                                    display: "flex", flexDirection: "column", border: "1px solid transparent", borderRadius: "20px",
                                                    alignItems: "center", backgroundColor: "rgba(255,255,255,0.7)"
                                                }}>
                                                    <h1> 搜索用户 </h1>
                                                    <Space.Compact style={{ width: "80%" }}>
                                                        <Input
                                                            type="text"
                                                            placeholder="请填写用户名"
                                                            value={searchName}
                                                            onChange={(e) => setSearchName(e.target.value)}
                                                        />
                                                        <Button type="primary" onClick={search} icon={<SearchOutlined />}/>
                                                    </Space.Compact>

                                                    {searchRefreshing ? (
                                                        <p> 未搜索 </p>
                                                    ) : (
                                                        <div style={{ padding: 12}}>
                                                            {searchList.length === 0 ? (
                                                                <p> 未找到符合条件的用户 </p>
                                                            ) : (
                                                                <List
                                                                    bordered
                                                                    dataSource={searchList}
                                                                    renderItem={(item) => (
                                                                        <List.Item
                                                                            actions={[
                                                                                <Button
                                                                                    key = {item.username}
                                                                                    block
                                                                                    size={"large"}
                                                                                    type="primary"
                                                                                    onClick={() => {
                                                                                        window.otherUsername = item.username;
                                                                                        checkFriend();
                                                                                    }}
                                                                                >
                                                                                    查看用户界面
                                                                                </Button>
                                                                            ]}>
                                                                            <div>{item.username}</div>
                                                                        </List.Item>
                                                                    )}
                                                                />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : null}

                                            {addressItem === CONS.PUBLICINFO ? (
                                                <div style={{
                                                    display: "flex", flexDirection: "column", paddingLeft: "150px", paddingRight: "150px",
                                                    paddingTop: "5px", paddingBottom: "25px", border: "1px solid transparent", borderRadius: "20px",
                                                    alignItems: "center", backgroundColor: "rgba(255,255,255,0.7)"
                                                }}>
                                                    <h1>{ window.otherUsername }</h1>
                                                    {isFriend ? (
                                                        <div style={{ width: "400px", height: "50px", margin: "5px", display: "flex", flexDirection: "row"}}>
                                                            <Button
                                                                type="primary"
                                                                onClick={() => ((box === 1) ? setBox(0) : setBox(1))}
                                                            >
                                                                添加至小组
                                                            </Button>
                                                            <Button
                                                                type="primary"
                                                                onClick={() => (deleteFriend())}
                                                            >
                                                                删除好友
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div style={{ width: "200px", height: "50px", margin: "5px", display: "flex", flexDirection: "row"}}>
                                                            <Button type="primary" onClick={() => {addFriend();}}>
                                                                添加好友
                                                            </Button>
                                                        </div>
                                                    )}
                                                    {box === 1 ? (
                                                        <div style={{ margin: "5px", display: "flex", flexDirection: "column", alignItems: "center"}}>
                                                            <Input size={"large"} maxLength={50}
                                                                prefix={<UserOutlined/>}
                                                                type="text"
                                                                placeholder="请填写小组名"
                                                                value={friendGroup}
                                                                onChange={(e) => setFriendGroup(e.target.value)}
                                                            />
                                                            <Button type="primary" onClick={()=> {addToGroup(); fetchFriendList();}}>
                                                                确认添加至小组
                                                            </Button>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                ) : null}

                                {menuItem === CONS.SETTINGS ? (
                                    <div style={{
                                        display: "flex", flexDirection: "column", justifyContent: "center ", alignItems: "center", position: "absolute", margin: "auto"
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
                                            <h3>用户名：{ window.username }</h3>
                                            <div style={{width: "400px", height: "50px", margin: "5px", display: "flex", flexDirection: "row"}}>
                                                <Space size={50}>
                                                    <Button size={"large"} type={"primary"}
                                                        onClick={() => ((changeUserInfo === CONS.REVISE_USERNAME) ? setChangeUserInfo(CONS.NO_REVISE) : setChangeUserInfo(CONS.REVISE_USERNAME))}>
                                                        修改用户名
                                                    </Button>
                                                    <Button size={"large"} type={"primary"}
                                                        onClick={() => ((changeUserInfo === CONS.REVISE_PASSWORD) ? setChangeUserInfo(CONS.NO_REVISE) : setChangeUserInfo(CONS.REVISE_PASSWORD))}>
                                                        修改密码
                                                    </Button>
                                                    <Button size={"large"} type={"primary"}
                                                        onClick={() => ((changeUserInfo === CONS.REVISE_EMAIL) ? setChangeUserInfo(CONS.NO_REVISE) : setChangeUserInfo(CONS.REVISE_EMAIL))}>
                                                        修改邮箱
                                                    </Button>
                                                    <Button size={"large"} type={"primary"}
                                                        onClick={() => setAvatarModal(true)}>
                                                        上传头像
                                                    </Button>
                                                </Space>
                                            </div>
                                            {changeUserInfo === CONS.REVISE_USERNAME ? (
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
                                                    <Button size={"large"} type={"dashed"} onClick={changeUsername}>
                                                        确认修改用户名
                                                    </Button>
                                                </div>
                                            ) : null}

                                            {changeUserInfo === CONS.REVISE_PASSWORD ? (
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
                                                        onChange={(e) => setNewPassword(e.target.value)}
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

                                            {changeUserInfo === CONS.REVISE_EMAIL ? (
                                                <div style={{margin: "5px", display: "flex", flexDirection: "column", alignItems: "center"}}>
                                                    <Input
                                                        size={"large"}
                                                        type="text"
                                                        prefix={<MailOutlined />}
                                                        placeholder="请填写邮箱"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                    />
                                                    <Space.Compact style={{ width: "100%" }}>
                                                        <Input
                                                            size={"large"}
                                                            type="text"
                                                            prefix={<MailOutlined />}
                                                            placeholder="请填写验证码"
                                                            value={sms}
                                                            onChange={(e) => setSms(e.target.value)}
                                                        />
                                                        <Button type="primary" onClick={() => sendEmail()}>
                                                            发送验证码
                                                        </Button>
                                                    </Space.Compact>
                                                    <br/>
                                                    <Button size={"large"} type={"dashed"} onClick={()=>verifySms()}>
                                                        确认修改邮箱
                                                    </Button>
                                                </div>
                                            ) : null}

                                            {changeUserInfo === CONS.WRITE_OFF ? (
                                                <div style={{margin: "5px", display: "flex", flexDirection: "column", alignItems: "center"}}>
                                                    <Input.Password size={"large"} maxLength={50}
                                                        type="text"
                                                        placeholder="请填写密码"
                                                        prefix={<LockOutlined/>}
                                                        value={password}
                                                        onChange={(e) => getPassword(e.target.value)}
                                                    />
                                                    <Button size={"large"} shape={"round"} type={"dashed"} danger={true} onClick={()=>deleteUser()}>
                                                        确认注销
                                                    </Button>
                                                </div>
                                            ) : null}
                                            <div style={{width: "400px", height: "50px", margin: "5px", display: "flex", flexDirection: "row"}}>
                                                <Space size={150}>
                                                    <Button size={"large"} shape={"round"} type={"primary"} onClick={()=>logout()}>
                                                        登出
                                                    </Button>
                                                    <Button size={"large"} shape={"round"} type={"primary"} danger={true}
                                                        onClick={() => ((changeUserInfo === CONS.WRITE_OFF) ? setChangeUserInfo(CONS.NO_REVISE) : setChangeUserInfo(CONS.WRITE_OFF))}>
                                                        注销账户
                                                    </Button>
                                                </Space>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                            </Content>
                        </Layout>
                    </div>
                ) : null}
            </div>
            <Modal title="创建新群聊" open={newGroupModal} onOk={() => newGroup()} onCancel={() => setNewGroupModal(false)}>
                <Input 
                    type="text"
                    placeholder="请填写新群聊名"
                    maxLength={50}
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                />
                <TreeSelect
                    value={newGroupMemberList}
                    treeData={friendList}
                    placeholder="选择新群聊成员"
                    treeDefaultExpandAll
                    onChange={(e) => memberChange(e)}
                    treeCheckable={true}
                />
            </Modal>
            <Modal title="翻译结果" open={translateModal} onOk={() => setTranslateModal(false)} onCancel={() => setTranslateModal(false)}>
                <p>{translateResult}</p>
            </Modal>
            <Modal title="上传" open={avatarModal} onOk={() => setAvatarModal(false)} onCancel={() => setAvatarModal(false)}>
                <div>
                    <iframe id="loader" name="loader" onChange={() => logReturn()} style={{display: "none"}}></iframe>
                    <form id="avatarform" ref={avatarF} action="/api/user/upload" method="post" encType="multipart/form-data" target="loader" onSubmit={() => {
                        if(avatarF.current) {
                            var fromdata = new FormData(avatarF.current);
                            console.log(fromdata.get("username"));
                            console.log(fromdata.get("avatar"));
                            axios.post("/api/user/upload", fromdata , avatarconfig)
                                .then((res) => {
                                    console.log(res.data.avatar);
                                    window.userAvatar = res.data.avatar;
                                })
                                .catch((err) => {
                                    console.log(err);
                                });
                        }
                        setAvatarModal(false);
                        return false;
                    }}>
                        <input id="image-uploadify" name="avatar" type="file" accept="image/*" multiple={false}/>
                        <input id="text" name="username" type="text" value={username} style={{display: "none"}} readOnly/>
                        <button type="submit">
                            确认上传
                        </button>
                    </form>
                </div>
            </Modal>
            <Modal title="上传图片" open={imageModal} onOk={() => setImageModal(false)} onCancel={() => setImageModal(false)}>
                <div>
                    <iframe id="loaderi" name="loaderi" onChange={() => logReturn()} style={{display: "none"}}></iframe>
                    <form id="imageform" ref={imageF} action="/api/user/uploadfile" method="post" encType="multipart/form-data" target="loaderi" onSubmit={() => {
                        if(imageF.current) {
                            var fromdata = new FormData(imageF.current);
                            console.log(fromdata.get("file"));
                            axios.post("/api/user/uploadfile", fromdata , avatarconfig)
                                .then((res) => {
                                    console.log(res.data.file_url);
                                    sendFile("image", res.data.file_url);
                                })
                                .catch((err) => {
                                    console.log(err);
                                });
                        }
                        setImageModal(false);
                        return false;
                    }}>
                        <input id="image-uploadify" name="file" type="file" accept="image/*" multiple={false}/>
                        <button type="submit">
                            确认上传
                        </button>
                    </form>
                </div>
            </Modal>
            <Modal title="上传视频" open={videoModal} onOk={() => setVideoModal(false)} onCancel={() => setVideoModal(false)}>
                <div>
                    <iframe id="loaderv" name="loaderv" onChange={() => logReturn()} style={{display: "none"}}></iframe>
                    <form id="videoform" ref={videoF} action="/api/user/uploadfile" method="post" encType="multipart/form-data" target="loaderv" onSubmit={() => {
                        if(videoF.current) {
                            var fromdata = new FormData(videoF.current);
                            console.log(fromdata.get("file"));
                            axios.post("/api/user/uploadfile", fromdata , avatarconfig)
                                .then((res) => {
                                    console.log(res.data.file_url);
                                    sendFile("video", res.data.file_url);
                                })
                                .catch((err) => {
                                    console.log(err);
                                });
                        }
                        setVideoModal(false);
                        return false;
                    }}>
                        <input id="image-uploadify" name="file" type="file" accept="video/*" multiple={false}/>
                        <button type="submit">
                            确认上传
                        </button>
                    </form>
                </div>
            </Modal>
            <Modal title="上传文件" open={fileModal} onOk={() => setFileModal(false)} onCancel={() => setFileModal(false)}>
                <div>
                    <iframe id="loaderf" name="loaderf" onChange={() => logReturn()} style={{display: "none"}}></iframe>
                    <form id="fileform" ref={fileF} action="/api/user/uploadfile" method="post" encType="multipart/form-data" target="loaderf" onSubmit={() => {
                        if(fileF.current) {
                            var fromdata = new FormData(fileF.current);
                            console.log(fromdata.get("file"));
                            axios.post("/api/user/uploadfile", fromdata , avatarconfig)
                                .then((res) => {
                                    console.log(res.data.file_url);
                                    sendFile("file", res.data.file_url);
                                })
                                .catch((err) => {
                                    console.log(err);
                                });
                        }
                        setFileModal(false);
                        return false;
                    }}>
                        <input id="image-uploadify" name="file" type="file" accept=".xlsx,.xls,image/*,.doc,audio/*,.docx,video/*,.ppt,.pptx,.txt,.pdf" multiple={false}/>
                        <button type="submit">
                            确认上传
                        </button>
                    </form>
                </div>
            </Modal>
        </div>
    );
};
export default Screen;
