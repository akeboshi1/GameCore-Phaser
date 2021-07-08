var StringUtils = /** @class */ (function () {
    function StringUtils() {
    }
    StringUtils.format = function (baseStr, params) {
        if (arguments.length === 0)
            return this;
        if (typeof (params) === "object") {
            for (var key in params)
                baseStr = baseStr.replace(new RegExp("\\{" + key + "\\}", "g"), params[key]);
            return baseStr;
        }
        else {
            for (var i = 0; i < params.length; i++)
                baseStr = baseStr.replace(new RegExp("\\{" + i + "\\}", "g"), params[i]);
            return baseStr;
        }
    };
    StringUtils.isNullOrUndefined = function (text) {
        if (text === null || text === undefined)
            return true;
    };
    return StringUtils;
}());
export { StringUtils };
// var str1 = "hello {0}".format("world"); //log   hello world
// var str1 = "我叫{0},性别{1}".format("美男子", "男"); //log 我叫美男子,性别男
// var user = {name: "美男子",sex: "男",age: 20};
// var str2 = "我叫{name},性别{sex},今年{age}岁".format(user); //我叫美男子,性别男,今年20岁
//# sourceMappingURL=stringUtils.js.map