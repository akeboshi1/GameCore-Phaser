/**
 * 系统消息定义
 * author aaron
 */
var MessageType = /** @class */ (function () {
    function MessageType() {
    }
    MessageType.CREATE_ROLE = "create_role";
    MessageType.APP_START = "app_start";
    MessageType.EDITOR_CHANGE_MODE = "editor_change_mode";
    MessageType.CLIENT_RESIZE = "app_client_resize";
    MessageType.SCENE_INITIALIZED = "SCENE_INITIALIZED";
    MessageType.SCENE_CLEARED = "SCENE_CLEARED";
    MessageType.SCENE_CHANGE_TO = "SCENE_CHANGE_TO";
    MessageType.SCENE_MOVE_TO = "scene_move_to";
    MessageType.SCENE_MOVE_STOP = "scene_move_stop";
    MessageType.CHANGE_ELEMENT_ANIMATION = "change_element_animation";
    MessageType.CHANGE_CHARACTER_ANIMATION = "change_character_animation";
    MessageType.CHAT_TO = "chat_to";
    MessageType.SHOW_CHAT_BUBBLE = "show_chat_bubble";
    MessageType.REMOVE_CHAT_BUBBLE = "remove_chat_bubble";
    MessageType.PROMPT_ALERT = "prompt_alert";
    MessageType.CHARACTER_TALING = "characterTaling";
    MessageType.CHARACTER_SHUT_UP = "characterShutUp";
    /// never start
    MessageType.QCLOUD_AUTH = "qcloud_auth";
    MessageType.ENTER_SCENE = "enter_scene";
    /// never end
    MessageType.SCENE_ADD_PLAYER = "scene_add_player";
    MessageType.SCENE_REMOVE_PLAYER = "scene_remove_player";
    MessageType.SCENE_UPDATE_PLAYER = "scene_update_player";
    MessageType.SCENE_ADD_ELEMENT = "scene_add_element";
    MessageType.SCENE_ADD_TERRAIN = "scene_add_terrain";
    MessageType.SCENE_ADD_TERRAIN_END = "scene_add_terrain_end";
    MessageType.SCENE_ADD_ALL_TERRAIN = "scene_add_all_terrain";
    MessageType.SCENE_REMOVE_ELEMENT = "scene_remove_element";
    MessageType.SCENE_REMOVE_TERRAIN = "scene_remove_terrain";
    MessageType.SCENE_REMOVE_ALL_TERRAIN = "scene_remove_all_terrain";
    MessageType.SCENE_MOUSE_FOLLOW = "scene_mouse_follow";
    MessageType.SCENE_SELECT_ELEMENT = "scene_select_element";
    MessageType.SCENE_FIXED_TO_ELEMENT = "scene_fixed_to_element";
    MessageType.SCENE_UPDATE_ELEMENT = "sceneUpdateElement";
    MessageType.SCENE_SYNCHRO_PACKAGE = "sceneSynchroPackage";
    MessageType.SCENE_VISIBLE_GRID = "sceneVisibleGrid";
    MessageType.PLAYER_SELECT_CHARACTER = "player_select_character";
    MessageType.PLAYER_DATA_INITIALIZE = "player_data_initialize";
    MessageType.SCENE_DATA_INITIALIZE = "scene_data_initialize";
    MessageType.PACKAGE_ITEM_ADD = "package_item_add";
    MessageType.PACKAGE_ITEM_REMOVE = "package_item_remove";
    MessageType.PACKAGE_EXCHANGE_ITEM_POS = "package_exchange_item_pos";
    MessageType.SCENE_BACKGROUND_CLICK = "SCENE_BACKGROUND_CLICK";
    MessageType.CHANGE_SELF_AVATAR = "CHANGE_SELF_AVATAR";
    MessageType.DRAG_TO_DROP = "DRAG_TO_DROP";
    MessageType.DRAG_OVER_DROP = "DRAG_OVER_DROP";
    MessageType.QUERY_PACKAGE = "query_package";
    MessageType.SYNC_USER_BALANCE = "syncUserBalance";
    MessageType.UPDATED_CHARACTER_PACKAGE = "updatedCharacterPackage";
    MessageType.SHOW_EFFECT = "showEffect";
    MessageType.EDIT_MODE_QUERY_PACKAGE = "editModeQueryPackage";
    MessageType.PRESS_ELEMENT = "PRESS_ELEMENT";
    // 旋转物件
    MessageType.TURN_ELEMENT = "turnElement";
    // 回收
    MessageType.RECYCLE_ELEMENT = "recycleElement";
    // 放置
    MessageType.PUT_ELEMENT = "putElement";
    MessageType.CANCEL_PUT = "cancelPut";
    // 展开物件容器
    MessageType.EDIT_PACKAGE_EXPANED = "editPackageExpaned";
    // 收起物件容器
    MessageType.EDIT_PACKAGE_COLLAPSE = "editPackageCollapse";
    // 小屋装扮
    MessageType.DECORATE_SELECTE_ELEMENT = "decorateSelecteElement";
    MessageType.DECORATE_UNSELECT_ELEMENT = "decorateUnselectElement";
    MessageType.DECORATE_UPDATE_SELECTED_ELEMENT_CAN_PLACE = "decorateUpdateSelectedElementCanPlace";
    MessageType.DECORATE_UPDATE_SELECTED_ELEMENT_POSITION = "decorateUpdateSelectedElementPosition";
    MessageType.DECORATE_UPDATE_ELEMENT_COUNT = "decorateUpdateElementCount";
    MessageType.DECORATE_ELEMENT_CREATED = "decorateElementCreated";
    MessageType.ADD_ICON_TO_TOP = "addIconToTop";
    MessageType.REMOVE_ICON_FROM_TOP = "removeIconFromTop";
    MessageType.SHOW_UI = "showUI";
    MessageType.SHOW_NOTICE = "showNotice";
    return MessageType;
}());
export { MessageType };
//# sourceMappingURL=message.type.js.map