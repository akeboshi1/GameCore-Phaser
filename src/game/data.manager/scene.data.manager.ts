import { PBpacket } from "net-socket-packet";
import { BaseDataConfigManager } from "picaWorker";
import { op_client, op_virtual_world, op_def, op_gameconfig, op_pkt_def } from "pixelpai_proto";
import { EventType, ModuleName, RoomType } from "structure";
import { EventDispatcher } from "utils";
import { Game } from "../game";
import { BasePacketHandler } from "./base.packet.handler";
import { DataMgrType } from "./dataManager";
export class SceneDataManager extends BasePacketHandler {
    private mCurRoom: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_INFO;
    private isShowMainui: boolean = false;
    constructor(game: Game, event?: EventDispatcher) {
        super(game, event);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_PARTY_SEND_GIFT, this.on_SEND_GIFT_DATA);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_INFO, this.onUpdateModeRoomInfo);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_CRAFT_SKILLS, this.openComposePanel);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SHOW_REWARD_TIPS, this.onReAwardTipsHandler);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SHOW_BLING_PANEL, this.onShowBlingPanel);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_LEVEL_UP, this.onShowLevelUpPanel);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SHOW_HIGH_QUALITY_REWARD_TIPS, this.onHIGH_QUALITY_REWARD_TIPS);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_JOB_LIST, this.on_JOB_LIST);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_MINING_MODE_SHOW_SELECT_EQUIPMENT_PANEL, this.openMineEquipUpgrade);
        this.mEvent.on(EventType.SCENE_CHANGE, this.onSceneChangeHandler, this);
        this.addPackListener();
    }
    clear() {
        super.clear();
        this.mCurRoom = undefined;
    }

    destroy() {
        super.destroy();
        this.mCurRoom = undefined;
    }

    private onReAwardTipsHandler(packet: PBpacket) {
        this.game.showMediator(ModuleName.PICAREWARDTIP_NAME, true, packet.content);
        // this.mEvent.emit("showAward", packet.content);
    }

    private openComposePanel(packge: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_CRAFT_SKILLS = packge.content;
        const list = [];
        const config = <BaseDataConfigManager>this.game.configManager;

        packge.content.skills.forEach((skill) => {
            const sk = config.getSkill(skill.skill.id);
            sk.skill.active = skill.skill.active;
            list.push(sk);
        });

        this.mEvent.emit(EventType.SCENE_SHOW_UI, ModuleName.PICACOMPOSE_NAME, { skills: list });
    }

    private on_SEND_GIFT_DATA(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_PARTY_SEND_GIFT = packet.content;
        this.mEvent.emit(EventType.SEND_GIFT_DATA_UPDATE, content);
        this.sendOpenGiftEffect(content);
    }
    private sendOpenGiftEffect(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_PARTY_SEND_GIFT) {
        this.mEvent.emit(EventType.SCENE_SHOW_UI, ModuleName.PICAGIFTEFFECT_NAME, content);
        const dataMgr = this.game.dataManager;
        const mgr = dataMgr.getDataMgr<any>(DataMgrType.BaseMgr);
        if (mgr) {
            mgr.query_ELEMENT_ITEM_REQUIREMENTS(content.itemId, "QueryItems");
        }
    }
    private onUpdateModeRoomInfo(packet: PBpacket) {
        const room: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_INFO = packet.content;
        if (!this.mCurRoom) this.mCurRoom = room;
        else Object.assign(this.mCurRoom, room);
        this.mEvent.emit(EventType.UPDATE_ROOM_INFO, this.mCurRoom);
        this.mEvent.emit(EventType.UPDATE_PARTY_STATE, this.mCurRoom.openingParty);
        this.showMainUI();
    }

    private onShowBlingPanel(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_SHOW_BLING_PANEL = packet.content;
        content["effecttype"] = "unlock";
        this.mEvent.emit(EventType.SCENE_SHOW_UI, ModuleName.PICAEFFECTMGR_NAME, content);
    }

    private onShowLevelUpPanel(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_LEVEL_UP = packet.content;
        content["effecttype"] = "levelup";
        this.mEvent.emit(EventType.SCENE_SHOW_UI, ModuleName.PICAEFFECTMGR_NAME, content);
    }

    private onHIGH_QUALITY_REWARD_TIPS(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_SHOW_HIGH_QUALITY_REWARD_TIPS = packet.content;
        this.syncItemBases(content.list);
        this.mEvent.emit(EventType.SCENE_SHOW_UI, ModuleName.PICATREASURE_NAME, { data: content.list, type: "open" });
    }
    private on_JOB_LIST(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_JOB_LIST = packet.content;
        this.mEvent.emit(EventType.SCENE_SHOW_UI, ModuleName.PICAWORK_NAME, content);
    }
    private openMineEquipUpgrade(packge: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_MINING_MODE_SHOW_SELECT_EQUIPMENT_PANEL = packge.content;
        this.mEvent.emit(EventType.SCENE_SHOW_UI, ModuleName.PICAEQUIPUPGRADE_NAME, content);
    }
    get curRoomID() {
        if (this.mCurRoom) return this.mCurRoom.roomId;
        return undefined;
    }

    get curRoom() {
        return this.mCurRoom;
    }
    private showMainUI() {
        if (!this.isShowMainui) {
            const hideArr = [];
            if (this.mCurRoom.roomType === RoomType.EPISODE) {
                hideArr.push(ModuleName.PICANEWMAIN_NAME);
            }
            this.mEvent.emit(EventType.SCENE_SHOW_MAIN_UI, hideArr);
            if (this.mCurRoom.roomType === RoomType.EPISODE)
                this.mEvent.emit(EventType.SCENE_SHOW_UI, ModuleName.PICAEXPLORELOG_NAME);
            this.isShowMainui = true;
        }
    }
    private onSceneChangeHandler() {
        this.isShowMainui = false;
    }
    private syncItemBases(items: op_client.ICountablePackageItem[]) {
        const config = <BaseDataConfigManager>this.game.configManager;
        for (const item of items) {
            config.synItemBase(item);
        }
    }
}
