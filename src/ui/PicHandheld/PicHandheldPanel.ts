import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { op_client } from "pixelpai_proto";
import { DynamicImage } from "../components/dynamic.image";
import { Handler } from "../../Handler/Handler";
import { Url } from "../../utils/resUtil";
import { GameGridTable } from "apowophaserui";
export class PicHandheldPanel extends BasePanel {
    private readonly key = "pichandheldpanel";
    private gridContent: Phaser.GameObjects.Container;
    private handeldEqiped: HandheldEqiped;
    private mPropGrid: GameGridTable;
    private curHandheldItem: HandheldItem;
    private isExtendsGrid: boolean = false;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
    }

    public resize(w: number, h: number) {
        const scale = this.scale;
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.setSize(width, height);
        this.updateLayout();
        this.isExtendsGrid = false;
    }
    show(param?: any) {
        this.mShowData = param;
        if (this.mPreLoad) return;
        if (!this.mInitialized) {
            this.preload();
            return;
        }
        if (this.mShow) return;
        if (this.soundGroup && this.soundGroup.open) this.playSound(this.soundGroup.open);
        if (!this.mTweening && this.mTweenBoo) {
            this.showTween(true);
        } else {
            this.mShow = true;
        }
        this.addListen();
        this.updateData();
        this.emit("handheldlist");
    }

    hide() {
        this.mShow = false;
        this.removeListen();
    }

    public addListen() {
        if (!this.mInitialized) return;
    }

    public removeListen() {
        if (!this.mInitialized) return;
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
        this.handeldEqiped.setItemData(curr);
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
    protected preload() {
        this.addAtlas(this.key, "hand_equp/hand_equp.png", "hand_equp/hand_equp.json");
        super.preload();
    }

    protected init() {
        if (this.mInitialized) return;
        const w = this.scaleWidth;
        const h = this.scaleHeight;
        this.gridContent = this.scene.make.container(undefined, false);
        this.add(this.gridContent);
        this.gridContent.setSize(w, 150 * this.dpr);
        this.gridContent.x = w * 0.5;
        this.gridContent.y = h - this.gridContent.height * 0.5 - 200 * this.dpr;
        const mBackground = this.scene.make.graphics(undefined, false);
        mBackground.fillStyle(0x333333, 0.5);
        mBackground.fillRect(-w * 0.5, -this.gridContent.height * 0.5, w, 150 * this.dpr);
        this.gridContent.add(mBackground);
        this.handeldEqiped = new HandheldEqiped(this.scene, 0, 0, this.key, this.dpr);
        this.handeldEqiped.setClickHandler(new Handler(this, this.onHandheldEqipedHandler), new Handler(this, this.onShortcutHandler));
        this.add(this.handeldEqiped);
        const propFrame = this.scene.textures.getFrame(this.key, "equp_bg");
        const cellWidth = propFrame.width + 10 * this.dpr;
        const cellHeight = propFrame.height + 10 * this.dpr;
        const propGridConfig = {
            x: 0,
            y: 0,
            table: {
                width: w - 20 * this.dpr,
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
        this.gridContent.add(this.mPropGrid);
        this.resize(0, 0);
        super.init();
    }

    private updateData() {

        this.updateLayout();
    }

    private updateLayout() {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        const x = width - this.handeldEqiped.width * 0.5 - 8 * this.dpr;
        let y = 0;
        this.gridContent.y = height - this.gridContent.height * 0.5;
        if (!this.isExtendsGrid) {
            y = height - this.handeldEqiped.height * 0.5 - 10 * this.dpr;
            this.gridContent.visible = false;
            this.handeldEqiped.waiting();
            if (!this.handeldEqiped.isEmptyHanded)
                this.handeldEqiped.showShortcut();
        } else {
            y = height - this.handeldEqiped.height * 0.5 - this.gridContent.height;
            this.gridContent.visible = true;
            this.mPropGrid.resetMask();
            this.handeldEqiped.normal();
            this.handeldEqiped.hideShortcut();
        }
        this.handeldEqiped.setPosition(x, y);

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

    private onHandheldEqipedHandler(data: any) {
        this.isExtendsGrid = !this.isExtendsGrid;
        if (!this.isExtendsGrid) {
            this.mPropGrid.setItems([]);
            this.gridContent.visible = false;
            this.emit("openeqiped", false);
        } else {
            this.gridContent.visible = true;
            this.emit("handheldlist");
            this.emit("openeqiped", true);
        }
        this.updateLayout();
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

class HandheldEqiped extends Phaser.GameObjects.Container {
    public itemData: op_client.ICountablePackageItem;
    public bg: Phaser.GameObjects.Image;
    public icon: DynamicImage;
    public shortcutbg: Phaser.GameObjects.Image;
    public shortcutIcon: Phaser.GameObjects.Image;
    public shortcutCon: Phaser.GameObjects.Container;
    private key: string;
    private clickHandler: Handler;
    private shortcutHandler: Handler;
    private dpr: number;
    private isExtendsGrid: boolean = false;
    constructor(scene: Phaser.Scene, x: number, y: number, key: string, dpr: number) {
        super(scene, x, y);
        this.key = key;
        this.dpr = dpr;
        this.bg = this.scene.make.image({ key, frame: "button_h" });
        this.shortcutCon = this.scene.make.container(undefined, false);
        this.shortcutbg = this.scene.make.image({ key, frame: "superscript_h" });
        this.shortcutIcon = this.scene.make.image({ key, frame: "hand" });
        this.shortcutCon.add([this.shortcutbg, this.shortcutIcon]);
        const shortcutWidth = 40 * dpr;
        this.shortcutCon.setSize(shortcutWidth, shortcutWidth);
        this.shortcutbg.x = -this.shortcutCon.width * 0.5 + this.shortcutbg.width * 0.5 - 5 * dpr;
        this.shortcutbg.y = this.shortcutCon.height * 0.5 - this.shortcutbg.height * 0.5 + 5 * dpr;
        this.shortcutIcon.x = this.shortcutbg.x;
        this.shortcutIcon.y = this.shortcutbg.y;
        this.icon = new DynamicImage(scene, 0, 0);
        this.icon.setTexture(this.key, "empty_handed");
        this.shortcutCon.on("pointerup", this.onShortcutHandler, this);
        this.add([this.bg, this.icon, this.shortcutCon]);
        this.setSize(this.bg.width, this.bg.height);
        this.setInteractive();
        this.shortcutCon.setPosition(this.width * 0.5 + shortcutWidth * 0.5 - 20 * dpr, -this.height * 0.5 - shortcutWidth * 0.5 + 15 * dpr);
        this.shortcutCon.setInteractive();
        this.on("pointerup", this.onClickHandler, this);
        this.hideShortcut();
    }

    public normal() {
        this.bg.setFrame("button_h");
        this.setChildAlpha(1);
    }
    public waiting() {
        this.bg.setFrame("button_h");
        this.setChildAlpha(0.5);
    }
    public setItemData(data: op_client.ICountablePackageItem) {
        this.itemData = data;
        if (!this.isEmptyHanded) {
            const display = data.display;
            const url = Url.getOsdRes(display.texturePath);
            this.icon.load(url, this, () => {
                this.icon.displayWidth = 24 * this.dpr;
                this.icon.scaleY = this.icon.scaleX;
            });
            if (!this.isExtendsGrid) this.showShortcut();
        } else {
            this.icon.setScale(1);
            this.icon.setTexture(this.key, "empty_handed");
            this.hideShortcut();
        }

    }

    public setClickHandler(cliclhandler: Handler, shortcutHandler: Handler) {
        this.clickHandler = cliclhandler;
        this.shortcutHandler = shortcutHandler;
    }

    public setChildAlpha(alpha: number) {
        this.bg.setAlpha(alpha);
        this.icon.setAlpha(alpha);
        this.shortcutbg.setAlpha(alpha);
        this.shortcutIcon.setAlpha(alpha);
    }
    public hideShortcut() {
        this.shortcutCon.visible = false;
        this.shortcutCon.disableInteractive();
    }

    public showShortcut() {
        this.shortcutCon.visible = true;
        this.shortcutCon.setInteractive();
    }

    public get isCanShowShortcut() {
        if (!this.isEmptyHanded) {
            return true;
        }
        return false;
    }

    public get isEmptyHanded() {
        if (!this.itemData || this.itemData.id === "empty_handed") return true;
        return false;
    }
    private onShortcutHandler() {
        if (this.shortcutHandler) this.shortcutHandler.runWith(this.itemData);
    }

    private onClickHandler() {
        this.isExtendsGrid = !this.isExtendsGrid;
        if (this.clickHandler) this.clickHandler.runWith(this.itemData);
    }

}
