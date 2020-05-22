import { WorldService } from "../../game/world.service";
import { Font } from "../../utils/font";
import { op_client, op_pkt_def, op_gameconfig } from "pixelpai_proto";
import { BasePanel } from "../components/BasePanel";
import { NinePatch } from "../components/nine.patch";
import { NinePatchButton } from "../components/ninepatch.button";
import { Url } from "../../utils/resUtil";
import { Button } from "../../../lib/rexui/lib/ui/button/Button";
import { Handler } from "../../Handler/Handler";
import { DetailDisplay } from "../Market/DetailDisplay";
import { GameScroller } from "../../../lib/rexui/lib/ui/scroller/Scroller";
import { DynamicImage } from "../components/dynamic.image";
import { GridTableConfig } from "../../../lib/rexui/lib/ui/gridtable/GridTableConfig";
import { GameGridTable } from "../../../lib/rexui/lib/ui/gridtable/GameGridTable";
import { BBCodeText } from "../../../lib/rexui/lib/ui/ui-components";
import { UIAtlasKey, UIAtlasName } from "../ui.atals.name";
import { i18n } from "../../i18n";
export class ComposePanel extends BasePanel {
    private key: string = "compose";
    private content: Phaser.GameObjects.Container;
    private world: WorldService;
    private mDetailDisplay: DetailDisplay;
    private mDetailBubble: DetailBubble;
    private materialCon: Phaser.GameObjects.Container;
    private materialGameScroll: GameScroller;
    private materialItemsCon: Phaser.GameObjects.Container;
    private mGrideTable: GameGridTable;
    private mSelectItem: ComposeItem;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        this.world = world;
    }

    resize(width: number, height: number) {
        super.resize(width, height);
        this.content.x = width * 0.5;
        this.content.y = height * 0.5;
        this.mGrideTable.refreshPos(width * 0.5 + 10 * this.dpr, height - 66 * this.dpr);
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
    }

    removeListen() {
        if (!this.mInitialized) return;
    }

    preload() {
        this.addAtlas(this.key, "compose/compose.png", "compose/compose.json");
        this.addAtlas(UIAtlasKey.commonKey, UIAtlasName.common + ".png", UIAtlasName.common + ".json");
        super.preload();
    }

    init() {
        const width = this.screenWidth;
        const height = this.screenHeight;
        const zoom = this.scale;
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(width, height);
        this.add(this.content);
        const bggraphics = this.scene.make.graphics(undefined, false);
        bggraphics.clear();
        bggraphics.fillGradientStyle(0x7062EC, 0x7062EC, 0xCC99F5, 0xCC99F5);
        bggraphics.fillRect(-width * 0.5, -height * 0.5, width * zoom, height * zoom);
        const bg = this.scene.make.image({ key: this.key, frame: "main_bg" });
        bg.y = -height * 0.5 + bg.height * 0.5;
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

        this.mDetailDisplay = new DetailDisplay(this.scene);
        this.mDetailDisplay.y = -30 * this.dpr;
        this.content.add(this.mDetailDisplay);
        this.mDetailBubble = new DetailBubble(this.scene, this.dpr);
        this.mDetailBubble.x = -width * 0.5;
        this.mDetailBubble.y = height * 0.5 - 300 * this.dpr;
        this.content.add(this.mDetailBubble);
        const makeBtn = new NinePatchButton(this.scene, Math.ceil(width * 0.5 - 60 * this.dpr), Math.ceil(height * 0.5 - 268 * this.dpr), 106 * this.dpr, 40 * this.dpr, UIAtlasKey.commonKey, "yellow_btn", i18n.t("compose.make"), {
            left: 12 * this.dpr,
            top: 12 * this.dpr,
            right: 12 * this.dpr,
            bottom: 12 * this.dpr
        });
        makeBtn.setTextStyle({ fontSize: 16 * this.dpr, color: "#996600" });
        this.content.add(makeBtn);
        const materialConWdith = 360 * this.dpr, materialConHeight = 92 * this.dpr;
        this.materialCon = this.scene.make.container(undefined, false).setSize(materialConWdith, materialConHeight);
        this.content.add(this.materialCon);
        this.materialCon.setPosition(0, height * 0.5 - 230 * this.dpr);
        const materialbg = this.scene.make.image({ x: 0, y: 0, key: this.key, frame: "sourcelist_bg" });
        const materialTitle = this.scene.make.text({
            x: 0,
            y: -materialConHeight * 0.5 + 15 * this.dpr,
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
        const materialLine3 = this.scene.make.image({ x: 0, y: materialTitle.y + 18 * this.dpr, key: this.key, frame: "separator" });
        this.materialCon.add([materialbg, materialTitle, materialLine, materialLine2, materialLine3]);
        this.materialItemsCon = this.scene.make.container(undefined, false);
        this.add(this.materialItemsCon);
        this.materialItemsCon.setPosition(0, height- 230 * this.dpr);
        this.materialItemsCon.setSize(width, 50 * this.dpr);
        this.materialGameScroll = new GameScroller(this.scene, this.materialItemsCon, {
            x: this.materialItemsCon.x - materialConWdith / 2,
            y: this.materialItemsCon.y - this.materialItemsCon.height / 2,
            clickX: width / 2,
            clickY: this.materialItemsCon.y - 20 * zoom,
            width: this.materialItemsCon.width + 10 * this.dpr * zoom,
            height: this.materialItemsCon.height,
            value: -1,
            scrollMode: 1,
            bounds: [
                - width / 2,
                width / 2
            ],
            valuechangeCallback: (newValue) => {
                this.refreshPos(newValue);
            },
            cellupCallBack: (gameobject) => {
                this.onMaterialItemHandler(gameobject);
            }
        });
        const propFrame = this.scene.textures.getFrame(this.key, "bprint_bg_2");
        const capW = propFrame.width + 10 * this.dpr * zoom;
        const capH = propFrame.height + 12 * this.dpr * zoom;
        const tableConfig: GridTableConfig = {
            x: width * zoom / 2,
            y: height * zoom * 0.5 + 145 * this.dpr * zoom,
            table: {
                width: width * zoom,
                height: 175 * this.dpr * zoom,
                columns: 2,
                cellWidth: capW,
                cellHeight: capH,
                reuseCellContainer: true,
                cellPadX: 24 * this.dpr * zoom,
            },
            scrollMode: 1,
            clamplChildOY: false,
            // background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, .2),
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new ComposeItem(scene, this.key, this.dpr, zoom);
                    this.add(cellContainer);
                }
                // cellContainer.setSize(width, height);
                cellContainer.setItemData(item);
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
        this.add(this.mGrideTable.table);
        this.resize(width, height);
        super.init();
        this.setComposeData(this.mShowData.skills);
    }

    destroy() {
        super.destroy();
    }

    public setComposeData(datas: op_pkt_def.IPKT_Skill[]) {
        this.mGrideTable.setItems(datas);
    }

    public setComposeDetialData(data: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_CRAFT_QUERY_FORMULA) {
        this.mDetailBubble.setDetailData(data.productName, data.productDes);
        this.setDetailDisplay(data);
        this.setMaterialItems(data.materials);
    }

    private setDetailDisplay(data: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_CRAFT_QUERY_FORMULA) {
        const resData = new op_client.OP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_PACKAGE_ITEM_RESOURCE();
        resData.animations = data.productAnimations;
        resData.display = data.productDisplay;
        resData.avatar = data.productAvatar;
        if (resData.display) {
            this.mDetailDisplay.loadDisplay(resData);
        } else if (resData.avatar) {
            this.mDetailDisplay.loadAvatar(resData);
        } else {
            // this.mDetailDisplay.loadUrl(this.mSelectedProp.icon);
        }
    }

    private onSelectItemHandler(item: ComposeItem) {
        const data = item.itemData;
        this.emit("reqformula", data.id);
        item.select = true;
        if (this.mSelectItem) this.mSelectItem.select = false;
        this.mSelectItem = item;
    }
    private setMaterialItems(datas: op_client.ICountablePackageItem[]) {
        const len = datas.length;
        const width = this.screenWidth;
        const height = this.materialItemsCon.height;
        const zoom = this.scale;
        const offsetx = 0 * this.dpr;
        const itemWidth = this.mScene.textures.getFrame(this.key, "title_select").width;
        const allLen = (itemWidth + offsetx) * len - offsetx;
        this.materialItemsCon.width = allLen;
        const scrollOffsetX = allLen - width;
        const items = [];
        for (let i = 0; i < len; i++) {
            const item = new ComposeMaterialItem(this.scene, this.key, this.dpr, zoom);
            item.x = itemWidth * 0.5 + (itemWidth + offsetx) * i;
            item.y = 0;
            items.push(item);
            item.setItemData(datas[i]);
            this.materialItemsCon.add(item);
            this.materialGameScroll.setInteractiveObject(item);
            item.setData("itemData", datas[i]);
        }
        this.materialGameScroll.setValue(0);
        this.materialGameScroll.resize(width, height, -scrollOffsetX, 0);
    }
    private refreshPos(value: number) {
        const width = this.screenWidth;
        const conWidth = this.materialItemsCon.width;
        const conOffsetX = (width - conWidth) / 2;
        this.materialItemsCon.x = value + conOffsetX;
    }

    private onMaterialItemHandler(item: ComposeMaterialItem) {

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
    constructor(scene: Phaser.Scene, dpr: number, zoom: number = 1) {
        super(scene);
        this.dpr = dpr;
        this.mDetailBubble = this.scene.make.graphics(undefined, false);
        const bubbleW = 100 * dpr * zoom;
        const bubbleH = 96 * dpr * zoom;
        this.mDetailBubble = this.scene.make.graphics(undefined, false);
        this.mDetailBubble.fillStyle(0xFFFFFF, 0.1);
        this.mDetailBubble.fillRoundedRect(0, 0, bubbleW, bubbleH);
        this.mItemName = this.scene.make.text({
            x: 7 * this.dpr,
            y: 9 * this.dpr,
            text: "道具名称道具名称",
            style: {
                fontSize: 12 * this.dpr * zoom,
                fontFamily: Font.DEFULT_FONT,
                color: "#FFFF00",
                align: "center"
            }
        });
        this.mDesText = this.scene.make.text({
            x: 8 * dpr,
            y: 66 * dpr,
            style: {
                color: "#32347b",
                fontSize: 10 * dpr * zoom,
                fontFamily: Font.DEFULT_FONT,
                wordWrap: {
                    width: 90 * dpr,
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
    public itemData: op_pkt_def.PKT_Skill;
    private readonly dpr: number;
    private readonly key: string;
    private readonly zoom: number;
    private bg: Phaser.GameObjects.Image;
    private itemIcon: DynamicImage;
    private newIcon: Phaser.GameObjects.Image;
    private newText: Phaser.GameObjects.Text;
    private qualityIcon: Phaser.GameObjects.Image;
    private qualityTex: Phaser.GameObjects.Text;
    private qualifiedIcon: Phaser.GameObjects.Image;
    private lockbg: Phaser.GameObjects.Image;
    private lockIcon: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, key: string, dpr: number, zoom) {
        super(scene);
        this.dpr = dpr;
        this.key = key;
        this.zoom = zoom;
        this.bg = this.scene.make.image({ key: this.key, frame: "bprint_bg_1" });
        this.setSize(this.bg.width, this.bg.height);
        this.itemIcon = new DynamicImage(this.scene, 0, 0);
        this.newIcon = this.scene.make.image({ key: this.key, frame: "tag_new" });
        this.newText = this.scene.make.text({
            x: 7 * this.dpr,
            y: 9 * this.dpr,
            text: "N",
            style: {
                fontSize: 12 * this.dpr * zoom,
                fontFamily: Font.DEFULT_FONT,
                color: "#ffffff",
                align: "center"
            }
        });
        this.qualityIcon = this.scene.make.image({ key: this.key, frame: "tag_rank_a" });
        this.qualityTex = this.scene.make.text({
            x: 7 * this.dpr,
            y: 9 * this.dpr,
            text: "A",
            style: {
                fontSize: 12 * this.dpr * zoom,
                fontFamily: Font.DEFULT_FONT,
                color: "#ffffff",
                align: "center"
            }
        });
        this.qualifiedIcon = this.scene.make.image({ key: this.key, frame: "tag_ready" });
        this.lockbg = this.scene.make.image({ key: this.key, frame: "bprint_mask" });
        this.lockIcon = this.scene.make.image({ key: this.key, frame: "lock" });
        this.add([this.bg, this.itemIcon, this.newIcon, this.newText, this.qualityIcon, this.qualityTex, this.qualifiedIcon, this.lockbg, this.lockIcon]);
    }

    public setItemData(data: op_pkt_def.PKT_Skill) {
        this.itemData = data;
        this.qualityTex.text = data.quality;
        this.qualifiedIcon.visible = data.qualified;
        this.lockbg.visible = data.active;
        this.lockIcon.visible = data.active;
        this.setQualityTexture(data.quality);
        if (data.display) this.setItemIcon(data.display);
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
            this.itemIcon.scale = this.dpr * this.zoom;
            const x = -this.width * 0.5 + 18 * this.dpr * this.zoom;
            this.itemIcon.setPosition(x, 0);
        });
    }

    private setQualityTexture(quality: string) {
        if (quality === "A") this.qualityIcon.setFrame("tag_rank_a");
        else if (quality === "B") this.qualityIcon.setFrame("tag_rank_b");
        else if (quality === "C") this.qualityIcon.setFrame("tag_rank_c");
    }
}
class ComposeMaterialItem extends Phaser.GameObjects.Container {
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
        const bg = this.scene.make.image({ key: this.key, frame: "source_bg" });
        this.itemIcon = new DynamicImage(scene, 0, 0);
        this.itemCount = new BBCodeText(this.scene, 0, 0, {})
            .setOrigin(0, 0.5).setFontSize(10 * dpr).setFontFamily(Font.DEFULT_FONT);
        this.add([bg, this.itemIcon, this.itemCount]);
        this.setSize(bg.width, bg.height);
    }
    public setItemData(data: op_client.ICountablePackageItem) {
        this.itemData = data;
        this.itemCount.text = this.getCountText(data.count, data.neededCount);
        // this.itemIcon.setTexture();
        // const url = Url.getOsdRes(data.display.texturePath);
        // this.itemIcon.load(url, this, () => {
        //     this.itemIcon.scale = this.dpr * this.zoom;
        //     const x = -this.width * 0.5 + 18 * this.dpr * this.zoom;
        //     this.itemIcon.setPosition(x, 0);
        // });
    }

    private getCountText(count: number, needcount: number) {
        const color = (count >= needcount ? "#ffffff" : "#ff00000");
        const text = `[stroke=${color}][color=${color}]${count}:[/color][/stroke]/` + needcount;
        return text;
    }
}
