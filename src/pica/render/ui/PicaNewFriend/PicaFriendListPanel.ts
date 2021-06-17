import { GameGridTable } from "apowophaserui";
import { Handler, i18n } from "utils";
import { op_client } from "pixelpai_proto";
import { PicaFriendBaseListItem, PicaFriendCommonItem, PicaFriendListItem, PicaFriendSearchItem } from "./PicaFriendListItem";
import { FriendChannel, FriendData, FriendRelation, FriendRelationEnum } from "structure";
import { PicaFriendBasePanel } from "./PicaFriendBasePanel";
export class PicaFriendListPanel extends PicaFriendBasePanel {
    public updateRelation(relations: FriendRelation[]) {

    }
    protected create() {
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
            }
        };
        this.mGameGrid = new GameGridTable(this.scene, tableConfig);
        this.mGameGrid.layout();
        this.mGameGrid.on("cellTap", this.onGridTableHandler, this);
        this.add(this.mGameGrid);
    }
    protected onItemHandler(tag: string, data?: any) {
        if (tag === "online") {
            let onlines;
            if (data) {
                onlines = [];
                this.sortByOnlien(this.friendDatas);
                this.friendDatas.forEach((value) => {
                    if (value.online) onlines.push(value);
                });
            } else {
                onlines = this.friendDatas;
            }
            this.setGridItemDatas(this.optionType, onlines);
        } else if (tag === "searchfriend") {
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

    protected getItemDatas(type: FriendChannel, content: any[]) {
        let temps;
        if (this.funDatasMap.has(type)) temps = this.funDatasMap.get(type);
        else {
            if (type === FriendChannel.Friends) {
                temps = [{ itemType: 5 }, { itemType: 2, cellHeight: 42 * this.dpr }, { itemType: 3, cellHeight: 42 * this.dpr }, { itemType: 4, cellHeight: 42 * this.dpr }];
            } else if (type === FriendChannel.Fans) {
                temps = [{ itemType: 5 }];
            } else if (type === FriendChannel.Followes) {
                temps = [{ itemType: 5 }];
            }
            this.funDatasMap.set(type, temps);
        }

        content = temps.concat(content);
        return content;
    }
}
