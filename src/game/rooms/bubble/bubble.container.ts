import { op_client } from "pixelpai_proto";
import { Bubble } from "./bubble";
import { DynamicImage } from "../../ui/Components/Dynamic.image";
import { Url } from "../../game/core/utils/resUtil";
import { IElement } from "../element/element";

export class BubbleContainer extends Phaser.GameObjects.Container {
    private mBubbles: Bubble[] = [];
    private mArrow: DynamicImage;
    private mScale: number;
    constructor(scene: Phaser.Scene, scale: number) {
        super(scene);
        this.mScale = scale;
        this.mArrow = new DynamicImage(this.scene, 0, 0);
        this.mArrow.scale = scale;
        this.mArrow.load(Url.getRes("ui/chat/bubble_arrow.png"));
        this.add(this.mArrow);
    }

    public addBubble(text: string, bubbleSetting: op_client.IChat_Setting) {
        const bubble = this.createBubble(bubbleSetting);
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

    public follow(target: IElement) {
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
        if (!this.mBubbles) return;
        const len = this.mBubbles.length;
        let bul: Bubble = null;
        for (let i = len - 1; i >= 0; i--) {
            bul = this.mBubbles[i];
            if (!bul) continue;
            bul.destroy();
        }
        this.mBubbles = null;
        this.removeFormParent();
        super.destroy(fromScene);
    }

    public removeFormParent() {
        if (this.parentContainer) {
            this.parentContainer.remove(this);
        }
    }

    private createBubble(bubbleSetting: op_client.IChat_Setting): Bubble {
        if (!bubbleSetting) return;
        const bubble = new Bubble(this.scene, this.mScale);
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
