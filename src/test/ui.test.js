import Screen from "../pages";
import RegisterScreen from "../pages/registerScreen";
import React from "react";
import { render } from "@testing-library/react";
import FriendList from "../components/friendlist";
import Search from "../pages/search";

// 防止ui测试中的router unmounted
jest.mock("next/router", () => require("next-router-mock"));

describe("页面渲染",()=>{
    it("登录",()=>{
        render(<Screen />);
    });
    it("注册",()=>{
        render(<RegisterScreen />);
    });
    it("好友列表",()=>{
        render(<FriendList />);
    });
    it("搜索结果",()=>{
        render(<Search />);
    });
});