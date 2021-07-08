export var LoadState;
(function (LoadState) {
    LoadState[LoadState["ENTERWORLD"] = 0] = "ENTERWORLD";
    LoadState[LoadState["DOWNLOADGAMECONFIG"] = 1] = "DOWNLOADGAMECONFIG";
    LoadState[LoadState["DOWNLOADSCENECONFIG"] = 2] = "DOWNLOADSCENECONFIG";
    LoadState[LoadState["PARSECONFIG"] = 3] = "PARSECONFIG";
    LoadState[LoadState["WAITENTERROOM"] = 4] = "WAITENTERROOM";
    LoadState[LoadState["LOADINGRESOURCES"] = 5] = "LOADINGRESOURCES";
    LoadState[LoadState["LOGINGAME"] = 6] = "LOGINGAME";
    LoadState[LoadState["CREATESCENE"] = 7] = "CREATESCENE";
    LoadState[LoadState["LOADJSON"] = 8] = "LOADJSON";
})(LoadState || (LoadState = {}));
export var PlaySceneLoadState;
(function (PlaySceneLoadState) {
    PlaySceneLoadState[PlaySceneLoadState["CREATING_SCENE"] = 0] = "CREATING_SCENE";
    PlaySceneLoadState[PlaySceneLoadState["CREATING_ROOM"] = 1] = "CREATING_ROOM";
    PlaySceneLoadState[PlaySceneLoadState["LOAD_COMPOLETE"] = 2] = "LOAD_COMPOLETE";
})(PlaySceneLoadState || (PlaySceneLoadState = {}));
//# sourceMappingURL=load.state.js.map