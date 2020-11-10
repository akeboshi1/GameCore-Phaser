import { InteractionBubbleCell } from "./InteractionBubbleCell";
import { BaseUI } from "apowophaserui";
import { Handler } from "utils";
export class InteractionBubbleContainer extends BaseUI {
    public id: number;
    private mBubble: InteractionBubbleCell;
    constructor(scene: Phaser.Scene, dpr: number) {
        super(scene);
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

    public setBubble(content: any, handler: Handler) {
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