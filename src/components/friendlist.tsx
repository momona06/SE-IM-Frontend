import React, { useEffect, useState } from "react";
import Router, { useRouter } from "next/router";
import { request } from "../utils/network";
import { Friend } from "../utils/types";
import {List, Button, message} from "antd";

interface friendlistprops {
    username?: string;
}


interface datatype {
    groupname: string;
    userlist: string[];
}


const FriendList = (props: friendlistprops) => {
    const [refreshing, setRefreshing] = useState<boolean>(true);
    const [list, setList] = useState<datatype[]>([]);

    const router = useRouter();
    const query = router.query;
    
    useEffect(() => {
        if(!router.isReady) {
            return;
        }

        fetchList();
    }, [router, query]);
    
    const fetchList = () => {
        setRefreshing(true);
        request(
            "/api/friend/getfriendlist",
            "POST",
            {
                username: props.username,
                token: window.loginToken,
            }
        )
            .then((res) => {
                setList(res.friendlist.map((val: any) => ({...val})));
                setRefreshing(false);
            })
            .catch((err) => {
                message.error(err.message, 1);
                setRefreshing(false);
            });
    };

    const deletegroup = (group:string) => {
        request(
            "/api/friend/deletefgroup",
            "DELETE",
            {
                token: window.loginToken,
                fgroup_name: group,
            }
        )
            .then((res) => {
                fetchList();
            })
            .catch((err) => {
                alert(err);
            });
    };

    
    return refreshing ? (
        <p> Loading... </p>
    ) : (
        <div style={{ padding: 12}}>
            <h5> 好友列表 </h5>
            {list.length === 0 ? (
                <p> 无好友 </p>
            ) : (
                <List
                    bordered
                    dataSource={list}
                    renderItem={(item) => (
                        <List.Item
                            actions={[
                                <Button
                                    key={item.groupname}
                                    type="primary"
                                    onClick={() => deletegroup(item.groupname)}
                                >
                                    删除分组
                                </Button>
                            ]}
                        >
                            {item.groupname}
                            <List
                                bordered
                                dataSource={item.userlist}
                                renderItem={(subitem) => (
                                    <List.Item
                                        actions={[
                                            <Button
                                                key={subitem}
                                                type="primary"
                                                onClick={() => router.push(`/user/publicinfo/${subitem}`)}
                                            >
                                                查看用户界面
                                            </Button>
                                        ]}
                                    >
                                        {subitem}
                                    </List.Item>
                                )}
                            />
                        </List.Item>
                    )}
                />
            )}
        </div>
    );
};

export default FriendList;