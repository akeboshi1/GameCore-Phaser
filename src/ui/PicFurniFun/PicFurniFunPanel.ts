import { WorldService } from "../../game/world.service";
import { Font } from "../../utils/font";
import { DynamicImage } from "../components/dynamic.image";
import { op_client, op_gameconfig } from "pixelpai_proto";
import { BasePanel } from "../components/BasePanel";
import { Url, Coin } from "../../utils/resUtil";
import { i18n } from "../../i18n";
import { BBCodeText, Button, NineSlicePatch } from "../../../lib/rexui/lib/ui/ui-components";
import { GameScroller } from "../../../lib/rexui/lib/ui/scroller/GameScroller";
import { UIAtlasName, UIAtlasKey } from "../ui.atals.name";
import { NineSliceButton } from "../../../lib/rexui/lib/ui/button/NineSliceButton";
export class PicFurniFunPanel extends BasePanel {
    private key: string = "furni_unlock";
    private confirmBtn: NineSliceButton;
    private blackGraphic: Phaser.GameObjects.Graphics;
    private bg: Phaser.GameObjects.Image;
    private bg1: Phaser.GameObjects.Image;
    private bgicon: Phaser.GameObjects.Image;
    private titleimage: Phaser.GameObjects.Image;
    private titleName: Phaser.GameObjects.Text;
    private icon: DynamicImage;
    private materialCon: Phaser.GameObjects.Container;
    private materialGameScroll: GameScroller;
    private content: Phaser.GameObjects.Container;
    private closeBtn: Phaser.GameObjects.Image;
    private materialTipsCon: Phaser.GameObjects.Container;
    private materialTipsDes: BBCodeText;
    private tipsbg: NineSlicePatch;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        this.scale = 1;
    }

    resize(w: number, h: number) {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        super.resize(width, height);
        this.blackGraphic.clear();
        this.blackGraphic.fillStyle(0, 0.66);
        this.blackGraphic.fillRect(0, 0, width / this.scale, height / this.scale);
        this.content.x = width / 2;
        this.content.y = height / 2;
        this.setSize(width * this.scale, height * this.scale);
        this.materialGameScroll.refreshMask();
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
        this.setInteractive();
        this.addListen();
        this.updateData();
    }

    addListen() {
        if (!this.mInitialized) return;
        this.confirmBtn.on("click", this.onConfirmBtnClick, this);
        this.closeBtn.on("pointerup", this.OnClosePanel, this);
    }

    removeListen() {
        if (!this.mInitialized) return;
        this.confirmBtn.off("click", this.onConfirmBtnClick, this);
        this.closeBtn.on("pointerup", this.OnClosePanel, this);
    }

    preload() {
        this.addAtlas(this.key, "furni_unlock/furni_unlock.png", "furni_unlock/furni_unlock.json");
        this.addAtlas(UIAtlasKey.commonKey, UIAtlasName.common + ".png", UIAtlasName.common + ".json");
        super.preload();
    }

    init() {
        const width = this.cameraWidth;
        const height = this.cameraHeight;
        this.blackGraphic = this.scene.make.graphics(undefined, false);
        this.blackGraphic.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
        this.add(this.blackGraphic);
        this.content = this.scene.make.container(undefined, false);
        this.add(this.content);
        this.bg = this.scene.make.image({ key: this.key, frame: "bg" });
        this.bg1 = this.scene.make.image({ key: this.key, frame: "bg_1" });
        this.bgicon = this.scene.make.image({ key: this.key, frame: "bg_f" });
        const posY = -this.bg.height * 0.5;
        this.bg1.y = posY + this.bg1.height * 0.5 + 5 * this.dpr;
        this.bgicon.y = posY + this.bgicon.height * 0.5 + 30 * this.dpr;
        this.content.add([this.bg, this.bg1, this.bgicon]);
        this.titleimage = this.scene.make.image({ x: 0, y: posY + 5 * this.dpr, key: this.key, frame: "title" }, false);
        const mfont = `bold ${15 * this.dpr}px Source Han Sans`;
        this.titleName = this.scene.make.text({
            x: 0, y: this.titleimage.y + 2 * this.dpr, text: "沙滩躺椅",
            style: { font: mfont, color: "#905B06" }
        }).setOrigin(0.5, 0.5);
        this.closeBtn = this.scene.make.image({ x: this.bg.width * 0.5 - this.dpr * 5, y: posY + this.dpr * 5, key: UIAtlasKey.commonKey, frame: "close" }).setScale(1.3);
        this.closeBtn.setInteractive();
        this.content.add([this.titleimage, this.titleName, this.closeBtn]);
        this.icon = new DynamicImage(this.scene, 0, this.bgicon.y);
        this.content.add(this.icon);
        const materialConWdith = 360 * this.dpr, materialConHeight = 92 * this.dpr;
        this.materialCon = this.scene.make.container(undefined, false).setSize(materialConWdith, materialConHeight);
        this.content.add(this.materialCon);
        this.materialCon.setPosition(0, 50 * this.dpr);
        const materialTitle = this.scene.make.text({
            x: 0,
            y: -materialConHeight * 0.5 + 12 * this.dpr,
            text: i18n.t("furni_unlock.needMaterials"),
            style: {
                color: "#253FCA",
                fontSize: 13 * this.dpr,
                fontFamily: Font.DEFULT_FONT,
                wordWrap: {
                    width: 90 * this.dpr,
                    useAdvancedWrap: true
                }
            }
        }, false).setOrigin(0.5);
        const materialLine = this.scene.make.image({ key: this.key, frame: "sourcelist_title" });
        const materialLine2 = this.scene.make.image({ key: this.key, frame: "sourcelist_title" });
        const linePosx = -materialTitle.width * 0.5 - materialLine.width * 0.5 - 10 * this.dpr;
        materialLine.setPosition(linePosx, materialTitle.y);
        materialLine2.setPosition(-linePosx, materialTitle.y).rotation = -Math.PI;
        this.materialCon.add([materialTitle, materialLine, materialLine2]);
        this.materialGameScroll = new GameScroller(this.scene, {
            x: 0,
            y: 5 * this.dpr,
            width: 240 * this.dpr,
            height: 90 * this.dpr,
            zoom: this.scale,
            align: 2,
            orientation: 1,
            space: 20 * this.dpr,
            valuechangeCallback: undefined,
            celldownCallBack: (gameobject) => {
                this.materialTipsCon.visible = true;
                this.onMaterialItemHandler(gameobject);
            },
            cellupCallBack: (gameobject) => {
                this.materialTipsCon.visible = false;
            }
        });
        this.materialCon.add(this.materialGameScroll);
        this.materialTipsCon = this.scene.make.container(undefined, false).setPosition(0, -60 * this.dpr);
        this.materialTipsCon.visible = false;
        this.materialCon.add(this.materialTipsCon);
        const tipsWidth = 121 * this.dpr;
        const tipsHeight = 46 * this.dpr;
        const tipsbg = new NineSlicePatch(this.scene, 0, 0, tipsWidth, tipsHeight, UIAtlasKey.commonKey, "tips_bg", {
            left: 20 * this.dpr,
            top: 20 * this.dpr,
            right: 20 * this.dpr,
            bottom: 20 * this.dpr
        });
        tipsbg.setPosition(26 * this.dpr, -tipsHeight * 0.5);
        this.tipsbg = tipsbg;
        const tipsText = new BBCodeText(this.scene, -28 * this.dpr, -tipsHeight + 60* this.dpr, "微软我让他委任他为回复", {
            color: "#333333",
            fontSize: 13 * this.dpr,
            fontFamily: Font.DEFULT_FONT,
            wrap: {
                width: 110*this.dpr,
                mode:"string"
            }
        }).setOrigin(0);

        this.materialTipsDes = tipsText;
        this.materialTipsCon.add([tipsbg, tipsText]);

        this.confirmBtn = new NineSliceButton(this.scene, 0, -posY - 30 * this.dpr, 100 * this.dpr, 40 * this.dpr, UIAtlasKey.commonKey, "yellow_btn_over", i18n.t("furni_unlock.unlock"), this.dpr, this.scale, {
            left: 20,
            top: 20,
            right: 20,
            bottom: 20
        });
        this.confirmBtn.setTextStyle({
            color: "#976400",
            fontSize: 16 * this.dpr,
            fontFamily: Font.DEFULT_FONT
        });
        this.content.add(this.confirmBtn);
        this.resize(0, 0);
        super.init();
    }

    destroy() {
        if (this.confirmBtn) this.confirmBtn.destroy();
        this.confirmBtn = null;
        super.destroy();
    }

    updateData() {
        const data = this.mShowData;
        // const url = Url.getOsdRes(data.display.texturePath);
        // this.icon.load(url, this, () => {
        //     this.icon.scale = this.dpr * this.scale;
        // });
        this.setMaterialItems(data);
    }

    private setMaterialItems(datas: op_client.ICountablePackageItem[]) {
        const len = 20;// datas.length;
        const zoom = this.scale;
        this.materialGameScroll.clearItems();
        for (let i = 0; i < len; i++) {
            const item = new MaterialItem(this.scene, this.key, this.dpr, zoom);
            item.y = 0;
            //    item.setItemData(datas[i]);
            // item.setData("itemData", datas[i]);
            this.materialGameScroll.addItem(item);
        }
        this.materialGameScroll.Sort();
    }

    private onSelectItemHandler(data: op_client.ICountablePackageItem) {
    }

    private onConfirmBtnClick(pointer: Phaser.Input.Pointer) {
        if (!this.checkPointerDis(pointer)) return;
        this.emit("close");
    }
    private OnClosePanel() {
        this.emit("close");
    }
    private checkPointerDis(pointer: Phaser.Input.Pointer) {
        if (!this.mWorld) return true;
        return Math.abs(pointer.downX - pointer.upX) < 10 * this.mWorld.uiRatio * this.mWorld.uiScale &&
            Math.abs(pointer.downY - pointer.upY) < 10 * this.mWorld.uiRatio * this.mWorld.uiScale;
    }
    private onMaterialItemHandler(item: MaterialItem) {
        const pos = item.getWorldTransformMatrix();
        this.materialTipsCon.x = pos.tx - this.scaleWidth * 0.5;
        this.materialTipsDes.text = this.getDesText(item.itemData);
        const tipsHeight = this.materialTipsDes.height + 20 * this.dpr;
        const tipsWidth = this.tipsbg.width;
        this.tipsbg.resize(tipsWidth, tipsHeight);
        this.tipsbg.y = -this.tipsbg.height * 0.5;
        this.materialTipsDes.y = -tipsHeight + 10 * this.dpr;
    }
    private getDesText(data: op_client.ICountablePackageItem) {
        if (!data) data = <any>{ "sellingPrice": true, tradable: false };
        let text: string = "";
        let source = i18n.t("furni_unlock.source");
        source += "微软微软他特瑞特也让他";// data.source;
        source = `[stroke=#333333][color=#333333]${source}[/color][/stroke]`;
        text += source + "\n";
        if (data.sellingPrice) {
            let price = i18n.t("furni_unlock.sold");
            price += "5222银币";// data.sellingPrice.price + Coin.getName(data.sellingPrice.coinType);
            price = `[stroke=#333333][color=#333333]${price}[/color][/stroke]`;
            text += price + "\n";
        }
        if (!data.tradable) {
            let trade = i18n.t("furni_unlock.notrading");
            trade = `[stroke=#333333][color=#ff0000]*${trade}[/color][/stroke]`;
            text += trade;
        }
        return text;
    }

}

class MaterialItem extends Phaser.GameObjects.Container {
    public itemData: op_client.ICountablePackageItem;
    private readonly dpr: number;
    private readonly key: string;
    private readonly zoom: number;
    private itemIcon: DynamicImage;
    private itemCount: BBCodeText;
    constructor(scene: Phaser.Scene, key: string, dpr: number, zoom: number) {
        super(scene);
        this.dpr = dpr;
        this.key = key;
        this.zoom = zoom;
        const bg = this.scene.make.image({ key: this.key, frame: "bg_m" });
        this.itemIcon = new DynamicImage(scene, 0, 0);
        this.itemCount = new BBCodeText(this.scene, 0, 15 * dpr, "10/20", { color: "#000000" })
            .setOrigin(0.5).setFontSize(11 * dpr).setFontFamily(Font.DEFULT_FONT);
        this.add([bg, this.itemIcon, this.itemCount]);
        this.setSize(bg.width, bg.height);
        this.itemCount.y = this.height * 0.5 + 10 * dpr;
    }
    public setItemData(data: op_client.ICountablePackageItem) {
        this.itemData = data;
        this.itemCount.text = this.getCountText(data.count, data.neededCount);
        const url = Url.getOsdRes(data.display.texturePath);
        this.itemIcon.load(url, this, () => {
            this.itemIcon.scale = this.dpr * this.zoom;
            this.itemIcon.setPosition(0, 0);
        });
    }

    private getCountText(count: number, needcount: number) {
        const color = (count >= needcount ? "#000000" : "#ff0000");
        const text = `[stroke=${color}][color=${color}]${count}[/color][/stroke]/` + needcount;
        return text;
    }
}