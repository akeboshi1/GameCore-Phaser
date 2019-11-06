import { WorldService } from "../../game/world.service";
import ScrollablePanel from "../../../lib/rexui/templates/ui/scrollablepanel/ScrollablePanel.js";
import { IListItemComponent } from "../bag/IListItemRender";

export enum DirectionType {
    Vertical,
    Horizontal,
}

/**
 * 自定义视图 scrollerView，图片视图scrollerView可以用tileSprite
 */
export class SrollerView {
    private mScene: Phaser.Scene;
    private mWorld: WorldService;
    private mConfig: any;
    private mScrollablePanel: ScrollablePanel;
    private mShowLen: number;
    private mItemList: any[];
    constructor(scene: Phaser.Scene, world: WorldService, posX: number, posY: number, wid: number, hei: number, mode: DirectionType, item: any, itemSize: number, space: number = 0) {
        this.mScene = scene;
        this.mWorld = world;
        this.mConfig = {
            x: posX,
            y: posY,
            width: wid,
            height: hei,
            scrollMode: mode,

            space: {
                left: space,
                right: space,
                top: space,
                bottom: space,

                panel: space,
                header: space,
                footer: space,
            },
            itemClass: item,
            itemSize: itemSize
        };
        this.mShowLen = mode === 0 ? Math.ceil(wid / itemSize) : Math.ceil(hei / itemSize);
        this.init(scene, posX, posY, wid, hei, mode, item, space);
    }

    public createItem(scene, colIdx, rowIdx) {

    }

    public setChild(data: any[]) {
        if (this.mScrollablePanel) {
            const scrollMode: DirectionType = this.mConfig.scrollMode;
            const wid: number = this.mConfig.width;
            const hei: number = this.mConfig.height;
            const itemClass = this.mConfig.item;
            const itemSize = this.mConfig.itemSize;

            const expand = scrollMode === 0 ? (wid === undefined) : (hei === undefined);
            const len: number = data.length > this.mShowLen ? this.mShowLen : data.length;
            this.mItemList = [];
            for (let i: number = 0; i < len; i++) {
                const item = new itemClass();
                this.mItemList.push(item);
            }
            this.mScrollablePanel.childrenMap.child.setChild(this.mItemList, expand);
        }
    }

    private init(scene: Phaser.Scene, posX: number, posY: number, wid: number, hei: number, mode: DirectionType, item: IListItemComponent, space: number) {
        this.mScrollablePanel = (<any> scene).rexUI.add.scrollablePanel(scene,
            {
                x: posX,
                y: posY,
                width: wid,
                height: hei,
                scrollMode: mode,
                panel: {
                    child: this.mItemList,
                    mask: {
                        mask: true,
                        padding: 1,
                    }
                },
                slider: {
                    // track: this.rexUI.add.roundRectangle(0, 0, 20, 10, 10, COLOR_DARK),
                    // thumb: this.rexUI.add.roundRectangle(0, 0, 0, 0, 13, COLOR_LIGHT),
                },
                // header: this.rexUI.add.label({
                //     height: 30,

                //     orientation: mode,
                //     background: this.rexUI.add.roundRectangle(0, 0, 20, 20, 0, COLOR_DARK),
                //     text: this.add.text(0, 0, "Header"),
                // }),

                // footer: this.rexUI.add.label({
                //     height: 30,

                //     orientation: mode,
                //     background: this.rexUI.add.roundRectangle(0, 0, 20, 20, 0, COLOR_DARK),
                //     text: this.add.text(0, 0, "Footer"),
                // }),

                space: {
                    left: 10,
                    right: 10,
                    top: 10,
                    bottom: 10,

                    panel: 10,
                    header: 10,
                    footer: 10,
                }
            })
            .layout();
    }
}
