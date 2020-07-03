import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { i18n } from "../../i18n";
import { op_client, op_def } from "pixelpai_proto";
import { Font } from "../../utils/font";
import { GameGridTable } from "../../../lib/rexui/lib/ui/gridtable/GameGridTable";
import { GridTableConfig } from "../../../lib/rexui/lib/ui/gridtable/GridTableConfig";
import { DynamicImage } from "../components/dynamic.image";
import { Handler } from "../../Handler/Handler";
import { Url } from "../../utils/resUtil";
import { Logger } from "../../utils/log";
export class PicHandheldPanel extends BasePanel {
    private readonly key = "pichandheldpanel";
    private gridContent: Phaser.GameObjects.Container;
    private handeldItem: HandheldEqiped;
    private mPropGrid: GameGridTable;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        this.scale = 1;
    }

    public addListen() {
        if (!this.mInitialized) return;
    }

    public removeListen() {
        if (!this.mInitialized) return;
    }

    public resize(w: number, h: number) {
        const scale = this.scale;
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.setSize(width, height);

        this.mPropGrid.resetMask();
    }

    public destroy() {
        if (this.mPropGrid) {
            this.mPropGrid.destroy();
        }
        super.destroy();
    }
    public setEqipedDatas(dtas: any[]) {
        const arr = new Array<number>(60);
        this.mPropGrid.setItems(arr);
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
        this.handeldItem = new HandheldEqiped(this.scene, 0, 0, this.key, this.dpr);
        this.gridContent.add(this.handeldItem);
        const propFrame = this.scene.textures.getFrame(this.key, "equp_bg");
        const cellWidth = propFrame.width + 10 * this.dpr;
        const cellHeight = propFrame.height + 10 * this.dpr;
        const propGridConfig: GridTableConfig = {
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
                    this.gridContent.add(cellContainer);
                }
                cellContainer.setItemData(item);
                return cellContainer;
            },
        };
        this.mPropGrid = new GameGridTable(this.scene, propGridConfig);
        this.mPropGrid.layout();
        this.mPropGrid.on("cellTap", (cell) => {
            const data = cell.getData("item");
            if (data) {
                this.onSelectItemHandler(data);
            }
            Logger.getInstance().log(cell);
        });
        this.gridContent.add(this.mPropGrid.table);
        this.resize(0, 0);
        super.init();
        this.setEqipedDatas(undefined);
    }

    private onSelectItemHandler(prop: op_client.IMarketCommodity) {
        Logger.getInstance().log("onSelectItemHandler");
    }
}

class HandheldItem extends Phaser.GameObjects.Container {
    public itemData: any;
    public bg: Phaser.GameObjects.Image;
    public selectbg: Phaser.GameObjects.Image;
    public icon: DynamicImage;
    constructor(scene: Phaser.Scene, x: number, y: number, key: string, dpr: number) {
        super(scene, x, y);
        this.bg = this.scene.make.image({ key, frame: "equp_bg" });
        this.selectbg = this.scene.make.image({ key, frame: "click_bg" });
        this.icon = new DynamicImage(scene, 0, 0);
        this.add([this.bg, this.selectbg, this.icon]);
        this.setSize(this.selectbg.width, this.selectbg.height);
    }

    public setItemData(data) {
        this.itemData = data;
    }
}

class HandheldEqiped extends Phaser.GameObjects.Container {
    public itemData: any;
    public bg: Phaser.GameObjects.Image;
    public icon: DynamicImage;
    public shortcutbg: Phaser.GameObjects.Image;
    public shortcutIcon: Phaser.GameObjects.Image;
    public shortcutCon: Phaser.GameObjects.Container;
    private key: string;
    private clickHandler: Handler;
    constructor(scene: Phaser.Scene, x: number, y: number, key: string, dpr: number) {
        super(scene, x, y);
        this.key = key;
        this.bg = this.scene.make.image({ key, frame: "button_h" });
        this.shortcutCon = this.scene.make.container(undefined, false);
        this.shortcutbg = this.scene.make.image({ key, frame: "superscript_h" });
        this.shortcutIcon = this.scene.make.image({ key, frame: "hand" });
        this.shortcutCon.add([this.shortcutbg, this.shortcutIcon]);
        this.shortcutCon.setSize(31 * dpr, 31 * dpr);
        this.shortcutbg.x = -this.shortcutCon.width * 0.5 + this.shortcutbg.width * 0.5;
        this.shortcutbg.y = this.shortcutCon.height * 0.5 - this.shortcutbg.height * 0.5;
        this.shortcutIcon.x = this.shortcutbg.x;
        this.shortcutIcon.y = this.shortcutbg.y;
        this.icon = new DynamicImage(scene, 0, 0);
        this.shortcutCon.on("pointerup", this.onShortcutHandler, this);
        this.add([this.bg, this.icon, this.shortcutCon]);
        this.setSize(this.bg.width, this.bg.height);
        this.setInteractive();
        this.on("pointerup", this.onClickHandler, this);
    }

    public normal() {
        this.bg.setFrame("button_h");
    }
    public waiting() {
        this.bg.setFrame("button_t");
    }
    public setItemData(data) {
        this.itemData = data;
        if (data) {
            this.showShortcut();
            const url = Url.getOsdRes("");
            this.icon.load(url, this, () => {

            });

        } else {
            this.hideShortcut();
            this.icon.setTexture(this.key, "empty_handed");
        }

    }

    public setClickHandler(handler: Handler) {
        this.clickHandler = handler;
    }

    public setChildAlpha(alpha: number) {
        this.bg.setAlpha(alpha);
        this.icon.setAlpha(alpha);
        this.shortcutbg.setAlpha(alpha);
        this.shortcutIcon.setAlpha(alpha);
    }

    private onShortcutHandler() {

    }

    private onClickHandler() {
        if (this.clickHandler) this.clickHandler.runWith(this.itemData);
    }

    private hideShortcut() {
        this.shortcutCon.visible = false;
        this.shortcutCon.setInteractive();
    }

    private showShortcut() {
        this.shortcutCon.visible = false;
        this.shortcutCon.disableInteractive();
    }

}
