import { DynamicNinepatch } from "../../ui/components/dynamic.ninepatch";
import { BBCodeText, NineSlicePatch } from "apowophaserui";
import { Url } from "utils";
import { Font } from "structure";
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
        // this.x = 40 * scale;
    }

    public show(text: string, bubble: any) {// op_client.IChat_Setting
        this.mChatContent = new BBCodeText(this.scene, 0, 0, text, {
            fontFamily: Font.DEFULT_FONT,
            fontSize: 14 * this.mScale,
            color: "#000000",
            origin: { x: 0, y: 0 },
            wrap: { width: 200 * this.mScale, mode: "character" }
        }).setOrigin(0.5, 0.5);
        this.add(this.mChatContent);

        const _minH = 50 * this.mScale;
        const _minW = 100 * this.mScale;
        this.mMinHeight = this.mChatContent.height + 30 * this.mScale;
        this.mMinHeight = this.mMinHeight < _minH ? _minH : this.mMinHeight;
        this.mMinWidth = this.mChatContent.width + 30 * this.mScale;
        this.mMinWidth = this.mMinWidth < _minW ? _minW : this.mMinWidth;

        this.y = this.mMinHeight;

        this.mBubbleBg = new DynamicNinepatch(this.scene, this);
        const res = Url.getOsdRes(bubble.bubbleResource || "platformitem/thumbnail/bubble_01.png");
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

    private onComplete(img: NineSlicePatch) {
        if (img && this.scene) {
            img.scale = this.mScale;
            this.addAt(img, 0);
            img.y = -img.displayHeight >> 1;
            this.mChatContent.y = -(img.displayHeight >> 1) + 8 * this.mScale;
            // img.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        }
    }

    get minWidth(): number {
        return this.mMinWidth;
    }

    get minHeight(): number {
        return this.mMinHeight;
    }
}
