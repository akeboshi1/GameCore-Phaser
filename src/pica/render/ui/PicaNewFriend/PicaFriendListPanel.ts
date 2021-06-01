import { GameGridTable } from "apowophaserui";
import { Handler, i18n } from "utils";
import { op_client } from "pixelpai_proto";
import { PicaFriendBaseListItem, PicaFriendCommonItem, PicaFriendListItem } from "./PicaFriendListItem";
import { FriendChannel, FriendData, FriendRelation, FriendRelationEnum } from "structure";
export class PicaFriendListPanel extends Phaser.GameObjects.Container {
    private mGameGrid: GameGridTable;
    private dpr: number;
    private zoom: number;
    private sendHandler: Handler;
    private optionType: FriendChannel;
    private friendDatas: FriendData[];
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.zoom = zoom;
        this.create();
    }
    create() {
        const tableConfig = {
            x: 0,
            y: 48 * this.dpr,
            table: {
                width: this.width,
                height: this.height,
                columns: 1,
                cellWidth: this.width,
                cellHeight: 52 * this.dpr,
                reuseCellContainer: true,
                zoom: this.zoom
            },
            scrollMode: 0,
            clamplChildOY: false,
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene, index = cell.index,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new PicaFriendCommonItem(this.scene, 300 * this.dpr, 52 * this.dpr, this.dpr, this.zoom);
                    cellContainer.setHandler(new Handler(this, this.onItemHandler));
                }
                item.optionType = this.optionType;
                cellContainer.setItemData(item, index);
                return cellContainer;
            },
        };
        this.mGameGrid = new GameGridTable(this.scene, tableConfig);
        this.mGameGrid.layout();
        this.mGameGrid.on("cellTap", this.onGridTableHandler, this);
        this.add(this.mGameGrid);
    }

    public refreshMask() {
        this.mGameGrid.resetMask();
    }
    public setHandler(handler: Handler) {
        this.sendHandler = handler;
    }
    public setFriendDatas(type: FriendChannel, content: any) {
        this.optionType = type;
        this.friendDatas = this.getFriendsDatas(type, content);
        this.setGridItemDatas(type, this.friendDatas);
    }
    public updateFriendDatas(content: any) {
        const playerInfos = content.playerInfos;
        let tempFriend: FriendData = null;
        const friends = this.friendDatas;
        if (!friends) {
            return;
        }
        for (const player of playerInfos) {
            tempFriend = friends.find((friend) => friend.id === player.platformId);
            if (tempFriend) {
                tempFriend.nickname = player.nickname;
                tempFriend
                if (player.level) tempFriend.lv = player.level.level;
                tempFriend.genger = player.gender;
            }
        }
        this.mGameGrid.refresh();
    }
    public updateRelation(relations: FriendRelation[]) {

    }
    private setGridItemDatas(type: FriendChannel, datas: FriendData[]) {
        const content = this.getItemDatas(type, datas);
        this.mGameGrid.setItems(content);
        this.setGridCellHeight(content);
    }
    private onGridTableHandler(item: PicaFriendBaseListItem) {
        if (this.sendHandler) this.sendHandler.runWith(["enter", item]);
    }

    private onItemHandler(tag: string, data?: any) {
        if (tag === "online") {
            this.sortByOnlien(this.friendDatas);
            const onlines = [];
            this.friendDatas.forEach((value) => {
                if (value.online) onlines.push(value);
            })
        } else {
            if (this.sendHandler) this.sendHandler.runWith([tag, data]);
        }
    }
    private setGridCellHeight(datas: any[]) {
        for (let i = 0; i < datas.length; i++) {
            const temp = datas[i];
            const height = temp.cellHeight || 52 * this.dpr;
            const cell = this.mGameGrid.getCell(i);
            cell.setHeight(height);
        }
        this.mGameGrid.layout();
        this.mGameGrid.setT(0);
    }
    private getItemDatas(type: FriendChannel, content: any[]) {
        let temps = [];
        if (type === FriendChannel.Friends) {
            temps = [{ itemType: 5 }, { itemType: 2, cellHeight: 42 * this.dpr }, { itemType: 3, cellHeight: 42 * this.dpr }, { itemType: 4, cellHeight: 42 * this.dpr }]
        } else if (type === FriendChannel.Fans) {
            temps = [{ itemType: 5 }]
        } else if (type === FriendChannel.Followes) {
            temps = [{ itemType: 5 }]
        }
        content = temps.concat(content);
        return content;
    }

    public getFriendsDatas(type: FriendChannel, data: any[]) {
        const result: FriendData[] = [];
        let target = null;
        const ids = [];
        let relation: FriendRelationEnum;
        for (const friend of data) {
            if (type === FriendChannel.Followes) {
                target = friend.followed_user;
                relation = FriendRelationEnum.Followed;
            } else if (type === FriendChannel.Fans) {
                target = friend.user;
                relation = FriendRelationEnum.Fans;
            } else {
                target = friend;
                relation = FriendRelationEnum.Friend;
            }
            if (target) {
                let createAt = 0;
                if (target.createAt) {
                    createAt = Date.parse(target.createAt);
                }
                let online = false;
                const game = friend.game;
                if (game && game.length > 0) {
                    if (friend.nowtime - game[0].lastTime <= 60) {
                        online = true;
                    }
                }
                result.push({ type, id: target._id, lv: target.level, nickname: target.nickname, avatar: target.avatar, relation, createAt, online });
                ids.push(target._id);
            }
        }
        if (ids.length > 0) this.sendHandler.runWith(["REQ_PLAYER_LIST", ids]);
        return result;
    }
    private sortByName(array: FriendData[]) {
        return array.sort((a: FriendData, b: FriendData) => {
            return a.nickname.localeCompare(b.nickname, i18n.language);
        });
    }

    private sortByCreate(ary: FriendData[]) {
        return ary.sort((a: FriendData, b: FriendData) => {
            return b.createAt - a.createAt;
        });
    }

    private sortByOnlien(array: FriendData[]) {
        return array.sort((a: FriendData, b: FriendData) => {
            const aLv = a.online ? 1 : 0;
            const bLv = b.online ? 1 : 0;
            return bLv - aLv;
        });
    }

    private sortByLv(array: FriendData[]) {
        return array.sort((a: FriendData, b: FriendData) => {
            const aLv = a.lv ? 1 : 0;
            const bLv = b.lv ? 1 : 0;
            return bLv - aLv;
        });
    }
}
