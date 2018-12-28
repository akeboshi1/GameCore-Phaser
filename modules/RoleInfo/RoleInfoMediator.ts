import {MediatorBase} from "../../base/module/core/MediatorBase";
import {RoleInfoView} from "./view/RoleInfoView";
import {SlotInfo} from "../../common/struct/SlotInfo";
import Globals from "../../Globals";
import {AttriListItem} from "./view/item/AttriListItem";
import {MessageType} from "../../common/const/MessageType";
import {PlayerInfo} from "../../common/struct/PlayerInfo";

export class RoleInfoMediator extends MediatorBase {
    private get view(): RoleInfoView {
        return this.viewComponent as RoleInfoView;
    }

    public onRegister(): void {
        if (Globals.DataCenter.PlayerData.initialize) {
            this.initView();
        } else {
            Globals.MessageCenter.on(MessageType.PLAYER_DATA_INITIALIZE, this.handleInit, this);
        }
        this.addEvent();
    }

    private addEvent(): void {
        Globals.MessageCenter.on(MessageType.SCENE_UPDATE_PLAYER, this.handleUpdate, this);

    }

    private handleInit(): void {
        this.initView();
    }

    private handleUpdate(player: PlayerInfo): void {
        // todo:先不管 player.slot
        if (player.attributes) {
            let solt: SlotInfo;
            let i: number = 0;
            let len = this.view.m_List.getLength();
            let item: AttriListItem;
            for (; i < len; i++) {
                item = this.view.m_List.getItem(i) as AttriListItem;
                solt = Globals.DataCenter.PlayerData.mainPlayerInfo.getSlotByName(item.data.bondName);
                item.data = solt;
            }
        }
    }

    private initView(): void {
        let solts: SlotInfo[] = Globals.DataCenter.PlayerData.mainPlayerInfo.getSlots();
        if (solts == null) {
            return;
        }
        let len = solts.length;
        let item: AttriListItem;
        for (let i = 0; i < len; i++) {
            item = new AttriListItem(Globals.game);
            item.data = solts[i];
            this.view.m_List.addItem(item);
        }
    }
}