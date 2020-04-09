import { InteractionBubble } from "./interactionbubble";
import { op_client } from "pixelpai_proto";
import { Handler } from "../../Handler/Handler";
export class InteractionBubbleContainer extends Phaser.GameObjects.Container {
    public id: number;
    private mBubble: InteractionBubble;
    constructor(scene: Phaser.Scene) {
        super(scene);
    }

    public setBubble(content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SHOW_INTERACTIVE_BUBBLE, handler: Handler) {
        this.id = content.id;
        const resName = content.display["resName"];
        const resUrl = content.display.texturePath;
        const jsonUrl = content.display.dataPath;
        if (!this.mBubble) {
            this.mBubble = new InteractionBubble(this.scene);
            this.mBubble.load(resName, resUrl, jsonUrl);
            this.add(this.mBubble);
        }
        this.mBubble.setContentData(content, handler);
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
