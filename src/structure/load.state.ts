export enum LoadState {
    ENTERWORLD,
    DOWNLOADGAMECONFIG,
    DOWNLOADSCENECONFIG,
    PARSECONFIG,
    WAITENTERROOM,
    LOADINGRESOURCES,
    LOGINGAME,
    CREATESCENE,
    LOADJSON,
}

export enum PlaySceneLoadState {
    CREATING_SCENE,
    CREATING_ROOM,
    LOAD_COMPOLETE,
}

export class LoadingTips {
    static readonly LOADING_RESOURCES = "loading.loadresource";
    static readonly ENTER_WORLD = "loading.enter_world";
    static readonly LOGIN_GAME = "loading.logging";
    static readonly DOWNLOAD_CONFIG = "loading.downloading_game_config";
    static readonly DOWNLOAD_SCENE_CONFIG = "loading.downloading_scene_config";
    static readonly PARSE_CONFIG = "loading.parse_config";
    static readonly WAIT_ENTER_ROOM = "loading.wait_enter_room";
    static readonly LOAD_JSON_CONFIG = "loading.downloading_json_config";
}
