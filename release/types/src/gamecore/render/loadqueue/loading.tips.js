import { i18n } from "structure";
var LoadingTips = /** @class */ (function () {
    function LoadingTips() {
    }
    // 进入游戏 socket链接成功
    LoadingTips.enterWorld = function () {
        return i18n.t("loading.enter_game");
    };
    // 正在登陆
    LoadingTips.loginGame = function () {
        return i18n.t("loading.logging");
    };
    // 下载游戏配置 接收 _OP_GATEWAY_RES_CLIENT_VIRTUAL_WORLD_INIT
    LoadingTips.downloadGameConfig = function () {
        return i18n.t("loading.downloading_config");
    };
    // 下载场景配置 接收 op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE
    LoadingTips.downloadSceneConfig = function () {
        return i18n.t("loading.downloading_scene_config");
    };
    // 解析配置 加载完pi解析config
    LoadingTips.parseConfig = function () {
        return i18n.t("loading.parse_config");
    };
    // 加载 前端json配置
    LoadingTips.downloadJsonConfig = function () {
        return i18n.t("loading.downloading_json_config");
    };
    // 正在加载资源
    LoadingTips.loadingResources = function () {
        return i18n.t("loading.loading_resources");
    };
    // 创建scene
    LoadingTips.createScene = function () {
        return i18n.t("loading.create_scene");
    };
    // 等待进入房间房间 发送 _OP_CLIENT_REQ_GATEWAY_GAME_CREATED 等待进入
    LoadingTips.waitEnterRoom = function () {
        return i18n.t("loading.wait_enter_room");
    };
    return LoadingTips;
}());
export { LoadingTips };
//# sourceMappingURL=loading.tips.js.map