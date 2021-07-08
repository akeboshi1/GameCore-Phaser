var Url = /** @class */ (function () {
    function Url() {
        // cdn资源路径
        this.OSD_PATH = "";
        // 本地资源路径
        this.RES_PATH = "";
        this.RESUI_PATH = "";
        this.RESOURCE_ROOT = "";
    }
    Url.prototype.init = function (config) {
        // { osd: this.mConfig.osd, res: `resources/`, resUI: `resources/ui/` }
        this.OSD_PATH = config.osd;
        this.RES_PATH = config.res;
        this.RESUI_PATH = config.resUI;
    };
    //  REQUIRE_CONTEXT;
    Url.prototype.getRes = function (value) {
        return this.RES_PATH + value;
    };
    Url.prototype.getUIRes = function (dpr, value) {
        return this.RESUI_PATH + (dpr + "x/" + value);
    };
    Url.prototype.getSound = function (key) {
        return "sound/" + key + ".mp3";
    };
    Url.prototype.getNormalUIRes = function (value) {
        return this.RESUI_PATH + value;
    };
    Url.prototype.getOsdRes = function (value) {
        if (!value) {
            // tslint:disable-next-line:no-console
            console.warn("splicing url failed");
            return;
        }
        if (this.OSD_PATH) {
            return this.OSD_PATH + value;
        }
        return value;
    };
    Url.prototype.getPartName = function (value) {
        return value + "_png";
    };
    Url.prototype.getPartUrl = function (value) {
        return this.OSD_PATH + "avatar/part/" + value + ".png";
    };
    Url.prototype.getUsrAvatarTextureUrls = function (value) {
        return {
            img: this.OSD_PATH + "user_avatar/texture/" + value + ".png",
            json: this.OSD_PATH + "user_avatar/texture/" + value + ".json"
        };
    };
    Url.prototype.getResRoot = function (value) {
        if (this.OSD_PATH)
            return this.OSD_PATH + "/" + value;
        return value;
    };
    return Url;
}());
export { Url };
//# sourceMappingURL=resUtil.js.map