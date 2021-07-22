export declare enum LoadState {
    ENTERWORLD = 0,
    DOWNLOADGAMECONFIG = 1,
    DOWNLOADSCENECONFIG = 2,
    PARSECONFIG = 3,
    WAITENTERROOM = 4,
    LOADINGRESOURCES = 5,
    LOGINGAME = 6,
    CREATESCENE = 7,
    LOADJSON = 8
}
export declare enum PlaySceneLoadState {
    CREATING_SCENE = 0,
    CREATING_ROOM = 1,
    LOAD_COMPOLETE = 2
}
export declare class LoadingTips {
    static readonly LOADING_RESOURCES = "loading.loadresource";
    static readonly ENTER_WORLD = "loading.enter_world";
    static readonly LOGIN_GAME = "loading.logging";
    static readonly DOWNLOAD_CONFIG = "loading.downloading_game_config";
    static readonly DOWNLOAD_SCENE_CONFIG = "loading.downloading_scene_config";
    static readonly PARSE_CONFIG = "loading.parse_config";
    static readonly WAIT_ENTER_ROOM = "loading.wait_enter_room";
    static readonly LOAD_JSON_CONFIG = "loading.downloading_json_config";
}
