var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
/* tslint:disable */
var Logger = /** @class */ (function () {
    // private mErrorList: string[];
    // private mWarnList: string[];
    function Logger() {
        this.isDebug = false;
        // this.mErrorList = [];
        // this.mWarnList = [];
    }
    Logger.getInstance = function () {
        if (!Logger._instance)
            Logger._instance = new Logger();
        return Logger._instance;
    };
    Logger.prototype.fatal = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        // return console.error(message, ...optionalParams);
        throw message;
    };
    /**
     * 正常输出
     * @param message
     * @param optionalParams
     */
    Logger.prototype.log = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        if (Logger._instance.isDebug)
            console.log.apply(console, __spreadArrays([message], optionalParams));
    };
    /**
     * 调试输出
     * @param message
     * @param optionalParams
     */
    Logger.prototype.debug = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        if (Logger._instance.isDebug)
            console.log.apply(console, __spreadArrays([message], optionalParams));
    };
    Logger.prototype.error = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        // if (Logger._instance.isDebug)
        console.error.apply(console, __spreadArrays([message], optionalParams));
        // this.mErrorList.push(message);
    };
    Logger.prototype.debugError = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        if (Logger._instance.isDebug)
            console.error.apply(console, __spreadArrays([message], optionalParams));
        // this.mErrorList.push(message);
    };
    Logger.prototype.warn = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        if (Logger._instance.isDebug)
            console.warn.apply(console, __spreadArrays([message], optionalParams));
        // this.mWarnList.push(message);
    };
    Logger.prototype.info = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        if (Logger._instance.isDebug)
            console.info.apply(console, __spreadArrays([message], optionalParams));
    };
    // getErrorList(): string[] {
    //   return this.mErrorList;
    // }
    // getWarnList(): string[] {
    //   return this.mWarnList;
    // }
    Logger.prototype.v = function () {
        Logger._instance.isDebug = true;
    };
    Logger.prototype.q = function () {
        Logger._instance.isDebug = false;
    };
    return Logger;
}());
export { Logger };
export function log(message) {
    var optionalParams = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        optionalParams[_i - 1] = arguments[_i];
    }
    console.log.apply(console, __spreadArrays([message], optionalParams));
}
export function error(message) {
    var optionalParams = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        optionalParams[_i - 1] = arguments[_i];
    }
    console.error.apply(console, __spreadArrays([message], optionalParams));
}
//# sourceMappingURL=log.js.map