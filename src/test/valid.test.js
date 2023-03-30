import {isValid} from "../pages/index";
import { VALID, VALID_EMAIL, INVALID } from "../constants/string";

var wrong_email_1 = "^&*@qq.com";
var wrong_email_2 = "zhanhc@@.cod";
var wrong_password = "  *&^  78(*";
var exceed_length_account = "11111111111111111111111111111111111111111111111111";
var empty_input = "";
var correct_email = "1412647238@qq.com";
var correct_input = "123456";

it("Input isValid test", () => {
    expect(isValid(wrong_email_1)).toEqual(INVALID);
    expect(isValid(wrong_email_2)).toEqual(INVALID);
    expect(isValid(wrong_password)).toEqual(INVALID);
    expect(isValid(exceed_length_account)).toEqual(INVALID);
    expect(isValid(empty_input)).toEqual(INVALID);
    expect(isValid(correct_email)).toEqual(VALID_EMAIL);
    expect(isValid(correct_input)).toEqual(VALID);
});