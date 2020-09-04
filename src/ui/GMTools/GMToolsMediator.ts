import { BaseMediator } from "../../../lib/rexui/lib/ui/baseUI/BaseMediator";
import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";

export class GMToolsMediator extends BaseMediator {
    private scene: Phaser.Scene;
    private layerMgr: ILayerManager;
    private world: WorldService;

    constructor(layerMgr: ILayerManager, scene: Phaser.Scene, worldService: WorldService) {
        super();
        this.scene = scene;
        this.layerMgr = layerMgr;
        this.world = worldService;
    }

    public show() {
        super.show();
    }
}
