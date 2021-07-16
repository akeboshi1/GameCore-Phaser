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
    static readonly LOADINg_RESOURCES = "loading.loadresource";
}
