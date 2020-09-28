import { WorldService } from "../../game/world.service";
import { Font } from "../../game/core/utils/font";
import { op_client, op_pkt_def, op_gameconfig } from "pixelpai_proto";
import { BasePanel } from "../Components/BasePanel";
import { NinePatch } from "../Components/Nine.patch";
import { Url } from "../../game/core/utils/resUtil";
import { DetailDisplay } from "../Market/DetailDisplay";
import { DynamicImage } from "../Components/Dynamic.image";
import { UIAtlasKey, UIAtlasName } from "../Ui.atals.name";
import { i18n } from "../../game/core/utils/i18n";
import { Handler } from "../../../utils/Handler/Handler";
import { GameGridTable, GameScroller, NineSliceButton, ClickEvent, Button, BBCodeText } from "apowophaserui";
export class ComposePanel extends BasePanel {
    private key: string = "compose";
    private content: Phaser.GameObjects.Container;
    private world: WorldService;
    private mDetailDisplay: DetailDisplay;
    private mDetailBubble: DetailBubble;
    private materialCon: Phaser.GameObjects.Container;
    private mGrideTable: GameGridTable;
    private mSelectItemData: op_client.IPKT_CRAFT_SKILL;
    private mSelectItem: ComposeItem;
    private materialGameScroll: GameScroller;
    private makeBtn: NineSliceButton;
    private materialTipsCon: Phaser.GameObjects.Container;
    private materialTipsName: Phaser.GameObjects.Text;
    private materialTipsDes: Phaser.GameObjects.Text;
    private tipsbg: NinePatch;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        this.world = world;
    }

    resize(width: number, height: number) {
        super.resize(width, height);
        this.content.x = width * 0.5;
        this.content.y = height * 0.5;
        this.mGrideTable.resetMask();
        this.materialGameScroll.refreshMask();
        this.setSize(width, height);
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
    }

    addListen() {
        if (!this.mInitialized) return;
        this.scene.input.on("pointerup", this.onInputPointUp, this);
        this.makeBtn.on(String(ClickEvent.Tap), this.onMakeHandler, this);
    }

    removeListen() {
        if (!this.mInitialized) return;
        this.scene.input.off("pointerup", this.onInputPointUp, this);
        this.makeBtn.off(String(ClickEvent.Tap), this.onMakeHandler, this);
    }

    preload() {
        this.addAtlas(this.key, "compose/compose.png", "compose/compose.json");
        this.addAtlas(UIAtlasKey.commonKey, UIAtlasName.commonUrl + ".png", UIAtlasName.commonUrl + ".json");
        super.preload();
    }

    init() {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(width, height);
        this.add(this.content);
        const bggraphics = this.scene.make.graphics(undefined, false);
        bggraphics.clear();
        bggraphics.fillGradientStyle(0x7062EC, 0x7062EC, 0xCC99F5, 0xCC99F5);
        bggraphics.fillRect(-width * 0.5, -height * 0.5, width, height);
        const bg = this.scene.make.image({ key: this.key, frame: "main_bg" });
        bg.y = -height * 0.5 + bg.height * 0.5;
        bg.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.cameraWidth, this.cameraHeight), Phaser.Geom.Rectangle.Contains);
        bg.displayWidth = width;
        this.content.add([bggraphics, bg]);
        const mfont = `bold ${17 * this.dpr}px Source Han Sans`;
        const titleBg = this.scene.make.image({ key: this.key, frame: "title_bg" });
        titleBg.y = -height * 0.5 + 23 * this.dpr;
        const titleTex = this.scene.make.text({ x: 0, y: titleBg.y, text: i18n.t("compose.title"), style: { font: mfont, bold: true, color: "#8B5603", fontSize: 15 * this.dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5);
        this.content.add([titleBg, titleTex]);
        const backBtn = new Button(this.scene, UIAtlasKey.commonKey, "back_arrow", "back_arrow");
        backBtn.setPosition(-width * 0.5 + 20 * this.dpr, -height * 0.5 + 30 * this.dpr);
        backBtn.on("Tap", this.onBackHandler, this);
        this.content.add(backBtn);

        this.mDetailDisplay = new DetailDisplay(this.scene, true);
        this.mDetailDisplay.y = -140 * this.dpr;
        this.mDetailDisplay.setSize(126 * this.dpr, 126 * this.dpr);
        // this.mDetailDisplay.scale = this.dpr * 2;
        this.content.add(this.mDetailDisplay);
        this.mDetailBubble = new DetailBubble(this.scene, this.dpr);
        this.mDetailBubble.x = -width * 0.5;
        this.mDetailBubble.y = height * 0.5 - 360 * this.dpr;
        this.content.add(this.mDetailBubble);
        this.makeBtn = new NineSliceButton(this.scene, Math.ceil(width * 0.5 - 60 * this.dpr), Math.ceil(height * 0.5 - 310 * this.dpr), 106 * this.dpr, 40 * this.dpr, UIAtlasKey.commonKey, "yellow_btn", i18n.t("compose.make"), this.dpr, 1, {
            left: 12 * this.dpr,
            top: 12 * this.dpr,
            right: 12 * this.dpr,
            bottom: 12 * this.dpr
        });
        this.makeBtn.setTextStyle({ fontSize: 16 * this.dpr, color: "#996600" });
        // this.makeBtn.on("click", this.onMakeHandler, this);
        this.content.add(this.makeBtn);
        const materialConWdith = 360 * this.dpr, materialConHeight = 92 * this.dpr;
        this.materialCon = this.scene.make.container(undefined, false).setSize(materialConWdith, materialConHeight);
        this.content.add(this.materialCon);
        this.materialCon.setPosition(0, height * 0.5 - 230 * this.dpr);
        const materialbg = this.scene.make.image({ x: 0, y: 0, key: this.key, frame: "sourcelist_bg" });
        materialbg.displayWidth = width;
        const materialTitle = this.scene.make.text({
            x: 0,
            y: -materialConHeight * 0.5 + 12 * this.dpr,
            text: i18n.t("compose.needMaterials"),
            style: {
                color: "#ffffff",
                fontSize: 13 * this.dpr,
                fontFamily: Font.DEFULT_FONT,
                wordWrap: {
                    width: 90 * this.dpr,
                    useAdvancedWrap: true
                }
            }
        }, false).setOrigin(0.5);
        const materialLine = this.scene.make.image({ x: -10 * this.dpr, y: materialTitle.y, key: this.key, frame: "sourcelist_title_1" });
        const materialLine2 = this.scene.make.image({ x: 10 * this.dpr, y: materialTitle.y, key: this.key, frame: "sourcelist_title_1" });
        const linePosx = -materialTitle.width * 0.5 - materialLine.width * 0.5 - 10 * this.dpr;
        materialLine.setPosition(linePosx, materialTitle.y);
        materialLine2.setPosition(-linePosx, materialTitle.y).rotation = -Math.PI;
        const materialLine3 = this.scene.make.image({ x: 0, y: materialTitle.y + 12 * this.dpr, key: this.key, frame: "separator" });
        this.materialCon.add([materialbg, materialTitle, materialLine, materialLine2, materialLine3]);
        this.materialGameScroll = new GameScroller(this.scene, {
            x: 0,
            y: 10 * this.dpr,
            width,
            height: 70 * this.dpr,
            zoom: this.scale,
            align: 2,
            orientation: 1,
            dpr: this.dpr,
            celldownCallBack: (gameobject) => {
                this.materialTipsCon.visible = true;
                this.onMaterialItemHandler(gameobject);
            },
            cellupCallBack: (gameobject) => {
                this.materialTipsCon.visible = false;
            }
        });
        this.materialCon.add(this.materialGameScroll);
        this.materialTipsCon = this.scene.make.container(undefined, false).setPosition(0, -20 * this.dpr);
        this.materialTipsCon.visible = false;
        this.materialCon.add(this.materialTipsCon);
        const tipsWidth = 109 * this.dpr;
        const tipsHeight = 42 * this.dpr;
        const tipsbg = new NinePatch(this.scene, 0, 0, tipsWidth, tipsHeight, this.key, "tips_bg", {
            left: 20 * this.dpr,
            top: 20 * this.dpr,
            right: 30 * this.dpr,
            bottom: 20 * this.dpr
        });
        tipsbg.setPosition(26 * this.dpr, -tipsHeight * 0.5);
        this.tipsbg = tipsbg;
        const tipsArrow = this.scene.make.image({ key: this.key, frame: "tips_arrow" });
        const tipsName = this.scene.make.text({
            x: 0,
            y: -materialConHeight * 0.5 + 12 * this.dpr,
            text: "",
            style: {
                color: "#844ED5",
                fontSize: 13 * this.dpr,
                fontFamily: Font.DEFULT_FONT,
                wordWrap: {
                    width: 90 * this.dpr,
                    useAdvancedWrap: true
                }
            }
        }, false).setOrigin(0, 0.5).setPosition(-19 * this.dpr, -tipsHeight + 10 * this.dpr);
        this.materialTipsName = tipsName;
        const tipsText = this.scene.make.text({
            x: 0,
            y: -materialConHeight * 0.5 + 12 * this.dpr,
            text: "",
            style: {
                color: "#333333",
                fontSize: 13 * this.dpr,
                fontFamily: Font.DEFULT_FONT,
                wordWrap: {
                    width: 100 * this.dpr,
                    useAdvancedWrap: true
                }
            }
        }, false).setOrigin(0).setPosition(-19 * this.dpr, -tipsHeight + 20 * this.dpr);
        this.materialTipsDes = tipsText;
        this.materialTipsCon.add([tipsbg, tipsName, tipsText, tipsArrow]);
        const propFrame = this.scene.textures.getFrame(this.key, "bprint_bg_2");
        const capW = propFrame.width + 10 * this.dpr;
        const capH = propFrame.height + 12 * this.dpr;
        const gridHeight = 190 * this.dpr;
        const gridY = height * 0.5 - gridHeight * 0.5 + 10 * this.dpr;
        const tableConfig = {
            x: 0,
            y: gridY,
            table: {
                width,
                height: gridHeight,
                columns: 2,
                cellWidth: capW,
                cellHeight: capH,
                reuseCellContainer: true,
                zoom: this.scale
            },
            scrollMode: 1,
            clamplChildOY: false,
            // background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, .2),
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new ComposeItem(scene, this.key, this.dpr);
                }
                cellContainer.setItemData(item);
                if (item && this.mSelectItemData && item.skill.id === this.mSelectItemData.skill.id) {
                    cellContainer.select = true;
                    this.mSelectItem = cellContainer;
                }
                return cellContainer;
            },
        };
        this.mGrideTable = new GameGridTable(this.scene, tableConfig);
        this.mGrideTable.layout();
        this.mGrideTable.on("cellTap", (cell) => {
            if (cell) {
                this.onSelectItemHandler(cell);
            }
        });
        this.content.add(this.mGrideTable);
        this.resize(width, height);
        super.init();
        if (this.mShowData)
            this.setComposeData(this.mShowData.skills);
    }

    destroy() {
        super.destroy();
    }

    public setComposeData(datas: op_client.IPKT_CRAFT_SKILL[]) {
        if (datas && datas.length > 0) {
            this.mGrideTable.setItems(datas);
            const cell = this.mSelectItem ? this.mSelectItem : this.mGrideTable.getCell(0).container;
            this.onSelectItemHandler(cell);
        }
    }

    // public setComposeDetialData(data: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_CRAFT_QUERY_FORMULA) {
    //     this.mDetailBubble.setDetailData(data.productName, data.productDes);
    //     this.setDetailDisplay(data);
    //     this.setMaterialItems(data.materials);
    // }

    public setComposeDetialData(data: op_client.IPKT_CRAFT_SKILL) {
        this.mDetailBubble.setDetailData(data.productName, data.productDes);
        this.setDetailDisplay(data);
        this.setMaterialItems(data.materials);
    }

    private setDetailDisplay(data: op_client.IPKT_CRAFT_SKILL) {
        this.mDetailDisplay.loadSprite("loading_ui", Url.getUIRes(this.dpr, "loading_ui"), Url.getUIRes(this.dpr, "loading_ui"));
        const resData = new op_client.OP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_PACKAGE_ITEM_RESOURCE();
        resData.animations = data.productAnimations;
        resData.display = data.productDisplay;
        resData.avatar = data.productAvatar;
        if (resData.display) {
            this.mDetailDisplay.loadDisplay(resData);
        } else if (resData.avatar) {
            const point = new Phaser.Geom.Point();
            point.x = 0;
            point.y = 20 * this.dpr;
            this.mDetailDisplay.loadAvatar(resData, 2 * this.dpr, point);
        } else {
            // this.mDetailDisplay.loadUrl(this.mSelectedProp.icon);
        }
    }

    private onSelectItemHandler(item: ComposeItem) {
        const data = item.itemData;
        // this.emit("reqformula", data.id);
        this.mSelectItemData = item.itemData;
        this.makeBtn.enable = data.skill.active && data.skill.qualified;
        if (this.mSelectItem) this.mSelectItem.select = false;
        this.mSelectItem = item;
        item.select = true;
        this.setComposeDetialData(data);
    }
    private setMaterialItems(datas: op_client.ICountablePackageItem[]) {
        const len = datas.length;
        const items = [];
        (<any>this.materialGameScroll).clearItems();
        for (let i = 0; i < len; i++) {
            const item = new ComposeMaterialItem(this.scene, this.key, this.dpr);
            item.y = 0;
            items.push(item);
            item.setItemData(datas[i]);
            item.setData("itemData", datas[i]);
            this.materialGameScroll.addItem(item);
        }
        this.materialGameScroll.Sort();
    }

    private onMaterialItemHandler(item: ComposeMaterialItem) {
        const pos = item.getWorldTransformMatrix();
        this.materialTipsCon.x = pos.tx - this.scaleWidth * 0.5;
        this.materialTipsName.text = item.itemData.name;
        this.materialTipsDes.text = item.itemData.source;
        const tipsHeight = this.materialTipsName.height + this.materialTipsDes.height + 20 * this.dpr;
        const tipsWidth = this.tipsbg.width;
        this.tipsbg.resize(tipsWidth, tipsHeight);
        this.tipsbg.y = -this.tipsbg.height * 0.5;
        this.materialTipsName.y = -tipsHeight + 15 * this.dpr;
        this.materialTipsDes.y = -tipsHeight + 25 * this.dpr;
    }

    private onMakeHandler() {
        if (this.mSelectItemData) {
            const content = {
                text: [{
                    // text: `您确定要合成${this.mSelectItemData.productName}吗？`
                    text: i18n.t("compose.confirmation", { name: this.mSelectItemData.productName })
                }],
                title: [{
                    text: i18n.t("compose.synthesis")
                }],
                button: [
                    {
                        text: i18n.t("common.confirm"),
                        local: true,
                        clickhandler: new Handler(this, () => {
                            this.emit("reqUseFormula", this.mSelectItemData.skill.id);
                        })
                    },
                    {
                        text: i18n.t("common.cancel"),
                        local: true,
                    }
                ]
            };
            const uimanager = this.mWorld.uiManager;
            uimanager.showMed("MessageBox", content);
        }

    }

    private onInputPointUp() {
        this.materialTipsCon.visible = false;
    }
    private onBackHandler() {
        this.emit("hide");
    }
}

class DetailBubble extends Phaser.GameObjects.Container {
    private mDetailBubble: Phaser.GameObjects.Graphics;
    private mItemName: Phaser.GameObjects.Text;
    private mDesText: Phaser.GameObjects.Text;
    private dpr: number;
    constructor(scene: Phaser.Scene, dpr: number) {
        super(scene);
        this.dpr = dpr;
        this.mDetailBubble = this.scene.make.graphics(undefined, false);
        const bubbleW = 198 * dpr;
        const bubbleH = 96 * dpr;
        this.mDetailBubble = this.scene.make.graphics(undefined, false);
        this.mDetailBubble.fillStyle(0xFFFFFF, 0.1);
        this.mDetailBubble.fillRoundedRect(0, 0, bubbleW, bubbleH);
        this.mItemName = this.scene.make.text({
            x: 7 * this.dpr,
            y: 9 * this.dpr,
            text: "道具名称道具名称",
            style: {
                fontSize: 12 * this.dpr,
                fontFamily: Font.DEFULT_FONT,
                color: "#8C55E1",
                align: "center"
            }
        });
        this.mDesText = this.scene.make.text({
            x: 8 * dpr,
            y: 30 * dpr,
            style: {
                color: "#ffffff",
                fontSize: 10 * dpr,
                fontFamily: Font.DEFULT_FONT,
                wordWrap: {
                    width: 180 * dpr,
                    useAdvancedWrap: true
                }
            }
        }, false);
        this.add([this.mDetailBubble, this.mItemName, this.mDesText]);
        this.setSize(bubbleW, bubbleH);
    }
    setDetailData(name: string, des: string) {
        this.mItemName.setText(name);
        this.mDesText.setText(des);
        this.resize();
    }

    private resize(w?: number, h?: number) {
        if (w === undefined) w = this.width;
        const bubbleH = this.mDesText.height + 60 * this.dpr;
        if (w === this.width && bubbleH === this.height) {
            return;
        }
        this.mDetailBubble.clear();
        this.mDetailBubble.fillStyle(0xFFFFFF, 0.1);
        this.mDetailBubble.fillRoundedRect(0, 0, w, bubbleH);

        this.setSize(w, bubbleH);
        // this.mDetailBubbleContainer.y = this.height - this.y - this.mDetailBubbleContainer.height - 6 * this.dpr;
    }
}

class ComposeItem extends Phaser.GameObjects.Container {
    public itemData: op_client.IPKT_CRAFT_SKILL;
    private readonly dpr: number;
    private readonly key: string;
    private bg: Phaser.GameObjects.Image;
    private itemIcon: DynamicImage;
    private newIcon: Phaser.GameObjects.Image;
    private newText: Phaser.GameObjects.Text;
    private qualityIcon: Phaser.GameObjects.Image;
    private qualityTex: Phaser.GameObjects.Text;
    private qualifiedIcon: Phaser.GameObjects.Image;
    private lockbg: Phaser.GameObjects.Image;
    private lockIcon: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, key: string, dpr: number) {
        super(scene);
        this.dpr = dpr;
        this.key = key;
        this.bg = this.scene.make.image({ key: this.key, frame: "bprint_bg_1" });
        this.setSize(this.bg.width, this.bg.height);
        this.itemIcon = new DynamicImage(this.scene, 0, 0);
        const width = this.width;
        const height = this.height;
        this.newIcon = this.scene.make.image({ key: this.key, frame: "tag_new" });
        this.newIcon.setPosition(-width * 0.5 + 3 * dpr, -height * 0.5 + 3 * dpr);
        this.newText = this.scene.make.text({
            x: this.newIcon.x,
            y: this.newIcon.y,
            text: "N",
            style: {
                fontSize: 11 * this.dpr,
                fontFamily: Font.DEFULT_FONT,
                color: "#ffffff",
                align: "center"
            }
        }).setOrigin(0.5);
        this.qualityIcon = this.scene.make.image({ key: this.key, frame: "tag_rank_a" });
        this.qualityIcon.setPosition(-width * 0.5 + this.qualityIcon.width * 0.5 - 2 * dpr, height * 0.5 - this.qualityIcon.height * 0.5);
        this.qualityTex = this.scene.make.text({
            x: this.qualityIcon.x,
            y: this.qualityIcon.y,
            text: "A",
            style: {
                fontSize: 11 * this.dpr,
                fontFamily: Font.DEFULT_FONT,
                color: "#ffffff",
                align: "center"
            }
        }).setOrigin(0.5);
        this.qualifiedIcon = this.scene.make.image({ key: this.key, frame: "tag_ready" });
        this.qualifiedIcon.setOrigin(1).setPosition(width * 0.5 - 3 * dpr, height * 0.5 - 3 * dpr);
        this.lockbg = this.scene.make.image({ key: this.key, frame: "bprint_mask" });
        this.lockIcon = this.scene.make.image({ key: this.key, frame: "lock" });
        this.add([this.bg, this.itemIcon, this.newIcon, this.newText, this.qualityIcon, this.qualityTex, this.qualifiedIcon, this.lockbg, this.lockIcon]);
    }

    public setItemData(data: op_client.IPKT_CRAFT_SKILL) {
        this.itemData = data;
        const skill = data.skill;
        const active = skill.active;
        this.newIcon.visible = active;
        this.newText.visible = active;
        this.qualityIcon.visible = active;
        this.qualityTex.visible = active;
        this.qualityTex.text = skill.quality;
        this.qualifiedIcon.visible = active && skill.qualified;
        this.lockbg.visible = !skill.active;
        this.lockIcon.visible = !skill.active;
        this.setQualityTexture(skill.quality);
        if (skill.display) this.setItemIcon(skill.display);
        this.select = false;
    }
    public set select(value: boolean) {
        if (value)
            this.bg.setFrame("bprint_bg_2");
        else this.bg.setFrame("bprint_bg_1");
    }

    private setItemIcon(display: op_gameconfig.IDisplay) {
        const url = Url.getOsdRes(display.texturePath);
        this.itemIcon.load(url, this, () => {
            this.itemIcon.scale = this.dpr;
            this.itemIcon.setPosition(0, 0);
        });
    }

    private setQualityTexture(quality: string) {
        this.qualityIcon.visible = true;
        if (quality === "A") this.qualityIcon.setFrame("tag_rank_a");
        else if (quality === "B") this.qualityIcon.setFrame("tag_rank_b");
        else if (quality === "C") this.qualityIcon.setFrame("tag_rank_c");
        else this.qualityIcon.visible = false;
    }
}
class ComposeMaterialItem extends Phaser.GameObjects.Container {
    public itemData: op_client.ICountablePackageItem;
    private readonly dpr: number;
    private readonly key: string;
    private itemIcon: DynamicImage;
    private itemCount: BBCodeText;
    constructor(scene: Phaser.Scene, key: string, dpr: number) {
        super(scene);
        this.dpr = dpr;
        this.key = key;
        const bg = this.scene.make.image({ key: this.key, frame: "source_bg" });
        this.itemIcon = new DynamicImage(scene, 0, 0);
        this.itemCount = new BBCodeText(this.scene, 0, 0, "", {})
            .setOrigin(0.5).setFontSize(11 * dpr).setFontFamily(Font.DEFULT_FONT);
        this.add([bg, this.itemIcon, this.itemCount]);
        this.setSize(bg.width, bg.height);
        this.itemCount.y = this.height * 0.5;
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

    private getCountText(count: number, needcount: number) {
        const color = (count >= needcount ? "#ffffff" : "#ff0000");
        const text = `[stroke=${color}][color=${color}]${count}[/color][/stroke]/` + needcount;
        return text;
    }
}
