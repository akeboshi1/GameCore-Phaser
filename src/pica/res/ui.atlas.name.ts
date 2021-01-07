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
    public static stareffect = "stareffect";
    public static circleeffect = "circleeffect";
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
