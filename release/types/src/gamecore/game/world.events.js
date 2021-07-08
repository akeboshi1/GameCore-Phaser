export var SceneEvent;
(function (SceneEvent) {
    SceneEvent["SCENE_CREATE"] = "scene_create";
    SceneEvent["SCENE_CHANGE"] = "scene_change";
    SceneEvent["SCENE_DESTROY"] = "scene_destroy";
    SceneEvent["SCENE_PAUSE"] = "scene_pause";
    SceneEvent["SCENE_RESUME"] = "scene_resume";
})(SceneEvent || (SceneEvent = {}));
export var GameEvent;
(function (GameEvent) {
    GameEvent["GAME_CREATE"] = "game_create";
    GameEvent["GAME_CLEAR"] = "game_clear";
    GameEvent["GAME_DESTROY"] = "game_destroy";
})(GameEvent || (GameEvent = {}));
export var UIEvent;
(function (UIEvent) {
    UIEvent["SHOW_UI"] = "show_ui";
    UIEvent["HIDE_UI"] = "hide_ui";
})(UIEvent || (UIEvent = {}));
export var ModuleEvent;
(function (ModuleEvent) {
    ModuleEvent["MODULE_INIT"] = "module_init";
    ModuleEvent["MODULE_DESTROY"] = "module_destroy";
})(ModuleEvent || (ModuleEvent = {}));
//# sourceMappingURL=world.events.js.map