import { Logger } from "../../utils/log";
import { DragonbonesAnimation } from "../Animation/dragonbones.animation";
import { FrameAnimation } from "../Animation/frame.animation";
import { op_client } from "pixelpai_proto";
import { Handler } from "../../Handler/Handler";

export class InteractionBubble extends Phaser.GameObjects.Container {
    private mBubbleAni: DragonbonesAnimation | FrameAnimation;
    private mWdith: number = 60;
    private mHeight: number = 60;
    private content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SHOW_INTERACTIVE_BUBBLE;
    private mRemoveDelay: any;
    private handler: Handler;
    constructor(scene: Phaser.Scene) {
        super(scene);
        this.width = this.mWdith;
        this.height = this.mHeight;
    }

    public setContentData(content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SHOW_INTERACTIVE_BUBBLE, handler: Handler) {
        this.content = content;
        if (this.handler) this.handler.clear();
        this.handler = handler;
    }

    public load(resName?: string, url?: string,jsonUrl?: string) {
        this.createAnimation();
        this.mBubbleAni.load(resName, url,jsonUrl);
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
    }

    private createAnimation() {
        // this.mBubbleAni = new DragonbonesAnimation(this.scene);
        this.mBubbleAni = new FrameAnimation(this.scene);
        this.mBubbleAni.width = this.width;
        this.mBubbleAni.height = this.height;
        const POINTER_DOWN = Phaser.Input.Events.POINTER_DOWN;
        this.mBubbleAni.setInteractive();
        this.mBubbleAni.on(POINTER_DOWN, this.onBubbleClick, this);
    }
    private onBubbleClick() {
        if (this.handler) this.handler.runWith(this.content);
    }
    private removeDelay() {
        this.mRemoveDelay = setTimeout(() => {
            this.hide();
        }, this.content.duration);
    }
}
