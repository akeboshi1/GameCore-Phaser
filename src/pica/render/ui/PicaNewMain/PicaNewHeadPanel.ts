import { Button, ClickEvent, NineSliceButton, NineSlicePatch } from "apowophaserui";
import { ButtonEventDispatcher, ImageValue, ProgressMaskBar } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { Font, Handler } from "utils";
import { op_pkt_def, op_def } from "pixelpai_proto";
export class PicaNewHeadPanel extends Phaser.GameObjects.Container {
    private dpr: number;
    private key: string;
    private headCon: Phaser.GameObjects.Container;
    private moneyCon: Phaser.GameObjects.Container;
    private sceneCon: Phaser.GameObjects.Container;
    private levelTex: Phaser.GameObjects.Text;
    private powerTex: ImageValue;
    private powerPro: ProgressMaskBar;
    private powerAddBtn: Button;
    private moneyvalue: ImageValue;
    private diamondvalue: ImageValue;
    private moneyAddBtn: Button;
    private praiseButton: NineSliceButton;
    private praiseImg: Phaser.GameObjects.Image;
    private peoplevalue: ImageValue;
    private money: number = 0;
    private diamond: number = 0;
    private praise: boolean = false;
    private sendHandler: Handler;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, dpr: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.key = key;
        this.init();
    }

    init() {
        this.headCon = this.scene.make.container(undefined, false);
        this.moneyCon = this.scene.make.container(undefined, false);
        this.sceneCon = this.scene.make.container(undefined, false);
        this.add([this.moneyCon, this.sceneCon]);
        const headbg = this.scene.make.image({ x: 0, y: 0, key: UIAtlasName.iconcommon, frame: "home_head_bg" }, false);
        const headclickCon = new ButtonEventDispatcher(this.scene, 0, 0);
        headclickCon.setSize(40 * this.dpr, 40 * this.dpr);
        headclickCon.enable = true;
        headclickCon.on(ClickEvent.Tap, this.onHeadHandler, this);
        const vipmark = this.scene.make.image({ x: 0, y: 10 * this.dpr, key: UIAtlasName.iconcommon, frame: "home_vip_mark" }, false);
        this.levelTex = this.scene.make.text({
            x: 0, y: 0, text: "", style: { color: "#0089D3", fontSize: 14 * this.dpr, fontFamily: Font.NUMBER }
        }).setStroke("#ffffff", 2 * this.dpr).setFontStyle("bold").setOrigin(0.5);
        this.powerPro = new ProgressMaskBar(this.scene, UIAtlasName.uicommon, "home_progress_bottom", "strength_progress");
        this.powerPro.x = 0;
        this.powerPro.y = headbg.height * 0.5 + this.powerPro.height * 0.5;
        this.powerTex = new ImageValue(this.scene, 43 * this.dpr, 15 * this.dpr, UIAtlasName.uicommon, "strength_icon", this.dpr, {
            color: "#ffffff", fontSize: 8 * this.dpr, fontFamily: Font.NUMBER
        });
        this.powerTex.y = this.powerPro.y;
        this.powerTex.setFontStyle("bold");
        this.powerTex.setStroke("#000000", 2 * this.dpr);
        this.powerTex.setLayout(1);
        this.powerAddBtn = new Button(this.scene, UIAtlasName.uicommon, "add_btn", "add_btn");
        this.powerAddBtn.on(ClickEvent.Tap, this.onEnergyHandler, this);
        this.headCon.add([headbg, vipmark, this.levelTex, headclickCon, this.powerPro, this.powerTex, this.powerAddBtn]);
        this.headCon.x = -this.width * 0.5 - 40 * this.dpr;
        const moneybg = new NineSlicePatch(this.scene, 0, 0, 190 * this.dpr, 26 * this.dpr, UIAtlasName.uicommon, "home_assets_bg", {
            left: 32 * this.dpr,
            top: 0 * this.dpr,
            right: 32 * this.dpr,
            bottom: 0 * this.dpr
        });
        moneybg.x = -moneybg.width * 0.5;
        const moneyline = this.scene.make.image({ x: moneybg.x, y: 0, key: UIAtlasName.iconcommon, frame: "home_assets_division" }, false);
        this.moneyvalue = new ImageValue(this.scene, 60 * this.dpr, 26 * this.dpr, UIAtlasName.uicommon, "home_silver", this.dpr, {
            color: "#ffffff", fontSize: 8 * this.dpr, fontFamily: Font.NUMBER
        });
        this.moneyvalue.setLayout(1);
        this.moneyvalue.x = moneybg.x - moneybg.width * 0.5 + 10 * this.dpr;
        this.diamondvalue = new ImageValue(this.scene, 60 * this.dpr, 26 * this.dpr, UIAtlasName.uicommon, "home_diamond", this.dpr, {
            color: "#ffffff", fontSize: 8 * this.dpr, fontFamily: Font.NUMBER
        });
        this.diamondvalue.setLayout(1);
        this.diamondvalue.x = moneybg.x + 10 * this.dpr;
        this.moneyAddBtn = new Button(this.scene, UIAtlasName.uicommon, "home_praise_bg", "home_praise_bg");
        const moneyAddicon = this.scene.make.image({ x: 0, y: 0, key: UIAtlasName.iconcommon, frame: "home_assets_add" }, false);
        this.moneyAddBtn.add(moneyAddicon);
        this.moneyAddBtn.x = this.moneyAddBtn.width * 0.5 - 3 * this.dpr;
        this.moneyAddBtn.on(ClickEvent.Tap, this.onRechargeHandler, this);
        this.moneyCon.add([moneybg, moneyline, this.moneyvalue, this.diamondvalue, this.moneyAddBtn]);
        this.moneyCon.x = this.width * 0.5 - 30 * this.dpr;
        const peoplebg = this.scene.make.image({ x: 0, y: 0, key: UIAtlasName.uicommon, frame: "home_persons_bg" }, false);
        peoplebg.x = -peoplebg.width * 0.5;
        this.peoplevalue = new ImageValue(this.scene, 45 * this.dpr, 27 * this.dpr, UIAtlasName.uicommon, "home_persons", this.dpr, {
            color: "#ffffff", fontSize: 8 * this.dpr, fontFamily: Font.DEFULT_FONT
        });
        this.peoplevalue.setLayout(1);
        this.peoplevalue.x = peoplebg.x - 10 * this.dpr;
        this.praiseButton = new NineSliceButton(this.scene, 0, 0, 100 * this.dpr, 28 * this.dpr, UIAtlasName.uicommon, "home_mapname_bg", "", this.dpr, 1, {
            left: 32 * this.dpr,
            top: 0 * this.dpr,
            right: 32 * this.dpr,
            bottom: 0 * this.dpr
        });
        this.praiseButton.setTextOffset(-10 * this.dpr, 0);
        const praisebg = this.scene.make.image({ x: 0, y: 0, key: UIAtlasName.uicommon, frame: "home_praise_bg" }, false);
        praisebg.x = this.praiseButton.width * 0.5 - praisebg.width * 0.5 - 3 * this.dpr;
        this.praiseImg = this.scene.make.image({ x: praisebg.x, y: 0, key: UIAtlasName.uicommon, frame: "home_praise" }, false);
        this.praiseButton.add([praisebg, this.praiseImg]);
        this.praiseButton.x = -peoplebg.width - 20 * this.dpr - this.praiseButton.width * 0.5;
        this.praiseButton.on(ClickEvent.Tap, this.onPraiseHandler, this);
        this.sceneCon.add([peoplebg, this.peoplevalue, this.praiseButton]);
        this.sceneCon.x = this.width * 0.5 - 30 * this.dpr;
    }

    public setHeadData(level: op_pkt_def.IPKT_Level, energy: op_def.IValueBar, money: number, diamond: number) {
        if (level)
            this.levelTex.text = level.level + "";
        if (energy) {
            this.powerTex.setText(`${energy.currentValue}/${energy.max}`);
            this.powerPro.setProgress(energy.currentValue, energy.max);
        }
        money = money || 0;
        this.moneyvalue.setText(money + "");
        diamond = diamond || 0;
        this.diamondvalue.setText(diamond + "");
        if (this.money !== money || this.diamond !== diamond) {
            this.moveHeadCon();
        }
        this.money = money;
        this.diamond = diamond;
    }

    public setSceneData(sceneName: string, isPraise: boolean, people: number) {
        this.praiseButton.setText(sceneName);
        this.praiseImg.setFrame(isPraise ? "home_praise_1" : "home_praise");
        this.praise = isPraise;
        this.peoplevalue.setText(people + "");
    }

    public setHandler(send: Handler) {
        this.sendHandler = send;
    }

    private onHeadHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["head"]);
    }

    private onEnergyHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["energy"]);
    }

    private onPraiseHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["praise", !this.praise]);
    }

    private onRechargeHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["recharge"]);
    }

    private moveHeadCon() {
        const from = this.width + 190 * this.dpr;
        const to = this.width - 20 * this.dpr;
        this.add(this.headCon);
        const tween = this.scene.tweens.add({
            targets: this.moneyCon,
            x: {
                from,
                to
            },
            ease: "Linear",
            duration: 150,
            onComplete: () => {
                tween.stop();
                tween.remove();
                setTimeout(() => {
                    this.fadeOutHeadCon();
                }, 3000);
            },
        });
    }
    private fadeOutHeadCon() {
        const tween = this.scene.tweens.add({
            targets: this.moneyCon,
            alpha: {
                from: 1,
                to: 0.2
            },
            ease: "Linear",
            duration: 150,
            onComplete: () => {
                tween.stop();
                tween.remove();
                this.remove(this.headCon);
            },
        });
    }

}
