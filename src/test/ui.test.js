import Screen from "../pages";
import React from "react";
import { render } from "@testing-library/react";
import FriendList from "../components/friendlist";

// 防止ui测试中的router unmounted
jest.mock("next/router", () => require("next-router-mock"));

describe("页面渲染",()=>{
    it("登录",()=>{
        render(<Screen />);
    });
    it("好友列表",()=>{
        render(<FriendList />);
    });
});