import { BaseMediator } from "tooqingui";
import { WorldService } from "../../game/world.service";
import { ILayerManager } from "../layer.manager";
import { NpcDialogue } from "./NpcDialogue";
import { NpcDialoguePanel } from "./NpcDialoguePanel";

export class NpcDialogueMediator extends BaseMediator {
    private scene: Phaser.Scene;
    private world: WorldService;
    private layerMgr: ILayerManager;
    private npcDialogue: NpcDialogue;
    constructor(layerMgr: ILayerManager, scene: Phaser.Scene, worldService: WorldService) {
        super();
        this.scene = scene;
        this.layerMgr = layerMgr;
        this.world = worldService;
    }

    show() {
        if ((this.mView && this.mView.isShow()) || this.mShow) {
            return;
        }
        if (!this.mView) {
            this.mView = new NpcDialoguePanel(this.scene, this.world);
        }
        if (!this.npcDialogue) {
            this.npcDialogue = new NpcDialogue(this.world);
            this.npcDialogue.register();
        }
        this.layerMgr.addToUILayer(this.mView);
        this.mView.show();
    }

    isSceneUI() {
        return true;
    }

    destroy() {
        if (this.npcDialogue) {
            this.npcDialogue.destroy();
            this.npcDialogue = undefined;
        }
        if (this.mView) {
            this.mView.hide();
            this.mView = undefined;
        }
    }
}
