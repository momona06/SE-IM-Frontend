import FriendSegment from "./friend";
import { useEffect, useState } from "react";
import Router, { useRouter } from "next/router";
import { request } from "../utils/network";
import { Friend } from "../utils/types";

interface friendlistprops {
    username: string;
}


const FriendList = (props: friendlistprops) => {
    const [refreshing, setRefreshing] = useState<boolean>(true);
    const [list, setList] = useState<Friend[]>([]);

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
                var temp: Friend[] = [];
                for(var i = 0; i < res.friendlist.length; i++)
                {
                    
                    temp=temp.concat(res.friendlist[i][1].map((val: string) =>({username: val, group: res.friendlist[i][0]})));
                }
                setList(temp);
                setRefreshing(false);
            })
            .catch((err) => {
                alert(err);
                setRefreshing(false);
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
                <div style={{ display: "flex", flexDirection: "column" }}>{
                    list.map((friend) =>(
                        <div key={friend.username}>
                            <div style={{
                                height: "80px",
                                width: "200px"
                            }}>
                                <h4>{friend.username}</h4>
                                <h3>{friend.group}</h3>
                            </div>
                        </div>
                    ))
                }</div>
            )}
        </div>
    );
};

export default FriendList;