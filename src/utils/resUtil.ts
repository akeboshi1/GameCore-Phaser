import * as url from "url";
import * as path from "path";
import { HTTP_REGEX } from "../const/constants";

export class Url {
    static OSD_PATH = "";
    static getRes(value: string): string {
        // 资源地址根路径 CONFIG.BUNDLE_RESOURCES_ROOT
        if (CONFIG.BUNDLE_RESOURCES_ROOT) {
            return CONFIG.BUNDLE_RESOURCES_ROOT
                + value;
        }
        return "./resources/" + value;
    }

    static getOsdRes(value: string): string {
        if (Url.OSD_PATH) {
            return Url.OSD_PATH + value;
        }
        return value;
    }
}
export class ResUtils {
    static getPartName(value: string): string {
        return value + "_png";
    }
    static getPartUrl(value: string): string {
        return Url.OSD_PATH + "avatar/part/" + value + ".png";
    }
    static getGameConfig(value: string): string {
        if (HTTP_REGEX.test(value)) {
            return value;
        }
        return Url.OSD_PATH + value;
    }
}

export class BlackButton {
    static getName(): string {
        return "black_button";
    }

    static getPNG(): string {
        return Url.getRes("ui/common/button.png");
    }

    static getColumns(): number[] {
        return [4, 2, 4];
    }

    static getRows(): number[] {
        return [4, 2, 4];
    }

    static getConfig() {
        return {
            top: 4,
            left: 4,
            right: 4,
            bottom: 4
        };
    }
}

export class BlueButton {
    static getName(): string {
        return "button_blue";
    }

    static getPNG(): string {
        return Url.getRes("ui/common/button_blue.png");
    }

    static getJSON(): string {
        return Url.getRes("ui/common/button_blue.json");
    }

    static getColumns(): number[] {
        return [7, 1, 7];
    }

    static getRows(): number[] {
        return [7, 1, 7];
    }

    static getConfig() {
        return {
            left: 7,
            top: 7,
            right: 7,
            bottom: 7
        };
    }
}

export class WhiteButton {
    static getName(): string {
        return "button_white";
    }

    static getPNG(): string {
        return Url.getRes("ui/common/button_white.png");
    }

    static getJSON(): string {
        return Url.getRes("ui/common/button_white.json");
    }

    static getColumns(): number[] {
        return [7, 1, 7];
    }

    static getRows(): number[] {
        return [7, 1, 7];
    }

    static getConfig() {
        return {
            left: 7,
            top: 7,
            right: 7,
            bottom: 7
        };
    }
}

export class CloseButton {
    static getName(): string {
        return "common_clsBtn";
    }

    static getPNG(): string {
        return Url.getRes("ui/common/common_clsBtn.png");
    }

    static getJSON(): string {
        return Url.getRes("ui/common/common_clsBtn.json");
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

    static getConfig() {
        return {
            left: 10,
            top: 15,
            right: 10,
            bottom: 15,
        };
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

    static getConfig() {
        return {
            left: 4,
            top: 4,
            right: 4,
            bottom: 4
        };
    }
}

export class TransparentButton {
    static getName() {
        return "button_transparent";
    }

    static getPNG(): string {
        return Url.getRes("ui/common/button_transparent.png");
    }

    static getJSON(): string {
        return Url.getRes("ui/common/button_transparent.json");
    }

    static getConfig() {
        return {
            left: 4,
            top: 4,
            right: 4,
            bottom: 4
        };
    }
}
