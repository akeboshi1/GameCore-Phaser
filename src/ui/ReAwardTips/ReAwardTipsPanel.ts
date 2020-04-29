import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";

export class ReAwardTipsPanel extends BasePanel {
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
    }

    protected init() {
        super.init();
    }
}

class AwardItem extends Phaser.GameObjects.Container {
    constructor(scene: Phaser.Scene) {
        super(scene);
    }
}
