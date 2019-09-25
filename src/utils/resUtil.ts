import * as url from "url";
import * as path from "path";
export class Url {
    static getRes(value: string): string {
        // 资源地址根路径
        const homeDir: string = "";
        const isRemote: boolean = /^(http|https):/i.test(homeDir);
        if (isRemote) {
            return `${url.resolve(homeDir, value)}`;
        }
        return `file:///${path.resolve(homeDir, value)}`;
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
