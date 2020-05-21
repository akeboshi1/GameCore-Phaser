import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { Font } from "../../utils/font";
import { op_client } from "pixelpai_proto";
import { DynamicImage } from "../components/dynamic.image";
import { BBCodeText, Button } from "../../../lib/rexui/lib/ui/ui-components";
import { i18n } from "../../i18n";
import { GameScroller } from "../../../lib/rexui/lib/ui/scroller/Scroller";
import { GameGridTable } from "../../../lib/rexui/lib/ui/gridtable/GameGridTable";
import { GridTableConfig } from "../../../lib/rexui/lib/ui/gridtable/GridTableConfig";
import { Logger } from "../../utils/log";
import { NinePatchButton } from "../components/ninepatch.button";
import { DragonbonesDisplay } from "../../rooms/display/dragonbones.display";
import { DragonbonesModel } from "../../rooms/display/dragonbones.model";
import { ProgressBar } from "../../../lib/rexui/lib/ui/progressbar/ProgressBar";
import { CharacterEditorPanel } from "./CharacterEditorPanel";
import Text = Phaser.GameObjects.Text;
import Container = Phaser.GameObjects.Container;
export default class CharacterInfoPanel extends BasePanel {
    private key = "player_info";
    private commonkey = "common_key";
    private bg: Phaser.GameObjects.Image;
    private labelText: Text;
    private closeBtn: Button;
    private avatar: DragonbonesDisplay;
    private content: Container;
    private mainContent: Container;
    private lvCon: Container;
    private lvText: Text;
    private nickName: BBCodeText;
    private idText: BBCodeText;
    private titleName: BBCodeText;
    private likeBtn: Button;
    private nickEditor: Button;
    private bottomCon: Container;
    private bottombg: Phaser.GameObjects.Graphics;
    private addFriendBtn: NinePatchButton;
    private tradeBtn: NinePatchButton;
    private privaCharBtn: NinePatchButton;
    private mCategoryScroll: GameScroller;
    private mCategeoriesCon: Container;
    private mGrideTable: GameGridTable;
    private editorPanel: CharacterEditorPanel;
    private curSelectCategeory: Button;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        this.scale = 1;
    }
    resize(width: number, height: number) {
        const w: number = this.scene.cameras.main.width / this.scale;
        const h: number = this.scene.cameras.main.height / this.scale;
        super.resize(width, height);
        this.content.setPosition(w / 2, h / 2);
        this.setSize(w, h);
        this.mGrideTable.refreshPos(w / 2 + 6 * this.dpr * this.scale, h / 2 + 180 * this.dpr * this.scale);
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
        this.closeBtn.on("Tap", this.OnClosePanel, this);
    }

    public removeListen() {
        if (!this.mInitialized) return;
        this.closeBtn.off("Tap", this.OnClosePanel, this);
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
        this.bg = this.scene.make.image({ x: 0, y: 0, key: this.key, frame: "bg" });
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(this.bg.width, this.bg.height);
        this.mainContent = this.scene.make.container(undefined, false);
        this.mainContent.setSize(this.bg.width, this.bg.height);
        const posY = -this.bg.height * 0.5 + 43 * this.dpr;
        const mfont = `bold ${15 * this.dpr}px Source Han Sans`;
        this.labelText = this.scene.make.text({ x: 0, y: posY, text: i18n.t("player_info.title"), style: { font: mfont, bold: true, color: "#ffffff", fontSize: 15 * this.dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5, 0);
        this.labelText.setStroke("#8F4300", 1);
        this.closeBtn = new Button(this.scene, this.commonkey, "close");
        this.closeBtn.setPosition(this.mainContent.width * 0.5 - this.dpr * 30, posY - this.dpr * 10);
        this.likeBtn = new Button(this.scene, this.key, "praise_bef", "praise_bef", "999");
        this.likeBtn.setTextStyle({ fontSize: 13 * this.dpr, fontFamily: Font.DEFULT_FONT });
        this.likeBtn.text.setOrigin(0, 0.5).x += 10 * this.dpr;
        this.likeBtn.setPosition(this.bg.width * 0.5 - 50 * this.dpr, posY + 50 * this.dpr);
        this.avatar = new DragonbonesDisplay(this.scene, undefined);
        this.avatar.scale = this.dpr * 2;
        this.avatar.x = 0;
        this.avatar.y = -50 * this.dpr;
        this.avatar.once("initialized", () => {
            this.avatar.play({ animationName: "idle", flip: false });
        });

        const nickPosX = Math.round(-this.bg.width * 0.5 + 25 * this.dpr);
        const nickPosY = Math.round(this.bg.height * 0.5 - 306 * this.dpr);
        const nickOffsetY = 30 * this.dpr;
        const fontSize = Math.round(13 * this.dpr);
        this.nickName = new BBCodeText(this.scene, nickPosX, nickPosY, {})
            .setOrigin(0, 0.5).setFontSize(fontSize).setFontFamily(Font.DEFULT_FONT);
        this.nickEditor = new Button(this.scene, this.key, "edit", "edit");
        this.nickEditor.setPosition(this.bg.width * 0.5 - 30 * this.dpr, nickPosY);
        const line1 = this.scene.make.image({ x: 0, y: nickPosY + 10 * this.dpr, key: this.key, frame: "splitters" });
        this.idText = new BBCodeText(this.scene, nickPosX, nickPosY + nickOffsetY)
            .setFontSize(fontSize).setOrigin(0, 0.5).setFontFamily(Font.DEFULT_FONT);
        const line2 = this.scene.make.image({ x: 0, y: this.idText.y + 10 * this.dpr, key: this.key, frame: "splitters" });
        this.titleName = new BBCodeText(this.scene, nickPosX, nickPosY + nickOffsetY * 2)
            .setFontSize(fontSize).setOrigin(0, 0.5).setFontFamily(Font.DEFULT_FONT);
        const line3 = this.scene.make.image({ x: 0, y: this.titleName.y + 10 * this.dpr, key: this.key, frame: "splitters" });
        const lvbg = this.scene.make.image({ x: 0, y: 0, key: this.key, frame: "level_bg" });
        this.lvText = this.scene.make.text({ x: 0, y: 0, text: "lv 98", style: { color: "#996600", fontSize, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5, 0.5);
        this.lvCon = this.scene.make.container(undefined, false);
        this.lvCon.setSize(lvbg.width, lvbg.height);
        this.lvCon.add([lvbg, this.lvText]);

        const bottomWidth = 234 * this.dpr;
        const bottomHeight = 195 * this.dpr;
        this.bottomCon = this.scene.make.container(undefined, false).setSize(bottomWidth, bottomHeight);
        this.bottomCon.setPosition(0, (this.mainContent.height - bottomHeight) * 0.5 - 30 * this.dpr);
        this.bottombg = this.scene.make.graphics(undefined, false);
        const bottomBtnPosx = - 60 * this.dpr;
        const bottomBtnPosy = this.bottomCon.height * 0.5 - 20 * this.dpr;
        this.addFriendBtn = new NinePatchButton(this.scene, bottomBtnPosx, bottomBtnPosy, 94 * this.dpr, 37 * this.dpr, this.key, "button_g", i18n.t("player_info.add_friend"), {
            left: 12 * this.dpr,
            top: 12 * this.dpr,
            right: 12 * this.dpr,
            bottom: 12 * this.dpr
        });
        this.addFriendBtn.setFrameNormal("button_g");
        this.privaCharBtn = new NinePatchButton(this.scene, bottomBtnPosx, bottomBtnPosy, 94 * this.dpr, 37 * this.dpr, this.commonkey, "yellow_btn", i18n.t("player_info.private_chat"), {
            left: 12 * this.dpr,
            top: 12 * this.dpr,
            right: 12 * this.dpr,
            bottom: 12 * this.dpr
        });

        this.tradeBtn = new NinePatchButton(this.scene, -bottomBtnPosx, bottomBtnPosy, 94 * this.dpr, 37 * this.dpr, this.commonkey, "red_btn", i18n.t("player_info.tade_btn"), {
            left: 12 * this.dpr,
            top: 12 * this.dpr,
            right: 12 * this.dpr,
            bottom: 12 * this.dpr
        });
        this.mCategeoriesCon = this.scene.make.container(undefined, false);
        this.mCategeoriesCon.setSize(bottomWidth, 41 * this.dpr);
        this.mCategeoriesCon.x = 0; // w - this.mCategeoriesCon.width >> 1;
        this.mCategeoriesCon.y = h * 0.5 + 62 * this.dpr * zoom;
        this.addFriendBtn.setTextStyle({ fontSize: 16 * this.dpr, color: "#000000" });
        this.privaCharBtn.setTextStyle({ fontSize: 16 * this.dpr, color: "#996600" });
        this.tradeBtn.setTextStyle({ fontSize: 16 * this.dpr, color: "#ffffff" });
        this.bottomCon.add([this.bottombg, this.addFriendBtn, this.privaCharBtn, this.tradeBtn]);
        this.mainContent.add([this.closeBtn, this.likeBtn, this.labelText, line1, line2, line3, this.nickName, this.nickEditor, this.idText, this.titleName, this.lvCon, this.bottomCon]);
        this.mainContent.add(this.avatar);
        this.content.add(this.bg);
        this.content.add(this.mainContent);
        this.add(this.content);
        this.add(this.mCategeoriesCon);
        this.mCategoryScroll = new GameScroller(this.scene, this.mCategeoriesCon, {
            x: w - this.mCategeoriesCon.width >> 1,
            y: this.mCategeoriesCon.y - this.mCategeoriesCon.height / 2,
            clickX: w >> 1,
            clickY: this.mCategeoriesCon.y,
            width: bottomWidth + 2 * this.dpr * zoom,
            height: this.mCategeoriesCon.height,
            value: 0,
            orientation: 1,
            // 下面的边界偏移主要是为了用于，非全屏模式下的滚动，利用偏移，将滚动范围从全屏幕两边减去对应的数值，达到滚动显示正确效果
            boundPad0: w - bottomWidth + 108 * this.dpr * zoom,
            boundPad1: w - bottomWidth + 10 * this.dpr * zoom,
            // bounds: [
            //     - bottomWidth / 2,
            //     bottomWidth / 2
            // ],
            valuechangeCallback: (newValue) => {
                this.refreshPos(newValue);
            },
            cellupCallBack: (gameobject) => {
                this.onSelectSubCategoryHandler(gameobject);
            }
        });
        const propFrame = this.scene.textures.getFrame(this.key, "skill_bg");
        const capW = propFrame.width + 5 * this.dpr * zoom;
        const capH = propFrame.height + 2 * this.dpr * zoom;
        const tableConfig: GridTableConfig = {
            x: w / 2,
            y: h * 0.5 + 145 * this.dpr * zoom,
            table: {
                width: (this.bottomCon.width - 10 * this.dpr) * zoom,
                height: 170 * this.dpr * zoom,
                columns: 3,
                cellWidth: capW,
                cellHeight: capH,
                reuseCellContainer: true,
                cellPadX: 24 * this.dpr * zoom
                // cellOriginX:0.5,
                // cellOriginY:0.5,
            },
            scrollMode: 1,
            clamplChildOY: false,
            // background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, .2),
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new CharacterOwnerItem(scene, 0, 0, this.key, this.dpr, zoom);
                    this.add(cellContainer);
                }
                // cellContainer.setSize(width, height);
                cellContainer.setData({ item });
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
        this.nickEditor.on("Tap", this.onEditorHandler, this);
        this.privaCharBtn.on("Tap", this.onPrivateChatHandler, this);
        this.addFriendBtn.on("Tap", this.onAddFriendHandler, this);
        this.tradeBtn.on("Tap", this.onTradingHandler, this);
        this.resize(w, h);
        super.init();
        this.setPlayerData(this.mShowData);
    }

    public setPlayerData(data: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_SELF_PLAYER_INFO | op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ANOTHER_PLAYER_INFO) {
        const nickname = data.nickname;
        const current_title = data.currentTitle;
        const exp = data.level.currentLevelExp;
        const nexExp = data.level.nextLevelExp;
        const cid = data.id;
        const levle = data.level.level;
        const spaceOffset = this.getspaceStr(1 * this.dpr);
        this.avatar.load(new DragonbonesModel({
            id: 0,
            avatar: data.currentAvatar.avatar
        }));
        this.titleName.setText(this.getRichLabel(i18n.t("player_info.player_title")) + spaceOffset + current_title);
        this.likeBtn.setText(data.like + "");
        const likeposx = this.bg.width * 0.5 - this.likeBtn.width * 0.5 - this.likeBtn.text.width;
        this.likeBtn.x = likeposx - 20 * this.dpr;
        this.lvText.text = "Lv" + levle + "";
        const subArr: any[] = [data.lifeSkills, data.badges];
        if (data instanceof op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_SELF_PLAYER_INFO) {
            this.nickName.setText(this.getRichLabel(i18n.t("player_info.nick_name")) + spaceOffset + nickname);
            this.idText.setText(this.getRichLabel(i18n.t("player_info.player_lv")) + this.getspaceStr(7 * this.dpr) + exp + "/" + nexExp);
            this.lvCon.setPosition(this.idText.x + 60 * this.dpr, this.idText.y);
            this.likeBtn.setFrame("praise_aft");
            subArr.push(data.titles);
            this.addFriendBtn.visible = false;
            this.privaCharBtn.visible = false;
            this.tradeBtn.visible = false;
            this.bottombg.clear();
            this.bottombg.fillStyle(0x6AE2FF, 1);
            this.bottombg.fillRect(-this.bottomCon.width * 0.5, -this.bottomCon.height * 0.5, this.bottomCon.width, this.bottomCon.height);
            this.mGrideTable.setColumnCount(3);
        } else {
            const remark = (data.remark ? data.remark : "备注好友昵称");
            this.nickName.setText(this.getRichLabel(i18n.t("player_info.nick_name")) + spaceOffset + nickname + ` (${remark})`);
            this.idText.setText(this.getRichLabel("I   D") + spaceOffset + cid);
            this.lvCon.setPosition(this.idText.x + this.lvCon.width * 0.5, -this.mainContent.height * 0.5 + 100 * this.dpr);
            this.likeBtn.setFrame("praise_bef");
            subArr.push(data.avatar);
            this.addFriendBtn.visible = !data.friend;
            this.privaCharBtn.visible = data.friend;
            this.tradeBtn.visible = true;
            this.bottombg.clear();
            this.bottombg.fillStyle(0x6AE2FF, 1);
            this.bottombg.fillRect(-this.bottomCon.width * 0.5, -this.bottomCon.height * 0.5, this.bottomCon.width, this.bottomCon.height - 55 * this.dpr);
            this.mGrideTable.setColumnCount(2);
        }
        this.setSubCategory(subArr);
    }

    public destroy() {
        this.mGrideTable.destroy();
        this.mCategoryScroll.destroy();
        super.destroy();
    }

    private OnClosePanel() {
        this.emit("hide");
    }

    private setSubCategory(datas: any[]) {
        const subNames = [i18n.t("player_info.option_live"), i18n.t("player_info.option_badge"), i18n.t("player_info.option_title")];
        const len = datas.length;
        const w = this.scene.cameras.main.width;
        const zoom = this.mWorld.uiScale;
        const offsetx = 0 * this.dpr;
        const itemWidth = this.mScene.textures.getFrame(this.key, "title_select").width;
        let totalWid: number = 0;
        const items = [];
        for (let i = 0; i < len; i++) {
            const item = new Button(this.scene, this.key, "title_normal", "title_select", subNames[i]);
            item.x = itemWidth * 0.5 + (itemWidth + offsetx) * i;
            item.y = 0;
            items.push(item);
            item.setTextStyle({ color: "#2B4BB5", bold: true, fontSize: 14 * this.dpr * this.scale, fontFamily: Font.DEFULT_FONT });
            this.mCategeoriesCon.add(item);
            this.mCategoryScroll.setInteractiveObject(item);
            item.disInteractive();
            item.removeListen();
            item.setData("subData", datas[i]);
            totalWid += item.x;
        }
        totalWid = totalWid < this.bottomCon.width ? this.bottomCon.width : totalWid;
        // 设植完毕后需刷新滚动范围
        this.mCategoryScroll.refreshBound(totalWid);
        // 刷新滚动范围后，需要把scroller调整到父容器的0点位置，后续会将它写到scroller中
        this.mCategoryScroll.setValue(w - this.mCategeoriesCon.width);
        this.onSelectSubCategoryHandler(items[0]);
    }
    private onSelectSubCategoryHandler(obj: Button) {
        // Logger.getInstance().log(obj);
        if (this.curSelectCategeory) {
            this.curSelectCategeory.changeNormal();
            this.curSelectCategeory.setTextColor("#2B4BB5");
        }
        obj.changeDown();
        obj.setTextColor("#996600");
        this.curSelectCategeory = obj;
        const datas = obj.getData("subData");
        if (datas)
            this.mGrideTable.setItems(datas);
        this.mGrideTable.refreshPos(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2 + 170 * this.dpr * this.scale, 0, 0);
    }

    private refreshPos(value) {
        const zoom = this.mWorld.uiScale;
        const w = this.scene.cameras.main.width;
        const conOffsetX = (w - this.mCategeoriesCon.width) / 2;
        // 滚动容器的位置只能靠滚动事件来控制，否则移动会有跳动
        this.mCategeoriesCon.x = value - conOffsetX;
        // Logger.getInstance().log("value:" + value + "," + "conX" + this.mCategeoriesCon.x);
    }
    private onSelectItemHandler(item) {

    }

    private onEditorHandler() {
        const w = 247 * this.dpr;
        const h = this.content.height;
        if (!this.editorPanel) this.editorPanel = new CharacterEditorPanel(this.scene, 0, 0, w, h, this.key, this.dpr);
        this.content.add(this.editorPanel);
        this.editorPanel.visible = true;
        this.editorPanel.on("editorHide", this.onEditorPanelHideHandler, this);
        this.setMainUIVisible(false);
    }

    private onAddFriendHandler() {

    }

    private onTradingHandler() {

    }

    private onPrivateChatHandler() {

    }

    private onEditorPanelHideHandler() {
        this.mainContent.visible = true;
        this.remove(this.editorPanel);
        this.editorPanel.off("editorHide", this.onEditorPanelHideHandler, this);
        this.editorPanel.destroy();
        this.editorPanel = null;
        this.setMainUIVisible(true);
    }

    private setMainUIVisible(value) {
        this.avatar.visible = value;
        this.mCategeoriesCon.visible = value;
        this.mGrideTable.table.visible = value;
        this.mainContent.visible = value;

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

export class CharacterOwnerItem extends Container {
    public itemData: any;
    private nameText: Text;
    private lvText: Text;
    private icon: DynamicImage;
    private progressBar: ProgressBar;
    private dpr: number = 0;
    private zoom: number = 0;
    private key: string;
    constructor(scene: Phaser.Scene, x: number, y: number, key: string, dpr: number, zoom: number = 1) {
        super(scene, x, y);
        const bg = this.scene.make.image({ x: 0, y: 0, key, frame: "skill_bg" });
        this.nameText = this.scene.make.text({ x: 6 * dpr, y: 0, text: "lv 98", style: { color: "#996600", fontSize: 12 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0, 0.5);
        this.lvText = this.scene.make.text({ x: 6 * dpr, y: 0, text: "lv 98", style: { color: "#996600", fontSize: 12 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0, 0.5);
        this.progressBar = new ProgressBar(this.scene, {
            x: 48 * dpr / 2,
            y: 15 * dpr,
            width: 41 * dpr,
            height: 4 * dpr,
            background: {
                x: 0,
                y: 0,
                width: 41 * dpr,
                height: 4 * dpr,
                config: {
                    top: 2 * dpr,
                    left: 4 * dpr,
                    right: 4 * dpr,
                    bottom: 2 * dpr,
                },
                key,
                frame: "slider_bg"
            },
            bar: {
                x: 0,
                y: 0,
                width: 41 * dpr,
                height: 4 * dpr,
                config: {
                    top: 2 * dpr,
                    left: 4 * dpr,
                    right: 4 * dpr,
                    bottom: 2 * dpr,
                },
                key,
                frame: "slider_rate"
            },
            dpr
        });
        this.icon = new DynamicImage(this.scene, -bg.width * 0.5 + 22 * dpr, 0);
        this.add([bg, this.icon, this.nameText, this.lvText, this.progressBar]);
        this.setSize(bg.width, bg.height);
        this.dpr = dpr;
        this.zoom = zoom;
        this.key = key;
        // this.progressBar.setProgress(40, 100);
    }

    public setItemData(data, isOwner: boolean = true) {
        this.itemData = data;
        this.nameText.text = data.name;
        const posY = (isOwner ? -16 * this.dpr * this.zoom : -11 * this.dpr * this.zoom);
        const offsetY = (isOwner ? 20 * this.dpr * this.zoom : 25 * this.dpr * this.zoom);
        const cheight = 10 * this.dpr * this.zoom;
        this.nameText.y = posY + cheight * 0.5;
        this.icon.setTexture(this.key, "test_skillicon");
        if (data.level) {
            this.lvText.text = data.level.level;
            this.lvText.y = posY + offsetY;
            this.progressBar.setProgress(data.level.currentLevelExp, data.level.nextLevelExp);
            this.progressBar.visible = isOwner;
        } else {
            this.progressBar.visible = false;
            this.lvText.visible = false;
        }
        // const url = Url.getOsdRes(data.display.texturePath);
        // this.icon.load(url, this, () => {
        //     this.icon.scale = this.dpr * this.zoom;
        //     const x = -this.width * 0.5 + 18 * this.dpr * this.zoom;
        //     this.icon.setPosition(x, 0);
        // });

    }
}
