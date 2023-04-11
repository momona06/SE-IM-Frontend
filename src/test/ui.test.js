import LoginScreen from "../pages";
import RegisterScreen from "../pages/register";
import React from "react";
import { render } from "@testing-library/react";
import UserManagementScreen from "../pages/user/privateinfo";
import ChatScreen from "../pages/user";
import PublicInfoScreen from "../pages/user/publicinfo";
import PrivateInfoScreen from "../pages/user/privateinfo";

// 防止ui测试中的router unmounted
jest.mock("next/router", () => require("next-router-mock"));

describe("页面渲染",()=>{
    it("登录",()=>{
        render(<LoginScreen />);
    });
    it("注册",()=>{
        render(<RegisterScreen />);
    });
    it("用户信息",()=>{
        render(<UserManagementScreen />);
    });
    it("聊天界面",()=>{
        render(<ChatScreen/>);
    });
    it("公开信息界面",()=>{
        render(<PublicInfoScreen/>);
    });
    it("私人信息界面",()=>{
        render(<PrivateInfoScreen/>);
    });
});