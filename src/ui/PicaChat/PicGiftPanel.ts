import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { op_client } from "pixelpai_proto";
import { DynamicImage } from "../components/dynamic.image";
import { Handler } from "../../Handler/Handler";
import { Url } from "../../utils/resUtil";
import { GameGridTable } from "apowophaserui";
export class PicHandheldPanel extends Phaser.GameObjects.Container {
    private mPropGrid: GameGridTable;
    private curHandheldItem: HandheldItem;
    private isExtendsGrid: boolean = false;
    private key: string;
    private dpr: number;
    private zoom: number;
    // private chatText
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, dpr: number, zoom: number) {
        super(scene, x, y);
        this.key = key;
        this.dpr = dpr;
        this.zoom = zoom;
        this.setSize(width, height);
        this.init();
    }
    public destroy() {
        if (this.mPropGrid) {
            this.mPropGrid.destroy();
        }
        super.destroy();
    }
    public setEqipedDatas(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_HANDHELD) {
        let datas = content.handheld;
        datas = datas.sort((a, b) => {
            if (a.latestUse >= b.latestUse) return 1;
            else return -1;
        });
        const useArr = datas.splice(0, 3);
        datas = datas.sort((a, b) => {
            if (a.recommended >= b.recommended) return 1;
            else return -1;
        });
        datas = useArr.concat(datas);
        const emptyData = op_client.CountablePackageItem.create({ id: "empty_handed", count: 0 });
        let curr: op_client.ICountablePackageItem;
        if (content.currentHandheldId === "" || !content.currentHandheldId) {
            curr = emptyData;
        } else {
            for (const data of datas) {
                if (data.id === content.currentHandheldId) {
                    curr = data;
                    break;
                }
            }
        }
        datas.unshift(emptyData);
        if (this.isExtendsGrid) {
            const len = 14;
            const templen = len - datas.length;
            const alldata = templen > 0 ? datas.concat(new Array(templen)) : datas;
            this.mPropGrid.setItems(alldata);
            if (curr) {
                const cells = this.mPropGrid.getCells();
                for (const cell of cells) {
                    if (cell && cell.container) {
                        const container = cell.container;
                        if (container.itemData === curr) {
                            container.isSelect = true;
                            this.curHandheldItem = cell;
                        } else container.isSelect = false;
                    }
                }
            }
        }
    }

    protected init() {
        const mBackground = this.scene.make.graphics(undefined, false);
        mBackground.fillStyle(0x333333, 0.5);
        mBackground.fillRect(-this.width * 0.5, -this.height * 0.5, this.width, this.height);
        this.add(mBackground);
        const propFrame = this.scene.textures.getFrame(this.key, "equp_bg");
        const cellWidth = propFrame.width + 10 * this.dpr;
        const cellHeight = propFrame.height + 10 * this.dpr;
        const propGridConfig = {
            x: 0,
            y: 0,
            table: {
                width: this.width - 20 * this.dpr,
                height: 120 * this.dpr,
                columns: 2,
                cellWidth,
                cellHeight,
                reuseCellContainer: true,
                cellOriginX: 0.5,
                cellOriginY: 0.5,
                zoom: this.scale
            },
            scrollMode: 1,
            clamplChildOY: false,
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new HandheldItem(scene, 0, 0, this.key, this.dpr);
                }
                cellContainer.setItemData(item);
                return cellContainer;
            },
        };
        this.mPropGrid = new GameGridTable(this.scene, propGridConfig);
        this.mPropGrid.layout();
        this.mPropGrid.on("cellTap", (cell) => {
            this.onSelectItemHandler(cell);
        });
        this.add(this.mPropGrid);
    }

    private onSelectItemHandler(item: HandheldItem) {
        const data = item.itemData;
        if (!data) return;
        if (this.curHandheldItem) this.curHandheldItem.isSelect = false;
        item.isSelect = true;
        this.curHandheldItem = item;
        if (item.isEmptyHanded) {
            this.emit("clearhandheld");
        } else {
            this.emit("changehandheld", data.id);
        }
    }

    private onShortcutHandler(data: any) {
        this.emit("clearhandheld");
    }
}

class HandheldItem extends Phaser.GameObjects.Container {
    public itemData: op_client.CountablePackageItem;
    public bg: Phaser.GameObjects.Image;
    public selectbg: Phaser.GameObjects.Image;
    public icon: DynamicImage;
    private mIsSelect: boolean = false;
    private dpr: number;
    private key: string;
    constructor(scene: Phaser.Scene, x: number, y: number, key: string, dpr: number) {
        super(scene, x, y);
        this.dpr = dpr;
        this.key = key;
        this.bg = this.scene.make.image({ key, frame: "equp_bg" });
        this.selectbg = this.scene.make.image({ key, frame: "click_bg" });
        this.icon = new DynamicImage(scene, 0, 0);
        this.add([this.bg, this.selectbg, this.icon]);
        this.setSize(this.selectbg.width, this.selectbg.height);
        this.isSelect = false;
    }

    public setItemData(data: op_client.CountablePackageItem) {

        this.itemData = data;
        if (!data) {
            this.icon.visible = false;
            this.selectbg.visible = false;
            return;
        }
        this.icon.visible = true;
        this.selectbg.visible = this.mIsSelect;
        if (this.isEmptyHanded) {
            this.icon.setTexture(this.key, "empty_handed");
        } else {
            const display = data.display;
            const url = Url.getOsdRes(display.texturePath);
            this.icon.load(url, this, () => {
                this.icon.displayWidth = 34 * this.dpr;
                this.icon.scaleY = this.icon.scaleX;
            });
        }
    }

    public get isSelect() {
        return this.mIsSelect;
    }
    public set isSelect(value: boolean) {
        this.mIsSelect = value;
        this.selectbg.visible = value;
    }
    public get isEmptyHanded() {
        if (this.itemData && this.itemData.id === "empty_handed") return true;
        return false;
    }
}
