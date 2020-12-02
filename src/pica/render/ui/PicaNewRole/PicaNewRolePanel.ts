
import { op_client, op_pkt_def, op_def } from "pixelpai_proto";
import { NineSlicePatch, Button, GameScroller, NineSliceButton, ClickEvent, ProgressBar, UIType } from "apowophaserui";
import { BasePanel, ButtonEventDispatcher, DynamicImage, ImageValue, ItemInfoTips, ProgressMaskBar, ThreeSliceButton, ThreeSlicePath, UIDragonbonesDisplay, UiManager } from "gamecoreRender";
import { AvatarSuit, AvatarSuitType, ModuleName } from "structure";
import { UIAtlasKey, UIAtlasName } from "picaRes";
import { Font, Handler, i18n, UIHelper, Url } from "utils";
export class PicaNewRolePanel extends BasePanel {
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
    private roleData: any;
    private followed: boolean = false;

    constructor(uiManager: UiManager) {
        super(uiManager.scene, uiManager.render);
        this.key = ModuleName.PICANEWROLE_NAME;
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
        this.addListen();
        this.render.renderEmitter(this.key + "_initialized");
        this.setRoleData(this.roleData);
        this.setFollowButton(this.followed);
    }

    public addListen() {
        if (!this.mInitialized) return;
        this.openBigBtn.on(ClickEvent.Tap, this.onOpeningCharacterHandler, this);
        this.followBtn.on(ClickEvent.Tap, this.onFollowHandler, this);
        this.tradingBtn.on(ClickEvent.Tap, this.onTradingHandler, this);
        this.on("pointerdown", this.OnClosePanel, this);
    }

    public removeListen() {
        if (!this.mInitialized) return;
        this.openBigBtn.off(ClickEvent.Tap, this.onOpeningCharacterHandler, this);
        this.followBtn.off(ClickEvent.Tap, this.onFollowHandler, this);
        this.tradingBtn.off(ClickEvent.Tap, this.onTradingHandler, this);
        this.off("pointerdown", this.OnClosePanel, this);
    }

    destroy() {
        super.destroy();
    }

    preload() {
        this.addAtlas(this.key, UIAtlasName.textureUrl(UIAtlasName.uicommonurl), UIAtlasName.jsonUrl(UIAtlasName.uicommonurl));
        super.preload();
    }
    init() {
        const conWdith = this.scaleWidth;
        const conHeight = 87 * this.dpr;
        this.blackGraphic = this.scene.make.graphics(undefined, false);
        this.add(this.blackGraphic);
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(conWdith, conHeight);
        this.add(this.content);
        this.bg = new ThreeSlicePath(this.scene, 0, 0, conWdith, 87 * this.dpr, this.key,
            ["people_panel_bg_left", "people_panel_bg_middle", "people_panel_bg_right"], this.dpr);
        this.bg.y = conHeight * 0.5 - this.bg.height * 0.5;
        this.content.add(this.bg);
        this.headAvatar = new UIDragonbonesDisplay(this.scene, this.render);
        this.headAvatar.x = -conWdith * 0.5 + 60 * this.dpr;
        this.headAvatar.y = 35 * this.dpr;
        this.headAvatar.scale = this.dpr * 2;
        this.headAvatar.visible = false;
        this.content.add(this.headAvatar);
        this.nameImage = new ImageValue(this.scene, 60 * this.dpr, 20 * this.dpr, this.key, "people_woman", this.dpr);
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
        this.openBigBtn = new Button(this.scene, this.key, "people_more", "people_more");
        this.openBigBtn.setSize(20 * this.dpr, 20 * this.dpr);
        this.openBigBtn.removeInteractive();
        this.openBigBtn.setInteractive();
        this.openBigBtn.y = -conHeight * 0.5 + 15 * this.dpr;
        this.openBigBtn.x = conWdith * 0.5 - 20 * this.dpr;
        this.content.add(this.openBigBtn);
        const fnormals = ["butt_yellow_left_s", "butt_yellow_middle_s", "butt_yellow_right_s"];
        this.followBtn = new ThreeSliceButton(this.scene, 84 * this.dpr, 31 * this.dpr, this.key, fnormals, fnormals, i18n.t("player_info.follow"));
        this.followBtn.setTextStyle(UIHelper.brownishStyle(this.dpr));
        this.followBtn.y = conHeight * 0.5 - this.followBtn.height * 0.5 - 5 * this.dpr;
        this.followBtn.x = -this.followBtn.width * 0.5 + 20 * this.dpr;
        this.content.add(this.followBtn);
        const tnormals = ["butt_red_left_s", "butt_red_middle_s", "butt_red_right_s"];
        this.tradingBtn = new ThreeSliceButton(this.scene, 84 * this.dpr, 31 * this.dpr, this.key, tnormals, tnormals, i18n.t("player_info.trading"));
        this.tradingBtn.setTextStyle(UIHelper.brownishStyle(this.dpr));
        this.tradingBtn.y = this.followBtn.y;
        this.tradingBtn.x = this.tradingBtn.width * 0.5 + 40 * this.dpr;
        this.content.add(this.tradingBtn);
        this.resize();
        super.init();
    }

    public setRoleData(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ANOTHER_PLAYER_INFO) {
        this.roleData = content;
        if (!this.mInitialized || !this.roleData) return;
        this.headAvatar.once("initialized", () => {
            this.headAvatar.play({ name: "idle", flip: false });
        });
        const avatar = this.creatAvatars(content.avatarSuit);
        const dbModel = { id: content.id, avatar };
        this.headAvatar.load(dbModel);
        this.headAvatar.visible = true;
        this.nameImage.setFrameValue(content.nickname, this.key, "people_man");
        this.levelLabel.text = `${i18n.t("common.lv")} ${content.level.level}`;
        const tnormals = ["butt_gray_left_s", "butt_gray_middle_s", "butt_gray_right_s"];
        this.tradingBtn.setFrameNormal(tnormals, tnormals);
        this.tradingBtn.setTextColor("#000000");
        this.tradingBtn.setEnable(false, false);
        const fromy = this.scaleHeight + this.content.height * 0.5 + 10 * this.dpr;
        const toy = this.scaleHeight - this.content.height * 0.5;
        this.playMove(fromy, toy);

    }

    public setFollowButton(follow: boolean) {
        this.followed = follow;
        if (!this.mInitialized) return;
        this.followBtn.setText(follow ? i18n.t("player_info.followed") : i18n.t("player_info.follow"));
    }

    private creatAvatars(avatarSuits: op_client.ICountablePackageItem[]) {
        const suits: AvatarSuit[] = [];
        for (const item of avatarSuits) {
            const suit: AvatarSuit = { id: item.id, suit_type: item.suitType, sn: item.sn };
            suits.push(suit);
        }
        const avatar = AvatarSuitType.createHasBaseAvatar(suits);
        return avatar;
    }
    private playMove(from: number, to: number) {
        const tween = this.scene.tweens.add({
            targets: this.content,
            y: {
                from,
                to
            },
            ease: "Linear",
            duration: 300,
            onComplete: () => {
                tween.stop();
                tween.remove();
            },
        });
    }
    private onOpeningCharacterHandler() {
        this.render.renderEmitter(ModuleName.PICANEWROLE_NAME + "_openingcharacter", this.roleData);
        this.OnClosePanel();
    }

    private onFollowHandler() {
        if (this.roleData === undefined) return;
        this.render.renderEmitter(ModuleName.PICANEWROLE_NAME + "_followcharacter", { uid: this.roleData.cid, follow: this.followed });
    }

    private onTradingHandler() {
        this.render.renderEmitter(ModuleName.PICANEWROLE_NAME + "_tradingcharacter", this.roleData);
    }

    private OnClosePanel() {
        this.render.renderEmitter(this.key + "_hide");
    }
}
