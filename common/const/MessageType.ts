/**
 * 系统消息定义
 * author aaron
 */
export class MessageType {
    public static CREATE_ROLE: string = "create_role";
    public static APP_START: string = "app_start";

    public static EDITOR_CHANGE_MODE: string = "editor_change_mode";
    public static CLIENT_RESIZE: string = "app_client_resize";

    public static SCENE_INITIALIZED: string = "SCENE_INITIALIZED";
    public static SCENE_CLEARED: string = "SCENE_CLEARED";
    public static SCENE_CHANGE_TO: string = "SCENE_CHANGE_TO";

    public static SCENE_DATA_INITIALIZE: string = "scene_data_initialize";

    public static SEFL_TARGET_START_MOVE: string = "SEFL_TARGET_START_MOVE";
    public static SEFL_TARGET_PAUSE_MOVE: string = "SEFL_TARGET_PAUSE_MOVE";

    public static SCENE_BACKGROUND_CLICK: string = "SCENE_BACKGROUND_CLICK";

    public static ADD_SCENE_ELEMENT: string = "ADD_SCENE_ELEMENT";
    public static REMOVE_SCENE_ELEMENT: string = "REMOVE_SCENE_ELEMENT";

    public static CHANGE_SELF_AVATAR: string = "CHANGE_SELF_AVATAR";
}

