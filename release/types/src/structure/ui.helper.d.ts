import { Handler } from "./Handler";
export declare class UIHelper {
    static get threeGreenNormal(): string[];
    static get threeRedNormal(): string[];
    static get threeYellowNormal(): string[];
    static get threeGreenSmall(): string[];
    static get threeRedSmall(): string[];
    static get threeYellowSmall(): string[];
    static get threeGraySmall(): string[];
    static get threeGreenBig(): string[];
    static get threeRedBig(): string[];
    static get threeYellowBig(): string[];
    static get threeGrayBig(): string[];
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
    static Text(scene: Phaser.Scene, fontSize: number): Phaser.GameObjects.Text;
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
