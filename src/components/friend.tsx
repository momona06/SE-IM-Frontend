interface FriendProps {
    username: string;
    group: string;
}

const FriendSegment = (props: FriendProps) => {
    return (
        <div style={{
            height: "80px",
            width: "200px"
        }}>
            <h4>{props.username}</h4>
            <h3>{props.group}</h3>
        </div>
    );
};

export default FriendSegment;