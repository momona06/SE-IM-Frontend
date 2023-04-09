import {isEmail} from "../pages/index";


var email1 = "zhanhc@qq.com";
var username1 = "zhanhc";

it("isEmail test", () => {
    expect(isEmail(email1)).toEqual(true);
    expect(isEmail(username1)).toEqual(false);
});