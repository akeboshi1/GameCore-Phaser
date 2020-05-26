import { ILayerManager } from "../layer.manager";
import { op_client, op_pkt_def } from "pixelpai_proto";
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
    }

    show() {
        if (this.mView) {
            return;
        }
        if (!this.mView) {
            this.mView = new CharacterInfoPanel(this.scene, this.world);
            this.mView.on("hide", this.onHidePanel, this);
            this.mView.on("queryOwnerInfo", this.onQueryOwnerInfo, this);
        }
        if (!this.characterInfo) {
            this.characterInfo = new CharacterInfo(this.world);
            this.characterInfo.on("ownerInfo", this.onOwnerCharacterInfo, this);
            this.characterInfo.on("otherInfo", this.onOtherCharacterInfo, this);
            this.characterInfo.register();
        }
        this.layerMgr.addToUILayer(this.mView);
        this.mView.show();
    }

    isSceneUI() {
        return true;
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
        this.destroy();
    }

    private onOwnerCharacterInfo(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_SELF_PLAYER_INFO) {
        this.mView.setPlayerData(content);
    }

    private onOtherCharacterInfo(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ANOTHER_PLAYER_INFO) {
        this.mView.setPlayerData(content);
    }

    private onQueryOwnerInfo() {
        this.characterInfo.queryPlayerInfo();
    }

    private testOwnerData() {
        const player = this.world.roomManager.currentRoom.playerManager.actor;
        const owner = new op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_SELF_PLAYER_INFO();
        owner.id = player.id;
        owner.cid = "5524121555";
        owner.like = 652;
        owner.currentAvatar = new op_pkt_def.PKT_Avatar();
        owner.currentAvatar.avatar = player.model.avatar;
        owner.nickname = player.model.nickname;
        owner.level = new op_pkt_def.PKT_Level();
        owner.level.level = 32;
        owner.level.currentLevelExp = 100;
        owner.level.nextLevelExp = 400;
        owner.lifeSkills = [];
        owner.currentTitle = "这是一个称号";
        for (let i = 0; i < 20; i++) {
            const item = new op_pkt_def.PKT_Skill();
            item.id = i + 10 + "";
            item.name = "技能" + i;
            item.level = new op_pkt_def.PKT_Level();
            item.level.level = 20 + i;
            item.level.currentLevelExp = 200 + i * 10;
            item.level.nextLevelExp = 400 + i * 10;
            owner.lifeSkills.push(item);
        }
        return owner;
    }
}
