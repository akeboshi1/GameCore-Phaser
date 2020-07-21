import { op_client } from "pixelpai_proto";
import { Handler } from "../../Handler/Handler";
import { BaseUI } from "apowophaserui";
import { InteractionBubbleCell } from "./InteractionBubbleCell";
export class InteractionBubbleContainer extends BaseUI {
    public id: number;
    private mBubble: InteractionBubbleCell;
    constructor(scene: Phaser.Scene, dpr: number) {
        super(scene, dpr);
    }

    public set show(value: boolean) {
        this.mShow = value;
    }

    public get show(): boolean {
        return this.mShow;
    }

    public hide() {
        this.mShow = false;
        if (this.parentContainer) {
            (this.parentContainer as Phaser.GameObjects.Container).remove(this);
        }
    }

    public setFollow(gameObject: any, fromScene: Phaser.Scene, posFunc?: Function) {
        super.setFollow(gameObject, fromScene, posFunc);
    }

    public setBubble(content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SHOW_INTERACTIVE_BUBBLE, handler: Handler) {
        this.id = content.id;
        const resName = content.display["resName"];
        const resUrl = content.display.texturePath;
        const jsonUrl = content.display.dataPath;
        if (!this.mBubble) {
            this.mBubble = new InteractionBubbleCell(this.scene, this.dpr);
            this.mBubble.load(resName, resUrl, jsonUrl);
            this.add(this.mBubble);
        }
        this.mBubble.setContentData(content, handler);
        this.mBubble.show();
        return this.mBubble;
    }

    public destroy() {
        this.hide();
        if (this.mBubble) this.mBubble.destroy();
        this.mBubble = null;
        super.destroy();
    }
}
