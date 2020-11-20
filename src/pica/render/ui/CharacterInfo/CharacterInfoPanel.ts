import { op_client } from "pixelpai_proto";
import { CharacterEditorPanel } from "./CharacterEditorPanel";
import Text = Phaser.GameObjects.Text;
import Container = Phaser.GameObjects.Container;
import { CharacterAttributePanel } from "./CharacterAttributePanel";
import { Button, BBCodeText, NineSliceButton, GameGridTable, GameScroller, ClickEvent, ProgressBar } from "apowophaserui";
import { UIAtlasKey, UIAtlasName } from "picaRes";
import { Font, Handler, i18n, Url } from "utils";
import { AvatarSuit, AvatarSuitType, FriendRelationEnum, ModuleName } from "structure";
import { BasePanel, DynamicImage, UiManager, DragonbonesDisplay, Render } from "gamecoreRender";

export class CharacterInfoPanel extends BasePanel {
    private commonkey = "common_key";
    private bg: Phaser.GameObjects.Image;
    private labelText: Text;
    private closeBtn: Button;
    private avatar: DragonbonesDisplay;
    private content: Container;
    private mainCon: Container;
    private lvCon: Container;
    private lvText: Text;
    private nickName: BBCodeText;
    private idText: BBCodeText;
    private titleName: BBCodeText;
    private likeBtn: Button;
    private nickEditor: Button;
    private bottomCon: Container;
    private bottombg: Phaser.GameObjects.Graphics;
    private addFriendBtn: NineSliceButton;
    private tradeBtn: NineSliceButton;
    private privaCharBtn: NineSliceButton;
    private mCategoryScroll: GameScroller;
    private mSkillGrideTable: GameGridTable;
    private mAttrPanel: CharacterAttributePanel;
    private editorPanel: CharacterEditorPanel;
    private curSelectCategeory: Button;
    private isOwner: boolean = true;
    private mBackGround: Phaser.GameObjects.Graphics;
    private mExitBtn: NineSliceButton;
    private mFirendMenu: FriendMenu;
    private mCharacterMenu: CharacterMenu;
    private mCharacterData: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_SELF_PLAYER_INFO | op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ANOTHER_PLAYER_INFO;
    private mRelation: FriendRelationEnum;
    constructor(private uiManager: UiManager) {
        super(uiManager.scene, uiManager.render);
        this.key = ModuleName.CHARACTERINFO_NAME;
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
        const pos = this.mFirendMenu.getWorldTransformMatrix();
        this.mFirendMenu.addMask(pos.tx - 42 * this.dpr * this.scale, pos.ty, 200 * this.dpr * this.scale, 80 * this.dpr * this.scale);
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
        if (param && param.length > 0) {
            this.setPlayerData(param);
        }
        this.setInteractive();
        this.addListen();
    }

    public hide() {
        super.hide();
    }

    public update(param) {
        super.update(param);
        if (param) {
            this.setPlayerData(param);
        }
    }

    public addListen() {
        if (!this.mInitialized) return;
        this.closeBtn.on(String(ClickEvent.Tap), this.OnClosePanel, this);
        this.nickEditor.on(String(ClickEvent.Tap), this.onEditorHandler, this);
        this.privaCharBtn.on(String(ClickEvent.Tap), this.onPrivateChatHandler, this);
        this.addFriendBtn.on(String(ClickEvent.Tap), this.onAddFriendHandler, this);
        // this.tradeBtn.on(String(ClickEvent.Tap), this.onTradingHandler, this);
        this.mExitBtn.on(String(ClickEvent.Tap), this.onExitHandler, this);
        this.mFirendMenu.register();
        this.render.emitter.on("track", this.onTrackHandler, this);
        this.render.emitter.on("invite", this.onIntiveHandler, this);
        this.mCharacterMenu.register();
        this.render.emitter.on("addBlack", this.onAddBlacklistHandler, this);
        this.render.emitter.on("removeBlack", this.onRemoveBlacklistHandler, this);

    }

    public removeListen() {
        if (!this.mInitialized) return;
        this.closeBtn.off(String(ClickEvent.Tap), this.OnClosePanel, this);
        this.nickEditor.off(String(ClickEvent.Tap), this.onEditorHandler, this);
        this.privaCharBtn.off(String(ClickEvent.Tap), this.onPrivateChatHandler, this);
        this.addFriendBtn.off(String(ClickEvent.Tap), this.onAddFriendHandler, this);
        // this.tradeBtn.off(String(ClickEvent.Tap), this.onTradingHandler, this);
        this.mExitBtn.off(String(ClickEvent.Tap), this.onExitHandler, this);
        this.mFirendMenu.unregister();
        this.render.emitter.off("track", this.onTrackHandler, this);
        this.render.emitter.off("invite", this.onIntiveHandler, this);
        this.mCharacterMenu.unregister();
        this.render.emitter.off("addBlack", this.onAddBlacklistHandler, this);
        this.render.emitter.off("removeBlack", this.onRemoveBlacklistHandler, this);

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
        this.add(this.mBackGround);
        this.bg = this.scene.make.image({ x: 0, y: 0, key: this.key, frame: "bg" });
        this.bg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(this.bg.width, this.bg.height);
        this.add(this.content);
        this.content.add(this.bg);
        this.mainCon = this.scene.make.container(undefined, false);
        this.mainCon.setSize(this.bg.width, this.bg.height);
        this.content.add(this.mainCon);

        const posY = -this.bg.height * 0.5 + 43 * this.dpr;
        const mfont = `bold ${15 * this.dpr}px Source Han Sans`;
        this.labelText = this.scene.make.text({ x: 0, y: posY, text: i18n.t("player_info.title"), style: { font: mfont, bold: true, color: "#ffffff", fontSize: 15 * this.dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5, 0);
        this.labelText.setStroke("#8F4300", 1);
        this.closeBtn = new Button(this.scene, this.commonkey, "close");
        this.closeBtn.setPosition(this.mainCon.width * 0.5 - this.dpr * 30, posY - this.dpr * 10);
        this.likeBtn = new Button(this.scene, this.key, "praise_bef", "praise_bef", "999");
        this.likeBtn.setTextStyle({ fontSize: 13 * this.dpr, fontFamily: Font.DEFULT_FONT });
        this.likeBtn.text.setOrigin(0, 0.5).x += 10 * this.dpr;
        this.likeBtn.setPosition(this.bg.width * 0.5 - 50 * this.dpr, posY + 50 * this.dpr);
        this.likeBtn.visible = false;
        this.avatar = new DragonbonesDisplay(this.scene, this.render);
        this.avatar.scale = this.dpr * 2;
        this.avatar.x = 0;
        this.avatar.y = -70 * this.dpr;
        this.avatar.once("initialized", () => {
            this.avatar.play({ name: "idle", flip: false });
        });
        this.mainCon.add([this.labelText, this.closeBtn, this.likeBtn, this.avatar]);

        this.mFirendMenu = new FriendMenu(this.uiManager.render, this.scene, this.dpr, this.scale);
        this.mFirendMenu.x = this.bg.width * 0.5 - this.mFirendMenu.width - 14 * this.dpr;
        this.mFirendMenu.y = -this.bg.height * 0.5 + 200 * this.dpr;
        this.mCharacterMenu = new CharacterMenu(this.uiManager.render, this.scene, this.dpr, this.scale);
        this.mCharacterMenu.x = this.bg.width * 0.5 - this.mCharacterMenu.width - 14 * this.dpr;
        this.mCharacterMenu.y = -this.bg.height * 0.5 + 100 * this.dpr;
        this.mExitBtn = new NineSliceButton(this.scene, -this.bg.width * 0.5 + 40 * this.dpr, this.labelText.y + this.labelText.height * 0.5, 48 * this.dpr, 26 * this.dpr, this.commonkey, "yellow_btn_normal_s", "注销", this.dpr, this.scale, {
            left: 8 * this.dpr,
            top: 8 * this.dpr,
            right: 8 * this.dpr,
            bottom: 10 * this.dpr
        });
        this.mExitBtn.setTextStyle({
            fontSize: 10 * this.dpr,
            fontFamily: Font.DEFULT_FONT
        });

        this.mainCon.add([this.mFirendMenu, this.mCharacterMenu, this.mExitBtn]);

        const nickPosX = Math.round(-this.bg.width * 0.5 + 25 * this.dpr);
        const nickPosY = Math.round(this.bg.height * 0.5 - 324 * this.dpr) + 30 * this.dpr;
        const fontSize = Math.round(13 * this.dpr);
        this.nickName = new BBCodeText(this.scene, nickPosX, nickPosY, "", {})
            .setOrigin(0, 0.5).setFontSize(fontSize).setFontFamily(Font.DEFULT_FONT);
        this.nickEditor = new Button(this.scene, this.key, "edit", "edit");
        this.nickEditor.setPosition(this.bg.width * 0.5 - 30 * this.dpr, nickPosY).visible = false;
        const line1 = this.scene.make.image({ x: 0, y: this.nickName.y + 12 * this.dpr, key: this.key, frame: "splitters" });
        line1.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);

        line1.scaleY = this.dpr;
        this.idText = new BBCodeText(this.scene, nickPosX, nickPosY)
            .setFontSize(fontSize).setOrigin(0, 0.5).setFontFamily(Font.DEFULT_FONT).setColor("#0062BC");
        const line2 = this.scene.make.image({ x: 0, y: this.idText.y + 12 * this.dpr, key: this.key, frame: "splitters" });
        line2.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);

        line2.scaleY = this.dpr;
        this.titleName = new BBCodeText(this.scene, nickPosX, nickPosY + 30 * this.dpr)
            .setFontSize(fontSize).setOrigin(0, 0.5).setFontFamily(Font.DEFULT_FONT);
        const line3 = this.scene.make.image({ x: 0, y: this.titleName.y + 12 * this.dpr, key: this.key, frame: "splitters" });
        line3.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        line3.scaleY = this.dpr;
        const lvbg = this.scene.make.image({ x: 0, y: 0, key: this.key, frame: "level_bg" });
        lvbg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.lvText = this.scene.make.text({ x: 0, y: 0, text: "lv 98", style: { color: "#996600", fontSize, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5, 0.5);
        this.lvCon = this.scene.make.container(undefined, false);
        this.lvCon.setSize(lvbg.width, lvbg.height);
        this.lvCon.setPosition(-this.content.width * 0.5 + this.lvCon.width * 0.5 + 20 * this.dpr, -this.content.height * 0.5 + 90 * this.dpr);
        this.lvCon.add([lvbg, this.lvText]);

        this.mainCon.add([this.nickName, this.nickEditor, line1, line2, line3, this.titleName, this.lvCon]);

        const bottomWidth = 260 * this.dpr;
        const bottomHeight = 210 * this.dpr;
        this.bottomCon = this.scene.make.container(undefined, false);
        this.bottomCon.setSize(bottomWidth, bottomHeight);
        this.bottomCon.setPosition(0, this.bg.height * 0.5 - bottomHeight * 0.5 - 30 * this.dpr);
        this.mainCon.add(this.bottomCon);

        this.bottombg = this.scene.make.graphics(undefined, false);
        const scrollHeight = 32 * this.dpr;
        const scrollY = -bottomHeight * 0.5 + scrollHeight * 0.5 - 3 * this.dpr;
        this.mCategoryScroll = new GameScroller(this.scene, {
            x: 0,
            y: scrollY,
            width: bottomWidth,
            height: scrollHeight,
            zoom: this.scale,
            orientation: 1,
            dpr: this.dpr,
            space: 10 * this.dpr,
            cellupCallBack: (gameobject) => {
                this.onSelectSubCategoryHandler(gameobject);
            }
        });

        const propFrame = this.scene.textures.getFrame(this.key, "skill_bg");
        const capW = propFrame.width + 5 * this.dpr;
        const capH = propFrame.height + 8 * this.dpr;
        const gridX = 0, gridwidth = (this.bottomCon.width), gridheight = 200 * this.dpr;
        const gridY = scrollY + scrollHeight * 0.5 + gridheight * 0.5;
        this.mSkillGrideTable = this.createGrideTable(gridX, gridY, gridwidth, gridheight, capW, capH, () => {
            return new CharacterOwnerItem(this.scene, 0, 0, this.key, this.dpr);
        }, new Handler(this, this.onSelectItemHandler));
        const attrHeigth = 150 * this.dpr;
        this.mAttrPanel = new CharacterAttributePanel(this.scene, gridX, gridY, gridwidth - 30 * this.dpr, attrHeigth, this.key, this.dpr);
        this.bottomCon.add([this.bottombg, this.mCategoryScroll, this.mSkillGrideTable, this.mAttrPanel]);

        const bottomBtnPosx = - 60 * this.dpr;
        const bottomBtnPosy = this.bottomCon.height * 0.5 - 20 * this.dpr;
        this.addFriendBtn = new NineSliceButton(this.scene, 0, bottomBtnPosy, 94 * this.dpr, 37 * this.dpr, this.key, "button_g", i18n.t("player_info.add_friend"), this.dpr, this.scale, {
            left: 12 * this.dpr,
            top: 12 * this.dpr,
            right: 12 * this.dpr,
            bottom: 12 * this.dpr
        });
        this.addFriendBtn.setFrameNormal("button_g");
        this.privaCharBtn = new NineSliceButton(this.scene, bottomBtnPosx, bottomBtnPosy, 94 * this.dpr, 37 * this.dpr, this.commonkey, "yellow_btn", i18n.t("player_info.private_chat"), this.dpr, this.scale, {
            left: 12 * this.dpr,
            top: 12 * this.dpr,
            right: 12 * this.dpr,
            bottom: 12 * this.dpr
        });

        // this.tradeBtn = new NineSliceButton(this.scene, -bottomBtnPosx, bottomBtnPosy, 94 * this.dpr, 37 * this.dpr, this.commonkey, "red_btn", i18n.t("player_info.tade_btn"), this.dpr, this.scale, {
        //     left: 12 * this.dpr,
        //     top: 12 * this.dpr,
        //     right: 12 * this.dpr,
        //     bottom: 12 * this.dpr
        // });

        this.addFriendBtn.setTextStyle({ fontSize: 16 * this.dpr, color: "#000000" });
        this.privaCharBtn.setTextStyle({ fontSize: 16 * this.dpr, color: "#996600" });
        // this.tradeBtn.setTextStyle({ fontSize: 16 * this.dpr, color: "#ffffff" });
        this.bottomCon.add([this.addFriendBtn, this.privaCharBtn]);
        this.content.visible = false;
        this.resize(wid, hei);
        super.init();
        // this.reqPlayerInfo();
    }

    reqPlayerInfo() {
        this.render.renderEmitter("queryOwnerInfo");
    }
    public setPlayerData(data: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_SELF_PLAYER_INFO | op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ANOTHER_PLAYER_INFO) {
        if (!this.mInitialized) {
            this.mShowData = data;
            return;
        }
        this.mCharacterData = data;
        this.content.visible = true;
        const nickname = data.nickname ? data.nickname : "???";
        const current_title = data.currentTitle ? data.currentTitle : "???";
        const exp = data.level && data.level.currentLevelExp ? data.level.currentLevelExp : 0;
        const nexExp = data.level && data.level.nextLevelExp ? data.level.nextLevelExp : 0;
        const cid = data.cid || 0;
        const levle = data.level && data.level.level ? data.level.level : 0;
        const spaceOffset = this.getspaceStr(1 * this.dpr);
        if (this.avatar && data.avatarSuit) {
            const tempavatar = this.creatAvatar(data.avatarSuit);
            this.avatar.load({
                id: 0,
                avatar: tempavatar
            });
        }
        this.titleName.setText(this.getRichLabel(i18n.t("player_info.player_title")) + spaceOffset + current_title);
        const likeBtnLabel: string = data.like ? data.like + "" : "???";
        this.likeBtn.setText(likeBtnLabel + "");
        const likeposx = this.bg.width * 0.5 - this.likeBtn.width * 0.5 - this.likeBtn.text.width;
        this.likeBtn.x = likeposx - 20 * this.dpr;
        this.lvText.text = "lv " + levle;
        this.idText.setText("(52365404)");
        const subArr: Map<any, any[]> = new Map();
        const lifeSkills = data.lifeSkills ? data.lifeSkills : [];
        subArr.set(CharacterOptionType.Skill, lifeSkills);
        if (data instanceof op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_SELF_PLAYER_INFO) {
            this.nickName.setText(this.getRichLabel(i18n.t("player_info.nick_name")) + spaceOffset + nickname);
            this.likeBtn.setFrame("praise_aft");
            subArr.set(CharacterOptionType.Attribute, data.properties ? data.properties : []);
            subArr.set(CharacterOptionType.Badge, data.badges ? data.badges : []);
            this.addFriendBtn.visible = false;
            this.privaCharBtn.visible = false;
            this.mFirendMenu.visible = false;
            this.mExitBtn.visible = true;
            this.bottombg.clear();
            this.bottombg.fillStyle(0x6AE2FF, 1);
            this.bottombg.fillRect(-this.bottomCon.width * 0.5, -this.bottomCon.height * 0.5, this.bottomCon.width, this.bottomCon.height);
            const gridHeight = 200 * this.dpr;
            this.mSkillGrideTable.setSize(this.mSkillGrideTable.width, gridHeight);
            const gridx = 0, gridy = this.mCategoryScroll.y + gridHeight * 0.5 + 0 * this.dpr;
            this.mSkillGrideTable.refreshPos(gridx, gridy);
            this.mSkillGrideTable.setColumnCount(3);
            this.isOwner = true;
            this.mCharacterMenu.visible = false;
            this.mAttrPanel.setSize(this.mAttrPanel.width, gridHeight);
            this.mAttrPanel.y = gridy + 15 * this.dpr;
            this.mAttrPanel.space = 20 * this.dpr;
        } else {
            // const remark = (data.remark ? data.remark : i18n.t("player_info.note_nickname"));
            this.nickName.setText(this.getRichLabel(i18n.t("player_info.nick_name")) + spaceOffset + nickname);
            //   this.lvCon.setPosition(this.idText.x + this.lvCon.width * 0.5, -this.mainCon.height * 0.5 + 100 * this.dpr);
            this.likeBtn.setFrame("praise_bef");
            subArr.set(CharacterOptionType.Attribute, data.properties ? data.properties : []);
            subArr.set(CharacterOptionType.Badge, data.badges ? data.badges : []);
            this.addFriendBtn.visible = data.friend ? !data.friend : false;
            this.privaCharBtn.visible = data.friend ? data.friend : false;
            this.mExitBtn.visible = false;
            this.bottombg.clear();
            this.bottombg.fillStyle(0x6AE2FF, 1);
            this.bottombg.fillRect(-this.bottomCon.width * 0.5, -this.bottomCon.height * 0.5, this.bottomCon.width, this.bottomCon.height - 55 * this.dpr);
            const gridHeight = 150 * this.dpr;
            this.mSkillGrideTable.setSize(this.mSkillGrideTable.width, gridHeight);
            const gridx = 0, gridy = this.mCategoryScroll.y + gridHeight * 0.5 + 0 * this.dpr;
            this.mSkillGrideTable.refreshPos(gridx, gridy);
            this.mSkillGrideTable.setColumnCount(2);
            this.isOwner = false;
            this.mCharacterMenu.visible = true;
            this.mAttrPanel.setSize(this.mAttrPanel.width, gridHeight);
            this.mAttrPanel.y = gridy + 15 * this.dpr;
            this.mAttrPanel.space = 10 * this.dpr;
        }
        this.idText.x = this.nickName.x + this.nickName.width * (1 - this.nickName.originX) + 8 * this.dpr;
        this.mFirendMenu.visible = false;
        this.setSubCategory(subArr);
        this.setFriendRelation(FriendRelationEnum.Null);
    }

    public setFriendRelation(relation: FriendRelationEnum) {
        if (this.isOwner) {
            return;
        }
        this.mRelation = relation;
        this.mFirendMenu.visible = relation === FriendRelationEnum.Friend;
        this.mCharacterMenu.setIsBlack(relation === FriendRelationEnum.Blacklist);
        this.addFriendBtn.visible = relation !== FriendRelationEnum.Blacklist;
        if (relation === FriendRelationEnum.Followed || relation === FriendRelationEnum.Friend) {
            this.addFriendBtn.setText(i18n.t("friendlist.unfollow"));
        } else {
            this.addFriendBtn.setText(i18n.t("friendlist.follow"));
        }
    }

    public destroy() {
        this.mSkillGrideTable.destroy();
        this.mCategoryScroll.destroy();
        super.destroy();
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

    private OnClosePanel() {
        this.render.renderEmitter("hide");
    }

    private setSubCategory(map: Map<CharacterOptionType, any[]>) {
        const subNames = [i18n.t("player_info.option_live"), i18n.t("player_info.option_attribute"), i18n.t("player_info.option_badge")];
        const itemWidth = this.mScene.textures.getFrame(this.key, "title_select").width;
        const list = this.mCategoryScroll.getItemList().concat();
        this.mCategoryScroll.clearItems(false);
        for (const item of list) {
            (<Button>item).visible = false;
        }
        let index = 0;
        map.forEach((value, key) => {
            let item: Button;
            const titleName = this.getOptionName(key);
            if (index < list.length) {
                item = <Button>list[index];
            } else {
                item = new Button(this.scene, this.key, "title_normal", "title_select", titleName);
                item.width = itemWidth;
                item.height = 41 * this.dpr;
                list.push(item);
                item.setTextStyle({ color: "#2B4BB5", fontSize: 12 * this.dpr, fontFamily: Font.DEFULT_FONT });
                item.disInteractive();
                item.removeListen();
            }
            item.visible = true;
            item.setText(titleName);
            item.setData("subData", value);
            item.setData("optiontype", key);
            this.mCategoryScroll.addItem(item);
            index++;
        });
        if (list.length <= 3) this.mCategoryScroll.setAlign(1);
        else {
            this.mCategoryScroll.setAlign(2);
        }
        this.onSelectSubCategoryHandler(<Button>list[0]);
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
            this.mAttrPanel.visible = false;
            this.mSkillGrideTable.visible = false;
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
        if (!this.mCharacterData) {
            return;
        }
        switch (this.mRelation) {
            case FriendRelationEnum.Friend:
            case FriendRelationEnum.Followed:
                this.render.renderEmitter("unfollow", this.mCharacterData.cid);
                break;
            case FriendRelationEnum.Fans:
            case FriendRelationEnum.Null:
                this.render.renderEmitter("follow", this.mCharacterData.cid);
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

    private onEditorPanelHideHandler() {
        this.mainCon.visible = true;
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
        this.mainCon.visible = value;

    }
    private creatAvatar(avatar_suits: op_client.ICountablePackageItem[]) {
        const suits: AvatarSuit[] = [];
        for (const item of avatar_suits) {
            const suit: AvatarSuit = { id: item.id, suit_type: item.suitType, sn: item.sn };
            suits.push(suit);
        }
        const avatar = AvatarSuitType.createHasBaseAvatar(suits);
        return avatar;

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

    private onTrackHandler() {
        if (!this.mCharacterData) {
            return;
        }
        this.render.renderEmitter("track", this.mCharacterData.cid);
    }

    private onIntiveHandler() {
        if (!this.mCharacterData) {
            return;
        }
        this.render.renderEmitter("invite", this.mCharacterData.cid);
    }

    private onAddBlacklistHandler() {
        if (!this.mCharacterData) {
            return;
        }
        this.render.renderEmitter("addBlack", this.mCharacterData.cid);
    }

    private onRemoveBlacklistHandler() {
        if (!this.mCharacterData) {
            return;
        }
        this.render.renderEmitter("removeBlack", this.mCharacterData.cid);
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

class Menu extends Container {
    protected background: Phaser.GameObjects.Graphics;
    protected maskGraphic: Phaser.GameObjects.Graphics;
    constructor(protected render: Render, scene: Phaser.Scene, protected mDpr: number, protected mScale: number, width: number, height: number) {
        super(scene);
        this.setSize(width, height);
        this.draw();
    }

    public register() {
    }

    public unregister() {
    }

    public addMask(x: number, y: number, width: number, height: number) {
        if (!this.maskGraphic) {
            this.maskGraphic = this.scene.make.graphics(undefined, false);
        }
        this.maskGraphic.x = x;
        this.maskGraphic.y = y;
        this.maskGraphic.fillRect(-width * 0.5, -height * 0.5, width, height);
        this.setMask(this.maskGraphic.createGeometryMask());
    }
    protected draw() {
        this.createBackground();
    }

    protected createBackground() {
        if (!this.background) {
            this.background = this.scene.make.graphics(undefined, false);
        }
        const radius = 3 * this.mDpr;
        this.background.fillStyle(0x001D9F, 0.2);
        this.background.fillRoundedRect(0, 0, this.width, this.height, { tl: radius, tr: 0, br: 0, bl: radius });
        this.addAt(this.background, 0);
    }
}

class FriendMenu extends Menu {
    private inviteBtn: NineSliceButton;
    private trackBtn: NineSliceButton;
    private buttons: NineSliceButton[];
    private operation: Text;
    private operationContaienr: Container;
    private isExpand: boolean = false;
    private tween: Phaser.Tweens.Tween;
    private autoCollapseTime: any;
    constructor(render: Render, scene: Phaser.Scene, dpr: number, scale: number) {
        super(render, scene, dpr, scale, 58 * dpr, 40 * dpr);
    }

    register() {
        this.trackBtn.on(String(ClickEvent.Tap), this.onTrackHandler, this);
        this.inviteBtn.on(String(ClickEvent.Tap), this.onInviteHandler, this);
        const { width, height } = this.operation;
        this.operation.setInteractive(new Phaser.Geom.Rectangle(-width, -height, width * 3, height * 3), Phaser.Geom.Rectangle.Contains);
        this.operation.on("pointerup", this.onSwitchOperationHandler, this);
    }

    unregister() {
        this.trackBtn.off(String(ClickEvent.Tap), this.onTrackHandler, this);
        this.inviteBtn.off(String(ClickEvent.Tap), this.onInviteHandler, this);
        this.operation.disableInteractive();
        this.operation.on("pointerup", this.onSwitchOperationHandler, this);

    }

    destroy() {
        if (this.operationContaienr) this.operationContaienr.destroy();
        if (this.operation) this.operation.destroy();
        if (this.inviteBtn) this.inviteBtn.destroy();
        if (this.trackBtn) this.trackBtn.destroy();
        if (this.tween) this.tween.stop();
        if (this.autoCollapseTime) {
            clearTimeout(this.autoCollapseTime);
        }
        this.buttons = [];
    }

    protected expand() {
        if (this.tween && this.tween.isPlaying()) {
            return;
        }
        this.operationContaienr.remove(this.operation);
        this.operationContaienr.remove(this.background);
        this.operationContaienr.add(this.buttons);
        const bound = this.getBounds();
        this.isExpand = true;
        if (bound) {
            const width = bound.width + 8 * this.mDpr;
            this.setSize(width, this.height);
            this.createBackground();
            this.operationContaienr.addAt(this.background, 0);
            this.operationContaienr.x = bound.width * 0.5;
            this.tween = this.scene.tweens.add({
                targets: this.operationContaienr,
                props: { x: -bound.width * 0.5, alpha: 1 },
                duration: 100,
            });

            this.autoCollapseTime = setTimeout(() => {
                this.autoCollapseTime = null;
                this.collapse();
            }, 3000);
        }
    }

    protected collapse() {
        if (this.tween && this.tween.isPlaying()) {
            return;
        }
        if (this.autoCollapseTime) {
            clearTimeout(this.autoCollapseTime);
        }
        this.tween = this.scene.tweens.add({
            targets: this.operationContaienr,
            props: { x: this.width * 0.5 },
            duration: 100,
            onComplete: () => {
                this.operationContaienr.remove([...this.buttons], false);
                this.operationContaienr.add(this.operation);
                this.setSize(58 * this.mDpr, 40 * this.mDpr);
                this.createBackground();
                this.operationContaienr.addAt(this.background, 0);
                this.operationContaienr.x = 0;
                this.isExpand = false;
            }
        });
    }

    protected draw() {
        // super.draw();
        this.operationContaienr = this.scene.make.container(undefined, false);
        this.add(this.operationContaienr);

        this.buttons = [];
        this.inviteBtn = this.createButton(i18n.t("player_info.invite"));
        this.buttons.push(this.inviteBtn);

        this.trackBtn = this.createButton(i18n.t("player_info.track"));
        this.buttons.push(this.trackBtn);

        this.operation = this.scene.make.text({
            x: this.width * 0.5,
            y: this.height * 0.5,
            text: i18n.t("player_info.operation"),
            style: {
                color: "#FFD248",
                fontSize: 10 * this.mDpr,
                fontFamily: Font.DEFULT_FONT,
            }
        }, false).setOrigin(0.5);

        for (let i = 0; i < this.buttons.length; i++) {
            if (i === 0) {
                this.buttons[i].x = this.buttons[i].width * 0.5 + 6 * this.mDpr;
            } else {
                this.buttons[i].x = this.buttons[i - 1].x + (this.buttons[i - 1].width + this.buttons[i].width) * 0.5 + 6 * this.mDpr;
            }
            this.buttons[i].y = this.height * 0.5;
        }
        this.collapse();
        // this.add(this.operation);
        // const bound = this.getBounds();
    }

    protected createBackground() {
        if (!this.background) {
            this.background = this.scene.make.graphics(undefined, false);
        }
        const radius = 3 * this.mDpr;
        this.background.clear();
        this.background.fillStyle(0x001D9F, 0.2);
        this.background.fillRoundedRect(0, 0, this.width, this.height, { tl: radius, tr: 0, br: 0, bl: radius });
    }

    private onTrackHandler() {
        this.render.renderEmitter("track");
        this.collapse();
    }

    private onInviteHandler() {
        this.render.renderEmitter("invite");
        this.collapse();
    }

    private onSwitchOperationHandler() {
        this.isExpand ? this.collapse() : this.expand();
    }

    private createButton(text: string) {
        const dpr = this.mDpr;
        const scale = this.mScale;
        const btn = new NineSliceButton(this.scene, -0, 0, 48 * dpr, 26 * dpr, UIAtlasKey.commonKey, "yellow_btn_normal_s", text, dpr, scale, {
            left: 8 * dpr,
            top: 8 * dpr,
            right: 8 * dpr,
            bottom: 10 * dpr
        });
        btn.setTextStyle({
            color: "#996600",
            fontSize: 10 * dpr,
            fontFamily: Font.DEFULT_FONT
        });
        return btn;
    }
}

class CharacterMenu extends Menu {
    private addBlacklistBtn: NineSliceButton;
    private isBlack: boolean;
    constructor(render: Render, scene: Phaser.Scene, dpr: number, scale: number) {
        super(render, scene, dpr, scale, 58 * dpr, 36 * dpr);
    }

    public register() {
        this.addBlacklistBtn.on(String(ClickEvent.Tap), this.onAddBlackHandler, this);
    }

    public unregister() {
        this.addBlacklistBtn.off(String(ClickEvent.Tap), this.onAddBlackHandler, this);
    }

    setIsBlack(val: boolean) {
        this.isBlack = val;
        this.addBlacklistBtn.setText(i18n.t(val ? "player_info.remove_black" : "player_info.add_black"));
    }

    protected draw() {
        super.draw();
        this.addBlacklistBtn = new NineSliceButton(this.scene, 0, 0, 55 * this.mDpr, 24 * this.mDpr, UIAtlasKey.commonKey, "red_btn_normal", i18n.t("player_info.add_black"), this.mDpr, this.mScale, {
            left: 12 * this.mDpr,
            top: 12 * this.mDpr,
            right: 12 * this.mDpr,
            bottom: 12 * this.mDpr
        });
        this.addBlacklistBtn.setTextStyle({
            color: "#FFFFFF",
            fontSize: 10 * this.mDpr,
            fontFamily: Font.DEFULT_FONT
        });
        this.addBlacklistBtn.x = this.width * 0.5;
        this.addBlacklistBtn.y = 6 * this.mDpr + this.addBlacklistBtn.height * 0.5;
        this.add(this.addBlacklistBtn);
    }

    private onAddBlackHandler() {
        this.render.emitter.emit(this.isBlack ? "removeBlack" : "addBlack");
    }
}
