import { ClickEvent } from "apowophaserui";
import { UIAtlasName } from "picaRes";
import { Handler, i18n, UIHelper } from "utils";
import { BackgroundScaleButton, ThreeSlicePath } from ".";

export class MoreButtonPanel extends Phaser.GameObjects.Container {
    private blackGraphic: Phaser.GameObjects.Graphics;
    private topbg: ThreeSlicePath;
    private place: BackgroundScaleButton;
    private sell: BackgroundScaleButton;
    private dpr: number;
    private send: Handler;
    private itemdata: any;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr) {
        super(scene);
        this.dpr = dpr;
        this.setSize(width, height);
        this.init();
    }

    public setItemData(data: any, category: number) {
        this.itemdata = data;
        this.setLayoutType(category);
    }
    /**
     *
     * @param type 1 || 5 - 家具 3 - 道具
     */
    public setLayoutType(type: number) {
        this.place.visible = false;
        this.sell.visible = false;
        this.removeListen();
        if (type === 1 || type === 5) {
            this.place.visible = true;
            this.place.y = this.height * 0.5 - this.place.height * 0.5;
            this.topbg.y = this.place.y - this.place.height * 0.5 - this.topbg.height * 0.5;
            this.place.on(ClickEvent.Tap, this.onPlaceHandler, this);
        } else if (type === 3) {
            this.sell.visible = true;
            this.sell.y = this.height * 0.5 - this.sell.height * 0.5;
            this.topbg.y = this.sell.y - this.sell.height * 0.5 - this.topbg.height * 0.5;
            this.sell.on(ClickEvent.Tap, this.onSellHandler, this);
        }
        this.on("pointerdown", this.hide, this);
    }

    public setHandler(send: Handler) {
        this.send = send;
    }

    public show() {
        this.addListen();
        this.visible = true;
    }

    public hide() {
        this.removeListen();
        this.visible = false;
    }

    protected addListen() {
        // this.place.on(ClickEvent.Tap, this.onPlaceHandler, this);
        // this.sell.on(ClickEvent.Tap, this.onSellHandler, this);
        // this.on("pointerdown", this.hide, this);
    }

    protected removeListen() {
        this.place.off(ClickEvent.Tap, this.onPlaceHandler, this);
        this.sell.off(ClickEvent.Tap, this.onSellHandler, this);
        this.off("pointerdown", this.hide, this);
    }
    protected init() {
        this.blackGraphic = this.scene.make.graphics(undefined, false);
        this.blackGraphic.clear();
        this.blackGraphic.fillStyle(0x000000, 0.66);
        this.blackGraphic.fillRect(0, 0, this.width, this.height);
        this.blackGraphic.x = -this.width * 0.5;
        this.blackGraphic.y = -this.height * 0.5;
        this.topbg = new ThreeSlicePath(this.scene, 0, 0, 327 * this.dpr, 10 * this.dpr, UIAtlasName.uicommon, ["bag_more_left", "bag_more_middle", "bag_more_right"]);
        this.place = new BackgroundScaleButton(this.scene, 327 * this.dpr, 53 * this.dpr, UIAtlasName.uicommon, "bag_more_uncheck", "bag_more_select", i18n.t("furni_bag.add"), this.dpr, 1, false);
        this.place.setTextStyle(UIHelper.blackStyle(this.dpr, 20));
        this.sell = new BackgroundScaleButton(this.scene, 327 * this.dpr, 53 * this.dpr, UIAtlasName.uicommon, "bag_more_uncheck", "bag_more_select", i18n.t("common.sold"), this.dpr, 1, false);
        this.sell.setTextStyle(UIHelper.blackStyle(this.dpr, 20));
        this.add([this.blackGraphic, this.topbg, this.place, this.sell]);
        this.setInteractive();
    }

    private onPlaceHandler() {
        if (this.send) this.send.runWith(["place", this.itemdata]);
        this.hide();
    }

    private onSellHandler() {
        if (this.send) this.send.runWith(["sell", this.itemdata]);
        this.hide();
    }

}
