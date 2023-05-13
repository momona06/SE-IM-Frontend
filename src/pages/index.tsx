import React, { useEffect, useState } from "react";
import * as STRINGS from "../constants/string";
import { request } from "../utils/network";
import { message, Input, Button, Space, Layout, List, Menu, Spin, Badge, Avatar, Popover, Card, Divider, Row, Col, Upload, Switch, Mentions, Form, Modal, Checkbox } from "antd";
import { ArrowRightOutlined, LockOutlined, LoginOutlined, UserOutlined, ContactsOutlined, UserAddOutlined, ArrowLeftOutlined, MessageOutlined, SettingOutlined, UsergroupAddOutlined, MailOutlined, SearchOutlined, CommentOutlined, EllipsisOutlined, SmileOutlined, UploadOutlined, LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import * as CONS from "../constants/constants";
import moment from "moment";
import { Player, ControlBar,  } from "video-react";
import emojiList from "../components/emojiList";
import {MentionsOptionProps} from "antd/es/mentions";
import {CheckboxValueType} from "antd/es/checkbox/Group";

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
    message_list: messageListData[];
}

// 本地存储消息列表
interface messageListData {
    msg_id: number;
    msg_type: string;
    msg_body: string;
    msg_time: string;
    sender: string;
}

interface roomInfoData {
    mem_list: string[];
    manager_list: string[];
    master: string;
    mem_count: number;
}

export const isEmail = (val : string) => {
    return /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/i.test(val);
};

const props: UploadProps = {
    name: "file",
    action: "https://ww.mocky.io/v2/5cc8019d300000980a055e76",
    headers: {
        authorization: "authorization-text",
    },
    onChange(info) {
        if(info.file.status !== "uploading") {
            console.log("upload:", info.file, info.fileList);
        }
        if(info.file.status === "done") {
            message.success(`${info.file.name} file uploaded successfully`);
        } else if (info.file.status === "error") {
            message.error(`${info.file.name} file upload failed.`);
        }
    },
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

    const [currentRoomName, setCurrentRoomName] = useState<string>("");
    const [friendListRefreshing, setFriendListRefreshing] = useState<boolean>(true);
    const [friendList, setFriendList] = useState<friendListData[]>([]);

    const [roomList, setRoomList] = useState<roomListData[]>([]);
    const [roomListRefreshing, setRoomListRefreshing] = useState<boolean>(true);
    const [newRoomMemberList, setNewRoomMemberList] = useState<string[]>([]);

    const [messageList, setMessageList] = useState<messageListData[]>([]);
    const [messageBody, setMessageBody] = useState<string>("");

    const [roomInfo, setRoomInfo] = useState<roomInfoData>({mem_list: [], master: "", manager_list: [], mem_count: 0});
    const [roomTop, setRoomTop] = useState<boolean>(false);
    const [roomNotice, setRoomNotice] = useState<boolean>(true);

    const [isFriend, setIsFriend] = useState<boolean>(false);
    const [friendGroup, setFriendGroup] = useState<string>("");
    const [box, setBox] = useState<number>(0);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [chatGroupName, setChatGroupName] = useState<string>("");

    // 全部好友username
    const [allFriendList, setAllFriendList] = useState<string[]>([]);

    useEffect(() => {
        if(currentPage === CONS.MAIN)
        {
            if(menuItem === CONS.CHATFRAME) {
                fetchRoomList();
                fetchFriendList();
                window.currentRoomID = 0;
            }
        }
    }, [currentPage, menuItem]);
    const [form] = Form.useForm();

    useEffect(() => {
        let temp:string[] = [];
        friendList.forEach((arr) => {
            temp = temp.concat(arr.username);
        });
        setAllFriendList(temp);
    }, [friendList]);

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
                    sender: data.sender
                };

                for (let room of roomList){
                    if (room.roomid === data.room_id){
                        room.message_list.push(newMessage);
                    }
                }
                if (data.room_id === window.currentRoomID){
                    if (data.sender != window.username) {
                        setMessageList(messageList => messageList.concat(newMessage));
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
            else if (data.function === "apply_friend") {
                if (data.message === "Has Been Sent"){
                    message.warning("申请已发送", 1);
                }
                if (data.message === "Is Already a Friend"){
                    message.warning("对方已经是你的好友", 1);
                }
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
                    setToken(res.token);
                    getAccount(account => "");
                    getPassword(password => "");
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
                    getAccount(account => "");
                    getPassword(password => "");
                    window.username = res.username;
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
                setUsername(username => "");
                getPassword(password => "");
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
                username: window.username,
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
                username: window.username,
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
                username: window.username,
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
                username: window.username,
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
                username: window.username,
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
                username: window.username,
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
                    my_username: window.username,
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
            "to": window.username,
            "username": window.username,
        };
        window.ws.send(JSON.stringify(data));
        message.success("已同意申请", 1);
    };

    const decline = (other: string) => {
        const data = {
            "function": "decline",
            "from": other,
            "to": window.username,
            "username": window.username,
        };
        window.ws.send(JSON.stringify(data));
    };

    const addFriend = () => {
        const data = {
            "function": "apply",
            "from": window.username,
            "to": window.otherUsername,
            "username": window.username
        };
        window.ws.send(JSON.stringify(data));
        message.success("申请已发送", 1);
    };

    const deleteFriend = () => {
        request(
            "/api/friend/deletefriend",
            "DELETE",
            {
                username: window.username,
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
        request(
            "api/friend/checkuser",
            "POST",
            {
                my_username: window.username,
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
                    username: window.username,
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
                username: window.username,
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
        window.ws.send(JSON.stringify(data));
        console.log(data);
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
        setRoomListRefreshing(true);
        const data = {
            "function": "fetch_room",
            "username": window.username,
        };
        window.ws.send(JSON.stringify(data));
    };

    // 加入分组
    const addRoom = (ID: number, Name: string) => {
        let data = {
            "function": "add_chat",
            "room_name": Name,
            "room_id": ID
        };
        window.ws.send(JSON.stringify(data));
    };

    const sendMessage = (Message: string) => {
        if (Message != ""){
            let data = {
                "function": "send_message",
                "msg_type": "text",
                "msg_body": Message
            };
            window.ws.send(JSON.stringify(data));

            let date = new Date();
            let newMessage = {
                // 在收到ACK前暂置为-1， 判断对方是否收到可用-1判断
                "msg_id": -1,
                "msg_type": "text",
                "msg_body": Message,
                "msg_time": moment(date).format("YYYY-MM-DD HH:mm:ss"),
                "sender": window.username
            };
            setMessageList(messageList => messageList.concat(newMessage));
            for (let room of roomList){
                if (room.roomid === window.currentRoomID){
                    room.message_list.push(newMessage);
                }
            }
        }
        else {
            message.error("消息不能为空", 1);
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
            "function": "settop",
            "settop": set,
        };
        setRoomTop(set);
        window.ws.send(JSON.stringify(data));
    };

    const setNotice = (set: boolean) => {
        console.log("将免打扰设置为" + set);
        const data = {
            "function": "setnotice",
            "setnotice": set,
        };
        setRoomNotice(set);
        window.ws.send(JSON.stringify(data));
    };

    const App = (
        <Upload {...props}>
            <Button icon={<UploadOutlined />}>Click to Upload</Button>
        </Upload>
    );

    const appendEmoji = (item: string) => {
        if (form.getFieldValue("box")){
            form.setFieldsValue({box: form.getFieldValue("box") + item});
            setMessageBody(form.getFieldValue("box") + item);
        }
        else {
            form.setFieldsValue({box: item});
            setMessageBody(item);
        }
    };

    const onMsgChange = (value: string) => {
        setMessageBody(value);
    };

    const onSelect = (options: MentionsOptionProps) => {
        console.log("选中:", options);
    };

    // @过滤自己
    function selfFilter(element: string, index: number, array: string[]) {
        if (element != window.username){
            return element;
        }
    }

    const newGroup = () => {
        if (chatGroupName == ""){
            message.warning("群聊名不能为空");
        }
        let data = {
            function: "create_group",
            member_list: newRoomMemberList,
            room_name: chatGroupName
        };
        console.log("创建群聊", data);
        window.ws.send(JSON.stringify(data));
        setNewRoomMemberList([]);
        setChatGroupName("");
        setIsModalOpen(false);
    };

    const onCheckChange = (checkedValues: CheckboxValueType[]) => {
        let temp: string[] = [window.username];
        checkedValues.forEach((arr) => {
            temp.push(typeof arr === "string" ? arr : "");
        });
        setNewRoomMemberList(temp);
    };

    const leaveChatGroup = () => {
        let data = {
            function: "leave_group",
            chatroom_id: window.currentRoomID
        };
        window.ws.send(JSON.stringify(data));
        console.log("leave", data);
        window.currentRoomID = 0;
        window.currentRoomName = "";
        setCurrentRoomName("");
    };

    const deleteChatGroup = () => {
        let data = {
            function: "delete_chatgroup",
            chatroom_id: window.currentRoomID
        };
        window.ws.send(JSON.stringify(data));
    };

    const str2addr = (text : string) => {
        const urlRegex = /(https?:\/\/\s+)/g; // 匹配 URL 的正则表达式
        //const urlRegex= /^(http|https|ftp|sftp):\/\/[^\s/$.?#].[^\s]*$/i;
        const parts = text.split(urlRegex); // 使用正则表达式拆分字符串
        return (
            <div>
                {parts.map((part, i) => {
                    if (part.match(urlRegex)) {
                        return (
                            <a href= "_blank" rel="noopener noreferrer" key={i}>
                                {part}
                            </a>
                        );
                    } else {
                        return <span key={ i }>{part}</span>;
                    }
                })}
            </div>
        );
    };

    //会话具体信息
    const roomInfoPage = (
        <div style={{padding: "12px"}}>
            <Space direction={"vertical"}>
                <Space.Compact style={{ width: "80%" }}>
                    <Input
                        type="text"
                        placeholder="请填写用户名"
                        value={ searchName }
                        onChange={(e) => setSearchName(e.target.value)}
                    />
                    <Button type="primary" onClick={ search } icon={<SearchOutlined />}/>
                </Space.Compact>
                <List
                    grid={{gutter: 16, column: 2}}
                    dataSource={ roomInfo.mem_list }
                    renderItem={(item) => (
                        <List.Item>
                            <Popover placement={"rightBottom"} content={"这里是点击成员后的弹出卡片，应当显示publicInfo"}>
                                <Card cover={"头像"}>
                                    { item }
                                </Card>
                            </Popover>
                        </List.Item>
                    )}
                />
                <Divider type={"horizontal"}/>
                <Card title={ `群聊名称 ${currentRoomName}` }>
                    <Space direction={"vertical"}>
                        <Space direction={"horizontal"}>
                            <p>免打扰</p>
                            <Switch defaultChecked={!roomNotice} onChange={setNotice}/>
                        </Space>
                        <Space direction={"horizontal"}>
                            <p>置顶</p>
                            <Switch defaultChecked={roomTop} onChange={setTop}/>
                        </Space>
                        <>
                        </>
                        <Button type={"text"} danger={true} onClick={() => leaveChatGroup()}>
                            退出群聊
                        </Button>
                    </Space>
                </Card>
            </Space>
        </div>
    );

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
                                        onClick={login}>
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

                                        <Modal title={ "创建群聊" } open={ isModalOpen } onOk={ newGroup } onCancel={() => setIsModalOpen(false)}>
                                            <Input
                                                type="text"
                                                placeholder="请填写群聊名称"
                                                value={ chatGroupName }
                                                onChange={(e) => setChatGroupName(e.target.value)}
                                            />
                                            <Checkbox.Group
                                                onChange={ onCheckChange }
                                                options={ allFriendList.map((value) => ({
                                                    value,
                                                    label: value,
                                                }))}/>
                                        </Modal>

                                        <div style={{ padding: "0 24px", backgroundColor:"#FAF0E6",  width:"20%", minHeight:"100vh" }}>
                                            <div style={{height: "5vh", margin: "10px, 10px", flexDirection: "row"}}>
                                                <Space direction={"horizontal"}>
                                                    <h3> 会话列表 </h3>
                                                    <Button icon={<PlusOutlined />} type={"default"} onClick={() => setIsModalOpen(true) }/>
                                                </Space>
                                            </div>
                                            {roomListRefreshing ? (
                                                <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}/>
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
                                                                                    setCurrentRoomName(item.roomname);
                                                                                    addRoom(item.roomid, item.roomname);
                                                                                    fetchRoomInfo(item.roomid);
                                                                                    setMessageList(messageList => item.message_list);
                                                                                    console.log("messagelist:", messageList);
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
                                                <div style={{height: "5vh", margin: "10px, 10px", flexDirection: "row"}}>
                                                    <Space>
                                                        <h1> { window.currentRoomName } </h1>
                                                        <Popover placement={"bottomRight"} content={ roomInfoPage } trigger={"click"}>
                                                            <Button type={"primary"} size={"middle"} icon={ <EllipsisOutlined/> } ghost={true} shape={"circle"}/>
                                                        </Popover>
                                                    </Space>
                                                </div>
                                                <div style={{padding: "24px", position: "relative", height: "70vh", left: 0, right: 0, overflow: "auto"}}>
                                                    <List
                                                        dataSource={ messageList }
                                                        split={ false }
                                                        renderItem={(item) => (
                                                            <List.Item key={ item.msg_id }>
                                                                { item.sender === window.username ? (
                                                                    <div style={{ display: "flex", flexDirection: "row-reverse", justifyContent: "flex-start", marginLeft: "auto"}}>
                                                                        <div style={{display: "flex", flexDirection: "column"}}>
                                                                            <List.Item.Meta avatar={<Avatar src={"https://wx2.qq.com/cgi-bin/mmwebwx-bin/webwxgeticon?seq=239472774&username=@c8ef32eea4f34c3becfba86e70bd5320e33c7eba9d35d382ed6185b9c3efbfe0&skey=@crypt_6df0f029_14c4f0a85beaf972ec58feb5ca7dc0e0"}/>}/>
                                                                            <h6>{item.sender}</h6>
                                                                        </div>
                                                                        <div style={{ borderRadius: "24px", padding: "12px", display: "flex", flexDirection: "column", backgroundColor: "#66B7FF"}}>
                                                                            { str2addr(item.msg_body) }
                                                                            <span> { item.msg_time } </span>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div style={{ display: "flex", flexDirection: "row"}}>
                                                                        <div style={{display: "flex", flexDirection: "column"}}>
                                                                            <List.Item.Meta avatar={<Avatar src={"https://wx2.qq.com/cgi-bin/mmwebwx-bin/webwxgeticon?seq=239472774&username=@c8ef32eea4f34c3becfba86e70bd5320e33c7eba9d35d382ed6185b9c3efbfe0&skey=@crypt_6df0f029_14c4f0a85beaf972ec58feb5ca7dc0e0"}/>}/>
                                                                            <h6>{item.sender}</h6>
                                                                        </div>
                                                                        <div style={{ borderRadius: "24px", padding: "12px", display: "flex", flexDirection: "column", backgroundColor: "#FFFFFF"}}>
                                                                            <p>{ item.msg_body }</p>
                                                                            <span>{ item.msg_time }</span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </List.Item>
                                                        )}
                                                    />
                                                </div>
                                                {/* 底部发送框 */}
                                                <div style={{ padding: "24px", position: "relative", display: "flex", flexDirection: "column", bottom: 0, left: 0, right: 0}}>
                                                    <div style={{flexDirection: "row"}}>
                                                        <Space direction={"horizontal"}>
                                                            <Popover content={<Row gutter={0}>
                                                                {emojiList.map((item) => {
                                                                    return (
                                                                        <Col span={1} onClick={() => {appendEmoji(item.emoji);}} key={item.id}>
                                                                            <div>{ item.emoji }</div>
                                                                        </Col>
                                                                    );
                                                                })}
                                                            </Row>} title="Title" trigger="click" placement={"topRight"}>
                                                                <Button><SmileOutlined />表情</Button>
                                                            </Popover>
                                                        </Space>
                                                    </div>
                                                    <Form form={form} layout={"horizontal"}>
                                                        <Form.Item name={"box"}>
                                                            <Mentions
                                                                rows={4}
                                                                onChange={onMsgChange}
                                                                onSelect={onSelect}
                                                                placement={"top"}
                                                                options={(roomInfo.mem_list.filter(selfFilter)).map((value) => ({
                                                                    key: value,
                                                                    value,
                                                                    label: value,
                                                                }))}
                                                            />
                                                        </Form.Item>
                                                    </Form>
                                                    <div style={{flexDirection: "row-reverse", display:"flex"}}>
                                                        <Button
                                                            type="primary"
                                                            onClick={() => {
                                                                sendMessage(messageBody);
                                                            }}>
                                                            发送
                                                        </Button>
                                                        <Upload {...props}>
                                                            <Button icon={<UploadOutlined />}>Click to Upload</Button>
                                                        </Upload>
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

                                            <h3> 好友列表 </h3>
                                            {friendListRefreshing ? (
                                                <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}/>
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
                                                        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}/>
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
                                                        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}/>
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
                                                        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}/>
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
        </div>
    );
};
export default Screen;
