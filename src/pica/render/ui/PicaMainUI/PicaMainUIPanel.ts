import { CheckBox, NineSlicePatch, ClickEvent, Button } from "apowophaserui";
import { UIAtlasKey, UIAtlasName } from "picaRes";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { Render } from "src/render/render";
import { BasePanel, DynamicImage, TextToolTips, UiManager } from "gamecoreRender";
import { EventType, ModuleName } from "structure";
import { Font, Handler, i18n, Logger, Url } from "utils";
export class PicaMainUIPanel extends BasePanel {
    private mCoinValue: ValueContainer;
    private mDiamondValue: ValueContainer;
    private mSceneName: SceneName;
    private mCounter: IconText;
    private mStrengthValue: ProgressValue;
    //  private mExpProgress: ExpProgress;
    private playerLv: Phaser.GameObjects.Text;
    private playerIcon: Phaser.GameObjects.Image;
    private playerCon: Phaser.GameObjects.Container;
    private roomCon: Phaser.GameObjects.Container;
    private textToolTip: TextToolTips;
    private isSceneNameActive: boolean = false;
    private praiseBtn: CheckBox;
    private praiseImg: Phaser.GameObjects.Image;
    private partyBtn: Button;
    private playerInfo: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_PKT_PLAYER_INFO;
    private roomInfo: any;// op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_INFO;
    private headImage: DynamicImage;
    constructor(uiManager: UiManager) {
        super(uiManager.scene, uiManager.render);
        this.key = ModuleName.PICAMAINUI_NAME;
    }

    show(param?: any) {
        super.show(param);
        if (this.mInitialized) {
            this.setInteractive();
            this.update(this.mShowData);
            this.checkUpdateActive();
        }
    }

    resize(w: number, h: number) {
        const width = this.scene.cameras.main.width / this.scale;
        const height = this.scene.cameras.main.height / this.scale;
        super.resize(width, height);
        this.mCoinValue.x = width - this.mCoinValue.width / 2 - 5 * this.dpr;
        this.mDiamondValue.x = width - this.mDiamondValue.width / 2 - 5 * this.dpr;
    }

    preload() {
        this.addAtlas(this.key, "main_ui/mainui.png", "main_ui/mainui.json");
        this.addAtlas(UIAtlasKey.commonKey, UIAtlasName.commonUrl + ".png", UIAtlasName.commonUrl + ".json");
        super.preload();
    }

    addListen() {
        super.addListen();
        if (!this.mInitialized) return;
        if (!this.roomCon) {
            Logger.getInstance().fatal(`${PicaMainUIPanel.name}: sceneName does not exist!`);
            return;
        }
        this.roomCon.on("pointerup", this.onOpenRoomPanel, this);
        this.render.emitter.on(EventType.UPDATE_ROOM_INFO, this.onUpdateRoomHandler, this);
        this.render.emitter.on(EventType.UPDATE_PLAYER_INFO, this.onUpdatePlayerHandler, this);
        this.render.emitter.on(EventType.UPDATE_PARTY_STATE, this.onUpdatePartyHandler, this);
    }

    removeListen() {
        super.removeListen();
        if (!this.mInitialized) return;
        if (!this.roomCon) {
            Logger.getInstance().fatal(`${PicaMainUIPanel.name}: sceneName does not exist!`);
            return;
        }
        this.roomCon.off("pointerup", this.onOpenRoomPanel, this);
        this.render.emitter.off(EventType.UPDATE_ROOM_INFO, this.onUpdateRoomHandler, this);
        this.render.emitter.off(EventType.UPDATE_PLAYER_INFO, this.onUpdatePlayerHandler, this);
        this.render.emitter.off(EventType.UPDATE_PARTY_STATE, this.onUpdatePartyHandler, this);
    }

    destroy() {
        super.destroy();
        this.playerInfo = undefined;
        this.roomInfo = undefined;
    }

    update(param) {
        super.update();
        if (param) {
            if (!param.hasOwnProperty("roomId")) {
                this.playerInfo = param;
            } else {
                this.roomInfo = param;
            }
        }

        if (this.playerInfo) {
            this.updatePlayerInfo(this.playerInfo);
        }
        if (this.roomInfo) {
            this.updateRoomInfo(this.roomInfo);
        }
    }

    updatePlayerInfo(player: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_PKT_PLAYER_INFO) {
        this.playerInfo = player;
        if (!this.mInitialized) return;
        if (player.level) {
            const level = player.level;
            this.playerLv.text = level.level + "";
        }
        if (player.coin !== undefined) this.mCoinValue.setText(this.getCoin().value + "" || 0 + "");
        if (player.diamond !== undefined) this.mDiamondValue.setText(this.getDiamond().value + "" || 0 + "");
        if (player.energy) {
            const energy = player.energy;
            if (energy) {
                this.mStrengthValue.setValue(energy.currentValue, energy.max);
            } else {
                this.mStrengthValue.setValue(0, 100);
            }
        }
        this.mSceneName.rightIcon.visible = this.isSelfRoom;
    }

    updateDetail(detail: any) {
        if (!detail) {
            return;
        }
        if (!this.headImage) {
            this.headImage = new DynamicImage(this.scene, 0, 0);
            this.headImage.setScale(this.dpr);
            this.add(this.headImage);
        }
        this.headImage.load(Url.getOsdRes(detail.avatar), this, () => {
            this.headImage.x = this.headImage.width * 0.5 + 4 * this.dpr;
            this.headImage.y = this.headImage.height * 0.5 + 4 * this.dpr;
        });
    }

    getCoin(): op_pkt_def.IPKT_Property {
        for (const proper of this.playerInfo.properties) {
            if (!proper.hasOwnProperty("id")) {
                Logger.getInstance().error(proper.key + "  缺少ID");
                continue;
            }
            if (proper.id === "IV0000001") {
                return proper;
            }
        }
    }

    getDiamond(): op_pkt_def.IPKT_Property {
        for (const proper of this.playerInfo.properties) {
            if (!proper.hasOwnProperty("id")) {
                Logger.getInstance().error(proper.key + "  缺少ID");
                continue;
            }
            if (proper.id === "IV0000002") {
                return proper;
            }
        }
    }

    updateRoomInfo(room: any) {
        this.roomInfo = room;
        if (!this.mInitialized) return;
        this.roomCon.setSize(60 * this.dpr, 30 * this.dpr);
        if (room.name) {
            this.mSceneName.setText(room.name);
            this.roomCon.setSize(this.mSceneName.rightbound * 2, 30 * this.dpr);
        }
        this.roomCon.setInteractive();
        this.isSceneNameActive = true;
        if (room.playerCount) {
            // TODO 多语言适配
            this.mCounter.setText(`${room.playerCount}`);
        }
        this.mCounter.x = this.mSceneName.x + this.mSceneName.rightbound + 5 * this.dpr;
        this.praiseBtn.visible = false;
        if (room.roomType) {
            if (room.roomType === "room" || room.roomType === "store") {
                this.praiseBtn.visible = true;
            }
            this.praiseBtn.setText(room.praise + "");
            this.praiseBtn.selected = room.hasPraised;
            if (room.hasPraised) {
                this.praiseBtn.setTextColor("#8E99C1");
                this.praiseImg.setFrame("praise_after");
            } else {
                this.praiseBtn.setTextColor("#ffffff");
                this.praiseImg.setFrame("praise_before");
            }
        }
        this.mSceneName.rightIcon.visible = this.isSelfRoom;
        this.partyBtn.visible = this.isSelfRoom;
        if (room.openingParty) {
            this.partyBtn.setText(i18n.t("common.manager"));
        } else {
            this.partyBtn.setText(i18n.t("main_ui.party"));
        }
    }

    get isSelfRoom() {
        if (!this.playerInfo || !this.roomInfo) return false;
        const rooms = this.playerInfo.rooms;
        const curRoomid = this.roomInfo.roomId;
        for (const room of rooms) {
            if (room.roomId === curRoomid) return true;
        }
        return false;
    }

    updateUIState(active?: any) {
        if (!this.mInitialized) {
            return;
        }
        if (active.name === "mainui.playerinfo") {
            this.playerCon.visible = active.visible;
        }
        if (active.name === "mainui.roominfo") {
            this.roomCon.visible = active.visible;
        }
        if (active.name === "mainui.headbtn") {
            // this.playerIcon.visible = active.visible;
            if (!active.disabled) {
                this.playerIcon.setInteractive();
            } else {
                this.playerIcon.removeInteractive();
            }
        }
        if (active.name === "mainui.entereditorbtn") {
            this.mSceneName.visible = active.visible;
            if (this.isSceneNameActive) {
                if (!active.disabled) {
                    this.roomCon.setSize(this.mSceneName.rightbound * 2, 30 * this.dpr);
                    this.roomCon.setInteractive();
                } else {
                    this.roomCon.removeInteractive();
                }
            }
        }
    }
    init() {
        const w = this.scene.cameras.main.width;
        const h = this.scene.cameras.main.height;
        this.playerCon = this.scene.make.container(undefined, false);
        this.playerCon.y = 25 * this.dpr;
        this.add(this.playerCon);
        this.mCoinValue = new ValueContainer(this.scene, this.key, "coin", this.dpr);
        this.mDiamondValue = new ValueContainer(this.scene, this.key, "diamond", this.dpr);
        this.mDiamondValue.setHandler(new Handler(this, this.onOpenRechargeHandler));
        this.mDiamondValue.y = 35 * this.dpr;

        const frame = this.scene.textures.getFrame(this.key, "strength_progress");
        this.mStrengthValue = new ProgressValue(this.scene, this.key, "strength_icon", this.dpr);
        this.mStrengthValue.x = 76 * this.dpr;
        const ninePatch = new NineSlicePatch(this.scene, 68 * this.dpr / 2, this.mStrengthValue.height / 2 - frame.height - 1 * this.dpr, 92 * this.dpr, frame.height, this.key, "strength_progress", {
            left: 8 * this.dpr,
            top: 3 * this.dpr,
            right: frame.width - 2 - 8 * this.dpr,
            bottom: frame.height - 1 - 3 * this.dpr

        });
        this.mStrengthValue.setProgress(ninePatch, this.scale);
        this.playerIcon = this.scene.make.image({ key: this.key, frame: "head" });
        this.playerIcon.x = -this.mStrengthValue.width * 0.5 - 8 * this.dpr;
        this.mStrengthValue.add(this.playerIcon);
        this.playerIcon.on("pointerup", this.onHeadHandler, this);
        this.playerIcon.setInteractive();
        this.mStrengthValue.setValue(1000, 1000);
        this.mStrengthValue.setInteractive();
        this.mStrengthValue.on("pointerup", this.onStrengthHandler, this);
        const lvx = this.playerIcon.x + this.playerIcon.width * 0.5 - 2 * this.dpr;
        const lvy = this.playerIcon.y + this.playerIcon.height * 0.5 - 10 * this.dpr;
        this.playerLv = this.scene.make.text({ text: "0", x: lvx, y: lvy, style: { fontSize: 11 * this.dpr, bold: true, fontFamily: Font.DEFULT_FONT, color: "#356EE3" } }, false).setOrigin(1, 0);
        this.playerLv.setShadow(0, 0, "#ffffff", 2);
        this.playerLv.setStroke("#356EE3", 2);
        this.playerLv.setShadowStroke(true);
        this.mStrengthValue.add(this.playerLv);
        //  this.mExpProgress = new ExpProgress(this.scene, this.key, this.dpr, this.scale, this.mWorld);
        this.playerCon.add([this.mStrengthValue, this.mCoinValue, this.mDiamondValue]);
        this.roomCon = this.scene.make.container(undefined, false);
        this.roomCon.y = this.playerCon.y + 32 * this.dpr;
        this.add(this.roomCon);
        this.mSceneName = new SceneName(this.scene, this.key, "room_icon", "setting_icon", this.dpr);
        this.mSceneName.setText("");
        this.mSceneName.x = 18 * this.dpr;
        this.mCounter = new IconText(this.scene, UIAtlasKey.commonKey, "home_persons", this.dpr);
        this.mCounter.setText("");
        this.mCounter.x = this.mSceneName.x + this.mSceneName.rightbound + 5 * this.dpr;
        this.mCounter.y = this.mSceneName.y;
        this.mCounter.setColor("#28D5F5");
        this.textToolTip = new TextToolTips(this.scene, UIAtlasKey.commonKey, "tips_bg", this.dpr, this.scale);
        this.textToolTip.setSize(160 * this.dpr, 45).visible = false;
        this.praiseBtn = new CheckBox(this.scene, this.key, "praise_before_bg", "praise_after_bg", "1");
        this.praiseBtn.y = this.mSceneName.y + this.mSceneName.height + this.praiseBtn.height * 0.5 + 20 * this.dpr;
        this.praiseBtn.x = 8 * this.dpr + this.praiseBtn.width * 0.5;
        this.praiseBtn.setTextStyle({ fontSize: 11 * this.dpr, fontFamily: Font.DEFULT_FONT });
        this.praiseBtn.setTextOffset(10 * this.dpr, 0);
        this.praiseBtn.on(String(ClickEvent.Tap), this.onPraiseHandler, this);
        this.praiseImg = this.scene.make.image({ key: this.key, frame: "praise_before" });
        this.praiseImg.x = -10 * this.dpr;
        this.praiseBtn.add(this.praiseImg);
        this.partyBtn = new Button(this.scene, this.key, "home_party_bg", "home_party_bg", i18n.t("main_ui.party"));
        this.partyBtn.x = this.praiseBtn.x + this.praiseBtn.width * 0.5 + this.partyBtn.width * 0.5 + 5 * this.dpr;
        this.partyBtn.y = this.praiseBtn.y;
        this.partyBtn.setTextOffset(8 * this.dpr, 0);
        this.partyBtn.setTextStyle({ fontSize: 11 * this.dpr, fontFamily: Font.DEFULT_FONT });
        this.partyBtn.on(String(ClickEvent.Tap), this.onPartyHandler, this);
        this.roomCon.add([this.mSceneName, this.mCounter, this.praiseBtn, this.partyBtn, this.textToolTip]);
        this.roomCon.setSize(this.mSceneName.rightbound * 2, 30 * this.dpr);
        this.resize(w, h);
        super.init();
    }

    private onOpenRoomPanel() {
        this.render.renderEmitter("openroompanel");
    }
    private onHeadHandler() {
        this.render.renderEmitter("showPanel", ModuleName.CHARACTERINFO_NAME);
    }

    private onStrengthHandler() {
        if (this.playerInfo) {
            const energy = this.playerInfo.energy;
            const rep = `${energy.currentValue}/${energy.max}\n`;
            const text = i18n.t("main_ui.energy_tips", { "name": rep, "interpolation": { "escapeValue": false } });
            if (!this.textToolTip.visible)
                this.scene.input.on("pointerdown", this.onTextToolTipHandler, this);
            this.textToolTip.setDelayText(text, 3000, new Handler(this, () => {
                this.scene.input.off("pointerdown", this.onTextToolTipHandler, this);
            }));
            this.textToolTip.setPosition(120 * this.dpr, 20 * this.dpr);
        }
    }
    private onTextToolTipHandler() {
        this.textToolTip.visible = false;
        this.scene.input.off("pointerdown", this.onTextToolTipHandler, this);
    }
    private async checkUpdateActive() {
        const arr = await this.mWorld.mainPeer.getActiveUIData("PicaMainUI");
        if (arr) {
            for (const data of arr) {
                this.updateUIState(data);
            }
        }
    }

    private onUpdatePlayerHandler(content: any) {
        this.playerInfo = content;
        this.updatePlayerInfo(content);
    }

    private onUpdateRoomHandler(content: any) {
        this.roomInfo = content;

        this.updateRoomInfo(content);
    }

    private onUpdatePartyHandler(party: boolean) {
        if (this.roomInfo)
            this.updateRoomInfo(this.roomInfo);
    }

    private onPraiseHandler(pointer: any, box: CheckBox) {
        this.render.renderEmitter(EventType.QUERY_PRAISE, box.selected);
    }

    private onPartyHandler() {
        this.render.renderEmitter("showPanel", ModuleName.PICAOPENPARTY_NAME);
    }
    private onOpenRechargeHandler() {
        this.render.renderEmitter("showPanel", ModuleName.PICARECHARGE_NAME);
    }
}

class ValueContainer extends Phaser.GameObjects.Container {
    protected mText: Phaser.GameObjects.Text;
    protected mAddBtn: Button;
    protected mLeft: Phaser.GameObjects.Image;
    protected sendHandler: Handler;
    constructor(scene: Phaser.Scene, key: string, leftIcon: string, dpr: number = 1) {
        super(scene);
        this.init(key, leftIcon, dpr);
    }
    public setText(val: string) {
        this.mText.setText(val);
    }

    public setHandler(send: Handler) {
        this.sendHandler = send;
    }
    protected init(key: string, leftIcon: string, dpr: number) {
        const bg = this.scene.make.image({
            key,
            frame: "home_progress_bottom"
        }, false);
        bg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.mLeft = this.scene.make.image({
            key,
            frame: leftIcon,
        }, false);
        this.mLeft.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.mText = this.scene.make.text({
            text: "0",
            width: bg.width,
            height: bg.height,
            style: {
                fontSize: 14 * dpr,
                fontFamily: Font.NUMBER
            }
        }, false).setOrigin(0.5);
        this.mText.setStroke("#000000", 1 * dpr);
        this.mText.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.mAddBtn = new Button(this.scene, key, "add_btn", "add_btn");
        this.setSize(bg.width, bg.height);
        this.mLeft.x = -bg.width * 0.5 + 5 * dpr;
        this.mLeft.y = bg.y + bg.height * 0.5 - this.mLeft.height * 0.5;
        this.mAddBtn.x = this.width * this.originX - this.mAddBtn.width * this.originX - 5 * dpr;
        this.mText.x = 4 * dpr;
        this.add([bg, this.mLeft, this.mText, this.mAddBtn]);
        this.mAddBtn.on(ClickEvent.Tap, this.onAddHandler, this);
    }

    private onAddHandler() {
        if (this.sendHandler) this.sendHandler.run();
    }
}

class IconText extends Phaser.GameObjects.Container {
    protected mText: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, key: string, frame: string, dpr: number = 1) {
        super(scene);

        const icon = scene.make.image({
            key,
            frame
        }, false);

        this.mText = scene.make.text({
            style: {
                fontSize: 14 * dpr,
                fontFamily: Font.DEFULT_FONT
            }
        }, false).setOrigin(0, 0.5);
        this.mText.x = icon.width / 2 + 4 * dpr;
        // this.mText.y = -icon.height / 2;
        this.mText.setStroke("#000000", 2 * dpr);
        this.add([icon, this.mText]);
    }

    public setText(val: string) {
        this.mText.setText(val);
    }

    public setStroke(color: string, thickness: number) {
        this.mText.setStroke(color, thickness);
    }

    public setColor(color: string) {
        this.mText.setColor(color);
    }
}

class SceneName extends IconText {
    private mRightIcon: Phaser.GameObjects.Image;
    private mDpr: number;
    private settingHandler: Handler;
    constructor(scene: Phaser.Scene, key: string, leftFrame: string, rightFrame: string, dpr: number = 1) {
        super(scene, key, leftFrame, dpr);
        this.mDpr = dpr;
        this.mRightIcon = scene.make.image({
            y: 2 * dpr,
            key,
            frame: rightFrame
        }, false);
        this.add(this.mRightIcon);
        this.mRightIcon.y = 8 * dpr;
        this.mRightIcon.x = 10 * dpr;
    }
    public setText(val: string) {
        super.setText(val);
    }

    public get rightbound() {
        return this.mText.x + this.mText.width + 10 * this.mDpr;
    }
    public get rightIcon() {
        return this.mRightIcon;
    }
}

class ExpProgress extends Phaser.GameObjects.Container {
    private mCurrentLv: Phaser.GameObjects.Text;
    private mNextLv: Phaser.GameObjects.Text;
    private mProgressBar: ProgressBar;
    constructor(scene: Phaser.Scene, key: string, dpr: number, scale: number, render: Render) {
        super(scene);

        const width = render.getSize().width / scale;
        let frame = this.scene.textures.getFrame(key, "exp_bg");
        this.setSize(width, frame.height);
        const progressW = this.width;
        const progressH = this.height;
        this.mProgressBar = new ProgressBar(scene, dpr);
        this.mProgressBar.setSize(this.width, this.height);
        const bg = new NineSlicePatch(this.scene, progressW / 2, progressH / 2, progressW, progressH, key, "exp_bg", {
            left: 8 * dpr,
            top: 3 * dpr,
            right: frame.width - 2 - 8 * dpr,
            bottom: frame.height - 1 - 3 * dpr
        });
        this.mProgressBar.setBackground(bg);

        frame = this.scene.textures.getFrame(key, "exp_progress");
        const progres = new NineSlicePatch(this.scene, progressW / 2, progressH / 2, width, frame.height, key, "exp_progress", {
            left: 8 * dpr,
            top: 3 * dpr,
            right: frame.width - 2 - 10 * dpr,
            bottom: frame.height - 1 - 5 * dpr
        });
        this.mProgressBar.setProgress(progres, scale);
        this.mProgressBar.setRatio(0.5);
        this.mCurrentLv = scene.make.text({
            text: "57",
            style: {
                fontSize: 10 * dpr,
                fontFamily: Font.DEFULT_FONT
            }
        }, false);
        this.mCurrentLv.setStroke("#000000", 1 * dpr);

        this.mNextLv = scene.make.text({
            text: "58",
            style: {
                fontSize: 10 * dpr,
                fontFamily: Font.DEFULT_FONT
            }
        }, false).setOrigin(0, 0);
        this.mNextLv.setStroke("#000000", 1 * dpr);
        this.mNextLv.x = this.width - this.mNextLv.width;
        this.add([this.mProgressBar, this.mCurrentLv, this.mNextLv]);
    }

    public setLv(val: number, ratio: number) {
        this.mCurrentLv.setText(val.toString());
        this.mNextLv.setText((val + 1).toString());
        this.mNextLv.x = this.width - this.mNextLv.width;
        this.mProgressBar.setRatio(ratio);
    }
}

class ProgressValue extends ValueContainer {
    private mProgress: ProgressBar;
    constructor(scene: Phaser.Scene, key: string, leftIcon: string, dpr: number) {
        super(scene, key, leftIcon, dpr);
    }

    setProgress(progres: NineSlicePatch, scale: number) {
        this.mProgress.setProgress(progres, scale);
    }

    setValue(val: number, maxValue: number) {
        if (this.mText) {
            this.mText.text = `${val}/${maxValue}`;
            this.mProgress.setRatio(val / maxValue);
        }
    }

    setInteractive(shape?: Phaser.Types.Input.InputConfiguration | any) {
        shape = shape || new Phaser.Geom.Rectangle(0, 0, this.width, this.height);
        super.setInteractive(shape, Phaser.Geom.Rectangle.Contains);
        return this;
    }
    protected init(key: string, leftIcon: string, dpr: number) {
        const bg = this.scene.make.image({
            key,
            frame: "home_progress_bottom"
        }, false);
        bg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.setSize(bg.width, bg.height);

        this.mLeft = this.scene.make.image({
            key,
            frame: leftIcon,
        }, false);
        this.mLeft.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.mProgress = new ProgressBar(this.scene, dpr);
        this.mProgress.x = -this.width / 2 + 10 * dpr;
        this.mProgress.y = 4 * dpr;

        this.mText = this.scene.make.text({
            text: "0",
            width: bg.width,
            height: bg.height,
            style: {
                fontSize: 10 * dpr,
                fontFamily: Font.NUMBER
            }
        }, false).setOrigin(0.5);
        this.mText.setStroke("#000000", 1 * dpr);
        this.mText.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.mAddBtn = new Button(this.scene, key, "add_btn", "add_btn");
        this.setSize(bg.width, bg.height);
        this.mLeft.x = -this.width * this.originX + 13 * dpr;
        this.mAddBtn.x = this.width * this.originX - 10 * dpr;
        //  this.mText.y = (this.height - this.mText.height) / 2;
        this.add([bg, this.mProgress, this.mLeft, this.mText, this.mAddBtn]);
    }
}

class ProgressBar extends Phaser.GameObjects.Container {
    private mProgress: NineSlicePatch;
    private readonly dpr: number;
    private mMaskGraphics: Phaser.GameObjects.Graphics;
    private mScale: number;
    private worldpos: Phaser.Geom.Point;
    constructor(scene: Phaser.Scene, dpr: number) {
        super(scene);
        this.dpr = dpr;
    }

    public setBackground(bg: NineSlicePatch) {
        this.addAt(bg, 0);
    }

    public setProgress(progress: NineSlicePatch, scale: number) {
        this.mScale = scale;
        this.mProgress = progress;
        this.add(this.mProgress);
        this.setSize(progress.width * this.mScale, progress.height * this.mScale);
        const worldpos = progress.getWorldTransformMatrix();
        this.worldpos = new Phaser.Geom.Point(worldpos.tx, worldpos.ty);
        this.mMaskGraphics = this.scene.make.graphics(undefined, false);
        this.mMaskGraphics.fillStyle(0xFF9900);
        this.mMaskGraphics.fillRect(0, 0, this.width, this.height + 8 * this.dpr);
        this.mProgress.mask = new Phaser.Display.Masks.GeometryMask(this.scene, this.mMaskGraphics);
        this.mMaskGraphics.y = worldpos.ty + this.height + 4 * this.dpr;
        this.mMaskGraphics.x = worldpos.tx;
    }

    public setRatio(ratio: number) {
        if (!this.mMaskGraphics) {
            return;
        }
        this.mMaskGraphics.x = this.worldpos.x + 4 * this.dpr - this.mProgress.width * 0.5 + ((this.width * ratio) - this.width);

    }
}
