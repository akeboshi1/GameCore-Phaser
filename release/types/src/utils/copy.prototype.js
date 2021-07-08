var CopyProtoType = /** @class */ (function () {
    function CopyProtoType() {
    }
    /**
     * 只拷贝对象本身不存在的原型链上的属性，不包含方法
     * @param baseData
     */
    CopyProtoType.copyProtoParam = function (baseData) {
        baseData.forEach(function (data) {
            for (var param in data) {
                if (typeof data.constructor.prototype[param] === "function")
                    continue;
                if (!data.hasOwnProperty(param)) {
                    data[param] = data.constructor.prototype[param];
                }
            }
        });
        return baseData;
    };
    return CopyProtoType;
}());
export { CopyProtoType };
//# sourceMappingURL=copy.prototype.js.map