import { NineSliceButton, GameGridTable, ClickEvent } from "apowophaserui";
import { BasePanel, DynamicImage, NinePatch, UiManager } from "gamecoreRender";
import { UIAtlasKey, UIAtlasName } from "../../../res";
import { ICountablePackageItem } from "../../../structure";
import { ModuleName, RENDER_PEER } from "structure";
import { Font, i18n, Url } from "utils";
export class PicaMineSettlePanel extends BasePanel {
    private confirmBtn: NineSliceButton;
    private mPropGrid: GameGridTable;
    private blackGraphic: Phaser.GameObjects.Graphics;
    private bg: NinePatch;
    private titleimage: Phaser.GameObjects.Image;
    private titleName: Phaser.GameObjects.Text;
    constructor(uiManager: UiManager) {
        super(uiManager.scene, uiManager.render);
        this.key = ModuleName.PICAMINESETTLE_NAME;
    }

    resize(w: number, h: number) {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        super.resize(width, height);
        this.bg.x = width / 2;
        this.bg.y = height / 2;
        this.titleimage.x = width / 2;
        this.titleimage.y = this.bg.y - this.bg.displayHeight / 2 - 8 * this.dpr;
        this.confirmBtn.x = width / 2;
        this.confirmBtn.y = this.bg.y + 100 * this.dpr;
        this.titleName.x = width / 2;
        this.titleName.y = this.titleimage.y + 32 * this.dpr;
        this.blackGraphic.clear();
        this.blackGraphic.fillStyle(0, 0.66);
        this.blackGraphic.fillRect(0, 0, width, height);
        this.mPropGrid.refreshPos(width / 2, this.bg.y - 2 * this.dpr);
        this.mPropGrid.resetMask();
        this.setSize(width, height);
    }

    show(param?: any) {
        this.mShowData = param;
        this.refreshData();
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
        this.setInteractive();
        this.addListen();
    }

    addListen() {
        if (!this.mInitialized) return;
        this.confirmBtn.on(String(ClickEvent.Tap), this.onConfirmBtnClick, this);
    }

    removeListen() {
        if (!this.mInitialized) return;
        this.confirmBtn.off(String(ClickEvent.Tap), this.onConfirmBtnClick, this);
    }

    preload() {
        this.addAtlas(this.key, "minesettle/settlement.png", "minesettle/settlement.json");
        this.addAtlas(UIAtlasKey.commonKey, UIAtlasName.commonUrl + ".png", UIAtlasName.commonUrl + ".json");
        super.preload();
    }

    init() {
        const width = this.cameraWidth;
        const height = this.cameraHeight;
        this.bg = new NinePatch(this.scene, 0, 0, 293 * this.dpr, 260 * this.dpr, this.key, "bg", {
            left: 10,
            top: 10,
            right: 10,
            bottom: 10
        });
        this.blackGraphic = this.scene.make.graphics(undefined, false);
        this.blackGraphic.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
        const propFrame = this.scene.textures.getFrame(this.key, "icon_test");
        const capW = (propFrame.width + 20 * this.dpr);
        const capH = (propFrame.height + 25 * this.dpr);
        const config = {
            x: 0,
            y: 0,
            table: {
                width: 280 * this.dpr,
                height: 160 * this.dpr,
                columns: 5,
                cellWidth: capW,
                cellHeight: capH,
                reuseCellContainer: true,
                cellOriginX: 0,
                cellOriginY: 0,
                cellPadX: 18 * this.dpr,
                zoom: this.scale
            },
            // background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, .2),
            clamplChildOY: false,
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene, item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new MineSettleItem(scene, this.dpr);
                }
                cellContainer.setData({ item });
                cellContainer.setItemData(item);
                return cellContainer;
            },
        };
        this.mPropGrid = new GameGridTable(this.scene, config);
        this.mPropGrid.layout();
        this.mPropGrid.on("cellTap", (cell) => {
            const data = cell.itemData;
            if (data) {
                this.onSelectItemHandler(data);
            }
        });
        this.titleimage = this.scene.make.image({ x: 0, y: -this.bg.displayWidth * 0.5 - 10 * this.dpr, key: this.key, frame: "title" }, false);
        this.titleimage.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.titleName = this.scene.make.text({
            x: 0, y: this.titleimage.y + 32 * this.dpr, text: i18n.t("minesettle.settle"),
            style: { fontSize: 15 * this.dpr, fontFamily: Font.DEFULT_FONT }
        }).setOrigin(0.5, 0.5);
        this.confirmBtn = new NineSliceButton(this.scene, 0, 100 * this.dpr, 90 * this.dpr, 40 * this.dpr, UIAtlasKey.commonKey, "yellow_btn", i18n.t("minesettle.savebag"), this.dpr, this.scale, {
            left: 10 * this.dpr,
            top: 10 * this.dpr,
            right: 10 * this.dpr,
            bottom: 10 * this.dpr
        });
        this.confirmBtn.setTextStyle({
            color: "#976400",
            fontSize: 16 * this.dpr,
            fontFamily: Font.DEFULT_FONT
        });
        this.add([this.blackGraphic, this.bg, this.titleimage, this.titleName, this.confirmBtn]);
        this.add(this.mPropGrid);
        this.resize(0, 0);
        super.init();
    }

    setMineSettlePacket(content: any) {// op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_MINING_MODE_SHOW_REWARD_PACKAGE
        if (this.mInitialized) {
            this.mPropGrid.setItems(content.items);
        }
    }

    destroy() {
        if (this.mPropGrid) this.mPropGrid.destroy();
        if (this.confirmBtn) this.confirmBtn.destroy();
        this.mPropGrid = null;
        this.confirmBtn = null;
        super.destroy();
    }

    private refreshData() {
        const settleData = this.getData("settleData");
        if (settleData) this.setMineSettlePacket(settleData);
    }

    private onSelectItemHandler(data: any) {// op_client.ICountablePackageItem
    }

    private onConfirmBtnClick(pointer: Phaser.Input.Pointer) {
        if (!this.checkPointerDis(pointer)) return;
        this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_hide");
    }

    private checkPointerDis(pointer: Phaser.Input.Pointer) {
        if (!this.render) return true;
        return Math.abs(pointer.downX - pointer.upX) < 10 * this.render.uiRatio * this.render.uiScale &&
            Math.abs(pointer.downY - pointer.upY) < 10 * this.render.uiRatio * this.render.uiScale;
    }

}

class MineSettleItem extends Phaser.GameObjects.Container {
    public itemData: any;// op_client.ICountablePackageItem
    private itemCount: Phaser.GameObjects.Text;
    private icon: DynamicImage;
    private dpr: number;
    constructor(scene: Phaser.Scene, dpr: number) {
        super(scene);
        this.dpr = dpr;
        this.icon = new DynamicImage(scene, 0, 0);
        this.itemCount = this.scene.make.text({
            text: "600",
            style: {
                fontSize: 18,
                fontFamily: Font.DEFULT_FONT
            }
        }, false);
        this.itemCount.setOrigin(0.5, 0);
        this.icon.setOrigin(0, 0);
        this.icon.setScale(this.dpr);
        // this.icon.setSize(50, 50);
        this.itemCount.setPosition(0, this.icon.height);
        this.add(this.icon);
        this.add(this.itemCount);
    }
    public setItemData(data: ICountablePackageItem) {// op_client.ICountablePackageItem
        this.itemData = data;
        this.itemCount.setFontSize(this.dpr * 14);
        this.itemCount.text = data.count + "";
        const url = Url.getOsdRes(data.texturePath);
        this.icon.load(url, this, () => {
            ///  this.icon.setDisplaySize(33 * this.dpr, 33 * this.dpr);
            this.icon.setScale(33 * this.dpr / this.icon.width);
            this.icon.setPosition(0, 3 * this.dpr);
            this.itemCount.setPosition(this.icon.displayWidth * 0.5, this.icon.x + this.icon.displayHeight + 3 * this.dpr);
        });
    }
    public destroy() {
        super.destroy();
        if (this.icon) this.icon.destroy();
        if (this.itemCount) this.itemCount.destroy();
        this.itemData = null;
        this.icon = null;
        this.itemCount = null;
        this.scene = null;
    }

}
