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

export class CloseButton {
    static getName(): string {
        return "common_clsBtn";
    }

    static getPNG(): string {
        return Url.getRes("ui/common_clsBtn.png");
    }

    static getFrameConfig(): Phaser.Types.Loader.FileTypes.ImageFrameConfig {
        return { frameWidth: 16, frameHeight: 16, startFrame: 1, endFrame: 3 };
    }
}

export class Background {
    static getName(): string {
        return "common_background";
    }

    static getPNG(): string {
        return Url.getRes("ui/common/common_panelBg.png");
    }

    static getColumns(): number[] {
        return [11, 9, 11];
    }

    static getRows(): number[] {
        return [14, 13, 14];
    }
}

export class Border {
    static getName(): string {
        return "common_border";
    }

    static getPNG(): string {
        return Url.getRes("ui/common/common_border.png");
    }

    static getColumns(): number[] {
        return [4, 2, 4];
    }

    static getRows(): number[] {
        return [4, 2, 4];
    }
}
