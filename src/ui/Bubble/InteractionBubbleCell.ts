import { Logger } from "../../utils/log";
import { DragonbonesAnimation } from "../../rooms/Animation/dragonbones.animation";
import { FrameAnimation } from "../../rooms/Animation/frame.animation";
import { op_client } from "pixelpai_proto";
import { Handler } from "../../Handler/Handler";
import { BubbleAnimation } from "../../rooms/Animation/bubble.animation";

export class InteractionBubbleCell extends Phaser.GameObjects.Container {
    private mBubbleAni: DragonbonesAnimation | FrameAnimation | BubbleAnimation;
    private mWdith: number = 78;
    private mHeight: number = 78;
    private content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SHOW_INTERACTIVE_BUBBLE;
    private mRemoveDelay: any;
    private handler: Handler;
    constructor(scene: Phaser.Scene, dpr: number) {
        super(scene);
        this.width = this.mWdith * dpr;
        this.height = this.mHeight * dpr;
    }

    public setContentData(content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SHOW_INTERACTIVE_BUBBLE, handler: Handler) {
        this.content = content;
        if (this.handler) this.handler.clear();
        this.handler = handler;
    }

    public load(resName?: string, url?: string, jsonUrl?: string) {
        this.createAnimation();
        this.mBubbleAni.load(resName, url, jsonUrl);
        this.mBubbleAni.play();
    }

    public show() {
        if (this.mBubbleAni) {
            this.add(this.mBubbleAni);
        }
        this.removeDelay();
    }

    public hide() {
        if (this.mBubbleAni) {
            this.remove(this.mBubbleAni);
        }
        if (this.mRemoveDelay) {
            clearTimeout(this.mRemoveDelay);
            this.mRemoveDelay = null;
        }
    }
    public destroy() {
        this.hide();
        if (this.mBubbleAni) {
            this.mBubbleAni.destroy();
        }
        if (this.handler) this.handler.clear();
        this.mBubbleAni = null;
        this.handler = null;
        super.destroy();
    }

    private createAnimation() {
        // this.mBubbleAni = new DragonbonesAnimation(this.scene);
        // this.mBubbleAni = new FrameAnimation(this.scene);
        this.mBubbleAni = new BubbleAnimation(this.scene);
        this.mBubbleAni.width = this.width;
        this.mBubbleAni.height = this.height;
        const POINTER_DOWN = Phaser.Input.Events.POINTER_DOWN;
        this.mBubbleAni.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.mBubbleAni.width * 2, this.mBubbleAni.height * 2), Phaser.Geom.Rectangle.Contains);
        this.mBubbleAni.on(POINTER_DOWN, this.onBubbleClick, this);
    }
    private onBubbleClick() {
        if (this.handler) this.handler.runWith(this.content);
    }
    private removeDelay() {
        this.mRemoveDelay = setTimeout(() => {
            if (this.handler) this.handler.runWith(this.content.id);
            this.hide();
        }, this.content.duration);
    }
}
