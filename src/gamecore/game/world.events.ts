export enum SceneEvent {
    SCENE_CREATE = "scene_create",
    SCENE_CHANGE = "scene_change",
    SCENE_DESTROY = "scene_destroy",
    SCENE_PAUSE = "scene_pause",
    SCENE_RESUME = "scene_resume",
}

export enum GameEvent {
    GAME_CREATE = "game_create",
    GAME_CLEAR = "game_clear",
    GAME_DESTROY = "game_destroy",
}

export enum UIEvent {
    SHOW_UI = "show_ui",
    HIDE_UI = "hide_ui"
}

export enum ModuleEvent {
    MODULE_INIT = "module_init",
    MODULE_DESTROY = "module_destroy",
}
