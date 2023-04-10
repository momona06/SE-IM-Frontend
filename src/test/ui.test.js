import LoginScreen from "../pages";
import RegisterScreen from "../pages/register";
import React from "react";
import { render, screen } from "@testing-library/react";

// 防止ui测试中的router unmounted
jest.mock('next/router', () => require('next-router-mock'));

describe("登录页面",()=>{
    it("正常渲染所有组件",()=>{
        render(<LoginScreen />);
    });
});

describe("注册页面",()=>{
    it("正常渲染所有组件",()=>{
        render(<RegisterScreen />);
    });
});