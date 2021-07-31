import { DynamicNinepatch } from "../../ui/components/dynamic.ninepatch";
import { BBCodeText, NineSlicePatch } from "apowophaserui";
import { Font } from "structure";
import { getWarpMode } from "../../utils/ui";
import { Render } from "../../render";
import { Url } from "baseRender";
export class Bubble extends Phaser.GameObjects.Container {
    protected mChatContent: BBCodeText;
    protected mBubbleBg: DynamicNinepatch;
    protected mMinWidth: number = 0;
    protected mMinHeight: number = 0;
    protected mToY: number;
    protected mTweenCompleteCallback: Function;
    protected mTweenCallContext: any;
    protected mRemoveDelay: any;
    protected mScale: number;
    protected url: Url;

    constructor(scene: Phaser.Scene, scale: number, protected render: Render) {
        super(scene);
        this.mScale = scale;
        this.url = this.render.url;
        // this.x = 40 * scale;
    }

    public show(text: string, bubble: any) {// op_client.IChat_Setting
        this.mChatContent = new BBCodeText(this.scene, 1 * this.mScale, 0, text, {
            fontFamily: Font.DEFULT_FONT,
            fontSize: 11.33 * this.mScale,
            color: "#000000",
            wrap: { width: 124.33 * this.mScale, mode: getWarpMode() }
        }).setOrigin(0.5, 0.5);
        this.add(this.mChatContent);

        const _minH = 56 * this.mScale;
        const _minW = 56 * this.mScale;
        this.mMinHeight = this.mChatContent.height + 40 * this.mScale;
        this.mMinHeight = this.mMinHeight < _minH ? _minH : this.mMinHeight;
        this.mMinWidth = this.mChatContent.width + 40 * this.mScale;
        this.mMinWidth = this.mMinWidth < _minW ? _minW : this.mMinWidth;

        this.y = this.mMinHeight;
        this.mBubbleBg = new DynamicNinepatch(this.scene, this);
        const path_back = bubble.bubbleResource || "platformitem/thumbnail/bubble_01.png";
        const res = this.url.getOsdRes(path_back);
        this.mBubbleBg.load(res, {
            width: this.mMinWidth / this.mScale,
            height: this.mMinHeight / this.mScale,
            key: res,
            scale: 1,
            config: {
                left: 20,
                top: 28,
                right: 20,
                bottom: 10
            }
        }, this.onComplete, this);
    }

    public tweenTo(toY: number) {
        toY += this.mMinHeight;
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
        // if (this.mChatContent) {
        //     this.mChatContent.destroy(true);
        // }
        // this.mChatContent = null;
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

    protected onComplete(img: NineSlicePatch) {
        if (img && this.scene) {
            img.scale = this.mScale;
            img.y = -img.displayHeight >> 1;
            this.addAt(img, 0);
            this.mChatContent.y = 15 * 0.5 * this.mScale + img.y;
        }
    }

    get minWidth(): number {
        return this.mMinWidth;
    }

    get minHeight(): number {
        return this.mMinHeight;
    }
}
