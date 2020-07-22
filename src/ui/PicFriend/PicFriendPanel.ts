import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { Font } from "../../utils/font";
import { op_client } from "pixelpai_proto";
import { DynamicImage } from "../components/dynamic.image";
import { BBCodeText, Button, NineSlicePatch } from "../../../lib/rexui/lib/ui/ui-components";
import { i18n } from "../../i18n";
import { GameGridTable } from "../../../lib/rexui/lib/ui/gridtable/GameGridTable";
import { GridTableConfig } from "../../../lib/rexui/lib/ui/gridtable/GridTableConfig";
import Text = Phaser.GameObjects.Text;
import Container = Phaser.GameObjects.Container;
import { GameScroller } from "../../../lib/rexui/lib/ui/scroller/GameScroller";
import { Url } from "../../utils/resUtil";
import { CoreUI } from "../../../lib/rexui/lib/ui/interface/event/MouseEvent";
import { NinePatchButton } from "../components/ninepatch.button";
import { UIAtlasName, UIAtlasKey } from "../ui.atals.name";
import { Handler } from "../../Handler/Handler";
import { CheckBox } from "../../../lib/rexui/lib/ui/checkbox/CheckBox";
export default class PicFriendPanel extends BasePanel {
    private key = "picfriendpanel";
    private bg: Phaser.GameObjects.Image;
    private labelText: Text;
    private closeBtn: Button;
    private content: Container;
    private mBackGround: Phaser.GameObjects.Graphics;
    private topContent: Container;
    private friendNum: Text;
    private onlineCheckBox: CheckBox;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
    }
    resize(width: number, height: number) {
        const w: number = this.scaleWidth;
        const h: number = this.scaleHeight;
        super.resize(width, height);
        this.setSize(w, h);
        this.mBackGround.clear();
        this.mBackGround.fillStyle(0x000000, 0.66);
        this.mBackGround.fillRect(0, 0, w, h);
        this.content.setPosition(w / 2, h / 2);
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
        this.closeBtn.on(CoreUI.MouseEvent.Tap, this.OnClosePanel, this);
    }

    public removeListen() {
        if (!this.mInitialized) return;
        this.closeBtn.off(CoreUI.MouseEvent.Tap, this.OnClosePanel, this);
    }

    preload() {
        this.addAtlas(this.key, "friend_list/friend_list.png", "friend_list/friend_list.json");
        this.addAtlas(UIAtlasKey.commonKey, UIAtlasName.commonUrl + ".png", UIAtlasName.commonUrl + ".json");
        super.preload();
    }
    init() {
        const zoom = this.scale;
        const wid: number = this.scaleWidth;
        const hei: number = this.scaleHeight;
        this.mBackGround = this.scene.make.graphics(undefined, false);
        this.mBackGround.clear();
        this.mBackGround.fillStyle(0x6AE2FF, 0);
        this.mBackGround.fillRect(0, 0, wid * zoom, hei * zoom);
        this.mBackGround.setInteractive(new Phaser.Geom.Rectangle(0, 0, wid, hei), Phaser.Geom.Rectangle.Contains);
        this.bg = this.scene.make.image({ x: 0, y: 0, key: this.key, frame: "phone" });
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(this.bg.width, this.bg.height);
        this.content.add(this.bg);
        const posY = -this.bg.height * 0.5 + 43 * this.dpr;
        this.friendNum = this.scene.make.text({ x: 0, y: posY, text: "Number of friends: 96 / 100", style: { color: "#ffffff", fontSize: 12 * this.dpr, fontFamily: Font.DEFULT_FONT } });
        this.content.add(this.friendNum);
        const mfont = `bold ${15 * this.dpr}px ${Font.DEFULT_FONT}`;
        this.labelText = this.scene.make.text({ x: 0, y: posY, text: i18n.t("friendlist.title"), style: { font: mfont, bold: true, color: "#0" } }).setOrigin(0.5, 0);
        this.content.add(this.labelText);
        this.closeBtn = new Button(this.scene, UIAtlasKey.commonKey, "close");
        this.closeBtn.setPosition(this.content.width * 0.5 - this.dpr * 30, posY - this.dpr * 10);
        this.content.add(this.closeBtn);
        this.topContent = this.scene.make.container(undefined, false);
        this.content.add(this.topContent);
        const topbg = new NineSlicePatch(this.scene, 0, 0, 276 * this.dpr, 33 * this.dpr, this.key, "min_pic_bg", {
            left: 5 * this.dpr,
            top: 5 * this.dpr,
            right: 5 * this.dpr,
            bottom: 5 * this.dpr
        });
        this.onlineCheckBox = new CheckBox(this.scene, this.key, "online_unchecked", "online_checked");
        const boxtitle = this.scene.make.text({ x: 0, y: posY, text: i18n.t("friendlist.olinetitle"), style: { font: mfont, bold: true, color: "#0" } });
        this.onlineCheckBox.add(boxtitle);
        this.content.add(this.onlineCheckBox);
        const line2 = this.scene.make.image({ x: 0, y: + 10 * this.dpr, key: this.key, frame: "splitters" });

        this.resize(wid, hei);
        super.init();
        this.reqPlayerInfo();
    }

    reqPlayerInfo() {
        this.emit("queryOwnerInfo");
    }

    public destroy() {

        super.destroy();
    }

    private createGrideTable(x: number, y: number, width: number, height: number, capW: number, capH: number, createFun: Function, callback: Handler) {
        const tableConfig: GridTableConfig = {
            x,
            y,
            table: {
                width,
                height,
                columns: 3,
                cellWidth: capW,
                cellHeight: capH,
                reuseCellContainer: true,
                cellPadX: 24 * this.dpr
            },
            scrollMode: 1,
            clamplChildOY: false,
            // background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, .2),
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = createFun();
                    this.content.add(cellContainer);
                }
                cellContainer.setData({ item });
                cellContainer.setItemData(item);
                return cellContainer;
            },
        };
        const grid = new GameGridTable(this.scene, tableConfig);
        grid.layout();
        grid.on("cellTap", (cell) => {
            if (cell) {
                callback.runWith(cell);
            }
        });
        this.content.add(grid.table);
        return grid;
    }

    private OnClosePanel() {
        this.emit("hide");
    }

    private onSelectItemHandler(item) {

    }

    private getRichLabel(text: string, color = "#2B4BB5") {
        const label = `[stroke=${color}][color=${color}]${text}:[/color][/stroke]`;
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

class PicFriendItem extends Container {
    public itemData: any;
    private nameText: Text;
    private lvText: Text;
    private icon: DynamicImage;
    private dpr: number = 0;
    private zoom: number = 0;
    private key: string;
    constructor(scene: Phaser.Scene, x: number, y: number, key: string, dpr: number, zoom: number = 1) {
        super(scene, x, y);
        const bg = this.scene.make.image({ x: 0, y: 0, key, frame: "skill_bg" });
        this.icon = new DynamicImage(this.scene, -bg.width * 0.5 + 22 * dpr, 0);
        this.add([bg, this.icon, this.nameText, this.lvText]);
        this.setSize(bg.width, bg.height);
        this.dpr = dpr;
        this.zoom = zoom;
        this.key = key;
        // this.progressBar.setProgress(1, 100);
    }

    public setItemData(data, isOwner: boolean = false) {
        this.itemData = data;
        this.nameText.text = data.name;
        const posY = (isOwner ? -16 * this.dpr * this.zoom : -11 * this.dpr * this.zoom);
        const offsetY = (isOwner ? 20 * this.dpr * this.zoom : 25 * this.dpr * this.zoom);
        const cheight = 10 * this.dpr * this.zoom;
        this.nameText.y = posY + cheight * 0.5;
        this.icon.setTexture(this.key, "test_skillicon");
        const width = this.icon.width;
        if (data.level) {
            this.lvText.text = data.level.level;
            this.lvText.y = posY + offsetY;
        }
        const url = Url.getOsdRes(data.display.texturePath);
        this.icon.load(url, this, () => {
            this.icon.scale = this.dpr * this.zoom;
            const x = -this.width * 0.5 + width * 0.5 + 6 * this.dpr * this.zoom;
            this.icon.setPosition(x, 0);
        });

    }
}

class PicFriendButton extends Container {
    public itemData: any;
    private nameText: Text;
    private lvText: Text;
    private icon: DynamicImage;
    private dpr: number = 0;
    private zoom: number = 0;
    private key: string;
    constructor(scene: Phaser.Scene, x: number, y: number, key: string, dpr: number, zoom: number = 1) {
        super(scene, x, y);
        const bg = this.scene.make.image({ x: 0, y: 0, key, frame: "skill_bg" });
        this.icon = new DynamicImage(this.scene, -bg.width * 0.5 + 22 * dpr, 0);
        this.add([bg, this.icon, this.nameText, this.lvText]);
        this.setSize(bg.width, bg.height);
        this.dpr = dpr;
        this.zoom = zoom;
        this.key = key;
        // this.progressBar.setProgress(1, 100);
    }

    public setItemData(data, isOwner: boolean = false) {
        this.itemData = data;
        this.nameText.text = data.name;
        const posY = (isOwner ? -16 * this.dpr * this.zoom : -11 * this.dpr * this.zoom);
        const offsetY = (isOwner ? 20 * this.dpr * this.zoom : 25 * this.dpr * this.zoom);
        const cheight = 10 * this.dpr * this.zoom;
        this.nameText.y = posY + cheight * 0.5;
        this.icon.setTexture(this.key, "test_skillicon");
        const width = this.icon.width;
        if (data.level) {
            this.lvText.text = data.level.level;
            this.lvText.y = posY + offsetY;
        }
        const url = Url.getOsdRes(data.display.texturePath);
        this.icon.load(url, this, () => {
            this.icon.scale = this.dpr * this.zoom;
            const x = -this.width * 0.5 + width * 0.5 + 6 * this.dpr * this.zoom;
            this.icon.setPosition(x, 0);
        });

    }
}
