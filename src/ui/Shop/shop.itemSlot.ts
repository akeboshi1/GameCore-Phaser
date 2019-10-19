import { ItemSlot } from "../bag/item.slot";
import { WorldService } from "../../game/world.service";
import { DragDropIcon } from "../bag/dragDropIcon";
import { op_def, op_gameconfig } from "pixelpai_proto";
import { UI } from "../../const/res.const";
import { Url } from "../../utils/resUtil";
import { DynamicImage } from "../components/dynamic.image";
import { ToolTip } from "../tips/toolTip";

export class ShopItemSlot extends ItemSlot {
    private moneyIcon: DynamicImage;
    constructor(scene: Phaser.Scene, world: WorldService, parentCon: Phaser.GameObjects.Container, x: number, y: number, resStr: string, respng: string, resjson: string, resSlot: string, selectRes?: string, subscriptRes?: string) {
        super(scene, world, parentCon, x, y, resStr, respng, resjson, resSlot, selectRes);
    }

    public dataChange(val: any) {
        if (!val) return;
        super.dataChange(val);
        const prices = val.price;
        const priceLen: number = prices.length;
        for (let i: number = 0; i < priceLen; i++) {
            let png: string;
            let key: string;
            if (prices[i].coinType === op_def.CoinType.TU_DING_COIN) {
                key = UI.TuDing18.getName();
                png = UI.TuDing18.getPNG();
            }
            this.makeCoin(prices[i], i * 20 + 30);
        }
    }

    public destroy() {
        if (this.moneyIcon) {
            this.moneyIcon.destroy(true);
            this.moneyIcon = null;
        }
        super.destroy();
    }

    protected makeCoin(price: op_gameconfig.IPrice, y: number) {
        let png: string;
        let key: string;
        if (price.coinType === op_def.CoinType.TU_DING_COIN) {
            key = UI.TuDing18.getName();
            png = UI.TuDing18.getPNG();
        }

        // const moneyIcon = this.mScene.make.image(undefined, false);
        this.moneyIcon = new DynamicImage(this.mScene, 0, 0);
        this.moneyIcon.x = (-this.mWid >> 1) + 15;
        this.moneyIcon.y = y;
        this.toolTipCon.add(this.moneyIcon);

        this.moneyIcon.load(png);

        const priceText = this.mScene.make.text(undefined, false);
        priceText.setFontFamily("Tahoma");
        // priceText.setFontStyle("bold");
        priceText.setFontSize(15);
        priceText.x = -this.mWid / 2 + this.moneyIcon.width + 20;
        priceText.y = y - 9;

        this.toolTipCon.add(priceText);
        priceText.setText(price.price.toString());
    }

    protected onLoadCompleteHandler() {
        this.mWid = 80;
        this.mHei = 88;
        this.itemBG = this.mScene.make.sprite(undefined, false);
        this.itemBG.setTexture(this.mResStr, this.mResSlot);
        this.itemBG.y = -10;
        this.toolTipCon.setSize(this.mWid, this.mHei);
        this.toolTipCon.addAt(this.itemBG, 0);
        this.mIcon = new DragDropIcon(this.mScene, 0, -10);
        this.toolTipCon.addAt(this.mIcon, 1);
        if (this.mSubScriptRes) {
            this.mSubScriptSprite = this.mScene.make.sprite(undefined, false);
            this.mSubScriptSprite.setTexture(this.mResStr, this.mSubScriptRes);
            this.mSubScriptSprite.x = this.mSubScriptSprite.width - this.itemBG.width >> 1;
            this.mSubScriptSprite.y = this.mSubScriptSprite.height - this.itemBG.height >> 1;
            // this.con.addAt(this.mSubScriptSprite, 2);
        }
        if (this.isTipBoo) {
            this.toolTip = new ToolTip(this.mScene, "itemSlotTip", Url.getRes("ui/toolTip/toolTip.json"), Url.getRes("ui/toolTip/toolTip.png"), this.mWorld.uiScale);
        }
        this.toolTipCon.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.itemBG.width, 56), Phaser.Geom.Rectangle.Contains);
        this.toolTipCon.on("pointerover", this.overHandler, this);
        this.toolTipCon.on("pointerout", this.outHandler, this);
        this.toolTipCon.on("pointerdown", this.downHandler, this);
        this.toolTipCon.on("pointerup", this.outHandler, this);
        this.minitialize = true;
        if (this.mData) {
            this.dataChange(this.mData);
        }

        this.mSelectSprite = this.mScene.make.sprite(undefined, false);
        this.createTexture(this.mWid, this.mHei);
    }

    protected overHandler(pointer) {
        super.overHandler(pointer);
        this.mSelectSprite = this.mScene.make.sprite(undefined, false);
        this.mSelectSprite.setTexture("selectBg");
        this.toolTipCon.addAt(this.mSelectSprite, 0);

    }

    protected outHandler(pointer) {
        super.outHandler(pointer);
    }

    private createTexture(wid: number, hei: number) {
        const COLOR_BG = 0xAAA9A9;
        const COLOR_LINE = 0xAAA9A9;
        const bgGraphics: Phaser.GameObjects.Graphics = this.mScene.add.graphics();
        bgGraphics.fillStyle(COLOR_BG, .3);
        bgGraphics.fillRoundedRect(0, 0, wid, hei, 5);
        bgGraphics.generateTexture("selectBg", wid, hei);
        bgGraphics.clear();
    }
}
