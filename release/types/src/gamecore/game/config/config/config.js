export var notice_url = "https://a.tooqing.com/picatown/announcement";
var HTTP_REGEX = /^(http|https):/i;
var ConfigPath = /** @class */ (function () {
    function ConfigPath() {
    }
    ConfigPath.getConfigPath = function () {
        return ConfigPath.ROOT_PATH + "game/resource/5e719a0a68196e416ecf7aad/.config.json";
    };
    ConfigPath.getBasePath = function () {
        return ConfigPath.ROOT_PATH + "game/resource/5e719a0a68196e416ecf7aad/";
    };
    ConfigPath.getBaseVersionPath = function () {
        if (this.version === "")
            return undefined;
        return this.getBasePath() + this.version + "/";
    };
    ConfigPath.getSceneConfigUrl = function (url) {
        if (HTTP_REGEX.test(url)) {
            return url;
        }
        return "" + this.ROOT_PATH + url;
    };
    ConfigPath.ROOT_PATH = "/";
    ConfigPath.version = "";
    return ConfigPath;
}());
export { ConfigPath };
//# sourceMappingURL=config.js.map