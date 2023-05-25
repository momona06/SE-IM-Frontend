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
    avatar: string
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
    mem_list: userData[];
    manager_list: string[];
    master: string;
    mem_count: number;
    is_private: boolean;
}

interface combineData {
    msg_sender: string;
    avatar: string;
    msg_id: number;
    msg_type: string;
    msg_time: string;
    msg_body: string;
}

// 整合转发
const forwardCard = (combineLists: Map<number, messageListData[]>, id: number) => {
    console.log(combineLists);
    return (
        <Card title={"聊天记录"}>
            <List
                size={"large"}
                dataSource={combineLists.get(id)}
                renderItem={(msg) => (
                    <List.Item key={msg.msg_id}>
                        {msg.sender + ":  " + msg.msg_body + " " + msg.msg_time}
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
                <Tag color={"cyan"}>对方已读</Tag>
            );
        }
        else {
            return (
                <Tag color={"cyan"}>对方未读</Tag>
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
            <Popover trigger={"click"} content={
                // <List
                //     itemLayout={"vertical"}
                //     dataSource={isReadList}
                //     renderItem={(item) => (
                //         <List.Item>
                //             <List.Item.Meta title={item}/>
                //         </List.Item>)
                // }/>
                <List
                size="small"
                     itemLayout={"vertical"}
                     bordered
                     dataSource={isReadList}
                     renderItem={(item) => <List.Item>{item}</List.Item>}
                />
            }>
                <Tag color={"cyan"}>已读成员列表</Tag>
            </Popover>
        );
    }
};

export {isRead, forwardCard};
export type { friendListData, messageListData, roomListData, roomInfoData, userData, receiveData, combineData };
