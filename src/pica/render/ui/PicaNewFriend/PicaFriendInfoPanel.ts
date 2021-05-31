
import { NineSliceButton, GameGridTable, ClickEvent, ProgressBar, BBCodeText } from "apowophaserui";
import { op_pkt_def } from "pixelpai_proto";
import { Font, Handler, i18n, UIHelper, Url } from "utils";
import { AvatarSuitType, FriendRelationEnum, ModuleName } from "structure";
import { DynamicImage, UiManager, UIDragonbonesDisplay, ButtonEventDispatcher, ProgressMaskBar, ToggleColorButton, ItemInfoTips, Render } from "gamecoreRender";
import { PicaBasePanel } from "../pica.base.panel";
import { CommonBackground, ImageValue } from "../../ui";
import { UIAtlasName } from "picaRes";
export class PicaFriendInfoPanel extends Phaser.GameObjects.Container {
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
    private mPlayerData: any;
    private dataMaps: Map<CharacterOptionType, any[]> = new Map();
    private mRelation: FriendRelationEnum;
    private dpr: number;
    private zoom: number;
    private render: Render;
    private key: string;
    constructor(scene: Phaser.Scene, render: Render, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.setSize(width, height);
        this.render = render;
        this.dpr = dpr;
        this.zoom = zoom;
        this.key = ModuleName.PICANEWFRIEND_NAME;
    }
    resize(w: number, h: number) {
        w = w || this.width;
        h = h || this.height;
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
        this.visible = false;
    }

    public addListen() {
        this.mBlackBG.on("pointerup", this.onCloseHandler, this);
        this.followBtn.on(ClickEvent.Tap, this.onFollowHandler, this);
    }

    public removeListen() {
        this.mBlackBG.off("pointerup", this.onCloseHandler, this);
        this.followBtn.off(ClickEvent.Tap, this.onFollowHandler, this);
    }
    init() {
        const wid: number = this.width;
        const hei: number = this.height;
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
        this.topCon.setSize(conWidth, 110 * this.dpr);
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
        this.content.visible = true;
        this.resize(wid, hei);
    }

    reqPlayerInfo() {
        this.render.renderEmitter(this.key + + "_queryOwnerInfo");
    }
    public setPlayerData(data: any) {
        this.mPlayerData = data;
        this.content.visible = true;
        if (this.avatar && data.avatarSuit) {
            const temp: any = AvatarSuitType.getSuitsFromItem(data.avatarSuit);
            this.avatar.setSuits(temp.suits);
            this.avatar.load({
                id: 0,
                avatar: temp.avatar,
            }, undefined, false);
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
        this.dataMaps.set(CharacterOptionType.Attribute, data.properties ? data.properties : []);
        this.dataMaps.set(CharacterOptionType.Badge, data.badges ? data.badges : []);
        this.followBtn.visible = true;
        this.tradingBtn.visible = true;
        this.middleCon.setPlayerDatas(data.pros);
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
    public otherArr: OtherButtonItem[] = [];
    private sendHandler: Handler;
    private dpr: number;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.init();
    }

    public setHandler(send: Handler) {
        this.sendHandler = send;
    }
    public setPlayerDatas(datas) {

    }

    protected init() {
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
            item.on(ClickEvent.Tap, this.onOtherClickHandler, this);
            this.otherArr.push(item);
        }
        this.add(this.otherArr);
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

    private onOtherClickHandler(pointer, button: OtherButtonItem) {
        if (this.sendHandler) this.sendHandler.runWith(button.tag);
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
        if (tag === "track") {
            this.image.visible = false;
            this.text.visible = false;
            this.enable = false;
        }
    }
}

class PicaAttributePanel extends Phaser.GameObjects.Container {
    private key: string;
    private dpr: number;
    private attriItems: PlayerAttributeValue[] = [];
    private mspace: number;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, dpr: number) {
        super(scene, x, y);
        this.setSize(width, height);
        this.key = key;
        this.dpr = dpr;
        this.mspace = 10 * dpr;
    }

    public set space(value: number) {
        this.mspace = value;
    }
    setAttributeData(datas: op_pkt_def.IPKT_Property[]) {
        const len = datas.length;
        const width = this.width;
        const height = this.height;
        const cheight = 20 * this.dpr;
        const cwidth = width / 2 - 10 * this.dpr;
        const posy: number = -height * 0.5 + 10 * this.dpr;
        for (const item of this.attriItems) {
            item.visible = false;
        }
        for (let i = 0; i < len; i++) {
            let item: PlayerAttributeValue;
            if (i < this.attriItems.length) {
                item = this.attriItems[i];
            } else {
                item = new PlayerAttributeValue(this.scene, 0, 0, cwidth, cheight, this.dpr);
                this.add(item);
                this.attriItems.push(item);
            }
            const x = (cwidth * 0.5) * (i % 2 === 0 ? -1 : 1) + 10 * this.dpr;
            const y = posy + cheight * 0.5 + (cheight + this.mspace) * Math.floor(i / 2);
            item.setPosition(x, y);
            item.setInfo(datas[i]);
            item.visible = true;
        }
    }

}
class PlayerAttributeValue extends Phaser.GameObjects.Container {
    private icon: DynamicImage;
    private nameText: Phaser.GameObjects.Text;
    private valueText: BBCodeText;
    private dpr: number;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number) {
        super(scene, x, y);
        this.dpr = dpr;
        this.setSize(width, height);
        this.icon = new DynamicImage(this.scene, 0, 0);
        this.icon.x = -width * 0.5 + 10 * dpr;
        this.nameText = this.scene.make.text({
            x: this.icon.x + 13 * dpr, y: 0, text: "Attack:",
            style: { fontFamily: Font.DEFULT_FONT, fontSize: 11 * dpr, color: "#131313" }
        }).setOrigin(0, 0.5);
        this.valueText = new BBCodeText(this.scene, 0, 0, "100", {
            color: "#131313",
            fontSize: 11 * this.dpr,
            fontFamily: Font.DEFULT_FONT,
        }).setOrigin(0, 0.5);
        this.valueText.x = this.nameText.x + this.nameText.width;
        this.add([this.icon, this.nameText, this.valueText]);
    }
    public setInfo(data: op_pkt_def.IPKT_Property) {
        if (data.display) {
            const url = Url.getOsdRes(data.display.texturePath);
            this.icon.load(url, this, () => {
                this.icon.displayWidth = 20 * this.dpr;
                this.icon.scaleY = this.icon.scaleX;
            });
        }
        // this.icon.setFrame(data.display.texturePath);
        this.nameText.text = data.name + ":";
        this.valueText.text = data.value + (data.tempValue ? this.getRichLabel(data.tempValue) : "");
        this.valueText.x = this.nameText.x + this.nameText.width + 3 * this.dpr;
    }
    private getRichLabel(tempValue: number, color = "#0B77CD") {
        const label = `[color=${color}](+${tempValue})[/color]`;
        return label;
    }
}
