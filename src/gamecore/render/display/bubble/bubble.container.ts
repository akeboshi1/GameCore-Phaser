import { Bubble } from "./bubble";
import { IDisplayObject } from "../display.object";
import { DynamicImage, Url } from "baseRender";
import { Render } from "../../render";

export class BubbleContainer extends Phaser.GameObjects.Container {
    private mBubbles: Bubble[] = [];
    private mArrow: DynamicImage;
    private mScale: number;
    private url: Url;

    constructor(scene: Phaser.Scene, scale: number, private render: Render) {
        super(scene);
        this.mScale = scale;
        this.mArrow = new DynamicImage(this.scene, 0, 0);
        this.url = this.render.url;
        this.mArrow.scale = scale;
        this.mArrow.load(this.url.getRes("ui/chat/bubble_arrow.png"));
        this.add(this.mArrow);
    }

    public addBubble(text: string, bubbleSetting: any) {// op_client.IChat_Setting
        if (!bubbleSetting) bubbleSetting = { };
        const bubble = this.createBubble(bubbleSetting);
        if (!bubble) return;
        const len = this.mBubbles.length;
        let bul: Bubble = null;
        let h = 0;
        bubble.show(text, bubbleSetting);
        for (let i = len - 1; i >= 0; i--) {
            bul = this.mBubbles[i];
            h += bul.minHeight + 5 * this.mScale;
            bul.tweenTo(-h);
        }
        this.add(bubble);
        this.mArrow.y = 4 * this.mScale;
    }

    public follow(target: IDisplayObject) {
        if (this.mBubbles.length === 0) {
            return;
        }
        const position = target.getPosition();
        if (!position) {
            return;
        }
        this.updatePos(position.x, position.y - 110);
    }

    public updatePos(x: number, y: number) {
        this.x = x * this.mScale;
        this.y = y * this.mScale;
    }

    public destroy(fromScene?: boolean): void {
        this.mBubbles = null;
        
        super.destroy(fromScene);
    }

    public removeFormParent() {
        if (this.parentContainer) {
            this.parentContainer.remove(this);
        }
    }

    private createBubble(bubbleSetting: any): Bubble {// op_client.IChat_Setting
        if (!bubbleSetting) bubbleSetting = { };
        // const bubble = new Bubble(this.scene, this.mScale, this.url);
        const bubble = this.render.add.bubble(this.scene, this.mScale)
        this.mBubbles.push(bubble);
        const duration = bubbleSetting.duration ? bubbleSetting.duration : 5000;
        bubble.durationRemove(duration, this.onRemoveBubble, this);
        return bubble;
    }

    private onRemoveBubble(bubble: Bubble) {
        if (!bubble) {
            return;
        }
        this.mBubbles = this.mBubbles.filter((val: Bubble) => bubble !== val);
        this.remove(bubble);
        bubble.destroy();
        if (this.mBubbles.length === 0) {
            this.removeFormParent();
        }
    }
}
