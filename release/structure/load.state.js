export var LoadState;
(function(LoadState2) {
  LoadState2[LoadState2["ENTERWORLD"] = 0] = "ENTERWORLD";
  LoadState2[LoadState2["DOWNLOADGAMECONFIG"] = 1] = "DOWNLOADGAMECONFIG";
  LoadState2[LoadState2["DOWNLOADSCENECONFIG"] = 2] = "DOWNLOADSCENECONFIG";
  LoadState2[LoadState2["PARSECONFIG"] = 3] = "PARSECONFIG";
  LoadState2[LoadState2["WAITENTERROOM"] = 4] = "WAITENTERROOM";
  LoadState2[LoadState2["LOADINGRESOURCES"] = 5] = "LOADINGRESOURCES";
  LoadState2[LoadState2["LOGINGAME"] = 6] = "LOGINGAME";
  LoadState2[LoadState2["CREATESCENE"] = 7] = "CREATESCENE";
  LoadState2[LoadState2["LOADJSON"] = 8] = "LOADJSON";
})(LoadState || (LoadState = {}));
export var PlaySceneLoadState;
(function(PlaySceneLoadState2) {
  PlaySceneLoadState2[PlaySceneLoadState2["CREATING_SCENE"] = 0] = "CREATING_SCENE";
  PlaySceneLoadState2[PlaySceneLoadState2["CREATING_ROOM"] = 1] = "CREATING_ROOM";
  PlaySceneLoadState2[PlaySceneLoadState2["LOAD_COMPOLETE"] = 2] = "LOAD_COMPOLETE";
})(PlaySceneLoadState || (PlaySceneLoadState = {}));
