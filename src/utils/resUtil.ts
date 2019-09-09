
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
