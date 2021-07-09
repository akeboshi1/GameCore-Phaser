export var SceneEvent;
(function(SceneEvent2) {
  SceneEvent2["SCENE_CREATE"] = "scene_create";
  SceneEvent2["SCENE_CHANGE"] = "scene_change";
  SceneEvent2["SCENE_DESTROY"] = "scene_destroy";
  SceneEvent2["SCENE_PAUSE"] = "scene_pause";
  SceneEvent2["SCENE_RESUME"] = "scene_resume";
})(SceneEvent || (SceneEvent = {}));
export var GameEvent;
(function(GameEvent2) {
  GameEvent2["GAME_CREATE"] = "game_create";
  GameEvent2["GAME_CLEAR"] = "game_clear";
  GameEvent2["GAME_DESTROY"] = "game_destroy";
})(GameEvent || (GameEvent = {}));
export var UIEvent;
(function(UIEvent2) {
  UIEvent2["SHOW_UI"] = "show_ui";
  UIEvent2["HIDE_UI"] = "hide_ui";
})(UIEvent || (UIEvent = {}));
export var ModuleEvent;
(function(ModuleEvent2) {
  ModuleEvent2["MODULE_INIT"] = "module_init";
  ModuleEvent2["MODULE_DESTROY"] = "module_destroy";
})(ModuleEvent || (ModuleEvent = {}));
