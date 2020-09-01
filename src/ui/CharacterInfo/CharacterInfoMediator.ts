import { ILayerManager } from "../layer.manager";
import { op_client } from "pixelpai_proto";
import { BaseMediator } from "../../../lib/rexui/lib/ui/baseUI/BaseMediator";
import { WorldService } from "../../game/world.service";
import CharacterInfoPanel from "./CharacterInfoPanel";
import { CharacterInfo } from "./CharacterInfo";

export class CharacterInfoMediator extends BaseMediator {
    protected mView: CharacterInfoPanel;
    private scene: Phaser.Scene;
    private layerMgr: ILayerManager;
    private characterInfo: CharacterInfo;
    private world: WorldService;
    constructor(layerMgr: ILayerManager, scene: Phaser.Scene, worldService: WorldService) {
        super();
        this.scene = scene;
        this.layerMgr = layerMgr;
        this.world = worldService;
        this.characterInfo = new CharacterInfo(this.world);
        this.characterInfo.on("ownerInfo", this.onOwnerCharacterInfo, this);
        this.characterInfo.on("otherInfo", this.onOtherCharacterInfo, this);
        this.characterInfo.register();
    }

    show(params?: any) {
        if (this.mView) {
            this.mView.show(params);
            return;
        }
        if (!this.mView) {
            this.mView = new CharacterInfoPanel(this.scene, this.world);
            this.mView.on("hide", this.onHidePanel, this);
            this.mView.on("queryOwnerInfo", this.onQueryOwnerInfo, this);
            this.mView.on("track", this.onTrackHandler, this);
            this.mView.on("invite", this.onInviteHandler, this);
        }
        this.layerMgr.addToUILayer(this.mView);
        this.mView.show(params);
    }

    isSceneUI() {
        return false;
    }

    destroy() {
        if (this.characterInfo) {
            this.characterInfo.destroy();
            this.characterInfo = undefined;
        }
        if (this.mView) {
            this.mView.hide();
            this.mView = undefined;
        }
    }

    private onHidePanel() {
        if (this.mView) {
            this.mView.hide();
        }
        this.mView = undefined;
        this.hide();
    }

    private onOwnerCharacterInfo(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_SELF_PLAYER_INFO) {
        this.show(content);
        // this.mView.setPlayerData(content);
    }

    private onOtherCharacterInfo(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ANOTHER_PLAYER_INFO) {
        this.show(content);
        // this.mView.setPlayerData(content);
    }

    private onQueryOwnerInfo() {
        this.characterInfo.queryPlayerInfo();
    }

    private onTrackHandler(id: string) {
        this.characterInfo.track(id);
    }

    private onInviteHandler(id: string) {
        this.characterInfo.invite(id);
    }
}
