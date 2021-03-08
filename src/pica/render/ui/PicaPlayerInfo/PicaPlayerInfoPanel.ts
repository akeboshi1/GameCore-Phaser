import { op_client } from "pixelpai_proto";
import { PicaPlayerEditorPanel } from "./PicaPlayerEditorPanel";
import { PicaAttributePanel } from "./PicaAttributePanel";
import { Button, BBCodeText, NineSliceButton, GameGridTable, GameScroller, ClickEvent, ProgressBar } from "apowophaserui";
import { UIAtlasKey, UIAtlasName } from "picaRes";
import { Font, Handler, i18n, UIHelper, Url } from "utils";
import { AvatarSuitType, FriendRelationEnum, ModuleName } from "structure";
import { DynamicImage, UiManager, Render, UIDragonbonesDisplay, CommonBackground, ImageValue, ButtonEventDispatcher, ProgressMaskBar, ThreeSliceButton, ToggleColorButton } from "gamecoreRender";
import { PicaBasePanel } from "../pica.base.panel";
import { EvalSourceMapDevToolPlugin } from "webpack";

export class PicaPlayerInfoPanel extends PicaBasePanel {
    private mBlackBG: Phaser.GameObjects.Graphics;
    private background: CommonBackground;
    private bgImge: Phaser.GameObjects.Image;
    private topCon: Phaser.GameObjects.Container;
    private nickImge: ImageValue;
    private lvImage: ImageValue;
    private vipImage: ImageValue;
    private nickName: Phaser.GameObjects.Text;
    private content: Phaser.GameObjects.Container;
    private avatar: UIDragonbonesDisplay;
    private middleCon: MiddleContainer;
    private bottomCon: Phaser.GameObjects.Container;
    private bottombg: Phaser.GameObjects.Graphics;
    private selectLine: Phaser.GameObjects.Graphics;
    private mAttrPanel: PicaAttributePanel;
    private followBtn: NineSliceButton;
    private tradingBtn: NineSliceButton;
    private curToggleItem: ToggleColorButton;
    private mSkillGrideTable: GameGridTable;
    private mPlayerData: any;
    private dataMaps: Map<CharacterOptionType, any[]> = new Map();
    private isOwner: boolean;
    private mRelation: FriendRelationEnum;
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.key = ModuleName.PICAPLAYERINFO_NAME;
        this.atlasNames = [UIAtlasName.uicommon, UIAtlasName.friend_message];
        this.textures = [{ atlasName: "Create_role_bg", folder: "texture" }];
    }
    resize(width: number, height: number) {
        const w: number = this.scaleWidth;
        const h: number = this.scaleHeight;
        super.resize(width, height);
        this.setSize(w, h);
        this.mBlackBG.clear();
        this.mBlackBG.fillStyle(0, 0.66);
        this.mBlackBG.fillRect(0, 0, w, h);
        this.topCon.y = -h * 0.5 + 30 * this.dpr + this.topCon.height * 0.5;
        this.content.height = h;
        this.content.x = -this.content.width * 0.5 - 10 * this.dpr;
        this.content.y = h * 0.5;
        this.content.setInteractive();
        this.bottomCon.y = h * 0.5 - this.bottomCon.height * 0.5;
        const midHeight = h - this.topCon.height - this.bottomCon.height;
        this.bgImge.y = this.topCon.y + this.topCon.height * 0.5 + midHeight * 0.5 - 30 * this.dpr;
        this.avatar.y = this.bgImge.y + 60 * this.dpr;

    }

    public hide() {
        super.hide();
    }

    public addListen() {
        if (!this.mInitialized) return;
        this.mBlackBG.on("pointerup", this.onCloseHandler, this);
        this.followBtn.on(ClickEvent.Tap, this.onFollowHandler, this);
    }

    public removeListen() {
        if (!this.mInitialized) return;
        this.mBlackBG.off("pointerup", this.onCloseHandler, this);
        this.followBtn.off(ClickEvent.Tap, this.onFollowHandler, this);
    }
    init() {
        const wid: number = this.scaleWidth;
        const hei: number = this.scaleHeight;
        this.mBlackBG = this.scene.make.graphics(undefined, false);
        this.mBlackBG.clear();
        this.mBlackBG.fillStyle(0x6AE2FF, 0);
        this.mBlackBG.fillRect(0, 0, wid, hei);
        this.mBlackBG.setInteractive(new Phaser.Geom.Rectangle(0, 0, wid, hei), Phaser.Geom.Rectangle.Contains);
        this.add(this.mBlackBG);
        const conWidth = 300 * this.dpr;
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(conWidth, hei);
        this.add(this.content);
        this.background = new CommonBackground(this.scene, 0, 0, conWidth, hei);
        this.bgImge = this.scene.make.image({ key: "Create_role_bg" });
        this.bgImge.alpha = 0.8;
        this.topCon = this.scene.make.container(undefined, false);
        this.topCon.setSize(conWidth, 110* this.dpr);
        this.nickImge = new ImageValue(this.scene, 100 * this.dpr, 20 * this.dpr, UIAtlasName.uicommon, "people_woman", this.dpr, UIHelper.whiteStyle(this.dpr, 18));
        this.nickImge.setLayout(1);
        this.nickImge.x = -conWidth * 0.5 + 25 * this.dpr;
        this.nickImge.y = -this.topCon.height * 0.5 + this.nickImge.height * 0.5;
        this.lvImage = new ImageValue(this.scene, 20 * this.dpr, 15 * this.dpr, UIAtlasName.friend_message, "friend_lv_icon", this.dpr, UIHelper.whiteStyle(this.dpr));
        this.lvImage.setLayout(1);
        this.lvImage.setFontStyle("bold");
        this.lvImage.x = this.nickImge.x;
        this.lvImage.y = this.nickImge.y + this.nickImge.height * 0.5 + this.lvImage.height * 0.5 + 5 * this.dpr;
        this.vipImage = new ImageValue(this.scene, 20 * this.dpr, 15 * this.dpr, UIAtlasName.friend_message, "friend_vip_icon", this.dpr, UIHelper.whiteStyle(this.dpr));
        this.vipImage.setLayout(1);
        this.vipImage.setFontStyle("bold");
        this.vipImage.x = this.lvImage.x + this.lvImage.width + 5 * this.dpr;
        this.vipImage.y = this.lvImage.y;
        this.nickName = this.scene.make.text({ style: UIHelper.yellowStyle(this.dpr, 14) }).setOrigin(0, 0.5);
        this.nickName.setFontStyle("bold");
        this.nickName.x = this.lvImage.x - 12 * this.dpr;
        this.nickName.y = this.lvImage.y + this.lvImage.height * 0.5 + 15 * this.dpr;
        this.topCon.add([this.nickImge, this.lvImage, this.vipImage, this.nickName]);

        this.avatar = new UIDragonbonesDisplay(this.scene, this.render);
        this.avatar.scale = this.dpr * 2;
        this.avatar.x = 0;
        this.avatar.y = -70 * this.dpr;
        this.avatar.once("initialized", () => {
            this.avatar.play({ name: "idle", flip: false });
        });

        const bottomWidth = 274 * this.dpr;
        const bottomHeight = 310 * this.dpr;
        this.bottomCon = this.scene.make.container(undefined, false);
        this.bottomCon.setSize(bottomWidth, bottomHeight);
        this.middleCon = new MiddleContainer(this.scene, conWidth, 50 * this.dpr, this.dpr);
        this.middleCon.y = -bottomHeight * 0.5 + this.middleCon.height * 0.5;
        this.middleCon.setHandler(new Handler(this, this.onMiddleConHandler));
        this.bottombg = this.scene.make.graphics(undefined, false);
        this.bottombg.clear();
        this.bottombg.fillStyle(0xffffff, 0.3);
        this.bottombg.fillRect(0, 0, bottomWidth, 175 * this.dpr);
        this.bottombg.x = -bottomWidth * 0.5;
        this.bottombg.y = this.middleCon.y + this.middleCon.height * 0.5 + 10 * this.dpr;
        const optioncon = this.createOptionButtons();
        optioncon.y = this.bottombg.y + optioncon.height * 0.5 + 15 * this.dpr;
        this.mAttrPanel = new PicaAttributePanel(this.scene, 0, 0, 274 * this.dpr, 150 * this.dpr, this.key, this.dpr);
        this.mAttrPanel.y = optioncon.y + optioncon.height * 0.5 + this.mAttrPanel.height * 0.5 + 5 * this.dpr;
        // this.mSkillGrideTable = this.createGrideTable(0, this.mAttrPanel.y, this.mAttrPanel.width, this.mAttrPanel.height, capW, capH, () => {
        //     return new SkillInfoItem(this.scene, 0, 0, this.key, this.dpr);
        // }, new Handler(this, this.onSelectItemHandler));
        this.followBtn = this.createNineButton(0, 0, 118 * this.dpr, 42 * this.dpr, UIAtlasName.uicommon, "yellow_btn", i18n.t("player_info.follow"), "#996600");
        this.followBtn.setTextStyle(UIHelper.brownishStyle(this.dpr, 14));
        this.followBtn.y = bottomHeight * 0.5 - this.followBtn.height * 0.5 - 15 * this.dpr;
        this.followBtn.x = 0;// -this.followBtn.width * 0.5 - 20 * this.dpr;
        this.tradingBtn = this.createNineButton(0, 0, 118 * this.dpr, 42 * this.dpr, UIAtlasName.uicommon, "yellow_btn", i18n.t("player_info.trading"), "#996600");
        this.tradingBtn.setTextStyle(UIHelper.brownishStyle(this.dpr, 14));
        this.tradingBtn.y = this.followBtn.y;
        this.tradingBtn.x = -this.followBtn.x;
        this.tradingBtn.visible = false;
        this.bottomCon.add([this.middleCon, this.bottombg, optioncon, this.mAttrPanel, this.followBtn]);
        this.content.add([this.background, this.bgImge, this.topCon, this.avatar, this.bottomCon]);
        this.content.visible = false;
        this.resize(wid, hei);
        super.init();
        this.playMove(new Handler(this, () => {
            this.middleCon.refreshMask();
        }));
    }

    reqPlayerInfo() {
        this.render.renderEmitter(this.key + + "_queryOwnerInfo");
    }
    public setPlayerData(data: any) {
        if (!this.mInitialized) {
            this.mShowData = data;
            return;
        }
        this.mPlayerData = data;
        this.content.visible = true;
        if (this.avatar && data.avatarSuit) {
            const temp: any = AvatarSuitType.getSuitsFromItem(data.avatarSuit);
            this.avatar.setSuits(temp.suits);
            this.avatar.load({
                id: 0,
                avatar: temp.avatar,
            });
        }
        const nickname = data.nickname ? data.nickname : "???";
        const current_title = data.currentTitle ? data.currentTitle : "???";
        const level = data.level && data.level.level ? data.level.level : 0;
        this.nickImge.setText(nickname);
        this.lvImage.setText(level + "");
        this.nickName.setText(i18n.t("player_info.player_title") + ": " + current_title);
        this.vipImage.x = this.lvImage.x + this.lvImage.width * 0.5 + this.vipImage.width * 0.5 + 10 * this.dpr;
        this.dataMaps.clear();
        const lifeSkills = data.lifeSkills ? data.lifeSkills : [];
        this.dataMaps.set(CharacterOptionType.Skill, lifeSkills);
        if (data.isUser) {
            this.dataMaps.set(CharacterOptionType.Attribute, data.properties ? data.properties : []);
            this.dataMaps.set(CharacterOptionType.Badge, data.badges ? data.badges : []);
            this.followBtn.visible = false;
            this.tradingBtn.visible = false;
            this.isOwner = true;
        } else {
            this.dataMaps.set(CharacterOptionType.Attribute, data.properties ? data.properties : []);
            this.dataMaps.set(CharacterOptionType.Badge, data.badges ? data.badges : []);
            this.followBtn.visible = true;
            this.tradingBtn.visible = true;
            this.isOwner = false;
        }
        this.middleCon.setPlayerDatas(data.pros, this.isOwner);
        const datas = this.dataMaps.get(CharacterOptionType.Attribute);
        if (datas) this.mAttrPanel.setAttributeData(datas);
        this.setFriendRelation(FriendRelationEnum.Null);
    }
    private createOptionButtons() {
        const wid = 208 * this.dpr, hei = 23 * this.dpr;
        const content = this.scene.make.container(undefined, false);
        content.setSize(wid, hei);
        const subNames = [i18n.t("player_info.option_attribute"), i18n.t("player_info.option_badge"), i18n.t("player_info.option_decorate")];
        const options = [CharacterOptionType.Attribute, CharacterOptionType.Badge, CharacterOptionType.Decorate];
        const allLin = 208 * this.dpr;
        const cellwidth = allLin / subNames.length;
        const cellHeight = 14 * this.dpr;
        let posx = -allLin / 2;
        let tempitem: ToggleColorButton;
        for (let i = 0; i < subNames.length; i++) {
            const name = subNames[i];
            const type = options[i];
            const item = new ToggleColorButton(this.scene, cellwidth, 20 * this.dpr, this.dpr, name);
            item.on(ClickEvent.Tap, this.onToggleButtonHandler, this);
            item.setStyle({ color: "#0D16CA", fontSize: 14 * this.dpr });
            content.add(item);
            item.setChangeColor("#464DDB");
            item.setNormalColor("#0D16CA");
            item.setData("optiontype", type);
            item.setSize(cellwidth, cellHeight);
            item.enable = false;
            item.x = posx + cellwidth * 0.5;
            item.y = 0;
            item.alpha = 0.5;
            posx += cellwidth;
            if (!tempitem) tempitem = item;
        }
        //   tempitem.isOn = true;
        const parLine = this.scene.make.graphics(undefined, false);
        parLine.clear();
        parLine.fillStyle(0x464DDB, 0.25);
        parLine.fillRect(-136 * this.dpr, 0, 272 * this.dpr, 2 * this.dpr);
        parLine.y = hei * 0.5;
        this.selectLine = this.scene.make.graphics(undefined, false);
        this.selectLine.clear();
        this.selectLine.fillStyle(0x464DDB, 1);
        this.selectLine.fillRect(-21 * this.dpr, 0, 42 * this.dpr, 2 * this.dpr);
        this.selectLine.y = parLine.y;
        content.add([parLine, this.selectLine]);
        this.onToggleButtonHandler(undefined, tempitem);
        return content;
    }
    private createGrideTable(x: number, y: number, width: number, height: number, capW: number, capH: number, createFun: Function, callback: Handler) {
        const tableConfig = {
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
        return grid;
    }

    private createNineButton(x: number, y: number, width: number, height: number, key: string, frame: string, text?: string, color?: string) {
        const btn = new NineSliceButton(this.scene, x, y, width, height, key, frame, text, this.dpr, 1, {
            left: 14 * this.dpr,
            top: 14 * this.dpr,
            right: 15 * this.dpr,
            bottom: 14 * this.dpr
        });
        if (text) {
            btn.setTextStyle({
                color,
                fontSize: 16 * this.dpr,
                fontFamily: Font.DEFULT_FONT
            });
            btn.setFontStyle("bold");
        }
        return btn;
    }
    private setFriendRelation(relation: FriendRelationEnum) {
        if (this.isOwner) {
            return;
        }
        this.mRelation = relation;
        if (relation === FriendRelationEnum.Followed || relation === FriendRelationEnum.Friend) {
            this.followBtn.setText(i18n.t("friendlist.unfollow"));
        } else {
            this.followBtn.setText(i18n.t("friendlist.follow"));
        }
    }
    private onToggleButtonHandler(pointer, obj: ToggleColorButton) {
        if (this.curToggleItem === obj) return;
        if (this.curToggleItem) {
            this.curToggleItem.isOn = false;
            this.curToggleItem.alpha = 0.5;
        }
        obj.alpha = 1;
        this.curToggleItem = obj;
        this.selectLine.x = obj.x;
        const optionType = <CharacterOptionType>obj.getData("optiontype");
        const datas = this.dataMaps.get(optionType);
        if (datas) this.mAttrPanel.setAttributeData(datas);
    }
    private onSelectItemHandler(item) {

    }
    private onFollowHandler() {
        if (!this.mPlayerData) {
            return;
        }
        switch (this.mRelation) {
            case FriendRelationEnum.Friend:
            case FriendRelationEnum.Followed:
                this.render.renderEmitter(this.key + "_unfollow", this.mPlayerData.cid);
                break;
            case FriendRelationEnum.Fans:
            case FriendRelationEnum.Null:
                this.render.renderEmitter(this.key + "_follow", this.mPlayerData.cid);
                break;
        }
    }

    private onTradingHandler() {

    }

    private onPrivateChatHandler() {

    }

    private onExitHandler() {
        this.mWorld.exitUser();
    }

    private onMiddleConHandler(tag: string) {
        if (tag === "invite") {
            this.onIntiveHandler();
        } else if (tag === "room") {
            this.onGoHomeHandler();
        } else if (tag === "track") {
            this.onTrackHandler();
        }
    }

    private onTrackHandler() {
        if (!this.mPlayerData) {
            return;
        }
        this.render.renderEmitter(this.key + "_track", this.mPlayerData.cid);
    }

    private onIntiveHandler() {
        if (!this.mPlayerData) {
            return;
        }
        this.render.renderEmitter(this.key + "_invite", this.mPlayerData.cid);
    }

    private onGoHomeHandler() {
        this.render.renderEmitter(this.key + "_gohome", this.mPlayerData.cid);
    }
    private onCloseHandler() {
        this.render.renderEmitter(this.key + "_hide");
    }
    private playMove(handler: Handler) {
        const from = -this.content.width * 0.5 - 10 * this.dpr;
        const to = this.content.width * 0.5;
        const tween = this.scene.tweens.add({
            targets: this.content,
            x: {
                from,
                to
            },
            ease: "Linear",
            duration: 300,
            onComplete: () => {
                tween.stop();
                tween.remove();
                if (handler) handler.run();
            },
        });
    }
}

enum CharacterOptionType {
    Skill = 0,
    Attribute = 1,
    Badge = 2,
    Title = 3,
    Avatar = 4,
    Decorate
}

class MiddleContainer extends Phaser.GameObjects.Container {
    public ownerArr: AttributeProgressItem[] = [];
    public otherArr: OtherButtonItem[] = [];
    private sendHandler: Handler;
    private dpr: number;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.init();
    }

    public refreshMask() {
        for (const item of this.ownerArr) {
            item.refreshMask();
        }
    }
    public setHandler(send: Handler) {
        this.sendHandler = send;
    }
    public setPlayerDatas(datas: any[], isowner: boolean) {
        for (let i = 0; i < this.ownerArr.length; i++) {
            const item = this.ownerArr[i];
            item.visible = isowner;
            if (isowner) {
                const data = datas[i];
                if (data) {
                    item.setAttributeData(data.value, data.max);
                } else {
                    item.setAttributeData(0, undefined);
                }
            }
        }
        for (const item of this.otherArr) {
            item.visible = !isowner;
        }

    }

    protected init() {
        const attri = ["friend_physical_icon", "friend_saturationl_icon", "friend_saturationl_icon"];
        const bars = ["friend_physical_schedule_top", "friend_saturationl_schedule_top", "friend_physical_schedule_top"];
        for (let i = 0; i < attri.length; i++) {
            const icon = attri[i];
            const bar = bars[i];
            const item = new AttributeProgressItem(this.scene, icon, bar, this.dpr);
            item.visible = false;
            this.ownerArr.push(item);
        }
        const oicons = ["friend_invite_icon", "friend_room_icon", "friend_transaction_icon"];
        const texts = [i18n.t("player_info.invite"), i18n.t("player_info.room"), i18n.t("player_info.track")];
        const tags = ["invite", "room", "track"];
        for (let i = 0; i < oicons.length; i++) {
            const icon = oicons[i];
            const text = texts[i];
            const tag = tags[i];
            const item = new OtherButtonItem(this.scene, icon, text, this.dpr);
            item.setTag(tag);
            item.visible = false;
            item.on(ClickEvent.Tap, this.onClickHandler, this);
            this.otherArr.push(item);
        }
        this.add(this.ownerArr);
        this.add(this.otherArr);
        this.setLayout(this.ownerArr);
        this.setLayout(this.otherArr);
    }

    protected setLayout(arr: Phaser.GameObjects.Container[]) {
        const cellWidth = 89 * this.dpr, space = 5 * this.dpr;
        const lenght = arr.length;
        let posx = -(lenght * cellWidth + (lenght - 1) * space) * 0.5 + cellWidth * 0.5;
        for (let i = 0; i < lenght; i++) {
            const item = arr[i];
            item.x = posx;
            posx += cellWidth + space;
        }
    }

    private onClickHandler(pointer, button: OtherButtonItem) {
        if (this.sendHandler) this.sendHandler.runWith(button.tag);
    }
}

class AttributeProgressItem extends Phaser.GameObjects.Container {
    private bg: Phaser.GameObjects.Image;
    private textImg: ImageValue;
    private dpr: number;
    private progress: ProgressMaskBar;
    constructor(scene: Phaser.Scene, frame: string, bar: string, dpr: number) {
        super(scene, 0, 0,);
        this.dpr = dpr;
        this.bg = this.scene.make.image({ key: UIAtlasName.friend_message, frame: "friend_physical_bg" });
        this.setSize(this.bg.width, this.bg.height);
        this.textImg = new ImageValue(scene, this.width, 15 * dpr, UIAtlasName.friend_message, frame, dpr, UIHelper.colorStyle("#0558CA", 11 * dpr));
        this.textImg.y = -this.height * 0.5 + this.textImg.height * 0.5 + 8 * dpr;
        this.textImg.setLayout(2);
        this.progress = new ProgressMaskBar(scene, UIAtlasName.friend_message, "friend_physical_schedule_bottom", bar);
        this.progress.y = this.textImg.y + this.textImg.height * 0.5 + this.progress.height * 0.5 + 7 * dpr;
        this.add([this.bg, this.textImg, this.progress]);
    }

    public refreshMask() {
        this.progress.refreshMask();
    }
    public setAttributeData(value: number, max: number) {
        if (max === undefined) {
            this.textImg.visible = false;
            this.progress.visible = false;
        } else {
            this.textImg.visible = true;
            this.progress.visible = true;
            this.textImg.setText(`${value}/${max}`);
            this.progress.setProgress(value, max);
        }
    }
}
class OtherButtonItem extends ButtonEventDispatcher {
    public tag: string;
    private bg: Phaser.GameObjects.Image;
    private image: Phaser.GameObjects.Image;
    private text: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, frame: string, text: string, dpr: number) {
        super(scene, 0, 0,);
        this.dpr = dpr;
        this.bg = this.scene.make.image({ key: UIAtlasName.friend_message, frame: "friend_physical_bg" });
        this.setSize(this.bg.width, this.bg.height);
        this.image = this.scene.make.image({ key: UIAtlasName.friend_message, frame });
        this.text = this.scene.make.text({ text, style: UIHelper.colorStyle("#FFF449", 12 * dpr) }).setOrigin(0.5, 0);
        this.text.setFontStyle("bold");
        this.image.y = -this.height * 0.5 + this.image.height * 0.5 + 3 * dpr;
        this.text.y = this.image.y + this.image.height * 0.5 + 2 * dpr;
        this.add([this.bg, this.image, this.text]);
        this.enable = true;
        this.mTweenBoo = true;
    }

    public setTag(tag: string) {
        this.tag = tag;
    }
}

class SkillInfoItem extends Phaser.GameObjects.Container {
    public itemData: any;
    private nameText: Phaser.GameObjects.Text;
    private lvText: Phaser.GameObjects.Text;
    private icon: DynamicImage;
    private progressBar: ProgressBar;
    private dpr: number = 0;
    private key: string;
    constructor(scene: Phaser.Scene, x: number, y: number, key: string, dpr: number) {
        super(scene, x, y);
        const bg = this.scene.make.image({ x: 0, y: 0, key, frame: "skill_bg" });
        bg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.nameText = this.scene.make.text({ x: -1 * dpr, y: 0, text: "", style: { color: "#996600", fontSize: 12 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0, 0.5);
        this.lvText = this.scene.make.text({ x: -1 * dpr, y: 0, text: "", style: { color: "#996600", fontSize: 12 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0, 0.5);
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
