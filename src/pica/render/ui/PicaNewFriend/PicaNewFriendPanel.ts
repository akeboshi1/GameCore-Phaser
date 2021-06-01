import { ToggleColorButton, UiManager } from "gamecoreRender";
import { EventType, FriendChannel, FriendData, FriendRelation, ModuleName } from "structure";
import { Handler, i18n, UIHelper, Url } from "utils";
import { op_pkt_def } from "pixelpai_proto";
import { PicaBasePanel } from "../pica.base.panel";
import { Button, ClickEvent, GameGridTable } from "apowophaserui";
import { ImageValue } from "..";
import { PicaFriendListPanel } from "./PicaFriendListPanel";
import { UIAtlasName } from "picaRes";
export class PicaNewFriendPanel extends PicaBasePanel {
    private content: Phaser.GameObjects.Container;
    private mBlack: Phaser.GameObjects.Graphics;
    private mBackground: Phaser.GameObjects.Graphics;
    private bg: Phaser.GameObjects.Image;
    private titleTex: Phaser.GameObjects.Text;
    private peopleImg: ImageValue;
    private toggleCon: Phaser.GameObjects.Container;
    private optionLine: Phaser.GameObjects.Image;
    private selectLine: Phaser.GameObjects.Image;
    private curToggleItem: ToggleColorButton;
    private toggleItems: ToggleColorButton[] = [];
    private friendListPanel: PicaFriendListPanel;
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
        this.mBackground.clear();
        this.mBackground.fillStyle(0x01CDFF, 1);
        this.mBackground.fillRect(0, 0, this.content.width, height);
        this.mBackground.x = -this.content.width * 0.5;
        this.mBackground.y = -height * 0.5;
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
        this.mBackground = this.scene.make.graphics(undefined, false);
        this.content = this.scene.make.container(undefined, false);
        const bgwidth = 300 * this.dpr;
        this.content.setSize(bgwidth, h);
        this.content.setInteractive();
        this.bg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "online_bg" });
        this.bg.displayWidth = bgwidth;
        this.bg.y = -h * 0.5 + this.bg.height * 0.5;
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
        this.content.add([this.mBackground, this.bg, this.titleTex, this.peopleImg, this.toggleCon]);
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
            this.content.add(this.friendListPanel);
        }
        this.friendListPanel.visible = true;
    }

    private hideFriendListPanel() {
        this.friendListPanel.visible = false;
    }

    private onFriendListPanelHandler(tag: string, data?: any) {
        if (tag === "follow") {

        } else if (tag === "more") {

        } else if (tag === "REQ_PLAYER_LIST") {
            this.render.renderEmitter(EventType.REQ_PLAYER_LIST, data);
        }
    }
}
