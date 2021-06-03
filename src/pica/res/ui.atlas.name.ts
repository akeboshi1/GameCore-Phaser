export class UIAtlasName {
    public static commonUrl = "ui_base/ui_base";
    public static common2Url = "ui_base2/ui_base2";
    public static common3Url = "ui_base3/ui_base3";
    public static uicommonurl = "ui_common/ui_common";
    public static uibase = "ui_base";
    public static uibase2 = "ui_base2";
    public static uibase3 = "ui_base3";

    public static uicommon = "ui_common";
    public static uicommon1 = "ui_common1";
    public static roam = "roam";
    public static iconcommon = "icon_common";
    public static effectcommon = "effect_common";
    public static effectlevelup = "effectlevelup";
    public static stareffect = "stareffect";
    public static circleeffect = "circleeffect";
    public static explorelog = "explorelog";
    public static treasure = "treasure";
    public static friend_message = "friend_message";
    public static createrole = "createrole";
    public static people_action = "people_action";
    public static map = "map";
    public static recast = "recast";
    public static layout = "layout";
    public static illustrate = "illustrate";
    public static illustrate_new = "illustrate_new";
    public static survey = "survey";
    public static mail = "mail";
    public static cooking = "cooking";
    public static room_info = "room_information";
    public static bulletin = "bulletin";
    public static chat = "chat";
    public static multiple_rooms = "multiple_rooms";
    public static decorateshop = "decorateshop";
    public static room_decorate = "room_decorate";
    public static mine_new = "mine_new";
    public static task_daily = "task_daily";
    public static order_new = "order_new";
    public static friend_new = "friend_new";
    public static jsonUrl(name: string) {
        return name + ".json";
    }
    public static textureUrl(name: string) {
        return name + ".png";
    }
}

export class UIAtlasKey {
    public static commonKey = "common_key";
    public static common2Key = "common2_key";
    public static common3Key = "common3_key";
    public static uicommonKey = "uicommon_key";
}
