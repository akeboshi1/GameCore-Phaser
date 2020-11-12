export class UIAtlasName {
    public static commonUrl = "common/ui_base";
    public static common2Url = "ui_base2/ui_base2";
    public static common3Url = "ui_base3/ui_base3";
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
}
