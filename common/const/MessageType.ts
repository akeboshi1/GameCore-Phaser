/**
 * 系统消息定义
 * author aaron
 */
export class MessageType {
    public static CREATE_ROLE = "create_role";
    public static APP_START = "app_start";

    public static EDITOR_CHANGE_MODE = "editor_change_mode";
    public static CLIENT_RESIZE = "app_client_resize";

    public static SCENE_INITIALIZED = "SCENE_INITIALIZED";
    public static SCENE_CLEARED = "SCENE_CLEARED";
    public static SCENE_CHANGE_TO = "SCENE_CHANGE_TO";
    public static SCENE_MOVE_TO = "scene_move_to";
    public static SCENE_MOVE_STOP = "scene_move_stop";
    public static CHANGE_ELEMENT_ANIMATION = "change_element_animation";

    public static CHAT_TO = "chat_to";
    public static SHOW_CHAT_BUBBLE = "show_chat_bubble";
    public static PROMPT_ALERT = "prompt_alert";

    /// never start
    public static QCLOUD_AUTH = "qcloud_auth";
    public static ENTER_SCENE = "enter_scene";
    /// never end

    public static SCENE_ADD_PLAYER = "scene_add_player";
    public static SCENE_REMOVE_PLAYER = "scene_remove_player";
    public static SCENE_UPDATE_PLAYER = "scene_update_player";
    public static SCENE_ADD_ELEMENT = "scene_add_element";
    public static SCENE_ADD_TERRAIN = "scene_add_terrain";
    public static SCENE_ADD_TERRAIN_END = "scene_add_terrain_end";
    public static SCENE_ADD_ALL_TERRAIN = "scene_add_all_terrain";
    public static SCENE_REMOVE_ELEMENT = "scene_remove_element";
    public static SCENE_REMOVE_TERRAIN = "scene_remove_terrain";
    public static SCENE_REMOVE_ALL_TERRAIN = "scene_remove_all_terrain";
    public static SCENE_MOUSE_FOLLOW = "scene_mouse_follow";
    public static SCENE_SELECT_ELEMENT = "scene_select_element";
    public static SCENE_FIXED_TO_ELEMENT = "scene_fixed_to_element";
    public static SCENE_UPDATE_ELEMENT = "sceneUpdateElement";
    public static SCENE_SYNCHRO_PACKAGE = "sceneSynchroPackage";
    public static SCENE_VISIBLE_GRID = "sceneVisibleGrid";

    public static PLAYER_SELECT_CHARACTER = "player_select_character";
    public static PLAYER_DATA_INITIALIZE = "player_data_initialize";
    public static SCENE_DATA_INITIALIZE = "scene_data_initialize";

    public static PACKAGE_ITEM_ADD = "package_item_add";
    public static PACKAGE_ITEM_REMOVE = "package_item_remove";
    public static PACKAGE_EXCHANGE_ITEM_POS = "package_exchange_item_pos";

    public static SEFL_TARGET_START_MOVE = "SEFL_TARGET_START_MOVE";
    public static SEFL_TARGET_PAUSE_MOVE = "SEFL_TARGET_PAUSE_MOVE";

    public static SCENE_BACKGROUND_CLICK = "SCENE_BACKGROUND_CLICK";

    public static ADD_SCENE_ELEMENT = "ADD_SCENE_ELEMENT";
    public static REMOVE_SCENE_ELEMENT = "REMOVE_SCENE_ELEMENT";

    public static CHANGE_SELF_AVATAR = "CHANGE_SELF_AVATAR";

    public static DRAG_TO_DROP = "DRAG_TO_DROP";
    public static DRAG_OVER_DROP = "DRAG_OVER_DROP";

    public static GAME_GLOBALS_TICK = "GAME_GLOBALS_TICK";
    public static GAME_GLOBALS_FRAME = "GAME_GLOBALS_FRAME";

    /**
    * 模块视图添加到显示列表
    */
    public static MODULE_VIEW_ADD = "module_view_add";
    /**
     * 模块视图移除从显示列表
     */
    public static MODULE_VIEW_REM = "module_view_rem";

    /**
     * 跑马灯公告
     */
    public static SHOW_NOTICE = "show_notice";
}

