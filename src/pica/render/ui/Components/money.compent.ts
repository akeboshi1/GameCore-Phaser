import { Button, ClickEvent, NineSlicePatch } from "apowophaserui";
import { ImageValue } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { Font, Handler, i18n, UIHelper } from "utils";

export class MoneyCompent extends Phaser.GameObjects.Container {
    public money: number;
    public diamond: number;
    private dpr: number;
    private zoom: number;
    private moneyvalue: ImageValue;
    private diamondvalue: ImageValue;
    private moneyAddBtn: Button;
    private send: Handler;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.zoom = zoom;
        this.create();
    }
    public setHandler(send: Handler) {
        this.send = send;
    }
    public setMoneyData(money: number, diamond: number) {
        money = money || 0;
        diamond = diamond || 0;
        if (money > 99999) {
            this.moneyvalue.setText((Math.floor(money / 1000) / 10) + "");
            this.moneyvalue.setUintText({ img: true });
        } else {
            this.moneyvalue.setText(money + "");
            this.moneyvalue.setUintTextVisible(false);
        }
        if (diamond > 99999) {
            this.diamondvalue.setText((Math.floor(diamond / 1000) / 10) + "");
            this.diamondvalue.setUintText({ img: true });
        } else {
            this.diamondvalue.setText(diamond + "");
            this.diamondvalue.setUintTextVisible(false);
        }
        this.money = money;
        this.diamond = diamond;
    }
    protected create() {
        const moneybg = new NineSlicePatch(this.scene, 0, -this.dpr, this.width, this.height, UIAtlasName.uicommon, "home_assets_bg", {
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
        // this.moneyvalue.setUintText({ style: UIHelper.whiteStyle(this.dpr, 15) });
        this.moneyvalue.x = moneybg.x - moneybg.width * 0.5 + 22 * this.dpr;
        this.diamondvalue = new ImageValue(this.scene, 60 * this.dpr, 26 * this.dpr, UIAtlasName.uicommon, "home_diamond", this.dpr, {
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
        this.add([moneybg, moneyline, this.moneyvalue, this.diamondvalue, this.moneyAddBtn]);
    }
    private onRechargeHandler() {
        if (this.send) this.send.run();
    }
}
