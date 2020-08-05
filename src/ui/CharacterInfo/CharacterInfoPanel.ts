import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { Font } from "../../utils/font";
import { op_client } from "pixelpai_proto";
import { DynamicImage } from "../components/dynamic.image";
import { BBCodeText, Button } from "../../../lib/rexui/lib/ui/ui-components";
import { i18n } from "../../i18n";
import { GameGridTable } from "../../../lib/rexui/lib/ui/gridtable/GameGridTable";
import { GridTableConfig } from "../../../lib/rexui/lib/ui/gridtable/GridTableConfig";
import { Logger } from "../../utils/log";
import { DragonbonesDisplay } from "../../rooms/display/dragonbones.display";
import { DragonbonesModel } from "../../rooms/display/dragonbones.model";
import { ProgressBar } from "../../../lib/rexui/lib/ui/progressbar/ProgressBar";
import { CharacterEditorPanel } from "./CharacterEditorPanel";
import Text = Phaser.GameObjects.Text;
import Container = Phaser.GameObjects.Container;
import { GameScroller } from "../../../lib/rexui/lib/ui/scroller/GameScroller";
import { Url } from "../../utils/resUtil";
// import { NinePatchButton } from "../../../lib/rexui/lib/ui/button/NinePatchButton";
import { CoreUI } from "../../../lib/rexui/lib/ui/interface/event/MouseEvent";
import { NinePatchButton } from "../components/ninepatch.button";
import { UIAtlasName, UIAtlasKey } from "../ui.atals.name";
import { Handler } from "../../Handler/Handler";
import { CharacterAttributePanel } from "./CharacterAttributePanel";
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
    private mSkillGrideTable: GameGridTable;
    private mAttrPanel: CharacterAttributePanel;
    private editorPanel: CharacterEditorPanel;
    private curSelectCategeory: Button;
    private isOwner: boolean = true;
    private mBackGround: Phaser.GameObjects.Graphics;
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
        this.mSkillGrideTable.resetMask();
        this.content.setInteractive();
        this.mCategoryScroll.refreshMask();
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
        this.nickEditor.on(CoreUI.MouseEvent.Tap, this.onEditorHandler, this);
        this.privaCharBtn.on(CoreUI.MouseEvent.Tap, this.onPrivateChatHandler, this);
        this.addFriendBtn.on(CoreUI.MouseEvent.Tap, this.onAddFriendHandler, this);
        this.tradeBtn.on(CoreUI.MouseEvent.Tap, this.onTradingHandler, this);
    }

    public removeListen() {
        if (!this.mInitialized) return;
        this.closeBtn.off(CoreUI.MouseEvent.Tap, this.OnClosePanel, this);
        this.nickEditor.off(CoreUI.MouseEvent.Tap, this.onEditorHandler, this);
        this.privaCharBtn.off(CoreUI.MouseEvent.Tap, this.onPrivateChatHandler, this);
        this.addFriendBtn.off(CoreUI.MouseEvent.Tap, this.onAddFriendHandler, this);
        this.tradeBtn.off(CoreUI.MouseEvent.Tap, this.onTradingHandler, this);
    }

    preload() {
        this.addAtlas(this.key, "player_info/player_info.png", "player_info/player_info.json");
        this.commonkey = UIAtlasKey.commonKey;
        this.addAtlas(this.commonkey, UIAtlasName.commonUrl + ".png", UIAtlasName.commonUrl + ".json");
        super.preload();
    }
    init() {
        const wid: number = this.scaleWidth;
        const hei: number = this.scaleHeight;
        this.mBackGround = this.scene.make.graphics(undefined, false);
        this.mBackGround.clear();
        this.mBackGround.fillStyle(0x6AE2FF, 0);
        this.mBackGround.fillRect(0, 0, wid, hei);
        this.mBackGround.setInteractive(new Phaser.Geom.Rectangle(0, 0, wid, hei), Phaser.Geom.Rectangle.Contains);
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
        this.likeBtn.visible = false;
        this.avatar = new DragonbonesDisplay(this.scene, undefined, undefined, true);
        this.avatar.scale = this.dpr * 2;
        this.avatar.x = 0;
        this.avatar.y = -70 * this.dpr;
        this.avatar.once("initialized", () => {
            this.avatar.play({ name: "idle", flip: false });
        });

        const nickPosX = Math.round(-this.bg.width * 0.5 + 25 * this.dpr);
        const nickPosY = Math.round(this.bg.height * 0.5 - 306 * this.dpr);
        const nickOffsetY = 30 * this.dpr;
        const fontSize = Math.round(13 * this.dpr);
        this.nickName = new BBCodeText(this.scene, nickPosX, nickPosY, {})
            .setOrigin(0, 0.5).setFontSize(fontSize).setFontFamily(Font.DEFULT_FONT);
        this.nickEditor = new Button(this.scene, this.key, "edit", "edit");
        this.nickEditor.setPosition(this.bg.width * 0.5 - 30 * this.dpr, nickPosY).visible = false;
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
        this.addFriendBtn.setTextStyle({ fontSize: 16 * this.dpr, color: "#000000" });
        this.privaCharBtn.setTextStyle({ fontSize: 16 * this.dpr, color: "#996600" });
        this.tradeBtn.setTextStyle({ fontSize: 16 * this.dpr, color: "#ffffff" });
        this.bottomCon.add([this.bottombg, this.addFriendBtn, this.privaCharBtn, this.tradeBtn]);
        this.mainContent.add([this.closeBtn, this.likeBtn, this.labelText, line1, line2, line3, this.nickName, this.nickEditor, this.idText, this.titleName, this.lvCon, this.bottomCon]);
        this.mainContent.add(this.avatar);
        this.content.add(this.bg);
        this.content.add(this.mainContent);
        this.add([this.mBackGround, this.content]);
        const scrollY = 62 * this.dpr;
        const scrollHeight = 80 * this.dpr;
        this.mCategoryScroll = new GameScroller(this.scene, {
            x: 0,
            y: scrollY,
            width: bottomWidth,
            height: scrollHeight,
            zoom: this.scale,
            orientation: 1,
            cellupCallBack: (gameobject) => {
                this.onSelectSubCategoryHandler(gameobject);
            }
        });
        this.content.add(this.mCategoryScroll);
        const propFrame = this.scene.textures.getFrame(this.key, "skill_bg");
        const capW = propFrame.width + 5 * this.dpr;
        const capH = propFrame.height + 2 * this.dpr;
        const gridX = 0, gridwidth = (this.bottomCon.width - 10 * this.dpr), gridheight = 200 * this.dpr;
        const gridY = scrollY + scrollHeight * 0.5 + 60 * this.dpr;
        this.mSkillGrideTable = this.createGrideTable(gridX, gridY, gridwidth, gridheight, capW, capH, () => {
            return new CharacterOwnerItem(this.scene, 0, 0, this.key, this.dpr);
        }, new Handler(this, this.onSelectItemHandler));
        const attrHeigth = 149 * this.dpr;
        this.mAttrPanel = new CharacterAttributePanel(this.scene, gridX, gridY - 5 * this.dpr, 260 * this.dpr, attrHeigth, this.key, this.dpr);
        this.content.add(this.mAttrPanel);
        this.resize(wid, hei);
        super.init();
        this.reqPlayerInfo();
    }

    reqPlayerInfo() {
        this.emit("queryOwnerInfo");
    }
    public setPlayerData(data: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_SELF_PLAYER_INFO | op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ANOTHER_PLAYER_INFO) {
        const nickname = data.nickname;
        const current_title = data.currentTitle;
        const exp = data.level.currentLevelExp;
        const nexExp = data.level.nextLevelExp;
        const cid = data.id;
        const levle = data.level.level;
        const spaceOffset = this.getspaceStr(1 * this.dpr);
        if (this.avatar) {
            this.avatar.load(new DragonbonesModel({
                id: 0,
                avatar: data.currentAvatar.avatar
            }));
        }
        this.titleName.setText(this.getRichLabel(i18n.t("player_info.player_title")) + spaceOffset + current_title);
        this.likeBtn.setText(data.like + "");
        const likeposx = this.bg.width * 0.5 - this.likeBtn.width * 0.5 - this.likeBtn.text.width;
        this.likeBtn.x = likeposx - 20 * this.dpr;
        this.lvText.text = "Lv" + levle + "";
        const subArr: Map<any, any[]> = new Map();
        subArr.set(CharacterOptionType.Skill, data.lifeSkills);
        if (data instanceof op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_SELF_PLAYER_INFO) {
            this.nickName.setText(this.getRichLabel(i18n.t("player_info.nick_name")) + spaceOffset + nickname);
            this.idText.setText(this.getRichLabel(i18n.t("player_info.player_lv")) + this.getspaceStr(20) + exp + "/" + nexExp);
            this.lvCon.setPosition(this.idText.x + 58 * this.dpr, this.idText.y);
            this.likeBtn.setFrame("praise_aft");
            subArr.set(CharacterOptionType.Attribute, data.properties);
            subArr.set(CharacterOptionType.Badge, data.badges);
            //   subArr.set(CharacterOptionType.Title, data.titles);
            this.addFriendBtn.visible = false;
            this.privaCharBtn.visible = false;
            this.tradeBtn.visible = false;
            this.bottombg.clear();
            this.bottombg.fillStyle(0x6AE2FF, 1);
            this.bottombg.fillRect(-this.bottomCon.width * 0.5, -this.bottomCon.height * 0.5, this.bottomCon.width, this.bottomCon.height);
            this.mSkillGrideTable.setColumnCount(3);
            this.isOwner = true;
        } else {
            const remark = (data.remark ? data.remark : "备注好友昵称");
            this.nickName.setText(this.getRichLabel(i18n.t("player_info.nick_name")) + spaceOffset + nickname + ` (${remark})`);
            this.idText.setText(this.getRichLabel("I   D") + spaceOffset + cid);
            this.lvCon.setPosition(this.idText.x + this.lvCon.width * 0.5, -this.mainContent.height * 0.5 + 100 * this.dpr);
            this.likeBtn.setFrame("praise_bef");
            subArr.set(CharacterOptionType.Badge, data.badges);
            // subArr.set(CharacterOptionType.Avatar, data.avatar);
            this.addFriendBtn.visible = !data.friend;
            this.privaCharBtn.visible = data.friend;
            this.tradeBtn.visible = true;
            this.bottombg.clear();
            this.bottombg.fillStyle(0x6AE2FF, 1);
            this.bottombg.fillRect(-this.bottomCon.width * 0.5, -this.bottomCon.height * 0.5, this.bottomCon.width, this.bottomCon.height - 55 * this.dpr);
            this.mSkillGrideTable.setColumnCount(2);
            this.isOwner = false;
        }
        this.setSubCategory(subArr);
    }

    public destroy() {
        this.mSkillGrideTable.destroy();
        this.mCategoryScroll.destroy();
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
                cellPadX: 24 * this.dpr,
                zoom: this.scale
            },
            scrollMode: 1,
            clamplChildOY: false,
            // background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, .2),
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = createFun();
                }
                cellContainer.setData({ item });
                cellContainer.setItemData(item, this.isOwner);
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
        this.content.add(grid);
        return grid;
    }

    private OnClosePanel() {
        this.emit("hide");
    }

    private setSubCategory(map: Map<CharacterOptionType, any[]>) {
        const subNames = [i18n.t("player_info.option_live"), i18n.t("player_info.option_attribute"), i18n.t("player_info.option_badge")];
        const itemWidth = this.mScene.textures.getFrame(this.key, "title_select").width;
        const items = [];
        map.forEach((value, key) => {
            const titleName = this.getOptionName(key);
            const item = new Button(this.scene, this.key, "title_normal", "title_select", titleName);
            item.width = itemWidth;
            item.height = 41 * this.dpr;
            items.push(item);
            item.setTextStyle({ color: "#2B4BB5", fontSize: 12 * this.dpr, fontFamily: Font.BOLD_FONT });
            item.disInteractive();
            item.removeListen();
            item.setData("subData", value);
            item.setData("optiontype", key);
            this.mCategoryScroll.addItem(item);
        });
        if (items.length <= 3) this.mCategoryScroll.setAlign(1);
        else {
            this.mCategoryScroll.setAlign(2);
        }
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
        const optionType = <CharacterOptionType>obj.getData("optiontype");
        if (optionType === CharacterOptionType.Skill) {
            this.mSkillGrideTable.setItems(datas);
            this.mAttrPanel.visible = false;
            this.mSkillGrideTable.visible = true;
        } else if (optionType === CharacterOptionType.Attribute) {
            if (datas) this.mAttrPanel.setAttributeData(datas);
            this.mAttrPanel.visible = true;
            this.mSkillGrideTable.setItems([]);
            this.mSkillGrideTable.visible = false;
        } else if (optionType === CharacterOptionType.Badge) {

        }
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
        this.mCategoryScroll.visible = value;
        this.mSkillGrideTable.visible = value;
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

    private getOptionName(type: CharacterOptionType) {
        let title = "";
        if (type === CharacterOptionType.Skill) {
            title = i18n.t("player_info.option_live");
        } else if (type === CharacterOptionType.Attribute) {
            title = i18n.t("player_info.option_attribute");
        } else if (type === CharacterOptionType.Badge) {
            title = i18n.t("player_info.option_badge");
        } else if (type === CharacterOptionType.Title) {
            title = i18n.t("player_info.option_title");
        }
        return title;
    }
}

enum CharacterOptionType {
    Skill = 0,
    Attribute = 1,
    Badge = 2,
    Title = 3,
    Avatar = 4
}
class CharacterOwnerItem extends Container {
    public itemData: any;
    private nameText: Text;
    private lvText: Text;
    private icon: DynamicImage;
    private progressBar: ProgressBar;
    private dpr: number = 0;
    private key: string;
    constructor(scene: Phaser.Scene, x: number, y: number, key: string, dpr: number) {
        super(scene, x, y);
        const bg = this.scene.make.image({ x: 0, y: 0, key, frame: "skill_bg" });
        this.nameText = this.scene.make.text({ x: -1 * dpr, y: 0, text: "lv 98", style: { color: "#996600", fontSize: 12 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0, 0.5);
        this.lvText = this.scene.make.text({ x: -1 * dpr, y: 0, text: "lv 98", style: { color: "#996600", fontSize: 12 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0, 0.5);
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
                    top: 1 * dpr,
                    left: 2 * dpr,
                    right: 2 * dpr,
                    bottom: 1 * dpr,
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
                    top: 1 * dpr,
                    left: 2 * dpr,
                    right: 2 * dpr,
                    bottom: 1 * dpr,
                },
                key,
                frame: "slider_rate"
            },
            dpr,
            textConfig: undefined
        });
        this.icon = new DynamicImage(this.scene, -bg.width * 0.5 + 22 * dpr, 0);
        this.add([bg, this.icon, this.nameText, this.lvText, this.progressBar]);
        this.setSize(bg.width, bg.height);
        this.dpr = dpr;
        this.key = key;
        // this.progressBar.setProgress(1, 100);
    }

    public setItemData(data, isOwner: boolean = false) {
        this.itemData = data;
        this.nameText.text = data.name;
        const posY = (isOwner ? -16 * this.dpr : -11 * this.dpr);
        const offsetY = (isOwner ? 20 * this.dpr : 25 * this.dpr);
        const cheight = 10 * this.dpr;
        this.nameText.y = posY + cheight * 0.5;
        this.icon.setTexture(this.key, "test_skillicon");
        const width = this.icon.width;
        if (data.level) {
            this.lvText.text = data.level.level;
            this.lvText.y = posY + offsetY;
            this.progressBar.setProgress(data.level.currentLevelExp, data.level.nextLevelExp);
            this.progressBar.visible = isOwner;
        } else {
            this.progressBar.visible = false;
            this.lvText.visible = false;
        }
        const url = Url.getOsdRes(data.display.texturePath);
        this.icon.load(url, this, () => {
            this.icon.scale = this.dpr;
            const x = -this.width * 0.5 + width * 0.5 + 6 * this.dpr;
            this.icon.setPosition(x, 0);
        });

    }
}
