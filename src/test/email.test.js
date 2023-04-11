import {isEmail} from "../pages/index";

const email1 = "zhanhc@qq.com";
const email2 = "@";
const username1 = "zhanhc";
const username2 = "*&(&";

it("isEmail test", () => {
    expect(isEmail(email1)).toEqual(true);
    expect(isEmail(email2)).toEqual(false);
    expect(isEmail(username1)).toEqual(false);
    expect(isEmail(username2)).toEqual(false);
});