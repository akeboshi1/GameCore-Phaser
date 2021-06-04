import { GameGridTable } from "apowophaserui";
import { Handler, i18n } from "utils";
import { op_client } from "pixelpai_proto";
import { PicaFriendBaseListItem, PicaFriendCommonItem, PicaFriendListItem } from "./PicaFriendListItem";
import { ButtonEventDispatcher } from "gamecoreRender";
import { UITools } from "picaRender";
import { CommonBackground } from "../Components";
import { FriendChannel, FriendData, FriendRelation, FriendRelationAction, FriendRelationEnum } from "structure";
export class PicaFriendBasePanel extends Phaser.GameObjects.Container {
    // protected mBackground: CommonBackground;
    protected mGameGrid: GameGridTable;
    protected backButton: ButtonEventDispatcher;
    protected dpr: number;
    protected zoom: number;
    protected sendHandler: Handler;
    protected optionType: FriendChannel;
    protected friendDatas: FriendData[];
    protected funDatasMap: Map<FriendChannel, any[]> = new Map();
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.zoom = zoom;
        this.create();
    }
    public show() {
        this.visible = true;
    }

    public hide() {
        this.visible = false;
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
                if (player.level) tempFriend.lv = player.level.level;
                tempFriend.gender = player.gender;
            }
        }
        this.mGameGrid.refresh();
    }
    public updateRelation(relations: FriendRelation[]) {

    }

    public filterById(id: string, relation?: FriendRelationAction) {
        if (!this.friendDatas || this.friendDatas.length < 1) {
            return;
        }
        if (this.friendDatas) {
            this.friendDatas = this.friendDatas.filter((friend: FriendData) => friend.id !== id);
        }
        this.setGridItemDatas(this.optionType, this.friendDatas);
    }
    protected create(title?: string) {
        title = title || i18n.t("friendlist.addfriend");
        this.backButton = UITools.createBackButton(this.scene, this.dpr, this.onBackHandler, this, title);
        this.backButton.x = -this.width * 0.5 + this.backButton.width * 0.5 + 5 * this.dpr;
        this.backButton.y = -this.height * 0.5 + this.backButton.height * 0.5 + 30 * this.dpr;
        const gridHeight = this.height - 70 * this.dpr;
        const gridY = this.backButton.y + this.backButton.height * 0.5 + 17 * this.dpr + gridHeight * 0.5;
        const tableConfig = {
            x: 0,
            y: gridY,
            table: {
                width: this.width,
                height: gridHeight,
                columns: 1,
                cellWidth: this.width,
                cellHeight: 75 * this.dpr,
                reuseCellContainer: true,
                zoom: this.zoom
            },
            scrollMode: 0,
            clamplChildOY: false,
            createCellContainerCallback: (cell, cellContainer) => {
                return this.createCellItem(cell, cellContainer);
            },
        };
        this.mGameGrid = new GameGridTable(this.scene, tableConfig);
        this.mGameGrid.layout();
        this.mGameGrid.on("cellTap", this.onGridTableHandler, this);
        this.add([this.backButton, this.mGameGrid]);
    }

    protected createCellItem(cell, cellContainer) {
        const scene = cell.scene, index = cell.index,
            item = cell.item;
        if (cellContainer === null) {
            cellContainer = new PicaFriendCommonItem(this.scene, 300 * this.dpr, 48 * this.dpr, this.dpr, this.zoom);
            cellContainer.setHandler(new Handler(this, this.onItemHandler));
        }
        item.optionType = this.optionType;
        cellContainer.setItemData(item, index);
        return cellContainer;
    }
    protected setGridItemDatas(type: FriendChannel, datas: FriendData[]) {
        const content = this.getItemDatas(type, datas);
        this.mGameGrid.setItems(content);
        this.setGridCellHeight(content);
    }
    protected onGridTableHandler(item: PicaFriendBaseListItem) {
        if (this.sendHandler) this.sendHandler.runWith(["frienditem", item.itemData]);
    }

    protected onItemHandler(tag: string, data?: any) {
        if (tag === "searchfriend") {
            let temps: FriendData[];
            if (data !== "" && data !== undefined) {
                temps = [];
                this.friendDatas.forEach((value) => {
                    if (value.nickname && value.nickname.indexOf(data) !== -1) {
                        temps.push(value);
                    }
                });
            } else {
                temps = this.friendDatas;
            }
            this.setGridItemDatas(this.optionType, temps);
        } else {
            if (this.sendHandler) this.sendHandler.runWith([tag, data]);
        }
    }
    protected setGridCellHeight(datas: any[]) {
        for (let i = 0; i < datas.length; i++) {
            const temp = datas[i];
            const height = temp.cellHeight || 52 * this.dpr;
            const cell = this.mGameGrid.getCell(i);
            cell.setHeight(height);
        }
        this.mGameGrid.layout();
        this.mGameGrid.refresh();
    }
    protected getItemDatas(type: FriendChannel, content: any[]) {
        return content;
    }
    protected getFriendsDatas(type: FriendChannel, data: any[]) {
        const result: FriendData[] = [];
        let target = null;
        const ids = [];
        let relation: FriendRelationEnum;
        for (const friend of data) {
            if (type === FriendChannel.Followes) {
                target = friend.followed_user;
                relation = FriendRelationEnum.Followed;
            } else if (type === FriendChannel.Fans || type === FriendChannel.Notice) {
                target = friend.user;
                relation = FriendRelationEnum.Fans;
            } else if (type === FriendChannel.Blacklist) {
                target = friend.ban_user;
                relation = FriendRelationEnum.Blacklist;
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
    protected onBackHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["back"]);
    }
    protected sortByName(array: FriendData[]) {
        return array.sort((a: FriendData, b: FriendData) => {
            return a.nickname.localeCompare(b.nickname, i18n.language);
        });
    }

    protected sortByCreate(ary: FriendData[]) {
        return ary.sort((a: FriendData, b: FriendData) => {
            return b.createAt - a.createAt;
        });
    }

    protected sortByOnlien(array: FriendData[]) {
        return array.sort((a: FriendData, b: FriendData) => {
            const aLv = a.online ? 1 : 0;
            const bLv = b.online ? 1 : 0;
            return bLv - aLv;
        });
    }

    protected sortByLv(array: FriendData[]) {
        return array.sort((a: FriendData, b: FriendData) => {
            const aLv = a.lv ? 1 : 0;
            const bLv = b.lv ? 1 : 0;
            return bLv - aLv;
        });
    }
}
