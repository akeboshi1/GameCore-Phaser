import { ILayerManager } from "../layer.manager";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { BaseMediator } from "../../../lib/rexui/lib/ui/baseUI/BaseMediator";
import { WorldService } from "../../game/world.service";
import PicFriendPanel from "./PicFriendPanel";
import { PicFriend } from "./PicFriend";
import { FetchFriend } from "./FetchFriend";

export class PicFriendMediator extends BaseMediator {
    protected mView: PicFriendPanel;
    private scene: Phaser.Scene;
    private layerMgr: ILayerManager;
    private picFriend: PicFriend;
    private world: WorldService;
    private fetchFriend: FetchFriend;
    constructor(layerMgr: ILayerManager, scene: Phaser.Scene, worldService: WorldService) {
        super();
        this.scene = scene;
        this.layerMgr = layerMgr;
        this.world = worldService;
    }

    show() {
        if (this.mView) {
            return;
        }
        if (!this.mView) {
            this.mView = new PicFriendPanel(this.scene, this.world);
            this.mView.on("hide", this.onHidePanel, this);
        }
        if (!this.picFriend) {
            this.picFriend = new PicFriend(this.world);
            this.picFriend.register();
        }
        if (!this.fetchFriend) {
            this.fetchFriend = new FetchFriend(this.world);
        }
        this.layerMgr.addToUILayer(this.mView);
        this.mView.show();
    }

    destroy() {
        if (this.picFriend) {
            this.picFriend.destroy();
            this.picFriend = undefined;
        }
        if (this.mView) {
            this.mView.hide();
            this.mView = undefined;
        }

        this.fetchFriend = undefined;
    }

    private onHidePanel() {
        this.destroy();
    }
}
