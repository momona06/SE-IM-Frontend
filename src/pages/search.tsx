import { request } from "../utils/network";
import {useEffect, useState} from "react";
import { useRouter } from "next/router";
import {List, Button, message} from "antd";

interface datatype {
    username: string;
}

const Search = () => {
    const [refreshing, setRefreshing] = useState<boolean>(true);
    const [list, setList] = useState<datatype[]>([]);
    const [searchName, setSearchName] = useState<string>("");

    const router = useRouter();
    const query = router.query;

    useEffect(() => {
        if(!router.isReady) {
            return;
        }
    }, [router, query]);

    const search = () => {
        setRefreshing(true);
        request(
            "/api/friend/searchuser",
            "POST",
            {
                my_username: window.username,
                search_username: searchName,
            }
        )
            .then((res) => {
                setList(res.search_user_list.map((val: any) =>({username: val})));
                setRefreshing(false);
            })
            .catch((err) => {
                message.error(err.message, 1);
                setRefreshing(false);
            });
    };

    return (
        <div style={{ 
            width: "100%", height: "100%", position: "absolute", top: 0, left: 0, alignItems: "center", 
            backgroundImage: "url(\"https://stu.cs.tsinghua.edu.cn/new/images/blur-light.jpg\")", 
            backgroundSize: "1920px 1200px", backgroundPosition: "center", backgroundRepeat: "no-repeat"
        }}>
            <div style={{ 
                display: "flex", justifyContent: "center ", alignItems: "center", position: "absolute", 
                top: 0, bottom: 0, left: 0, right: 0, margin: "auto" 
            }}>
                <div style={{   
                    display: "flex", flexDirection: "column", paddingLeft: "150px", paddingRight: "150px", 
                    paddingTop: "5px", paddingBottom: "25px", border: "2px solid #00BFFF", borderRadius: "20px", 
                    alignItems: "center", backgroundColor: "rgba(255,255,255,0.7)"
                }}>
                    <h1>
                        搜素用户
                    </h1>
                    <Button type="primary" onClick={search}> 搜索 </Button>
                    <input style={{
                        width: "400px", height: "50px", margin: "5px", borderRadius: "12px", borderColor: "#00BFFF"
                    }}
                    type="text" 
                    placeholder="请填写用户名"
                    value={searchName} 
                    onChange={(e) => setSearchName(e.target.value)}
                    />
                    {refreshing ? (
                        <p> 未搜索 </p>
                    ) : (
                        <div style={{ padding: 12}}>
                            {list.length === 0 ? (
                                <p> 未找到符合条件的用户 </p>
                            ) : (
                                <List
                                    bordered
                                    dataSource={list}
                                    renderItem={(item) => (
                                        <List.Item
                                            actions={[
                                                <Button
                                                    key = {item.username}
                                                    type="primary"
                                                    onClick={() => router.push(`/user/publicinfo/${item.username}`)}
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
        </div>
    );
};

export default Search;