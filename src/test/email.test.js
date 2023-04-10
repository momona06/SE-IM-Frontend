import {isEmail} from "../pages/index";


var email1 = "zhanhc@qq.com";
var email2 = "@";
var username1 = "zhanhc";
var username2 = "*&(&";

it("isEmail test", () => {
    expect(isEmail(email1)).toEqual(true);
    expect(isEmail(email2)).toEqual(false);
    expect(isEmail(username1)).toEqual(false);
    expect(isEmail(username2)).toEqual(false);
});