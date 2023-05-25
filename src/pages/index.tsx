import VideoCall from "../components/VideoCall";
import MoodIcon from '@mui/icons-material/Mood';
import PhotoIcon from '@mui/icons-material/Photo';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import AlbumIcon from '@mui/icons-material/Album';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import SendIcon from '@mui/icons-material/Send';
import BadgeIcon from '@mui/icons-material/Badge';
import KeyIcon from '@mui/icons-material/Key';
import EmailIcon from '@mui/icons-material/Email';
import FaceIcon from '@mui/icons-material/Face';
import LogoutIcon from '@mui/icons-material/Logout';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import TelegramIcon from '@mui/icons-material/Telegram';
import SettingsIcon from '@mui/icons-material/Settings';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InsertInvitationIcon from '@mui/icons-material/InsertInvitation';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import AddIcon from '@mui/icons-material/Add';

import React, {useEffect, useRef, useState } from "react";
import * as STRINGS from "../constants/string";
import * as CONS from "../constants/constants";
import { request } from "../utils/network";
import {
    isRead, forwardCard, messageListData, roomListData,
    receiveData, friendListData, roomInfoData, userData, combineData
} from "../components/chat";

import {
    message, Input, Button, Space, Layout, List, Menu, Spin, Badge, Avatar, Popover, Card, Divider, Row, Col,
    Upload, Switch, Mentions, Form, Modal, Checkbox, Select, Result, Image, Radio, RadioChangeEvent,
    Drawer, DatePicker, Collapse
} from "antd";

import {
    ArrowRightOutlined, LockOutlined, LoginOutlined, UserOutlined, ContactsOutlined, UserAddOutlined,
    ArrowLeftOutlined, MailOutlined, SearchOutlined,
    CommentOutlined, UploadOutlined, LoadingOutlined,
    UserSwitchOutlined, IdcardOutlined, UserDeleteOutlined, RestOutlined, CaretRightOutlined
} from "@ant-design/icons";

import type { UploadProps } from "antd";
import moment from "moment";

import {
    Player, ControlBar, ReplayControl, ForwardControl, CurrentTimeDisplay,
    TimeDivider, PlaybackRateMenuButton, VolumeMenuButton
} from "video-react";

import emojiList from "../components/emojiList";
import typeList from "../components/typeList";

import axios from "axios";

import $ from "jquery";
import "video-react/dist/video-react.css";
import {CheckboxValueType} from "antd/es/checkbox/Group";

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
    const [collapsed, setCollapsed] = useState(true);

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
    // 全部room id
    const [allRoomList, setAllRoomList] = useState<number[]>([]);
    const [newRoomMemberList, setNewRoomMemberList] = useState<string[]>([]);

    const [messageList, setMessageList] = useState<messageListData[]>([]);
    const [messageBody, setMessageBody] = useState<string>("");

    const [roomInfoModal, setRoomInfoModal] = useState<boolean>(false);
    const [roomInfo, setRoomInfo] = useState<roomInfoData>({is_private: false, mem_list: [], master: "", manager_list: [], mem_count: 0});
    const [roomTop, setRoomTop] = useState<boolean>(false);
    const [roomNotice, setRoomNotice] = useState<boolean>(true);
    const [roomSpecific, setRoomSpecific] = useState<boolean>(false);
    const [boardModal, setBoardModal] = useState<boolean>(false);

    // 全部好友username
    const [allFriendList, setAllFriendList] = useState<string[]>([]);
    const [isFriend, setIsFriend] = useState<boolean>(false);
    const [friendGroup, setFriendGroup] = useState<string>("");
    const [box, setBox] = useState<number>(0);

    // 创建群聊
    const [createGroupModal, setCreateGroupModal] = useState<boolean>(false);
    const [chatGroupName, setChatGroupName] = useState<string>("");

    // 回复消息
    const [replyMessageID, setReplyMessageID] = useState<number>(-1);
    const [replyMessageBody, setReplyMessageBody] = useState<string>("");
    const [replying, setReplying] = useState<boolean>(false);

    // 翻译模块
    const [translateModal, setTranslateModal] = useState<boolean>(false);
    const [translateResult, setTranslateResult] = useState<string>("");

    const [audioToTextModal, setAudioToTextModal] = useState<boolean>(false);
    const [textResult, setTextResult] = useState<string>("");

    // 消息转发
    const [forwardModal, setForwardModal] = useState<boolean>(false);
    const [forwardList, setForwardList] = useState<number[]>([]);
    // const [combineList, setCombineList] = useState<messageListData[]>([]);
    // const [combineLists, setCombineLists] = useState<Map<number, messageListData[]>>(new Map());
    const [fatherId, setFatherId] = useState<number>(0);

    const [fetchedList, setFetchedList] = useState<combineData[]>([]);
    const [combineModal, setCombineModal] = useState<boolean>(false);

    // 多媒体 及 特殊群聊
    const [avatarModal, setAvatarModal] = useState<boolean>(false);
    const [imageModal, setImageModal] = useState<boolean>(false);
    const [videoModal, setVideoModal] = useState<boolean>(false);
    const [fileModal, setFileModal] = useState<boolean>(false);
    const [audioModal, setAudioModal] = useState<boolean>(false);
    const [specificModal, setSpecificModal] = useState<boolean>(false);

    const [historyModal, setHistoryModal] = useState<boolean>(false);
    const [filterType, setFilterType] = useState<number>(CONS.NO_FILTER);
    const [startTime, setStartTime] = useState<string>("");
    const [endTime, setEndTime] = useState<string>("");
    const [searchMember, setSearchMember] = useState<string>("");
    const [searchType, setSearchType] = useState<string>("");
    const [filterList, setFilterList] = useState<messageListData[]>([]);

    const avatarF = useRef<HTMLFormElement>(null);
    const imageF = useRef<HTMLFormElement>(null);
    const videoF = useRef<HTMLFormElement>(null);
    const fileF = useRef<HTMLFormElement>(null);
    const audioF = useRef<HTMLFormElement>(null);

    const [inviteModal, setInviteModal] = useState<boolean>(false);
    const [inviteUser, setInviteUser] = useState<string>("");

    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
    const [roomApplyList, setRoomApplyList] = useState<messageListData[]>([]);

    const [checkBoxChecked, setCheckBoxChecked] = useState<boolean>(true);

    const onDrawerClose = () => {
        setDrawerOpen(false);
    };

    const [form] = Form.useForm();
    const { Panel } = Collapse;

    // 切换页面时 获取roomlist friendlist roominvitelist
    useEffect(() => {
        if(currentPage === CONS.MAIN) {
            if(menuItem === CONS.CHATFRAME) {
                fetchRoomList();
                fetchRoomInviteList();
                fetchFriendList();
            }
            window.currentRoom = {
                index: 0,
                is_delete: false,
                is_notice: false,
                is_private: false,
                is_specific: false,
                is_top: false,
                message_list: [],
                roomid: 0,
                roomname: ""
            };
        }
    }, [currentPage, menuItem]);

    // 更新全部好友
    useEffect(() => {
        let temp:string[] = [];
        friendList.forEach((arr) => {
            temp = temp.concat(arr.username);
        });
        setAllFriendList(temp);
    }, [friendList]);

    useEffect(() => {
        // 全room id
        let temp: number[] = [];
        roomList.forEach(room => {
            temp = temp.concat(room.roomid);
        });
        setAllRoomList(temp);
    }, [roomList]);

    const scrollRef = useRef<HTMLDivElement>(null);
    // 当本地message更新
    useEffect(() => {
        window.messageList = messageList;
        Read();
        // 保持滚动条在底部
        if (scrollRef.current) {
            const scrollElement = scrollRef.current;
            scrollElement.scrollTop = scrollElement.scrollHeight;
        }
    }, [messageList]);

    useEffect(() => {
        window.roomList = roomList;
    }, [roomList]);

    // 本地修改roomTop后改变会话列表顺序
    useEffect(() => {
        setRoomList(roomList => ((roomList.filter((val => val.is_top)).concat(roomList.filter(val => !val.is_top)))));
    }, [roomTop]);

    // 更新memList
    useEffect(() => {
        window.memList = roomInfo.mem_list;
    }, [roomInfo]);

    // useEffect(() => {
    //     let updateMap = new Map(combineLists);
    //     updateMap.set(fatherId, combineList);
    //     console.log(updateMap);
    //     setCombineLists(updateMap);
    // }, [combineList])

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
                    read_list: data.read_list,
                    avatar: data.avatar,
                    is_delete: data.is_delete
                };
                // setFatherId(data.father_id);
                // setCombineList(combineList => combineList.concat(info));
                // setCombineList(combineList => combineList.concat(info));
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
                    read_list: data.read_list,
                    avatar: data.avatar,
                    is_delete: data.is_delete
                };
                // 更新本地
                if (data.room_id === window.currentRoom.roomid){
                    // B将new msg加入messageList
                    if (data.sender != window.username) {
                        setMessageList(window.messageList.concat(newMessage));
                    }
                    else {
                        let position = window.memList.indexOf(window.username);
                        newMessage.read_list[position] = true;
                        // A更新 read list
                        window.messageList[window.messageList.length - 1].read_list = newMessage.read_list;
                        setMessageList(window.messageList);
                    }
                }

                // 未读消息抓取
                if (data.sender != window.username){
                    fetchRoomList();
                }

                else {
                    // 更新 roomList
                    for (let room of window.roomList){
                        if (room.roomid === data.room_id){
                            room.message_list.push(newMessage);
                            break;
                        }
                    }
                    setRoomList(window.roomList);
                }

                if (data.msg_type === "combine"){
                    getAllCombine(window.messageList);
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
                    // 已读消息id
                    let msgList: number[] = data.read_message_list;
                    if (msgList.length != 0){
                        // 遍历roomList 修改msg
                        window.roomList.forEach(room => {
                            if (room.roomid === data.chatroom_id){
                                room.message_list.forEach(msg => {
                                   if (msgList.indexOf(msg.msg_id) != -1){
                                       msg.read_list[data.index] = true;
                                   }
                                });
                                if (data.chatroom_id === window.currentRoom.roomid){
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
                        if (room.roomid === window.currentRoom.roomid) {
                            setMessageList(room.message_list);
                        }
                        break;
                    }
                }
            }
            else if (data.function === "withdraw_overtime") {
                message.error("消息超时", 1);
            }
            else if (data.function === "send_message_invite"){
                fetchRoomInviteList();
            }
            // 入群申请
            else if (data.function === "fetchinvitelist") {
                let temp: messageListData[] = [];
                data.room_list.forEach((room: roomListData) => {
                    room.message_list.forEach(msg => {
                        temp.push(msg);
                    });
                    if (room.roomid === window.currentRoom.roomid){
                        setRoomApplyList(temp);
                    }
                });
                setRoomApplyList(temp);
            }
            else {
                return;
            }
        };
    };

    const WSOnerror = () => {
        console.log("error重接");
        WSConnect();
    };

    const WSOnclose = () => {
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
                    window.userAvatar = res.avatar;
                    window.password = res.password;
                    setUsername(res.username);
                    setToken(res.token);
                    getAccount(() => "");
                    getPassword(() => "");
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
                    window.userAvatar = res.avatar;
                    window.password = res.password;
                    setUsername(res.username);
                    setToken(res.token);
                    getAccount("");
                    getPassword("");
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
                setUsername("");
                getPassword("");
                getVerification("");
            })
            .catch((err) => message.error(err.message, 1));
    };

    const verifyPassword = () => {
        if (verification === password && currentPage === CONS.REGISTER){
            register();
        }
        else if(currentPage === CONS.MAIN && menuItem === CONS.SETTINGS && verification == newPassword){
            changePassword();
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
                let data = {
                    function: "refresh",
                    friend_list: allFriendList,
                    chatroom_list: allRoomList,
                    refresh: newUsername
                };
                window.ws.send(JSON.stringify(data));
                console.log(data);
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
            .then(() => {message.success(STRINGS.PASSWORD_CHANGE_SUCCESS, 1);window.password = newPassword;})
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
                setMenuItem(CONS.EMPTY);
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
            .then(() => {
                let data = {
                    function: "refresh",
                    friend_list: allFriendList,
                    chatroom_list: allRoomList,
                    refresh: ""
                };
                window.ws.send(JSON.stringify(data));
                setCurrentPage(CONS.LOGIN);
                WSClose();
            })
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
                    setSearchList(res.search_user_list.map((val: any) =>({username: val.username, avatar: val.avatar})));
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
                window.otherAvatar = res.avatar;
                setIsFriend(res.is_friend);
                setMenuItem(CONS.ADDRESSBOOK);
                setAddressItem(CONS.PUBLICINFO);
            })
            .catch((err) => console.log(err));
    };

    const fetchFriendList = () => {
        setFriendListRefreshing(true);
        const data = {
            "function": "fetchfriendlist",
            "username": window.username
        };
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
        setRoomListRefreshing(true);
        const data = {
            "function": "fetch_room",
            "username": window.username
        };
        window.ws.send(JSON.stringify(data));
    };

    // 获取加群消息
    const fetchRoomInviteList = () => {
        let data = {
            function: "fetch_invite_list",
            username: window.username
        };
        window.ws.send(JSON.stringify(data));
    };

    // 加入群聊
    const addRoom = (ID: number, Name: string) => {
        let data = {
            "function": "add_chat",
            "room_name": Name,
            "room_id": ID
        };
        window.ws.send(JSON.stringify(data));
    };

    // 加入分组
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

    // 设为已读
    const Read = () => {
        if (typeof window.memList != "undefined"){
            let position = window.currentRoom.index;
            let readMessageList: number[] = [];
            // 筛选所有未读信息
            window.messageList.filter(msg => (!msg.read_list[position] && msg.sender != window.username)).forEach(arr => {
                readMessageList.push(arr.msg_id);
            });
            const data = {
                "function": "read_message",
                "read_message_list": readMessageList,
                "read_user": window.username,
                "chatroom_id": window.currentRoom.roomid
            };
            window.ws.send(JSON.stringify(data));
            console.log(data);

            // 本地消息状态全部置为已读
            window.messageList.forEach(msg => {
                msg.read_list[position] = true;
            });
            setMessageList(window.messageList);

            // roomList 消息置为已读
            for (let room of window.roomList){
                if (room.roomid === window.currentRoom.roomid){
                    for (let msg of room.message_list){
                        msg.read_list[position] = true;
                    }
                }
            }
            setRoomList(window.roomList);
        }
    };

    // 会话列表中的未读消息数
    const getUnread = (room: roomListData) => {
        let num = 0;
        room.message_list.forEach(msg => {
            if (!msg.read_list[room.index] && msg.sender != window.username){
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
            window.ws.send(JSON.stringify(data));

            let date = new Date();
            let temp: boolean[] = [];
            for (let i=0; i<window.memList.length; ++i){
                temp.push(false);
            }
            let newMessage = {
                "msg_id": -1,
                "msg_type": MessageType,
                "msg_body": Message,
                "reply_id": reply_id,
                "msg_time": moment(date).format("YYYY-MM-DD HH:mm:ss"),
                "sender": window.username,
                "avatar": window.userAvatar,
                "read_list": temp,
                "is_delete": false,
            };
            // 更新本地messageList
            setMessageList(messageList => messageList.concat(newMessage));
        }
        else {
            message.error("输入不能为空", 1);
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
                "read_list": [],
                "is_delete": false,
            };
            setMessageList(messageList => messageList.concat(newMessage));
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
        const data = {
            "function": "revise_is_top",
            "chatroom_id": window.currentRoom.roomid,
            "is_top": set,
        };
        // 依次更新 roomlist roomtop
        roomList.forEach(arr => {
            if (arr.roomid === window.currentRoom.roomid){
                arr.is_top = set;
            }
        });
        setRoomTop(set);
        window.ws.send(JSON.stringify(data));
    };

    const setNotice = (set: boolean) => {
        const data = {
            "function": "revise_is_notice",
            "chatroom_id": window.currentRoom.roomid,
            "is_notice": !set,
        };
        // 依次更新 roomlist roomnotice
        roomList.forEach(arr => {
            if (arr.roomid === window.currentRoom.roomid){
                arr.is_notice = !set;
            }
        });
        setRoomNotice(!set);
        window.ws.send(JSON.stringify(data));
    };

    const setSpecific = (set: boolean) => {
        const data = {
            "function": "revise_is_specific",
            "chatroom_id": window.currentRoom.roomid,
            "is_specific": set,
        };
        // 依次更新 roomlist roomspecific
        roomList.forEach(arr => {
            if (arr.roomid === window.currentRoom.roomid){
                arr.is_specific = set;
            }
        });
        setRoomSpecific(set);
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
            setMessageBody(form.getFieldValue("box") + item);
        }
    };

    // 提及过滤自己
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
        window.ws.send(JSON.stringify(data));
        setNewRoomMemberList([]);
        setChatGroupName("");
        setCreateGroupModal(false);
    };

    const onMsgChange = (value: string) => {
        setMessageBody(value);
    };

    // 公告
    const onBoardChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setMessageBody(e.target.value);
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
    };

    const onForwardModalChanged = (value: number) => {
        window.forwardRoomId = value;
    };

    // 合并转发
    const forward = () => {
        if (typeof window.forwardRoomId != "undefined"){
            const data = {
                function: "send_message",
                msg_type: "combine",
                msg_body: "",
                combine_list: forwardList,
                transroom_id: window.forwardRoomId
            };
            window.ws.send(JSON.stringify(data));
            console.log(data);

            let date = new Date();
            let newMessage = {
                "msg_id": -1,
                "msg_type": "combine",
                "msg_body": "",
                "msg_time": moment(date).format("YYYY-MM-DD HH:mm:ss"),
                "sender": window.username,
                "read_list": [],
                "combine_list": forwardList,
                "avatar": window.userAvatar,
                "is_delete": false
            };


            if(window.forwardRoomId === window.currentRoom.roomid)
            {
                setMessageList(messageList => messageList.concat(newMessage));
            }
        // for (let room of roomList){
        //     if (room.roomid === window.forwardRoomId){
        //         room.message_list.push(newMessage as messageListData);
        //     }
        // }
            setForwardList([]);
            setCheckBoxChecked(false);
            setForwardModal(false);
        }
        else {
            message.error("请选择会话", 1);
        }

        //window.forwardRoomId = 0;
    };

    const onInviteChange = ({ target: { value } }: RadioChangeEvent) => {
        setInviteUser(value);
    };

    // 获取被转发的消息
    const getAllCombine = (List: messageListData[]) => {

        let combineMessages = List.filter(arr => arr.msg_type === "combine");
        combineMessages.forEach((arr) => {
            fetchMessage(arr.msg_id);
        })
    };

    // 获取单个消息
    const fetchMessage = (father_id: number) => {
        let data = {
            "function": "fetch_message",
            "father_id": father_id,
        };
        window.ws.send(JSON.stringify(data));
    };

    const leaveChatGroup = () => {
        let data = {
            function: "leave_group",
            chatroom_id: window.currentRoom.roomid
        };
        window.ws.send(JSON.stringify(data));
        window.currentRoom = {
            index: 0,
            is_delete: false,
            is_notice: false,
            is_private: false,
            is_specific: false,
            is_top: false,
            message_list: [],
            roomid: 0,
            roomname: ""
        };
        setCreateGroupModal(false);
        fetchRoomList();
    };

    const deleteChatGroup = () => {
        let data = {
            function: "delete_chat_group",
            chatroom_id: window.currentRoom.roomid
        };
        window.ws.send(JSON.stringify(data));
        window.currentRoom = {
            index: 0,
            is_delete: false,
            is_notice: false,
            is_private: false,
            is_specific: false,
            is_top: false,
            message_list: [],
            roomid: 0,
            roomname: ""
        };
        setCreateGroupModal(false);
    };

    const recall = (id: number, is_private: boolean, is_admin: boolean) => {
        const data = {
            "function": "withdraw_message",
            "msg_id": id,
            "is_private": is_private,
            "is_admin": is_admin
        };
        window.ws.send(JSON.stringify(data));
        for (let i = window.messageList.length - 1; i >= 0; i--){
            if (window.messageList[i].msg_id === id){
                window.messageList[i].msg_body = "该消息已被撤回";
                break;
            }
        }
        setMessageList(window.messageList);
    };

    const translateConfig = {
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
        axios.post(`/translate/${"translate?&doctype=json&type=AUTO&i="+message}`,{}, translateConfig)
            .then((res) => {
                setTranslateResult(res.data.translateResult[0][0].tgt);
                setTranslateModal(true);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const audioToText = (fileurl: string) => {
        request(
            "api/user/audio",
            "POST",
            {
                url: fileurl,
            },
        )
            .then((res) => {
                setTextResult(res.result);
                setAudioToTextModal(true);
            })
            .catch((err) => message.error(err.message, 1));
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
                "chatroom_id": window.currentRoom.roomid,
                "manager_name": username
            };
            window.ws.send(JSON.stringify(data));
            roomInfo.manager_list.push(username);
        }
        else if (identity(username) === CONS.MANAGER){
            let data = {
                "function": "remove_manager",
                "chatroom_id": window.currentRoom.roomid,
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
            "chatroom_id": window.currentRoom.roomid,
            "new_master_name": username
        };
        window.ws.send(JSON.stringify(data));
        roomInfo.master = username;
    };

    const removeMem = (username: string) => {
        let data = {
            "function": "remove_group_member",
            "chatroom_id": window.currentRoom.roomid,
            "member_name": username
        };
        window.ws.send(JSON.stringify(data));
        let pos = roomInfo.mem_list.indexOf(username);
        roomInfo.mem_list.splice(pos, 1);
    };

    const showReply = (id: number) => {
        let message: string = "";
        window.messageList.forEach(msg => {
            if (msg.msg_id === id){
               message = msg.msg_body;
            }
        });
        return (
            <div>{`回复： ${message}`}</div>
        );
    };

    const filter = () => {
        if (filterType === CONS.NO_FILTER)
        {
            setFilterList(() => messageList);
        }
        else if (filterType === CONS.FILTER_BY_MEMBER)
        {
            setFilterList(() => messageList.filter((val) => val.sender === searchMember));
        }
        else if (filterType === CONS.FILTER_BY_TYPE)
        {
            setFilterList(() => messageList.filter((val) => val.msg_type === searchType));
        }
        else if (filterType === CONS.FILTER_BY_TIME)
        {
            setFilterList(() => messageList.filter((val) => (val.msg_time.substring(0,10) >= startTime && val.msg_time.substring(0,10) <= endTime)));
        }
    };

    const deleteMessage = (msg_id: number) => {
        let data = {
            "function": "delete_message",
            "msg_id": msg_id
        };
        window.ws.send(JSON.stringify(data));
        setMessageList((messageList) => messageList.filter((val) => val.msg_id != msg_id));
        filter();
    };

    const handleOpenChanged = (newOpen: boolean) => {
        setRoomInfoModal(newOpen);
    };

    const id2str = (id: number) => {
        if (id === CONS.MASTER){
            return "群主";
        }
        else if (id === CONS.MANAGER){
            return "管理员";
        }
        else if (id === CONS.MEMBER){
            return "成员";
        }
    };

    const replyAddGroup = (id: number, Answer: number) => {
        let data = {
            function: "reply_add_group",
            chatroom_id: window.currentRoom.roomid,
            message_id: id,
            answer: Answer
        };
        window.ws.send(JSON.stringify(data));
        setRoomApplyList([]);
    };

    const matchPassword = () => {
        console.log(window.password);
        if(password === window.password)
        {
            message.success("密码正确", 1);
            fetchRoomInfo(window.tempRoom.roomid);
            addRoom(window.tempRoom.roomid, window.tempRoom.roomname);
            window.currentRoom = window.tempRoom;
            setRoomNotice(window.tempRoom.is_notice);
            setRoomTop(window.tempRoom.is_top);
            setRoomSpecific(window.tempRoom.is_specific);
            setMessageList(window.tempRoom.message_list);
            getAllCombine(window.tempRoom.message_list);
            setSpecificModal(false);
        }
        else
        {
            message.error("密码错误", 1);
        }
    };

    // 地址字符串特殊显示
    const str2addr = (text : string, readlist: boolean[]) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g; // 匹配 URL 的正则表达式
        const atRegex = /(@[A-Za-z0-9]+)/g;
        const parts = text.split(urlRegex); // 使用正则表达式拆分字符串
        let partss: string[] = [];
        parts.forEach((part) => {
            if(typeof part != undefined)
            {
                if(part.match(urlRegex)){
                    partss = partss.concat([part]);
                }
                else
                {
                    partss = partss.concat(part.split(atRegex));
                }
            }
        });
        return (
            <div>
                {
                    partss.map((part, i) => {
                    if (part.match(urlRegex)) {
                        return (
                            <a target="_blank" href={part} rel="noopener noreferrer" key={i}>
                                {part}
                            </a>
                        );
                    }
                    else if (part.match(atRegex) && roomInfo.mem_list.lastIndexOf(part.substring(1)) != -1) {
                        return (
                            <Popover trigger={"hover"} content={
                                <Space direction={"horizontal"} size={"small"}>
                                    <p>{part.substring(1)+(readlist[roomInfo.mem_list.lastIndexOf(part.substring(1))] ? "已读" : "未读")}</p>
                                </Space>
                            } key = {i}>
                                <span style={{color: "blue"}} onClick={() => {
                                    window.otherUsername = part.substring(1);
                                    checkFriend();
                                }} key={ i }>{part}</span>
                            </Popover>
                        );
                    }
                    else {
                        return <span key={ i }>
                            {part}
                        </span>;
                    }
                })}
            </div>
        );
    };

    const logReturn = () => {
        $("#loader").load(function() {
            const text = $("#loader").contents().find("body").text();
            const j = $.JSON.parse(text);
            console.log("j", j);
        });
    };

    const handleCombine = (list?: number[]) => {
        request(
            "api/user/message",
            "POST",
            {
                combine_list: list
            },
        )
            .then((res) => {
                console.log(res.msg_list);
                setFetchedList(res.msg_list.map((val: any) => ({...val})));
                setCombineModal(true);
            })
            .catch((err) => message.error(err.message, 1));
    };

    // const handleCombine2 = (list?: number[]) => {
    //     if(list)
    //     {
    //         list.map((val, id) => {
    //             request(
    //                 "api/user/message",
    //                 "POST",
    //                 {
    //                     msg_id: val
    //                 },
    //             )
    //                 .then((res) => {
    //                     console.log(res);
    //                     setFetchedList((fetchedList) => fetchedList.concat([{msg_id: res.msg_id, msg_body: res.msg_body, msg_time: res.msg_time, msg_type: res.msg_type, sender: res.msg_sender, avatar: res.avatar}]));
    //                     if(id === list.length - 1)
    //                     {
    //                         setCombineModal(true);
    //                     }
    //                 })
    //                 .catch((err) => message.error(err.message, 1));
    //         })
    //     }
    // };

    //会话具体信息
    const roomInfoPage = (
        <div style={{padding: "12px"}}>
            <Space direction={"vertical"}>
                <List
                    grid={{gutter: 8, column: 2}}
                    dataSource={roomInfo.mem_list}
                    renderItem={(item) => (
                        <List.Item>
                            <Card
                                style={{width: 200, margin: 8}}
                                actions={[
                                    (item !== window.username ?
                                            <Popover trigger={"hover"} content={"添加好友"}>
                                                <UserAddOutlined key={"add_friend"} onClick={() => {
                                                    addFriend(item);
                                                }}/>
                                            </Popover> : null
                                    ),
                                    (identity(window.username) === CONS.MASTER && item !== window.username ?
                                            <Popover trigger={"hover"} content={identity(item) === CONS.MEMBER ? "任命管理员" : "解除管理"}>
                                                <UserSwitchOutlined key={"setManager"} onClick={() => {
                                                    setManager(item);
                                                }}/>
                                            </Popover> : null
                                    ),
                                    (identity(window.username) === CONS.MASTER && item != window.username ?
                                            <Popover trigger={"hover"} content={"转让群主"}>
                                                <IdcardOutlined key={"setMaster"} onClick={() => {
                                                    setMaster(item);
                                                }}/>
                                            </Popover> : null
                                    ),
                                    (identity(window.username) > identity(item) ?
                                            <Popover trigger={"hover"} content={"踢出成员"}>
                                                <UserDeleteOutlined key={"kick"} onClick={() => {
                                                    removeMem(item);
                                                }}/>
                                            </Popover>: null
                                    )
                                ]}>
                                <Meta
                                    avatar={<Avatar src="https://xsgames.co/randomusers/avatar.php?g=pixel"/>}
                                    title={item}
                                    description={!roomInfo.is_private ? id2str(identity(item)) : null}
                                />
                            </Card>
                        </List.Item>
                    )}
                />
                <Popover trigger={"hover"} content={roomInfo.is_private ? "建立群聊" : "邀请进群"}>
                <AddIcon
                    onClick={() => {
                    setRoomInfoModal(false);
                    setInviteModal(true);
                }}/>
                </Popover>
                {roomInfo.is_private ? null: (<h2>{`群聊名称   ${typeof window != "undefined" && typeof window.currentRoom != "undefined" ? window.currentRoom.roomname : null}`}</h2>)}

                <Space direction={"horizontal"}>
                    <p>消息免打扰</p>
                    <Switch checked={!roomNotice} onChange={setNotice}/>
                </Space>
                <Space direction={"horizontal"}>
                    <p>置顶聊天</p>
                    <Switch checked={roomTop} onChange={setTop}/>
                </Space>
                <Space direction={"horizontal"}>
                    <p>二次验证</p>
                    <Switch checked={roomSpecific} onChange={setSpecific}/>
                </Space>

                {roomInfo.is_private ? null : (
                    <Space direction={"horizontal"}>
                        <Popover trigger={"hover"} content={"群公告"}>
                        <InsertInvitationIcon onClick={() => {
                            setRoomInfoModal(false);
                            setBoardModal(true);
                        }}/>
                        </Popover>
                        {typeof window != "undefined" && identity(window.username) >= CONS.MANAGER ? (
                                <Popover trigger={"hover"} content={"申请列表"}>
                                <FormatListBulletedIcon onClick={() => {
                                    setRoomInfoModal(false);
                                    setDrawerOpen(true);
                                }}/>
                                </Popover>
                            ) : null}
                        <Popover trigger={"hover"} content={"退出群聊"}>
                            <KeyboardBackspaceIcon onClick={leaveChatGroup}/>
                        </Popover>
                        {typeof window != "undefined" && identity(window.username) === CONS.MASTER ? (
                            <Popover trigger={"hover"} content={"解散群聊"}>
                                <ClearIcon onClick={deleteChatGroup}/>
                            </Popover>
                        ) : null}
                    </Space>
                )}
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
                                onClick={() => {
                                    setCurrentPage(CONS.LOGIN);
                                    getPassword( "");
                                }}>
                                返回登录
                            </Button>
                        </div>
                    </div>
                ) : null}


                {currentPage === CONS.MAIN ? (
                    <div>
                        <Layout style={{ minHeight: "100vh" }} >
                            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} theme={"light"}>
                                <Menu theme={"light"} defaultSelectedKeys={["1"]} mode="inline">


                                    <Menu.Item icon={<TelegramIcon />} key={"1"} onClick={()=> setMenuItem(CONS.CHATFRAME)}> 聊天 </Menu.Item>

                                    <Menu.Item icon={<PersonIcon />} key={"2"} onClick={()=> setMenuItem(CONS.ADDRESSBOOK)}> 通讯录 </Menu.Item>

                                    <Menu.Item icon={<SettingsIcon />} key={"3"} onClick={()=> setMenuItem(CONS.SETTINGS)}> 设置 </Menu.Item>
                                </Menu>
                            </Sider>

                            <Content className="site-layout">
                                { /*聊天组件*/}
                                {menuItem === CONS.CHATFRAME ? (
                                    <div style={{ display: "flex", flexDirection: "row" }}>
                                        <div style={{ padding: "0 24px", backgroundColor:"#FFFFFF",  width:"20%", minHeight:"100vh" }}>
                                            <div style={{height: "3vh", margin: "10px", flexDirection: "row"}}>
                                                <Space direction={"horizontal"}>
                                                    <Popover trigger={"hover"} content={"创建群聊"}>
                                                        <AddCircleIcon onClick={() => setCreateGroupModal(true) }/>
                                                    </Popover>
                                                </Space>
                                            </div>
                                            {roomListRefreshing ? (
                                                <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}/>
                                            ) : (
                                                <div style={{overflow: "auto", height: "80vh"}}>
                                                    {roomList.length === 0 ? (
                                                        <p>暂无会话</p>
                                                    ) : (
                                                        <List
                                                            dataSource={ roomList }
                                                            renderItem={(item) => (
                                                                <List.Item key={item.roomid}>
                                                                    <Card bordered={false} onClick={()=> {
                                                                        if(item.is_specific === true) {
                                                                            window.tempRoom = item;
                                                                            setSpecificModal(true);
                                                                        }
                                                                        else {
                                                                            window.currentRoom = item;
                                                                            fetchRoomInfo(item.roomid);
                                                                            fetchRoomInviteList();
                                                                            addRoom(item.roomid, item.roomname);
                                                                            setMessageList(item.message_list);
                                                                            setRoomNotice(item.is_notice);
                                                                            setRoomTop(item.is_top);
                                                                            setRoomSpecific(item.is_specific);
                                                                            getAllCombine(item.message_list);
                                                                        }
                                                                    }}>
                                                                        <Meta
                                                                            avatar={
                                                                                <Badge count={ item.is_notice ? getUnread(item) : 0}>
                                                                                    <Avatar icon={ <CommentOutlined/> }/>
                                                                                </Badge>
                                                                            }
                                                                            title={item.roomname}
                                                                        />
                                                                    </Card>
                                                                </List.Item>
                                                            )}
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* 消息页面 */}
                                        {typeof window.currentRoom != "undefined" && window.currentRoom.roomid === 0 ? null : (
                                            <div style={{ padding: "0 24px", backgroundColor:"#FFF5EE",  width:"80%", minHeight:"100vh" }}>
                                                <div style={{height: "3vh", margin: "10px", flexDirection: "row"}}>
                                                    <Space>
                                                        <h1> { typeof window.currentRoom != "undefined" ?  window.currentRoom.roomname : "" } </h1>
                                                        <Popover placement={"bottomLeft"} content={ roomInfoPage } trigger={"click"} open={roomInfoModal} onOpenChange={handleOpenChanged}>
                                                            <MoreHorizIcon onClick={() => setRoomInfoModal(true)}/>
                                                        </Popover>
                                                    </Space>
                                                </div>
                                                <Divider type={"horizontal"}/>
                                                <div style={{padding: "24px", position: "relative", height: "60vh", overflow: "auto"}} ref={scrollRef}>
                                                    <List
                                                        dataSource={ messageList.filter((msg) => (msg.msg_type != "notice" && msg.msg_type != "invite" && !msg.is_delete)) }
                                                        split={ false }
                                                        renderItem={(item) => (
                                                            <List.Item key={ item.msg_id }>
                                                                { item.msg_body != "该消息已被撤回" ? (
                                                                    <>
                                                                        <Popover trigger={"contextMenu"} placement={"top"} content={
                                                                            <Space direction={"horizontal"} size={"small"}>
                                                                                <Button type={"text"} onClick={() => {setForwardModal(true); setCheckBoxChecked(true);}}> 转发 </Button>
                                                                                <Button type={"text"} onClick={() => deleteMessage(item.msg_id)}> 删除 </Button>
                                                                                <Button type={"text"} onClick={() => {setReplying(true); setReplyMessageID(item.msg_id); setReplyMessageBody(item.msg_body);}}> 回复 </Button>
                                                                                { item.msg_type === "text" ? (
                                                                                    <Button type={"text"} onClick={() => translate(item.msg_body)}> 翻译 </Button>
                                                                                ) : null }
                                                                                { item.msg_type === "audio" ? (
                                                                                    <Button type={"text"} onClick={() => audioToText(item.msg_body)}> 转文字 </Button>
                                                                                ) : null }
                                                                                { item.sender === window.username && window.currentRoom.is_private ? (
                                                                                    <Button type={"text"} onClick={() => recall(item.msg_id, true, false)}> 撤回 </Button>
                                                                                ) : null }
                                                                                { item.sender === window.username && !window.currentRoom.is_private ? (
                                                                                    <Button type={"text"} onClick={() => recall(item.msg_id, false, false)}> 撤回 </Button>
                                                                                ) : null }
                                                                                { identity(window.username) > identity(item.sender) && !window.currentRoom.is_private ? (
                                                                                    <Button type={"text"} onClick={() => recall(item.msg_id, false, true)}> 撤回 </Button>
                                                                                ) : null }
                                                                            </Space>
                                                                        }>
                                                                            { item.sender === window.username ? (
                                                                                <div style={{ display: "flex", flexDirection: "row-reverse", justifyContent: "flex-start", marginLeft: "auto"}}>
                                                                                    <div style={{display: "flex", flexDirection: "column"}}>
                                                                                        <List.Item.Meta avatar={<Avatar src={("/api"+item.avatar)}/>}/>
                                                                                        <h6>{item.sender}</h6>
                                                                                    </div>
                                                                                    <div style={{ borderRadius: "24px", padding: "12px", display: "flex", flexDirection: "column", backgroundColor: "#7FFFD4"}}>
                                                                                        <span> { item.msg_time } </span>

                                                                                        {isRead(item.read_list, roomInfo.mem_list, roomInfo.is_private, window.username)}

                                                                                        {item.msg_type === "reply" && typeof item.reply_id === "number" ? (
                                                                                            showReply(item.reply_id)
                                                                                        ): null}

                                                                                        {(item.msg_type != "combine" && item.msg_type != "image" && item.msg_type != "video" && item.msg_type != "file" && item.msg_type != "audio") ? (
                                                                                            str2addr(item.msg_body, item.read_list)
                                                                                        ): null}

                                                                                        {item.msg_type === "image" ? (
                                                                                            <Image width={"30vh"} src={("/api"+item.msg_body)}/>
                                                                                        ): null}

                                                                                        {(item.msg_type === "video") ? (
                                                                                            <div style={{width: "50vh"}}>
                                                                                                <Player fluid={true} width={"50vh"}>
                                                                                                    <source src={("/api"+item.msg_body)} width={"200px"}/>
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

                                                                                        {(item.msg_type === "audio") ? (
                                                                                            <div style={{width: "50vh", height: "50px"}}>
                                                                                                <Player fluid={false} width={"50vh"} height={"20px"}>
                                                                                                    <source src={("/api"+item.msg_body)} width={"200px"}/>
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

                                                                                        { item.msg_type === "combine" ? (
                                                                                            <div>
                                                                                                <h4> 转发 </h4>
                                                                                                <Button onClick={() => {
                                                                                                    handleCombine(item.combine_list);
                                                                                                }} type="default">
                                                                                                    转发消息
                                                                                                </Button>
                                                                                            </div>
                                                                                        ) : null}
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <div style={{ display: "flex", flexDirection: "row"}}>
                                                                                    <div style={{display: "flex", flexDirection: "column"}}>
                                                                                        <List.Item.Meta avatar={<Avatar  src={("/api"+item.avatar)}/>}/>
                                                                                        <h6>{item.sender}</h6>
                                                                                    </div>
                                                                                    <div style={{ borderRadius: "24px", padding: "12px", display: "flex", flexDirection: "column", backgroundColor: "#FFFFFF"}}>
                                                                                        {isRead(item.read_list, roomInfo.mem_list, roomInfo.is_private, window.username)}

                                                                                        {item.msg_type === "reply" && typeof item.reply_id === "number" ? showReply(item.reply_id) : null}

                                                                                        {(item.msg_type != "combine" && item.msg_type != "image" && item.msg_type != "video" && item.msg_type != "file" && item.msg_type != "audio") ? (
                                                                                            str2addr(item.msg_body, item.read_list)
                                                                                        ): null}

                                                                                        {item.msg_type === "image" ? (
                                                                                            <Image width={"30vh"} src={("/api"+item.msg_body)}/>
                                                                                        ): null}

                                                                                        {(item.msg_type === "video") ? (
                                                                                            <div style={{width: "50vh"}}>
                                                                                                <Player fluid={true} width={"50vh"}>
                                                                                                    <source src={("/api"+item.msg_body)} width={"200px"}/>
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

                                                                                        {(item.msg_type === "audio") ? (
                                                                                            <div style={{width: "50vh", height: "50px"}}>
                                                                                                <Player fluid={false} width={"50vh"} height={"20px"}>
                                                                                                    <source src={("/api"+item.msg_body)} width={"200px"}/>
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
                                                                                        { item.msg_type === "combine" ? (
                                                                                            <div>
                                                                                                <h1> 转发 </h1>
                                                                                                <Button onClick={() => {
                                                                                                    handleCombine(item.combine_list);
                                                                                                }} type="default">
                                                                                                    查看转发的消息
                                                                                                </Button>
                                                                                            </div>
                                                                                        ) : null}
                                                                                        <span> { item.msg_time } </span>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </Popover>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        { item.sender === window.username ? (
                                                                            <div style={{ display: "flex", flexDirection: "row-reverse", justifyContent: "flex-start", marginLeft: "auto"}}>
                                                                                <div style={{display: "flex", flexDirection: "column"}}>
                                                                                    <List.Item.Meta avatar={<Avatar  src={("/api"+item.avatar)}/>}/>
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
                                                                                    <List.Item.Meta avatar={<Avatar  src={("/api"+item.avatar)}/>}/>
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

                                                            <Popover content={
                                                                <Row gutter={0}>
                                                                {emojiList.map((item) => {
                                                                    return (
                                                                        <Col span={1} onClick={() => {appendEmoji(item.emoji);}} key={item.id}>
                                                                            <div>{ item.emoji }</div>
                                                                        </Col>
                                                                    );
                                                                })}
                                                                </Row>}
                                                                     title="Icons" trigger="click" placement={"topLeft"}>
                                                                    <MoodIcon/>
                                                            </Popover>

                                                            <PhotoIcon onClick={() => setImageModal(true)}/>
                                                            <AlbumIcon onClick={() => setAudioModal(true)}/>
                                                            <OndemandVideoIcon onClick={() => setVideoModal(true)}/>
                                                            <InsertDriveFileIcon onClick={() => setFileModal(true)}/>
                                                            {VideoCall("audio_or_video_" + window.username, "audio_or_video_" + (typeof window.currentRoom != "undefined" ? window.currentRoom.roomname : ""))}
                                                            <AccessTimeIcon onClick={() => {
                                                                setRoomInfoModal(false);
                                                                setHistoryModal(true);
                                                            }}/>

                                                        </Space>
                                                    </div>


                                                    <Form form={form} layout={"horizontal"}>
                                                        {replying ?
                                                            (
                                                            <div>
                                                                <p> {replyMessageBody} </p>
                                                            </div>
                                                        ) : null}

                                                        <Form.Item name={"box"}>
                                                            <Mentions
                                                                rows={4}
                                                                onChange={onMsgChange}
                                                                placement={"top"}
                                                                options={(roomInfo.mem_list.filter(selfFilter)).map((value) => ({
                                                                    key: value,
                                                                    value,
                                                                    label: value,
                                                                }))}
                                                                onPressEnter={() => {replying ? sendMessage(messageBody, "reply", replyMessageID) :
                                                                    sendMessage(messageBody, "text");
                                                                    setReplying(false);
                                                                }}
                                                            />
                                                        </Form.Item>

                                                        <div style={{flexDirection: "row-reverse", display:"flex"}}>
                                                            <SendIcon onClick={() => {replying ? sendMessage(messageBody, "reply", replyMessageID) :
                                                                sendMessage(messageBody, "text");
                                                                setReplying(false);
                                                            }}/>
                                                        </div>
                                                    </Form>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : null}

                                { /*通讯录组件*/}
                                {menuItem === CONS.ADDRESSBOOK ? (
                                    <div style={{ display: "flex", flexDirection: "row" }}>
                                        <div style={{ padding: "0 24px", backgroundColor:"#FFFFFF",  width:"20%", minHeight:"100vh" }}>
                                            <Button type="default" shape={"round"} onClick={()=>setAddressItem(CONS.SEARCH)} icon={<SearchOutlined/>} block> 搜索 </Button>
                                            <Button type="default" shape={"round"} onClick={() => {setAddressItem(CONS.NEWFRIEND); fetchReceiveList(); fetchApplyList();}} block icon={<UserAddOutlined />}> 新的朋友 </Button>

                                            {friendListRefreshing ? (
                                                <Spin indicator={<LoadingOutlined style={{ fontSize: 24, color: "#000000"}} spin />}/>
                                            ) : (
                                                <div style={{ padding: 12  }}>
                                                    {friendList.length === 0 ? (
                                                        <p> 无好友分组 </p>
                                                    ) : (
                                                        <List itemLayout={"vertical"}
                                                              dataSource={friendList}
                                                              renderItem={(item) => (
                                                                  <List.Item
                                                                      actions={[
                                                                          <RestOutlined
                                                                              key={item.groupname}
                                                                              onClick={() => {
                                                                                  deleteGroup(item.groupname);
                                                                                  fetchFriendList();
                                                                              }}
                                                                          />
                                                                      ]}
                                                                  >
                                                                      <Collapse accordion expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}>
                                                                          <Panel header={item.groupname} key={item.groupname} style={{border: "none"}}>
                                                                              <List itemLayout={"vertical"}
                                                                                    dataSource={item.username}
                                                                                    renderItem={(subItem) => (
                                                                                        <List.Item>
                                                                                            <Card bordered={false} style={{ marginTop: 8 }} onClick={() => {
                                                                                                window.otherUsername = subItem;
                                                                                                
                                                                                                checkFriend();
                                                                                            }}>
                                                                                                <Meta
                                                                                                    avatar={ <Avatar icon={<UserOutlined />}/> }
                                                                                                    title={subItem}
                                                                                                />
                                                                                            </Card>
                                                                                        </List.Item>
                                                                                    )}
                                                                              />
                                                                          </Panel>
                                                                      </Collapse>
                                                                  </List.Item>
                                                              )}
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ padding: "24px", backgroundColor:"#FFFFFF",  width:"80%", minHeight:"100vh" }}>
                                            {addressItem === CONS.NEWFRIEND ? (
                                                <div>
                                                    <h2>好友申请</h2>
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
                                                                                    onClick={() => accept(item.username)}>
                                                                                    接受申请
                                                                                </Button>,
                                                                                <Button
                                                                                    disabled={item.make_sure}
                                                                                    key={item.username + "2"}
                                                                                    type="primary"
                                                                                    onClick={() => decline(item.username)}>
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
                                                                            <Avatar src={("/api"+item.avatar)}/>
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
                                                    <Avatar size={64} src={("/api"+window.otherAvatar)}/>
                                                    <h1>{ window.otherUsername }</h1>
                                                    {isFriend ? (
                                                        <div style={{height: "50px", margin: "5px", display: "flex", flexDirection: "row"}}>
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
                                                        <div style={{height: "50px", margin: "5px", display: "flex", flexDirection: "row"}}>
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
                                        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", position: "absolute", marginLeft: "30vh", top: 0, bottom: 0, margin: "auto"
                                    }}>
                                        <h1>
                                            设置
                                        </h1>
                                        <div style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            paddingLeft: "50px",
                                            paddingRight: "50px",
                                            paddingTop: "5px",
                                            paddingBottom: "25px",
                                            border: "1px solid transparent",
                                            borderRadius: "20px",
                                            alignItems: "center",
                                            backgroundColor: "rgba(255,255,255,0.7)"
                                        }}>
                                            <Avatar src={("/api"+window.userAvatar)}/>
                                            <h3>用户名：{ window.username }</h3>
                                            <div style={{height: "50px", margin: "5px", display: "flex", flexDirection: "row"}}>
                                                <Space size={50}>
                                                    <Popover trigger={"hover"} content={"修改用户名"}>
                                                        <BadgeIcon onClick={() => ((changeUserInfo === CONS.REVISE_USERNAME) ? setChangeUserInfo(CONS.NO_REVISE) : setChangeUserInfo(CONS.REVISE_USERNAME))}/>
                                                    </Popover>

                                                    <Popover trigger={"hover"} content={"修改密码"}>
                                                        <KeyIcon onClick={() => ((changeUserInfo === CONS.REVISE_PASSWORD) ? setChangeUserInfo(CONS.NO_REVISE) : setChangeUserInfo(CONS.REVISE_PASSWORD))}/>
                                                    </Popover>

                                                    <Popover trigger={"hover"} content={"修改邮箱"}>
                                                        <EmailIcon onClick={() => ((changeUserInfo === CONS.REVISE_EMAIL) ? setChangeUserInfo(CONS.NO_REVISE) : setChangeUserInfo(CONS.REVISE_EMAIL))}/>
                                                    </Popover>

                                                    <Popover trigger={"hover"} content={"设置头像"}>
                                                        <FaceIcon onClick={() => setAvatarModal(true)}/>
                                                    </Popover>
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
                                                    {/*<Button size={"large"} type={"dashed"} onClick={changeUsername}>*/}
                                                    {/*    确认修改用户名*/}
                                                    {/*</Button>*/}
                                                    <CheckIcon onClick={changeUsername}/>
                                                </div>
                                            ) : null}

                                            {changeUserInfo === CONS.REVISE_PASSWORD ? (
                                                <div style={{margin: "5px", display: "flex", flexDirection: "column", alignItems: "center"}}>
                                                    <Input.Password
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

                                                    <CheckIcon onClick={()=>verifyPassword()}/>
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
                                                        <Popover trigger={"hover"} content={"发送验证码"}>
                                                            <SendIcon onClick={()=>sendEmail()}/>
                                                        </Popover>
                                                    </Space.Compact>
                                                    <br/>
                                                    <CheckIcon onClick={()=>verifySms()}/>
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
                                                    {/*<Button size={"large"} shape={"round"} type={"dashed"} danger={true} onClick={()=>deleteUser()}>*/}
                                                    {/*    确认注销*/}
                                                    {/*</Button>*/}
                                                    <CheckIcon onClick={()=>deleteUser()}/>
                                                </div>
                                            ) : null}
                                            <div style={{height: "50px", margin: "5px", display: "flex", flexDirection: "row"}}>
                                                <Space size={150}>
                                                    <Popover trigger={"hover"} content={"登出"}>
                                                        <LogoutIcon onClick={()=>logout()}/>
                                                    </Popover>

                                                    <Popover trigger={"hover"} content={"注销"}>
                                                        <CancelIcon onClick={() => ((changeUserInfo === CONS.WRITE_OFF) ? setChangeUserInfo(CONS.NO_REVISE) : setChangeUserInfo(CONS.WRITE_OFF))}/>
                                                    </Popover>
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

            <Modal
                title={"群公告"} open={ boardModal } onCancel={() => setBoardModal(false)}
                onOk={() => {
                    sendMessage(messageBody, "notice");
                }} okButtonProps={{disabled: identity(username) == CONS.MANAGER}}>

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
                    // checked={checkBoxChecked}
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
                } onChange={onForwardModalChanged}/>
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

            <Modal title="转换结果" open={audioToTextModal} onOk={() => setAudioToTextModal(false)} onCancel={() => setAudioToTextModal(false)}>
                <p>{textResult}</p>
            </Modal>

            <Modal title="头像上传" footer={[]} open={avatarModal} onOk={() => setAvatarModal(false)} onCancel={() => setAvatarModal(false)}>
                <div>
                    <iframe id="loader" name="loader" onChange={() => logReturn()} style={{display: "none"}}></iframe>
                    <form id="avatarform" ref={avatarF} action="/api/user/upload" method="post" encType="multipart/form-data" target="loader" onSubmit={() => {
                        if(avatarF.current) {
                            const fromdata = new FormData(avatarF.current);
                            axios.post("/api/user/upload", fromdata , avatarconfig)
                                .then((res) => {
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
                            <CheckIcon/>
                        </button>

                    </form>
                </div>
            </Modal>

            <Modal title="图片上传" footer={[]} open={ imageModal } onOk={() => setImageModal(false)} onCancel={() => setImageModal(false)}>
                <div>
                    <iframe id="loaderi" name="loaderi" onChange={() => logReturn()} style={{display: "none"}}></iframe>
                    <form id="imageform" ref={imageF} action="/api/user/uploadfile" method="post" encType="multipart/form-data" target="loaderi" onSubmit={() => {
                        if(imageF.current) {
                            const fromdata = new FormData(imageF.current);
                            axios.post("/api/user/uploadfile", fromdata , avatarconfig)
                                .then((res) => {
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
                            <CheckIcon/>
                        </button>
                    </form>
                </div>
            </Modal>


            <Modal title="视频上传" footer={[]} open={videoModal} onOk={() => setVideoModal(false)} onCancel={() => setVideoModal(false)}>
                <div>
                    <iframe id="loaderv" name="loaderv" onChange={() => logReturn()} style={{display: "none"}}></iframe>
                    <form id="videoform" ref={videoF} action="/api/user/uploadfile" method="post" encType="multipart/form-data" target="loaderv" onSubmit={() => {
                        if(videoF.current) {
                            const fromdata = new FormData(videoF.current);
                            axios.post("/api/user/uploadfile", fromdata , avatarconfig)
                                .then((res) => {
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
                            <CheckIcon/>
                        </button>

                    </form>
                </div>
            </Modal>

            <Modal title="上传音频"
                   footer={[]}
                   open={audioModal}
                   onOk={() => {setAudioModal(false)}}
                   onCancel={() => setAudioModal(false)}>

                <div>
                    <iframe id="loadera" name="loadera" onChange={() => logReturn()} style={{display: "none"}}></iframe>

                    <form id="fileform" ref={audioF} action="/api/user/uploadfile" method="post" encType="multipart/form-data" target="loadera" onSubmit={() => {
                        if(audioF.current) {
                            let fromdata = new FormData(audioF.current);
                            axios.post("/api/user/uploadfile", fromdata , avatarconfig)
                                .then((res) => {
                                    console.log(res.data.file_url);
                                    sendFile("audio", res.data.file_url);
                                })
                                .catch((err) => {
                                    console.log(err);
                                });
                        }
                        setAudioModal(false);
                        return false;
                    }}>
                        <input id="image-uploadify" name="file" type="file" accept="audio/*" multiple={false}/>

                        <button type="submit">
                            <CheckIcon/>
                        </button>


                    </form>
                </div>
            </Modal>

            <Modal title="文件上传" footer={[]} open={fileModal} onOk={() => setFileModal(false)} onCancel={() => setFileModal(false)}>
                <div>
                    <iframe id="loaderf" name="loaderf" onChange={() => logReturn()} style={{display: "none"}}></iframe>
                    <form id="fileform" ref={fileF} action="/api/user/uploadfile" method="post" encType="multipart/form-data" target="loaderf" onSubmit={() => {
                        if (fileF.current) {
                            let fromData = new FormData(fileF.current);
                            axios.post("/api/user/uploadfile", fromData , avatarconfig)
                                .then((res) => {
                                    sendFile("file", res.data.file_url);
                                })
                                .catch(err => {
                                    console.log(err);
                                });
                        }
                        setFileModal(false);
                        return false;
                    }}>
                        <input id="image-uploadify" name="file" type="file" accept=".xlsx,.xls,image/*,.doc,audio/*,.docx,video/*,.ppt,.pptx,.txt,.pdf" multiple={false}/>
                        <button type="submit">
                            <CheckIcon/>
                        </button>

                    </form>
                </div>
            </Modal>

            <Modal title="聊天信息" open={historyModal} onOk={() => setHistoryModal(false)} onCancel={() => setHistoryModal(false)}>
                <div style={{display: "flex", flexDirection: "column"}}>
                    <div style={{display: "flex", flexDirection: "row"}}>
                        <Button
                            type={"primary"}
                            onClick={() => setFilterType(() => CONS.NO_FILTER)}
                        >
                            不过滤
                        </Button>
                        <Button
                            type={"primary"}
                            onClick={() => setFilterType((filterType) => (filterType === CONS.FILTER_BY_TIME ? CONS.NO_FILTER : CONS.FILTER_BY_TIME))}
                        >
                            按时间搜索
                        </Button>
                        <Button
                            type={"primary"}
                            onClick={() => setFilterType((filterType) => (filterType === CONS.FILTER_BY_TYPE ? CONS.NO_FILTER : CONS.FILTER_BY_TYPE))}
                        >
                            按类型搜索
                        </Button>
                        {roomInfo.is_private ? null : (
                            <Button
                                type={"primary"}
                                onClick={() => setFilterType((filterType) => (filterType === CONS.FILTER_BY_MEMBER ? CONS.NO_FILTER : CONS.FILTER_BY_MEMBER))}
                            >
                                按成员搜索
                            </Button>
                        )}
                    </div>
                    {filterType === CONS.NO_FILTER ? (
                        <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                            <Button type="primary" onClick={() => filter()}>
                                搜索记录
                            </Button>
                        </div>
                    ) : null}
                    {filterType === CONS.FILTER_BY_TIME ? (
                        <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                            <DatePicker onChange={(date, datestring) => {setStartTime(() => datestring);}} format={"YYYY-MM-DD"}/>
                            <DatePicker onChange={(date, datestring) => {setEndTime(() => datestring);}} format={"YYYY-MM-DD"}/>

                            <Button type="primary" onClick={() => filter()}>
                                搜索记录
                            </Button>
                        </div>
                    ) : null}
                    {filterType === CONS.FILTER_BY_MEMBER ? (
                        <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                            <List
                                dataSource={roomInfo.mem_list}
                                renderItem={(item) => (
                                    <List.Item
                                        actions={[
                                            <Button
                                                key={item}
                                                size={"small"}
                                                type="default"
                                                onClick={() => {setSearchMember(item);}}>
                                                {item}
                                            </Button>
                                        ]}
                                    >
                                    </List.Item>
                                )}
                            />
                            <Button type="primary" onClick={() => filter()}>
                                搜索记录
                            </Button>
                        </div>
                    ) : null}
                    {filterType === CONS.FILTER_BY_TYPE ? (
                        <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                            <List
                                dataSource={typeList}
                                renderItem={(item) => (
                                    <List.Item
                                        actions={[
                                            <Button
                                                key={item}
                                                size={"small"}
                                                type="default"
                                                onClick={() => {setSearchType(item);}}>
                                                {item}
                                            </Button>
                                        ]}
                                    >
                                    </List.Item>
                                )}
                            />
                            <Button type="primary" onClick={() => filter()}>
                                搜索记录
                            </Button>
                        </div>
                    ) : null}
                    {filterList.length === 0 ? (
                        <p>无消息</p>
                    ) : (
                        <List
                            dataSource={filterList}
                            renderItem={(item) => (
                                <List.Item
                                    actions={[
                                        <ClearIcon onClick={() => {deleteMessage(item.msg_id); filter();}} key={"delete"}/>
                                    ]}
                                >
                                    <div style={{ display: "flex", flexDirection: "row"}}>
                                        <div style={{display: "flex", flexDirection: "column"}}>
                                            <List.Item.Meta avatar={<Avatar  src={("/api"+item.avatar)}/>}/>
                                            <h6>{item.sender}</h6>
                                        </div>
                                        <div style={{ borderRadius: "24px", padding: "12px", display: "flex", flexDirection: "column", backgroundColor: "#FFFFFF"}}>
                                            <p>{item.msg_body }</p>
                                            <span>{ item.msg_time }</span>
                                        </div>
                                    </div>
                                </List.Item>
                            )}
                        />

                    )}
                </div>
            </Modal>

            <Modal title="请输入密码" open={specificModal} onOk={() => matchPassword()} onCancel={() => setSpecificModal(false)}>
                <Input.Password
                    size="large"
                    type="text"
                    maxLength={50}
                    placeholder="请填写密码"
                    prefix={<LockOutlined />}
                    value={password}
                    onChange={(e) => getPassword(e.target.value)}
                />
            </Modal>

            {/* 添加入群 */}
            <Modal title={"选择联系人"} open={inviteModal} onOk={() => {sendMessage(inviteUser, "invite"); setInviteModal(false);}} onCancel={() => setInviteModal(false)}>
                <Radio.Group
                    style={{display: "grid", height: "60vh", overflow: "scroll" }}
                    onChange={ onInviteChange }
                    options={ allFriendList.map((friend) => ({
                        value: friend,
                        label: friend
                    }))}
                />
            </Modal>

            <Modal title={"转发消息"} open={combineModal} onOk={() => setCombineModal(false)} onCancel={() => setCombineModal(false)}>
                <List
                    dataSource={fetchedList}
                    renderItem={(item) => (
                        <List.Item>
                            <div style={{ display: "flex", flexDirection: "row"}}>
                                <div style={{display: "flex", flexDirection: "column"}}>
                                    <List.Item.Meta avatar={<Avatar  src={("/api"+item.avatar)}/>}/>
                                    <h6>{item.msg_sender}</h6>
                                </div>
                                <div style={{ borderRadius: "24px", padding: "12px", display: "flex", flexDirection: "column", backgroundColor: "#FFFFFF"}}>
                                    <p>{item.msg_body }</p>
                                    {item.msg_type === "combine" ? (
                                        <p>该消息类型不可见</p>
                                    ) : null}
                                    <span>{ item.msg_time }</span>
                                </div>
                            </div>
                        </List.Item>
                    )}
                />
            </Modal>

            <Drawer
                title="入群申请"
                placement="right"
                closable={false}
                onClose={onDrawerClose}
                open={drawerOpen}
                getContainer={false}
            >
                <List
                    dataSource={roomApplyList}
                    renderItem={item => (
                        <Space direction={"horizontal"}>
                            <>
                                {item.msg_body}
                            </>
                            <Button disabled={item.msg_answer === 1} onClick={() => {
                                replyAddGroup(item.msg_id, 1);
                            }}>
                                同意
                            </Button>
                            <Button disabled={item.msg_answer === 1} onClick={() =>
                                replyAddGroup(item.msg_id, 0)
                            }>
                                拒绝
                            </Button>
                        </Space>
                    )}
                />
            </Drawer>
        </div>
    );
};
export default Screen;