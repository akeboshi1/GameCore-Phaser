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

  public static SCENE_ADD_ELEMENT = "scene_add_element";
  public static SCENE_ADD_TERRAIN = "scene_add_terrain";
  public static SCENE_REMOVE_ELEMENT = "scene_remove_terrain";
  public static SCENE_REMOVE_TERRAIN = "scene_remove_terrain";
  public static SCENE_REMOVE_ALL_TERRAIN = "scene_remove_all_terrain";

  public static PLAYER_DATA_INITIALIZE = "scene_data_initialize";
  public static SCENE_DATA_INITIALIZE = "scene_data_initialize";

  public static SEFL_TARGET_START_MOVE = "SEFL_TARGET_START_MOVE";
  public static SEFL_TARGET_PAUSE_MOVE = "SEFL_TARGET_PAUSE_MOVE";

  public static SCENE_BACKGROUND_CLICK = "SCENE_BACKGROUND_CLICK";

  public static ADD_SCENE_ELEMENT = "ADD_SCENE_ELEMENT";
  public static REMOVE_SCENE_ELEMENT = "REMOVE_SCENE_ELEMENT";

  public static CHANGE_SELF_AVATAR = "CHANGE_SELF_AVATAR";
}

