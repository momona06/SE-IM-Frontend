import React, { useRef, useState, useEffect } from "react";
import * as STRINGS from "../constants/string";
import { request } from "../utils/network";
import { message, Input, Button, Space, Layout, List, Menu } from "antd";
import { ArrowRightOutlined, LockOutlined, LoginOutlined, UserOutlined, ContactsOutlined, UserAddOutlined, ArrowLeftOutlined, MessageOutlined, SettingOutlined, UsergroupAddOutlined, MailOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import * as PAGES from "../constants/constants";

interface friendlistdata {
    groupname: string;
    userlist: searchdata[];
}

interface searchdata {
    username: string;
}

interface receivedata {
    username: string;
    is_confirmed: boolean;
    make_sure: boolean;
}



export const isEmail = (val : string) => {
    //仅保留是否为邮件的判断，其余交给后端
    return /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/i.test(val);
};

//登录界面
const LoginScreen = () => {
    const [account, getAccount] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [password, getPassword] = useState<string>("");
    const [verification,getVerification] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(PAGES.LOGIN);
    const [token, setToken] = useState<number>(0);

    const { Content, Sider } = Layout;
    const [collapsed, setCollapsed] = useState(false);

    const [friendlistRefreshing, setFriendlistRefreshing] = useState<boolean>(true);
    const [friendlist, setFriendlist] = useState<friendlistdata[]>([]);

    const [newUsername, getNewUsername] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [changeUserInfo, setChangeUserInfo] = useState<number>(0);

    const [searchRefreshing, setSearchRefreshing] = useState<boolean>(false);
    const [searchlist, setSearchlist] = useState<searchdata[]>([]);
    const [searchName, setSearchName] = useState<string>("");

    const [receivelist, setReceivelist] = useState<receivedata[]>([]);
    const [receiveRefreshing, setReceiveRefreshing] = useState<boolean>(false);

    const [applylist, setApplylist] = useState<receivedata[]>([]);
    const [applyRefreshing, setApplyRefreshing] = useState<boolean>(false);


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

        if(currentPage === PAGES.MAIN) {
            fetchFriendlist();
        }
        if(currentPage === PAGES.SEARCH) {
            search();
        }
        if(currentPage === PAGES.PUBLICINFO) {
            checkFriend();
        }
    }, [router, query, currentPage]);


    const getIndex = (groupname: string) => {
        friendlist.forEach((val, idx, arr) => {
            if (val.groupname === groupname) {
                return(idx);
            }
        });
        return(-1);
    };

    const WSconnect = () => {
        window.ws = new WebSocket("wss://se-im-backend-overflowlab.app.secoder.net/wsconnect");
        console.log("开始连接");
        window.ws.onclose = function () {
            WSonclose();
        };
        window.ws.onerror = function () {
            WSonerror();
        };
    };

    const WSonerror = () => {
        console.log("Websocket断开");
        console.log("error重接");
        WSconnect();
    };

    const WSonclose = () => {
        console.log("Websocket断开连接");
        if (window.heartBeat === true) {
            console.log("close重接");
            WSconnect();
        }
    };

    const WSheartbeat = () => {
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

    const WSclose = () => {
        window.heartBeat = false;
        console.log("关闭");
        if (window.ws) {
            window.ws.close();
        }
        clearInterval(window.timeoutObj);
        clearTimeout(window.serverTimeoutObj);
    };


    const login = () => {
        WSconnect();
        
        window.ws.onopen = function () {
            console.log("websocket connected");
            WSheartbeat();
        };
        window.ws.onmessage = async function (event) {
            message.success("received something", 1);
            var data = JSON.parse(event.data);
            console.log(JSON.stringify(data));
            if (data.function === "receivelist") {
                setReceivelist(data.receivelist.map((val: any) =>({...val})));
                setReceiveRefreshing(false);    

            }
            if (data.function === "applylist") {
                setApplylist(data.applylist.map((val: any) => ({...val})));
                setApplyRefreshing(false);

            }
            if (data.function === "heartbeatconfirm") {
                WSheartbeat();
            }
                                                
            console.log(data);

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
                    fetchFriendlist();
                    setCurrentPage(PAGES.MAIN);
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
                    fetchFriendlist();
                    setCurrentPage(PAGES.MAIN);
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
                setCurrentPage(PAGES.LOGIN);
            })
            .catch((err) => message.error(err.message, 1));
    };

    const verifyPassword = () => {
        if (verification === password){
            if (currentPage === PAGES.REGISTER) {
                register();
            }
            if (currentPage === PAGES.PRIVATEINFO) {
                changePassword();
            }
        }
        else{
            message.warning(STRINGS.PASSWORD_INCONSISTENT, 1);
        }
    };

    const fetchFriendlist = () => {
        setFriendlistRefreshing(true);
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
                setFriendlist(res.friendlist.map((val: any) => ({...val})));
                setFriendlistRefreshing(false);
            })
            .catch((err) => {
                // message.error(err.message, 1);
                setFriendlistRefreshing(false);
            });
    };

    const deletegroup = (group:string) => {
        request(
            "/api/friend/deletefgroup",
            "DELETE",
            {
                token: token,
                fgroup_name: group,
            }
        )
            .then((res) => {
                fetchFriendlist();
            })
            .catch((err) => {
                alert(err);
            });
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

    const changeEmail = () => {
        request(
            "/api/user/revise",
            "PUT",
            {
                revise_field: "email",
                revise_content: email,
                username: username,
                input_password: password,
                token: token,
            },
        )
            .then(() => message.success(STRINGS.EMAIL_CHANGE_SUCCESS, 1))
            .catch((err) => message.error(err.message, 1));
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
                setCurrentPage(PAGES.LOGIN);
                WSclose();
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
            .then(() => setCurrentPage(PAGES.LOGIN))
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
                    setSearchlist(res.search_user_list.map((val: any) =>({username: val})));
                    setSearchRefreshing(false);
                })
                .catch((err) => {
                    message.error(err.message, 1);
                    setSearchRefreshing(false);
                });
        }
        
    };

    const fetchReceivelist = () => {
        setReceiveRefreshing(true);
        const data = {
            "direction": "/friend/client2server",
            "function": "fetchreceivelist",
            "username": username
        };
        window.ws.send(JSON.stringify(data));
    };

    const fetchApplylist = () => {
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
            .then(() => {
                message.success(STRINGS.FRIEND_DELETED, 1);
            })
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
            .then((res) => {
                request(
                    "api/friend/addfgroup",
                    "PUT",
                    {
                        username: username,
                        fgroup_name: friendGroup,
                        friend_name: otherUsername,
                    },
                )
                    .then((res) => {
                        message.success(STRINGS.FRIEND_GROUP_ADDED, 1);
                    })
                    .catch((err) => message.error(err.message, 1));
        
            })
            .catch((err) => message.error(err.message, 1));
    };










    return (
        <div style={{
            width: "100%", height: "100%", position: "absolute", top: 0, left: 0, alignItems: "center",
            backgroundImage: "url(\"https://stu.cs.tsinghua.edu.cn/new/images/blur-light.jpg\")",
            backgroundSize: "1920px 1200px", backgroundPosition: "center", backgroundRepeat: "no-repeat"
        }}>
            <div style={{
                display: "flex", flexDirection: "column", justifyContent: "center ", alignItems: "center", position: "absolute",
                top: 0, bottom: 0, left: 0, right: 0, margin: "auto"
            }}>
                {currentPage === PAGES.LOGIN ? (
                    <div>
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
                                        onClick={() => setCurrentPage(PAGES.REGISTER)}>
                                        注册新账户
                                    </Button>
                                </Space>
                            </div>
                        </div>
                    </div>
                ) : null}
                {currentPage === PAGES.REGISTER ? (
                    <div>
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
                            <Button type={"link"} icon={<ArrowLeftOutlined />} size={"large"}
                                onClick={() => setCurrentPage(PAGES.LOGIN)}>
                                    返回登录
                            </Button>
                        </div>
                    </div>
                ) : null}
                {currentPage === PAGES.MAIN ? (
                    <div>
                        <Layout style={{ minHeight: "100vh" }}>
                            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                                <div style={{ height: 32, margin: 16, background: "rgba(255, 255, 255, 0.2)" }} />
                                <Menu theme={"dark"} defaultSelectedKeys={["1"]} mode="inline" >
                                    <Menu.Item title={"聊天"} icon={<MessageOutlined />} key={"1"}>聊天</Menu.Item>
                                    <Menu.Item title={"通讯录"} icon={<UsergroupAddOutlined />} key={"2"}>通讯录</Menu.Item>
                                    <Menu.Item title={"设置"} icon={<SettingOutlined />} key={"3"} onClick={()=> setCurrentPage(PAGES.PRIVATEINFO)}>设置</Menu.Item>
                                    <Menu.Item title={"好友申请"} key={"4"} onClick={() => {
                                        setCurrentPage(PAGES.RECEIVELISTPAGE);
                                        fetchReceivelist();
                                    }}>好友申请</Menu.Item>
                                    <Menu.Item title={"发送的好友申请"} key={"5"} onClick={() => {
                                        setCurrentPage(PAGES.APPLYLISTPAGE);
                                        fetchApplylist();
                                    }}>发送的好友申请</Menu.Item>
                                </Menu>
                            </Sider>
                            <Layout className="site-layout">
                                <Content style={{ margin: "0 16px" }}>
                                    <Layout>
                                        好友列表
                                        {friendlistRefreshing ? (
                                            <p> Loading... </p>
                                        ) : (
                                            <div>
                                                <div style={{ padding: 12}}>
                                                    <h5> 好友列表 </h5>
                                                    {friendlist.length === 0 ? (
                                                        <p> 无好友 </p>
                                                    ) : (
                                                        friendlist.map((val) =>(
                                                            <div key={val.groupname}>
                                                                <p>{val.groupname}</p>
                                                                {val.userlist.length === 0 ? (
                                                                    <p>该分组为空</p>
                                                                ) : (
                                                                    val.userlist.map((user) => (
                                                                        <Button key={user.username}>
                                                                            {user.username}
                                                                        </Button>
                                                                    ))
                                                                )}
                                                            </div>
                                                        ))                                                                                                                    
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        
                                    </Layout>
                                    <Layout>
                                        聊天页面
                                    </Layout>
                                </Content>
                            </Layout>
                        </Layout>
                    </div>
                ) : null}
                {currentPage === PAGES.PRIVATEINFO ? (
                    <div>
                        <h1>
                            用户管理
                        </h1>
                        <Button type="primary" onClick={() => {
                            setCurrentPage(PAGES.MAIN);
                            fetchFriendlist();
                        }}> 返回主页面 </Button>
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
                            <button
                                onClick={() => setCurrentPage(PAGES.SEARCH)}>
                                搜索用户
                            </button>
                            <div style={{width: "400px", height: "50px", margin: "5px", display: "flex", flexDirection: "row"}}>
                                <Space size={50}>
                                    <Button size={"large"} type={"primary"}
                                        onClick={() => ((changeUserInfo === PAGES.REVISE_USERNAME) ? setChangeUserInfo(PAGES.NO_REVISE) : setChangeUserInfo(PAGES.REVISE_USERNAME))}>
                                        修改用户名
                                    </Button>
                                    <Button size={"large"} type={"primary"}
                                        onClick={() => ((changeUserInfo === PAGES.REVISE_PASSWORD) ? setChangeUserInfo(PAGES.NO_REVISE) : setChangeUserInfo(PAGES.REVISE_PASSWORD))}>
                                        修改密码
                                    </Button>
                                    <Button size={"large"} type={"primary"}
                                        onClick={() => ((changeUserInfo === PAGES.REVISE_EMAIL) ? setChangeUserInfo(PAGES.NO_REVISE) : setChangeUserInfo(PAGES.REVISE_EMAIL))}>
                                        修改邮箱
                                    </Button>
                                </Space>
                            </div>
                            {changeUserInfo === PAGES.REVISE_USERNAME ? (
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
                                    <Button size={"large"} type={"dashed"}
                                        onClick={changeUsername}>
                                        确认修改用户名
                                    </Button>
                                </div>
                            ) : null}

                            {changeUserInfo === PAGES.REVISE_PASSWORD ? (
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

                            {changeUserInfo === PAGES.REVISE_EMAIL ? (
                                <div style={{margin: "5px", display: "flex", flexDirection: "column", alignItems: "center"}}>
                                    <Input
                                        size={"large"}
                                        type="text"
                                        prefix={<MailOutlined />}
                                        placeholder="请填写邮箱"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <br/>
                                    <Button size={"large"} type={"dashed"}
                                        onClick={()=>changeEmail()}>
                                        确认修改邮箱
                                    </Button>
                                </div>
                            ) : null}

                            {changeUserInfo === PAGES.WRITE_OFF ? (
                                <div style={{margin: "5px", display: "flex", flexDirection: "column", alignItems: "center"}}>
                                    <Input.Password size={"large"} maxLength={50}
                                        type="text"
                                        placeholder="请填写密码"
                                        prefix={<LockOutlined/>}
                                        value={password}
                                        onChange={(e) => getPassword(e.target.value)}
                                    />
                                    <Button size={"large"} shape={"round"} type={"dashed"} danger={true}
                                        onClick={()=>deleteUser()}>
                                        确认注销
                                    </Button>
                                </div>
                            ) : null}
                            <div style={{width: "400px", height: "50px", margin: "5px", display: "flex", flexDirection: "row"}}>
                                <Space size={150}>
                                    <Button size={"large"} shape={"round"} type={"primary"}
                                        onClick={()=>logout()}>
                                        登出
                                    </Button>
                                    <Button size={"large"} shape={"round"} type={"primary"} danger={true}
                                        onClick={() => ((changeUserInfo === PAGES.WRITE_OFF) ? setChangeUserInfo(PAGES.NO_REVISE) : setChangeUserInfo(PAGES.WRITE_OFF))}>
                                        注销账户
                                    </Button>
                                </Space>
                            </div>
                        </div>

                    </div>
                ) : null}
                {currentPage === PAGES.SEARCH ? (
                    <div>
                        <div style={{   
                            display: "flex", flexDirection: "column", paddingLeft: "150px", paddingRight: "150px", 
                            paddingTop: "5px", paddingBottom: "25px", border: "2px solid #00BFFF", borderRadius: "20px", 
                            alignItems: "center", backgroundColor: "rgba(255,255,255,0.7)"
                        }}>
                            <h1>
                                搜素用户
                            </h1>
                            <Button type="primary" onClick={search}> 搜索 </Button>
                            <Button type="primary" onClick={() => setCurrentPage(PAGES.PRIVATEINFO)}> 返回设置 </Button>
                            <input style={{
                                width: "400px", height: "50px", margin: "5px", borderRadius: "12px", borderColor: "#00BFFF"
                            }}
                            type="text" 
                            placeholder="请填写用户名"
                            value={searchName} 
                            onChange={(e) => setSearchName(e.target.value)}
                            />
                            {searchRefreshing ? (
                                <p> 未搜索 </p>
                            ) : (
                                <div style={{ padding: 12}}>
                                    {searchlist.length === 0 ? (
                                        <p> 未找到符合条件的用户 </p>
                                    ) : (
                                        <List
                                            bordered
                                            dataSource={searchlist}
                                            renderItem={(item) => (
                                                <List.Item
                                                    actions={[
                                                        <Button
                                                            key = {item.username}
                                                            type="primary"
                                                            onClick={() => {
                                                                setOtherUsername(item.username);
                                                                checkFriend();
                                                                setCurrentPage(PAGES.PUBLICINFO);
                                                            }}
                                                        >
                                                            查看用户界面
                                                        </Button>
                                                    ]}
                                                >
                                                    {item.username}
                                                </List.Item>
                                            )}
                                        />
                                    )}

                                </div>
                            )}
                        </div>

                    </div>
                ) : null}
                {currentPage === PAGES.PUBLICINFO ? (
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
                                <Button
                                    type="primary"
                                    onClick={() => (addFriend())}
                                >
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
                                <Button
                                    type="primary"
                                    onClick={()=>addToGroup()}
                                >
                                    确认添加至小组
                                </Button>
                            </div>
                        ) : null}
                        <Button type="primary" onClick={() => setCurrentPage(PAGES.SEARCH)}> 返回搜索 </Button>

                    </div>
                ) : null}
                {currentPage === PAGES.RECEIVELISTPAGE ? (
                    <div>
                        <Button type="primary" onClick={() => {
                            setCurrentPage(PAGES.MAIN);
                            fetchFriendlist();
                        }}> 返回主页面 </Button>
                        {receiveRefreshing ? (
                            <p> Loading... </p>
                        ) : (
                            <div style={{ padding: 12}}>
                                {receivelist.length === 0 ? (
                                    <p> 无好友申请 </p>
                                ) : (
                                    <List
                                        bordered
                                        dataSource={receivelist}
                                        renderItem={(item) => (
                                            <List.Item 
                                                actions={[
                                                    
                                                    <Button
                                                        disabled={item.make_sure}
                                                        key = {item.username + "1"}
                                                        type="primary"
                                                        onClick={(e) => accept(item.username)}
                                                    >
                                                        接受申请
                                                    </Button>,
                                                    <Button
                                                        disabled={item.make_sure}
                                                        key={item.username + "2"}
                                                        type="primary"
                                                        onClick={(e) => decline(item.username)}
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
                    </div>
                ) : null}
                {currentPage === PAGES.APPLYLISTPAGE ? (
                    <div>
                        <Button type="primary" onClick={() => {
                            setCurrentPage(PAGES.MAIN);
                            fetchFriendlist();
                        }}> 返回主页面 </Button>
                        {applyRefreshing ? (
                            <p> Loading... </p>
                        ) : (
                            <div style={{ padding: 12}}>
                                {applylist.length === 0 ? (
                                    <p> 无发送的好友申请 </p>
                                ) : (
                                    <List
                                        bordered
                                        dataSource={applylist}
                                        renderItem={(item) => (
                                            <List.Item>
                                                {item.username} {(item.make_sure && item.is_confirmed) ? ("对方已接受") : null}{(item.make_sure && !item.is_confirmed) ? ("对方已拒绝") : null}{(!item.make_sure) ? ("对方未回复") : null}
                                            </List.Item>  
                                        )}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                ) : null}
            </div>
        </div>
    );
};
export default LoginScreen;
