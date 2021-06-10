import { ToggleColorButton, UiManager } from "gamecoreRender";
import { EventType, FriendChannel, FriendData, FriendRelation, FriendRelationAction, FriendRelationEnum, ModuleName } from "structure";
import { Handler, i18n, UIHelper, Url } from "utils";
import { op_pkt_def } from "pixelpai_proto";
import { PicaBasePanel } from "../pica.base.panel";
import { Button, ClickEvent, GameGridTable } from "apowophaserui";
import { ImageValue } from "..";
import { UIAtlasName } from "picaRes";
import { CommonBackground } from "../Components";
import { PicaFriendBasePanel } from "./PicaFriendBasePanel";
import { PicaFriendInfoPanel } from "./PicaFriendInfoPanel";
import { PicaFriendBottomPanel } from "./PicaFriendBottomPanel";
import { PicaFriendListPanel } from "./PicaFriendListPanel";
import { PicaFriendAddPanel } from "./PicaFriendAddPanel";
import { PicaFollowNoticePanel } from "./PicaFollowNoticePanel";
import { PicaFriendBlackPanel } from "./PicaFriendBlackPanel";
export class PicaNewFriendPanel extends PicaBasePanel {
    private content: Phaser.GameObjects.Container;
    private mainCon: Phaser.GameObjects.Container;
    private mBlack: Phaser.GameObjects.Graphics;
    private mBackground: CommonBackground;
    private titleTex: Phaser.GameObjects.Text;
    private peopleImg: ImageValue;
    private toggleCon: Phaser.GameObjects.Container;
    private optionLine: Phaser.GameObjects.Image;
    private selectLine: Phaser.GameObjects.Image;
    private curToggleItem: ToggleColorButton;
    private toggleItems: ToggleColorButton[] = [];
    private basePanelMap: Map<FriendChannel, PicaFriendBasePanel> = new Map();
    private playerPanel: PicaFriendInfoPanel;
    private bottomPanel: PicaFriendBottomPanel;
    private people: number;
    private optionType: number;
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.key = ModuleName.PICANEWFRIEND_NAME;
        this.loadAtlas = [UIAtlasName.uicommon, UIAtlasName.friend_new, UIAtlasName.friend_message];
        this.textures = [{ atlasName: "friend_message_bg", folder: "friend_new" }, { atlasName: "Create_role_bg", folder: "texture" }];
    }

    public resize(w: number, h: number) {
        const scale = this.scale;
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.content.x = width + this.content.width * 0.5 + 10 * this.dpr;
        this.content.y = height * 0.5;
        this.setSize(width, height);
    }

    public onShow() {
        this.openFriendListPanel();
        this.onToggleButtonHandler(undefined, this.toggleItems[0]);
    }
    public setFriend(type: FriendChannel, friends: any[]) {
        const panel = this.basePanelMap.get(this.optionType);
        panel.setFriendDatas(type, friends);
        if (type === FriendChannel.Friends || type === FriendChannel.Fans || type === FriendChannel.Followes) {
            this.peopleImg.setText(friends.length + "");
        }
    }

    public updateFriend(content: any) {
        const panel = this.basePanelMap.get(this.optionType);
        panel.updateFriendDatas(content);
    }

    public updateRelation(relations: FriendRelation[]) {
        const panel = this.basePanelMap.get(this.optionType);
        panel.updateRelation(relations);
    }
    public filterById(id: string, relation?: FriendRelationAction) {
        const panel = this.basePanelMap.get(this.optionType);
        panel.filterById(id, relation);
        this.updatePlayerRelation(id);
    }
    public updatePlayerRelation(id: string) {
        if (this.playerPanel && this.playerPanel.visible) {
            this.playerPanel.updateFriendRelation(id);
        }

    }
    public setPlayerInfo(data) {
        if (this.playerPanel) this.playerPanel.setPlayerData(data);
    }
    protected onInitialized() {
        if (this.people) this.peopleImg.setText(this.people + "");
    }

    protected init() {
        if (this.mInitialized) return;
        const w = this.scaleWidth;
        const h = this.scaleHeight;
        this.mBlack = this.scene.make.graphics(undefined, false);
        this.mBlack.fillStyle(0, 0.66);
        this.mBlack.fillRect(0, 0, w, h);
        this.mBlack.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
        this.mBlack.on("pointerup", this.onCloseHandler, this);
        this.add(this.mBlack);
        this.content = this.scene.make.container(undefined, false);
        this.mainCon = this.scene.make.container(undefined, false);
        const bgwidth = 300 * this.dpr;
        this.content.setSize(bgwidth, h);
        this.content.setInteractive();
        this.mBackground = new CommonBackground(this.scene, 0, 0, bgwidth, h);
        this.titleTex = this.scene.make.text({ x: 0, y: 0, text: i18n.t("friendlist.title"), style: UIHelper.whiteStyle(this.dpr, 18) }).setOrigin(0, 0.5);
        this.titleTex.setFontStyle("bold");
        this.titleTex.x = -this.content.width * 0.5 + 10 * this.dpr;
        this.titleTex.y = -this.content.height * 0.5 + 35 * this.dpr;
        this.peopleImg = new ImageValue(this.scene, 50 * this.dpr, 20 * this.dpr, UIAtlasName.uicommon, "online_people", this.dpr);
        this.peopleImg.setOffset(-this.dpr, 0);
        this.peopleImg.setTextStyle(UIHelper.whiteStyle(this.dpr, 14));
        this.peopleImg.setLayout(3);
        this.peopleImg.setText("1000");
        this.peopleImg.x = this.content.width * 0.5 - 30 * this.dpr;
        this.peopleImg.y = this.titleTex.y;
        this.toggleCon = this.scene.make.container(undefined, false);
        this.toggleCon.y = this.peopleImg.y + this.peopleImg.height * 0.5 + 20 * this.dpr;
        this.optionLine = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "map_nav_line" });
        this.optionLine.displayHeight = 2 * this.dpr;
        this.selectLine = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "map_nav_select" });
        this.createOptionButtons();
        this.toggleCon.add([this.optionLine, this.selectLine]);
        this.mainCon.add([this.titleTex, this.peopleImg, this.toggleCon]);
        this.content.add([this.mBackground, this.mainCon]);
        this.add(this.content);
        this.resize(0, 0);
        super.init();
        this.playMove(Handler.create(this, () => {
            this.basePanelMap.forEach((value) => {
                value.refreshMask();
            });
        }));
    }
    protected createOptionButtons() {
        const arr = [{ text: i18n.t("friendlist.friends"), type: FriendChannel.Friends }, { text: i18n.t("friendlist.fans"), type: FriendChannel.Fans }, { text: i18n.t("friendlist.follow"), type: FriendChannel.Followes }];
        const allLin = 272 * this.dpr;
        const cellwidth = allLin / arr.length;
        const cellHeight = 20 * this.dpr;
        let posx = -allLin / 2;
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < arr.length; i++) {
            const data = arr[i];
            const item = new ToggleColorButton(this.scene, cellwidth, 20 * this.dpr, this.dpr, data.text);
            item.on(ClickEvent.Tap, this.onToggleButtonHandler, this);
            item.x = posx + cellwidth * 0.5;
            item.setData("item", data.type);
            item.setSize(cellwidth, cellHeight);
            this.toggleCon.add(item);
            item.setChangeColor("#FFF449");
            item.setFontSize(14 * this.dpr);
            posx += cellwidth;
            this.toggleItems.push(item);
        }
        this.optionLine.y = 20 * this.dpr;
        this.selectLine.y = this.optionLine.y;
    }
    private onToggleButtonHandler(pointer: any, toggle: ToggleColorButton) {
        if (this.curToggleItem === toggle) return;
        if (this.curToggleItem) this.curToggleItem.isOn = false;
        this.curToggleItem = toggle;
        this.optionType = toggle.getData("item");
        this.selectLine.x = toggle.x;
        toggle.isOn = true;
        this.onFetchFriendHandler(this.optionType);
    }
    private playMove(compl: Handler) {
        const width = this.scaleWidth;
        const from = width + this.content.width * 0.5 + 10 * this.dpr;
        const to = width - this.content.width * 0.5;
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
                if (compl) compl.run();
            },
        });
    }

    private onCloseHandler() {
        this.render.renderEmitter(this.key + "_hide");
    }

    private onFetchFriendHandler(index: number) {
        this.render.renderEmitter(EventType.FETCH_FRIEND, index);
    }

    private openFriendListPanel() {
        this.showFriendListPanel();
    }

    private showFriendListPanel() {
        let panel: PicaFriendBasePanel;
        if (!this.basePanelMap.has(FriendChannel.Friends)) {
            const height = this.scaleHeight - 100 * this.dpr;
            panel = new PicaFriendListPanel(this.scene, 300 * this.dpr, height, this.dpr, this.scale);
            panel.setHandler(new Handler(this, this.onFriendListPanelHandler));
            this.mainCon.add(panel);
            this.basePanelMap.set(FriendChannel.Friends, panel);
            this.basePanelMap.set(FriendChannel.Fans, panel);
            this.basePanelMap.set(FriendChannel.Followes, panel);
        }
        panel = this.basePanelMap.get(FriendChannel.Friends);
        panel.refreshMask();
        panel.visible = true;
    }

    private hideFriendListPanel() {
        const panel = this.basePanelMap.get(FriendChannel.Friends);
        panel.visible = false;
    }

    private openFriendAddPanel() {
        this.showFriendAddPanel();
        this.optionType = FriendChannel.Search;
        const panel = this.basePanelMap.get(FriendChannel.Search);
        panel.setFriendDatas(this.optionType, []);
    }
    private showFriendAddPanel() {
        let panel: PicaFriendBasePanel;
        if (!this.basePanelMap.has(FriendChannel.Search)) {
            const height = this.scaleHeight;
            panel = new PicaFriendAddPanel(this.scene, 300 * this.dpr, height, this.dpr, this.scale);
            panel.setHandler(new Handler(this, this.onFriendAddPanelHandler));
            this.content.add(panel);
            this.basePanelMap.set(FriendChannel.Search, panel);
        }
        panel = this.basePanelMap.get(FriendChannel.Search);
        panel.show();
        panel.refreshMask();
    }

    private hideFriendAddPanel() {
        const panel = this.basePanelMap.get(FriendChannel.Search);
        panel.hide();
    }
    private openFriendNoticePanel() {
        this.showFriendNoticePanel();
        this.optionType = FriendChannel.Notice;
        this.render.renderEmitter(EventType.REQ_NEW_FANS);
    }
    private showFriendNoticePanel() {
        let panel: PicaFriendBasePanel;
        if (!this.basePanelMap.has(FriendChannel.Notice)) {
            const height = this.scaleHeight;
            panel = new PicaFollowNoticePanel(this.scene, 300 * this.dpr, height, this.dpr, this.scale);
            panel.setHandler(new Handler(this, this.onFriendNoticePanelHandler));
            this.content.add(panel);
            this.basePanelMap.set(FriendChannel.Notice, panel);
        }
        panel = this.basePanelMap.get(FriendChannel.Notice);
        panel.visible = true;
        panel.refreshMask();
    }

    private hideFriendNoticePanel() {
        const panel = this.basePanelMap.get(FriendChannel.Notice);
        panel.visible = false;
    }

    private openFriendBlackPanel() {
        this.showFriendBlackPanel();
        this.optionType = FriendChannel.Blacklist;
        this.render.renderEmitter(EventType.REQ_BLACKLIST);
    }
    private showFriendBlackPanel() {
        let panel: PicaFriendBasePanel;
        if (!this.basePanelMap.has(FriendChannel.Blacklist)) {
            const height = this.scaleHeight;
            panel = new PicaFriendBlackPanel(this.scene, 300 * this.dpr, height, this.dpr, this.scale);
            panel.setHandler(new Handler(this, this.onBlackPanelHandler));
            this.content.add(panel);
            this.basePanelMap.set(FriendChannel.Blacklist, panel);
        }
        panel = this.basePanelMap.get(FriendChannel.Blacklist);
        panel.visible = true;
        panel.refreshMask();
    }

    private hideFriendBlackPanel() {
        const panel = this.basePanelMap.get(FriendChannel.Blacklist);
        panel.visible = false;
    }

    private openFriendInfoPanel(data: FriendData) {
        this.showFriendInfoPanel();
        this.playerPanel.setFriendRelation(data.relation);
        this.render.renderEmitter(EventType.REQ_FRIEND_ATTRIBUTES, data.id);
    }
    private showFriendInfoPanel() {
        if (!this.playerPanel) {
            this.playerPanel = new PicaFriendInfoPanel(this.scene, this.render, this.scaleWidth, this.scaleHeight, this.dpr, this.scale);
            this.playerPanel.setHandler(new Handler(this, this.onFriendInfoPanelHandler));
            this.add(this.playerPanel);
            this.playerPanel.x = this.scaleWidth * 0.5;
            this.playerPanel.y = this.scaleHeight * 0.5;
        }
        this.playerPanel.visible = true;
    }

    private hideFriendInfoPanel() {
        this.playerPanel.visible = false;
    }

    private showMainContentPanel() {
        this.mainCon.visible = true;
    }
    private hideMainContentPanel() {
        this.mainCon.visible = false;
    }
    private showContentPanel() {
        this.content.visible = true;
    }
    private hideContentPanel() {
        this.content.visible = false;
    }
    private openBottomPanel(data: any, black: boolean) {
        this.showFriendBottomPanel();
        this.bottomPanel.setRoleData(data, black);
    }
    private showFriendBottomPanel() {
        if (!this.bottomPanel) {
            this.bottomPanel = new PicaFriendBottomPanel(this.scene, this.scaleWidth, this.scaleHeight, UIAtlasName.uicommon, this.dpr);
            this.bottomPanel.setHandler(new Handler(this, this.onBottomPanelHandler));
            this.add(this.bottomPanel);
            this.bottomPanel.x = this.scaleWidth * 0.5;
            this.bottomPanel.y = this.scaleHeight * 0.5;
        }
        this.bottomPanel.show();
    }
    private hideFriendBottomPanel() {
        this.bottomPanel.hide();
    }
    private onFriendListPanelHandler(tag: string, data?: any) {
        if (tag === "frienditem") {
            this.excuteFuntionItem(data);
        } else if (tag === "follow") {
            this.render.renderEmitter(EventType.FOLLOW, data.id);
            this.updateFriendRelation(FriendRelationAction.FRIEND);
        } else if (tag === "more") {
            this.openBottomPanel(data, false);
        } else if (tag === "REQ_PLAYER_LIST") {
            this.REQ_PLAYER_LIST(data);
        } else if (tag === "addfriendpanel") {
            this.openFriendAddPanel();
            this.hideMainContentPanel();
        }
    }

    private excuteFuntionItem(data) {
        const itemType = data.itemType;
        if (itemType === 1) {
            this.openFriendInfoPanel(data);
            this.hideContentPanel();
        } else if (itemType === 2) {
            this.openFriendNoticePanel();
        } else if (itemType === 3) {
            this.openFriendAddPanel();
        } else if (itemType === 4) {
            this.openFriendBlackPanel();
        }
        if (itemType !== 5 && itemType !== 1) this.hideMainContentPanel();
    }

    private onFriendNoticePanelHandler(tag: string, data?: any) {
        if (tag === "back") {
            this.hideFriendNoticePanel();
            this.showMainContentPanel();
        } else if (tag === "REQ_PLAYER_LIST") {
            this.REQ_PLAYER_LIST(data);
        }
    }
    private onFriendAddPanelHandler(tag: string, data?: any) {
        if (tag === "back") {
            this.hideFriendAddPanel();
            this.showMainContentPanel();
        } else if (tag === "REQ_FRIEND_RELATION") {
            this.render.renderEmitter(EventType.REQ_RELATION, data);
        } else if (tag === "searchfriend") {
            this.render.renderEmitter(EventType.SEARCH_FRIEND, data);
        } else if (tag === "follow") {
            this.render.renderEmitter(EventType.FOLLOW, data.id);
            if (data.relation === FriendRelationEnum.Fans) {
                this.updateFriendRelation(FriendRelationAction.FOLLOW);
            } else {
                this.updateFriendRelation(FriendRelationAction.FRIEND);
            }
        } else if (tag === "more") {
            this.openBottomPanel(data, data.relation === FriendRelationEnum.Blacklist);
        } else if (tag === "frienditem") {
            this.excuteFuntionItem(data);
        }
    }
    private onBottomPanelHandler(tag: string, data?: any) {
        if (tag === "close") {
            this.hideFriendBottomPanel();
        } else if (tag === "report") {

        } else if (tag === "block") {
            const uid = data.uid;
            const black = data.black;
            if (black) {
                this.render.renderEmitter(this.key + "_block", uid);
                this.updateFriendRelation(FriendRelationAction.BAN);
            } else {
                this.render.renderEmitter(EventType.REMOVE_FROM_BLACKLIST, uid);
                this.updateFriendRelation(FriendRelationAction.UNBAN);
            }
            this.hideFriendBottomPanel();
        }
    }
    private onFriendInfoPanelHandler(tag: string, data?: any) {
        if (tag === "close") {
            this.showContentPanel();
            this.hideFriendInfoPanel();
        } else {
            this.render.renderEmitter(tag, data);

            if (this.optionType === FriendChannel.Friends || this.optionType === FriendChannel.Followes) {
                if (tag === EventType.FOLLOW) {
                    this.render.renderEmitter(EventType.FETCH_FRIEND, this.optionType);
                }
            } else if (this.optionType === FriendChannel.Fans) {
                if (tag === EventType.UNFOLLOW) {
                    this.render.renderEmitter(EventType.FETCH_FRIEND, this.optionType);
                }
            }

        }
    }
    private onBlackPanelHandler(tag: string, data?: any) {
        if (tag === "back") {
            this.hideFriendBlackPanel();
            this.showMainContentPanel();
        } else if (tag === "REQ_PLAYER_LIST") {
            this.REQ_PLAYER_LIST(data);
        } else if (tag === "more") {
            this.openBottomPanel(data, true);
        } else if (tag === "frienditem") {
            this.excuteFuntionItem(data);
        }
    }

    private REQ_PLAYER_LIST(data: any) {
        this.render.renderEmitter(EventType.REQ_PLAYER_LIST, data);
    }
    private updateFriendRelation(raltion: FriendRelationAction) {
        let notice = "";
        if (raltion === FriendRelationAction.FRIEND) {
            notice = i18n.t("friendlist.addfriended");
        } else if (raltion === FriendRelationAction.FOLLOW) {
            notice = i18n.t("friendlist.followed");
        } else if (raltion === FriendRelationAction.BAN) {
            notice = i18n.t("friendlist.blacklisted");
        } else if (raltion === FriendRelationAction.UNBAN) {
            notice = i18n.t("friendlist.removed");
        }
        if (notice !== "") {
            const tempdata = {
                text: [{ text: notice, node: undefined }]
            };
            this.render.mainPeer.showMediator(ModuleName.PICANOTICE_NAME, true, tempdata);
        }
    }

}
