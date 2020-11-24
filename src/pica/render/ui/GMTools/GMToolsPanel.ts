import { Button, ClickEvent, GameGridTable } from "apowophaserui";
import { UIAtlasKey, UIAtlasName } from "picaRes";
import { BasePanel, LabelInput, UiManager } from "gamecoreRender";
import { ModuleName } from "structure";

export class GMToolsPanel extends BasePanel {
    private background: Phaser.GameObjects.Graphics;
    private gridtable: GameGridTable;
    private closeBtn: Button;
    private command: LabelInput;
    private commitBtn: Button;
    constructor(uiManager: UiManager) {
        super(uiManager.scene, uiManager.render);
        this.key = ModuleName.GM_TOOLS_NAME;
    }

    public show(param?: any) {
        super.show(param);
        if (this.mInitialized) {
            this.showButtons();
        }
    }

    public update(param?: any) {
        super.update(param);
        if (this.mInitialized) {
            this.showButtons();
        }
    }

    public addListen() {
        if (!this.mInitialized) return;
        this.command.on("enter", this.onEnterCommandHandler, this);
        this.closeBtn.on(ClickEvent.Tap, this.onCloseHandler, this);
        this.commitBtn.on(ClickEvent.Tap, this.onCommitCmdHandler, this);
    }

    public removeListen() {
        if (!this.mInitialized) return;
        this.command.off("enter", this.onEnterCommandHandler, this);
        this.closeBtn.off(ClickEvent.Tap, this.onCloseHandler, this);
        this.commitBtn.off(ClickEvent.Tap, this.onCommitCmdHandler, this);
    }

    public resize() {
        // const {width, height} = this.scene.cameras.main;
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.setSize(this.scaleWidth, this.scaleHeight);
        this.closeBtn.x = (width - this.closeBtn.width) * 0.5 - 16 * this.dpr;
        this.closeBtn.y = -(height - this.closeBtn.height) * 0.5 + 16 * this.dpr;

        this.background.clear();
        this.background.fillStyle(0x0, 0.6);
        this.background.fillRect(0, 0, width, height);
        this.background.x = -width * 0.5;
        this.background.y = -height * 0.5;
        this.background.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);

        this.command.x = -this.width * 0.5 + 20 * this.dpr;
        this.command.y = -this.height * 0.5 + 60 * this.dpr;

        this.x = this.cameraWidth * 0.5;
        this.y = this.cameraHeight * 0.5;

        this.commitBtn.x = this.command.x + this.command.width + this.commitBtn.width * 0.5 + 16 * this.dpr;
        this.commitBtn.y = this.command.y + this.command.height * 0.5;

        this.gridtable.setSize(this.width,  height - 110 * this.dpr);
        this.gridtable.layout();

        this.gridtable.resetMask();
    }

    protected preload() {
        this.addAtlas(UIAtlasKey.commonKey, UIAtlasName .commonUrl + ".png", UIAtlasName.commonUrl + ".json");
        super.preload();
    }

    protected init() {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.setSize(width, height);
        this.background = this.scene.make.graphics(undefined, false);

        const scale = this.scale;
        const w = width - 30 * this.dpr;
        const h = 46 * this.dpr;

        let graphics = null;
        if (!this.scene.textures.exists("gmtools_btn")) {
            graphics = this.scene.make.graphics(undefined, false);
            graphics.fillStyle(0x008CBA);
            graphics.fillRoundedRect(0, 0, w, h);
            graphics.generateTexture("gmtools_btn", w, h);
        }

        this.command = new LabelInput(this.scene, {
            width: this.width - 110 * this.dpr,
            height: 16 * this.dpr,
            placeholder: "输入命令",
            fontSize: 14 * this.dpr + "px",
            color: "#666666",
        }).setOrigin(0, 0);
        this.command.x = -this.width * 0.5 + 20 * this.dpr;
        this.command.y = -this.height * 0.5 + 60 * this.dpr;
        this.command.createBackground(6 * this.dpr, 10 * this.dpr);

        // const inputBg = this.scene.make.graphics(undefined, false);
        // inputBg.fillStyle(0xFFFFFF);
        // inputBg.fillRoundedRect(this.command.x - 6 * this.dpr, this.command.y - 6 * this.dpr, this.command.width + 12 * this.dpr, this.command.height + 12 * this.dpr, 10 * this.dpr);

        if (!this.scene.textures.exists("gmtools_commit")) {
            graphics.clear();
            graphics.fillStyle(0xaaaaa);
            graphics.fillRoundedRect(0, 0, 50 * this.dpr, 30 * this.dpr);
            graphics.generateTexture("gmtools_commit", 50 * this.dpr, 30 * this.dpr);
            graphics.destroy();
        }

        this.commitBtn = new Button(this.scene, "gmtools_commit", "", "", "提交");
        this.commitBtn.setTextStyle({ fontSize: 12 * this.dpr });

        const capW = w;
        const capH = 54 * this.dpr;
        const tableConfig = {
            x: 0,
            y: 60 * this.dpr,
            table: {
                width,
                height: height - 110 * this.dpr,
                columns: 1,
                cellWidth: width,
                cellHeight: capH,
                reuseCellContainer: true,
                zoom: scale,
                cellPadX: 0,
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
        this.gridtable = new GameGridTable(this.scene, tableConfig);
        this.gridtable.on("cellTap", (cell) => {
            if (cell) {
                const data = cell.item;
                if (data && data.node) {
                    this.onTargetUIHandler(data.node.id);
                }
            }
        });
        this.closeBtn = new Button(this.scene, UIAtlasKey.commonKey, "close");
        this.add([this.background, this.gridtable, this.closeBtn, this.command, this.commitBtn]);
        super.init();

        this.resize();
    }

    protected showButtons() {
        if (!this.mShowData) {
            return;
        }
        const data = this.showData;
        const buttons = data.button;
        if (buttons.length >= 1) {
            this.gridtable.setItems(buttons);
        }

        const inputText = data.inputText;
        if (inputText && inputText.length > 0) {
            this.command.setData({ item: inputText[0] });
        }
    }

    private onTargetUIHandler(id: number) {
        if (!this.mShowData || this.mShowData.length < 1) {
            return;
        }
        this.emit("targetUI", this.mShowData.id, id);
        this.render.renderEmitter(this.key + "_targetUI",  { id: this.mShowData.id, componentId: id } );
        this.command.setBlur();
    }

    private onCloseHandler() {
        this.render.renderEmitter(this.key + "_close" );
        // this.emit("close");
    }

    private onCommitCmdHandler() {
        this.command.setBlur();
        if (!this.mShowData || this.mShowData.length < 1) {
            return;
        }
        const text = this.command.text;
        if (!text) {
            return;
        }
        const item = this.command.getData("item");
        // if (item && item.node) this.emit("targetUI");
        if (item && item.node) {
            this.render.renderEmitter(this.key + "_targetUI",  { id: this.mShowData.id, componentId: item.node.id, text } );
        }
    }

    private onEnterCommandHandler() {
        this.onCommitCmdHandler();
    }
}

class Item extends Phaser.GameObjects.Container {
    private btn: Button;
    private item: any;

    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number) {
        super(scene);
        this.btn = new Button(this.scene, "gmtools_btn", "", "", "1");
        this.btn.on(String(ClickEvent.Tap), this.onBtnHandler, this);
        this.btn.setTextStyle({
            fontSize: 12 * dpr
        });
        this.btn.removeInteractive();
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
