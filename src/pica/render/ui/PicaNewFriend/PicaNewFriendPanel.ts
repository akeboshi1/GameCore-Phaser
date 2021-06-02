import { ToggleColorButton, UiManager } from "gamecoreRender";
import { EventType, FriendChannel, FriendData, FriendRelation, ModuleName } from "structure";
import { Handler, i18n, UIHelper, Url } from "utils";
import { op_pkt_def } from "pixelpai_proto";
import { PicaBasePanel } from "../pica.base.panel";
import { Button, ClickEvent, GameGridTable } from "apowophaserui";
import { ImageValue } from "..";
import { PicaFriendListPanel } from "./PicaFriendListPanel";
import { UIAtlasName } from "picaRes";
import { PicaFriendAddPanel } from "./PicaFriendAddPanel";
import { PicaFollowNoticePanel } from "./PicaFollowNoticePanel";
import { PicaFriendBlackPanel } from "./PicaFriendBlackPanel";
import { PicaFriendInfoPanel } from "./PicaFriendInfoPanel";
import { PicaFriendBottomPanel } from "./PicaFriendBottomPanel";
import { CommonBackground } from "../Components";
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
    private friendListPanel: PicaFriendListPanel;
    private addPanel: PicaFriendAddPanel;
    private noticePanel: PicaFollowNoticePanel;
    private blackPanel: PicaFriendBlackPanel;
    private playerPanel: PicaFriendInfoPanel;
    private bottomPanel: PicaFriendBottomPanel;
    private people: number;
    private optionType: number;
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.key = ModuleName.PICANEWFRIEND_NAME;
        this.atlasNames = [UIAtlasName.uicommon, UIAtlasName.friend_new, UIAtlasName.friend_message];
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
        if (this.friendListPanel) this.friendListPanel.setFriendDatas(type, friends);
    }

    public updateFriend(content: any) {
        if (this.friendListPanel) this.friendListPanel.updateFriendDatas(content);
    }

    public updateRelation(relations: FriendRelation[]) {
        if (this.friendListPanel) {
            this.friendListPanel.updateRelation(relations);
        }
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
        this.mainCon.add([this.mBackground, this.titleTex, this.peopleImg, this.toggleCon]);
        this.content.add(this.mainCon);
        this.add(this.content);
        this.resize(0, 0);
        super.init();
        this.playMove(Handler.create(this, () => {
            if (this.friendListPanel) this.friendListPanel.refreshMask();
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

    private onReqFriendAttributesHandler(id: string) {
        this.render.renderEmitter(EventType.REQ_FRIEND_ATTRIBUTES, id);
    }

    private onReqFriendListHandler(ids: number[]) {
        this.render.renderEmitter(EventType.REQ_PLAYER_LIST, ids);
    }

    private onRendererEventHandler(event: string, args) {
        if (event) this.render.renderEmitter(event, args);
    }

    private onReqFriendRelationHandler(friends: FriendData[]) {
        if (!friends) {
            return;
        }
        const ids = friends.map((friend) => friend.id);
        if (ids.length > 0) this.render.renderEmitter(EventType.REQ_RELATION, ids);
        // for (const friend of friends) {
        //     friend.relation = this.friendContainer.checkRelation(friend);
        // }
        // this.mShowingSubContainer.updateFriends(friends);
    }

    private openFriendListPanel() {
        this.showFriendListPanel();
    }

    private showFriendListPanel() {
        if (!this.friendListPanel) {
            const height = this.scaleHeight - 100 * this.dpr;
            this.friendListPanel = new PicaFriendListPanel(this.scene, 300 * this.dpr, height, this.dpr, this.scale);
            this.friendListPanel.setHandler(new Handler(this, this.onFriendListPanelHandler));
            this.mainCon.add(this.friendListPanel);
        }
        this.friendListPanel.visible = true;
    }

    private hideFriendListPanel() {
        this.friendListPanel.visible = false;
    }

    private openFriendAddPanel() {
        this.showFriendAddPanel();
    }
    private showFriendAddPanel() {
        if (!this.addPanel) {
            const height = this.scaleHeight;
            this.addPanel = new PicaFriendAddPanel(this.scene, 300 * this.dpr, height, this.dpr, this.scale);
            this.addPanel.setHandler(new Handler(this, this.onFriendAddPanelHandler));
            this.content.add(this.addPanel);
        }
        this.addPanel.visible = true;
    }

    private hideFriendAddPanel() {
        this.addPanel.visible = false;
    }
    private openFriendNoticePanel() {
        this.showFriendNoticePanel();
    }
    private showFriendNoticePanel() {
        if (!this.noticePanel) {
            const height = this.scaleHeight;
            this.noticePanel = new PicaFollowNoticePanel(this.scene, 300 * this.dpr, height, this.dpr, this.scale);
            this.noticePanel.setHandler(new Handler(this, this.onFriendNoticePanelHandler));
            this.content.add(this.noticePanel);
        }
        this.noticePanel.visible = true;
    }

    private hideFriendNoticePanel() {
        this.noticePanel.visible = false;
    }

    private openFriendBlackPanel() {
        this.showFriendBlackPanel();
    }
    private showFriendBlackPanel() {
        if (!this.blackPanel) {
            const height = this.scaleHeight;
            this.blackPanel = new PicaFriendBlackPanel(this.scene, 300 * this.dpr, height, this.dpr, this.scale);
            this.blackPanel.setHandler(new Handler(this, this.onBlackPanelHandler));
            this.content.add(this.blackPanel);
        }
        this.blackPanel.visible = true;
    }

    private hideFriendBlackPanel() {
        this.blackPanel.visible = false;
    }

    private openFriendInfoPanel() {
        this.showFriendInfoPanel();
    }
    private showFriendInfoPanel() {
        if (!this.playerPanel) {
            this.playerPanel = new PicaFriendInfoPanel(this.scene, this.render, this.scaleWidth, this.scaleHeight, this.dpr, this.scale);
            this.playerPanel.setHandler(new Handler(this, this.onFriendInfoPanelHandler));
            this.add(this.playerPanel);
        }
        this.playerPanel.visible = true;
    }

    private hideFriendInfoPanel() {
        this.playerPanel.visible = false;
    }

    private showContentPanel() {
        this.mainCon.visible = true;
    }
    private hideContentPanel() {
        this.mainCon.visible = false;
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
        }
        this.bottomPanel.visible = true;
    }
    private hideFriendBottomPanel() {
        this.bottomPanel.visible = false;
    }
    private onFriendListPanelHandler(tag: string, data?: any) {
        if (tag === "frienditem") {
            this.excuteFuntionItem(data);
        } else if (tag === "follow") {

        } else if (tag === "more") {
            this.openBottomPanel(data, false);
        } else if (tag === "REQ_PLAYER_LIST") {
            this.render.renderEmitter(EventType.REQ_PLAYER_LIST, data);
        } else if (tag === "addfriendpanel") {
            this.showFriendAddPanel();
            this.hideFriendListPanel();
        }
    }

    private excuteFuntionItem(data) {
        if (data.itemType === 1) {
            this.openFriendInfoPanel();
        } else if (data.itemType === 2) {
            this.openFriendNoticePanel();
        } else if (data.itemType === 3) {
            this.openFriendAddPanel();
        } else if (data.itemType === 4) {
            this.openFriendBlackPanel();
        }
        this.hideContentPanel();
    }

    private onFriendNoticePanelHandler(tag: string, data?: any) {

    }
    private onFriendAddPanelHandler(tag: string, data?: any) {

    }
    private onBottomPanelHandler(tag: string, data?: any) {

    }
    private onFriendInfoPanelHandler(tag: string, data?: any) {
        if (tag === "close") {
            this.showContentPanel();
            this.hideFriendInfoPanel();
        }
    }
    private onBlackPanelHandler(tag: string, data?: any) {

    }
}
