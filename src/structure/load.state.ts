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
    static readonly LOADINg_RESOURCES = "loading.loadresource";
}
