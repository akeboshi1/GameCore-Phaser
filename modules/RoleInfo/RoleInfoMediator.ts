import {MediatorBase} from "../../base/module/core/MediatorBase";
import {RoleInfoView} from "./view/RoleInfoView";
import {SlotInfo} from "../../common/struct/SlotInfo";
import Globals from "../../Globals";
import {AttriListItem} from "./view/item/AttriListItem";
import {MessageType} from "../../common/const/MessageType";
import {PlayerInfo} from "../../common/struct/PlayerInfo";
import {IListItemComponent} from "../../base/component/list/interfaces/IListItemComponent";

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
        if (player.uuid !== Globals.DataCenter.PlayerData.mainPlayerInfo.uuid) {
            return;
        }
        if (player.attributes) {
            let solts: SlotInfo[] = Globals.DataCenter.PlayerData.mainPlayerInfo.getSlots();
            if (solts == null) {
                return;
            }
            let len = solts.length;
            let item: IListItemComponent;
            let solt: SlotInfo;
            for (let i = 0; i < len; i++) {
                solt = solts[i];
                item = this.view.m_List.getItemByFunction((value: IListItemComponent) => {
                    if (value.data.bondName === solt.bondName) {
                        return true;
                    }
                    return false;
                });
                if (item) {
                    item.data = solt;
                }
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