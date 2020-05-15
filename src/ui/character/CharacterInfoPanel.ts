import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { Font } from "../../utils/font";
import { NinePatch } from "../components/nine.patch";
import { op_client } from "pixelpai_proto";
import { DynamicImage } from "../components/dynamic.image";
import { BBCodeText, Button } from "../../../lib/rexui/lib/ui/ui-components";
import { Player } from "../../rooms/player/player";
import { i18n } from "../../i18n";
import { GameScroller } from "../../../lib/rexui/lib/ui/scroller/Scroller";
import { GameGridTable } from "../../../lib/rexui/lib/ui/gridtable/GameGridTable";
import { GridTableConfig } from "../../../lib/rexui/lib/ui/gridtable/GridTableConfig";
import { Url } from "../../utils/resUtil";
import { Logger } from "../../utils/log";

export default class CharacterInfoPanel extends BasePanel {
    private key = "player_info";
    private commonkey = "common_key";
    // private mBackground: Phaser.GameObjects.Graphics;
    private bg: Phaser.GameObjects.Image;
    private labelText: Phaser.GameObjects.Text;
    private closeBtn: Button;
    private avatar: Player;
    private content: Phaser.GameObjects.Container;
    private lvCon: Phaser.GameObjects.Container;
    private lvText: Phaser.GameObjects.Text;
    private nickName: BBCodeText;
    private idText: BBCodeText;
    private titleName: BBCodeText;
    private likeBtn: Button;
    private nickEditor: Button;
    private bottomCon: Phaser.GameObjects.Container;
    private bottombg: Phaser.GameObjects.Graphics;
    private mCategoryScroll: GameScroller;
    private mCategeoriesCon: Phaser.GameObjects.Container;
    private mGrideTable: GameGridTable;
    private curSelectCategeory: Button;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
    }
    resize(width: number, height: number) {
        const w: number = this.scene.cameras.main.width;
        const h: number = this.scene.cameras.main.height;
        super.resize(width, height);
        this.bottombg.clear();
        this.bottombg.fillStyle(0x6f75ff, 1);
        this.bottombg.fillRect(-this.bottomCon.width * 0.5, -this.bottomCon.height * 0.5, this.bottomCon.width, this.bottomCon.height);
        this.content.setPosition(w / 2, h / 2);
        this.setSize(w, h);
        this.content.setInteractive();
    }

    public show(param?: any) {
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

    public addListen() {
        if (!this.mInitialized) return;
        this.closeBtn.on("pointerup", this.OnClosePanel, this);
    }

    public removeListen() {
        if (!this.mInitialized) return;
        this.closeBtn.off("pointerup", this.OnClosePanel, this);
    }

    preload() {
        this.addAtlas(this.key, "player_info/player_info.png", "player_info/player_info.json");
        this.addAtlas(this.commonkey, "common/ui_base.png", "common/ui_base.json");
        super.preload();
    }
    init() {
        const w = this.scene.cameras.main.width;
        const h = this.scene.cameras.main.height;
        const zoom = this.scale;
        this.setSize(w, h);
        this.content = this.scene.make.container(undefined, false);
        // this.mBackground = this.scene.make.graphics(undefined, false);
        this.bg = this.scene.make.image({ x: 0, y: 0, key: this.key, frame: "bg" });
        this.content.setSize(this.bg.width, this.bg.height);
        const posY = -this.bg.height * 0.5 + 43 * this.dpr * zoom;
        const mfont = `bold ${15 * this.dpr}px Source Han Sans`;
        this.labelText = this.scene.make.text({ x: 0, y: posY, text: i18n.t("player_info.title"), style: { font: mfont, blod: true, color: "#ffffff", fontSize: 15 * this.dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5, 0);
        this.labelText.setStroke("#8F4300", 1);
        this.closeBtn = new Button(this.scene, this.commonkey, "close");
        this.closeBtn.setPosition(this.bg.width * 0.5 - this.dpr * 5 * zoom, posY + this.dpr * 5);
        this.likeBtn = new Button(this.scene, this.key, "praise_bef", "999");
        this.likeBtn.setPosition(this.bg.width * 0.5 - 10 * this.dpr * zoom, posY + 50 * this.dpr * zoom);
        const nickPosX = -this.bg.width * 0.5 + 25 * this.dpr * zoom;
        const nickPosY = this.bg.height * 0.5 - 306 * this.dpr * zoom;
        const nickOffsetY = 30 * this.dpr * zoom;
        this.nickName = new BBCodeText(this.scene, nickPosX, nickPosY).setFontSize(13 * this.dpr * zoom).setOrigin(0, 0.5);
        this.nickEditor = new Button(this.scene, this.key, "edit", "edit");
        this.nickEditor.setPosition(-nickPosX - 30 * this.dpr * zoom, nickPosY);
        this.idText = new BBCodeText(this.scene, nickPosX, nickPosY + nickOffsetY).setFontSize(13 * this.dpr * zoom).setOrigin(0, 0.5);
        this.titleName = new BBCodeText(this.scene, nickPosX, nickPosY + nickOffsetY * 2).setFontSize(13 * this.dpr * zoom).setOrigin(0, 0.5);
        const lvbg = this.scene.make.image({ x: 0, y: 0, key: this.key, frame: "level_bg" });
        this.lvText = this.scene.make.text({ x: 0, y: 0, text: "lv 98", style: { color: "#996600", fontSize: 12 * this.dpr * zoom, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5, 0.5);
        this.lvCon = this.scene.make.container(undefined, false);
        this.lvCon.setSize(lvbg.width, lvbg.height);
        this.lvCon.add([lvbg, this.lvText]);
        const bottomWidth = 234 * this.dpr * zoom;
        const bottomHeight = 195 * this.dpr * zoom;
        this.bottomCon = this.scene.make.container(undefined, false).setSize(bottomWidth, bottomHeight);
        this.bottomCon.setPosition(-6 * this.dpr * zoom, (this.content.height - bottomHeight) * 0.5 - 30 * this.dpr * zoom);
        this.bottombg = this.scene.make.graphics(undefined, false);
        this.mCategeoriesCon = this.scene.make.container(undefined, false);
        this.mCategeoriesCon.x = w * 0.5;
        this.mCategeoriesCon.y = h - 270 * this.dpr * this.scale;
        this.mCategeoriesCon.height = 41 * this.dpr * this.scale;
        this.mCategoryScroll = new GameScroller(this.scene, this.mCategeoriesCon, {
            x: (w - bottomWidth) / 2,
            y: this.mCategeoriesCon.y - this.mCategeoriesCon.height * 0.5,
            clickX: w / 2 - 6 * this.dpr * zoom,
            clickY: this.mCategeoriesCon.y - 20 * this.dpr * zoom,
            width: bottomWidth,
            height: this.mCategeoriesCon.height,
            value: -bottomWidth / 2,
            orientation: 1,
            bounds: [
                - bottomWidth / 2,
                bottomWidth / 2
            ],
            valuechangeCallback: (newValue) => {
                this.refreshPos(newValue);
            },
            cellupCallBack: (gameobject) => {
                this.onSelectSubCategoryHandler(gameobject);
            }
        });
        const propFrame = this.scene.textures.getFrame(this.key, "skill_bg");
        const capW = (propFrame.width + 10 * this.dpr) * zoom;
        const capH = (propFrame.height + 10 * this.dpr) * zoom;
        const tableConfig: GridTableConfig = {
            x: 0,
            y: 0,
            table: {
                width: this.scene.cameras.main.width - 20 * this.dpr * zoom,
                height: 250 * this.dpr * zoom,
                columns: 4,
                cellWidth: capW,
                cellHeight: capH,
                reuseCellContainer: true,
            },
            scrollMode: 1,
            clamplChildOY: false,
            // background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, .2),
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new CharacterOwnerItem(scene, 0, 0, this.key, this.dpr, zoom);
                    this.bottomCon.add(cellContainer);
                }
                // cellContainer.setSize(width, height);
                cellContainer.setData({ item });
                cellContainer.setProp(item);
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
        this.bottomCon.add(this.bottombg);
        this.content.add([this.bg, this.closeBtn, this.likeBtn, this.labelText, this.nickName, this.nickEditor, this.idText, this.titleName, this.lvCon, this.bottomCon]);
        this.add(this.content);
        this.add(this.mCategeoriesCon);
        this.resize(w, h);
        super.init();
        this.setPlayerData();
    }

    destroy() {
    }
    private OnClosePanel() {
        this.emit("hide");
    }

    private setPlayerData() {
        const data = { nickname: "好友昵称七个字", id: "98655489898", lv: 98, maxExp: 9000, exp: 800, title: "无畏勇者先锋号", friend: true, islike: true };
        const isOwner = true;
        const zoom = this.scale;
        this.nickName.setText(this.getRichLabel(i18n.t("player_info.nick_name")) + data.nickname);
        this.titleName.setText(this.getRichLabel(i18n.t("player_info.player_title")) + data.title);
        if (isOwner) {
            this.idText.setText(this.getRichLabel(i18n.t("player_info.player_lv")) + this.getspaceStr(3 * this.dpr) + data.exp + "/" + data.maxExp);
            this.lvCon.setPosition(this.idText.x + 70 * this.dpr * zoom, this.idText.y);
        } else {
            this.idText.setText(this.getRichLabel("ID") + " " + data.id);
            this.lvCon.setPosition(this.idText.x + this.lvCon.width * 0.5, -this.content.height * 0.5 + 100 * this.dpr * zoom);
        }
        this.setSubCategory(null);
    }

    private setSubCategory(data) {
        const arr = ["生活", "徽章", "称号"];
        const items = [];
        const len = arr.length;
        const h = 41 * this.dpr * this.scale;
        const conWidth = this.bottomCon.width;
        const offsetx = 0 * this.dpr * this.scale;
        const itemWidth = this.mScene.textures.getFrame(this.key, "title_select").width;
        const allLen = (itemWidth + offsetx) * len - offsetx;
        this.mCategeoriesCon.setSize(allLen, h);
        const scrollOffsetX = allLen - conWidth;
        for (let i = 0; i < len; i++) {
            const item = new Button(this.scene, this.key, "title_normal", "title_select", arr[i]);
            item.x = itemWidth * 0.5 + (itemWidth + offsetx) * i - 6 * this.dpr * this.scale;
            item.y = 0;
            items.push(item);
            item.setTextStyle({ color: "#996600", fontSize: 12 * this.dpr * this.scale, fontFamily: Font.DEFULT_FONT });
            this.mCategeoriesCon.add(item);
            this.mCategoryScroll.setInteractiveObject(item);
            item.disInteractive();
            item.removeListen();
        }
        // this.mCategoryScroll.setValue(0);
        this.mCategoryScroll.resize(conWidth, h, -scrollOffsetX, 0);
    }
    private onSelectSubCategoryHandler(obj: Button) {
        Logger.getInstance().log(obj);
        if (this.curSelectCategeory) this.curSelectCategeory.changeNormal();
        obj.changeDown();
        this.curSelectCategeory = obj;
    }

    private refreshPos(value) {
        const w = this.scene.cameras.main.width;
        const conWidth = this.bottomCon.width;
        const conOffsetX = (w - conWidth) / 2;
        const allLen = this.mCategeoriesCon.width;
        const isScroll = (allLen > conWidth ? true : false);
        this.mCategeoriesCon.x = (isScroll ? value + conOffsetX : (w - allLen) / 2);
        Logger.getInstance().log(value);
    }
    private onSelectItemHandler(item) {

    }

    private getRichLabel(text: string, color = "#0062BB") {
        const label = `[color=${color}]${text}:  [/color]`;
        return label;
    }
    private getspaceStr(num: number) {
        let str = "";
        for (let i = 0; i < num; i++) {
            str += " ";
        }
        return str;
    }
}

export class CharacterOwnerItem extends Phaser.GameObjects.Container {
    public itemData: any;
    private nameText: Phaser.GameObjects.Text;
    private lvText: Phaser.GameObjects.Text;
    private icon: DynamicImage;
    private progressBar: GraphicsProgressBar;
    private dpr: number = 0;
    private zoom: number = 0;
    private key: string;
    constructor(scene: Phaser.Scene, x: number, y: number, key: string, dpr: number, zoom: number = 1) {
        super(scene, x, y);
        const bg = this.scene.make.image({ x: 0, y: 0, key, frame: "skill_bg" });
        this.nameText = this.scene.make.text({ x: 0, y: 0, text: "lv 98", style: { color: "#996600", fontSize: 12 * dpr * zoom, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5, 0.5);
        this.lvText = this.scene.make.text({ x: 0, y: 0, text: "lv 98", style: { color: "#996600", fontSize: 12 * dpr * zoom, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5, 0.5);
        this.progressBar = new GraphicsProgressBar(this.scene, 0, 0, 41 * dpr * zoom, 4 * dpr * zoom);
        this.icon = new DynamicImage(this.scene, -bg.width * 0.5, 0);
        this.add([bg, this.nameText, this.lvText, this.progressBar]);
        this.setSize(bg.width, bg.height);
        this.dpr = dpr;
        this.zoom = zoom;
        this.key = key;
    }

    public setItemData(data, isOwner: boolean = true) {
        this.nameText.text = "农业学识";
        this.lvText.text = "大师级";
        this.progressBar.setRoundedRectValue(0.5, 3 * this.dpr * this.zoom);
        const posY = (isOwner ? 8 * this.dpr * this.zoom : 11 * this.dpr * this.zoom);
        const offsetY = (isOwner ? 8 * this.dpr * this.zoom : 15 * this.dpr * this.zoom);
        const cheight = 10 * this.dpr * this.zoom;
        this.nameText.y = posY + cheight * 0.5;
        this.lvText.y = posY + cheight * 1.5;
        this.progressBar.visible = isOwner;
        this.icon.setTexture(this.key, "test_skillicon");
        // const url = Url.getOsdRes(data.display.texturePath);
        // this.icon.load(url, this, () => {
        //     this.icon.scale = this.dpr * this.zoom;
        //     const x = -this.width * 0.5 + 18 * this.dpr * this.zoom;
        //     this.icon.setPosition(x, 0);
        // });
    }
}

export class GraphicsProgressBar extends Phaser.GameObjects.Container {
    private bgGraphics: Phaser.GameObjects.Graphics;
    private barGraphics: Phaser.GameObjects.Graphics;
    private barColor: number;
    private bgColor: number;
    private isHorizontal: boolean;
    private value: number = 0.5;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, isHorizontal: boolean = true) {
        super(scene, x, y);
        this.bgGraphics = this.scene.make.graphics(undefined, false);
        this.barGraphics = this.scene.make.graphics(undefined, false);
        this.add([this.bgGraphics, this.barGraphics]);
        this.setSize(width, height);
        this.bgColor = 0x000000;
        this.barColor = 0xff00000;
        this.bgGraphics.clear();
        this.bgGraphics.fillStyle(this.bgColor, 1);
        this.bgGraphics.fillRect(0, 0, this.width, this.height);
        this.setValue(this.value);
    }
    public setColor(barColor: number, bgColor?: number) {
        this.barColor = barColor;
        if (bgColor) this.bgColor = bgColor;
        this.bgGraphics.clear();
        this.bgGraphics.fillStyle(this.bgColor, 1);
        this.bgGraphics.fillRect(0, 0, this.width, this.height);
        this.setValue(this.value);
    }

    public setValue(value: number) {
        this.value = value;
        const width = this.width * (this.isHorizontal ? value : 1);
        const height = this.height * (!this.isHorizontal ? value : 1);
        this.barGraphics.clear();
        this.barGraphics.fillStyle(this.barColor, 1);
        this.barGraphics.fillRect(0, 0, width, height);
    }
    public setRoundedRectValue(value: number, radius: number) {
        this.value = value;
        const width = this.width * (this.isHorizontal ? value : 1);
        const height = this.height * (!this.isHorizontal ? value : 1);
        this.barGraphics.clear();
        this.barGraphics.fillStyle(this.barColor, 1);
        this.barGraphics.fillRoundedRect(0, 0, width, height, radius);
    }
}
