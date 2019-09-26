import * as url from "url";
import * as path from "path";
export class Url {
    static getRes(value: string): string {
        // 资源地址根路径 CONFIG.BUNDLE_RESOURCES_ROOT
        if (CONFIG.BUNDLE_RESOURCES_ROOT) {
            return CONFIG.BUNDLE_RESOURCES_ROOT
                + value;
        }
        return "./resources/" + value;
    }

    static getOsdRes(value: string): string {
        if (CONFIG.osd) {
            return CONFIG.osd + value;
        }
        return value;
    }
}
export class ResUtils {
    static getPartName(value: string): string {
        return value + "_png";
    }
    static getPartUrl(value: string): string {
        return CONFIG.osd + "avatar/part/" + value + ".png";
    }
    static getGameConfig(value: string): string {
        return CONFIG.osd + value;
    }
}
