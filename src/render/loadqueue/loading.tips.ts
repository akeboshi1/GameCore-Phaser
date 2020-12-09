import { i18n } from "utils";

export class LoadingTips {
    // 进入游戏 socket链接成功
    static enterGame() {
        return i18n.t("loading.enter_game");
    }

    // 正在登陆
    static loginGame() {
        return i18n.t("loading.logging");
    }

    // 下载游戏配置 接收 _OP_GATEWAY_RES_CLIENT_VIRTUAL_WORLD_INIT
    static downloadGameConfig() {
        return i18n.t("loading.downloading_config");
    }

    // 下载场景配置 接收 op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE
    static downloadSceneConfig() {
        return i18n.t("loading.downloading_scene_config");
    }

    // 解析配置 加载完pi解析config
    static parseConfig() {
        return i18n.t("loading.parse_config");
    }

    // 正在加载资源
    static loadingResources() {
        return i18n.t("loading.loading_resources");
    }

    // 创建scene
    static createScene() {
        return i18n.t("loading.create_scene");
    }

    // 等待进入房间房间 发送 _OP_CLIENT_REQ_GATEWAY_GAME_CREATED 等待进入
    static waitEnterRoom() {
        return i18n.t("loading.wait_enter_room");
    }

}
