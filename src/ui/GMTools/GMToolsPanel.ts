import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { Button } from "../../../lib/rexui/lib/ui/button/Button";
import { UIAtlasKey, UIAtlasName } from "../ui.atals.name";
import { GameGridTable } from "../../../lib/rexui/lib/ui/gridtable/GameGridTable";
import { GridTableConfig } from "../../../lib/rexui/lib/ui/gridtable/GridTableConfig";
import { CoreUI } from "../../../lib/rexui/lib/ui/interface/event/MouseEvent";

export class GMToolsPanel extends BasePanel {
    private background: Phaser.GameObjects.Graphics;
    private buttons: Phaser.GameObjects.Sprite[];
    private gridtable: GameGridTable;
    private closeBtn: Button;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
    }

    public show(param?: any) {
        super.show(param);
        if (this.mInitialized) {
            this.showButtons();
        }
    }

    public addListen() {
        if (!this.mInitialized) return;
        this.closeBtn.on(CoreUI.MouseEvent.Tap, this.onCloseHandler, this);
    }

    public removeListen() {
        if (!this.mInitialized) return;
        this.closeBtn.off(CoreUI.MouseEvent.Tap, this.onCloseHandler, this);
    }

    public resize() {
        const {width, height} = this.scene.cameras.main;
        this.setSize(width, height);
        this.closeBtn.x = (width - this.closeBtn.width) * 0.5 - 16 * this.dpr;
        this.closeBtn.y = -(height - this.closeBtn.height) * 0.5 + 16 * this.dpr;

        this.background.clear();
        this.background.fillStyle(0x0, 0.6);
        this.background.fillRect(-width * 0.5, -height * 0.5, width, height);
        this.background.setInteractive();

        this.x = width * 0.5;
        this.y = height * 0.5;
        this.gridtable.resetMask();
    }

    protected preload() {
        this.addAtlas(UIAtlasKey.commonKey, UIAtlasName.commonUrl + ".png", UIAtlasName.commonUrl + ".json");
        super.preload();
    }

    protected init() {
        const {width, height} = this.scene.cameras.main;
        this.setSize(width, height);
        this.background = this.scene.make.graphics(undefined, false);

        const w = 91 * this.dpr;
        const h = 46 * this.dpr;
        const graphics = this.scene.make.graphics(undefined, false);
        graphics.fillStyle(0x008CBA);
        graphics.fillRoundedRect(0, 0, w, h);
        graphics.generateTexture("gmtools_btn", w, h);
        graphics.destroy();

        const capW = 112 * this.dpr;
        const capH = 54 * this.dpr;
        const tableConfig: GridTableConfig = {
            x: 0,
            y: 0,
            table: {
                width,
                height: height - 60 * this.dpr,
                columns: 3,
                cellWidth: w,
                cellHeight: h,
                reuseCellContainer: true,
                zoom: this.scale,
                cellPadX: 10 * this.dpr,
                cellPadY: 10 * this.dpr
              },
            scrollMode: 0,
            clamplChildOY: false,
            createCellContainerCallback: (cell, cellContainer) => {
                const item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new Item(this.scene, 91 * this.dpr, 46 * this.dpr, this.dpr);
                    cellContainer.on("targetUI", this.onTargetUIHandler, this);
                }
                cellContainer.setSize(cell.width, cell.height);
                cellContainer.setData({ item });
                cellContainer.setItemData(item);
                return cellContainer;
            }
        };
        // 830
        // 1140
        this.gridtable = new GameGridTable(this.scene, tableConfig);
        this.gridtable.layout();

        this.closeBtn = new Button(this.scene, UIAtlasKey.commonKey, "close");
        this.add([this.background, this.gridtable, this.closeBtn]);
        super.init();

        this.resize();
    }

    protected showButtons() {
        if (!this.mShowData || this.mShowData.length < 1) {
            return;
        }
        const data = this.showData[0];
        const buttons = data.button;
        if (buttons.length < 1) {
            return;
        }
        this.gridtable.setItems(buttons);
        this.buttons = [];
        this.add(this.buttons);
    }

    private onTargetUIHandler(id: number) {
        if (!this.mShowData || this.mShowData.length < 1) {
            return;
        }
        this.emit("targetUI", this.mShowData[0].id, id);
    }

    private onCloseHandler() {
        this.emit("close");
    }
}

class Item extends Phaser.GameObjects.Container {
    private btn: Button;
    private item: any;

    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number) {
        super(scene);
        this.btn = new Button(this.scene, "gmtools_btn", "", "", "1");
        this.btn.on(CoreUI.MouseEvent.Tap, this.onBtnHandler, this);
        this.btn.setTextStyle({
            fontSize: 12 * dpr
        });
        this.add(this.btn);
    }

    public setItemData(item: any) {
        this.item = item;
        this.btn.setText(item.text);
    }

    private onBtnHandler() {
        if (this.item) this.emit("targetUI", this.item.id);
    }
}
