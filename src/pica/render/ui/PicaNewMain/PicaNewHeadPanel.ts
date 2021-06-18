import { Button, ClickEvent, NineSlicePatch } from "apowophaserui";
import { ButtonEventDispatcher, ProgressMaskBar, ProgressNineMaskBar } from "gamecoreRender";
import { UIAtlasName } from "../../../res";
import { Font, Handler, UIHelper } from "utils";
import { op_pkt_def } from "pixelpai_proto";
import { ImageValue } from "../../ui";
export class PicaNewHeadPanel extends Phaser.GameObjects.Container {
    private dpr: number;
    private key: string;
    private headCon: Phaser.GameObjects.Container;
    private moneyCon: Phaser.GameObjects.Container;
    private sceneCon: Phaser.GameObjects.Container;
    private sceneclickCon: ButtonEventDispatcher;
    private levelTex: Phaser.GameObjects.Text;
    private powerTex: ImageValue;
    private powerPro: ProgressNineMaskBar;
    private powerAddBtn: Button;
    private moneyvalue: ImageValue;
    private diamondvalue: ImageValue;
    private moneyAddBtn: Button;
    private roomSetBtn: RoomSetButton;
    private roomPraiseBtn: RoomPraiseButton;
    private sceneTex: Phaser.GameObjects.Text;
    private peoplevalue: ImageValue;
    private sceneNamebg: Phaser.GameObjects.Image;
    private peoplebg: Phaser.GameObjects.Image;
    private money: number = 0;
    private diamond: number = 0;
    private praise: boolean = false;
    private isself: boolean = false;
    private sendHandler: Handler;
    private moneyTween: any;
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
        this.add([this.headCon, this.sceneCon]);
        const headbg = this.scene.make.image({ x: 0, y: 0, key: UIAtlasName.iconcommon, frame: "home_head_bg" }, false);
        const headclickCon = new ButtonEventDispatcher(this.scene, 0, 0);
        headclickCon.setSize(40 * this.dpr, 40 * this.dpr);
        headclickCon.enable = true;
        headclickCon.on(ClickEvent.Tap, this.onHeadHandler, this);
        const vipmark = this.scene.make.image({ x: 0, y: 10 * this.dpr, key: UIAtlasName.iconcommon, frame: "home_vip_mark" }, false);
        this.levelTex = this.scene.make.text({
            x: 0, y: 0, text: "", style: { color: "#0089D3", fontSize: 14 * this.dpr, fontFamily: Font.NUMBER }
        }).setStroke("#ffffff", 2 * this.dpr).setFontStyle("bold").setOrigin(0.5);
        this.powerPro = new ProgressNineMaskBar(this.scene, UIAtlasName.uicommon, "home_progress_bottom", "strength_progress", undefined, {
            width: 41 * this.dpr, height: 11 * this.dpr, left: 4 * this.dpr, right: 4 * this.dpr, top: 0, bottom: 0
        });
        this.powerPro.x = 0;
        this.powerPro.y = headbg.height * 0.5 + this.powerPro.height * 0.5 - 4 * this.dpr;
        this.powerTex = new ImageValue(this.scene, 43 * this.dpr, 15 * this.dpr, UIAtlasName.uicommon, "strength_icon", this.dpr, {
            color: "#ffffff", fontSize: 8 * this.dpr, fontFamily: Font.NUMBER
        });
        this.powerTex.y = this.powerPro.y;
        this.powerTex.x = -2 * this.dpr;
        this.powerTex.setFontStyle("bold");
        this.powerTex.setStroke("#000000", 2 * this.dpr);
        this.powerTex.setOffset(-4 * this.dpr, 0);
        this.powerTex.setLayout(2);
        this.powerTex.setText("");
        this.powerAddBtn = new Button(this.scene, UIAtlasName.uicommon, "add_btn", "add_btn");
        this.powerAddBtn.x = this.powerPro.x + this.powerPro.width * 0.5 + 7 * this.dpr;
        this.powerAddBtn.y = this.powerPro.y;
        this.powerAddBtn.on(ClickEvent.Tap, this.onEnergyHandler, this);
        // const tooqingBtn = new Button(this.scene, UIAtlasName.iconcommon, "home_toqing", "home_toqing");
        // tooqingBtn.on(ClickEvent.Tap, this.onTooqingHandler, this);
        // tooqingBtn.x = headclickCon.x + headclickCon.width * 0.5 + tooqingBtn.width * 0.5 + 15 * this.dpr;
        // tooqingBtn.y = headclickCon.y;
        this.headCon.add([this.powerPro, headbg, vipmark, this.levelTex, headclickCon, this.powerTex, this.powerAddBtn]);
        this.headCon.x = -this.width * 0.5 + 33 * this.dpr;
        this.headCon.y = -2 * this.dpr;
        const moneybg = new NineSlicePatch(this.scene, 0, -this.dpr, 190 * this.dpr, 28 * this.dpr, UIAtlasName.uicommon, "home_assets_bg", {
            left: 17 * this.dpr,
            top: 0 * this.dpr,
            right: 17 * this.dpr,
            bottom: 0 * this.dpr
        });
        moneybg.x = -moneybg.width * 0.5;
        const moneyline = this.scene.make.image({ x: moneybg.x, y: 0, key: UIAtlasName.uicommon, frame: "home_assets_division" }, false);
        this.moneyvalue = new ImageValue(this.scene, 60 * this.dpr, 26 * this.dpr, UIAtlasName.uicommon, "iv_coin", this.dpr, {
            color: "#ffffff", fontSize: 15 * this.dpr, fontFamily: Font.NUMBER
        });
        this.moneyvalue.setLayout(1);
        // this.moneyvalue.setUintText({ style: UIHelper.whiteStyle(this.dpr, 15) });
        this.moneyvalue.x = moneybg.x - moneybg.width * 0.5 + 22 * this.dpr;
        this.diamondvalue = new ImageValue(this.scene, 60 * this.dpr, 26 * this.dpr, UIAtlasName.uicommon, "iv_diamond", this.dpr, {
            color: "#ffffff", fontSize: 15 * this.dpr, fontFamily: Font.NUMBER
        });
        this.diamondvalue.setLayout(1);
        // this.diamondvalue.setUintText({ style: UIHelper.whiteStyle(this.dpr, 15) });
        this.diamondvalue.x = moneybg.x + 22 * this.dpr;
        this.moneyAddBtn = new Button(this.scene, UIAtlasName.uicommon, "home_praise_bg", "home_praise_bg");
        const moneyAddicon = this.scene.make.image({ x: 0, y: 0, key: UIAtlasName.uicommon, frame: "home_assets_add" }, false);
        this.moneyAddBtn.add(moneyAddicon);
        this.moneyAddBtn.x = -this.moneyAddBtn.width * 0.5 - 4 * this.dpr;
        this.moneyAddBtn.on(ClickEvent.Tap, this.onRechargeHandler, this);
        this.moneyCon.add([moneybg, moneyline, this.moneyvalue, this.diamondvalue, this.moneyAddBtn]);
        this.moneyCon.x = this.width * 0.5 - 10 * this.dpr;
        this.moneyCon.y = -15 * this.dpr;

        const peoplebg = this.scene.make.image({ x: 0, y: 0, key: UIAtlasName.uicommon, frame: "home_persons_bg" }, false);
        peoplebg.x = -peoplebg.width * 0.5;
        this.peoplebg = peoplebg;
        this.peoplevalue = new ImageValue(this.scene, 45 * this.dpr, 27 * this.dpr, UIAtlasName.uicommon, "home_persons", this.dpr, {
            color: "#ffffff", fontSize: 12 * this.dpr, fontFamily: Font.DEFULT_FONT
        });
        this.peoplevalue.setLayout(2);
        this.peoplevalue.setText("0");
        this.peoplevalue.x = peoplebg.x - 2 * this.dpr;
        const peopeclickCon = new ButtonEventDispatcher(this.scene, 0, 0);
        peopeclickCon.setSize(40 * this.dpr, 40 * this.dpr);
        peopeclickCon.enable = true;
        peopeclickCon.on(ClickEvent.Tap, this.onOpenOnlineHandler, this);
        peopeclickCon.x = this.peoplevalue.x;
        this.sceneNamebg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "home_name_bg" }).setOrigin(0.5);
        this.sceneNamebg.x = -peoplebg.width - 15 * this.dpr - this.sceneNamebg.width * 0.5;
        this.sceneTex = this.scene.make.text({
            x: this.sceneNamebg.x - 10 * this.dpr, y: 0, text: "", style: { color: "#FFF449", fontSize: 11 * this.dpr, fontFamily: Font.DEFULT_FONT }
        }).setOrigin(0.5);
        this.roomSetBtn = new RoomSetButton(this.scene, 30 * this.dpr, 30 * this.dpr, this.dpr, 1);
        this.roomSetBtn.on(ClickEvent.Tap, this.onOpenHouseHandler, this);
        this.roomPraiseBtn = new RoomPraiseButton(this.scene, this.dpr, 1);
        this.roomSetBtn.x = -peoplebg.width - 29 * this.dpr;
        this.roomSetBtn.y = 0;
        this.roomPraiseBtn.on(ClickEvent.Tap, this.onPraiseHandler, this);
        this.roomPraiseBtn.x = -peoplebg.width - 38 * this.dpr;
        this.roomPraiseBtn.y = 0;
        this.sceneclickCon = new ButtonEventDispatcher(this.scene, 0, 0);
        this.sceneclickCon.setSize(100 * this.dpr, 30 * this.dpr);
        this.sceneclickCon.on(ClickEvent.Tap, this.onOpenHouseHandler, this);
        this.sceneclickCon.x = this.sceneNamebg.x;
        this.sceneCon.add([peoplebg, this.peoplevalue, peopeclickCon, this.sceneNamebg, this.sceneTex, this.sceneclickCon, this.roomSetBtn, this.roomPraiseBtn]);
        this.sceneCon.x = this.width * 0.5 - 10 * this.dpr;
        this.sceneCon.y = -15 * this.dpr;
    }

    public setHeadData(level: op_pkt_def.IPKT_Property, energy: op_pkt_def.IPKT_Property, money: number, diamond: number) {
        if (level)
            this.levelTex.text = level.value + "";
        if (energy) {
            this.powerTex.setText(`${energy.value}/${energy.max}`);
            this.powerPro.setProgress(energy.value, energy.max);
        }
        money = money || 0;
        if (money > 99999) {
            this.moneyvalue.setText((Math.floor(money / 1000) / 10) + "");
            this.moneyvalue.setUintText({ img: true });
        } else {
            this.moneyvalue.setText(money + "");
            this.moneyvalue.setUintTextVisible(false);
        }
        diamond = diamond || 0;
        if (diamond > 99999) {
            this.diamondvalue.setText((Math.floor(diamond / 1000) / 10) + "");
            this.diamondvalue.setUintText({ img: true });
        } else {
            this.diamondvalue.setText(diamond + "");
            this.diamondvalue.setUintTextVisible(false);
        }

        if (this.money !== money || this.diamond !== diamond) {
            this.moveMoneyCon();
        }
        this.money = money;
        this.diamond = diamond;
    }

    public setSceneData(sceneName: string, Praise: number, isPraise: boolean, people: number, roomType: string, isself: boolean = false) {
        this.sceneTex.text = sceneName;
        this.praise = isPraise;
        this.isself = isself;
        this.peoplevalue.setText(people + "");
        if (this.canPraise(roomType)) {
            this.roomSetBtn.visible = isself;
            this.roomPraiseBtn.visible = !isself;
            this.roomPraiseBtn.setCount(Praise);
            this.roomPraiseBtn.setPraise(isPraise);
            if (!isself) {
                this.sceneTex.x = this.sceneNamebg.x - 20 * this.dpr;
            }
        } else {
            this.roomPraiseBtn.visible = false;
            this.roomSetBtn.visible = false;
            this.sceneTex.x = this.sceneNamebg.x;
        }
        this.sceneclickCon.enable = true;
    }

    public setHandler(send: Handler) {
        this.sendHandler = send;
    }

    public getComponent(name: string) {
        if (name === "mainui.head") return this.headCon;
    }

    private onHeadHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["head"]);
    }

    private onEnergyHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["energy"]);
    }

    private onPraiseHandler() {
        if (this.isself) {
            if (this.sendHandler) this.sendHandler.runWith(["party"]);
        } else
            if (this.sendHandler) this.sendHandler.runWith(["praise", !this.praise]);
    }

    private onRechargeHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["recharge"]);
    }
    private onOpenHouseHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["room"]);
    }

    private onOpenOnlineHandler() {
        if (this.sendHandler) this.sendHandler.runWith("online");
    }
    private onTooqingHandler() {
        if (this.sendHandler) this.sendHandler.runWith("tooqing");
    }

    private moveMoneyCon() {
        if (!this.scene) return;
        const from = this.width + 190 * this.dpr;
        const to = this.width * 0.5 - 10 * this.dpr;
        this.moneyCon.x = from;
        this.moneyCon.alpha = 1;
        this.add(this.moneyCon);
        this.clearTween();
        this.moneyTween = this.scene.tweens.add({
            targets: this.moneyCon,
            x: {
                from,
                to
            },
            ease: "Linear",
            duration: 600,
            onComplete: () => {
                this.clearTween();
                this.fadeOutHeadCon();
            },
        });
    }
    private fadeOutHeadCon() {
        if (!this.scene) return;
        this.moneyTween = this.scene.tweens.add({
            targets: this.moneyCon,
            alpha: {
                from: 1,
                to: 0.2
            },
            ease: "Linear",
            duration: 150,
            delay: 3000,
            onComplete: () => {
                this.clearTween();
                this.remove(this.moneyCon);
            },
        });
    }

    private canPraise(roomType: string) {
        if (roomType !== "room" && roomType !== "store") return false;
        return true;
    }

    private clearTween() {
        if (this.moneyTween) {
            this.moneyTween.stop();
            this.moneyTween.remove();
            this.moneyTween = undefined;
        }
    }
}

class RoomSetButton extends ButtonEventDispatcher {
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene, 0, 0);
        this.dpr = dpr;
        this.zoom = zoom;
        this.setSize(width, height);
        const bg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "home_praise_bg" });
        const img = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "home_set" });
        this.add([bg, img]);
        this.enable = true;
    }
}
class RoomPraiseButton extends ButtonEventDispatcher {
    private countTex: Phaser.GameObjects.Text;
    private uintImg: Phaser.GameObjects.Image;
    private textPosx: number;
    private praiseImg: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, dpr: number, zoom: number) {
        super(scene, 0, 0);
        this.dpr = dpr;
        this.zoom = zoom;
        const bg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "home_likes_bg" });
        this.setSize(bg.width, bg.height);
        this.praiseImg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "home_praise" });
        this.praiseImg.x = -this.width * 0.5 + this.praiseImg.width * 0.5 + 5 * dpr;
        this.countTex = this.scene.make.text({ style: UIHelper.whiteStyle(dpr, 11) }).setOrigin(0.5);
        this.textPosx = this.width * 0.5 - 10 * dpr;
        this.countTex.x = this.textPosx;
        this.uintImg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "home_silver_myriad" }).setOrigin(0, 0.5);
        this.add([bg, this.praiseImg, this.countTex, this.uintImg]);
        this.uintImg.visible = false;
        this.enable = true;
    }

    public setCount(count: number) {
        if (count > 9999) {
            this.countTex.text = Math.floor(count / 10000) + "";
            this.uintImg.visible = true;
            const tempWidth = this.uintImg.width + this.countTex.width;
            this.countTex.x = this.textPosx - tempWidth * 0.5 + this.countTex.width * 0.5;
            this.uintImg.x = this.countTex.x + this.countTex.width * 0.5 + this.uintImg.width * 0.5;
        } else {
            this.countTex.text = count + "";
            this.uintImg.visible = false;
            this.countTex.x = this.textPosx;
        }
    }

    setPraise(praise: boolean) {
        this.enable = !praise;
        // this.praiseImg.setFrame(praise ? "home_praise" : "home_praise_1");
    }
}
