import { i18n } from "../../i18n";
import { Font } from "../../utils/font";
import { ItemInfoTips } from "../tips/ItemInfoTips";
import { UIAtlasKey } from "../ui.atals.name";
import { op_client } from "pixelpai_proto";
import { DynamicImage } from "./dynamic.image";
import { Url } from "../../utils/resUtil";
import { Handler } from "../../Handler/Handler";
import { NineSliceButton, Button, GameScroller, ClickEvent, BBCodeText } from "apowophaserui";

export class ItemsConsumeFunPanel extends Phaser.GameObjects.Container {
    private confirmBtn: NineSliceButton;
    private dpr: number;
    private closeBtn: Button;
    private gameScroll: GameScroller;
    private itemtips: ItemInfoTips;
    private title: Phaser.GameObjects.Text;
    private materialTitle: Phaser.GameObjects.Text;
    private materialLine: Phaser.GameObjects.Image;
    private materialLine2: Phaser.GameObjects.Image;
    private contentTitle: Phaser.GameObjects.Text;
    private confirmHandler: Handler;
    private materialItems: MaterialItem[] = [];
    private curSelectItem: MaterialItem;
    private zoom: number;
    private havebutton: boolean = true;
    private mblackGraphic: Phaser.GameObjects.Graphics;
    private isEnough: boolean = false;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number, havebutton: boolean = true) {
        super(scene);
        this.dpr = dpr;
        this.zoom = zoom;
        this.havebutton = havebutton;
        this.setSize(width, height);
        this.create();
    }
    public createBackGrphaic(width: number, height: number) {
        this.mblackGraphic = this.scene.make.graphics(undefined, false);
        this.mblackGraphic.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
        this.mblackGraphic.fillStyle(0, 0.66);
        this.mblackGraphic.fillRect(-width * 0.5, -height * 0.5 + this.y, width, height);
        this.addAt(this.mblackGraphic, 0);
    }
    public resetMask() {
        this.gameScroll.refreshMask();
    }
    public setHandler(handler: Handler) {
        this.confirmHandler = handler;
    }
    public setTextInfo(title: string, materialtitle: string, buttontex?: string) {
        this.title.text = title;
        this.materialTitle.text = materialtitle;
        this.materialLine.x = this.materialTitle.x - this.materialTitle.width * 0.5 - 5 * this.dpr - this.materialLine.width * 0.5;
        this.materialLine2.x = this.materialTitle.x + this.materialTitle.width * 0.5 + 5 * this.dpr + this.materialLine2.width * 0.5;
        if (this.havebutton && buttontex !== undefined)
            this.confirmBtn.setText(buttontex);
    }
    public setItemDatas(datas: op_client.ICountablePackageItem[]) {
        this.gameScroll.visible = true;
        this.gameScroll.clearItems(false);
        for (const item of this.materialItems) {
            item.visible = false;
        }
        this.isEnough = true;
        for (let i = 0; i < datas.length; i++) {
            let item: MaterialItem;
            const data = datas[i];
            if (i < this.materialItems.length) {
                item = this.materialItems[i];
            } else {
                item = new MaterialItem(this.scene, this.dpr);
                this.materialItems.push(item);
            }
            item.visible = true;
            item.setItemData(data);
            this.gameScroll.addItem(item);
            if (data.neededCount > data.count) { this.isEnough = false; }
        }
        this.gameScroll.Sort();
    }

    public setContent(title: string) {
        this.contentTitle.visible = true;
        this.contentTitle.text = title;
        this.gameScroll.visible = false;
    }

    protected create() {
        const bg = this.scene.make.image({ key: UIAtlasKey.common2Key, frame: "universal_box" });
        this.add(bg);
        this.setSize(bg.width, bg.height);
        this.title = this.scene.make.text({
            x: 0,
            y: -this.height * 0.5 + 25 * this.dpr,
            text: "",
            style: {
                color: "#FFC51A",
                fontSize: 13 * this.dpr,
                fontFamily: Font.BOLD_FONT,
            }
        }, false).setOrigin(0.5);
        this.add(this.title);
        this.closeBtn = new Button(this.scene, UIAtlasKey.commonKey, "close", "close");
        this.closeBtn.setPosition(this.width * 0.5 - this.dpr * 5, -this.height * 0.5 + this.dpr * 5).setScale(1.3);
        this.closeBtn.on(String(ClickEvent.Tap), this.onCloseHandler, this);
        this.add(this.closeBtn);
        const offsetx = this.havebutton ? 0 : 20 * this.dpr;
        this.materialTitle = this.scene.make.text({
            x: 0,
            y: -this.height * 0.5 + 45 * this.dpr + offsetx,
            text: "",
            bold: true,
            style: {
                color: "#263FCB",
                fontSize: 13 * this.dpr,
                fontFamily: Font.DEFULT_FONT,
                wordWrap: {
                    width: 90 * this.dpr,
                    useAdvancedWrap: true
                }
            }
        }, false).setOrigin(0.5);
        this.materialLine = this.scene.make.image({ x: -10 * this.dpr, y: this.materialTitle.y, key: UIAtlasKey.common2Key, frame: "line_left" });
        this.materialLine2 = this.scene.make.image({ x: 10 * this.dpr, y: this.materialTitle.y, key: UIAtlasKey.common2Key, frame: "line_right" });
        this.add([this.materialTitle, this.materialLine, this.materialLine2]);
        this.gameScroll = new GameScroller(this.scene, {
            x: 0,
            y: -10 * this.dpr + offsetx,
            width: this.width - 40 * this.dpr,
            height: 90 * this.dpr,
            zoom: this.zoom,
            align: 2,
            orientation: 1,
            dpr: this.dpr,
            cellupCallBack: (gameobject) => {
                this.onMaterialItemHandler(gameobject);
            }
        });
        this.add(this.gameScroll);
        this.contentTitle = this.scene.make.text({
            x: 0,
            y: -10 * this.dpr + offsetx,
            text: "",
            style: {
                color: "#FFC51A",
                fontSize: 15 * this.dpr,
                fontFamily: Font.BOLD_FONT,
            }
        }, false).setOrigin(0.5);
        this.add(this.contentTitle);
        this.contentTitle.visible = false;
        if (this.havebutton) {
            this.confirmBtn = new NineSliceButton(this.scene, 0, 0, 106 * this.dpr, 40 * this.dpr, UIAtlasKey.commonKey, "yellow_btn", i18n.t("common.confirm"), this.dpr, 1, {
                left: 12 * this.dpr,
                top: 12 * this.dpr,
                right: 12 * this.dpr,
                bottom: 12 * this.dpr
            });
            this.confirmBtn.y = this.height * 0.5 - this.confirmBtn.height * 0.5 - 15 * this.dpr;
            this.confirmBtn.setTextStyle({ fontSize: 16 * this.dpr, color: "#996600" });
            this.confirmBtn.on(String(ClickEvent.Tap), this.onConfirmHandler, this);
            this.add(this.confirmBtn);
        }
        const tipsWidth = 145 * this.dpr;
        const tipsHeight = 55 * this.dpr;
        this.itemtips = new ItemInfoTips(this.scene, tipsWidth, tipsHeight, UIAtlasKey.common2Key, "tips_bg", this.dpr, {
            left: 10 * this.dpr,
            top: 10 * this.dpr,
            right: 10 * this.dpr,
            bottom: 10 * this.dpr
        });
        this.itemtips.x = -this.width * 0.5 + tipsWidth * 0.5 + 10 * this.dpr;
        this.itemtips.y = -this.height * 0.5 + 70 * this.dpr;
        this.itemtips.visible = false;
        this.add(this.itemtips);
    }

    private onConfirmHandler() {
        this.onCloseHandler();
        if (this.confirmHandler && this.isEnough) this.confirmHandler.run();
    }
    private onCloseHandler() {
        this.visible = false;
        this.gameScroll.clearItems(false);
        this.gameScroll.visible = false;
        this.contentTitle.visible = false;
        if (this.parentContainer) this.parentContainer.remove(this);
    }
    private onMaterialItemHandler(gameobject: MaterialItem) {
        this.itemtips.visible = false;
        if (this.curSelectItem && this.curSelectItem !== gameobject) {
            this.curSelectItem.select = false;
        }
        gameobject.select = !gameobject.select;
        if (gameobject.select) {
            this.itemtips.setItemData(gameobject.itemData);
            this.itemtips.visible = true;
        }
        this.curSelectItem = gameobject;
        this.setTipsPosition(gameobject);
    }

    private setTipsPosition(gameobject: MaterialItem) {
        let posx: number = gameobject.x;
        let posy: number = gameobject.y;
        let tempobject = <Phaser.GameObjects.Container>gameobject;
        while (tempobject.parentContainer !== this) {
            posx += tempobject.parentContainer.x;
            posy += tempobject.parentContainer.y;
            tempobject = tempobject.parentContainer;
        }
        if (posx - this.itemtips.width * 0.5 < -this.width * 0.5) {
            this.itemtips.x = this.itemtips.width * 0.5 - this.width * 0.5;
        } else if (posx + this.itemtips.width * 0.5 > this.width * 0.5) {
            this.itemtips.x = this.width * 0.5 - this.itemtips.width * 0.5;
        } else {
            this.itemtips.x = posx;
        }
        this.itemtips.y = posy - this.itemtips.height * 0.5 + 5 * this.dpr;
    }
}
class MaterialItem extends Phaser.GameObjects.Container {
    public itemData: op_client.ICountablePackageItem;
    private readonly dpr: number;
    private itemIcon: DynamicImage;
    private itemCount: BBCodeText;
    private bg: Phaser.GameObjects.Image;
    private mselect: boolean = false;
    constructor(scene: Phaser.Scene, dpr: number) {
        super(scene);
        this.dpr = dpr;
        this.bg = this.scene.make.image({ key: UIAtlasKey.common2Key, frame: "material_unchecked" });
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
        this.mselect = value;
        this.bg.setFrame(value ? "material_checked" : "material_unchecked");
    }

    public get select() {
        return this.mselect;
    }
    private getCountText(count: number, needcount: number) {
        const color = (count >= needcount ? "#000000" : "#ff0000");
        const text = `[stroke=${color}][color=${color}]${count}[/color][/stroke]/` + needcount;
        return text;
    }
}
