
import { op_client } from "pixelpai_proto";
import { Button, ClickEvent, UIType } from "apowophaserui";
import { BasePanel, ImageValue, ThreeSliceButton, ThreeSlicePath, UIDragonbonesDisplay, UiManager } from "gamecoreRender";
import { AvatarSuit, AvatarSuitType, ModuleName } from "structure";
import { UIAtlasName } from "picaRes";
import { Handler, i18n, UIHelper } from "utils";
import { PicaBasePanel } from "../pica.base.panel";
export class PicaNewRolePanel extends PicaBasePanel {
    private blackGraphic: Phaser.GameObjects.Graphics;
    private bg: ThreeSlicePath;
    private nameImage: ImageValue;
    private openBigBtn: Button;
    private headAvatar: UIDragonbonesDisplay;
    private content: Phaser.GameObjects.Container;
    private levelLabel: Phaser.GameObjects.Text;
    // private vipvalue: ImageValue;
    private followBtn: ThreeSliceButton;
    private tradingBtn: ThreeSliceButton;
    private actionContanier: PeopleActionContainer;
    private roleData: any;
    private followed: boolean = false;

    constructor(uiManager: UiManager) {
        super(uiManager);
        this.key = ModuleName.PICANEWROLE_NAME;
        this.atlasNames = [UIAtlasName.uicommon, UIAtlasName.people_action];
        this.UIType = UIType.Scene;
    }
    resize(width?: number, height?: number) {
        const w: number = this.scaleWidth;
        const h: number = this.scaleHeight;
        super.resize(w, h);
        this.setSize(w, h);
        this.blackGraphic.clear();
        this.blackGraphic.fillStyle(0x000000, 0.66);
        this.blackGraphic.fillRect(0, 0, w, h);
        this.content.x = w * 0.5;
        this.content.y = h + this.content.height * 0.5 + 10 * this.dpr;
        this.content.setInteractive();
        this.setInteractive(new Phaser.Geom.Rectangle(0, 0, w * 2, h * 2), Phaser.Geom.Rectangle.Contains);

        const fromy = this.scaleHeight + this.content.height * 0.5 + 10 * this.dpr;
        const toy = this.scaleHeight - this.content.height * 0.5;
        this.playMove(fromy, toy);
    }

    public onShow() {
        this.render.renderEmitter(this.key + "_initialized");
        this.setRoleData(this.roleData);
        this.setFollowButton(this.followed);
    }

    public addListen() {
        if (!this.mInitialized) return;
        this.openBigBtn.on(ClickEvent.Tap, this.onOpeningCharacterHandler, this);
        this.followBtn.on(ClickEvent.Tap, this.onFollowHandler, this);
        this.tradingBtn.on(ClickEvent.Tap, this.onTradingHandler, this);
        this.on("pointerdown", this.OnCloseHandler, this);
    }

    public removeListen() {
        if (!this.mInitialized) return;
        this.openBigBtn.off(ClickEvent.Tap, this.onOpeningCharacterHandler, this);
        this.followBtn.off(ClickEvent.Tap, this.onFollowHandler, this);
        this.tradingBtn.off(ClickEvent.Tap, this.onTradingHandler, this);
        this.off("pointerdown", this.OnCloseHandler, this);
    }

    init() {
        const conWdith = this.scaleWidth;
        const conHeight = 87 * this.dpr;
        this.blackGraphic = this.scene.make.graphics(undefined, false);
        this.add(this.blackGraphic);
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(conWdith, conHeight);
        this.add(this.content);
        this.bg = new ThreeSlicePath(this.scene, 0, 0, conWdith, 87 * this.dpr, UIAtlasName.people_action,
            ["people_panel_bg_left", "people_panel_bg_middle", "people_panel_bg_right"], this.dpr);
        this.bg.y = conHeight * 0.5 - this.bg.height * 0.5;
        this.content.add(this.bg);
        this.headAvatar = new UIDragonbonesDisplay(this.scene, this.render);
        this.headAvatar.x = -conWdith * 0.5 + 60 * this.dpr;
        this.headAvatar.y = 35 * this.dpr;
        this.headAvatar.scale = this.dpr * 2;
        this.headAvatar.visible = false;
        this.content.add(this.headAvatar);
        this.nameImage = new ImageValue(this.scene, 60 * this.dpr, 20 * this.dpr, UIAtlasName.people_action, "people_woman", this.dpr);
        this.nameImage.setOffset(-this.dpr, 0);
        this.nameImage.setTextStyle(UIHelper.whiteStyle(this.dpr, 14));
        this.nameImage.setLayout(1);
        this.nameImage.setText("");
        this.nameImage.x = this.headAvatar.x + 70 * this.dpr;
        this.nameImage.y = -conHeight * 0.5 + 15 * this.dpr;
        this.content.add(this.nameImage);
        this.levelLabel = this.scene.make.text({ x: this.nameImage.x - 8 * this.dpr, y: this.nameImage.y + 20 * this.dpr, text: "", style: UIHelper.whiteStyle(this.dpr) });
        this.levelLabel.setOrigin(0, 0.5);
        this.content.add(this.levelLabel);
        // this.vipvalue = new ImageValue(this.scene, 60 * this.dpr, 20 * this.dpr, UIAtlasKey.commonKey, "iv_coin", this.dpr);
        // this.vipvalue.setOffset(-this.dpr, 0);
        // this.vipvalue.setTextStyle({ color: "#FFEA00" });
        // this.vipvalue.setLayout(1);
        // this.vipvalue.x = this.levelLabel.x + this.levelLabel.width +  20* this.dpr;
        // this.vipvalue.y = this.levelLabel.y;
        // this.content.add(this.vipvalue);
        this.openBigBtn = new Button(this.scene, UIAtlasName.people_action, "people_minute", "people_minute");
        this.openBigBtn.setSize(20 * this.dpr, 20 * this.dpr);
        this.openBigBtn.removeInteractive();
        this.openBigBtn.setInteractive();
        this.openBigBtn.y = -conHeight * 0.5 + 15 * this.dpr;
        this.openBigBtn.x = conWdith * 0.5 - 20 * this.dpr;
        this.content.add(this.openBigBtn);
        const fnormals = ["butt_yellow_left_s", "butt_yellow_middle_s", "butt_yellow_right_s"];
        this.followBtn = new ThreeSliceButton(this.scene, 84 * this.dpr, 31 * this.dpr, UIAtlasName.uicommon, fnormals, fnormals, i18n.t("player_info.follow"));
        this.followBtn.setTextStyle(UIHelper.brownishStyle(this.dpr));
        this.followBtn.y = conHeight * 0.5 - this.followBtn.height * 0.5 - 5 * this.dpr;
        this.followBtn.x = -this.followBtn.width * 0.5 + 20 * this.dpr;
        this.content.add(this.followBtn);
        const tnormals = ["butt_red_left_s", "butt_red_middle_s", "butt_red_right_s"];
        this.tradingBtn = new ThreeSliceButton(this.scene, 84 * this.dpr, 31 * this.dpr, UIAtlasName.uicommon, tnormals, tnormals, i18n.t("player_info.trading"));
        this.tradingBtn.setTextStyle(UIHelper.brownishStyle(this.dpr));
        this.tradingBtn.y = this.followBtn.y;
        this.tradingBtn.x = this.tradingBtn.width * 0.5 + 40 * this.dpr;
        this.content.add(this.tradingBtn);
        this.actionContanier = new PeopleActionContainer(this.scene, this.dpr);
        this.actionContanier.setHandler(new Handler(this, this.onPeopleActionHandler));
        this.actionContanier.y = -this.content.height * 0.5 - this.actionContanier.height * 0.5 - 10 * this.dpr;
        this.content.add(this.actionContanier);
        this.resize();
        super.init();
    }

    public setRoleData(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ANOTHER_PLAYER_INFO) {
        this.roleData = content;
        if (!this.mInitialized || !this.roleData) return;
        const temp = AvatarSuitType.getSuitsFromItem(content.avatarSuit);
        const dbModel = { id: content.id, avatar: temp.avatar };
        this.headAvatar.visible = false;
        this.headAvatar.setSuits(temp.suits);
        this.headAvatar.once("replacefinished", () => {
            this.headAvatar.play({ name: "idle", flip: false });
            this.headAvatar.visible = true;
        });
        this.headAvatar.visible = true;
        this.headAvatar.load(dbModel);
        this.nameImage.setFrameValue(content.nickname, UIAtlasName.people_action, "people_man");
        this.levelLabel.text = `${i18n.t("common.lv")} ${content.level.level}`;
        const tnormals = ["butt_gray_left_s", "butt_gray_middle_s", "butt_gray_right_s"];
        this.tradingBtn.setFrameNormal(tnormals, tnormals);
        this.tradingBtn.setTextColor("#000000");
        this.tradingBtn.setEnable(false, false);
    }

    public setFollowButton(follow: boolean) {
        this.followed = follow;
        if (!this.mInitialized) return;
        this.followBtn.setText(follow ? i18n.t("friendlist.unfollow") : i18n.t("friendlist.follow"));
    }

    private playMove(from: number, to: number) {
        const tween = this.scene.tweens.add({
            targets: this.content,
            y: {
                from,
                to
            },
            ease: "Linear",
            duration: 150,
            onComplete: () => {
                tween.stop();
                tween.remove();
            },
        });
    }
    private onOpeningCharacterHandler() {
        this.render.renderEmitter(ModuleName.PICANEWROLE_NAME + "_openingcharacter", this.roleData);
        this.OnCloseHandler();
    }

    private onFollowHandler() {
        if (this.roleData === undefined) return;
        this.render.renderEmitter(ModuleName.PICANEWROLE_NAME + "_followcharacter", { uid: this.roleData.cid, follow: this.followed });
    }

    private onTradingHandler() {
        this.render.renderEmitter(ModuleName.PICANEWROLE_NAME + "_tradingcharacter", this.roleData);
    }

    private onPeopleActionHandler(tag: string) {
        let action;
        if (tag === "people_action_1") {
            action = "dance03";
        } else if (tag === "people_action_2") {
            action = "nap";
        } else if (tag === "people_action_3") {
            action = "greet01";
        } else if (tag === "people_action_4") {
            action = "wave";
        } else if (tag === "people_action_5") {
            action = "jump";
        }
        this.render.renderEmitter(this.key + "_peopleaction", action);
    }
    private OnCloseHandler() {
        this.render.renderEmitter(this.key + "_hide");
    }
}

class PeopleActionContainer extends Phaser.GameObjects.Container {
    private dpr: number;
    private background: Phaser.GameObjects.Image;
    private actionHandler: Handler;
    constructor(scene: Phaser.Scene, dpr: number) {
        super(scene);
        this.dpr = dpr;
        this.background = this.scene.make.image({ key: UIAtlasName.people_action, frame: "people_action_bg" });
        this.setSize(this.background.width, this.background.height);
        this.add(this.background);
        const posx = -this.width * 0.5;
        for (let i = 0; i < 5; i++) {
            const frame = "people_action_" + (i + 1);
            const button = new Button(this.scene, UIAtlasName.people_action, frame);
            button.x = posx + button.width * 0.5 + (button.width + 20 * dpr) * i;
            button["action"] = frame;
            button.on(ClickEvent.Tap, this.onActionHandler, this);
            this.add(button);
        }
    }

    public setHandler(send: Handler) {
        this.actionHandler = send;
    }
    private onActionHandler(pointer, button) {
        if (this.actionHandler) this.actionHandler.runWith(button["action"]);
    }
}
