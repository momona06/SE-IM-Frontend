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
    is_delete: boolean;
}

// 地址字符串特殊显示
const str2addr = (text : string) => {
    const urlRegex2 = /(https?:\/\/[^\s]+)/g; // 匹配 URL 的正则表达式
    const urlRegex = /((https?:\/\/)?([a-zA-Z0-9]+\.)+[a-zA-Z0-9]+)/g;
    const atRegex = /(@[A-Za-z0-9]+)/g;
    const parts = text.split(urlRegex); // 使用正则表达式拆分字符串
    console.log(parts);
    var partss: string[] = [];
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
    })
    console.log(partss);
    return (
        <div>
            {partss.map((part, i) => {
                if (part.match(urlRegex)) {
                    return (
                        <a href= "_blank" rel="noopener noreferrer" key={i}>
                            {part}
                        </a>
                    );
                } else if(part.match(atRegex)) {
                    return <span style={{color: "blue"}} key={ i }>{part}</span>
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
export type { messageListData };
