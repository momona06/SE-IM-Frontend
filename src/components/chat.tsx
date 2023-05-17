import {Card, List, Popover, Tag} from "antd";
import React from "react";

interface messageListData {
    msg_id: number;
    msg_type: string;
    msg_body: string;
    reply_id?: number;
    combine_list?: number[];
    msg_time: string;
    sender: string;
    read_list: boolean[];
    avatar: string;
}

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

export interface inviteListData {
    roomname: string;
    roomid: number;
    is_private: boolean;
    message_list: messageListData[];

    is_notice?: boolean;
    is_top?: boolean;
    index?: number;
}

interface roomInfoData {
    mem_list: string[];
    manager_list: string[];
    master: string;
    mem_count: number;
    is_private: boolean;
}

// 地址字符串特殊显示
const str2addr = (text : string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g; // 匹配 URL 的正则表达式
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

// 整合转发
const forwardCard = (combineList: messageListData[]) => {
    return (
        <Card title={"聊天记录"}>
            <List
                dataSource={combineList}
                renderItem={(combine) => (
                    <List.Item key={combine.msg_id}>
                        {combine.sender + " " + combine.msg_body + " " + combine.msg_time}
                    </List.Item>
                )}
            />
        </Card>
    );
};

const isRead = (readList: boolean[], memberList: string[], isPrivate: boolean, username: string) => {
    let pos = memberList.indexOf(username);
    if (isPrivate){
        let res = readList[pos === 0 ? 1 : 0];
        if (res){
            return (
                <Tag color={"cyan"}>已读</Tag>
            );
        }
        else {
            return (
                <Tag color={"cyan"}>未读</Tag>
            );
        }
    }
    else {
        let isReadList: string[] = [];
        for (let i = 0; i < memberList.length; ++i){
            if (readList[i] && i != pos){
                isReadList.push(memberList[i]);
            }
        }
        return (
            <Popover trigger={"click"} content={<List itemLayout={"vertical"} dataSource={isReadList} renderItem={(item) => (
                <List.Item>
                    <List.Item.Meta title={item}/>
                </List.Item>
            )}/>}>
                <Tag color={"cyan"}>已读列表</Tag>
            </Popover>
        );
    }
};

export {isRead, forwardCard, str2addr};
export type { friendListData, messageListData, roomListData, roomInfoData, userData, receiveData };
