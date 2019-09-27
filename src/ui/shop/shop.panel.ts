import { Panel } from "../components/panel";
import { WorldService } from "../../game/world.service";

export class ShopPanel extends Panel {
    private mWorld: WorldService;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene);
        this.mWorld = world;
    }

    public isShow(): boolean {
        return this.mShowing;
    }

    protected preload() {
        super.preload();
    }
}
