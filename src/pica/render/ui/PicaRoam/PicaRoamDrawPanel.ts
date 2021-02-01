import { NineSlicePatch, GameGridTable, Button, ClickEvent, BBCodeText, NineSliceButton } from "apowophaserui";
import { BackgroundScaleButton, CommonBackground, DynamicImage, ImageValue } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { Font, Handler, i18n, TimeUtils, UIHelper, Url } from "utils";
import { op_client, op_pkt_def } from "pixelpai_proto";
export class PicaRoamDrawPanel extends Phaser.GameObjects.Container {
    private bg: CommonBackground;
    private closeBtn: Button;
    private moneyCon: Phaser.GameObjects.Container;
    private moneyvalue: ImageValue;
    private tokenvalue: ImageValue;
    private moneyAddBtn: Button;
    private drawProgress: RoamDrawProgress;
    private oneRoamItem: RoamDrawItem;
    private tenRoamItem: RoamDrawItem;
    private bottomtips: Phaser.GameObjects.Text;
    private cloudPanel: CloudDisplayItem;
    private dpr: number;
    private zoom: number;
    private send: Handler;
    private money: number = 0;
    private token: number = 0;
    private tokenid: string;
    private poolDatas: op_client.IDRAW_POOL_STATUS[];
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.zoom = zoom;
        this.init();
        this.setInteractive();
    }
    resize(width?: number, height?: number) {
        const w = width || this.width;
        const h = height || this.height;
        this.setSize(w, h);
        this.drawProgress.refreshMask();
    }

    setHandler(send: Handler) {
        this.send = send;
    }

    init() {
        this.bg = new CommonBackground(this.scene, 0, 0, this.width, this.height, UIAtlasName.roam, "roam_bg", 0x72e7fb);
        const topbg = this.scene.make.image({ key: "roam_topic" });
        topbg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        const topbg1 = this.scene.make.image({ key: "roam_stripe" });
        topbg1.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        topbg.y = -this.height * 0.5 + topbg.height * 0.5;
        topbg1.y = -this.height * 0.5 + topbg1.height * 0.5;
        this.closeBtn = new Button(this.scene, UIAtlasName.uicommon, "back_arrow", "back_arrow");
        this.closeBtn.setPosition(-this.width * 0.5 + 21 * this.dpr, -this.height * 0.5 + 35 * this.dpr);
        this.closeBtn.on(ClickEvent.Tap, this.onCloseHandler, this);
        const moneybg = new NineSlicePatch(this.scene, 0, -this.dpr, 190 * this.dpr, 28 * this.dpr, UIAtlasName.uicommon, "home_assets_bg", {
            left: 17 * this.dpr,
            top: 0 * this.dpr,
            right: 17 * this.dpr,
            bottom: 0 * this.dpr
        });
        moneybg.x = -moneybg.width * 0.5;
        const moneyline = this.scene.make.image({ x: moneybg.x, y: 0, key: UIAtlasName.uicommon, frame: "home_assets_division" }, false);
        this.moneyvalue = new ImageValue(this.scene, 60 * this.dpr, 26 * this.dpr, UIAtlasName.uicommon, "home_silver", this.dpr, {
            color: "#ffffff", fontSize: 15 * this.dpr, fontFamily: Font.NUMBER
        });
        this.moneyvalue.setLayout(1);
        this.moneyvalue.x = moneybg.x - moneybg.width * 0.5 + 22 * this.dpr;
        this.tokenvalue = new ImageValue(this.scene, 60 * this.dpr, 26 * this.dpr, UIAtlasName.uicommon, "roam_ordinary_icon", this.dpr, {
            color: "#ffffff", fontSize: 15 * this.dpr, fontFamily: Font.NUMBER
        });
        this.tokenvalue.setLayout(1);
        this.tokenvalue.x = moneybg.x + 22 * this.dpr;
        this.moneyAddBtn = new Button(this.scene, UIAtlasName.uicommon, "home_praise_bg", "home_praise_bg");
        const moneyAddicon = this.scene.make.image({ x: 0, y: 0, key: UIAtlasName.uicommon, frame: "home_assets_add" }, false);
        this.moneyAddBtn.add(moneyAddicon);
        this.moneyAddBtn.x = -this.moneyAddBtn.width * 0.5 - 4 * this.dpr;
        this.moneyAddBtn.on(ClickEvent.Tap, this.onRechargeHandler, this);
        this.moneyCon = this.scene.make.container(undefined, false);
        this.moneyCon.setSize(moneybg.width, moneybg.height);
        this.moneyCon.add([moneybg, moneyline, this.moneyvalue, this.tokenvalue, this.moneyAddBtn]);
        this.moneyCon.x = this.width * 0.5 - 20 * this.dpr;
        this.moneyCon.y = this.closeBtn.y;

        const previewBtn = new NineSliceButton(this.scene, 0, 0, 76 * this.dpr, 30 * this.dpr, UIAtlasName.uicommon, "home_persons_bg", i18n.t("roam.previewtex"), this.dpr, this.zoom, {
            left: 20 * this.dpr, right: 20 * this.dpr, top: 0, bottom: 0
        });
        previewBtn.setTextStyle(UIHelper.whiteStyle(this.dpr));
        previewBtn.setFontStyle("bold");
        previewBtn.x = this.width * 0.5 - previewBtn.width * 0.5 - 15 * this.dpr;
        previewBtn.y = this.moneyCon.y + this.moneyCon.height * 0.5 + previewBtn.height * 0.5 + 15 * this.dpr;
        previewBtn.on(ClickEvent.Tap, this.onDrawPreviewHandler, this);
        this.cloudPanel = new CloudDisplayItem(this.scene, this.width, 137 * this.dpr, this.dpr);
        this.cloudPanel.y = this.height * 0.5 - this.cloudPanel.height * 0.5;
        this.drawProgress = new RoamDrawProgress(this.scene, this.dpr, this.zoom);
        this.drawProgress.setHandler(new Handler(this, this.onProgressHandler));
        this.drawProgress.y = topbg.y + topbg.height * 0.5 - 66 * this.dpr;
        this.oneRoamItem = new RoamDrawItem(this.scene, this.dpr, this.zoom);
        this.oneRoamItem.x = -this.oneRoamItem.width * 0.5 - 10 * this.dpr;
        this.oneRoamItem.y = this.height * 0.5 - this.oneRoamItem.height * 0.5 - 60 * this.dpr;
        this.oneRoamItem.setHandler(new Handler(this, this.onRoamDrawHandler, ["one"]));
        this.tenRoamItem = new RoamDrawItem(this.scene, this.dpr, this.zoom);
        this.tenRoamItem.x = -this.oneRoamItem.x;
        this.tenRoamItem.y = this.oneRoamItem.y;
        this.tenRoamItem.setHandler(new Handler(this, this.onRoamDrawHandler, ["ten"]));
        this.bottomtips = this.scene.make.text({ text: i18n.t("roam.bottomtips"), style: UIHelper.blackStyle(this.dpr, 14) }).setOrigin(0.5);
        this.bottomtips.y = this.height * 0.5 - 20 * this.dpr;
        this.add([this.bg, topbg1, topbg, this.closeBtn, this.moneyCon, previewBtn, this.cloudPanel, this.drawProgress, this.oneRoamItem, this.tenRoamItem, this.bottomtips]);
        this.resize();
    }

    public setRoamDatas(datas: op_client.IDRAW_POOL_STATUS[]) {
        this.poolDatas = datas;
        for (const data of datas) {
            if (data.drawTime === 1) this.oneRoamItem.setRoamData(data);
            else {
                this.tenRoamItem.setRoamData(data);
                if (!data["diamond"]) {
                    this.drawProgress.visible = true;
                    for (let i = 0; i < data.progressAward.length; i++) {
                        const reward = data.progressAward[i];
                        if (!reward.received) {
                            const intervalTime = data.progressExpireTime * 1000 - data["unixTime"];
                            this.drawProgress.setRoadLvData(data.progress, intervalTime, i + 1, reward);
                            break;
                        }
                    }
                } else {
                    this.drawProgress.visible = false;
                }

            }
        }
    }

    public setMoneyData(money: number, token: number, tokenId: string) {
        let moneyframe = "home_silver";
        let tokenframe = "roam_ordinary_icon";
        if (tokenId === "IV0000002") {
            moneyframe = "home_diamond";
            tokenframe = "roam_advanced_icon";
        }
        this.moneyvalue.setFrameValue(money + "", UIAtlasName.uicommon, moneyframe);
        this.tokenvalue.setFrameValue(token + "", UIAtlasName.uicommon, tokenframe);
        this.money = money;
        this.token = token;
        this.tokenid = tokenId;
    }

    private onRoamDrawHandler(tag: string, roamData: op_client.IDRAW_POOL_STATUS) {
        if (tag === "one") {
            roamData["one"] = true;
            if (!roamData["free"] && this.token < roamData.drawTime && this.money < roamData.unitPrice * roamData.drawTime) {
                const moneyName = this.tokenid === "IV0000002" ? i18n.t("coin.diamond") : i18n.t("coin.coin");
                const text = i18n.t("roam.moneytips", { name: moneyName });
                if (this.send) this.send.runWith(["notice", text]);
                return;
            }
        } else if (tag === "ten") {
            roamData["one"] = false;
            if (!roamData["free"] && this.token < roamData.drawTime) {
                const moneyName = this.tokenid === "IV0000002" ? i18n.t("coin.diamond") : i18n.t("coin.coin");
                const moneytag = this.tokenid === "IV0000002" ? i18n.t("coin.gold") : i18n.t("coin.silver");
                const tokenvalue = roamData.drawTime - this.token;
                const value = roamData.unitPrice * tokenvalue;
                if (value <= this.money) {
                    const text = i18n.t("roam.paytips", { name: value + moneyName, count: tokenvalue, tag: moneytag });
                    if (this.send) this.send.runWith(["pay", { tokenID: this.tokenid, id: roamData.id, value, text }]);
                } else {
                    const text = i18n.t("roam.moneytips", { name: moneyName });
                    if (this.send) this.send.runWith(["notice", text]);
                }
                return;
            }
        }
        if (this.send) this.send.runWith(["draw", roamData]);
    }
    private onCloseHandler() {
        if (this.send) this.send.runWith("close");
    }
    private onRechargeHandler() {
    }

    private onDrawPreviewHandler() {
        if (this.send) this.send.runWith("preview");
    }
    private onProgressHandler(tag: string, data?: any) {
        if (tag === "help") {

        } else if (tag === "reward") {
            if (this.send) this.send.runWith(["progressrewards", data]);
        }
    }

}

class RoamDrawProgress extends Phaser.GameObjects.Container {
    private progreItem: ProgressItem;
    private progreTex: Phaser.GameObjects.Text;
    private roamLevTex: BBCodeText;
    private roamLevTips: Phaser.GameObjects.Text;
    private roamLevHelp: Button;
    private resetTimeTex: Phaser.GameObjects.Text;
    private dpr: number;
    private zoom: number;
    private send: Handler;
    private indexed: number;
    private expireTime: number;
    private timer: any;
    constructor(scene: Phaser.Scene, dpr: number, zoom: number) {
        super(scene);
        this.dpr = dpr;
        this.zoom = zoom;
        this.init();
    }

    refreshMask() {
        this.progreItem.refreshMask();
    }

    init() {
        const progressBg = this.scene.make.image({ key: UIAtlasName.roam, frame: "roam_lv_bg" });
        progressBg.y = 0;
        this.setSize(progressBg.width, progressBg.height);
        this.progreItem = new ProgressItem(this.scene, this.dpr, this.zoom);
        this.progreItem.y = -13 * this.dpr;
        this.progreTex = this.scene.make.text({ text: "", style: UIHelper.whiteStyle(this.dpr) }).setOrigin(0.5);
        this.progreTex.setFontStyle("bold");
        this.progreTex.y = this.progreItem.y;
        this.roamLevTex = new BBCodeText(this.scene, 0, 0, "", UIHelper.blackStyle(this.dpr)).setOrigin(0.5);
        this.roamLevTex.y = progressBg.height * 0.5 + 15 * this.dpr;
        this.roamLevHelp = new Button(this.scene, UIAtlasName.uicommon1, "icon_tips");
        this.roamLevHelp.on(ClickEvent.Tap, this.onHelpHandler, this);
        this.roamLevHelp.y = this.roamLevTex.y;
        this.roamLevHelp.x = this.roamLevTex.x + this.roamLevTex.width * 0.5 + 15 * this.dpr;
        this.roamLevTips = this.scene.make.text({ text: "", style: UIHelper.blackStyle(this.dpr) }).setOrigin(0.5);
        this.roamLevTips.y = this.roamLevTex.y + 20 * this.dpr;
        this.resetTimeTex = this.scene.make.text({ text: "", style: UIHelper.redStyle(this.dpr, 8) }).setOrigin(0.5);
        this.resetTimeTex.setStroke("#ffffff", this.dpr);
        this.resetTimeTex.y = 20 * this.dpr;
        this.add([progressBg, this.progreItem, this.progreTex, this.roamLevTex, this.roamLevHelp, this.roamLevTips, this.resetTimeTex]);
        this.on("pointerup", this.onRecivedRewardHandler, this);
    }

    public setRoadLvData(progress: number, expireTime: number, index: number, data: op_client.IPKT_Progress) {
        this.indexed = index;
        this.expireTime = expireTime;
        this.roamLevTex.text = i18n.t("roam.roamlv", { name: "" }) + ` [color=#FF693A][size=${14 * this.dpr}][b]LV${index}[/b][/size][/color]`;
        progress = progress > data.targetValue ? progress = data.targetValue : progress;
        this.progreTex.text = `${progress}/${data.targetValue}`;
        this.progreItem.setProgress(progress, data.targetValue);
        if (progress >= data.targetValue) {
            this.setInteractive();
        } else {
            this.disableInteractive();
        }
        this.roamLevTips.text = data.rewards[0].des;
        if (expireTime > 0) {
            this.resetTimeTex.visible = true;
            this.resetTimeTex.text = i18n.t("roam.resettips", { name: TimeUtils.getDataFormat(expireTime, false) });
            this.loopTimeOut(expireTime);
        } else {
            this.resetTimeTex.visible = false;
        }
        this.roamLevHelp.x = this.roamLevTex.x + this.roamLevTex.width * 0.5 + this.roamLevHelp.width * 0.5 + 20 * this.dpr;
    }

    public setHandler(handler: Handler) {
        this.send = handler;
    }

    private onHelpHandler() {
        if (!this.visible) return;
        if (this.send) this.send.runWith("help");
    }
    private onRecivedRewardHandler() {
        if (!this.visible) return;
        if (this.send) this.send.runWith(["reward", this.indexed]);
    }
    private loopTimeOut(time: number) {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = undefined;
        }
        const excute = () => {
            this.timer = setTimeout(() => {
                if (!this.scene) return;
                time -= 1000;
                if (time > 0) {
                    excute();
                    this.resetTimeTex.text = i18n.t("roam.resettips", { name: TimeUtils.getDataFormat(time, false) });
                } else {
                    this.resetTimeTex.visible = false;
                }
            }, 1000);
        };
        excute();
    }
}

class ProgressItem extends Phaser.GameObjects.Container {
    public max: number = 1;
    public value: number = 0;
    private progreimg: Phaser.GameObjects.Image;
    private sprite: Phaser.GameObjects.Sprite;
    private sprite2: Phaser.GameObjects.Sprite;
    private graphic: Phaser.GameObjects.Graphics;
    private imgMask: Phaser.GameObjects.Image;
    private dpr: number;
    private zoom: number;
    private animkey: string = "roamlv1";
    private animkey2: string = "roamlv2";
    constructor(scene: Phaser.Scene, dpr: number, zoom: number) {
        super(scene);
        this.dpr = dpr;
        this.zoom = zoom;
        this.init();
    }
    init() {
        this.progreimg = this.scene.make.image({ key: UIAtlasName.roam, frame: "roam_lv" });
        this.setSize(this.progreimg.width, this.progreimg.height);
        this.sprite = this.createSprite(UIAtlasName.roam, this.animkey, "roam_lv_1_", [1, 6], 9, -1);
        this.sprite2 = this.createSprite(UIAtlasName.roam, this.animkey2, "roam_lv_2_", [1, 6], 9, -1);
        this.graphic = this.scene.make.graphics(undefined, false);
        this.graphic.clear();
        this.graphic.fillStyle(0xfebf17, 1);
        this.graphic.fillRect(-this.width * 0.5, 0, this.width, this.height);
        this.imgMask = this.scene.make.image({ key: UIAtlasName.roam, frame: "roam_lv" });
        this.mask = new Phaser.Display.Masks.BitmapMask(this.scene, this.imgMask);
        this.add([this.progreimg, this.graphic, this.sprite, this.sprite2]);
    }

    public destroy() {
        super.destroy();
        this.imgMask.destroy(true);
    }
    refreshMask() {
        const world = this.getWorldTransformMatrix();
        this.imgMask.x = world.tx;
        this.imgMask.y = world.ty;
    }

    public setProgress(value: number, max: number) {
        this.value = value;
        this.max = max;
        const radio = value / max;
        const height = radio * this.height;
        const y = this.height * 0.5 - height;
        this.sprite.y = y;
        this.sprite2.y = y;
        this.graphic.y = y + 7 * this.dpr;
        if (value >= max) {
            this.progreimg.visible = true;
            this.sprite.visible = false;
            this.sprite2.visible = false;
            this.graphic.visible = false;
        } else {
            this.progreimg.visible = false;
            this.sprite.visible = true;
            this.sprite2.visible = true;
            this.graphic.visible = true;
        }
    }
    private createSprite(key: string, animkey: string, frame: string, indexs: number[], frameRate: number = 30, repeat = 0) {
        const sprite = this.scene.make.sprite({ key, frame: frame + "1" });
        this.scene.anims.create({ key: animkey, frames: this.scene.anims.generateFrameNames(key, { prefix: frame + "", start: indexs[0], end: indexs[1] }), frameRate, repeat });
        sprite.play(animkey);
        return sprite;
    }
}

class RoamDrawItem extends Phaser.GameObjects.Container {
    private roamData: op_client.IDRAW_POOL_STATUS;
    private dpr: number;
    private zoom: number;
    private drawTips: Phaser.GameObjects.Text;
    private drawButton: BackgroundScaleButton;
    private send: Handler;
    private timer: any;
    constructor(scene: Phaser.Scene, dpr: number, zoom: number) {
        super(scene);
        this.dpr = dpr;
        this.zoom = zoom;
        this.setSize(158 * dpr, 77 * dpr);
        this.drawTips = this.scene.make.text({
            x: 0, y: -this.height * 0.5 + 5 * dpr, text: "",
            style: UIHelper.blackStyle(dpr)
        }).setOrigin(0.5);
        this.drawButton = new BackgroundScaleButton(this.scene, 158 * dpr, 65 * this.dpr, UIAtlasName.roam, "roam_butt_one", "roam_butt_one_1", undefined, this.dpr, 1, false);
        this.drawButton.on(ClickEvent.Tap, this.onButtonHandler, this);
        this.drawButton.y = 15 * dpr;
        this.add([this.drawTips, this.drawButton]);

    }

    public setHandler(send: Handler) {
        this.send = send;
    }

    public setRoamData(data: op_client.IDRAW_POOL_STATUS) {
        this.roamData = data;
        let normal = data.drawTime === 1 ? "roam_butt_one" : "roam_butt_ten";
        let down = data.drawTime === 1 ? "roam_butt_one_1" : "roam_butt_ten_1";
        if (data.tokenId === "IV0000002") {
            normal = data.drawTime === 1 ? "roam_diamond_butt_one" : "roam_diamond_butt_ten";
            down = data.drawTime === 1 ? "roam_diamond_butt_one_1" : "roam_diamond_butt_ten_1";
        }
        this.drawButton.setFrameNormal(normal, down);
        if (data["free"]) {
            this.drawTips.text = i18n.t("roam.drawfreetips");
            this.drawTips.visible = true;
        } else {
            if (data.nextFreeTime !== undefined) {
                const interval = data.nextFreeTime * 1000 - data["unixTime"];
                if (interval > 0) {
                    this.drawTips.visible = true;
                    this.drawTips.text = i18n.t("roam.endtips", { name: TimeUtils.getDataFormat(interval, false) });
                    this.loopTimeOut(interval);
                } else {
                    this.drawTips.visible = true;
                    this.drawTips.text = i18n.t("roam.drawfreetips");
                }
            } else {
                this.drawTips.visible = false;
            }
        }
    }

    private onButtonHandler() {
        if (this.send) this.send.runWith(this.roamData);
    }
    private loopTimeOut(time: number) {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = undefined;
        }
        const excute = () => {
            this.timer = setTimeout(() => {
                if (!this.scene) return;
                time -= 1000;
                if (time > 0) {
                    this.drawTips.text = i18n.t("roam.endtips", { name: TimeUtils.getDataFormat(time, false) });
                    excute();
                } else {
                    this.drawTips.text = i18n.t("roam.drawfreetips");
                    this.roamData["free"] = true;
                }
            }, 1000);
        };
        excute();
    }
}
class CloudDisplayItem extends Phaser.GameObjects.Container {
    private left_in: Phaser.GameObjects.Image;
    private right_in: Phaser.GameObjects.Image;
    private left_out: Phaser.GameObjects.Image;
    private right_out: Phaser.GameObjects.Image;
    private center: Phaser.GameObjects.Image;
    private right_out_2: Phaser.GameObjects.Image;
    private dpr: number;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number) {
        super(scene);
        this.dpr = dpr;
        this.setSize(width, height);
        this.init();
    }

    init() {
        const bottomY = this.height * 0.5;
        this.left_in = this.scene.make.image({ key: UIAtlasName.roam, frame: "rome_cloud_right_3" });
        this.left_in.x = -this.width * 0.5 + this.left_in.width;
        this.left_in.y = bottomY - this.left_in.height * 0.5 - 23 * this.dpr;
        this.center = this.scene.make.image({ key: UIAtlasName.roam, frame: "rome_cloud_center" });
        this.center.y = bottomY - this.center.height * 0.5;
        this.right_in = this.scene.make.image({ key: UIAtlasName.roam, frame: "rome_cloud_left_2" });
        this.right_in.x = this.width * 0.5 - this.right_in.width * 0.5 - 7 * this.dpr;
        this.right_in.y = bottomY - this.right_in.height * 0.5 - 30 * this.dpr;
        this.left_out = this.scene.make.image({ key: UIAtlasName.roam, frame: "rome_cloud_right_2" });
        this.left_out.x = -this.width * 0.5 + this.left_out.width * 0.5;
        this.left_out.y = bottomY - this.left_out.height * 0.5;
        this.right_out = this.scene.make.image({ key: UIAtlasName.roam, frame: "rome_cloud_left_1" });
        this.right_out.x = this.width * 0.5 - this.right_out.width * 0.5;
        this.right_out.y = bottomY - this.right_out.height * 0.5;
        this.right_out_2 = this.scene.make.image({ key: UIAtlasName.roam, frame: "rome_cloud_right_1" });
        this.right_out_2.x = -this.width * 0.5 + this.right_out_2.width * 0.5 + 48 * this.dpr;
        this.right_out_2.y = bottomY - this.right_out_2.height * 0.5;
        this.add([this.left_in, this.center, this.right_in, this.left_out, this.right_out, this.right_out_2]);
    }
}
