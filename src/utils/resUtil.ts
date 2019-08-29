
export class ResUtils {
    static getPartName(value: string): string {
        return value + "_png";
    }
    static getPartName1(value: string): string {
        return value + ".png";
    }
    static getPartUrl(value: string): string {
        return CONFIG.osd_release + "avatar/part/" + value + ".png";
    }

    static getDebugPartUrl(value: string): string {
        return CONFIG.osd + "avatar/part/" + value + ".png";
    }
}
