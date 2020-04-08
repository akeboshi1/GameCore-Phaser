import { InteractionBubble } from "./interactionbubble";
import { op_client } from "pixelpai_proto";
import { Handler } from "../../Handler/Handler";
export class InteractionBubbleContainer extends Phaser.GameObjects.Container {
    private mBubble: InteractionBubble;
    private map = new Map<string, InteractionBubble>();
    constructor(scene: Phaser.Scene) {
        super(scene);
    }

    public addBubble(content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SHOW_INTERACTIVE_BUBBLE, handler: Handler) {
        const resName = "gems";
        const resUrl = "resources/test/columns";
        // const resName = "mecha_1002_101d_show";
        // const resUrl = "resources/test/mecha_1002_101d_show";
        if (this.mBubble) this.mBubble.hide();
        if (this.map.has(resName)) {
            this.mBubble = this.map.get(resName);
        } else {
            this.mBubble = new InteractionBubble(this.scene);
            this.mBubble.setContentData(content, handler);
            this.mBubble.load(resName, resUrl);
            this.map.set(resName, this.mBubble);
            this.add(this.mBubble);
        }
        this.mBubble.show();
        return this.mBubble;
    }

    public hide() {
        if (this.parentContainer) {
            this.parentContainer.remove(this);
        }
    }
    public destroy() {
        this.hide();
        if (this.mBubble) this.mBubble.destroy();
        this.mBubble = null;
    }
}
