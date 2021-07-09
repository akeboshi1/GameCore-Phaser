import { i18n } from "structure";
export class LoadingTips {
  static enterWorld() {
    return i18n.t("loading.enter_game");
  }
  static loginGame() {
    return i18n.t("loading.logging");
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
  static downloadJsonConfig() {
    return i18n.t("loading.downloading_json_config");
  }
  static loadingResources() {
    return i18n.t("loading.loading_resources");
  }
  static createScene() {
    return i18n.t("loading.create_scene");
  }
  static waitEnterRoom() {
    return i18n.t("loading.wait_enter_room");
  }
}
