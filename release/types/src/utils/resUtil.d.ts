export declare const HTTP_REGEX: RegExp;
export declare class Url {
    static OSD_PATH: string;
    static RES_PATH: string;
    static RESUI_PATH: string;
    static RESOURCE_ROOT: string;
    static getRes(value: string): string;
    static getUIRes(dpr: number, value: string): string;
    static getSound(key: string): string;
    static getNormalUIRes(value: string): string;
    static getOsdRes(value: string): string;
}
export declare class ResUtils {
    static getPartName(value: string): string;
    static getPartUrl(value: string): string;
    static getUsrAvatarTextureUrls(value: string): {
        img: string;
        json: string;
    };
    static getGameConfig(value: string): string;
    static getResRoot(value: string): string;
}
export declare class BlackButton {
    static getName(): string;
    static getPNG(): string;
    static getColumns(): number[];
    static getRows(): number[];
    static left(): number;
    static top(): number;
    static right(): number;
    static bottom(): number;
    static getConfig(): {
        top: number;
        left: number;
        right: number;
        bottom: number;
    };
}
export declare class BlueButton {
    static getName(): string;
    static getPNG(): string;
    static getJSON(): string;
    static getColumns(): number[];
    static getRows(): number[];
    static left(): number;
    static top(): number;
    static right(): number;
    static bottom(): number;
    static getConfig(): {
        left: number;
        top: number;
        right: number;
        bottom: number;
    };
}
export declare class WhiteButton {
    static getName(): string;
    static getPNG(): string;
    static getJSON(): string;
    static getColumns(): number[];
    static getRows(): number[];
    static left(): number;
    static top(): number;
    static right(): number;
    static bottom(): number;
    static getConfig(): {
        left: number;
        top: number;
        right: number;
        bottom: number;
    };
}
export declare class CloseButton {
    static getName(): string;
    static getPNG(): string;
    static getJSON(): string;
    static getFrameConfig(): Phaser.Types.Loader.FileTypes.ImageFrameConfig;
}
export declare class Background {
    static getName(): string;
    static getPNG(): string;
    static getColumns(): number[];
    static getRows(): number[];
    static left(): number;
    static top(): number;
    static right(): number;
    static bottom(): number;
    static getConfig(): {
        left: number;
        top: number;
        right: number;
        bottom: number;
    };
}
export declare class Border {
    static getName(): string;
    static getPNG(): string;
    static getColumns(): number[];
    static getRows(): number[];
    static left(): number;
    static top(): number;
    static right(): number;
    static bottom(): number;
    static getConfig(): {
        left: number;
        top: number;
        right: number;
        bottom: number;
    };
}
export declare class TransparentButton {
    static getName(): string;
    static getPNG(): string;
    static getJSON(): string;
    static left(): number;
    static top(): number;
    static right(): number;
    static bottom(): number;
    static getConfig(): {
        left: number;
        top: number;
        right: number;
        bottom: number;
    };
}
