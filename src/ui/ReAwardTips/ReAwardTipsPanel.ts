import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { op_client } from "pixelpai_proto";

export class ReAwardTipsPanel extends BasePanel {
    private mBubble: AwardItem[] = [];
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
    }

    public appendAward(tips: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SHOW_REWARD_TIPS) {
        const award = new AwardItem(this.scene);
        this.add(award);
        this.mBubble.push(award);
    }

    public addAward() {
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
