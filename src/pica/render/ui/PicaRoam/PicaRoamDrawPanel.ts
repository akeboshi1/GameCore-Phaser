import { NineSlicePatch, GameGridTable, Button, ClickEvent, BBCodeText } from "apowophaserui";
import { BackgroundScaleButton, CommonBackground, DynamicImage, ImageValue, NinePatchButton } from "gamecoreRender";
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
    private dpr: number;
    private zoom: number;
    private send: Handler;
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
    }

    setHandler(send: Handler) {
        this.send = send;
    }

    init() {
        this.bg = new CommonBackground(this.scene, 0, 0, this.width, this.height, UIAtlasName.roam, "roam_bg", 0x72e7fb);
        const topbg = this.scene.make.image({ key: "roam_topic", frame: "roam_topic" });
        topbg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        const topbg1 = this.scene.make.image({ key: "roam_stripe", frame: "roam_stripe" });
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

        const previewBtn = new NinePatchButton(this.scene, 0, 0, 76 * this.dpr, 30 * this.dpr, UIAtlasName.uicommon, "home_persons_bg", i18n.t("roam.previewtex"), {
            left: 30 * this.dpr, right: 30 * this.dpr, top: 0, bottom: 0
        });
        this.drawProgress = new RoamDrawProgress(this.scene, this.dpr);
        this.drawProgress.y = topbg.y + topbg.height * 0.5 - 70 * this.dpr;
        this.oneRoamItem = new RoamDrawItem(this.scene, this.dpr, this.zoom);
        this.oneRoamItem.x = -this.oneRoamItem.width * 0.5 - 10 * this.dpr;
        this.oneRoamItem.y = this.height * 0.5 - 60 * this.dpr;
        this.oneRoamItem.setHandler(new Handler(this, this.onRoamDrawHandler, ["one"]));
        this.tenRoamItem = new RoamDrawItem(this.scene, this.dpr, this.zoom);
        this.tenRoamItem.x = -this.oneRoamItem.x;
        this.tenRoamItem.y = this.oneRoamItem.y;
        this.tenRoamItem.setHandler(new Handler(this, this.onRoamDrawHandler, ["ten"]));
        this.bottomtips = this.scene.make.text({ text: "", style: UIHelper.blackStyle(this.dpr, 14) });
        this.bottomtips.y = this.height * 0.5 - 20 * this.dpr;
        this.add([this.bg, topbg1, topbg, this.closeBtn, this.moneyCon, previewBtn, this.drawProgress, this.oneRoamItem, this.tenRoamItem, this.bottomtips]);
        this.resize();
    }

    public setRoamDatas(datas: op_client.IDRAW_POOL_STATUS[]) {
        this.oneRoamItem.setRoamData(datas[0]);
        this.tenRoamItem.setRoamData(datas[1]);
        const data = datas[0];
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
    }

    private onRoamDrawHandler(tag: string, roamData: op_client.IDRAW_POOL_STATUS) {
        if (tag === "one") {

        } else if (tag === "ten") {

        }
        if (this.send) this.send.runWith(roamData);
    }
    private onCloseHandler() {
        if (this.send) this.send.runWith("close");
    }
    private onRechargeHandler() {
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
    private send: Handler;
    constructor(scene: Phaser.Scene, dpr: number) {
        super(scene);
        this.dpr = dpr;
        this.init();
    }

    init() {
        const progressBg = this.scene.make.image({ key: UIAtlasName.roam, frame: "roam_lv_bg" });
        progressBg.y = 0;
        this.progreItem = new ProgressItem(this.scene, this.dpr);
        this.progreTex = this.scene.make.text({ text: "", style: UIHelper.whiteStyle(this.dpr) }).setOrigin(0.5);
        this.progreTex.setFontStyle("bold");
        this.progreTex.y = this.progreItem.y;
        this.roamLevTex = new BBCodeText(this.scene, 0, 0, "", UIHelper.blackStyle(this.dpr)).setOrigin(0.5);
        this.roamLevTex.y = progressBg.height * 0.5 + 5 * this.dpr;
        this.roamLevHelp = new Button(this.scene, UIAtlasName.uicommon1, "icon_tips");
        this.roamLevHelp.on(ClickEvent.Tap, this.onHelpHandler, this);
        this.roamLevHelp.y = this.roamLevTex.y;
        this.roamLevHelp.x = this.roamLevTex.x + this.roamLevTex.width * 0.5 + 10 * this.dpr;
        this.roamLevTips = this.scene.make.text({ text: "", style: UIHelper.blackStyle(this.dpr) }).setOrigin(0.5);
        this.roamLevTips.y = this.roamLevTex.y + 20 * this.dpr;
        this.resetTimeTex = this.scene.make.text({ text: "", style: UIHelper.redStyle(this.dpr, 8) }).setOrigin(0.5);
        this.resetTimeTex.y = 20 * this.dpr;
        this.add([progressBg, this.progreItem, this.progreTex, this.roamLevTex, this.roamLevHelp, this.roamLevTips, this.resetTimeTex]);
    }

    public setRoadLvData(progress: number, expireTime: number, index: number, data: op_client.PKT_Progress) {
        this.roamLevTex.text = i18n.t("roam.roamlv", { name: `[color=#FF693A][size=${14 * this.dpr}][b]LV${index}[/b][/size][/color]` });
        this.progreTex.text = `${progress}/${data.targetValue}`;
        this.progreItem.setProgress(progress, data.targetValue);
        this.roamLevTips.text = data.rewards[0].des;
    }

    public setHandler(handler: Handler) {
        this.send = handler;
    }

    private onHelpHandler() {
        if (this.send) this.send.runWith("help");
    }
    // private createSprite(key: string, animkey: string, frame: string, indexs: number[], frameRate: number = 30, repeat = 0) {
    //     const sprite = this.scene.make.sprite({ key, frame: frame + "1" });
    //     this.scene.anims.create({ key: animkey, frames: this.scene.anims.generateFrameNames(key, { prefix: frame + "", start: indexs[0], end: indexs[1] }), frameRate, repeat });
    //     return sprite;
    // }
}

class ProgressItem extends Phaser.GameObjects.Container {
    public max: number = 1;
    public value: number = 0;
    private progreimg: Phaser.GameObjects.Image;
    private sprite: Phaser.GameObjects.Sprite;
    private sprite2: Phaser.GameObjects.Sprite;
    private graphic: Phaser.GameObjects.Graphics;
    private dpr: number;
    private animkey: string = "roamlv1";
    private animkey2: string = "roamlv2";
    constructor(scene: Phaser.Scene, dpr: number) {
        super(scene);
        this.dpr = dpr;
        this.init();
    }
    init() {
        this.progreimg = this.scene.make.image({ key: UIAtlasName.roam, frame: "roam_lv" });
        this.setSize(this.progreimg.width, this.progreimg.height);
        this.sprite = this.createSprite(UIAtlasName.roam, this.animkey, "roam_lv_1_", [1, 6]);
        this.sprite2 = this.createSprite(UIAtlasName.roam, this.animkey2, "roam_lv_2_", [1, 6]);
        this.graphic = this.scene.make.graphics(undefined, false);
        this.graphic.clear();
        this.graphic.fillStyle(0xfebf17, 1);
        this.graphic.fillRect(-this.width * 0.5, 0, this.width, this.height);
        const mask = this.scene.make.image({ key: UIAtlasName.roam, frame: "roam_lv" });
        this.mask = new Phaser.Display.Masks.BitmapMask(this.scene, mask);
        this.add([this.progreimg, this.graphic, this.sprite, this.sprite2]);
    }

    public setProgress(value: number, max: number) {
        this.value = value;
        this.max = max;
        const radio = value / max;
        const height = radio * this.height;
        const y = this.height * 0.5 - height;
        this.sprite.y = y;
        this.sprite2.y = y;
        this.graphic.y = y;
        if (value === max) {
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
    constructor(scene: Phaser.Scene, dpr: number, zoom: number) {
        super(scene);
        this.dpr = dpr;
        this.zoom = zoom;
        this.setSize(158 * dpr, 77 * dpr);
        this.drawTips = this.scene.make.text({
            x: 0, y: -this.height * 0.5 + 5 * dpr, text: "",
            style: UIHelper.blackStyle(dpr)
        }).setOrigin(0.5);
        this.drawButton = new BackgroundScaleButton(this.scene, 158 * dpr * this.dpr, 65 * this.dpr, UIAtlasName.uicommon, "roam_butt_one", "roam_butt_one_1", undefined, this.dpr, 1, false);
        this.drawButton.on(ClickEvent.Tap, this.onButtonHandler, this);
        this.drawButton.y = -5 * dpr;

    }

    public setHandler(send: Handler) {
        this.send = send;
    }

    public setRoamData(data: op_client.IDRAW_POOL_STATUS) {
        this.roamData = data;
        let normal = data.drawTime === 1 ? "roam_butt_one" : "roam_butt_ten";
        let down = data.drawTime === 1 ? "roam_butt_one_1" : "roam_butt_ten_1";
        if (data.tokenId === "IV0000002") {
            normal = data.drawTime === 1 ? "roam_diamond_butt_one" : "roam_diamond_butt_one_1";
            down = data.drawTime === 1 ? "roam_diamond_butt_ten" : "roam_diamond_butt_ten_1";
        }
        this.drawButton.setFrameNormal(normal, down);
        this.drawTips.text = i18n.t("roam.endtips", { name: TimeUtils.getDataFormat(data.nextFreeTime, false) });
    }

    private onButtonHandler() {
        if (this.send) this.send.runWith(this.roamData);
    }
}
