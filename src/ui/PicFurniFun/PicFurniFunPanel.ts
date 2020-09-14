import { WorldService } from "../../game/world.service";
import { Font } from "../../utils/font";
import { DynamicImage } from "../components/dynamic.image";
import { op_client } from "pixelpai_proto";
import { BasePanel } from "../components/BasePanel";
import { Url, Coin } from "../../utils/resUtil";
import { i18n } from "../../i18n";
import { BBCodeText, NineSlicePatch } from "../../../lib/rexui/lib/ui/ui-components";
import { GameScroller } from "../../../lib/rexui/lib/ui/scroller/GameScroller";
import { UIAtlasName, UIAtlasKey } from "../ui.atals.name";
import { NineSliceButton } from "../../../lib/rexui/lib/ui/button/NineSliceButton";
import { DetailDisplay } from "../Market/DetailDisplay";
import { FramesModel } from "../../rooms/display/frames.model";
import I18NextXhrBackend from "i18next-xhr-backend";
export class PicFurniFunPanel extends BasePanel {
    private key: string = "furni_unlock";
    private confirmBtn: NineSliceButton;
    private blackGraphic: Phaser.GameObjects.Graphics;
    private bg: NineSlicePatch;
    private bgicon: Phaser.GameObjects.Image;
    private titleimage: Phaser.GameObjects.Image;
    private titleName: Phaser.GameObjects.Text;
    private mDetailDisplay: DetailDisplay;
    private materialCon: Phaser.GameObjects.Container;
    private materialGameScroll: GameScroller;
    private content: Phaser.GameObjects.Container;
    private closeBtn: Phaser.GameObjects.Image;
    private materialTipsCon: Phaser.GameObjects.Container;
    private materialTipsDes: BBCodeText;
    private selectMaterial: MaterialItem;
    private tipsbg: NineSlicePatch;
    private itemName: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
    }

    resize(w: number, h: number) {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        super.resize(width, height);
        this.blackGraphic.clear();
        this.blackGraphic.fillStyle(0, 0.66);
        this.blackGraphic.fillRect(0, 0, width, height);
        this.content.x = Math.floor(width / 2);
        this.content.y = Math.floor(height / 2);
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
        this.confirmBtn.on("Tap", this.onConfirmBtnClick, this);
        this.closeBtn.on("pointerup", this.OnClosePanel, this);
    }

    removeListen() {
        if (!this.mInitialized) return;
        this.confirmBtn.off("click", this.onConfirmBtnClick, this);
        this.closeBtn.on("pointerup", this.OnClosePanel, this);
    }

    preload() {
        this.addAtlas(this.key, "furni_unlock/furni_unlock.png", "furni_unlock/furni_unlock.json");
        this.addAtlas(UIAtlasKey.commonKey, UIAtlasName.commonUrl + ".png", UIAtlasName.commonUrl + ".json");
        this.addAtlas(UIAtlasKey.common2Key, UIAtlasName.common2Url + ".png", UIAtlasName.common2Url + ".json");
        super.preload();
    }

    init() {
        const width = this.cameraWidth;
        const height = this.cameraHeight;
        this.blackGraphic = this.scene.make.graphics(undefined, false);
        this.blackGraphic.setInteractive(new Phaser.Geom.Rectangle(0, 0, width / this.scale, height / this.scale), Phaser.Geom.Rectangle.Contains);
        this.add(this.blackGraphic);
        this.content = this.scene.make.container(undefined, false);
        const bgwidth = 295 * this.dpr, bgheight = 400 * this.dpr;
        this.content.setSize(bgwidth, bgheight);
        this.add(this.content);
        this.bg = new NineSlicePatch(this.scene, 0, 0, bgwidth, bgheight, UIAtlasKey.common2Key, "bg", {
            left: 20 * this.dpr,
            top: 20 * this.dpr,
            right: 20 * this.dpr,
            bottom: 40 * this.dpr
        });
        this.content.add(this.bg);
        const posY = -this.bg.height * 0.5;
        this.titleimage = this.scene.make.image({ x: 0, y: posY + 5 * this.dpr, key: UIAtlasKey.common2Key, frame: "title" }, false);
        this.titleName = this.scene.make.text({
            x: 0, y: this.titleimage.y + 2 * this.dpr, text: i18n.t("furni_unlock.title"),
            style: { color: "#905B06", fontFamily: Font.EN_BOLD, bold: true, fontSize: 16 * this.dpr }
        }).setOrigin(0.5, 0.5).setStroke("#905B06", 2);
        this.closeBtn = this.scene.make.image({ x: this.bg.width * 0.5 - this.dpr * 5, y: posY + this.dpr * 5, key: UIAtlasKey.commonKey, frame: "close" }).setScale(1.3);
        this.closeBtn.setInteractive();
        this.content.add([this.titleimage, this.titleName, this.closeBtn]);
        this.itemName = this.scene.make.text({
            x: 0, y: this.titleimage.y + this.titleimage.height * 0.5 + 13 * this.dpr, text: "",
            style: { color: "#FFC51A", fontFamily: Font.DEFULT_FONT, bold: true, fontSize: 14 * this.dpr }
        }).setStroke("#FFC51A", 4).setShadow(0, 0, "#000000", 2, true).setOrigin(0.5);
        this.content.add(this.itemName);
        this.bgicon = this.scene.make.image({ key: this.key, frame: "bg_f" });
        this.bgicon.y = this.itemName.y + this.bgicon.height * 0.5 + 13 * this.dpr;
        this.content.add([this.bg, this.bgicon]);
        this.mDetailDisplay = new DetailDisplay(this.scene);
        this.mDetailDisplay.setTexture(this.key, "bg_f");
        this.mDetailDisplay.y = this.bgicon.y;// this.bgicon.height / 2;
        this.mDetailDisplay.scale = this.dpr / this.scale;
        this.mDetailDisplay.setSize(72 * this.dpr, 72 * this.dpr);
        this.content.add(this.mDetailDisplay);
        const materialConWdith = 360 * this.dpr, materialConHeight = 92 * this.dpr;
        this.materialCon = this.scene.make.container(undefined, false).setSize(materialConWdith, materialConHeight);
        this.content.add(this.materialCon);
        this.materialCon.setPosition(0, -posY - materialConHeight * 0.5 - 66 * this.dpr);
        const materialTitle = this.scene.make.text({
            x: 0,
            y: -materialConHeight * 0.5 + 12 * this.dpr,
            text: i18n.t("furni_unlock.needMaterials"),
            style: {
                color: "#253FCA",
                fontSize: 12 * this.dpr,
                fontFamily: Font.DEFULT_FONT
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
            y: 2 * this.dpr,
            width: 240 * this.dpr,
            height: 90 * this.dpr,
            zoom: this.scale,
            dpr: this.dpr,
            align: 2,
            orientation: 1,
            space: 20 * this.dpr,
            valuechangeCallback: undefined,
            cellupCallBack: (gameobject) => {
                this.onMaterialItemHandler(gameobject);
            }
        });
        this.materialCon.add(this.materialGameScroll);
        const tipsWidth = 145 * this.dpr;
        const tipsHeight = 55 * this.dpr;
        this.materialTipsCon = this.scene.make.container(undefined, false);
        this.content.add(this.materialTipsCon);
        this.materialTipsCon.setPosition(-bgwidth * 0.5 + tipsWidth * 0.5 - 5 * this.dpr, this.materialCon.y - tipsHeight * 0.5 - 20 * this.dpr);
        const tipsbg = new NineSlicePatch(this.scene, 0, 0, tipsWidth, tipsHeight, this.key, "tips_bg", {
            left: 10 * this.dpr,
            top: 10 * this.dpr,
            right: 10 * this.dpr,
            bottom: 10 * this.dpr
        }, undefined, undefined, 2);
        tipsbg.setPosition(26 * this.dpr, -tipsHeight * 0.5);
        this.tipsbg = tipsbg;
        const tipsText = new BBCodeText(this.scene, -35 * this.dpr, -tipsHeight + 60 * this.dpr, "", {
            color: "#333333",
            fontSize: 13 * this.dpr,
            fontFamily: Font.DEFULT_FONT,
            wrap: {
                width: tipsWidth - 5 * this.dpr,
                mode: "string"
            }
        }).setOrigin(0);

        this.materialTipsDes = tipsText;
        this.materialTipsCon.add([tipsbg, tipsText]);
        this.confirmBtn = new NineSliceButton(this.scene, 0, -posY - 35 * this.dpr, 100 * this.dpr, 40 * this.dpr, UIAtlasKey.commonKey, "yellow_btn_over", i18n.t("furni_unlock.unlock"), this.dpr, this.scale, {
            left: 15 * this.dpr,
            top: 15 * this.dpr,
            right: 15 * this.dpr,
            bottom: 15 * this.dpr
        });
        this.confirmBtn.setTextStyle({
            color: "#976400",
            fontSize: 12 * this.dpr,
            fontFamily: Font.BOLD_FONT,
            bold: true,
            stroke: "#976400",
            strokeThickness: 2,
        });
        this.confirmBtn.setTextOffset(10 * this.dpr, 0);
        const repairicon = this.scene.make.image({ key: this.key, frame: "repair_icon" });
        repairicon.x = -28 * this.dpr;
        this.confirmBtn.add(repairicon);
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
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_UNLOCK_ELEMENT_REQUIREMENT = this.mShowData;
        if (!content.ids) return;
        const eleMgr = this.mWorld.roomManager.currentRoom.elementManager;
        const ele = eleMgr.get(content.ids[0]);
        if (!ele) return;
        const display = (ele.model.displayInfo as FramesModel);
        const resData = new op_client.OP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_COMMODITY_RESOURCE();
        resData.display = display.display;
        const animas = display.createProtocolObject();
        if (animas.length > 1) {
            const arr = [];
            for (const ani of animas) {
                if (ani.node.name !== "lock") {
                    ani.frameName = ani.layer[0].frameName;
                    arr.push(ani);
                }
            }
            if (arr.length === 0) arr.push(animas[0]);
            resData.animations = arr;
        } else {
            resData.animations = animas;
        }
        this.mDetailDisplay.loadDisplay(resData);
        this.itemName.text = ele.model.nickname;
        this.setMaterialItems(content.materials);
    }

    private setMaterialItems(datas: op_client.ICountablePackageItem[]) {
        const len = datas.length;
        this.materialGameScroll.clearItems();
        for (let i = 0; i < len; i++) {
            const item = new MaterialItem(this.scene, this.key, this.dpr);
            item.y = 0;
            item.setItemData(datas[i]);
            item.setData("itemData", datas[i]);
            this.materialGameScroll.addItem(item);
        }
        this.materialGameScroll.Sort();
        // this.onMaterialItemHandler(datas[0]);
    }

    private onConfirmBtnClick() {
        const data = this.showData;
        if (!data || !data.ids) return;
        this.emit("queryunlock", data.ids);
        this.emit("close");
    }
    private OnClosePanel() {
        this.emit("close");
    }

    private onMaterialItemHandler(item: MaterialItem) {
        if (this.selectMaterial) this.selectMaterial.select = false;
        const data: op_client.ICountablePackageItem = item.itemData;
        this.materialTipsDes.text = this.getDesText(data);
        const tipsHeight = this.materialTipsDes.height + 15 * this.dpr;
        const tipsWidth = this.tipsbg.width;
        this.tipsbg.resize(tipsWidth, tipsHeight);
        this.tipsbg.y = -this.tipsbg.height * 0.5;
        this.materialTipsDes.y = -tipsHeight + 10 * this.dpr;
        item.select = true;
        this.selectMaterial = item;
    }
    private getDesText(data: op_client.ICountablePackageItem) {
        if (!data) data = <any>{ "sellingPrice": true, tradable: false };
        let text: string = `[stroke=#2640CA][color=#2640CA][b]${data.name}[/b][/color][/stroke]` + "\n";
        let source = `[stroke=#2640CA][color=#2640CA]${i18n.t("common.source")}[/color][/stroke]：`;
        source += data.source;
        text += source + "\n";
        let description = `[stroke=#2640CA][color=#2640CA]${i18n.t("common.description")}[/color][/stroke]：`;
        description += data.des;
        text += description;
        return text;
    }

}

class MaterialItem extends Phaser.GameObjects.Container {
    public itemData: op_client.ICountablePackageItem;
    private readonly dpr: number;
    private readonly key: string;
    private itemIcon: DynamicImage;
    private itemCount: BBCodeText;
    private bg: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, key: string, dpr: number) {
        super(scene);
        this.dpr = dpr;
        this.key = key;
        this.bg = this.scene.make.image({ key: this.key, frame: "bg_m" });
        this.itemIcon = new DynamicImage(scene, 0, 0);
        this.itemCount = new BBCodeText(this.scene, 0, 15 * dpr, "10/20", { color: "#000000" })
            .setOrigin(0.5).setFontSize(11 * dpr).setFontFamily(Font.DEFULT_FONT);
        this.add([this.bg, this.itemIcon, this.itemCount]);
        this.setSize(this.bg.width, this.bg.height);
        this.itemCount.y = this.height * 0.5 + 8 * dpr;
    }
    public setItemData(data: op_client.ICountablePackageItem) {
        this.itemData = data;
        this.itemCount.text = this.getCountText(data.count, data.neededCount);
        const url = Url.getOsdRes(data.display.texturePath);
        this.itemIcon.load(url, this, () => {
            this.itemIcon.scale = this.dpr;
            this.itemIcon.setPosition(0, 0);
        });
    }

    public set select(value: boolean) {
        this.bg.setFrame(value ? "bg_select" : "bg_m");
    }
    private getCountText(count: number, needcount: number) {
        const color = (count >= needcount ? "#000000" : "#ff0000");
        const text = `[stroke=${color}][color=${color}]${count}[/color][/stroke]/` + needcount;
        return text;
    }
}
