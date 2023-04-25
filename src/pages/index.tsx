import React, { useState, useEffect } from "react";
import * as STRINGS from "../constants/string";
import { request } from "../utils/network";
import {message, Input, Button, Space, Layout, List, Menu} from "antd";
import { ArrowRightOutlined, LockOutlined, LoginOutlined, UserOutlined, ContactsOutlined, UserAddOutlined, ArrowLeftOutlined, MessageOutlined, SettingOutlined, UsergroupAddOutlined, MailOutlined, SearchOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import * as CONS from "../constants/constants";
import moment from "moment";

interface friendListData {
    groupname: string;
    username: searchData[];
}

interface searchData {
    username: string;
}

interface receiveData {
    username: string;
    is_confirmed: boolean;
    make_sure: boolean;
}

interface roomListData {
    name: string;
    id: string;
}

interface messageListData {
    id: string;
    notice: string;
    sender: string;
    time: string;
}

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
    const [menuItem, setMenuItem] = useState<number>(CONS.CHATFRAME);

    const [token, setToken] = useState<number>(0);

    const { Content, Sider } = Layout;
    const [collapsed, setCollapsed] = useState(false);

    const [friendListRefreshing, setFriendListRefreshing] = useState<boolean>(true);
    const [friendList, setFriendList] = useState<friendListData[]>([]);

    const [newUsername, getNewUsername] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [changeUserInfo, setChangeUserInfo] = useState<number>(0);

    const [searchRefreshing, setSearchRefreshing] = useState<boolean>(false);
    const [searchList, setSearchList] = useState<searchData[]>([]);
    const [searchName, setSearchName] = useState<string>("");
    const [addressItem, setAddressItem] = useState<number>();

    const [receiveList, setReceiveList] = useState<receiveData[]>([]);
    const [receiveRefreshing, setReceiveRefreshing] = useState<boolean>(false);

    const [applyList, setApplyList] = useState<receiveData[]>([]);
    const [applyRefreshing, setApplyRefreshing] = useState<boolean>(false);

    const [roomList, setRoomList] = useState<roomListData[]>([]);
    const [roomListRefreshing, setRoomListRefreshing] = useState<boolean>(true);
    const [messageList, setMessageList] = useState<messageListData[]>([]);
    const [messageListRefreshing, setMessageListRefreshing] = useState<boolean>(false);

    const [otherUsername, setOtherUsername] = useState<string>("");
    const [isFriend, setIsFriend] = useState<boolean>(false);
    const [friendGroup, setFriendGroup] = useState<string>("");
    const [box, setBox] = useState<number>(0);

    const router = useRouter();
    const query = router.query;

    useEffect(() => {
        if(!router.isReady) {
            return;
        }
        if(currentPage === CONS.MAIN) {
            fetchFriendList();
        }
        if(currentPage === CONS.SEARCH) {
            search();
        }
        if(currentPage === CONS.PUBLICINFO) {
            checkFriend();
        }
    }, [router, query, currentPage]);

    const WSConnect = () => {
        window.ws = new WebSocket("wss://se-im-backend-overflowlab.app.secoder.net/wsconnect");
        console.log("开始连接");
        window.ws.onclose = function () {
            WSOnclose();
        };
        window.ws.onerror = function () {
            WSOnerror();
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
            console.log("重置心跳");
            const data = {
                "function": "heartbeat",
            };
            window.ws.send(JSON.stringify(data));
            console.log("发送心跳");
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
        WSConnect();
        
        window.ws.onopen = function () {
            console.log("websocket connected");
            WSHeartBeat();
        };
        window.ws.onmessage = async function (event) {
            const data = JSON.parse(event.data);
            console.log(JSON.stringify(data));
            if (data.function === "receivelist") {
                setReceiveList(data.receivelist.map((val: any) =>({...val})));
                setReceiveRefreshing(false);
            }
            if (data.function === "applylist") {
                setApplyList(data.applylist.map((val: any) => ({...val})));
                setApplyRefreshing(false);
            }
            if (data.function === "fetchroom"){
                setRoomList(data.roomlist.map((val: any) => ({...val})));

            }
            if (data.function === "fetchmessage"){
                setMessageList(data.noticelist.map((val: any) => ({...val})));

            }
            if (data.function === "heartbeatconfirm") {
                WSHeartBeat();
            }
        };
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
                    setToken(res.token);
                    setUsername(res.username);
                    fetchFriendList();
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
                    message.success(STRINGS.LOGIN_SUCCESS, 1);
                    setToken(res.token);
                    setUsername(res.username);
                    fetchFriendList();
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

    const fetchFriendList = () => {
        setFriendListRefreshing(true);
        request(
            "/api/friend/getfriendlist",
            "POST",
            {
                username: username,
                token: token,
            }
        )
            .then((res) => {
                console.log(res.friendlist);
                setFriendList(res.friendlist.map((val: any) => ({...val})));
                setFriendListRefreshing(false);
            })
            .catch((err) => {
                console.log(err);
                setFriendListRefreshing(false);
            });
    };

    const deleteGroup = (group:string) => {
        request(
            "/api/friend/deletefgroup",
            "DELETE",
            {
                token: token,
                fgroup_name: group,
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
                setUsername(newUsername);
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
            .then(() => setCurrentPage(CONS.LOGIN))
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

    const fetchReceiveList = () => {
        setReceiveRefreshing(true);
        const data = {
            "direction": "/friend/client2server",
            "function": "fetchreceivelist",
            "username": username
        };
        window.ws.send(JSON.stringify(data));
    };

    const fetchApplyList = () => {
        setApplyRefreshing(true);
        const data = {
            "direction": "/friend/client2server",
            "function": "fetchapplylist",
            "username": username
        };
        window.ws.send(JSON.stringify(data));
    };

    const accept = (other: string) => {
        const data = {
            "function": "confirm",
            "from": other,
            "to": username,
            "username": username,
            "direction": "/friend/client2server"
        };
        window.ws.send(JSON.stringify(data));
        console.log(other);
    };

    const decline = (other: string) => {
        const data = {
            "function": "decline",
            "from": other,
            "to": username,
            "username": username,
            "direction": "/friend/client2server"
        };
        window.ws.send(JSON.stringify(data));
    };

    const addFriend = () => {
        const data = {
            "direction": "/friend/client2server",
            "from": username,
            "to": otherUsername,
            "function": "apply",
            "username": username
        };
        window.ws.send(JSON.stringify(data));
    };

    const deleteFriend = () => {
        request(
            "/api/friend/deletefriend",
            "DELETE",
            {
                username: username,
                token: token,
                friend_name: otherUsername,
            },
        )
            .then(() => message.success(STRINGS.FRIEND_DELETED, 1))
            .catch((err) => message.error(err.message, 1));
    };

    const checkFriend = () => {
        request(
            "api/friend/checkuser",
            "POST",
            {
                my_username: username,
                check_name: otherUsername,
                token: token
            },
        )
            .then((res) => {
                setIsFriend(res.is_friend);
            })
            .catch((err) => console.log(err));
    };

    const addToGroup = () => {
        request(
            "api/friend/createfgroup",
            "POST",
            {
                username: username,
                token: token,
                fgroup_name: friendGroup,
            },
        )
            .then(() => {
                request(
                    "api/friend/addfgroup",
                    "PUT",
                    {
                        username: username,
                        fgroup_name: friendGroup,
                        friend_name: otherUsername,
                    },
                )
                    .then(() => message.success(STRINGS.FRIEND_GROUP_ADDED, 1))
                    .catch((err) => message.error(err.message, 1));
        
            })
            .catch((err) => message.error(err.message, 1));
    };

    const fetchRoom = () => {
        setRoomListRefreshing(true);
        const data = {
            "username": username,
        };
        window.ws.send(JSON.stringify(data));
    };

    const fetchMessage = (id: string) => {
        setMessageListRefreshing(true);
        const data = {
            "id": id,
            "username": username,
        };
        window.ws.send(JSON.stringify((data)));
    };

    const sendMessage = (id: string) => {
        const date = new Date();
        const data = {
            "id": id,
            "username": username,
            "time": moment(date).format("YYYY-MM-DD hh:mm:ss"),
        };
        window.ws.send(JSON.stringify(data));
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
                                onClick={verifyPassword}>
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
                                    <Menu.Item title={"聊天"} icon={<MessageOutlined/>} key={"1"} onClick={()=>setMenuItem(CONS.CHATFRAME)}> 聊天 </Menu.Item>

                                    <Menu.Item title={"通讯录"} icon={<UsergroupAddOutlined />} key={"2"} onClick={()=>setMenuItem(CONS.ADDRESSBOOK)}> 通讯录 </Menu.Item>

                                    <Menu.Item title={"设置"} icon={<SettingOutlined />} key={"3"} onClick={()=> setMenuItem(CONS.SETTINGS)}> 设置 </Menu.Item>
                                </Menu>
                            </Sider>

                            <Content className="site-layout">

                                { /*聊天组件*/}
                                {menuItem === CONS.CHATFRAME ? (
                                    <div style={{ display: "flex", flexDirection: "row" }}>
                                        <div style={{ padding: "0 24px", backgroundColor:"#FAF0E6",  width:"20%", minHeight:"100vh" }}>
                                            <h3> 会话列表 </h3>
                                        </div>
                                        <div style={{ padding: "24px", backgroundColor:"#FFF5EE",  width:"80%", minHeight:"100vh" }}>
                                            聊天页面
                                        </div>
                                    </div>
                                ) : null}

                                { /*通讯录组件*/}
                                {menuItem === CONS.ADDRESSBOOK ? (
                                    <div style={{ display: "flex", flexDirection: "row" }}>
                                        <div style={{ padding: "0 24px", backgroundColor:"#FAF0E6",  width:"20%", minHeight:"100vh" }}>
                                            <Button type="default" shape={"round"} onClick={()=>{search(); setAddressItem(CONS.SEARCH);}} icon={<SearchOutlined/>} block> 搜索 </Button>
                                            <Button type="default" shape={"round"} onClick={() => {setAddressItem(CONS.NEWFRIEND); fetchReceiveList(); fetchApplyList();}} block icon={<UserAddOutlined />}> 新的朋友 </Button>

                                            <h3> 好友列表 </h3>
                                            {friendListRefreshing ? (
                                                <p> Loading... </p>
                                            ) : (
                                                <div style={{ padding: 12}}>
                                                    <h5> 好友列表 </h5>
                                                    {friendList.length === 0 ? (
                                                        <p> 无好友 </p>
                                                    ) : (
                                                        <List
                                                            bordered
                                                            dataSource={friendList}
                                                            renderItem={(item) => (
                                                                <List.Item
                                                                    actions={[
                                                                        <Button
                                                                            key={item.groupname}
                                                                            type="primary"
                                                                            onClick={() => deleteGroup(item.groupname)}>
                                                                            删除分组
                                                                        </Button>
                                                                    ]}
                                                                >
                                                                    {item.groupname}
                                                                    {item.username.length === 0 ? (
                                                                        <p>该分组为空</p>
                                                                    ) : (
                                                                        <List
                                                                            bordered
                                                                            dataSource={item.username}
                                                                            renderItem={(subitem) => (
                                                                                <List.Item
                                                                                    actions={[
                                                                                        <Button
                                                                                            key={subitem.username}
                                                                                            type="primary"
                                                                                            onClick={() => {
                                                                                                setOtherUsername(subitem.username);
                                                                                                checkFriend();
                                                                                                setAddressItem(CONS.PUBLICINFO);
                                                                                            }}>
                                                                                            查看好友
                                                                                        </Button>
                                                                                    ]}
                                                                                />
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
                                                        <p> Loading... </p>
                                                    ) : (
                                                        <div style={{ padding: 12}}>
                                                            {receiveList.length === 0 ? (
                                                                <p> 无好友申请 </p>
                                                            ) : (
                                                                <List
                                                                    bordered
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
                                                        <p> Loading... </p>
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
                                                    <h1>
                                                        搜素用户
                                                    </h1>
                                                    <Button type="primary" onClick={search}> 搜索 </Button>
                                                    <input style={{ width: "400px", height: "50px", margin: "5px", borderRadius: "12px", borderColor: "#00BFFF" }}
                                                        type="text"
                                                        placeholder="请填写用户名"
                                                        value={searchName}
                                                        onChange={(e) => setSearchName(e.target.value)}
                                                    />
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
                                                                                    type="primary"
                                                                                    onClick={() => {
                                                                                        setOtherUsername(item.username);
                                                                                        checkFriend();
                                                                                        setMenuItem(CONS.PUBLICINFO);
                                                                                    }}
                                                                                >
                                                                                    查看用户界面
                                                                                </Button>
                                                                            ]}>
                                                                            {item.username}
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
                                                    paddingTop: "5px", paddingBottom: "25px", border: "2px solid #00BFFF", borderRadius: "20px",
                                                    alignItems: "center", backgroundColor: "rgba(255,255,255,0.7)"
                                                }}>
                                                    <h1>{otherUsername}</h1>
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
                                                            <Button type="primary" onClick={() => (addFriend())} >
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
                                                            <Button type="primary" onClick={()=>addToGroup()} >
                                                                确认添加至小组
                                                            </Button>
                                                        </div>
                                                    ) : null}
                                                    <Button type="primary" onClick={() => setMenuItem(CONS.SEARCH)}> 返回搜索 </Button>
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
                                            <h3>当前用户：{username}</h3>
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
