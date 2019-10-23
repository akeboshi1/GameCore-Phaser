import { BaseMediator } from "../baseMediator";
import { IAbstractPanel } from "../abstractPanel";
import { DialogueView } from "./dialogueView";
import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";

export class DialogueMediator extends BaseMediator {
    public static NAME: string = "DialogueMediator";
    public world: WorldService;
    private mScene: Phaser.Scene;
    private mParam: any;
    constructor(layerManager: ILayerManager, scene: Phaser.Scene, world: WorldService) {
        super(world);
    }

    public isSceneUI(): boolean {
        return false;
    }

    public resize() {
        if (this.mView) return this.mView.resize();
    }

    public getView(): IAbstractPanel {
        return this.mView;
    }

    public show(param?: any) {
        if (this.mView) {
            return;
        }
        this.mView = new DialogueView(this.mScene, this.world);
        this.mView.show(param);
        this.mParam = param;
        super.show(param);
    }

    public hide() {
        if (this.mView) {
            this.mView.hide();
            this.mView = null;
        }
    }

    public destroy() {
        this.world = null;
        this.mScene = null;
        this.mParam = null;
        super.destroy();
    }

}
