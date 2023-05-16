import React, { useEffect, useState } from "react";
import * as STRINGS from "../constants/string";
import * as CONS from "../constants/constants";
import { request } from "../utils/network";
import {isRead, forwardCard, str2addr, messageListData } from "../components/chat";
import {message, Input, Button, Space, Layout, List, Menu, Spin, Badge, Avatar, Popover, Card, Divider, Row, Col,
    Upload, Switch, Mentions, Form, Modal, Checkbox, Select, UploadFile, Result,} from "antd";
import { ArrowRightOutlined, LockOutlined, LoginOutlined, UserOutlined, ContactsOutlined, UserAddOutlined,
    ArrowLeftOutlined, MessageOutlined, SettingOutlined, UsergroupAddOutlined, MailOutlined, SearchOutlined,
    CommentOutlined, EllipsisOutlined, SmileOutlined, UploadOutlined, LoadingOutlined, PlusOutlined,
    UserSwitchOutlined, IdcardOutlined, UserDeleteOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import moment from "moment";
import emojiList from "../components/emojiList";
import {MentionsOptionProps} from "antd/es/mentions";
import {CheckboxValueType} from "antd/es/checkbox/Group";
import axios from "axios";
import $ from "jquery";

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
    index: number;
}

interface roomInfoData {
    mem_list: string[];
    manager_list: string[];
    master: string;
    mem_count: number;
    is_private: boolean;
}

export const isEmail = (val : string) => {
    return /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/i.test(val);
};

const { Meta } = Card;
const { TextArea } = Input;

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

// const props: UploadProps = {
//     name: "avatar",
//     action: "https://se-im-backend-overflowlab.app.secoder.net/upload",
//     data: {"username": window.username},
//     onChange(info) {
//         if(info.file.status !== "uploading") {
//             console.log(info.file, info.fileList);
//         }
//         if(info.file.status === "done") {
//             message.success(`${info.file.name} file uploaded successfully`);
//         } else if (info.file.status === "error") {
//             message.error(`${info.file.name} file upload failed.`);
//         }
//     },
// };

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
    const [newRoomMemberList, setNewRoomMemberList] = useState<string[]>([]);

    const [messageList, setMessageList] = useState<messageListData[]>([]);
    const [messageBody, setMessageBody] = useState<string>("");

    // 回复消息
    const [replyMessageID, setReplyMessageID] = useState<number>(-1);
    const [replyMessageBody, setReplyMessageBody] = useState<string>("");
    const [replying, setReplying] = useState<boolean>(false);

    // 会话信息
    const [roomInfo, setRoomInfo] = useState<roomInfoData>({mem_list: [], master: "", manager_list: [], mem_count: 0, is_private: true});
    const [roomTop, setRoomTop] = useState<boolean>(false);
    const [roomNotice, setRoomNotice] = useState<boolean>(true);
    const [boardModal, setBoardModal] = useState<boolean>(false);

    // 全部好友username
    const [allFriendList, setAllFriendList] = useState<string[]>([]);
    const [isFriend, setIsFriend] = useState<boolean>(false);
    const [friendGroup, setFriendGroup] = useState<string>("");
    const [box, setBox] = useState<number>(0);

    // 创建群聊
    const [createGroupModal, setCreateGroupModal] = useState<boolean>(false);
    const [chatGroupName, setChatGroupName] = useState<string>("");

    // 翻译模块
    const [translateModal, setTranslateModal] = useState<boolean>(false);
    const [translateResult, setTranslateResult] = useState<string>("");

    // 消息转发
    const [forwardModal, setForwardModal] = useState<boolean>(false);
    const [forwardList, setForwardList] = useState<number[]>([]);
    const [combineList, setCombineList] = useState<messageListData[]>([]);

    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [avatarModal, setAvatarModal] = useState<boolean>(false);

    // 切换页面时 获取roomlist friendlist
    useEffect(() => {
        if(currentPage === CONS.MAIN) {
            if(menuItem === CONS.CHATFRAME) {
                fetchRoomList();
                fetchFriendList();
                window.currentRoomID = 0;
                window.currentRoomName = "";
            }
            else {
                window.currentRoomID = 0;
                window.currentRoomName = "";
            }
        }
    }, [currentPage, menuItem]);

    const [form] = Form.useForm();

    // 更新全部好友
    useEffect(() => {
        let temp:string[] = [];
        friendList.forEach((arr) => {
            temp = temp.concat(arr.username);
        });
        setAllFriendList(temp);
    }, [friendList]);

    // 当本地message更新
    useEffect(() => {
        window.messageList = messageList;
        console.log("msg changed", messageList);
        let last = messageList.at(-1);
        if (last && last.sender != window.username){
            Read();
        }
    }, [messageList]);

    useEffect(() => {
        window.roomList = roomList;
    }, [roomList]);

    // 本地修改roomTop后改变会话列表顺序
    useEffect(() => {
        setRoomList(roomList => ((roomList.filter((val => val.is_top)).concat(roomList.filter(val => !val.is_top)))));
    }, [roomTop]);

    // 当fetchRoomInfo回传成功后 本地消息列表更新时，执行read / 更新memList
    useEffect(() => {
        window.memList = roomInfo.mem_list;
        Read();
    }, [roomInfo]);

    const WSConnect = () => {
        let DEBUG = true;
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
                    mem_count: data.mem_count,
                    is_private: data.is_private,
                    index: data.index
                };
                setRoomInfo(info);
            }
            // 获取combine消息的内容
            else if (data.function === "fetchmessage"){
                let info = {
                    msg_id: data.msg_id,
                    msg_type: data.msg_type,
                    msg_body: data.msg_body,
                    msg_time: data.msg_time,
                    sender: data.sender,
                    combine_list: data.combine_list,
                    read_list: data.read_list
                };
                setCombineList(combineList => combineList.concat(info));
            }
            else if (data.function === "Ack2"){
                // 将消息id置为已发送
                let last = window.messageList.at(-1);
                if (last){
                    last.msg_id = data.msg_id;
                    let temp = [last];
                    setMessageList(window.messageList.slice(0, window.messageList.length - 1).concat(temp));
                }
            }
            else if (data.function === "Msg"){
                let newMessage = {
                    msg_id: data.msg_id,
                    msg_type: data.msg_type,
                    msg_body: data.msg_body,
                    reply_id: data.reply_id,
                    combine_list: data.combine_list,
                    msg_time: data.msg_time,
                    sender: data.sender,
                    read_list: data.read_list // 自己为true
                };
                // 更新本地
                if (data.room_id === window.currentRoomID){
                    // A无需将new msg加入messageList
                    if (data.sender != window.username) {
                        console.log("msg", newMessage);
                        setMessageList(messageList => messageList.concat(newMessage));
                    }
                    else {
                        // 需更新 read list
                        let temp = [newMessage];
                        setMessageList(messageList.slice(0, messageList.length - 1).concat(temp));
                    }
                }
                // 更新 roomlist
                for (let room of roomList){
                    if (room.roomid === data.room_id){
                        room.message_list.push(newMessage);
                    }
                }

                if (data.msg_type === "combine"){
                    getAllCombine(messageList);
                }
                let ACK = {
                    "function": "acknowledge_message",
                    "is_back": false,
                    "room_id": data.room_id,
                    "count": 1
                };
                window.ws.send(JSON.stringify(ACK));
            }
            // 其他人已读消息
            else if (data.function === "read_message"){
                if (data.read_user != window.username){
                    let readUser: string = data.read_user;
                    // 已读消息id
                    let msgList: number[] = data.read_message_list;
                    if (msgList.length != 0){
                        // 遍历roomlist 修改roomlist中msg
                        window.roomList.forEach(room => {
                            if (room.roomid === data.chatroom_id){
                                room.message_list.filter(
                                    msg => (msgList.indexOf(msg.msg_id) !== -1)).forEach((arr) => {
                                    arr.read_list[room.index] = true;
                                });
                                if (data.chatroom_id === window.currentRoomID){
                                    setMessageList(room.message_list);
                                }
                            }
                        });
                    }
                }
            }
            else if (data.function === "apply_friend") {
                if (data.message === "List Has Been Sent"){
                    message.warning("申请已发送", 1);
                }
                if (data.message === "Is Already a Friend"){
                    message.warning("对方已经是你的好友", 1);
                }
            }
            else if (data.function === "withdraw_message") {
                for (let room of window.roomList) {
                    if (room.roomid === data.room_id) {
                        for (let i = room.message_list.length-1; i >= 0; i--){
                            if (room.message_list[i].msg_id === data.msg_id) {
                                room.message_list[i].msg_body = "该消息已被撤回";
                                break;
                            }
                        }
                        if (room.roomid === window.currentRoomID) {
                            console.log("withdraw",room.message_list);
                            setMessageList(room.message_list);
                        }
                        break;
                    }
                }
            }
            else if (data.function === "withdraw_overtime") {
                message.error("消息超时", 1);
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
                    WSConnect();
                    message.success(STRINGS.LOGIN_SUCCESS, 1);
                    window.username = res.username;
                    setUsername(res.username);
                    setToken(res.token);
                    getAccount(account => "");
                    getPassword(password => "");
                    setCurrentPage(CONS.MAIN);
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
                    WSConnect();
                    message.success(STRINGS.LOGIN_SUCCESS, 1);
                    window.username = res.username;
                    setUsername(res.username);
                    setToken(res.token);
                    getAccount(account => "");
                    getPassword(password => "");
                    setCurrentPage(CONS.MAIN);
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
                getVerification(verification => "");
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
        console.log(data);
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

    const addFriend = (otherUsername: string) => {
        window.otherUsername = otherUsername;
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

    const Read = () => {
        let position: number = -1;
        roomList.forEach(room => {
            if (room.roomid === window.currentRoomID){
                position = room.index;
            }
        });
        if (position != -1){
            console.log("position", position);
            let readMessageList: number[] = [];
            // 筛选所有未读信息
            messageList.filter((msg) => (!msg.read_list[position] && msg.msg_id != -1)).forEach(arr => {
                readMessageList.push(arr.msg_id);
            });
            const data = {
                "function": "read_message",
                "read_message_list": readMessageList,
                "read_user": window.username,
                "chatroom_id": window.currentRoomID
            };
            console.log(data);
            window.ws.send(JSON.stringify(data));

            // 本地消息状态全部置为已读
            let temp = window.messageList;
            temp.forEach(msg => {
                msg.read_list[position] = true;
            });
            setMessageList(temp);

            // roomList 消息置为已读
            for (let room of roomList){
                if (room.roomid === window.currentRoomID){
                    for (let msg of room.message_list){
                        msg.read_list[position] = true;
                    }
                }
            }
        }
    };

    // 会话列表中的未读消息数
    const getUnread = (room: roomListData) => {
        let num = 0;
        room.message_list.forEach(msg => {
            if (!msg.read_list[room.index]){
                num += 1;
            }
        });
        return num;
    };

    const sendMessage = (Message: string, MessageType: string, reply_id?: number) => {
        if (Message != ""){
            let data = {
                "function": "send_message",
                "msg_type": MessageType,
                "msg_body": Message,
                "reply_id": reply_id
            };
            let date = new Date();
            let newMessage = {
                "msg_id": -1,
                "msg_type": MessageType,
                "msg_body": Message,
                "reply_id": reply_id,
                "msg_time": moment(date).format("YYYY-MM-DD HH:mm:ss"),
                "sender": window.username,
                "read_list": []
            };
            window.ws.send(JSON.stringify(data));
            console.log("send", newMessage);

            // 更新本地messageList
            setMessageList(messageList => messageList.concat(newMessage));
            // 更新roomList 消息
            for (let room of roomList){
                if (room.roomid === window.currentRoomID){
                    room.message_list.push(newMessage);
                }
            }
        }
        else {
            message.error("输入不能为空", 1);
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
        const data = {
            "function": "revise_is_top",
            "chatroom_id": window.currentRoomID,
            "is_top": set,
        };
        // 依次更新 roomlist roomtop
        roomList.forEach(arr => {
            if (arr.roomid === window.currentRoomID){
                arr.is_top = set;
            }
        });
        setRoomTop(set);
        window.ws.send(JSON.stringify(data));
    };

    const setNotice = (set: boolean) => {
        const data = {
            "function": "revise_is_notice",
            "chatroom_id": window.currentRoomID,
            "is_notice": set,
        };
        // 依次更新 roomlist roomnotice
        roomList.forEach(arr => {
            if (arr.roomid === window.currentRoomID){
                arr.is_notice = set;
            }
        });
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

    const onBoardChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setMessageBody(e.target.value);
    };

    const onSelect = (options: MentionsOptionProps) => {
        console.log("选中:", options);
    };

    // @ 过滤自己
    function selfFilter(element: string) {
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
        setCreateGroupModal(false);
    };

    const onCheckChange = (checkedValues: CheckboxValueType[]) => {
        let temp: string[] = [window.username];
        checkedValues.forEach((arr) => {
            temp.push(typeof arr === "string" ? arr : "");
        });
        setNewRoomMemberList(temp);
    };

    const onForwardChange = (checkedValues: CheckboxValueType[]) => {
        let temp: number[] = [];
        checkedValues.forEach((arr) => {
            temp.push(typeof arr === "number" ? arr : 0);
        });
        setForwardList(temp);
        console.log("ids:", temp);
    };

    const onForwardRoomChanged = (value: number) => {
        console.log("room", value);
        window.forwardRoomId = value;
    };

    // 合并转发
    const forward = () => {
        const data = {
            function: "send_message",
            msg_type: "combine",
            msg_body: "",
            combine_list: forwardList,
            transroom_id: window.forwardRoomId
        };
        console.log(data);
        window.ws.send(JSON.stringify(data));

        let date = new Date();
        let newMessage = {
            "msg_id": -1,
            "msg_type": "combine",
            "msg_body": "",
            "msg_time": moment(date).format("YYYY-MM-DD HH:mm:ss"),
            "sender": window.username,
            "combine_list": forwardList
        };

        for (let room of roomList){
            if (room.roomid === window.forwardRoomId){
                room.message_list.push(newMessage as messageListData);
            }
        }
        setForwardModal(false);
        window.forwardRoomId = 0;
    };

    // 获取被转发的消息
    const getAllCombine = (List: messageListData[]) => {
        let combineMessages = List.filter(arr => arr.msg_type === "combine");
        combineMessages.forEach((arr) => {
            arr.combine_list?.forEach(id => {
                fetchMessage(id);
            });
        });
    };

    // 获取单个消息
    const fetchMessage = (msg_id: number) => {
        let data = {
            "function": "fetch_message",
            "msg_id": msg_id
        };
        window.ws.send(JSON.stringify(data));
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
        setCreateGroupModal(false);
        fetchRoomList();
    };

    const deleteChatGroup = () => {
        let data = {
            function: "delete_chat_group",
            chatroom_id: window.currentRoomID
        };
        window.ws.send(JSON.stringify(data));
        window.currentRoomID = 0;
        window.currentRoomName = "";
        setCreateGroupModal(false);
    };

    const recall = (id: number) => {
        const data = {
            "function": "withdraw_message",
            "msg_id": id,
        };
        window.ws.send(JSON.stringify(data));
    };

    const translateConfig = {
        headers:{
            "Access-Control-Allow-Origin": "*"
        }
    };

    const translate = (message: string) => {
        // e.preventDefault();
        axios.post(`/translate/${"translate?&doctype=json&type=AUTO&i="+message}`,{}, translateConfig)
            .then((res) => {
                console.log(res);
                setTranslateResult(res.data.translateResult[0][0].tgt);
                setTranslateModal(true);
            })
            .catch((err) => {
                console.log(err);
            });
        // fetch(`https://fanyi.youdao.com/translate?&doctype=json&type=AUTO&i=${message}`, {
        //     method: "POST"
        // })
        // .then((res) => res.json())
        // .then((data) => setTranslateResult(data.translateResult[0][0].tgt));
        // setTranslateModal(true);
    };

    const logReturn = () => {
        $("#loader").load(function() {
            let text = $("#loader").contents().find("body").text();
            let j = $.JSON.parse(text);
            console.log(j);
        });
    };

    // 判断成员身份
    function identity(mem: string) {
        if (mem === roomInfo.master){
            return CONS.MASTER;
        }
        else {
            return roomInfo.manager_list.indexOf(mem) === -1 ? CONS.MEMBER : CONS.MANAGER;
        }
    }

    const setManager = (username: string) => {
        if (identity(username) === CONS.MEMBER){
            let data = {
                "function": "appoint_manager",
                "chatroom_id": window.currentRoomID,
                "manager_name": username
            };
            window.ws.send(JSON.stringify(data));
            roomInfo.manager_list.push(username);
        }
        if (identity(username) === CONS.MANAGER){
            let data = {
                "function": "remove_manager",
                "chatroom_id": window.currentRoomID,
                "manager_name": username
            };
            window.ws.send(JSON.stringify(data));
            let pos = roomInfo.manager_list.indexOf(username);
            roomInfo.manager_list.splice(pos, 1);
        }
    };

    const setMaster = (username: string) => {
        let data = {
            "function": "transfer_master",
            "chatroom_id": window.currentRoomID,
            "new_master_name": username
        };
        window.ws.send(JSON.stringify(data));
        roomInfo.master = username;
    };

    const removeMem = (username: string) => {
        let data = {
            "function": "remove_group_member",
            "chatroom_id": window.currentRoomID,
            "member_name": username
        };
        window.ws.send(JSON.stringify(data));
        let pos = roomInfo.mem_list.indexOf(username);
        roomInfo.mem_list.splice(pos, 1);
    };

    //会话具体信息
    const roomInfoPage = (
        <div style={{padding: "12px"}}>
            <Space direction={"vertical"}>
                <List
                    grid={{gutter: 16, column: 4, xs: 1, sm: 2, md: 4, lg: 4, xl: 6, xxl: 3,}}
                    dataSource={roomInfo.mem_list}
                    renderItem={(item) => (
                        <List.Item>
                            <Popover placement={"rightBottom"} content={"这里是点击成员后的弹出卡片，应当显示publicInfo"} trigger={"click"}>
                                <Card
                                    style={{width: 200, marginTop: 8}}
                                    bordered={false}
                                    actions={[
                                        (item !== window.username ?
                                            <UserAddOutlined key={"add_friend"} onClick={() => {
                                                addFriend(item);
                                            }}/> : null
                                        ),
                                        (identity(window.username) === CONS.MASTER ?
                                            <UserSwitchOutlined key={"setManager"} onClick={() => {
                                                setManager(item);
                                            }}/> : null
                                        ),
                                        (identity(window.username) === CONS.MASTER ?
                                            <IdcardOutlined key={"setMaster"} onClick={() => {
                                                setMaster(item);
                                            }}/> : null
                                        ),
                                        (identity(window.username) > identity(item) ?
                                            <UserDeleteOutlined key={"kick"} onClick={() => {
                                                removeMem(item);
                                            }}/> : null
                                        )
                                    ]}>
                                    <Meta
                                        avatar={<Avatar src="https://xsgames.co/randomusers/avatar.php?g=pixel"/>}
                                        title={item}
                                        description={!roomInfo.is_private ? identity(item) : null}
                                    />
                                </Card>
                            </Popover>
                        </List.Item>
                    )}
                />
                <Button type={"default"} icon={<PlusOutlined />} size={"large"}/>

                <Divider type={"horizontal"}/>
                {roomInfo.is_private ? null : (
                    <Card title={`群聊名称      ${window.currentRoomName}`}>
                        <Space direction={"vertical"}>
                            <Button type={"text"} onClick={() => {
                                setBoardModal(true);
                            }}>
                                群公告
                            </Button>
                            <Button type={"text"} danger={true} onClick={leaveChatGroup}>
                                退出群聊
                            </Button>
                            {identity(window.username) === CONS.MASTER ? (
                                <Button type={"text"} danger={true} onClick={deleteChatGroup}>
                                    解散群聊
                                </Button>
                            ) : null}
                        </Space>
                    </Card>
                )}
                <Space direction={"horizontal"}>
                    <p>免打扰</p>
                    <Switch checked={!roomNotice} onChange={setNotice}/>
                </Space>
                <Space direction={"horizontal"}>
                    <p>置顶</p>
                    <Switch checked={roomTop} onChange={setTop}/>
                </Space>
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
                            <Input
                                size="large"
                                type="text"
                                placeholder="请填写用户名"
                                prefix={<UserOutlined />}
                                maxLength={50}
                                value={account}
                                onChange={(e) => getAccount(e.target.value)}
                            />
                            <br/>
                            <Input.Password
                                size="large"
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
                                    <Button
                                        type={"primary"} size={"large"} shape={"round"} icon={<LoginOutlined />}
                                        onClick={login}>
                                        登录
                                    </Button>
                                    <Button
                                        type={"default"} size={"large"} shape={"round"} icon={<ArrowRightOutlined />}
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
                            <Input
                                size={"large"}
                                type="text"
                                placeholder="请填写用户名"
                                prefix={<UserOutlined />}
                                maxLength={50}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <br />
                            <Input.Password
                                size="large"
                                type="text"
                                maxLength={50}
                                placeholder="请填写密码"
                                prefix={<LockOutlined />}
                                value={password}
                                onChange={(e) => getPassword(e.target.value)}
                            />
                            <br />
                            <Input.Password
                                size="large"
                                maxLength={50}
                                type="text"
                                placeholder="请确认密码"
                                prefix={<ContactsOutlined />}
                                value={verification}
                                onChange={(e) => getVerification(e.target.value)}
                            />
                            <br />
                            <Button
                                type={"primary"} shape={"round"} icon={<UserAddOutlined />} size={"large"}
                                onClick={()=>{verifyPassword(); }}>
                                注册账户
                            </Button>
                            <br />
                            <Button
                                type={"link"} icon={<ArrowLeftOutlined/>} size={"large"}
                                onClick={() => {setCurrentPage(CONS.LOGIN); getPassword(password => "");}}>
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
                                            <div style={{height: "5vh", margin: "10px, 10px", flexDirection: "row"}}>
                                                <Space direction={"horizontal"}>
                                                    <h3> 会话列表 </h3>
                                                    <Button icon={<PlusOutlined />} type={"default"} onClick={() => setCreateGroupModal(true) }/>
                                                </Space>
                                            </div>
                                            <Divider type={"horizontal"}/>
                                            {roomListRefreshing ? (
                                                <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}/>
                                            ) : (
                                                <div style={{overflow: "scroll", height: "80vh"}}>
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
                                                                                    fetchRoomInfo(item.roomid);
                                                                                    addRoom(item.roomid, item.roomname);
                                                                                    window.currentRoomID = item.roomid;
                                                                                    window.currentRoomName = item.roomname;
                                                                                    setRoomNotice(item.is_notice);
                                                                                    setRoomTop(item.is_top);
                                                                                    setMessageList(item.message_list);
                                                                                    getAllCombine(item.message_list);
                                                                                }}>
                                                                                <Space>
                                                                                    <Badge count={item.is_notice ? getUnread(item) : 0}>
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
                                                <Divider type={"horizontal"}/>
                                                <div style={{padding: "24px", position: "relative", height: "60vh", overflow: "scroll"}}>
                                                    <List
                                                        dataSource={ messageList.filter((msg) => msg.msg_type != "notice") }
                                                        split={ false }
                                                        renderItem={(item) => (
                                                            <List.Item key={ item.msg_id }>
                                                                { item.msg_body != "该消息已被撤回" ? (
                                                                    <>
                                                                        <Popover trigger={"contextMenu"} placement={"top"} content={
                                                                            <Space direction={"horizontal"} size={"small"}>
                                                                                <Button type={"text"} onClick={() => setForwardModal(true)}> 转发 </Button>
                                                                                <Button type={"text"} onClick={() => {setReplying(true); setReplyMessageID(item.msg_id); setReplyMessageBody(item.msg_body);}}> 回复 </Button>
                                                                                <Button type={"text"} onClick={() => translate(item.msg_body)}> 翻译 </Button>
                                                                                { item.sender === window.username ? (
                                                                                    <Button type={"text"} onClick={() => recall(item.msg_id)}> 撤回 </Button>
                                                                                ) : null }
                                                                            </Space>
                                                                        }>
                                                                            { item.sender === window.username ? (
                                                                                <div style={{ display: "flex", flexDirection: "row-reverse", justifyContent: "flex-start", marginLeft: "auto"}}>
                                                                                    <div style={{display: "flex", flexDirection: "column"}}>
                                                                                        <List.Item.Meta avatar/>
                                                                                        <h6>{item.sender}</h6>
                                                                                    </div>
                                                                                    <div style={{ borderRadius: "24px", padding: "12px", display: "flex", flexDirection: "column", backgroundColor: "#66B7FF"}}>
                                                                                        { isRead(item.read_list, roomInfo.mem_list, roomInfo.is_private, window.username) }
                                                                                        { item.msg_type != "combine" ?  str2addr(item.msg_body) : (forwardCard(combineList))}
                                                                                        <span> { item.msg_time } </span>
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <div style={{ display: "flex", flexDirection: "row"}}>
                                                                                    <div style={{display: "flex", flexDirection: "column"}}>
                                                                                        <List.Item.Meta avatar/>
                                                                                        <h6>{item.sender}</h6>
                                                                                    </div>
                                                                                    <div style={{ borderRadius: "24px", padding: "12px", display: "flex", flexDirection: "column", backgroundColor: "#FFFFFF"}}>
                                                                                        { isRead(item.read_list, roomInfo.mem_list, roomInfo.is_private, window.username) }
                                                                                        { item.msg_type != "combine" ?  str2addr(item.msg_body) : (forwardCard(combineList))}
                                                                                        <span> { item.msg_time } </span>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </Popover>
                                                                        { item.msg_type === "reply" ? (item.reply_id) : null}
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        { item.sender === window.username ? (
                                                                            <div style={{ display: "flex", flexDirection: "row-reverse", justifyContent: "flex-start", marginLeft: "auto"}}>
                                                                                <div style={{display: "flex", flexDirection: "column"}}>
                                                                                    <List.Item.Meta avatar={<Avatar src={"https://wx2.qq.com/cgi-bin/mmwebwx-bin/webwxgeticon?seq=239472774&username=@c8ef32eea4f34c3becfba86e70bd5320e33c7eba9d35d382ed6185b9c3efbfe0&skey=@crypt_6df0f029_14c4f0a85beaf972ec58feb5ca7dc0e0"}/>}/>
                                                                                    <h6>{item.sender}</h6>
                                                                                </div>
                                                                                <div style={{ borderRadius: "24px", padding: "12px", display: "flex", flexDirection: "column", backgroundColor: "#66B7FF"}}>
                                                                                    <p>{ "该消息已被撤回" }</p>
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
                                                                                    <p>{ "该消息已被撤回" }</p>
                                                                                    <span>{ item.msg_time }</span>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </>
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
                                                        {replying ? (
                                                            <p> {replyMessageBody} </p>
                                                        ) : null}
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
                                                                replying ? sendMessage(messageBody, "reply", replyMessageID) : sendMessage(messageBody, "text");
                                                                setReplying(false);
                                                            }}>
                                                            发送
                                                        </Button>
                                                        <Upload name="avatar" action="https://se-im-backend-test-overflowlab.app.secoder.net/upload" data={{username: window.username}} onChange={(info) => {
                                                            if(info.file.status !== "uploading") {
                                                                console.log(info.file, info.fileList);
                                                            }
                                                            if(info.file.status === "done") {
                                                                message.success(`${info.file.name} file uploaded successfully`);
                                                            } else if (info.file.status === "error") {
                                                                message.error(`${info.file.name} file upload failed.`);
                                                            }
                                                        }}>
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
                                                                                    onClick={() => accept(item.username)}
                                                                                >
                                                                                    接受申请
                                                                                </Button>,
                                                                                <Button
                                                                                    disabled={item.make_sure}
                                                                                    key={item.username + "2"}
                                                                                    type="primary"
                                                                                    onClick={() => decline(item.username)}
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
                                                                onClick={() => ((box === 1) ? setBox(0) : setBox(1))}>
                                                                添加至小组
                                                            </Button>
                                                            <Button
                                                                type="primary"
                                                                onClick={() => (deleteFriend())}>
                                                                删除好友
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div style={{ width: "200px", height: "50px", margin: "5px", display: "flex", flexDirection: "row"}}>
                                                            <Button type="primary" onClick={() => addFriend(window.otherUsername)}>
                                                                添加好友
                                                            </Button>
                                                        </div>
                                                    )}
                                                    {box === 1 ? (
                                                        <div style={{ margin: "5px", display: "flex", flexDirection: "column", alignItems: "center"}}>
                                                            <Input
                                                                size={"large"} maxLength={50}
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
                                                    <Button
                                                        size={"large"} type={"primary"}
                                                        onClick={() => ((changeUserInfo === CONS.REVISE_USERNAME) ? setChangeUserInfo(CONS.NO_REVISE) : setChangeUserInfo(CONS.REVISE_USERNAME))}>
                                                        修改用户名
                                                    </Button>
                                                    <Button
                                                        size={"large"} type={"primary"}
                                                        onClick={() => ((changeUserInfo === CONS.REVISE_PASSWORD) ? setChangeUserInfo(CONS.NO_REVISE) : setChangeUserInfo(CONS.REVISE_PASSWORD))}>
                                                        修改密码
                                                    </Button>
                                                    <Button
                                                        size={"large"} type={"primary"}
                                                        onClick={() => ((changeUserInfo === CONS.REVISE_EMAIL) ? setChangeUserInfo(CONS.NO_REVISE) : setChangeUserInfo(CONS.REVISE_EMAIL))}>
                                                        修改邮箱
                                                    </Button>
                                                    {/* <div>
                                                        <form action="/api/upload" method="post" encType="multipart/form-data">
                                                            <input id="image-uploadify" name="pic" type="file" accept="image/*">
                                                                <button type="submit">
                                                                    选择文件
                                                                </button>
                                                            </input>
                                                        </form>
                                                    </div> */}
                                                    <Button
                                                        size={"large"} type={"primary"}
                                                        onClick={() => setAvatarModal(true)}>
                                                        上传头像
                                                    </Button>
                                                </Space>
                                            </div>

                                            {changeUserInfo === CONS.REVISE_USERNAME ? (
                                                <div style={{margin: "5px", display: "flex", flexDirection: "column", alignItems: "center"}}>
                                                    <Input
                                                        size={"large"} maxLength={50}
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
                                                    <Button
                                                        size={"large"} type={"dashed"}
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
                                                    <Input.Password
                                                        size={"large"} maxLength={50}
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
                                                    <Button
                                                        size={"large"} shape={"round"} type={"primary"} danger={true}
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


            <Modal title={"群公告"} open={ boardModal } onCancel={() => setBoardModal(false)} onOk={() => {sendMessage(messageBody, "notice"); console.log("messagelist:",messageList);}} okButtonProps={{disabled: identity(username) == CONS.MANAGER}}>
                <div style={{height: "50vh", overflow: "scroll"}}>
                    <List
                        itemLayout={"vertical"}
                        dataSource = {messageList.filter((message) => (message.msg_type === "notice"))}
                        footer={
                            <>
                                {identity(username) != CONS.MEMBER ? (
                                    <TextArea showCount={true} rows={4} onChange={onBoardChange}/>
                                ) : <Result status={"warning"} title={"只有群管理与群主可编辑群公告"}/>}
                            </>
                        }
                        renderItem = {(item) => (
                            <List.Item>
                                <List.Item.Meta
                                    avatar = {<Avatar src={"https://xsgames.co/randomusers/avatar.php?g=pixel"} />}
                                    title = {item.sender}
                                    description={item.msg_time}
                                />
                                {item.msg_body}
                            </List.Item>
                        )}
                    />
                </div>
            </Modal>

            <Modal title={"转发"} open={forwardModal} onOk={forward} onCancel={() => setForwardModal(false)}>
                <Checkbox.Group
                    style={{display: "grid", height: "60vh", overflow: "scroll" }}
                    onChange={ onForwardChange }
                    options={ messageList.map((arr) => ({
                        label: arr.sender + ":  " + arr.msg_body,
                        value: arr.msg_id,
                    }))}
                />
                <Select showSearch placeholder={"转发到"} options={
                    roomList.map(arr => ({
                        label: arr.roomname,
                        value: arr.roomid,
                    }))
                } onChange={onForwardRoomChanged}/>
            </Modal>

            <Modal title={ "创建群聊" } open={ createGroupModal } onOk={ newGroup } onCancel={() => setCreateGroupModal(false)}>
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

            <Modal title="翻译结果" open={translateModal} onOk={() => setTranslateModal(false)} onCancel={() => setTranslateModal(false)}>
                <p>{translateResult}</p>
            </Modal>

            <Modal title="上传" open={avatarModal} onOk={() => setAvatarModal(false)}/*onOk={() => {
                if(!fileList.length) {
                    message.warning("请选择上传的文件");
                }
                else{
                    console.log(fileList);
                    console.log(fileList[0]);
                    console.log(fileList[0].originFileObj);
                    axios.post("/api/user/upload", {"username": window.username, "avatar": fileList[0].originFileObj})
                    .then((res) => message.success("成功"))
                    .catch((err) => message.warning(err.message));
                    }
            }} */ onCancel={() => setAvatarModal(false)}>
                <div>
                    <iframe id="loader" name="loader" onChange={() => logReturn()}></iframe>
                    <form action="/api/user/upload" method="post" encType="multipart/form-data" target="loader">
                        <input id="image-uploadify" name="avatar" type="file" accept="image/*" multiple/>
                        <input id="text" name="username" type="text" value={"111111"} style={{display: "none"}}/>
                        <button type="submit"> 确认上传 </button>
                    </form>
                </div>
                {/* <Upload fileList={fileList} beforeUpload={(f, fList) => false} onChange={(info) => {
                    setFileList(() => info.fileList.length ? [info.fileList[info.fileList.length - 1]] : []);
                }} >
                    <Button>
                        <UploadOutlined /> 选择文件
                    </Button>
                </Upload> */}
            </Modal>
        </div>
    );
};
export default Screen;