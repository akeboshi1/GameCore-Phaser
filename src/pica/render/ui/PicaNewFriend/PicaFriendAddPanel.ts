import { FriendChannel, FriendData, FriendRelation, FriendRelationAction, FriendRelationEnum } from "structure";
import { Handler, i18n } from "utils";
import { PicaFriendBasePanel } from "./PicaFriendBasePanel";
import { PicaFriendFunctionCommonItem } from "./PicaFriendListItem";

export class PicaFriendAddPanel extends PicaFriendBasePanel {

    public setFriendDatas(type: FriendChannel, content: any) {
        super.setFriendDatas(type, content);
        if (content.length === 0) this.mGameGrid.setT(0);
    }
    public updateFriendDatas(content: any) {
        const friends = this.friendDatas;
        if (!friends) {
            return;
        }
        for (const player of content) {
            const tempFriend = friends.find((friend) => friend.id === player._id);
            if (tempFriend) {
                tempFriend.avatar = player.avatar;
            }
        }
        this.mGameGrid.refresh();
    }
    public updateRelation(relations: FriendRelation[]) {
        const items = this.friendDatas;
        for (const relation of relations) {
            const friend = items.find((f) => f.id === relation.id);
            friend.relation = relation.relation;
        }
        this.mGameGrid.refresh();
    }
    public filterById(id: string, relation?: FriendRelationAction) {
        if (!this.friendDatas || this.friendDatas.length < 1) {
            return;
        }
        if (this.friendDatas) {
            const temp = this.friendDatas.find((value) => {
                if (value.id === id) return true;
            });
            if (temp) {
                if (temp.relation === FriendRelationEnum.Blacklist) {
                    temp.relation = FriendRelationEnum.Null;
                } else if (temp.relation === FriendRelationEnum.Fans) {
                    temp.relation = FriendRelationEnum.Friend;
                } else if (temp.relation === FriendRelationEnum.Null) {
                    temp.relation = FriendRelationEnum.Followed;
                } else if (temp.relation === FriendRelationEnum.Followed) {
                    if (relation === FriendRelationAction.BAN) {
                        temp.relation = FriendRelationEnum.Blacklist;
                    } else if (relation === FriendRelationAction.UNFOLLOW) {
                        temp.relation = FriendRelationEnum.Null;
                    }

                }
                this.mGameGrid.refresh();
            }
        }
    }
    public show() {
        super.show();
        this.funDatasMap.clear();
    }

    public hide() {
        super.hide();
    }
    protected getFriendsDatas(type: FriendChannel, data: any[]) {
        const result: FriendData[] = [];
        const ids = [];
        for (const player of data) {
            const { platformId, nickname, level } = player;
            result.push({ type: this.optionType, nickname, id: platformId, lv: level.level });
            ids.push(platformId);
        }
        if (ids.length > 0) this.sendHandler.runWith(["REQ_FRIEND_RELATION", ids]);
        return result;
    }
    protected create() {
        super.create(i18n.t("friendlist.addfriend"));
    }

    protected onItemHandler(tag: string, data?: any) {
        if (this.sendHandler) this.sendHandler.runWith([tag, data]);
    }
    protected createCellItem(cell, cellContainer) {
        const scene = cell.scene, index = cell.index,
            item = cell.item;
        if (cellContainer === null) {
            cellContainer = new PicaFriendFunctionCommonItem(this.scene, 300 * this.dpr, 48 * this.dpr, this.dpr, this.zoom);
            cellContainer.setHandler(new Handler(this, this.onItemHandler));
        }
        item.optionType = this.optionType;
        cellContainer.setItemData(item, index);
        return cellContainer;
    }
    protected getItemDatas(type: FriendChannel, content: any[]) {
        let temps;
        if (this.funDatasMap.has(type)) temps = this.funDatasMap.get(type);
        else {
            temps = [{ itemType: 5 }];
            this.funDatasMap.set(type, temps);
        }
        content = temps.concat(content);
        return content;

    }
}
