import { HTTP_REGEX } from "structure";
import { Font } from "./font";
import { Handler } from "./Handler";
import { i18n } from "./i18n";

export enum CoinType {
    TU_DING_COIN = 0,
    QING_SONG_TANG = 1,
    GOLD_COIN = 2,
    COIN = 3,
    DIAMOND = 4
}

export class Url {
    static OSD_PATH = "";
    static RES_PATH: string = "";
    static RESUI_PATH: string = "";
    static getRes(value: string): string {
        return Url.RES_PATH + value;
    }

    static getUIRes(dpr: number, value: string): string {
        return Url.RESUI_PATH + `${dpr}x/${value}`;
    }

    static getOsdRes(value: string): string {
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
export class Coin {
    static getIcon(coinType: number) {
        let res = "tuding_icon";
        const type = <CoinType>coinType;
        if (type === CoinType.COIN) {
            res = "iv_coin";
        } else if (type === CoinType.DIAMOND) {
            res = "iv_diamond";
        } else if (type === CoinType.GOLD_COIN) {
            // res = "";
        } else if (type === CoinType.QING_SONG_TANG) {
            // res = "";
        } else if (type === CoinType.TU_DING_COIN) {
            // res = "";
        }
        return res;
    }
    static getName(coinType: number) {
        let res = "银币";
        const type = <CoinType>coinType;
        if (type === CoinType.COIN) {
            res = i18n.t("coin.coin");
        } else if (type === CoinType.DIAMOND) {
            res = i18n.t("coin.diamond");
        } else if (type === CoinType.GOLD_COIN) {
            res = i18n.t("coin.gold_coin");
        } else if (type === CoinType.QING_SONG_TANG) {
            // res = "";
        } else if (type === CoinType.TU_DING_COIN) {
            // res = "";
        }
        return res;
    }
}
export class UIHelper {
    public static get threeGreenNormal() {
        return ["butt_green_left", "butt_green_middle", "butt_green_right"];
    }
    public static get threeRedNormal() {
        return ["butt_red_left", "butt_red_middle", "butt_red_right"];
    }
    public static get threeYellowNormal() {
        return ["butt_yellow_left", "butt_yellow_middle", "butt_yellow_right"];
    }

    public static get threeGreenSmall() {
        return ["butt_green_left_s", "butt_green_middle_s", "butt_green_right_s"];
    }
    public static get threeRedSmall() {
        return ["butt_red_left_s", "butt_red_middle_s", "butt_red_right_s"];
    }
    public static get threeYellowSmall() {
        return ["butt_yellow_left_s", "butt_yellow_middle_s", "butt_yellow_right_s"];
    }

    public static get threeGreenBig() {
        return ["butt_green_left_b", "butt_green_middle_b", "butt_green_right_b"];
    }
    public static get threeRedBig() {
        return ["butt_red_left_b", "butt_red_middle_b", "butt_red_right_b"];
    }
    public static get threeYellowBig() {
        return ["butt_yellow_left_b", "butt_yellow_middle_b", "butt_yellow_right_b"];
    }

    public static colorStyle(color: string, fontSize: number) {
        return {
            fontSize,
            fontFamily: Font.DEFULT_FONT,
            color
        };
    }
    public static colorNumberStyle(color: string, fontSize: number) {
        return {
            fontSize,
            fontFamily: Font.NUMBER,
            color
        };
    }
    public static titleYellowStyle_m(dpr, size: number = 20) {
        return {
            fontSize: size * dpr,
            fontFamily: Font.DEFULT_FONT,
            color: "#905B06"
        };
    }

    public static blackStyle(dpr, size: number = 12) {
        return {
            fontSize: size * dpr,
            fontFamily: Font.DEFULT_FONT,
            color: "#000000"
        };
    }
    public static whiteStyle(dpr, size: number = 12) {
        return {
            fontSize: size * dpr,
            fontFamily: Font.DEFULT_FONT,
            color: "#ffffff"
        };
    }
    public static brownishStyle(dpr, size: number = 12) {
        return {
            fontSize: size * dpr,
            fontFamily: Font.DEFULT_FONT,
            color: "#996600"
        };
    }
    public static yellowStyle(dpr, size: number = 12) {
        return {
            fontSize: size * dpr,
            fontFamily: Font.DEFULT_FONT,
            color: "#FFD248"
        };
    }
    public static redStyle(dpr, size: number = 12) {
        return {
            fontSize: size * dpr,
            fontFamily: Font.DEFULT_FONT,
            color: "#E33922"
        };
    }

    public static blueStyle(dpr, size: number = 12) {
        return {
            fontSize: size * dpr,
            fontFamily: Font.DEFULT_FONT,
            color: "#2B4BB5"
        };
    }
    public static background_w(dpr: number) {
        return {
            left: 50 * dpr,
            top: 30 * dpr,
            right: 30 * dpr,
            bottom: 95 * dpr
        };
    }
    public static background_w_s(dpr: number) {
        return {
            left: 50 * dpr,
            top: 30 * dpr,
            right: 30 * dpr,
            bottom: 70 * dpr
        };
    }
    public static background_n(dpr: number) {
        return {
            left: 30 * dpr,
            top: 40 * dpr,
            right: 30 * dpr,
            bottom: 40 * dpr
        };
    }

    public static button(dpr: number) {
        return {
            left: 14 * dpr,
            top: 14 * dpr,
            right: 14 * dpr,
            bottom: 14 * dpr
        };
    }

    static spliceText(maxwidth: number, text: string, fontSize: number, scene: Phaser.Scene) {
        const mlabel = this.Text(scene);
        for (let i = 0; i < text.length; i++) {
            const temp = text.slice(0, i);
            const width = mlabel.setText(text).width;
            if (width > maxwidth) {
                return temp;
            }
        }
        return text;
    }
    public static Text(scene: Phaser.Scene) {
        if (!this.mText) {
            this.mText = scene.make.text(this.whiteStyle, false);
        }
        return this.mText;
    }

    public static createSprite(scene: Phaser.Scene, key: string, animkey: string, frame: string, indexs: number[], frameRate: number = 30, repeat = 0, compl?: Handler) {
        const sprite = scene.make.sprite({ key, frame: frame + "1" });
        sprite.visible = false;
        const anima: any = scene.anims.create({ key: animkey, frames: scene.anims.generateFrameNames(key, { prefix: frame + "", start: indexs[0], end: indexs[1] }), frameRate, repeat });
        anima.removeAllListeners();
        anima.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            sprite.visible = false;
            if (compl) compl.run();
        }, this);
        anima.on(Phaser.Animations.Events.ANIMATION_START, () => {
            sprite.visible = true;
        }, this);
        return sprite;
    }

    public static createMessageBoxConfig(context: string, titleStr: string, key: string, funName: string, data: any) {
        const content = {
            text: [{
                text: context
            }],
            title: [{
                text: titleStr
            }],
            button: [
                {
                    text: i18n.t("common.cancel"),
                    local: true,
                    param: 0
                },
                {
                    text: i18n.t("common.confirm"),
                    local: true,
                    clickhandler: {
                        key,
                        clickfun: funName,
                    },
                    param: 1,
                    data
                }
            ]
        };
        return content;
    }
    private static mText: Phaser.GameObjects.Text;
}
