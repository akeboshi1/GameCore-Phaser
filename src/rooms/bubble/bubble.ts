import { op_client } from "pixelpai_proto";
import { DynamicNinepatch } from "../../ui/components/dynamic.ninepatch";
import { Url } from "../../utils/resUtil";
import { Font } from "../../utils/font";
import { BBCodeText, NinePatch } from "apowophaserui";

export class Bubble extends Phaser.GameObjects.Container {
    private mChatContent: BBCodeText;
    private mBubbleBg: DynamicNinepatch;
    private mMinWidth: number = 0;
    private mMinHeight: number = 0;
    private mToY: number;
    private mTweenCompleteCallback: Function;
    private mTweenCallContext: any;
    private mRemoveDelay: any;
    private mScale: number;

    constructor(scene: Phaser.Scene, scale: number) {
        super(scene);
        this.mScale = scale;
        this.x = -40 * scale;
    }

    public show(text: string, bubble: op_client.IChat_Setting) {
        // this.mChatContent = this.scene.make.text({
        //     text,
        //     style: {
        //         x: 0,
        //         y: 4 * this.mScale,
        //         fontFamily: Font.DEFULT_FONT,
        //         fontSize: 14 * this.mScale,
        //         color: "#000000",
        //         origin: { x: 0, y: 0 },
        //         wordWrap: { width: 300, useAdvancedWrap: true }
        //     }
        // }, false);
        this.mChatContent = new BBCodeText(this.scene, 0, 4 * this.mScale, text, {
            fontFamily: Font.DEFULT_FONT,
            fontSize: 14 * this.mScale,
            color: "#000000",
            origin: { x: 0, y: 0 },
            wrap: { width: 200 * this.mScale, mode: "character" }
        });
        this.add(this.mChatContent);

        const _minH = 36 * this.mScale;
        const _minW = 60 * this.mScale;
        this.mMinHeight = this.mChatContent.height + 18  * this.mScale;
        this.mMinHeight = this.mMinHeight < _minH ? _minH : this.mMinHeight;
        this.mMinWidth = this.mChatContent.width + 20 * this.mScale;
        this.mMinWidth = this.mMinWidth < _minW ? _minW : this.mMinWidth;

        this.mBubbleBg = new DynamicNinepatch(this.scene, this);
        const res = Url.getOsdRes(bubble.bubbleResource || "platformitem/thumbnail/bubble_01.png");
        this.mBubbleBg.load(res, {
            width: this.mMinWidth,
            height: this.mMinHeight,
            key: res,
            columns: [34, 2, 32],
            rows: [42, 2, 9]
        }, this.onComplete, this);
    }

    public tweenTo(toY: number) {
        this.mToY = toY;
        this.scene.tweens.add({
            targets: this,
            y: toY,
            alpha: 1,
            duration: 200
        });
    }

    public durationRemove(duration: number, callback?: Function, callbackContext?: any) {
        this.mTweenCompleteCallback = callback;
        this.mTweenCallContext = callbackContext;
        this.mRemoveDelay = setTimeout(() => {
            this.removeTween();
        }, duration);
    }

    public removeTween() {
        const endY = this.mToY - 30;
        const tween = this.scene.tweens.add({
            targets: this,
            y: endY,
            alpha: 0,
            duration: 200,
            onComplete: () => {
                if (this.mTweenCompleteCallback) {
                    this.mTweenCompleteCallback.call(this.mTweenCallContext, this);
                }
            }
        });
    }

    public destroy() {
        if (this.mChatContent) {
            this.mChatContent.destroy(true);
        }
        this.mChatContent = null;
        this.mMinWidth = 0;
        this.mMinHeight = 0;
        this.mToY = 0;
        this.mTweenCompleteCallback = null;
        this.mTweenCallContext = null;
        if (this.mRemoveDelay) {
            clearTimeout(this.mRemoveDelay);
        }
        super.destroy(true);
    }

    private onComplete(img: NinePatch) {
        if (img) {
            img.setOrigin(0, 0);
            this.addAt(img, 0);
            const bound = this.getBounds();
            this.mChatContent.x = this.mMinWidth - this.mChatContent.width >> 1;
            this.mChatContent.y = (this.mMinHeight - this.mChatContent.height >> 1) + 6;
        }
    }

    get minWidth(): number {
        return this.mMinWidth;
    }

    get minHeight(): number {
        return this.mMinHeight;
    }
}
