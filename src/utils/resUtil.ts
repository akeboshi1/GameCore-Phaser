export const HTTP_REGEX = /^(http|https):/i;
export class Url {
    // cdn资源路径
    static OSD_PATH = "";
    // 本地资源路径
    static RES_PATH: string = "";
    static RESUI_PATH: string = "";
    static RESOURCE_ROOT: string = "";
    static getRes(value: string): string {
        // return Url.RES_PATH + value;
        if (!value) return undefined;
        try {
            return require(`resources/${value}`).default;
        } catch {
            return undefined;
        }
    }

    static getUIRes(dpr: number, value: string): string {
        if (!value) return undefined;
        // return Url.RESUI_PATH + `${dpr}x/${value}`;
        // const req = require(Url.RESUI_PATH + `${dpr}x/${value}`);
        // return req;
        try {
            return require(`resources/ui/${dpr}x/${value}`).default;
        } catch {
            // tslint:disable-next-line:no-console
            console.error(`${value} does not exist`);
        }
    }

    static getNormalUIRes(value: string) {
        // return Url.RESUI_PATH + value;
        try {
            return require(`resources/ui/${value}`).default;
        } catch {
            // tslint:disable-next-line:no-console
            console.error(`${value} does not exist`);
        }
    }

    static getOsdRes(value: string): string {
        if (!value) {
            // tslint:disable-next-line:no-console
            console.warn("splicing url failed");
            return;
        }
        if (Url.OSD_PATH) {
            if (HTTP_REGEX.test(Url.OSD_PATH)) {
                return Url.OSD_PATH + value;
            }
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
        // TOOD 编辑器或调式会传入本地资源。Avatar资源只存在cdn
        if (HTTP_REGEX.test(Url.OSD_PATH)) {
            return Url.OSD_PATH + "avatar/part/" + value + ".png";
        }
        return Url.OSD_PATH + "avatar/part/" + value + ".png";
    }
    static getUsrAvatarTextureUrls(value: string): { img: string, json: string } {
        return {
            img: Url.OSD_PATH + "user_avatar/texture/" + value + ".png",
            json: Url.OSD_PATH + "user_avatar/texture/" + value + ".json"
        };
    }
    static getGameConfig(value: string): string {
        if (HTTP_REGEX.test(value)) {
            return value;
        }
        return Url.OSD_PATH + value;
    }

    static getResRoot(value: string): string {
        if (Url.RESOURCE_ROOT) return Url.RESOURCE_ROOT + "/" + value;
        return value;
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

    static left(): number {
        return 4;
    }

    static top(): number {
        return 4;
    }
    static right(): number {
        return 4;
    }

    static bottom(): number {
        return 4;
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

    static left(): number {
        return 7;
    }

    static top(): number {
        return 7;
    }
    static right(): number {
        return 7;
    }

    static bottom(): number {
        return 7;
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

    static left(): number {
        return 7;
    }

    static top(): number {
        return 7;
    }
    static right(): number {
        return 7;
    }

    static bottom(): number {
        return 7;
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

    static getFrameConfig(): any {
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

    static left(): number {
        return 10;
    }

    static top(): number {
        return 15;
    }
    static right(): number {
        return 10;
    }

    static bottom(): number {
        return 15;
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

    static left(): number {
        return 4;
    }

    static top(): number {
        return 4;
    }
    static right(): number {
        return 4;
    }

    static bottom(): number {
        return 4;
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

    static left(): number {
        return 4;
    }

    static top(): number {
        return 4;
    }
    static right(): number {
        return 4;
    }

    static bottom(): number {
        return 4;
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
