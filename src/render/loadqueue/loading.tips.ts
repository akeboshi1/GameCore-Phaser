import { i18n } from "utils";

export class LoadingTips {
    /**
     * send _OP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT
     */
    // static ENTER_GMAE: string = i18n.t("loading.enter_game");
    // static LOGIN_GAME: string = i18n.t("loading.logging");
    // 进入游戏
    static enterGame() {
        return i18n.t("loading.enter_game");
    }

    // 下载游戏配置
    static downloadGameConfig() {
        return i18n.t("loading.downloading_config");
    }

    // 下载场景配置
    static downloadSceneConfig() {
        return i18n.t("loading.downloading_scene_config");
    }

    // 解析配置
    static parseConfig() {
        return i18n.t("loading.parse_config");
    }

    // 等待进入房间
    static waitEnterRoom() {
        return i18n.t("loading.wait_enter_room");
    }

    // 正在加载资源
    static loadingResources() {
        return i18n.t("loading.loading_resources");
    }

    // 正在登陆
    static loginGame() {
        return i18n.t("loading.logging");
    }
}
