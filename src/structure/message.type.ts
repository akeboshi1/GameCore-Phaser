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
    public static CHANGE_CHARACTER_ANIMATION = "change_character_animation";

    public static CHAT_TO = "chat_to";
    public static SHOW_CHAT_BUBBLE = "show_chat_bubble";
    public static REMOVE_CHAT_BUBBLE = "remove_chat_bubble";
    public static PROMPT_ALERT = "prompt_alert";
    public static CHARACTER_TALING = "characterTaling";
    public static CHARACTER_SHUT_UP = "characterShutUp";

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

    public static SCENE_BACKGROUND_CLICK = "SCENE_BACKGROUND_CLICK";

    public static CHANGE_SELF_AVATAR = "CHANGE_SELF_AVATAR";

    public static DRAG_TO_DROP = "DRAG_TO_DROP";
    public static DRAG_OVER_DROP = "DRAG_OVER_DROP";

    public static QUERY_PACKAGE = "query_package";
    public static SYNC_USER_BALANCE = "syncUserBalance";

    public static UPDATED_CHARACTER_PACKAGE = "updatedCharacterPackage";

    public static SHOW_EFFECT = "showEffect";

    public static EDIT_MODE_QUERY_PACKAGE = "editModeQueryPackage";

    public static PRESS_ELEMENT = "PRESS_ELEMENT";

    // 旋转物件
    public static TURN_ELEMENT = "turnElement";
    // 回收
    public static RECYCLE_ELEMENT = "recycleElement";
    // 放置
    public static PUT_ELEMENT = "putElement";
    public static CANCEL_PUT = "cancelPut";

    // 展开物件容器
    public static EDIT_PACKAGE_EXPANED = "editPackageExpaned";
    // 收起物件容器
    public static EDIT_PACKAGE_COLLAPSE = "editPackageCollapse";

    // 小屋装扮
    public static DECORATE_SELECTE_ELEMENT = "decorateSelecteElement";
    public static DECORATE_UNSELECT_ELEMENT = "decorateUnselectElement";
    public static DECORATE_UPDATE_SELECTED_ELEMENT_CAN_PLACE = "decorateUpdateSelectedElementCanPlace";
    public static DECORATE_UPDATE_SELECTED_ELEMENT_POSITION = "decorateUpdateSelectedElementPosition";
    public static DECORATE_UPDATE_ELEMENT_COUNT = "decorateUpdateElementCount";
    public static DECORATE_ELEMENT_CREATED = "decorateElementCreated";

    public static ADD_ICON_TO_TOP = "addIconToTop";
    public static REMOVE_ICON_FROM_TOP = "removeIconFromTop";

    public static SHOW_UI = "showUI";

    public static SHOW_NOTICE = "showNotice";

}
