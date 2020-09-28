import { i18n } from "../../../utils/i18n";

export class LoadingTips {
    /**
     * send _OP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT
     */
    // static ENTER_GMAE: string = i18n.t("loading.enter_game");
    // static LOGIN_GAME: string = i18n.t("loading.logging");
    static enterGame() {
        return i18n.t("loading.enter_game");
    }

    static downloadGameConfig() {
        return i18n.t("loading.downloading_config");
    }

    static downloadSceneConfig() {
        return i18n.t("loading.downloading_scene_config");
    }

    static parseConfig() {
        return i18n.t("loading.parse_config");
    }

    static waitEnterRoom() {
        return i18n.t("loading.wait_enter_room");
    }

    static loginGame() {
        return i18n.t("loading.logging");
    }
}
