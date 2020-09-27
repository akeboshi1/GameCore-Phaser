import { op_client } from "pixelpai_proto";
import { DynamicImage } from "../components/dynamic.image";
import { Handler } from "../../Handler/Handler";
import { Url } from "../../utils/resUtil";
import { BBCodeText, ClickEvent, GameGridTable, NineSliceButton } from "apowophaserui";
import { Font } from "../../utils/font";
import { UIAtlasKey } from "../ui.atals.name";
import { i18n } from "../../i18n";
export class PicGiftPanel extends Phaser.GameObjects.Container {
    private mPropGrid: GameGridTable;
    private curHandheldItem: PicGiftItem;
    private isExtendsGrid: boolean = false;
    private key: string;
    private dpr: number;
    private zoom: number;
    private giftName: Phaser.GameObjects.Text;
    private giftPriceImage: DynamicImage;
    private giftValue: Phaser.GameObjects.Text;
    private sendButton: NineSliceButton;
    private giftDescr: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, dpr: number, zoom: number) {
        super(scene, x, y);
        this.key = key;
        this.dpr = dpr;
        this.zoom = zoom;
        this.setSize(width, height);
        this.init();
        this.setGiftDatas();
    }
    public resize() {
        if (this.mPropGrid) this.mPropGrid.resetMask();
    }
    public destroy() {
        if (this.mPropGrid) {
            this.mPropGrid.destroy();
        }
        super.destroy();
    }
    public hide() {
        this.visible = false;
    }
    public show() {
        this.visible = true;
    }
    public setGiftDatas() {
        this.mPropGrid.setItems(new Array(60));
        this.giftName.text = "某某某礼物某某某";
        this.giftPriceImage.x = this.giftName.x + this.giftName.width + 5 * this.dpr + this.giftPriceImage.width * 0.5;
        this.giftValue.text = 100 + "";
        this.giftValue.x = this.giftPriceImage.x + this.giftPriceImage.width * 0.5 + 5 * this.dpr;
        this.giftValue.text = "热度值10，赠送666个可以触发世界喇叭！";
    }

    protected init() {
        const mBackground = this.scene.make.graphics(undefined, false);
        mBackground.fillStyle(0x333333, 0.5);
        mBackground.fillRect(-this.width * 0.5, -this.height * 0.5, this.width, this.height);
        this.add(mBackground);
        const propFrame = this.scene.textures.getFrame(UIAtlasKey.common2Key, "equp_bg");
        const cellWidth = propFrame.width + 10 * this.dpr;
        const cellHeight = propFrame.height + 10 * this.dpr;
        const propGridConfig = {
            x: 0,
            y: -this.height * 0.5 + 60 * this.dpr,
            table: {
                width: this.width - 20 * this.dpr,
                height: 120 * this.dpr,
                columns: 2,
                cellWidth,
                cellHeight,
                reuseCellContainer: true,
                cellOriginX: 0.5,
                cellOriginY: 0.5,
                zoom: this.zoom,
                mask: false
            },
            scrollMode: 1,
            clamplChildOY: false,
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new PicGiftItem(scene, 0, 0, this.key, this.dpr);
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
        this.giftName = this.scene.make.text({
            x: -this.width * 0.5 + 10 * this.dpr, y: this.mPropGrid.y + this.mPropGrid.height * 0.5 - 0 * this.dpr, text: "",
            style: { fontSize: 16 * this.dpr, bold: true, fontFamily: Font.DEFULT_FONT, color: "#FFD248" }
        }).setOrigin(0, 0.5);
        this.add(this.giftName);
        this.giftPriceImage = new DynamicImage(this.scene, 0, this.giftName.y);
        this.giftPriceImage.setTexture(UIAtlasKey.commonKey, "iv_coin");
        this.add(this.giftPriceImage);
        this.giftValue = this.scene.make.text({
            x: 0, y: this.giftName.y, text: "",
            style: { fontSize: 16 * this.dpr, bold: true, fontFamily: Font.DEFULT_FONT, color: "#FFD248" }
        }).setOrigin(0, 0.5);
        this.add(this.giftValue);
        this.sendButton = new NineSliceButton(this.scene, 0, 0, 95 * this.dpr, 36 * this.dpr, UIAtlasKey.commonKey, "yellow_btn_normal_s", i18n.t("chat.givegift"), this.dpr, this.scale, {
            left: 8 * this.dpr,
            top: 8 * this.dpr,
            right: 8 * this.dpr,
            bottom: 10 * this.dpr
        });
        this.add(this.sendButton);
        this.sendButton.on(String(ClickEvent.Tap), this.onSendHandler, this);
        this.giftDescr = this.scene.make.text({
            x: this.giftName.x, y: this.giftName.y + this.giftName.height * 0.5, text: "",
            style: { fontSize: 16 * this.dpr, bold: true, fontFamily: Font.DEFULT_FONT, color: "#999999" }
        }).setOrigin(0, 0.5);
        this.add(this.giftDescr);
    }

    private onSelectItemHandler(item: PicGiftItem) {
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

    private onSendHandler() {

    }
}

class PicGiftItem extends Phaser.GameObjects.Container {
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
        this.bg = this.scene.make.image({ key: UIAtlasKey.common2Key, frame: "equp_bg" });
        this.selectbg = this.scene.make.image({ key: UIAtlasKey.common2Key, frame: "selected_icon_bg" });
        this.icon = new DynamicImage(scene, 0, 0);
        this.add([this.bg, this.selectbg, this.icon]);
        this.setSize(this.selectbg.width, this.selectbg.height);
        this.isSelect = false;
    }

    public setItemData(data: op_client.CountablePackageItem) {

        // this.itemData = data;
        // if (!data) {
        //     this.icon.visible = false;
        //     this.selectbg.visible = false;
        //     return;
        // }
        // this.icon.visible = true;
        // this.selectbg.visible = this.mIsSelect;
        // if (this.isEmptyHanded) {
        //     this.icon.setTexture(this.key, "empty_handed");
        // } else {
        //     const display = data.display;
        //     const url = Url.getOsdRes(display.texturePath);
        //     this.icon.load(url, this, () => {
        //         this.icon.displayWidth = 34 * this.dpr;
        //         this.icon.scaleY = this.icon.scaleX;
        //     });
        // }
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
