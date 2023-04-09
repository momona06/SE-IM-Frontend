import LoginScreen from "../pages";
import React from "react";
import { render, screen } from "@testing-library/react";

describe("登录页面",()=>{
    it("正常渲染输入框和按钮",()=>{
        render(<LoginScreen />);
        screen.debug();
    });
});