import React, {useState} from "react";
import {Layout, List, Menu} from "antd";
import {MessageOutlined, SettingOutlined, UsergroupAddOutlined} from "@ant-design/icons";
import { useRouter } from "next/router";
import FriendList  from "../../components/friendlist";

//聊天主界面
interface ChatScreenProps {
    Username?: string,
}

const ChatScreen = (props: ChatScreenProps) => {
    const { Content, Sider } = Layout;
    const [collapsed, setCollapsed] = useState(false);
    const router = useRouter();


    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <div style={{ height: 32, margin: 16, background: "rgba(255, 255, 255, 0.2)" }} />
                <Menu theme={"dark"} defaultSelectedKeys={["1"]} mode="inline" >
                    <Menu.Item title={"聊天"} icon={<MessageOutlined />} key={"1"}>聊天</Menu.Item>
                    <Menu.Item title={"通讯录"} icon={<UsergroupAddOutlined />} key={"2"}>通讯录</Menu.Item>
                    <Menu.Item title={"设置"} icon={<SettingOutlined />} key={"3"}>设置</Menu.Item>
                </Menu>
            </Sider>
            <Layout className="site-layout">
                <Content style={{ margin: "0 16px" }}>
                    <Layout>
                        好友列表

                        <FriendList username={props.Username}/>
                        
                    </Layout>
                    <Layout>
                        聊天页面
                    </Layout>
                </Content>
            </Layout>
        </Layout>
    );
};
export default ChatScreen;