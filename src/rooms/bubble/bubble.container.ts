import {op_client} from "pixelpai_proto";
import {Bubble} from "./bubble";
import {DynamicImage} from "../../ui/components/dynamic.image";
import {Url} from "../../utils/resUtil";
import {Logger} from "../../utils/log";

export class BubbleContainer extends Phaser.GameObjects.Container {
    private mBubbles: Bubble[] = [];
    private mArrow: DynamicImage;
    constructor(scene: Phaser.Scene) {
        super(scene);
        this.mArrow = new DynamicImage(this.scene, 0, 0);
        this.mArrow.load(Url.getRes("ui/chat/bubble_arrow.png"));
        this.add(this.mArrow);
    }

    public addBubble(text: string, bubbleSetting: op_client.IChat_Setting) {
        const bubble = this.createBubble(bubbleSetting);
        const len = this.mBubbles.length;
        let bul: Bubble = null;
        let h = 0;
        for (let i = len - 1; i >= 0; i--) {
            bul = this.mBubbles[i];
            h += bul.minHeight + 5;
            bul.tweenTo(-h);
        }
        bubble.show(text, bubbleSetting);
        this.add(bubble);
        this.mArrow.y = bubble.minHeight + 4;
    }

    public destroy(fromScene?: boolean): void {
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
        const bubble = new Bubble(this.scene);
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
