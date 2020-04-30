import { BaseMediator } from "../../../lib/rexui/lib/ui/baseUI/BaseMediator";
import { WorldService } from "../../game/world.service";
import { ReAwardTips } from "./ReAwardTip";
import { op_client } from "pixelpai_proto";
import { ReAwardTipsPanel } from "./ReAwardTipsPanel";

export class ReAwardTipsMediator extends BaseMediator {
    private mReAwardTips: ReAwardTips;
    constructor(private scene: Phaser.Scene, private world: WorldService) {
        super();
        this.mReAwardTips = new ReAwardTips(world);
        this.mReAwardTips.register();
        this.mReAwardTips.on("showAward", this.onShowAwardHandler, this);
    }

    show(param: any) {
        if (this.mView && this.mView.isShow()) {
            (<ReAwardTipsPanel> this.mView).appendAward(param);
            return;
        }
        this.mView = new ReAwardTipsPanel(this.scene, this.world);
        (<ReAwardTipsPanel> this.mView).appendAward(param);
        super.show();
    }

    public destroy() {
        if (this.mReAwardTips) {
            this.mReAwardTips.destroy();
        }
        super.destroy();
    }

    private onShowAwardHandler(content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SHOW_REWARD_TIPS) {
        this.show(content);
    }

}
