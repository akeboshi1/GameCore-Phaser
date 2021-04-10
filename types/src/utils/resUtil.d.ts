import { Handler } from "./Handler";
export declare enum CoinType {
    TU_DING_COIN = 0,
    QING_SONG_TANG = 1,
    GOLD_COIN = 2,
    COIN = 3,
    DIAMOND = 4
}
export declare class Url {
    static OSD_PATH: string;
    static RES_PATH: string;
    static RESUI_PATH: string;
    static getRes(value: string): string;
    static getUIRes(dpr: number, value: string): string;
    static getNormalUIRes(value: string): any;
    static getOsdRes(value: string): string;
}
export declare class ResUtils {
    static getPartName(value: string): string;
    static getPartUrl(value: string): string;
    static getGameConfig(value: string): string;
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
export declare class Coin {
    static getIcon(coinType: number): string;
    static getName(coinType: number): string;
}
export declare class UIHelper {
    static get threeGreenNormal(): string[];
    static get threeRedNormal(): string[];
    static get threeYellowNormal(): string[];
    static get threeGreenSmall(): string[];
    static get threeRedSmall(): string[];
    static get threeYellowSmall(): string[];
    static get threeGreenBig(): string[];
    static get threeRedBig(): string[];
    static get threeYellowBig(): string[];
    static colorStyle(color: string, fontSize: number): {
        fontSize: number;
        fontFamily: string;
        color: string;
    };
    static colorNumberStyle(color: string, fontSize: number): {
        fontSize: number;
        fontFamily: string;
        color: string;
    };
    static titleYellowStyle_m(dpr: any, size?: number): {
        fontSize: number;
        fontFamily: string;
        color: string;
    };
    static blackStyle(dpr: any, size?: number): {
        fontSize: number;
        fontFamily: string;
        color: string;
    };
    static whiteStyle(dpr: any, size?: number): {
        fontSize: number;
        fontFamily: string;
        color: string;
    };
    static brownishStyle(dpr: any, size?: number): {
        fontSize: number;
        fontFamily: string;
        color: string;
    };
    static yellowStyle(dpr: any, size?: number): {
        fontSize: number;
        fontFamily: string;
        color: string;
    };
    static redStyle(dpr: any, size?: number): {
        fontSize: number;
        fontFamily: string;
        color: string;
    };
    static blueStyle(dpr: any, size?: number): {
        fontSize: number;
        fontFamily: string;
        color: string;
    };
    static background_w(dpr: number): {
        left: number;
        top: number;
        right: number;
        bottom: number;
    };
    static background_w_s(dpr: number): {
        left: number;
        top: number;
        right: number;
        bottom: number;
    };
    static background_n(dpr: number): {
        left: number;
        top: number;
        right: number;
        bottom: number;
    };
    static button(dpr: number): {
        left: number;
        top: number;
        right: number;
        bottom: number;
    };
    static spliceText(maxwidth: number, text: string, fontSize: number, scene: Phaser.Scene): string;
    static Text(scene: Phaser.Scene): Phaser.GameObjects.Text;
    static createSprite(scene: Phaser.Scene, key: string, animkey: string, frame: string, indexs: number[], frameRate?: number, repeat?: number, compl?: Handler): Phaser.GameObjects.Sprite;
    static createMessageBoxConfig(context: string, titleStr: string, key: string, funName: string, data: any): {
        text: {
            text: string;
        }[];
        title: {
            text: string;
        }[];
        button: ({
            text: string;
            local: boolean;
            param: number;
            clickhandler?: undefined;
            data?: undefined;
        } | {
            text: string;
            local: boolean;
            clickhandler: {
                key: string;
                clickfun: string;
            };
            param: number;
            data: any;
        })[];
    };
    static createMessageBox(render: any, panel: any, moduleName: string, title: string, context: string, callback: Function, data?: any): void;
    static playtPosYTween(scene: any, obj: any, from: number, to: number, duration?: number, ease?: string, delay?: number, compl?: Handler, update?: Handler): any;
    static playtPosXTween(scene: any, obj: any, from: number, to: number, duration?: number, ease?: string, delay?: number, compl?: Handler, update?: Handler): any;
    static playAlphaTween(scene: any, obj: any, from: number, to: number, duration?: number, ease?: string, delay?: number, compl?: Handler, update?: Handler): any;
    static playScaleTween(scene: any, obj: any, from: number, to: number, duration?: number, ease?: string, delay?: number, compl?: Handler, update?: Handler): any;
    private static mText;
}
