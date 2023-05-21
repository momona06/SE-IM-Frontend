import {Card, List, Popover, Tag} from "antd";
import React from "react";

interface messageListData {
    msg_id: number;
    msg_type: string;
    msg_body: string;
    msg_time: string;
    sender: string;
    read_list: boolean[];
    avatar: string;
    is_delete: boolean;
    msg_answer?: number;
    reply_id?: number;
    combine_list?: number[];
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
    is_delete: boolean;
    is_specific: boolean;
}

interface roomInfoData {
    mem_list: string[];
    manager_list: string[];
    master: string;
    mem_count: number;
    is_private: boolean;
}

// 整合转发
const forwardCard = (combineList: messageListData[]) => {
    console.log("forward:", combineList);
    return (
        <Card title={"聊天记录"}>
            <List
                dataSource={combineList}
                renderItem={(msg) => (
                    <List.Item key={msg.msg_id}>
                        {msg.sender + " " + msg.msg_body + " " + msg.msg_time}
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

export {isRead, forwardCard};
export type { friendListData, messageListData, roomListData, roomInfoData, userData, receiveData };
