import { Font } from "./font";
import { Handler } from "./Handler";
import { i18n } from "./i18n";
import { ModuleName } from "./module.name";

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
    public static get threeGraySmall() {
        return ["butt_gray_left_s", "butt_gray_middle_s", "butt_gray_right_s"];
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
    public static get threeGrayBig() {
        return ["butt_gray_left_b", "butt_gray_middle_b", "butt_gray_right_b"];
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
            color: "#ffd136"
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
        const mlabel = this.Text(scene, fontSize);
        let width = mlabel.setText(text).width;
        if (width <= maxwidth) {
            return text;
        } else {
            for (let i = 0; i < text.length; i++) {
                const temp = text.slice(0, i);
                width = mlabel.setText(temp).width;
                if (width > maxwidth) {
                    return temp + "...";
                }
            }
        }

        return text;
    }

    public static Text(scene: Phaser.Scene, fontSize: number) {
        if (!this.mText) {
            this.mText = scene.make.text({ style: this.colorStyle("#ffffff", fontSize) }, false);
        }
        return this.mText;
    }

    public static createSprite(scene: Phaser.Scene, key: string, animkey: string, frame: string, indexs: number[], frameRate: number = 30, repeat = 0, compl?: Handler) {
        const sprite = scene.make.sprite({ key, frame: frame + "1" });
        sprite.visible = false;
        const anima: any = scene.anims.create({
            key: animkey,
            frames: scene.anims.generateFrameNames(key, { prefix: frame + "", start: indexs[0], end: indexs[1] }),
            frameRate,
            repeat
        });
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

    public static createMessageBox(render: any, panel: any, moduleName: string, title: string, context: string, callback: Function, data?: any) {
        const funName = "messageboxcallback";
        const content = UIHelper.createMessageBoxConfig(context, title, moduleName, funName, data);
        panel[funName] = callback;
        render.mainPeer.showMediator(ModuleName.PICAMESSAGEBOX_NAME, true, content);
    }

    public static playtPosYTween(scene: any, obj: any, from: number, to: number, duration: number = 500, ease: string = "Bounce.easeOut", delay?: number, compl?: Handler, update?: Handler) {
        ease = ease || "Linear";
        const onUpdate = update ? (cope: any, param: any) => {
            if (update) update.runWith(param.value);
        } : undefined;
        const tweenY = scene.tweens.add({
            targets: obj,
            y: {
                from,
                to
            },
            ease,
            duration,
            delay,
            onComplete: () => {
                tweenY.stop();
                tweenY.remove();
                if (compl) compl.run();
            },
            onUpdate
        });
        return tweenY;
    }

    public static playtPosXTween(scene: any, obj: any, from: number, to: number, duration: number = 500, ease: string = "Bounce.easeOut", delay?: number, compl?: Handler, update?: Handler) {
        ease = ease || "Linear";
        const onUpdate = update ? (cope: any, param: any) => {
            if (update) update.runWith(param.value);
        } : undefined;
        const tweenY = scene.tweens.add({
            targets: obj,
            x: {
                from,
                to
            },
            ease,
            duration,
            delay,
            onComplete: () => {
                tweenY.stop();
                tweenY.remove();
                if (compl) compl.run();
            },
            onUpdate
        });
        return tweenY;
    }

    public static playAlphaTween(scene: any, obj: any, from: number, to: number, duration: number = 500, ease?: string, delay?: number, compl?: Handler, update?: Handler) {
        ease = ease || "Linear";
        const onUpdate = update ? (cope: any, param: any) => {
            if (update) update.runWith(param.value);
        } : undefined;
        const tweenAlpha = scene.tweens.add({
            targets: obj,
            alpha: {
                from,
                to
            },
            ease,
            duration,
            delay,
            onComplete: () => {
                tweenAlpha.stop();
                tweenAlpha.remove();
                if (compl) compl.runWith(to);
            },
            onUpdate
        });
        return tweenAlpha;
    }

    public static playScaleTween(scene: any, obj: any, from: number, to: number, duration: number = 500, ease = "Linear", delay?: number, compl?: Handler, update?: Handler) {
        const onUpdate = update ? (cope: any, param: any) => {
            if (update) update.runWith(param.value);
        } : undefined;
        const tweenScale = scene.tweens.add({
            targets: obj,
            scaleX: {
                from,
                to
            },
            scaleY: {
                from,
                to
            },
            ease,
            duration,
            delay,
            onComplete: () => {
                tweenScale.stop();
                tweenScale.remove();
                if (compl) compl.runWith(to);
            },
            onUpdate
        });
        return tweenScale;
    }
    private static mText: Phaser.GameObjects.Text;

}
