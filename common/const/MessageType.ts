/**
 * 系统消息定义
 * author aaron
 */
export class MessageType {
    public static CREATE_ROLE: string = "create_role";
    public static APP_START: string = "app_start";
    public static CLIENT_RESIZE: string = "app_client_resize";
    public static SCENE_TRANS_IN: string = "app_scene_trans_in";
    public static SCENE_TRANS_OUT: string = "app_scene_trans_out";
    public static EUI_VIEW_READY: string = "app_eui_view_ready";
    public static EUI_VIEW_CLOSE: string = "app_eui_view_close";
    public static SOCKET_NOT_SUPPORT: string = "app_socket_not_support";

    public static SCENE_INITIALIZED: string = "SCENE_INITIALIZED";
    public static SCENE_CLEARED: string = "SCENE_CLEARED";
    public static SCENE_CHANGE_TO: string = "SCENE_CHANGE_TO";

    public static SEFL_TARGET_START_MOVE: string = "SEFL_TARGET_START_MOVE";
    public static SEFL_TARGET_PAUSE_MOVE: string = "SEFL_TARGET_PAUSE_MOVE";

    public static SCENE_BACKGROUND_CLICK: string = "SCENE_BACKGROUND_CLICK";

    public static ADD_SCENE_ELEMENT: string = "ADD_SCENE_ELEMENT";
    public static REMOVE_SCENE_ELEMENT: string = "REMOVE_SCENE_ELEMENT";

    public static DRAG_START: string = "DRAG_START";
    public static ACCET_DROP: string = "ACCET_DROP";
    public static DRAG_MOVE: string = "DRAG_MOVE";
    public static DRAG_STOP: string = "DRAG_STOP";
    public static DRAG_RECYCLE: string = "DRAG_RECYCLE";

    public static CHANGE_SELF_AVATAR: string = "CHANGE_SELF_AVATAR";

    public static FURNI_MENU_CLIK: string = "FURNI_MENU_CLIK";
}

