
import { Render } from "gamecoreRender";
import { ModuleName } from "structure";
import { Logger } from "utils";
import { DisplayObject } from "../display";
import { DisplayManager } from "../managers";

export class DecorateManager extends Phaser.Events.EventEmitter {
    private mSelecting: boolean = false;
    private mDpr: number;
    private mDisplayManager: DisplayManager;
    private mSelectorElement: DisplayObject;

    constructor(scene: Phaser.Scene, private render: Render) {
        super();
        this.mDisplayManager = this.render.displayManager;
        this.mDpr = this.render.scaleRatio;
    }

    public setElement(id: number) {
        this.mSelectorElement = this.mDisplayManager.getDisplay(id);
        const mediator = this.mediator;
        mediator.setElement(id);
        this.mSelecting = true;
    }

    public moveElement(pointer: Phaser.Input.Pointer) {
        if (!this.mSelectorElement || !pointer) {
            return;
        }
        const mediator = this.mediator;
        const x = pointer.worldX / this.mDpr;
        const y = pointer.worldY / this.mDpr;
        mediator.moveElement(x, y);
        // const panel = this.render.uiManager.getPanel(ModuleName.PICADECORATE_NAME);
        // this.mSelectorElement.x = pointer.worldX / this.mDpr;
        // this.mSelectorElement.y = pointer.worldY / this.mDpr;
        // if (panel) {
        //     (<any>panel).setElement(this.mSelectorElement.id);
        // }
    }

    public isDragging(): boolean {
        return this.mSelectorElement && this.mSelecting;
    }

    get mediator() {
        return this.render.mainPeer[ModuleName.PICADECORATE_NAME];
    }

    set selecting(val: boolean) {
        this.mSelecting = val;
    }

    get selecting(): boolean {
        return this.mSelecting;
    }
}
