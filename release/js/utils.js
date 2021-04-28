(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["utils"] = factory();
	else
		root["utils"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ({

/***/ 3:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, "HTTP_REGEX", function() { return /* reexport */ HTTP_REGEX; });
__webpack_require__.d(__webpack_exports__, "Url", function() { return /* reexport */ Url; });
__webpack_require__.d(__webpack_exports__, "ResUtils", function() { return /* reexport */ ResUtils; });
__webpack_require__.d(__webpack_exports__, "BlackButton", function() { return /* reexport */ BlackButton; });
__webpack_require__.d(__webpack_exports__, "BlueButton", function() { return /* reexport */ BlueButton; });
__webpack_require__.d(__webpack_exports__, "WhiteButton", function() { return /* reexport */ WhiteButton; });
__webpack_require__.d(__webpack_exports__, "CloseButton", function() { return /* reexport */ CloseButton; });
__webpack_require__.d(__webpack_exports__, "Background", function() { return /* reexport */ Background; });
__webpack_require__.d(__webpack_exports__, "Border", function() { return /* reexport */ Border; });
__webpack_require__.d(__webpack_exports__, "TransparentButton", function() { return /* reexport */ TransparentButton; });
__webpack_require__.d(__webpack_exports__, "Tool", function() { return /* reexport */ Tool; });
__webpack_require__.d(__webpack_exports__, "load", function() { return /* reexport */ load; });
__webpack_require__.d(__webpack_exports__, "loadArr", function() { return /* reexport */ loadArr; });
__webpack_require__.d(__webpack_exports__, "Algorithm", function() { return /* reexport */ Algorithm; });
__webpack_require__.d(__webpack_exports__, "CopyProtoType", function() { return /* reexport */ CopyProtoType; });
__webpack_require__.d(__webpack_exports__, "StringUtils", function() { return /* reexport */ StringUtils; });
__webpack_require__.d(__webpack_exports__, "ObjectAssign", function() { return /* reexport */ ObjectAssign; });
__webpack_require__.d(__webpack_exports__, "UiUtils", function() { return /* reexport */ UiUtils; });
__webpack_require__.d(__webpack_exports__, "isMobile", function() { return /* reexport */ isMobile; });
__webpack_require__.d(__webpack_exports__, "HttpLoadManager", function() { return /* reexport */ HttpLoadManager; });
__webpack_require__.d(__webpack_exports__, "Helpers", function() { return /* reexport */ Helpers; });
__webpack_require__.d(__webpack_exports__, "NumberUtils", function() { return /* reexport */ NumberUtils; });

// CONCATENATED MODULE: ./src/utils/resUtil.ts
var HTTP_REGEX = /^(http|https):/i;
var Url = /** @class */ (function () {
    function Url() {
    }
    // static REQUIRE_CONTEXT;
    Url.getRes = function (value) {
        return Url.RES_PATH + value;
    };
    Url.getUIRes = function (dpr, value) {
        return Url.RESUI_PATH + (dpr + "x/" + value);
    };
    Url.getNormalUIRes = function (value) {
        return Url.RESUI_PATH + value;
    };
    Url.getOsdRes = function (value) {
        if (!value) {
            // tslint:disable-next-line:no-console
            console.warn("splicing url failed");
            return;
        }
        if (Url.OSD_PATH) {
            if (HTTP_REGEX.test(Url.OSD_PATH)) {
                return Url.OSD_PATH + value;
            }
            return Url.OSD_PATH + value;
        }
        return value;
    };
    // cdn资源路径
    Url.OSD_PATH = "";
    // 本地资源路径
    Url.RES_PATH = "";
    Url.RESUI_PATH = "";
    Url.RESOURCE_ROOT = "";
    return Url;
}());

var ResUtils = /** @class */ (function () {
    function ResUtils() {
    }
    ResUtils.getPartName = function (value) {
        return value + "_png";
    };
    ResUtils.getPartUrl = function (value) {
        // TOOD 编辑器或调式会传入本地资源。Avatar资源只存在cdn
        if (HTTP_REGEX.test(Url.OSD_PATH)) {
            return Url.OSD_PATH + "avatar/part/" + value + ".png";
        }
        return Url.OSD_PATH + "avatar/part/" + value + ".png";
    };
    ResUtils.getUsrAvatarTextureUrls = function (value) {
        return {
            img: Url.OSD_PATH + "user_avatar/texture/" + value + ".png",
            json: Url.OSD_PATH + "user_avatar/texture/" + value + ".json"
        };
    };
    ResUtils.getGameConfig = function (value) {
        if (HTTP_REGEX.test(value)) {
            return value;
        }
        return Url.OSD_PATH + value;
    };
    ResUtils.getResRoot = function (value) {
        if (Url.RESOURCE_ROOT)
            return Url.RESOURCE_ROOT + "/" + value;
        return value;
    };
    return ResUtils;
}());

var BlackButton = /** @class */ (function () {
    function BlackButton() {
    }
    BlackButton.getName = function () {
        return "black_button";
    };
    BlackButton.getPNG = function () {
        return Url.getRes("ui/common/button.png");
    };
    BlackButton.getColumns = function () {
        return [4, 2, 4];
    };
    BlackButton.getRows = function () {
        return [4, 2, 4];
    };
    BlackButton.left = function () {
        return 4;
    };
    BlackButton.top = function () {
        return 4;
    };
    BlackButton.right = function () {
        return 4;
    };
    BlackButton.bottom = function () {
        return 4;
    };
    BlackButton.getConfig = function () {
        return {
            top: 4,
            left: 4,
            right: 4,
            bottom: 4
        };
    };
    return BlackButton;
}());

var BlueButton = /** @class */ (function () {
    function BlueButton() {
    }
    BlueButton.getName = function () {
        return "button_blue";
    };
    BlueButton.getPNG = function () {
        return Url.getRes("ui/common/button_blue.png");
    };
    BlueButton.getJSON = function () {
        return Url.getRes("ui/common/button_blue.json");
    };
    BlueButton.getColumns = function () {
        return [7, 1, 7];
    };
    BlueButton.getRows = function () {
        return [7, 1, 7];
    };
    BlueButton.left = function () {
        return 7;
    };
    BlueButton.top = function () {
        return 7;
    };
    BlueButton.right = function () {
        return 7;
    };
    BlueButton.bottom = function () {
        return 7;
    };
    BlueButton.getConfig = function () {
        return {
            left: 7,
            top: 7,
            right: 7,
            bottom: 7
        };
    };
    return BlueButton;
}());

var WhiteButton = /** @class */ (function () {
    function WhiteButton() {
    }
    WhiteButton.getName = function () {
        return "button_white";
    };
    WhiteButton.getPNG = function () {
        return Url.getRes("ui/common/button_white.png");
    };
    WhiteButton.getJSON = function () {
        return Url.getRes("ui/common/button_white.json");
    };
    WhiteButton.getColumns = function () {
        return [7, 1, 7];
    };
    WhiteButton.getRows = function () {
        return [7, 1, 7];
    };
    WhiteButton.left = function () {
        return 7;
    };
    WhiteButton.top = function () {
        return 7;
    };
    WhiteButton.right = function () {
        return 7;
    };
    WhiteButton.bottom = function () {
        return 7;
    };
    WhiteButton.getConfig = function () {
        return {
            left: 7,
            top: 7,
            right: 7,
            bottom: 7
        };
    };
    return WhiteButton;
}());

var CloseButton = /** @class */ (function () {
    function CloseButton() {
    }
    CloseButton.getName = function () {
        return "common_clsBtn";
    };
    CloseButton.getPNG = function () {
        return Url.getRes("ui/common/common_clsBtn.png");
    };
    CloseButton.getJSON = function () {
        return Url.getRes("ui/common/common_clsBtn.json");
    };
    CloseButton.getFrameConfig = function () {
        return { frameWidth: 16, frameHeight: 16, startFrame: 1, endFrame: 3 };
    };
    return CloseButton;
}());

var Background = /** @class */ (function () {
    function Background() {
    }
    Background.getName = function () {
        return "common_background";
    };
    Background.getPNG = function () {
        return Url.getRes("ui/common/common_panelBg.png");
    };
    Background.getColumns = function () {
        return [11, 9, 11];
    };
    Background.getRows = function () {
        return [14, 13, 14];
    };
    Background.left = function () {
        return 10;
    };
    Background.top = function () {
        return 15;
    };
    Background.right = function () {
        return 10;
    };
    Background.bottom = function () {
        return 15;
    };
    Background.getConfig = function () {
        return {
            left: 10,
            top: 15,
            right: 10,
            bottom: 15,
        };
    };
    return Background;
}());

var Border = /** @class */ (function () {
    function Border() {
    }
    Border.getName = function () {
        return "common_border";
    };
    Border.getPNG = function () {
        return Url.getRes("ui/common/common_border.png");
    };
    Border.getColumns = function () {
        return [4, 2, 4];
    };
    Border.getRows = function () {
        return [4, 2, 4];
    };
    Border.left = function () {
        return 4;
    };
    Border.top = function () {
        return 4;
    };
    Border.right = function () {
        return 4;
    };
    Border.bottom = function () {
        return 4;
    };
    Border.getConfig = function () {
        return {
            left: 4,
            top: 4,
            right: 4,
            bottom: 4
        };
    };
    return Border;
}());

var TransparentButton = /** @class */ (function () {
    function TransparentButton() {
    }
    TransparentButton.getName = function () {
        return "button_transparent";
    };
    TransparentButton.getPNG = function () {
        return Url.getRes("ui/common/button_transparent.png");
    };
    TransparentButton.getJSON = function () {
        return Url.getRes("ui/common/button_transparent.json");
    };
    TransparentButton.left = function () {
        return 4;
    };
    TransparentButton.top = function () {
        return 4;
    };
    TransparentButton.right = function () {
        return 4;
    };
    TransparentButton.bottom = function () {
        return 4;
    };
    TransparentButton.getConfig = function () {
        return {
            left: 4,
            top: 4,
            right: 4,
            bottom: 4
        };
    };
    return TransparentButton;
}());


// CONCATENATED MODULE: ./src/utils/tool.ts
var Tool = /** @class */ (function () {
    function Tool() {
    }
    /**
     * 判断两个数组是否相同
     * @param a
     * @param b
     * @returns
     */
    Tool.equalArr = function (a, b) {
        if (a.length !== b.length) {
            return false;
        }
        // 循环遍历数组的值进行比较
        for (var i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) {
                return false;
            }
        }
        return true;
    };
    /**
     * scene之间坐标转换
     * @param fromScene 当前所在scene
     * @param pos 需要转换去scene上的position
     */
    Tool.getPosByScenes = function (fromScene, pos) {
        var camera = fromScene.cameras.main;
        var px = pos.x - camera.scrollX;
        var py = pos.y - camera.scrollY;
        return { x: px, y: py };
    };
    /*
    * 两点之间距离公式
    */
    Tool.twoPointDistance = function (p1, p2) {
        var dis = Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2));
        return dis;
    };
    /**
     * 两点之间弧度
     * @param baseP
     * @param moveP
     */
    Tool.twoPointRadin = function (baseP, moveP) {
        var x = baseP.x - moveP.x;
        var y = baseP.y - moveP.y;
        var dis = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        var rad = Math.acos(x / dis);
        // 注意：当触屏的位置Y坐标<摇杆的Y坐标，我们要去反值-0~-180
        if (moveP.y < baseP.y) {
            rad = -rad;
        }
        return rad;
    };
    Tool.formatChineseString = function (context, fontSize, lineWidth) {
        if (typeof fontSize === "string")
            fontSize = parseInt(fontSize, 10);
        var wrapWidth = Math.floor(lineWidth / fontSize);
        return this.chunk(context, wrapWidth).join(" ");
    };
    Tool.checkChinese = function (name) {
        var pattern = /[\u4e00-\u9fa5]+/;
        var arr = name.split("");
        for (var i = 0, len = arr.length; i < len; i++) {
            if (pattern.test(arr[i])) {
                return true;
            }
        }
        return false;
    };
    Tool.checkItemName = function (name, checkStr) {
        var checkStrList = checkStr.split("") || [];
        var checkBoo = false;
        checkStrList.forEach(function (str) {
            if (str) {
                var pattern = new RegExp(str);
                var arr = name.split("");
                for (var i = 0, len = arr.length; i < len; i++) {
                    if (pattern.test(arr[i])) {
                        checkBoo = true;
                        break;
                    }
                }
            }
        });
        return checkBoo;
    };
    Tool.calcAngle = function (p1, p2) {
        var angle = Math.atan2((p2.y - p1.y), (p2.x - p1.x));
        return angle * (180 / Math.PI);
    };
    Tool.calculateDirectionByRadin = function (radin) {
        var angle = radin * (180 / Math.PI);
        var direction = -1;
        if (angle > 90) {
            direction = 3;
        }
        else if (angle >= 0) {
            direction = 5;
        }
        else if (angle >= -90) {
            direction = 7;
        }
        else {
            direction = 1;
        }
        return direction;
    };
    Tool.angleToDirections = function (angle, dirMode, out) {
        if (out === undefined) {
            out = {};
        }
        out.left = false;
        out.right = false;
        out.up = false;
        out.down = false;
        angle = (angle + 360) % 360;
        switch (dirMode) {
            case 0: // up & down
                if (angle < 180) {
                    out.down = true;
                }
                else {
                    out.up = true;
                }
                break;
            case 1: // left & right
                if ((angle > 90) && (angle <= 270)) {
                    out.left = true;
                }
                else {
                    out.right = true;
                }
                break;
            case 2: // 4 dir
                if ((angle > 45) && (angle <= 135)) {
                    out.down = true;
                }
                else if ((angle > 135) && (angle <= 225)) {
                    out.left = true;
                }
                else if ((angle > 225) && (angle <= 315)) {
                    out.up = true;
                }
                else {
                    out.right = true;
                }
                break;
            case 3: // 8 dir
                if ((angle > 22.5) && (angle <= 67.5)) {
                    out.down = true;
                    out.right = true;
                }
                else if ((angle > 67.5) && (angle <= 112.5)) {
                    out.down = true;
                }
                else if ((angle > 112.5) && (angle <= 157.5)) {
                    out.down = true;
                    out.left = true;
                }
                else if ((angle > 157.5) && (angle <= 202.5)) {
                    out.left = true;
                }
                else if ((angle > 202.5) && (angle <= 247.5)) {
                    out.left = true;
                    out.up = true;
                }
                else if ((angle > 247.5) && (angle <= 292.5)) {
                    out.up = true;
                }
                else if ((angle > 292.5) && (angle <= 337.5)) {
                    out.up = true;
                    out.right = true;
                }
                else {
                    out.right = true;
                }
                break;
        }
        return out;
    };
    Tool.checkPointerContains = function (gameObject, pointer) {
        if (!gameObject)
            return false;
        var left = -gameObject.width / 2;
        var right = gameObject.width / 2;
        var top = -gameObject.height / 2;
        var bottom = gameObject.height / 2;
        if (pointer) {
            var worldMatrix = gameObject.getWorldTransformMatrix();
            var zoom = worldMatrix.scaleX;
            var x = (pointer.x - worldMatrix.tx) / zoom;
            var y = (pointer.y - worldMatrix.ty) / zoom;
            if (left <= x && right >= x && top <= y && bottom >= y) {
                return true;
            }
            return false;
        }
        return false;
    };
    Tool.baseName = function (str) {
        var base = new String(str).substring(str.lastIndexOf("/") + 1);
        if (base.lastIndexOf(".") !== -1)
            base = base.substring(0, base.lastIndexOf("."));
        return base;
    };
    // public static getRectangle(gameObject, scene) {
    //     // 移动超过30个单位，直接表示在移动，不必做点击处理
    //     const rectangle = new Phaser.Geom.Rectangle(0, 0, 0, 0);
    //     let parent = gameObject.parentContainer;
    //     let zoom = gameObject.scale;
    //     while (parent && parent !== scene) {
    //         zoom *= parent.scale;
    //         parent = parent.parentContainer;
    //     }
    //     const worldWidth = gameObject.width * zoom;
    //     const worldHeight = gameObject.height * zoom;
    //     const worldMatrix = gameObject.getWorldTransformMatrix();
    //     rectangle.left = worldMatrix.tx - worldWidth * gameObject.originX;
    //     rectangle.right = worldMatrix.tx + worldWidth * (1 - gameObject.originX);
    //     rectangle.top = worldMatrix.ty - worldHeight * gameObject.originY;
    //     rectangle.bottom = worldMatrix.ty + worldHeight * (1 - gameObject.originY);
    //     return rectangle;
    // }
    // check is string a number. 0001;2.22 return true
    Tool.isNumeric = function (str) {
        if (typeof str !== "string")
            return false; // we only process strings!
        return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
            !isNaN(parseFloat(str)); // ...and ensure strings of whitespace fail
    };
    Tool.chunk = function (str, n) {
        var result = [];
        for (var i = 0; i < str.length; i += n) {
            result.push(str.substr(i, n));
        }
        return result;
    };
    return Tool;
}());


// CONCATENATED MODULE: ./src/utils/http.ts
function load(path, responseType) {
    return new Promise(function (resolve, reject) {
        var http = new XMLHttpRequest();
        http.addEventListener("error", function () {
            // tslint:disable-next-line:no-console
            console.log("http error =============>>>>");
        });
        http.timeout = 20000; // 超时时间，单位是毫秒
        http.onload = function (response) {
            var currentTarget = response.currentTarget;
            if (currentTarget && currentTarget["status"] === 200)
                resolve(response.currentTarget);
            else
                reject(path + " load error " + currentTarget["status"]);
        };
        http.onerror = function () {
            // Logger.getInstance().warn(`${path} load error`);
            // tslint:disable-next-line:no-console
            console.log("http error ====>");
            reject(path + " load error!!!!!");
        };
        http.ontimeout = function (e) {
            // XMLHttpRequest 超时。在此做某事。
            // tslint:disable-next-line:no-console
            console.log("http timeout ====>");
            reject(path + " load ontimeout!!!!!");
        };
        http.open("GET", path, true);
        http.responseType = responseType || "";
        http.send();
    });
}
function loadArr(urls) {
    return new Promise(function (resolve, reject) {
        var loaded = 0;
        var errors = [];
        var datasMap = new Map();
        var compl = function () {
            if (urls.length === loaded) {
                if (errors.length === 0)
                    resolve(datasMap);
                else
                    reject(errors);
            }
            else {
                var url_1 = urls[loaded];
                load(url_1.path, url_1.type).then(function (req) {
                    datasMap.set(url_1.resName, req);
                    compl();
                }, function (response) {
                    errors.push(response);
                    compl();
                });
            }
            loaded++;
        };
        compl();
    });
}

// CONCATENATED MODULE: ./src/utils/algorithm.ts
var Algorithm = /** @class */ (function () {
    function Algorithm() {
    }
    Algorithm.median = function (arr) {
        var op_arr = arr.sort(function (x, y) {
            return y - x;
        });
        var med = Math.floor(op_arr.length / 2);
        if (op_arr.length % 2 === 0) {
            var h = op_arr[med - 1], l = op_arr[med];
            return (h + l) / 2;
        }
        return op_arr[med];
    };
    return Algorithm;
}());


// CONCATENATED MODULE: ./src/utils/copy.prototype.ts
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


// CONCATENATED MODULE: ./src/utils/stringUtils.ts
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

// var str1 = "hello {0}".format("world"); //log   hello world
// var str1 = "我叫{0},性别{1}".format("美男子", "男"); //log 我叫美男子,性别男
// var user = {name: "美男子",sex: "男",age: 20};
// var str2 = "我叫{name},性别{sex},今年{age}岁".format(user); //我叫美男子,性别男,今年20岁

// CONCATENATED MODULE: ./src/utils/object.assign.ts
var ObjectAssign = /** @class */ (function () {
    function ObjectAssign() {
    }
    /**
     * source 排除特定key后对属性进行替换，递归替换所有对象
     * @param source 被替换对象
     * @param target 替换对象
     * @param tag 通过target或者source中的 tag 来获取要排除替换的属性数组
     */
    ObjectAssign.excludeTagAssign = function (source, target, tag) {
        if (tag === void 0) { tag = "exclude"; }
        if (!source || !target) {
            // tslint:disable-next-line:no-console
            console.error("source", source, "target", target);
            return;
        }
        var excludes = source[tag] || target[tag];
        for (var key in target) {
            if (key !== tag && target.hasOwnProperty(key)) {
                var value = target[key];
                if (typeof value === "object") {
                    if (!source.hasOwnProperty(key)) {
                        if (Array.isArray(value))
                            source[key] = [];
                        else
                            source[key] = {};
                    }
                    this.excludeTagAssign(source[key], value, tag);
                }
                else {
                    if (excludes) {
                        if (excludes.indexOf(key) === -1) {
                            source[key] = target[key];
                        }
                    }
                    else {
                        source[key] = target[key];
                    }
                }
            }
        }
    };
    /**
     * source 中 要排除替换的key 数组 属性为对象递归替换
     * @param source 被替换对象
     * @param target 替换对象
     * @param excludes 排除的key数组
     */
    ObjectAssign.excludeAssign = function (source, target, excludes) {
        for (var key in target) {
            if (target.hasOwnProperty(key)) {
                var value = target[key];
                if (typeof value === "object") {
                    if (!source.hasOwnProperty(key)) {
                        if (Array.isArray(value))
                            source[key] = [];
                        else
                            source[key] = {};
                    }
                    this.excludeAssign(source[key], value);
                }
                else {
                    if (excludes) {
                        if (excludes.indexOf(key) === -1) {
                            source[key] = target[key];
                        }
                    }
                    else {
                        source[key] = target[key];
                    }
                }
            }
        }
    };
    /**
     * source 拥有的所有字段都不被替换
     * @param source 被替换对象
     * @param target 替换对象
     */
    ObjectAssign.excludeAllAssign = function (source, target) {
        for (var key in target) {
            if (target.hasOwnProperty(key)) {
                var value = target[key];
                if (typeof value === "object") {
                    if (!source.hasOwnProperty(key)) {
                        if (Array.isArray(value))
                            source[key] = [];
                        else
                            source[key] = {};
                    }
                    this.excludeAllAssign(source[key], value);
                }
                else {
                    if (!source.hasOwnProperty(key)) {
                        source[key] = value;
                    }
                }
            }
        }
    };
    return ObjectAssign;
}());


// CONCATENATED MODULE: ./src/utils/uiUtil.ts
var UiUtils = /** @class */ (function () {
    function UiUtils() {
    }
    UiUtils.baseDpr = 2;
    UiUtils.baseScale = 1;
    UiUtils.MaxDpr = 3;
    return UiUtils;
}());


// CONCATENATED MODULE: ./src/utils/device.ts
function isMobile(game) {
    return game.device.os.desktop === false;
}

// CONCATENATED MODULE: ./src/utils/http.load.manager.ts
var HttpLoadManager = /** @class */ (function () {
    function HttpLoadManager() {
        this.mCacheList = [];
        this.mCurLen = 0;
    }
    HttpLoadManager.prototype.update = function (time, delay) {
        if (this.mCacheList && this.mCurLen < HttpLoadManager.maxLen) {
            var tmpLen = HttpLoadManager.maxLen - this.mCurLen;
            var list = this.mCacheList.splice(0, tmpLen);
            for (var i = 0; i < tmpLen; i++) {
                var http = list[i];
                if (http) {
                    this.mCurLen++;
                    http.send();
                }
            }
        }
    };
    HttpLoadManager.prototype.destroy = function () {
        this.mCacheList.length = 0;
        this.mCacheList = [];
        this.mCurLen = 0;
    };
    HttpLoadManager.prototype.addLoader = function (loaderConfig) {
        var _this = this;
        if (this.mCurLen < HttpLoadManager.maxLen) {
            var path_1 = loaderConfig.path;
            var responseType_1 = loaderConfig.responseType;
            return new Promise(function (resolve, reject) {
                var http = new XMLHttpRequest();
                http.addEventListener("error", function () {
                    // tslint:disable-next-line:no-console
                    console.log("http error =============>>>>");
                });
                http.timeout = 20000; // 超时时间，单位是毫秒
                http.onload = function (response) {
                    _this.mCurLen--;
                    var currentTarget = response.currentTarget;
                    if (currentTarget && currentTarget["status"] === 200)
                        resolve(response.currentTarget);
                    else
                        reject(path_1 + " load error " + currentTarget["status"]);
                };
                http.onerror = function () {
                    _this.mCurLen--;
                    // tslint:disable-next-line:no-console
                    console.log("http error ====>");
                    reject(path_1 + " load error!!!!!");
                };
                http.ontimeout = function (e) {
                    _this.mCurLen--;
                    // XMLHttpRequest 超时。在此做某事。
                    // tslint:disable-next-line:no-console
                    console.log("http timeout ====>");
                    reject(path_1 + " load ontimeout!!!!!");
                };
                http.open("GET", path_1, true);
                http.responseType = responseType_1 || "";
                _this.mCurLen++;
                http.send();
            });
        }
        else {
            this.mCacheList.unshift(loaderConfig);
        }
    };
    HttpLoadManager.prototype.startSingleLoader = function (loaderConfig) {
        var _this = this;
        var path = loaderConfig.path;
        var responseType = loaderConfig.responseType;
        return new Promise(function (resolve, reject) {
            var http = new XMLHttpRequest();
            http.addEventListener("error", function () {
                // tslint:disable-next-line:no-console
                console.log("http error =============>>>>");
            });
            http.timeout = 20000; // 超时时间，单位是毫秒
            http.onload = function (response) {
                _this.mCurLen--;
                var currentTarget = response.currentTarget;
                if (currentTarget && currentTarget["status"] === 200)
                    resolve(response.currentTarget);
                else
                    reject(path + " load error " + currentTarget["status"]);
            };
            http.onerror = function () {
                _this.mCurLen--;
                // tslint:disable-next-line:no-console
                console.log("http error ====>");
                reject(path + " load error!!!!!");
            };
            http.ontimeout = function (e) {
                _this.mCurLen--;
                // XMLHttpRequest 超时。在此做某事。
                // tslint:disable-next-line:no-console
                console.log("http timeout ====>");
                reject(path + " load ontimeout!!!!!");
            };
            http.open("GET", path, true);
            http.responseType = responseType || "";
            // 当前索引大于加载最大并发数量，则放入缓存队列中
            if (_this.mCurLen >= HttpLoadManager.maxLen) {
                _this.mCacheList.push(http);
            }
            else {
                _this.mCurLen++;
                http.send();
            }
        });
    };
    HttpLoadManager.prototype.startListLoader = function (loaderConfigs) {
        var _this = this;
        return new Promise(function (reslove, reject) {
            var len = loaderConfigs.length;
            for (var i = 0; i < len; i++) {
                var loaderConfig = loaderConfigs[i];
                if (!loaderConfig)
                    continue;
                _this.startSingleLoader(loaderConfig).then(function (req) {
                    reslove(req);
                }).catch(function () {
                    reslove(null);
                });
            }
        });
    };
    HttpLoadManager.maxLen = 30; // 默认最大长度30个，浏览器最大并发数为32个，空余2个为了能处理优先加载逻辑
    return HttpLoadManager;
}());


// CONCATENATED MODULE: ./src/utils/helpers.ts
var Helpers = /** @class */ (function () {
    function Helpers() {
    }
    Helpers.openUrl = function (url) {
        var tempwindow = window.open("", "_blank"); // 先打开页面
        if (tempwindow)
            tempwindow.location.href = url; // 后更改页面地址
    };
    return Helpers;
}());


// CONCATENATED MODULE: ./src/utils/number.utils.ts
var NumberUtils = /** @class */ (function () {
    function NumberUtils() {
    }
    NumberUtils.NumberConvertZHCN = function (number) {
        var map = { "0": "零", "1": "一", "2": "二", 3: "三", 4: "四", 5: "五", 6: "六", 7: "七", 8: "八", 9: "九" };
        var convert = "";
        var numberstr = number + "";
        for (var _i = 0, numberstr_1 = numberstr; _i < numberstr_1.length; _i++) {
            var n = numberstr_1[_i];
            var temp = map[n];
            convert += temp;
        }
        return convert;
    };
    return NumberUtils;
}());


// CONCATENATED MODULE: ./src/utils/index.ts














/***/ })

/******/ });
});